/**
 * SAJI (Sajian Healthy Bowl) — Production Build & Release Gate Verification
 * SRE Pillar 4: Production Build Validation & Asset Optimization Audit
 * Exits with status code 0 on complete validation pass, or non-zero on failure.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  [SRE Build Gate] Initiating Production Build & Integrity Verification...\n');

let failedChecks = 0;

function check(title, fn) {
  try {
    const result = fn();
    console.log(`  ✅ [PASS] ${title}`);
    if (result && typeof result === 'string') {
      console.log(`     ↳ ${result}`);
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] ${title}: ${err.message}`);
    failedChecks++;
  }
}

// -----------------------------------------------------------------------------
// 1. JAVASCRIPT COMPILATION & SYNTAX AUDIT
// -----------------------------------------------------------------------------
console.log('--- 1. JAVASCRIPT COMPILATION & SYNTAX AUDIT ---');

const jsFiles = [
  'server.js',
  'app.js',
  'scripts/build.js',
  'scripts/backup-database.js',
  'scripts/restore-drill.js',
  'test-security.js',
  'test-performance.js',
  'test-release-gate.js'
];

jsFiles.forEach(file => {
  check(`JavaScript Syntax Check: ${file}`, () => {
    const fullPath = path.join(__dirname, '..', file);
    if (!fs.existsSync(fullPath)) throw new Error(`File not found: ${file}`);
    execSync(`node --check "${fullPath}"`, { stdio: 'pipe' });
    return `Verified clean syntax (node --check passed)`;
  });
});

// -----------------------------------------------------------------------------
// 2. HTML STRUCTURE & METADATA VALIDATION
// -----------------------------------------------------------------------------
console.log('\n--- 2. HTML STRUCTURE & METADATA RESOLUTION ---');

const htmlFiles = [
  'index.html',
  'admin-login.html',
  'admin-dashboard.html',
  'kebijakan-privasi.html',
  '404.html'
];

htmlFiles.forEach(file => {
  check(`HTML Document Structure: ${file}`, () => {
    const fullPath = path.join(__dirname, '..', file);
    if (!fs.existsSync(fullPath)) throw new Error(`File not found: ${file}`);
    const content = fs.readFileSync(fullPath, 'utf8');

    if (!content.includes('<!DOCTYPE html>')) throw new Error('Missing <!DOCTYPE html>');
    if (!content.includes('<html') || !content.includes('</html>')) throw new Error('Missing <html> tags');
    if (!content.includes('<head>') || !content.includes('</head>')) throw new Error('Missing <head> tags');
    if (!content.includes('<body>') || !content.includes('</body>')) throw new Error('Missing <body> tags');

    return `Standard HTML5 structure verified (${(content.length / 1024).toFixed(1)} KB)`;
  });
});

check('Critical Monitoring & Performance Tags in index.html', () => {
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  if (!indexHtml.includes('initSentry') || !indexHtml.toLowerCase().includes('sentry')) {
    throw new Error('Missing Sentry error tracking initialization in index.html');
  }
  if (!indexHtml.includes('name="viewport"')) throw new Error('Missing viewport meta');
  if (!indexHtml.includes('name="description"')) throw new Error('Missing description meta');
  return 'Sentry error tracking SDK, viewport meta, and description meta verified';
});

// -----------------------------------------------------------------------------
// 3. CSS DESIGN INTEGRITY & ZERO REGRESSION LOCK
// -----------------------------------------------------------------------------
console.log('\n--- 3. CSS DESIGN SYSTEM & ZERO REGRESSION LOCK ---');

check('CSS Syntax & Balance: styles.css', () => {
  const cssPath = path.join(__dirname, '..', 'styles.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Verify bracket balance
  const openBraces = (cssContent.match(/\{/g) || []).length;
  const closeBraces = (cssContent.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    throw new Error(`Mismatched CSS braces: { count=${openBraces}, } count=${closeBraces}`);
  }

  // Verify Brand Colors (#1E3622, #F7F5F0, #C85A32)
  const brandColors = ['#1e3622', '#f7f5f0', '#c85a32'];
  const lowerCss = cssContent.toLowerCase();
  brandColors.forEach(color => {
    if (!lowerCss.includes(color)) {
      throw new Error(`Brand palette color ${color} missing from design tokens`);
    }
  });

  return `Brace balance verified (${openBraces} rules), brand palette intact (${(cssContent.length / 1024).toFixed(1)} KB)`;
});

// -----------------------------------------------------------------------------
// 4. ASSET BUNDLE INTEGRITY & FILE SIZE AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 4. ASSET BUNDLE & RESOLUTION AUDIT ---');

check('Critical Production Visual Assets Existence', () => {
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) throw new Error('Assets directory not found');

  const requiredAssets = [
    'saji_hero_bowl.png',
    'saji_hero_wrap.png',
    'saji_sumba.jpg',
    'saji_bogor.jpg',
    'saji_yogya.jpg',
    'saji_gulung_menu.png',
    'logo.svg'
  ];

  let totalAssetSize = 0;
  for (const asset of requiredAssets) {
    const assetPath = path.join(assetsDir, asset);
    if (!fs.existsSync(assetPath)) throw new Error(`Missing critical asset: ${asset}`);
    const size = fs.statSync(assetPath).size;
    totalAssetSize += size;
  }

  return `${requiredAssets.length} critical production assets verified (Total: ${(totalAssetSize / 1024).toFixed(1)} KB)`;
});

// -----------------------------------------------------------------------------
// 5. STAGING & ENVIRONMENT SANITIZATION AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 5. ENVIRONMENT SANITIZATION & STAGING ISOLATION ---');

check('No Private Staging / Local Secret Files in Workspace Root', () => {
  const forbiddenFiles = ['.env.development', '.env.test', '.env.local', 'staging.config.js'];
  for (const f of forbiddenFiles) {
    if (fs.existsSync(path.join(__dirname, '..', f))) {
      throw new Error(`Unsanitized staging file detected in workspace root: ${f}`);
    }
  }
  return 'Workspace clean: Zero staging secrets or dev override files present';
});

check('Gitignore Protections for Production Backups & Keys', () => {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (!fs.existsSync(gitignorePath)) throw new Error('Missing .gitignore');
  const content = fs.readFileSync(gitignorePath, 'utf8');

  const requiredIgnores = ['.env', 'backups/', '*.enc', 'test_restore_sandbox/'];
  for (const item of requiredIgnores) {
    if (!content.includes(item)) {
      throw new Error(`Missing essential .gitignore entry: ${item}`);
    }
  }
  return 'Sensitive files (.env, *.enc, backups/, sandbox) strictly ignored in Git';
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n==================================================');
if (failedChecks === 0) {
  console.log('🎉 [SRE BUILD GATE] PRODUCTION BUILD VALIDATION PASSED (EXIT 0)');
  console.log('   All syntax, structure, assets, and environment gates verified.');
  console.log('==================================================\n');
  process.exit(0);
} else {
  console.error(`🚨 [SRE BUILD GATE] FAILED WITH ${failedChecks} ERRORS (EXIT 1)`);
  console.log('==================================================\n');
  process.exit(1);
}
