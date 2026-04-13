#!/usr/bin/env node
/**
 * CalculatorMate — Article Image Generator (v3)
 *
 * Uses Gemini 2.5 Flash Image via generateContent API (bOS billing account).
 *
 * THREE-LAYER TEXT PREVENTION:
 * 1. Prompts never mention words, signs, labels, forms, logos, badges, or
 *    anything that implies text. Scene descriptions use only visual objects.
 * 2. Every generated image is scanned for text via Gemini Vision before saving.
 *    If text is detected, the image is rejected and regenerated (up to 3 tries).
 * 3. Images are cropped to 16:9 landscape at 1200x675 via sharp.
 *
 * Run: GEMINI_API_KEY=xxx node scripts/generate-article-images.js
 * Or:  GEMINI_API_KEY=xxx node scripts/generate-article-images.js --slug=compound-interest-power
 * Or:  GEMINI_API_KEY=xxx node scripts/generate-article-images.js --force  (regenerate all)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('Missing GEMINI_API_KEY'); process.exit(1); }

const ARTICLES_PATH = path.join(__dirname, '..', 'data', 'articles.json');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'articles');
const MAX_RETRIES = 3;

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));

// Aggressive no-text instruction — repeated and emphatic
const NO_TEXT = [
  'The image must contain ZERO text of any kind.',
  'No words, no letters, no numbers, no labels, no signs, no captions, no watermarks, no signatures, no logos, no badges, no banners, no headings, no UI elements with text.',
  'All surfaces must be blank — no writing on papers, screens, boards, signs, or any object.',
  'This is critically important: if you are tempted to add any text at all, leave that area blank or filled with abstract colour instead.'
].join(' ');

// Category-specific visual prompts — PURE VISUAL, never implying text
const categoryPrompts = {
  Finance: `Clean modern flat illustration, wide landscape format. Australian financial concept: a desk with a laptop showing an abstract rising line, a coffee cup, scattered gold coins, and a calculator with blank buttons. Warm earth tones with gold accents. ${NO_TEXT}`,
  Property: `Clean modern flat illustration, wide landscape format. Australian suburban houses in a row with green lawns, blue sky, and a warm sunset. Earthy and blue tones. ${NO_TEXT}`,
  Health: `Clean modern flat illustration, wide landscape format. Wellness scene: a person jogging through a leafy park with water bottle and fresh fruit nearby. Fresh green and blue palette. ${NO_TEXT}`,
  Lifestyle: `Clean modern flat illustration, wide landscape format. Australian backyard scene with a BBQ, sunshine, outdoor furniture, and eucalyptus trees. Warm inviting colours. ${NO_TEXT}`,
  Super: `Clean modern flat illustration, wide landscape format. Retirement concept: a golden nest egg on a cushion with small coins growing into larger ones. Professional blue and green tones. ${NO_TEXT}`,
  Business: `Clean modern flat illustration, wide landscape format. Workplace scene: a tidy desk with a laptop, coffee, plant, and abstract charts on screen. Professional grey and blue tones. ${NO_TEXT}`,
  Car: `Clean modern flat illustration, wide landscape format. A car on an Australian highway with eucalyptus trees and blue sky. Blue and silver colours. ${NO_TEXT}`,
  Trade: `Clean modern flat illustration, wide landscape format. Construction tools arranged neatly: hardhat, tape measure, timber planks, and a spirit level. Yellow and grey palette. ${NO_TEXT}`,
  Fun: `Fun playful flat illustration, wide landscape format. Bright cheerful abstract shapes, confetti, stars, and happy vibes. Whimsical cartoon style. ${NO_TEXT}`,
  Separation: `Clean modern flat illustration, wide landscape format. Two cosy houses connected by a gentle winding path through a garden, warm sunset sky, a sense of balance and hope. Soft teal, warm amber, and muted purple tones. ${NO_TEXT}`
};

// Article-specific visual hints — OBJECTS ONLY, never text-implying items
// Removed: signs, forms, logos, badges, labels, documents, boards, "open" signs
function getArticleVisualHint(article) {
  const slug = article.slug;
  const hints = {
    'how-australian-income-tax-works': 'cascading coloured steps like a staircase with coins on each step, getting larger at top',
    'budget-50-30-20-rule': 'three glass jars filled with different amounts of gold coins, arranged small to large',
    'compound-interest-power': 'snowball rolling downhill on a gentle slope, getting dramatically bigger',
    'salary-sacrifice-super-guide': 'coins flowing from a pay envelope into a golden piggy bank via an arrow shape',
    'salary-sacrifice-into-super': 'golden stream of coins pouring into a secure vault with a nest egg inside',
    'super-balance-by-age': 'row of nest eggs on shelves, each one larger than the last',
    'super-guarantee-12-percent': 'employer figure placing coins into a large nest egg',
    'super-fund-fees-matter': 'two identical jars side by side, one noticeably fuller than the other',
    'retirement-income-how-much': 'retired couple silhouettes on a beach watching a warm sunset, comfortable chairs',
    'first-home-buyer-costs-guide': 'couple silhouettes holding a large golden key in front of a house',
    'stamp-duty-by-state-compared': 'map of Australia with each state a different colour, small house icons on each',
    'car-loan-vs-savings': 'split scene: left side car with chain attached, right side car with stack of coins',
    'credit-card-debt-payoff-strategies': 'scissors cutting through a chain attached to a credit card shape',
    'cutting-electricity-bills': 'lightbulb with a downward arrow, solar panels on a roof, bright Australian sun',
    'starting-a-business-costs': 'small colourful shopfront with an awning and a potted plant, warm and inviting',
    'solar-panels-worth-it-australia': 'house rooftop covered in solar panels under a bright Australian sun with rays',
    'help-debt-repayment-explained': 'graduation cap next to a slowly shrinking stack of coins',
    'long-service-leave-by-state': 'calendar pages floating with a suitcase and airplane, holiday feeling',
    'redundancy-pay-rights-australia': 'handshake silhouette with a safety net below, balanced scales nearby',
    'notice-period-entitlements': 'calendar with a clock overlay, gentle countdown feeling',
    'overtime-pay-rules-australia': 'clock showing late hours with multiplying coins next to it',
    'annual-leave-loading-explained': 'beach umbrella with extra gold coins raining down, holiday vibes',
    'medicare-levy-explained': 'medical cross symbol in red and white with a protective shield',
    'fuel-tax-credits-explained': 'fuel pump with coins flowing back towards a truck via curved arrows',
    'fbt-company-car-guide': 'company car with a price tag dangling from mirror, abstract benefit concept',
    'division-7a-loans-explained': 'two entities connected by a flowing arrow with coins, corporate feel',
    'how-much-coffee-costs-lifetime': 'towering stack of takeaway coffee cups reaching into clouds, coins tumbling',
    'how-much-concrete-slab': 'concrete being poured from a mixer, smooth grey slab, tape measure',
    'paint-calculator-how-much': 'paint roller on a wall leaving colour, paint cans in different shades',
    'roofing-materials-guide': 'house roof cross-section showing layers of different materials',
    'decking-materials-calculator-guide': 'outdoor timber deck with different wood grain samples laid out',
    'fencing-cost-guide-australia': 'fence line stretching into distance with different panel styles',
    'love-calculator-science': 'two colourful hearts with playful dotted connection lines between them',
    'pizza-maths-fair-sharing': 'pizza cut into perfect geometric slices with a protractor and ruler nearby',
    'pregnancy-due-date-what-to-expect': 'gentle pastel calendar with baby items: booties, rattle, soft blanket',
    'pet-age-human-years-myth': 'dog and cat side by side with differently sized birthday cakes',
    'sydney-toll-costs-commuters': 'Sydney Harbour Bridge silhouette with coins flowing from a car crossing it',
    'blood-alcohol-how-it-works': 'row of drink glasses with liquid levels decreasing left to right',
    'how-child-support-is-calculated-australia': 'calculator next to balanced scales with family silhouettes and gold coins',
    'care-percentage-guide-australia': 'coloured blocks on a calendar grid, two houses with a path between them',
    'property-settlement-after-separation': 'house gently split in half with balanced golden scales, warm tones',
    'separation-costs-what-to-expect': 'moving boxes stacked next to a calculator and a set of keys on a table',
    'co-parenting-schedules-that-work': 'colourful two-week calendar grid with alternating colour blocks, two houses',
    'managing-two-household-budgets': 'two houses side by side each with a pie chart floating above them',
    'changing-child-support-assessment': 'two side-by-side calculator screens showing different abstract bar charts',
    'free-separation-resources-australia': 'helping hands reaching towards each other, warm supportive circle of people',
  };
  return hints[slug] || '';
}

// ─── Gemini API call ───────────────────────────────────────────────────────

function geminiRequest(body, modelPath) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${modelPath}:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function generateImage(prompt) {
  const body = {
    contents: [{
      parts: [{ text: `Generate a wide landscape-format (16:9 aspect ratio) illustration. ${prompt}` }]
    }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT']
    }
  };

  const json = await geminiRequest(body, 'gemini-2.5-flash-image');

  if (json.error) {
    console.warn('    API error:', json.error.message?.substring(0, 100));
    return null;
  }

  const candidates = json.candidates || [];
  if (candidates.length > 0) {
    const parts = candidates[0].content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }
  }

  console.warn('    No image in response');
  return null;
}

// ─── Text detection via Gemini Vision ──────────────────────────────────────

async function imageContainsText(imageBuffer) {
  // Convert to PNG for the vision API
  const pngBuffer = await sharp(imageBuffer).png().toBuffer();
  const base64 = pngBuffer.toString('base64');

  const body = {
    contents: [{
      parts: [
        { text: 'Look at this image carefully. Does it contain ANY visible text, words, letters, numbers, labels, signs, watermarks, or characters of any kind? Answer with ONLY "YES" or "NO" — nothing else.' },
        { inlineData: { mimeType: 'image/png', data: base64 } }
      ]
    }]
  };

  try {
    const json = await geminiRequest(body, 'gemini-2.5-flash');
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';
    // Be conservative: if the answer isn't clearly NO, assume text was found
    return !text.startsWith('NO');
  } catch (e) {
    console.warn('    Vision check failed:', e.message, '— rejecting image to be safe');
    return true; // Reject on error
  }
}

// ─── Process one article ───────────────────────────────────────────────────

async function processArticle(article, force) {
  const slug = article.slug;
  const webpPath = path.join(IMAGES_DIR, `${slug}.webp`);

  if (!force && fs.existsSync(webpPath)) {
    return 'skip';
  }

  const category = article.category || 'Finance';
  const basePrompt = categoryPrompts[category] || categoryPrompts.Finance;
  const hint = getArticleVisualHint(article);
  const prompt = hint
    ? basePrompt.replace(NO_TEXT, `Visual focus: ${hint}. ${NO_TEXT}`)
    : basePrompt;

  console.log(`  Generating: ${slug}...`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 1) console.log(`    Retry ${attempt}/${MAX_RETRIES}...`);

    const imageData = await generateImage(prompt);
    if (!imageData) {
      console.log(`    ❌ Generation failed`);
      continue;
    }

    // TEXT GATE: check for text before saving
    const hasText = await imageContainsText(imageData);
    if (hasText) {
      console.log(`    🚫 Text detected — rejecting (attempt ${attempt})`);
      await new Promise(r => setTimeout(r, 2000)); // Rate limit before retry
      continue;
    }

    // Passed text check — save it
    try {
      await sharp(imageData)
        .resize({ width: 1200, height: 675, fit: 'cover' })
        .webp({ quality: 82, effort: 6 })
        .toFile(webpPath);

      const stats = fs.statSync(webpPath);
      console.log(`  ✅ ${slug} — ${(stats.size / 1024).toFixed(0)}KB (attempt ${attempt})`);
      return 'ok';
    } catch (e) {
      console.warn(`    ❌ sharp error: ${e.message}`);
      return 'fail';
    }
  }

  console.log(`  ❌ ${slug} — failed after ${MAX_RETRIES} attempts (text in every image)`);
  return 'fail';
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🧮 CalculatorMate Article Image Generator v3');
  console.log('  Text detection gate: ON (Gemini Vision scan)\n');

  const slugArg = process.argv.find(a => a.startsWith('--slug='));
  const targetSlug = slugArg ? slugArg.split('=')[1] : null;
  const force = process.argv.includes('--force');

  const targets = targetSlug
    ? articles.filter(a => a.slug === targetSlug)
    : articles;

  console.log(`  Processing ${targets.length} articles${force ? ' (force regenerate)' : ''}...\n`);

  let generated = 0, skipped = 0, failed = 0, textRejected = 0;

  for (const article of targets) {
    await new Promise(r => setTimeout(r, 2000)); // Rate limit
    const result = await processArticle(article, force);
    if (result === 'ok') generated++;
    else if (result === 'skip') skipped++;
    else failed++;
  }

  console.log(`\n  Done: ${generated} generated, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) {
    console.log(`  ⚠️  ${failed} articles have no image — text was detected in all attempts`);
  }
  console.log('');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
