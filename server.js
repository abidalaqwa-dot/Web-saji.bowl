/**
 * SAJI (Sajian Healthy Bowl) — Production Security Server
 * DevSecOps Hardened:
 *  - Strict Path Traversal Prevention
 *  - Comprehensive Security Headers (HSTS, CSP, X-Frame-Options, Permissions-Policy)
 *  - Sliding-Window Rate Limiting Engine (429 Too Many Requests)
 *  - Server-Side Route Guard & HttpOnly Session Management
 *  - IDOR (Insecure Direct Object Reference) Prevention Middleware
 *  - Anti-Spam Bot Honeypot & Input Validation API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

// In-memory cache for Brotli/Gzip compressed assets
const compressionCache = new Map();
const compressibleExts = new Set(['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt']);

// --------------------------------------------------------------------------
// 1. CONFIGURATION & ENVIRONMENT
// --------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_MAX_AGE_MS = parseInt(process.env.SESSION_MAX_AGE_MS || '3600000', 10); // 1 hour
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || '';
const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL || '';
const MAX_CACHE_ENTRIES = 100;
const MAX_RATE_LIMIT_KEYS = 5000;

/**
 * Real-Time SRE Alert Notification Dispatcher (Webhook & Audit Log)
 */
function sendAlertNotification(title, message, severity = 'CRITICAL') {
  const safeMsg = String(message || '').replace(/[\x00-\x1F\x7F]/g, ' ').slice(0, 500);
  console.error(`🚨 [SRE ${severity} ALERT] ${title}: ${safeMsg}`);

  const auditPath = path.join(__dirname, 'data', 'audit_logs.json');
  if (fs.existsSync(auditPath)) {
    try {
      const logs = JSON.parse(fs.readFileSync(auditPath, 'utf8') || '[]');
      logs.push({
        id: `ALERT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: String(title || '').slice(0, 64),
        severity,
        details: safeMsg
      });
      if (logs.length > 500) logs.splice(0, logs.length - 500);
      fs.writeFileSync(auditPath, JSON.stringify(logs, null, 2), 'utf8');
    } catch (e) {}
  }
}

process.on('uncaughtException', err => {
  sendAlertNotification('UNCAUGHT_EXCEPTION', err.stack || err.message, 'CRITICAL');
});

process.on('unhandledRejection', reason => {
  sendAlertNotification('UNHANDLED_REJECTION', String(reason && (reason.stack || reason.message) || reason), 'HIGH');
});

// --------------------------------------------------------------------------
// 2. DEVSECOPS SECURITY HEADERS
// --------------------------------------------------------------------------
const SCRIPT_CSP_HASHES = [
  "'sha256-zKTIKk0+18RqnZMMXjiweI9NBWMINlcbj3i1//o6ChI='",
  "'sha256-ssjIerw8VGVWWVfTreFrkr5RC2niDmRSkKvCVs7oU6c='",
  "'sha256-GKB6IdGLOxjnJmnKXiJReC/1vab0tnQ6yvMXJcsdqiA='"
].join(' ');
const BASE_CSP = `default-src 'self'; script-src 'self' ${SCRIPT_CSP_HASHES} https://browser.sentry-cdn.com https://challenges.cloudflare.com https://www.google.com/recaptcha/ https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.ingest.sentry.io; frame-src https://challenges.cloudflare.com https://www.google.com/recaptcha/; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me;`;

const securityHeaders = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': BASE_CSP,
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

function getSecurityHeaders(req) {
  const isHttps = Boolean(req?.socket?.encrypted || req?.headers?.['x-forwarded-proto'] === 'https');
  if (!isHttps) return securityHeaders;
  return { ...securityHeaders, 'Content-Security-Policy': `${BASE_CSP} upgrade-insecure-requests;` };
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

// --------------------------------------------------------------------------
// 3. IN-MEMORY STATE: RATE LIMITER & SESSION STORE
// --------------------------------------------------------------------------
// rateLimits Map: key => [timestamps]
const rateLimits = new Map();

// Active Sessions Map: token => { userId, role, createdAt, expiresAt }
const activeSessions = new Map();

// Demo Orders Database to verify IDOR Prevention
const ordersDatabase = {
  'ORD-USER-A-001': {
    id: 'ORD-USER-A-001',
    userId: 'user_admin',
    items: ['Sajian Sumba (1x)'],
    totalPrice: 42000,
    status: 'Diproses'
  },
  'ORD-USER-B-9988': {
    id: 'ORD-USER-B-9988',
    userId: 'user_external_customer_b',
    items: ['Sajian Bogor (2x)'],
    totalPrice: 76000,
    status: 'Terkirim'
  }
};

/**
 * Clean up expired rate limit entries & sessions periodically
 */
setInterval(() => {
  const now = Date.now();
  // Clear expired rate limits
  for (const [key, timestamps] of rateLimits.entries()) {
    const valid = timestamps.filter(t => now - t < 15 * 60 * 1000);
    if (valid.length === 0) {
      rateLimits.delete(key);
    } else {
      rateLimits.set(key, valid);
    }
  }
  // Clear expired sessions
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(token);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Sliding Window Rate Limiter
 */
function checkRateLimit(ip, bucket, maxRequests, windowMs) {
  if (rateLimits.size > MAX_RATE_LIMIT_KEYS) rateLimits.clear();
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const history = rateLimits.get(key) || [];
  const validHistory = history.filter(ts => now - ts < windowMs);

  if (validHistory.length >= maxRequests) {
    const oldest = validHistory[0];
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
    rateLimits.set(key, validHistory);
    return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  validHistory.push(now);
  rateLimits.set(key, validHistory);
  return { allowed: true, remaining: maxRequests - validHistory.length, retryAfterSec: 0 };
}

/**
 * Extract Client IP safely (honors proxy headers only behind trusted proxy/loopback)
 */
function getClientIp(req) {
  const remoteAddr = String(req.socket?.remoteAddress || '127.0.0.1');
  const isTrustedProxy = process.env.TRUST_PROXY === 'true' || process.env.VERCEL === '1' ||
    remoteAddr === '127.0.0.1' || remoteAddr === '::1' || remoteAddr === '::ffff:127.0.0.1';
  if (isTrustedProxy) {
    const cfIp = req.headers['cf-connecting-ip'];
    if (cfIp) return String(cfIp).trim().slice(0, 64);
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return String(forwarded).split(',')[0].trim().slice(0, 64);
  }
  return remoteAddr.slice(0, 64);
}

/**
 * Parse Cookies safely (resilient to malformed percent-encoding)
 */
function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  String(cookieHeader).split(';').forEach(cookie => {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx <= 0) return;
    const name = cookie.slice(0, eqIdx).trim();
    const rawVal = cookie.slice(eqIdx + 1).trim();
    if (!name) return;
    try {
      list[name] = decodeURIComponent(rawVal);
    } catch {
      list[name] = rawVal;
    }
  });
  return list;
}

/**
 * Timing-Safe String Comparison to prevent side-channel timing attacks
 */
function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function signSessionToken(rawToken) {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(rawToken).digest('hex');
  return `${rawToken}.${hmac}`;
}

function verifyAndGetSession(req) {
  const cookies = parseCookies(req);
  const signed = String(cookies.saji_session || '');
  const parts = signed.split('.');
  if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[0]) || !/^[a-f0-9]{64}$/.test(parts[1])) {
    return null;
  }
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(parts[0]).digest('hex');
  if (!timingSafeEqualStr(parts[1], expectedSig)) return null;
  const session = activeSessions.get(parts[0]);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(parts[0]);
    return null;
  }
  return { rawToken: parts[0], session };
}

function isCrossSitePost(req) {
  if (req.headers['sec-fetch-site'] === 'cross-site') return true;
  const origin = req.headers.origin;
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const reqHost = String(req.headers.host || '').toLowerCase();
    if (reqHost && originHost === reqHost) return false;
    return !/^(localhost|127\.0\.0\.1|sajibowl\.id|www\.sajibowl\.id)(:\d+)?$/i.test(originHost);
  } catch {
    return true;
  }
}

function sanitizeJsonText(rawText, maxBytes) {
  if (Buffer.byteLength(rawText, 'utf8') > maxBytes) {
    throw new Error('PAYLOAD_TOO_LARGE');
  }
  if (!rawText) return {};
  const parsed = JSON.parse(rawText, (k, v) => (
    k === '__proto__' || k === 'constructor' || k === 'prototype' ? undefined : v
  ));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('INVALID_JSON');
  }
  return parsed;
}

/**
 * Parse JSON Request Body with byte length limit, Content-Type check & prototype pollution guard
 */
function parseJsonBody(req, maxBytes = 32 * 1024) {
  return new Promise((resolve, reject) => {
    const contentType = String(req.headers['content-type'] || '');
    if (contentType && !contentType.toLowerCase().includes('application/json')) {
      return reject(new Error('UNSUPPORTED_MEDIA'));
    }
    const bodyDesc = Object.getOwnPropertyDescriptor(req, 'body');
    if (bodyDesc && 'value' in bodyDesc && bodyDesc.value !== undefined) {
      try {
        const raw = typeof bodyDesc.value === 'string' ? bodyDesc.value : JSON.stringify(bodyDesc.value);
        return resolve(sanitizeJsonText(raw, maxBytes));
      } catch (err) {
        return reject(err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE' ? err : new Error('INVALID_JSON'));
      }
    }
    let body = '';
    let bytes = 0;
    let settled = false;
    const fail = (code) => {
      if (settled) return;
      settled = true;
      reject(new Error(code));
    };

    req.on('data', chunk => {
      if (settled) return;
      bytes += chunk.length;
      if (bytes > maxBytes) {
        fail('PAYLOAD_TOO_LARGE');
        req.destroy();
      } else {
        body += chunk;
      }
    });
    req.on('end', () => {
      if (settled) return;
      settled = true;
      try {
        resolve(sanitizeJsonText(body, maxBytes));
      } catch (err) {
        reject(err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE' ? err : new Error('INVALID_JSON'));
      }
    });
    req.on('error', () => fail('REQUEST_ERROR'));
  });
}

// --------------------------------------------------------------------------
// 4. MAIN HTTP SERVER & ROUTING
// --------------------------------------------------------------------------
const TRUSTED_REDIRECT_HOSTS = /^(localhost|127\.0\.0\.1|sajibowl\.id|www\.sajibowl\.id|[\w-]+\.vercel\.app)(:\d{1,5})?$/i;

function sanitizeRedirectHost(hostHeader) {
  const clean = String(hostHeader || '').replace(/[\r\n\s]/g, '');
  return TRUSTED_REDIRECT_HOSTS.test(clean) ? clean : 'sajibowl.id';
}

function sendBodyErrorStatus(res, err, secHeaders) {
  const codeMap = {
    PAYLOAD_TOO_LARGE: [413, 'Ukuran payload melebihi batas yang diizinkan.'],
    UNSUPPORTED_MEDIA: [415, 'Content-Type harus application/json.']
  };
  const [status, msg] = codeMap[err?.message] || [400, 'Format permintaan tidak valid.'];
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
  return res.end(JSON.stringify({ error: msg }));
}

// Explicit path hints so @vercel/nft bundles root HTML documents alongside server.js
const BUNDLED_HTML_PAGES = {
  '/index.html': path.join(__dirname, 'index.html'),
  '/kebijakan-privasi.html': path.join(__dirname, 'kebijakan-privasi.html'),
  '/404.html': path.join(__dirname, '404.html'),
  '/admin-login.html': path.join(__dirname, 'admin-login.html'),
  '/admin-dashboard.html': path.join(__dirname, 'admin-dashboard.html')
};

async function requestHandler(req, res) {
  const secHeaders = getSecurityHeaders(req);
  try {
    const rawUrl = String(req.url || '/');
    if (rawUrl.startsWith('//') || /^https?:\/\//i.test(rawUrl)) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
      return res.end('400 Bad Request');
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl, 'http://localhost');
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
      return res.end('400 Bad Request');
    }
    const rawPathname = parsedUrl.pathname || '/';
    const clientIp = getClientIp(req);

    // Decode & normalize path cleanly BEFORE security gates (blocks /%2eenv, /./data/*, null byte)
    let decodedPathname;
    try {
      decodedPathname = decodeURIComponent(rawPathname);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
      return res.end('400 Bad Request');
    }
    if (decodedPathname.includes('\0') || decodedPathname.includes('\\')) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
      return res.end('400 Bad Request');
    }
    let pathname = path.posix.normalize('/' + decodedPathname);

    // 1. HTTPS Enforcement: Automatic 301 Permanent Redirect (Host-Injection Hardened)
    if (req.headers['x-forwarded-proto'] === 'http') {
      const safeHost = sanitizeRedirectHost(req.headers.host);
      const safePath = (parsedUrl.pathname || '/') + (parsedUrl.search || '');
      res.writeHead(301, {
        'Location': `https://${safeHost}${safePath}`,
        ...secHeaders
      });
      return res.end();
    }

    // 2. Block Staging / Dev Routes in Production
    if (NODE_ENV === 'production') {
      const isStagingRoute = ['/test', '/dev', '/playground', '/debug', '/staging'].some(prefix =>
        pathname === prefix || pathname.startsWith(prefix + '/')
      );
      if (isStagingRoute) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
        return res.end('404 Not Found');
      }
    }

    // 3. Block Sensitive Files, Customer PII Data & Server Internals
    const isSensitiveFile = /(^|\/)\.|^\/(data|backups|scripts|node_modules|dist|logs)(\/|$)|^\/(server\.js|package(-lock)?\.json|vercel\.json|_headers|admin-dashboard\.html|test-[a-z0-9-]+\.js)$|\.(enc|map|md|bak|log|sql|yml|yaml|sh|pem|key|crt|env)$|audit_logs/i.test(pathname);
    if (isSensitiveFile) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
      return res.end('403 Forbidden: Access to sensitive resource is prohibited.');
    }

    // General Rate Limit per IP (120 req / min)
    const generalLimit = checkRateLimit(clientIp, 'general', 120, 60 * 1000);
    if (!generalLimit.allowed) {
      res.writeHead(429, {
        'Content-Type': 'application/json; charset=utf-8',
        'Retry-After': String(generalLimit.retryAfterSec),
        ...secHeaders
      });
      return res.end(JSON.stringify({
        error: 'Terlalu banyak permintaan (Rate Limit terlampaui). Coba lagi beberapa detik.',
        retryAfter: generalLimit.retryAfterSec
      }));
    }

    if (req.method === 'POST' && isCrossSitePost(req)) {
      res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
      return res.end(JSON.stringify({ error: 'Permintaan lintas asal ditolak.' }));
    }

    // ------------------------------------------------------------------------
    // ROUTE: API AUTHENTICATION (POST /api/auth/login)
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
        return res.end(JSON.stringify({ error: 'Layanan autentikasi admin belum dikonfigurasi di server.' }));
      }

      const authLimit = checkRateLimit(clientIp, 'auth_fail', 5, 15 * 60 * 1000);
      if (!authLimit.allowed) {
        res.writeHead(429, {
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': String(authLimit.retryAfterSec),
          ...secHeaders
        });
        return res.end(JSON.stringify({
          error: `Terlalu banyak percobaan masuk gagal. Coba lagi dalam ${Math.ceil(authLimit.retryAfterSec / 60)} menit.`,
          retryAfter: authLimit.retryAfterSec
        }));
      }

      try {
        const body = await parseJsonBody(req);
        if (String(body.admin_hp || body.honeypot || '').trim().length > 0) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
          return res.end(JSON.stringify({ error: 'Permintaan tidak valid.' }));
        }
        const username = typeof body.username === 'string' ? body.username.slice(0, 80) : '';
        const password = typeof body.password === 'string' ? body.password.slice(0, 128) : '';

        const isUserValid = username.length > 0 && timingSafeEqualStr(username, ADMIN_USERNAME);
        const isPassValid = password.length > 0 && timingSafeEqualStr(password, ADMIN_PASSWORD);

        if (isUserValid && isPassValid) {
          const rawToken = crypto.randomBytes(32).toString('hex');
          const signedCookieToken = signSessionToken(rawToken);
          activeSessions.set(rawToken, {
            userId: 'user_admin',
            username: ADMIN_USERNAME,
            role: 'admin',
            createdAt: Date.now(),
            expiresAt: Date.now() + SESSION_MAX_AGE_MS
          });

          const cookieFlags = [
            `saji_session=${signedCookieToken}`,
            'Path=/',
            'HttpOnly',
            'SameSite=Strict',
            `Max-Age=${Math.floor(SESSION_MAX_AGE_MS / 1000)}`
          ];
          if (NODE_ENV === 'production' && (req.headers['x-forwarded-proto'] === 'https' || req.socket?.encrypted)) {
            cookieFlags.push('Secure');
          }

          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Set-Cookie': cookieFlags.join('; '),
            ...secHeaders
          });
          return res.end(JSON.stringify({ success: true, redirect: '/admin' }));
        }
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
        return res.end(JSON.stringify({ error: 'Username atau kata sandi tidak valid.' }));
      } catch (err) {
        return sendBodyErrorStatus(res, err, secHeaders);
      }
    }

    // ------------------------------------------------------------------------
    // ROUTE: API LOGOUT (POST /api/auth/logout)
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const verified = verifyAndGetSession(req);
      if (verified) activeSessions.delete(verified.rawToken);

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': 'saji_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        ...secHeaders
      });
      return res.end(JSON.stringify({ success: true }));
    }

    // ------------------------------------------------------------------------
    // ROUTE: FORM VALIDATION & ANTI-SPAM API (POST /api/order/validate)
    // ------------------------------------------------------------------------
    if (pathname === '/api/order/validate' && req.method === 'POST') {
      const formLimit = checkRateLimit(clientIp, 'form_submit', 5, 10 * 60 * 1000);
      if (!formLimit.allowed) {
        res.writeHead(429, {
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': String(formLimit.retryAfterSec),
          ...secHeaders
        });
        return res.end(JSON.stringify({
          error: `Terlalu banyak pengiriman form. Silakan tunggu ${Math.ceil(formLimit.retryAfterSec / 60)} menit sebelum mencoba lagi.`,
          retryAfter: formLimit.retryAfterSec
        }));
      }

      try {
        const body = await parseJsonBody(req);
        const hpVal = body.hp_field ?? body.honeypot ?? body.ship_hp_val ?? '';
        if (String(hpVal).trim().length > 0) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
          return res.end(JSON.stringify({ error: 'Spam/bot submission rejected.' }));
        }

        const rawName = body.customerName ?? body.name;
        let sanitizedName = '';
        if (rawName !== undefined) {
          sanitizedName = String(rawName).replace(/[\x00-\x1F\x7F<>]/g, '').trim().slice(0, 80);
          if (sanitizedName.length < 2 || !/[A-Za-z\u00C0-\u024F]/.test(sanitizedName)) {
            res.writeHead(422, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
            return res.end(JSON.stringify({ error: 'Nama penerima minimal 2 huruf yang valid.' }));
          }
        }

        const rawPhone = body.phone ?? body.customerPhone ?? '';
        const cleanPhone = String(rawPhone).replace(/[\s\-().]/g, '').trim();
        const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/;
        if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
          res.writeHead(422, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
          return res.end(JSON.stringify({ error: 'Format nomor WhatsApp wajib diisi dan valid (contoh: 0812xxxxxxxx).' }));
        }

        const rawEmail = body.customerEmail ?? body.email;
        if (rawEmail !== undefined && String(rawEmail).trim() !== '') {
          const email = String(rawEmail).trim();
          if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            res.writeHead(422, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
            return res.end(JSON.stringify({ error: 'Format alamat email tidak valid.' }));
          }
        }

        const rawNotes = body.notes ?? body.orderNotes ?? '';
        const sanitizedNotes = String(rawNotes).replace(/[\x00-\x1F\x7F<>]/g, '').trim().slice(0, 120);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
        return res.end(JSON.stringify({
          success: true,
          message: 'Validasi form berhasil.',
          sanitizedName,
          sanitizedNotes
        }));
      } catch (err) {
        return sendBodyErrorStatus(res, err, secHeaders);
      }
    }

    // ------------------------------------------------------------------------
    // ROUTE: IDOR PREVENTION DEMO API (GET /api/orders/:orderId)
    // ------------------------------------------------------------------------
    if (pathname.startsWith('/api/orders/')) {
      const orderId = pathname.slice('/api/orders/'.length).trim();
      if (!/^[A-Za-z0-9_-]{3,40}$/.test(orderId)) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
        return res.end(JSON.stringify({ error: 'Format ID pesanan tidak valid.' }));
      }

      const verified = verifyAndGetSession(req);
      if (!verified) {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
        return res.end(JSON.stringify({ error: 'Sesi tidak valid atau telah kedaluwarsa.' }));
      }
      const { session } = verified;

      const order = Object.hasOwn(ordersDatabase, orderId) ? ordersDatabase[orderId] : null;
      if (!order) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
        return res.end(JSON.stringify({ error: 'Pesanan tidak ditemukan.' }));
      }

      if (session.role !== 'admin' && order.userId !== session.userId) {
        res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
        return res.end(JSON.stringify({
          error: 'IDOR_PREVENTION_TRIGGERED: Akses ditolak! Anda tidak memiliki izin untuk melihat pesanan pengguna lain.',
          requestedOrderId: orderId
        }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', ...secHeaders });
      return res.end(JSON.stringify({
        success: true,
        order,
        verifiedOwner: session.userId
      }));
    }

    // ------------------------------------------------------------------------
    // ROUTE GUARD: /admin, /admin/dashboard, /dashboard
    // ------------------------------------------------------------------------
    if (pathname === '/admin' || pathname === '/admin/' || pathname === '/dashboard' || pathname === '/dashboard/') {
      const verified = verifyAndGetSession(req);
      if (!verified) {
        res.writeHead(302, { 'Location': '/admin/login?error=unauthorized', ...secHeaders });
        return res.end();
      }

      const dashPath = path.join(__dirname, 'admin-dashboard.html');
      fs.readFile(dashPath, (err, content) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
          return res.end('Admin dashboard render error.');
        }
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...secHeaders
        });
        res.end(content);
      });
      return;
    }

    if (pathname === '/admin-login.html') {
      res.writeHead(302, { 'Location': '/admin/login', ...secHeaders });
      return res.end();
    }

    // ROUTE: /admin/login
    if (pathname === '/admin/login' || pathname === '/admin/login/') {
      const loginPath = path.join(__dirname, 'admin-login.html');
      fs.readFile(loginPath, (err, content) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
          return res.end('Login template error.');
        }
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...secHeaders
        });
        res.end(content);
      });
      return;
    }

    // ------------------------------------------------------------------------
    // ROUTE: OFFICIAL WHATSAPP BACKEND REDIRECT (GET /whatsapp, /wa, /order/whatsapp)
    // ------------------------------------------------------------------------
    if (pathname === '/whatsapp' || pathname === '/wa' || pathname === '/order/whatsapp' || pathname === '/api/whatsapp') {
      const rawText = String(parsedUrl.searchParams.get('text') || 'Halo SAJI (@saji.bowl)! Saya ingin memesan Sajian Healthy Bowl')
        .replace(/[\x00-\x08\x0B-\x1F\x7F<>]/g, '')
        .slice(0, 1500);
      const waRedirectUrl = `https://wa.me/62811423799?text=${encodeURIComponent(rawText)}`;
      res.writeHead(302, {
        'Location': waRedirectUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...secHeaders
      });
      return res.end();
    }

    // ROUTE: BACKEND NAVIGATION DIRECT ROUTING
    const navRedirects = {
      '/home': '/#hero',
      '/about': '/#about',
      '/menu': '/#catalog',
      '/catalog': '/#catalog',
      '/reviews': '/#reviews',
      '/contact': '/#contact',
      '/contacts': '/#contact'
    };
    if (Object.hasOwn(navRedirects, pathname)) {
      res.writeHead(302, { 'Location': navRedirects[pathname], ...secHeaders });
      return res.end();
    }

    if (pathname === '/kebijakan-privasi' || pathname === '/kebijakan-privasi/') {
      pathname = '/kebijakan-privasi.html';
    }

    // ------------------------------------------------------------------------
    // STATIC FILE SERVING WITH STRICT PATH & SYMLINK TRAVERSAL MITIGATION
    // ------------------------------------------------------------------------
    if (pathname === '/') pathname = '/index.html';

    const rootReal = fs.realpathSync(__dirname);
    const normalizedPath = path.resolve(rootReal, '.' + pathname);
    const relPath = path.relative(rootReal, normalizedPath);
    if (!relPath || relPath.startsWith('..') || path.isAbsolute(relPath)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
      return res.end('403 Forbidden: Path traversal attempt detected.');
    }

    fs.stat(normalizedPath, (errStat, stats) => {
      if (errStat || !stats.isFile()) {
        const notFoundPath = path.join(rootReal, '404.html');
        return fs.readFile(notFoundPath, (err404, content404) => {
          res.writeHead(404, { 'Content-Type': err404 ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8', ...secHeaders });
          res.end(err404 ? '404 Not Found' : content404);
        });
      }

      fs.realpath(normalizedPath, (errReal, realFile) => {
        if (errReal || (!realFile.startsWith(rootReal + path.sep))) {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
          return res.end('403 Forbidden: Path traversal attempt detected.');
        }

        fs.readFile(realFile, (err, content) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
            return res.end('Internal Server Error');
          }

          const ext = path.extname(realFile).toLowerCase();
          const contentType = mimeTypes[ext] || 'application/octet-stream';
          const headers = { ...secHeaders, 'Content-Type': contentType };
          if (realFile.startsWith(path.join(rootReal, 'assets') + path.sep)) {
            headers['Cache-Control'] = 'public, max-age=31536000, immutable';
          } else if (ext === '.html' || ext === '.css' || ext === '.js') {
            headers['Cache-Control'] = 'no-cache, must-revalidate';
          }

          if (compressibleExts.has(ext)) {
            headers['Vary'] = 'Accept-Encoding';
            const acceptEncoding = String(req.headers['accept-encoding'] || '');
            const algo = acceptEncoding.includes('br') ? 'br' : acceptEncoding.includes('gzip') ? 'gzip' : '';
            if (algo) {
              const cacheKey = `${realFile}:${stats.mtimeMs}:${algo}`;
              const cached = compressionCache.get(cacheKey);
              if (cached) {
                headers['Content-Encoding'] = algo;
                res.writeHead(200, headers);
                return res.end(cached);
              }
              const compressor = algo === 'br' ? zlib.brotliCompress : zlib.gzip;
              return compressor(content, (compErr, compressed) => {
                if (!compErr && compressed) {
                  if (compressionCache.size >= MAX_CACHE_ENTRIES) compressionCache.clear();
                  compressionCache.set(cacheKey, compressed);
                  headers['Content-Encoding'] = algo;
                  res.writeHead(200, headers);
                  res.end(compressed);
                } else {
                  res.writeHead(200, headers);
                  res.end(content);
                }
              });
            }
          }

          res.writeHead(200, headers);
          res.end(content);
        });
      });
    });
  } catch (err) {
    sendAlertNotification('REQUEST_HANDLER_ERROR', err.message, 'HIGH');
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...secHeaders });
      res.end('Internal Server Error');
    }
  }
}

