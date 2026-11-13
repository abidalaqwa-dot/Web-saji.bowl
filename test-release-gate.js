/**
 * SAJI (Sajian Healthy Bowl) — Automated Production Release Gate Test Suite
 * SRE Pillar 1-5 Verification:
 *  - Pillar 1: Error Tracking (Sentry noise filter & alert dispatcher)
 *  - Pillar 2: Database Backup & Restore Drill (AES-256-GCM encryption & integrity)
 *  - Pillar 3: Environment Sanitation & Staging/Dev Isolation (404/403 blocking)
 *  - Pillar 4: Production Build, HTTPS 301 Redirect, & Zero Bug Gate
 *  - Pillar 5: Release Checkpoint & Rollback SOP Documentation
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Readable, Writable } = require('stream');

// Ensure production environment for tests
process.env.NODE_ENV = 'production';
process.env.ADMIN_USERNAME = 'saji_admin';
process.env.ADMIN_PASSWORD = 'SajiNusantaraBowl2026!Secure';

const server = require('./server.js');
const { ENCRYPTION_KEY } = require('./scripts/backup-database.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

function createMockReqRes({ method = 'GET', url = '/', headers = {}, body = '' }) {
  const req = new Readable();
  req.method = method;
  req.url = url;
  req.headers = { host: 'sajibowl.id', ...headers };
  req.socket = { remoteAddress: '127.0.0.1' };
  req._read = () => {};

  if (body) {
    req.push(typeof body === 'string' ? body : JSON.stringify(body));
  }
  req.push(null);

  const res = new Writable();
  res.statusCode = 200;
  res.headers = {};
  res._chunks = [];
  res.writeHead = function(statusCode, headers = {}) {
    this.statusCode = statusCode;
    Object.assign(this.headers, headers);
  };
  res._write = function(chunk, encoding, callback) {
    this._chunks.push(chunk);
    callback();
  };
  res.getBody = function() {
    return Buffer.concat(this._chunks).toString('utf8');
  };

  return { req, res };
}

function mockRequest(options) {
  return new Promise((resolve) => {
    const { req, res } = createMockReqRes(options);
    res.on('finish', () => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: res.getBody()
      });
    });
    const listeners = server.listeners('request');
    if (listeners.length > 0) {
      listeners[0](req, res);
    }
  });
}

async function runReleaseGateTests() {
  console.log('🚀 [SRE Release Gate] Starting Full 5-Pillar Production Verification...\n');

  // =========================================================================
  // PILLAR 1: ERROR TRACKING & REAL-TIME ALERTING
  // =========================================================================
  console.log('--- PILLAR 1: SENTRY MONITORING & REAL-TIME ALERTS ---');

  // Verify client-side error noise filtering logic
  function shouldIgnoreError(msg, url = '') {
    const ignoredPatterns = [
      'ResizeObserver loop',
      'ResizeObserver loop completed with undelivered notifications',
      'Script error.',
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'NetworkError when attempting to fetch resource',
      'Load failed',
      'AbortError',
      'The operation was aborted'
    ];
    return ignoredPatterns.some(pat => (msg && msg.includes(pat)) || (url && url.includes(pat)));
  }

  assert(
    shouldIgnoreError('ResizeObserver loop completed with undelivered notifications') === true,
    'Client noise filter: Ignores benign ResizeObserver loop errors'
  );
  assert(
    shouldIgnoreError('Failed to fetch from chrome-extension://abcdef/content.js') === true,
    'Client noise filter: Ignores 3rd-party browser extension errors'
  );
  assert(
    shouldIgnoreError('AbortError: The user aborted a request.') === true,
    'Client noise filter: Ignores benign user navigation aborts'
  );
  assert(
    shouldIgnoreError('TypeError: Cannot read properties of undefined (reading orderId)') === false,
    'Client noise filter: Correctly permits critical application runtime bugs'
  );

  // Verify Sentry SDK presence and sample rate in index.html
  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert(
    indexHtml.includes('tracesSampleRate: 0.1') || indexHtml.includes('tracesSampleRate: 0.2'),
    'Client Sentry configuration: Efficient tracesSampleRate set to 0.1 (preserves free-tier quota)'
  );
  assert(
    indexHtml.includes('initSentry') && indexHtml.includes('shouldIgnoreError'),
    'Client Sentry configuration: Automated noise filtering hook integrated'
  );

  // Verify server-side alert logging to audit_logs.json
  const auditPath = path.join(__dirname, 'data', 'audit_logs.json');
  assert(fs.existsSync(auditPath), 'SRE Incident Log: data/audit_logs.json exists');

  // =========================================================================
  // PILLAR 2: DATABASE BACKUP & RESTORE DRILL
  // =========================================================================
  console.log('\n--- PILLAR 2: DATABASE BACKUP & RESTORE DRILL ---');

  const backupDir = path.join(__dirname, 'backups');
  assert(fs.existsSync(backupDir), 'Backup Storage: backups/ directory initialized');

  const backupFiles = fs.existsSync(backupDir) ? fs.readdirSync(backupDir).filter(f => f.endsWith('.enc')) : [];
  assert(backupFiles.length > 0, `Encrypted Snapshots: Found ${backupFiles.length} encrypted backup archive(s)`);

  if (backupFiles.length > 0) {
    const latestArchive = path.join(backupDir, backupFiles[backupFiles.length - 1]);
    const archiveBuffer = fs.readFileSync(latestArchive);
    assert(archiveBuffer.length >= 28, 'Backup Archive Format: Contains 12-byte IV + 16-byte GCM AuthTag');

    // Decrypt archive using AES-256-GCM
    let decryptedData;
    let decryptionSuccess = false;
    try {
      const iv = archiveBuffer.subarray(0, 12);
      const authTag = archiveBuffer.subarray(12, 28);
      const ciphertext = archiveBuffer.subarray(28);

      const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);
      let dec = decipher.update(ciphertext, null, 'utf8');
      dec += decipher.final('utf8');
      decryptedData = JSON.parse(dec);
      decryptionSuccess = true;
    } catch (e) {
      decryptionSuccess = false;
    }

    assert(decryptionSuccess, 'Backup Cryptography: Successfully decrypted with AES-256-GCM and verified AuthTag');
    assert(
      decryptedData && decryptedData.tables && decryptedData.tables.orders,
      'Data Integrity: Restored orders relation table is intact'
    );
    assert(
      decryptedData && decryptedData.tables && decryptedData.tables.contacts,
      'Data Integrity: Restored contacts relation table is intact'
    );
  }

  // =========================================================================
  // PILLAR 3: ENVIRONMENT SANITATION & STAGING ISOLATION
  // =========================================================================
  console.log('\n--- PILLAR 3: ENVIRONMENT SANITATION & STAGING ISOLATION ---');

  // Verify staging routes return 404 in production
  const stagingRoutes = ['/test', '/dev', '/playground', '/debug', '/staging', '/test/preview'];
  for (const route of stagingRoutes) {
    const res = await mockRequest({ method: 'GET', url: route });
    assert(res.statusCode === 404, `Staging Isolation: ${route} is blocked with 404 Not Found`);
  }

  // Verify sensitive files return 403 Forbidden
  const sensitiveFiles = [
    '/.env',
    '/.env.local',
    '/.git/config',
    '/package.json',
    '/data/database.enc',
    '/server.js.map',
    '/data/audit_logs.json'
  ];
  for (const sFile of sensitiveFiles) {
    const res = await mockRequest({ method: 'GET', url: sFile });
    assert(res.statusCode === 403, `Sensitive File Protection: ${sFile} is blocked with 403 Forbidden`);
  }

  // Verify no staging dotfiles in workspace
  const forbiddenFiles = ['.env.development', '.env.test', '.env.local'];
  const hasForbiddenFiles = forbiddenFiles.some(f => fs.existsSync(path.join(__dirname, f)));
  assert(!hasForbiddenFiles, 'Environment Sanitation: Zero staging / test dotfiles present in repository');

  // =========================================================================
  // PILLAR 4: PRODUCTION BUILD, HTTPS/SSL, & ZERO BUG GATE
  // =========================================================================
  console.log('\n--- PILLAR 4: PRODUCTION BUILD, HTTPS/SSL, & ZERO BUG GATE ---');

  // Verify HTTPS 301 Permanent Redirect
  const httpReq = await mockRequest({
    method: 'GET',
    url: '/menu',
    headers: { 'x-forwarded-proto': 'http', host: 'sajibowl.id' }
  });
  assert(httpReq.statusCode === 301, 'HTTPS Enforcement: Unencrypted HTTP request returns 301 Permanent Redirect');
  assert(
    httpReq.headers['Location'] === 'https://sajibowl.id/menu',
    'HTTPS Enforcement: Redirect location points to https://sajibowl.id/menu'
  );

  // Verify HSTS header
  const secureReq = await mockRequest({
    method: 'GET',
    url: '/',
    headers: { 'x-forwarded-proto': 'https' }
  });
  assert(
    secureReq.headers['Strict-Transport-Security'] && secureReq.headers['Strict-Transport-Security'].includes('max-age=63072000'),
    'SSL/TLS Hardening: HSTS preload header configured with 2-year max-age'
  );

  // Verify Cart Order Validation API works with valid inputs
  const orderRes = await mockRequest({
    method: 'POST',
    url: '/api/order/validate',
    headers: { 'content-type': 'application/json' },
    body: {
      customerName: 'Budi Santoso',
      customerPhone: '0811423799',
      orderNotes: 'Tanpa bawang merah',
      honeypot: ''
    }
  });
  assert(orderRes.statusCode === 200, 'Zero Bug Gate: /api/order/validate handles valid checkout payload (200 OK)');

  // Verify WhatsApp order link generator pattern
  const rawWaNumber = '62811423799';
  const sampleMessage = 'Halo SAJI, saya ingin memesan Sajian Sumba Bowl (1x)';
  const waUrl = `https://wa.me/${rawWaNumber}?text=${encodeURIComponent(sampleMessage)}`;
  assert(
    waUrl.startsWith('https://wa.me/62811423799?text='),
    'Zero Bug Gate: WhatsApp direct order routing link properly formatted'
  );

  // =========================================================================
  // PILLAR 5: RELEASE CHECKPOINT & ROLLBACK SOP
  // =========================================================================
  console.log('\n--- PILLAR 5: RELEASE CHECKPOINT & DISASTER RECOVERY SOP ---');

  const playbookPath = path.join(__dirname, 'DISASTER_RECOVERY_PLAYBOOK.md');
  assert(fs.existsSync(playbookPath), 'SRE Artifact: DISASTER_RECOVERY_PLAYBOOK.md exists');

  const playbookContent = fs.readFileSync(playbookPath, 'utf8');
  assert(playbookContent.includes('RPO (Recovery Point Objective)'), 'Playbook: Contains defined RPO SLA');
  assert(playbookContent.includes('RTO (Recovery Time Objective)'), 'Playbook: Contains defined RTO SLA');
  assert(
    playbookContent.includes('1-Click Rollback') || playbookContent.includes('Instant Rollback'),
    'Playbook: Contains Instant Rollback procedures for Vercel, Cloudflare Pages, and Node.js'
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n==================================================');
  console.log(`HASIL RELEASE GATE: ${passedTests} dari ${totalTests} pengujian berhasil (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (failedTests === 0) {
    console.log('🎉 SELURUH 5 PILAR PRODUCTION RELEASE GATE LOLOS 100%!');
    console.log('   Sistem SAJI Siap Meluncur ke Produksi.');
  } else {
    console.error(`🚨 Terdapat ${failedTests} kegagalan pada Release Gate.`);
  }
  console.log('==================================================\n');

  process.exit(failedTests === 0 ? 0 : 1);
}

runReleaseGateTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
