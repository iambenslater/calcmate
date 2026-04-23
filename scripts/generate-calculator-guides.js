#!/usr/bin/env node
/**
 * Generate long-form supporting content for the top 30 calculator pages.
 *
 * Writes a `guide` object to each calculator in data/calculators.json:
 *   { workedExample, stateNotes, commonMistakes, limitations, edgeCases }
 *
 * Target: ~800 words of original content per calculator (AdSense thin-content fix).
 *
 * Usage:
 *   node scripts/generate-calculator-guides.js [--slug=take-home-pay] [--all] [--force]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk').default;

const DATA_PATH = path.join(__dirname, '..', 'data', 'calculators.json');
const MODEL = 'claude-sonnet-4-5';

// Pull API key from env OR bOS master.env
function loadApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const masterEnv = fs.readFileSync(path.resolve(process.env.HOME, 'Library/CloudStorage/GoogleDrive-ben@benslater.me/My Drive/bOS/Root/Secrets/master.env'), 'utf8');
    const match = masterEnv.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {}
  throw new Error('No ANTHROPIC_API_KEY found');
}

const client = new Anthropic({ apiKey: loadApiKey() });

const PRIORITY_SLUGS = [
  // Finance (tax/pay)
  'take-home-pay', 'income-tax', 'tax-withheld', 'tax-return-estimator', 'medicare-levy',
  'study-loan-repayment', 'home-office-expenses',
  // Super
  'super-guarantee', 'super-balance-growth',
  // Property
  'mortgage-repayment', 'borrowing-power', 'stamp-duty-nsw', 'stamp-duty-vic', 'stamp-duty-qld',
  'stamp-duty-all-states', 'land-tax', 'first-home-buyer-costs', 'lvr', 'lmi',
  // Car
  'fuel-cost', 'car-registration', 'ctp-greenslip', 'car-loan', 'toll-calculator',
  // Business / work
  'leave-calculator', 'long-service-leave', 'redundancy-pay', 'notice-period',
  'hourly-rate', 'overtime-pay'
];

function buildPrompt(calc) {
  return `You are writing long-form supporting content for an Australian calculator page. The calculator is:

Title: ${calc.title}
Slug: ${calc.slug}
Category: ${calc.category}
Description: ${calc.description}
Meta description: ${calc.metaDescription}
Current FAQ topics: ${(calc.faq || []).map(f => f.q).join(' | ')}

Write FIVE sections of HTML content. Each section is original, substantive, and written in a plain, confident Australian voice — no marketing fluff, no "in today's world", no "dive deep". Short paragraphs. Use concrete numbers and real Australian context (ATO rates, state names, Fair Work, Services Australia where relevant). Target audience: adult Australian who wants a clear answer without jargon.

Output format: a single JSON object with these five string keys. Each value is HTML (use <p>, <h3>, <ul>, <li>, <strong>, <a>). No wrapper div. No markdown. Values should be HTML strings ready to drop into a page.

1. workedExample — A specific worked example with real Australian numbers. Named person, realistic scenario, step-by-step calculation showing how the inputs produce the output. 150–250 words.

2. stateNotes — How this varies across Australian states (NSW, VIC, QLD, WA, SA, TAS, ACT, NT). If the calculator is state-specific, cover the other states. If state doesn't apply, cover other variation dimensions (income bands, age brackets, industry awards, etc.). Use a <ul> of state/category notes. 150–250 words.

3. commonMistakes — 3 to 5 specific mistakes Australians make with this topic. Each one: what people do wrong, why it's wrong, what to do instead. Use a <ul> with one <li> per mistake. 150–250 words.

4. limitations — What this calculator deliberately does NOT account for. Be honest. Things like: one-off bonuses, salary packaging, complex trusts, unusual work arrangements, residency edge cases, policy changes mid-year. 100–150 words.

5. edgeCases — Genuinely tricky scenarios where the basic answer might be misleading. Specific Australian ATO/Fair Work/state nuances. Reference actual rules/sections where possible (e.g., "Division 293 tax kicks in above $250k"). 150–250 words.

Rules:
- Every fact must be accurate for current Australian 2025-26 settings. When in doubt, hedge ("as at the 2025–26 financial year").
- No em-dashes. Use hyphens and commas instead. (Ben dislikes em-dashes.)
- No American spellings. Use Australian English (colour, organisation, superannuation).
- No filler. No "Let's explore...". No "In today's economy...".
- Reference specific ATO/Fair Work/state gov sections or thresholds where relevant.
- Write like a knowledgeable friend explaining it over coffee, not a content mill.
- Do NOT include h2 wrappers — just the content for each section (h3 and below OK).

Return ONLY the JSON object, nothing else. Do not wrap in \`\`\`json fences.`;
}

async function generateGuide(calc) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: buildPrompt(calc) }]
  });

  const text = response.content[0].text.trim();
  // Strip possible fences just in case
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error(`JSON parse failed for ${calc.slug}:`, err.message);
    console.error('Raw:', text.slice(0, 500));
    throw err;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const singleSlug = args.find(a => a.startsWith('--slug='))?.split('=')[1];
  const force = args.includes('--force');
  const all = args.includes('--all');

  const calculators = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  let targets;
  if (singleSlug) {
    targets = calculators.filter(c => c.slug === singleSlug);
  } else if (all) {
    targets = calculators.filter(c => c.category !== 'fun');
  } else {
    targets = PRIORITY_SLUGS.map(slug => calculators.find(c => c.slug === slug)).filter(Boolean);
  }

  const toProcess = force ? targets : targets.filter(c => !c.guide);
  console.log(`Generating guides for ${toProcess.length} calculator(s)`);
  if (!toProcess.length) { console.log('Nothing to do.'); return; }

  const CONCURRENCY = 4;
  let completed = 0;
  const errors = [];

  async function worker(queue) {
    while (queue.length) {
      const calc = queue.shift();
      try {
        const guide = await generateGuide(calc);
        const idx = calculators.findIndex(c => c.slug === calc.slug);
        calculators[idx] = { ...calculators[idx], guide };
        completed++;
        console.log(`  [${completed}/${toProcess.length}] ${calc.slug}`);
        // Persist after every item so partial runs aren't lost
        fs.writeFileSync(DATA_PATH, JSON.stringify(calculators, null, 2));
      } catch (err) {
        console.error(`  FAIL ${calc.slug}: ${err.message}`);
        errors.push({ slug: calc.slug, error: err.message });
      }
    }
  }

  const queue = [...toProcess];
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

  console.log(`Done. Success: ${completed}, Errors: ${errors.length}`);
  if (errors.length) console.log(errors);
}

main().catch(err => { console.error(err); process.exit(1); });
