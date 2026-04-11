/**
 * CalcMate Tier 1 Smoke Test
 *
 * Tests every calculator page:
 * 1. Page loads (200)
 * 2. Expected inputs render
 * 3. calculate() runs without JS errors
 * 4. Results div appears with content
 */

const puppeteer = require('puppeteer');
const calculators = require('../data/calculators.json');

const BASE_URL = process.env.TEST_URL || 'https://calcmate.benslater.me';

async function runSmokeTests() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const results = { pass: 0, fail: 0, errors: [] };

  console.log(`\n🧪 CalcMate Smoke Test — ${calculators.length} calculators\n`);
  console.log(`Testing against: ${BASE_URL}\n`);

  for (const calc of calculators) {
    const url = `${BASE_URL}/${calc.category}/${calc.slug}`;
    const page = await browser.newPage();
    const jsErrors = [];

    page.on('pageerror', err => jsErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') jsErrors.push(msg.text());
    });

    try {
      // 1. Load page
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      const status = response.status();
      if (status !== 200) throw new Error(`HTTP ${status}`);

      // 2. Check inputs rendered
      const inputCount = await page.evaluate(() => {
        return document.querySelectorAll('#calc-inputs input, #calc-inputs select, #calc-inputs textarea').length;
      });
      if (inputCount === 0) throw new Error('No inputs rendered');

      // 3. Run calculate()
      const calcResult = await page.evaluate(() => {
        try {
          if (typeof calculate !== 'function') return { error: 'calculate() not defined' };
          calculate();
          const resultsDiv = document.getElementById('calc-results');
          const contentDiv = document.getElementById('results-content');
          return {
            hidden: resultsDiv ? resultsDiv.classList.contains('hidden') : true,
            childCount: contentDiv ? contentDiv.children.length : 0,
            hasContent: contentDiv ? contentDiv.innerHTML.length > 0 : false,
            firstText: contentDiv && contentDiv.children[0] ? contentDiv.children[0].textContent.substring(0, 60) : ''
          };
        } catch (e) {
          return { error: e.message };
        }
      });

      if (calcResult.error) throw new Error(`calculate() error: ${calcResult.error}`);
      if (calcResult.hidden) throw new Error('Results div still hidden after calculate()');
      if (!calcResult.hasContent) throw new Error('Results div empty after calculate()');
      if (jsErrors.length) throw new Error(`JS errors: ${jsErrors.join('; ')}`);

      // PASS
      results.pass++;
      process.stdout.write(`  ✅ ${calc.slug} (${inputCount} inputs, ${calcResult.childCount} results)\n`);

    } catch (err) {
      results.fail++;
      results.errors.push({ slug: calc.slug, category: calc.category, error: err.message });
      process.stdout.write(`  ❌ ${calc.slug} — ${err.message}\n`);
    }

    await page.close();
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n📊 Results: ${results.pass} passed, ${results.fail} failed out of ${calculators.length}\n`);

  if (results.errors.length) {
    console.log('❌ Failures:\n');
    results.errors.forEach(e => {
      console.log(`  ${e.category}/${e.slug}: ${e.error}`);
    });
  }

  await browser.close();
  process.exit(results.fail > 0 ? 1 : 0);
}

runSmokeTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
