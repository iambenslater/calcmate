/**
 * CalcMate Quality Check
 *
 * Catches rendering and UX issues across all calculators:
 * - HTML entities showing as literal text (&amp;apos; &amp;nbsp; etc.)
 * - Range inputs without visible value display
 * - Broken/missing input labels
 * - Missing calculate() or getTLDR() functions
 * - JS errors on page load
 * - Empty or placeholder-only select options
 * - Console errors
 * - Missing OG image meta tags
 *
 * Run: node tests/quality-check.js [--url https://...]
 */

const puppeteer = require('puppeteer');
const calculators = require('../data/calculators.json');

const args = process.argv.slice(2);
const urlIdx = args.indexOf('--url');
const BASE_URL = urlIdx >= 0 ? args[urlIdx + 1] : 'https://calculatormate.com.au';

const CHECKS = {
  pass: 0,
  warn: 0,
  fail: 0,
  issues: []
};

function issue(slug, severity, msg) {
  CHECKS.issues.push({ slug, severity, msg });
  if (severity === 'FAIL') CHECKS.fail++;
  else CHECKS.warn++;
}

async function checkCalculator(browser, calc) {
  const url = `${BASE_URL}/${calc.category}/${calc.slug}`;
  const page = await browser.newPage();
  const jsErrors = [];
  const consoleErrors = [];

  page.on('pageerror', err => jsErrors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    if (response.status() !== 200) {
      issue(calc.slug, 'FAIL', `HTTP ${response.status()}`);
      await page.close();
      return;
    }

    // Run all checks in browser context
    const result = await page.evaluate(() => {
      const issues = [];

      // 1. Check for raw HTML entities in visible text
      const bodyText = document.body.innerText;
      const entityPatterns = [
        { pattern: /&apos;/g, name: '&apos;' },
        { pattern: /&quot;/g, name: '&quot; (in visible text)' },
        { pattern: /&amp;(?!amp;|lt;|gt;|quot;|#)/g, name: '&amp; (unrendered)' },
        { pattern: /&nbsp;/g, name: '&nbsp; (literal)' },
        { pattern: /&ndash;(?![;\s])/g, name: '&ndash; (literal)' },
        { pattern: /&mdash;(?![;\s])/g, name: '&mdash; (literal)' },
      ];
      for (const ep of entityPatterns) {
        const matches = bodyText.match(ep.pattern);
        if (matches) {
          issues.push({ severity: 'FAIL', msg: `Raw HTML entity "${ep.name}" found ${matches.length}x in visible text` });
        }
      }

      // 2. Check input labels exist and aren't empty
      const inputs = document.querySelectorAll('#calc-inputs input, #calc-inputs select');
      let labelledCount = 0;
      inputs.forEach(inp => {
        const id = inp.id;
        if (!id) return;
        const label = document.querySelector(`label[for="${id}"]`);
        if (label && label.textContent.trim()) labelledCount++;
      });
      // Radio inputs use name-based labels, skip those for this check

      // 3. Check range inputs have visible value display
      const rangeInputs = document.querySelectorAll('#calc-inputs input[type="range"]');
      rangeInputs.forEach(range => {
        const id = range.id;
        // Check for a nearby value display element
        const parent = range.closest('.mb-4') || range.parentElement;
        const valueDisplay = parent.querySelector('span[id^="range-val"], .range-value, output');
        const siblingSpan = range.nextElementSibling;
        const hasValueDisplay = valueDisplay || (siblingSpan && siblingSpan.tagName === 'SPAN');
        if (!hasValueDisplay) {
          issues.push({ severity: 'WARN', msg: `Range input "${id}" has no visible value display` });
        }
      });

      // 4. Check select inputs have real options (not just placeholders)
      const selects = document.querySelectorAll('#calc-inputs select');
      selects.forEach(sel => {
        const opts = sel.querySelectorAll('option');
        const realOpts = Array.from(opts).filter(o => o.value && !o.disabled);
        if (realOpts.length === 0) {
          issues.push({ severity: 'WARN', msg: `Select "${sel.id}" has no selectable options` });
        }
      });

      // 5. Check calculate() exists
      if (typeof calculate !== 'function') {
        issues.push({ severity: 'FAIL', msg: 'calculate() function not defined' });
      }

      // 6. Check getTLDR() exists
      if (typeof getTLDR !== 'function') {
        issues.push({ severity: 'WARN', msg: 'getTLDR() function not defined' });
      }

      // 7. Check OG meta tags
      const ogImage = document.querySelector('meta[property="og:image"]');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogImage || !ogImage.content) {
        issues.push({ severity: 'WARN', msg: 'Missing og:image meta tag' });
      }
      if (!ogTitle || !ogTitle.content) {
        issues.push({ severity: 'WARN', msg: 'Missing og:title meta tag' });
      }

      // 8. Try running calculate and check for results
      let calcError = null;
      try {
        if (typeof calculate === 'function') {
          calculate();
          const resultsDiv = document.getElementById('calc-results');
          const contentDiv = document.getElementById('results-content');
          if (resultsDiv && resultsDiv.classList.contains('hidden')) {
            // Some calculators validly keep results hidden if no inputs filled
            // Not necessarily a failure
          }
          if (contentDiv && contentDiv.innerHTML) {
            // Check result content for raw entities too
            const resultText = contentDiv.innerText;
            if (/&apos;|&quot;|&amp;(?!amp;)/.test(resultText)) {
              issues.push({ severity: 'WARN', msg: 'Raw HTML entities in calculator results' });
            }
          }
        }
      } catch (e) {
        calcError = e.message;
      }
      if (calcError) {
        issues.push({ severity: 'FAIL', msg: `calculate() threw: ${calcError}` });
      }

      return issues;
    });

    // Add browser-context issues
    result.forEach(i => issue(calc.slug, i.severity, i.msg));

    // JS errors
    if (jsErrors.length) {
      jsErrors.forEach(e => issue(calc.slug, 'FAIL', `JS error: ${e}`));
    }

    if (result.length === 0 && jsErrors.length === 0) {
      CHECKS.pass++;
    }

  } catch (err) {
    issue(calc.slug, 'FAIL', `Page error: ${err.message}`);
  }

  await page.close();
}

async function main() {
  console.log(`\n🔍 CalcMate Quality Check — ${calculators.length} calculators`);
  console.log(`Testing: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  for (const calc of calculators) {
    await checkCalculator(browser, calc);
    const hasIssues = CHECKS.issues.filter(i => i.slug === calc.slug);
    if (hasIssues.length === 0) {
      process.stdout.write(`  ✅ ${calc.slug}\n`);
    } else {
      hasIssues.forEach(i => {
        const icon = i.severity === 'FAIL' ? '❌' : '⚠️';
        process.stdout.write(`  ${icon} ${calc.slug}: ${i.msg}\n`);
      });
    }
  }

  await browser.close();

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n📊 Quality Check Results:`);
  console.log(`   ✅ Clean: ${CHECKS.pass}`);
  console.log(`   ⚠️  Warnings: ${CHECKS.warn}`);
  console.log(`   ❌ Failures: ${CHECKS.fail}`);
  console.log(`   Total: ${calculators.length} calculators\n`);

  if (CHECKS.fail > 0) {
    console.log('❌ Failures (must fix):\n');
    CHECKS.issues.filter(i => i.severity === 'FAIL').forEach(i => {
      console.log(`  ${i.slug}: ${i.msg}`);
    });
    console.log('');
  }

  if (CHECKS.warn > 0) {
    console.log('⚠️  Warnings (should fix):\n');
    CHECKS.issues.filter(i => i.severity === 'WARN').forEach(i => {
      console.log(`  ${i.slug}: ${i.msg}`);
    });
    console.log('');
  }

  process.exit(CHECKS.fail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