const server = http.createServer(requestHandler);

function startServer(port) {
  server.removeAllListeners('error');
  server.removeAllListeners('listening');

  server.once('listening', () => {
    console.log(`\n==================================================`);
    console.log(`🥗 SAJI — Sajian Healthy Bowl (Hardened DevSecOps Engine)`);
    console.log(`Local Server: http://localhost:${port}/`);
    console.log(`Admin Portal: http://localhost:${port}/admin`);
    console.log(`Privacy Page: http://localhost:${port}/kebijakan-privasi.html`);
    console.log(`==================================================\n`);
  });

  server.once('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} sedang digunakan, mencoba port ${port + 1}...`);
      setTimeout(() => startServer(port + 1), 200);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port);
}

if (require.main === module) {
  startServer(PORT);
}

/**
 * Vercel Serverless handler: invokes requestHandler and resolves only after the HTTP response finishes.
 */
function vercelHandler(req, res) {
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      resolve();
    };
    if (typeof res.once === 'function') {
      res.once('finish', done);
      res.once('close', done);
    }
    Promise.resolve(requestHandler(req, res)).catch((err) => {
      sendAlertNotification('REQUEST_HANDLER_ERROR', err?.message || String(err), 'HIGH');
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...getSecurityHeaders(req) });
        res.end('Internal Server Error');
      }
      done();
    });
  });
}

vercelHandler.server = server;
vercelHandler.bundledPages = BUNDLED_HTML_PAGES;
vercelHandler.listeners = (...args) => server.listeners(...args);
vercelHandler.on = (...args) => server.on(...args);
vercelHandler.once = (...args) => server.once(...args);
vercelHandler.emit = (...args) => server.emit(...args);
vercelHandler.listen = (...args) => server.listen(...args);
vercelHandler.close = (...args) => server.close(...args);

module.exports = vercelHandler;
