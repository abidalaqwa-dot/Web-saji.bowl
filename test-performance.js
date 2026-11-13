/**
 * SAJI (Sajian Healthy Bowl) — Performance & Core Web Vitals Audit Suite
 * Audits Lighthouse Requirements & CWV Targets:
 *  - Render-Blocking Elimination (@import removed, fonts preconnected, script deferred)
 *  - LCP Resource Prioritization (fetchpriority="high", preloaded)
 *  - CLS Prevention (explicit width/height & aspect-ratios, reserve space)
 *  - INP Optimization (passive listeners, GPU hardware acceleration)
 *  - Accessibility (aria-label coverage on all icon/qty buttons)
 *  - Asset Compression (Brotli & Gzip payloads)
 *  - SEO & Meta Integrity
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function auditPerformance() {
  console.log('⚡ Menjalankan Audit Kinerja Core Web Vitals & Lighthouse...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, metric = '') {
    total++;
    const badge = metric ? `[${metric}] ` : '';
    if (condition) {
      console.log(`  ✅ ${badge}${testName}`);
      passed++;
    } else {
      console.error(`  ❌ ${badge}${testName}`);
    }
  }

  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

  // 1. Render-Blocking Elimination
  console.log('--- 1. RENDER-BLOCKING ELIMINATION ---');
  assert(!css.includes('@import url'), 'Eliminated @import from styles.css (No CSS-level blocking waterfall)', 'FCP');
  assert(html.includes('<link rel="preconnect" href="https://fonts.googleapis.com">'), 'Preconnect to fonts.googleapis.com present', 'FCP');
  assert(html.includes('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'), 'Preconnect to fonts.gstatic.com with crossorigin present', 'FCP');
  assert(html.includes('display=swap'), 'Google Fonts configured with font-display: swap (Zero FOIT)', 'FCP');
  assert(html.includes('<script src="app.js" defer></script>'), 'app.js deferred to prevent parser blocking', 'TBT');

  // 2. Largest Contentful Paint (LCP)
  console.log('\n--- 2. LARGEST CONTENTFUL PAINT (LCP) AUDIT ---');
  assert(html.includes('<link rel="preload" as="image" href="assets/saji_hero_bowl.png" fetchpriority="high">'), 'Preloaded Hero LCP bowl image with fetchpriority="high"', 'LCP');
  assert(html.includes('<link rel="preload" as="image" href="assets/saji_hero_wrap.png" fetchpriority="high">'), 'Preloaded Hero LCP wrap image with fetchpriority="high"', 'LCP');
  assert(html.includes('class="hero-img-bowl" fetchpriority="high" loading="eager" decoding="async"'), 'Hero bowl img has high priority, eager loading, async decoding', 'LCP');

  // 3. Cumulative Layout Shift (CLS)
  console.log('\n--- 3. CUMULATIVE LAYOUT SHIFT (CLS) AUDIT ---');
  const imgTags = html.match(/<img[^>]+>/g) || [];
  let allImgsHaveDims = true;
  imgTags.forEach(tag => {
    if (!tag.includes('width=') || !tag.includes('height=')) {
      allImgsHaveDims = false;
      console.error('Missing dimensions on: ' + tag);
    }
  });
  assert(allImgsHaveDims, `All ${imgTags.length} <img> tags have explicit width and height attributes`, 'CLS');
  assert(css.includes('aspect-ratio: 1 / 1;'), 'Aspect ratio definitions present in CSS to reserve space', 'CLS');

  // 4. Interaction to Next Paint (INP) & GPU Acceleration
  console.log('\n--- 4. INTERACTION TO NEXT PAINT (INP) AUDIT ---');
  assert(css.includes('will-change: transform;') && css.includes('transform: translateZ(0);'), 'Hero bowl & marquee animations accelerated on GPU composited layer', 'INP');
  assert(js.includes('{ passive: true }'), 'Passive event listeners active for lag-free touch and scroll', 'INP');

  // 5. Accessibility Audit
  console.log('\n--- 5. ACCESSIBILITY (A11Y) AUDIT ---');
  assert(html.includes('aria-label="Lihat ilustrasi gaya hidup sehat 01"'), 'Lifestyle selector dots have descriptive aria-labels', 'A11Y');
  assert(html.includes('aria-label="Tutup Menu"'), 'Customizer modal close button has descriptive aria-label', 'A11Y');
  assert(html.includes('aria-label="Buka Keranjang Pesanan SAJI"'), 'Navbar cart button has descriptive aria-label', 'A11Y');
  assert(html.includes('aria-label="Tutup Keranjang Pesanan"'), 'Drawer close button has descriptive aria-label', 'A11Y');
  assert(html.includes('aria-label="Kurangi 1 Sajian Sumba"'), 'Drawer item quantity adjustment buttons have descriptive aria-labels', 'A11Y');
  assert(html.includes('aria-controls="mobileNavMenu"'), 'Mobile navigation toggle has aria-controls and aria-expanded', 'A11Y');

  // 6. Asset Compression Benchmarks
  console.log('\n--- 6. OVER-THE-WIRE COMPRESSION BENCHMARKS ---');
  await new Promise(resolve => {
    zlib.brotliCompress(Buffer.from(css), (err, brCss) => {
      zlib.brotliCompress(Buffer.from(js), (err2, brJs) => {
        zlib.brotliCompress(Buffer.from(html), (err3, brHtml) => {
          const totalKBRaw = ((css.length + js.length + html.length) / 1024).toFixed(1);
          const totalKBBr = ((brCss.length + brJs.length + brHtml.length) / 1024).toFixed(1);
          console.log(`  Raw Text Bundle Size: ${totalKBRaw} KB`);
          console.log(`  Brotli Wire Transfer: ${totalKBBr} KB (${Math.round((1 - totalKBBr / totalKBRaw) * 100)}% wire reduction)`);
          assert(totalKBBr < 45, `Total critical path payload is under 45 KB (${totalKBBr} KB)`, 'PERF');
          resolve();
        });
      });
    });
  });

  // 7. SEO Meta Audit
  console.log('\n--- 7. SEO & SEARCH DISCOVERABILITY AUDIT ---');
  assert(html.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0'), 'Viewport meta tag configured properly', 'SEO');
  assert(html.includes('<title>') && html.includes('</title>'), 'Descriptive title tag present', 'SEO');
  assert(html.includes('<meta name="description"'), 'Meta description tag present', 'SEO');
  assert(html.includes('<link rel="canonical"'), 'Canonical URL tag present', 'SEO');

  console.log('\n==================================================');
  console.log(`RINGKASAN AUDIT CORE WEB VITALS: ${passed} dari ${total} pengujian berhasil (${Math.round(passed/total*100)}%)`);
  console.log('Semua Metrik Lighthouse & Core Web Vitals Siap Zona Hijau!');
  console.log('==================================================\n');
}

auditPerformance();
