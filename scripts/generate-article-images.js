#!/usr/bin/env node
/**
 * CalculatorMate — Article Image Generator (v2)
 *
 * Uses Google Gemini Imagen API to generate contextual hero images for articles.
 * Outputs optimised WebP directly via sharp. Does NOT inject into article content
 * (the template handles the hero image via article slug convention).
 *
 * IMPORTANT: Prompts deliberately exclude the article title to prevent Gemini
 * from rendering text in the image. All prompts include strong negative text instructions.
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

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));

const NO_TEXT = 'Absolutely no text, no words, no letters, no numbers, no labels, no captions, no watermarks, no signatures anywhere in the image.';

// Category-specific visual prompts — NO article titles to prevent text rendering
const categoryPrompts = {
  Finance: `Clean modern flat illustration of Australian financial planning concept. A desk with a laptop showing a rising chart, a coffee cup, scattered coins, and a calculator. Professional navy blue and gold colour scheme. ${NO_TEXT}`,
  Property: `Clean modern flat illustration of Australian suburban homes and property. A row of colourful houses with a "sold" sign, green lawn, blue sky. Warm earthy and blue tones. ${NO_TEXT}`,
  Health: `Clean modern flat illustration of health and wellness. A person jogging in a park with trees, water bottle, and healthy food nearby. Fresh green and blue palette. ${NO_TEXT}`,
  Lifestyle: `Clean modern flat illustration of everyday Australian lifestyle. BBQ in a backyard, sunshine, casual outdoor scene. Warm inviting colours. ${NO_TEXT}`,
  Super: `Clean modern flat illustration of retirement and superannuation planning. A nest egg growing over time with coins and a growth arrow. Professional blue and green. ${NO_TEXT}`,
  Business: `Clean modern flat illustration of Australian workplace and business. An office desk with documents, laptop, and a handshake. Professional grey and blue tones. ${NO_TEXT}`,
  Car: `Clean modern flat illustration of a car on an Australian road. Open highway with eucalyptus trees, fuel gauge, and blue sky. Blue and silver colours. ${NO_TEXT}`,
  Trade: `Clean modern flat illustration of construction and building trade. Tools, hardhat, tape measure, timber, and a building frame. Yellow and grey palette. ${NO_TEXT}`,
  Fun: `Fun playful flat illustration with bright cheerful colours. Whimsical cartoon elements, confetti, stars, and happy vibes. ${NO_TEXT}`
};

// Article-specific visual keywords to make each image unique
function getArticleVisualHint(article) {
  const slug = article.slug;
  const hints = {
    'how-australian-income-tax-works': 'tax return form, ATO logo shape, cascading tax brackets visualised as steps',
    'budget-50-30-20-rule': 'three jars or piggy banks splitting money into portions, percentage symbols',
    'compound-interest-power': 'snowball rolling downhill getting bigger, exponential growth curve',
    'salary-sacrifice-super-guide': 'payslip with an arrow directing money into a piggy bank',
    'salary-sacrifice-into-super': 'superannuation fund growing with salary contributions flowing in',
    'super-balance-by-age': 'bar chart showing growing nest eggs at different ages',
    'super-guarantee-12-percent': 'employer placing coins into employee super fund, 12% badge',
    'super-fund-fees-matter': 'two jars side by side, one with more money showing fee impact',
    'retirement-income-how-much': 'retired couple on a beach with a comfortable sunset scene',
    'first-home-buyer-costs-guide': 'young couple with keys standing in front of their first home',
    'stamp-duty-by-state-compared': 'map of Australia with different coloured states, property stamps',
    'car-loan-vs-savings': 'split scene: car with loan chain vs car with stack of savings',
    'credit-card-debt-payoff-strategies': 'credit cards with scissors cutting debt, freedom metaphor',
    'cutting-electricity-bills': 'lightbulb with dollar sign, power meter going down, solar panels',
    'starting-a-business-costs': 'small shop opening with an "open" sign and business plan',
    'solar-panels-worth-it-australia': 'house rooftop with solar panels under bright Australian sun',
    'help-debt-repayment-explained': 'graduation cap with HELP debt balance decreasing over time',
    'long-service-leave-by-state': 'calendar with years marked, suitcase for vacation',
    'redundancy-pay-rights-australia': 'handshake ending, severance package box, fair work scales',
    'notice-period-entitlements': 'calendar with notice period highlighted, clock counting down',
    'overtime-pay-rules-australia': 'clock showing after-hours, pay rate multiplier symbols',
    'annual-leave-loading-explained': 'beach umbrella with extra coins, holiday pay bonus concept',
    'medicare-levy-explained': 'medical cross symbol with Australian flag elements, health cover',
    'fuel-tax-credits-explained': 'fuel pump with tax credit arrows returning money to business',
    'fbt-company-car-guide': 'company car with a tax tag, fringe benefit concept',
    'division-7a-loans-explained': 'company director and company entity with loan arrow between them',
    'how-much-coffee-costs-lifetime': 'tower of coffee cups reaching high, dollar signs floating up',
    'how-much-concrete-slab': 'concrete pour in progress, slab foundation, measuring tape',
    'paint-calculator-how-much': 'paint roller on a wall, paint cans in different colours',
    'roofing-materials-guide': 'house roof cross-section showing different roofing material types',
    'decking-materials-calculator-guide': 'outdoor timber deck with different material samples',
    'fencing-cost-guide-australia': 'fence line with different panel types side by side',
    'love-calculator-science': 'two hearts with playful algorithm connection lines between them',
    'pizza-maths-fair-sharing': 'pizza cut into perfect geometric slices with fun measuring tools',
    'pregnancy-due-date-what-to-expect': 'baby calendar with trimester milestones, gentle pastel colours',
    'pet-age-human-years-myth': 'dog and cat with birthday cakes of different sizes',
    'sydney-toll-costs-commuters': 'Sydney Harbour Bridge toll gates with coins flying out of car',
    'blood-alcohol-how-it-works': 'drink glasses with declining alcohol level indicators',
  };
  return hints[slug] || '';
}

async function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '16:9' }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/imagen-4.0-fast-generate-001:predict',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            console.warn('  API error:', json.error.message?.substring(0, 100));
            resolve(null);
            return;
          }
          const predictions = json.predictions || [];
          if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
            resolve(Buffer.from(predictions[0].bytesBase64Encoded, 'base64'));
          } else {
            console.warn('  No image in response');
            resolve(null);
          }
        } catch (e) {
          console.warn('  Parse error:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', e => { console.warn('  Request error:', e.message); resolve(null); });
    req.write(body);
    req.end();
  });
}

async function processArticle(article, force) {
  const slug = article.slug;
  const webpPath = path.join(IMAGES_DIR, `${slug}.webp`);

  if (!force && fs.existsSync(webpPath)) {
    console.log(`  ✓ ${slug} — exists, skipping`);
    return true;
  }

  const category = article.category || 'Finance';
  const basePrompt = categoryPrompts[category] || categoryPrompts.Finance;
  const hint = getArticleVisualHint(article);
  const prompt = hint
    ? basePrompt.replace(NO_TEXT, `Visual focus: ${hint}. ${NO_TEXT}`)
    : basePrompt;

  console.log(`  Generating: ${slug}...`);
  const imageData = await generateImage(prompt);

  if (!imageData) {
    console.log(`  ❌ ${slug} — failed`);
    return false;
  }

  // Convert to optimised WebP
  try {
    await sharp(imageData)
      .webp({ quality: 80, effort: 6 })
      .resize({ width: 1200, withoutEnlargement: true })
      .toFile(webpPath);

    const stats = fs.statSync(webpPath);
    console.log(`  ✅ ${slug} — ${(stats.size / 1024).toFixed(0)}KB`);
    return true;
  } catch (e) {
    console.warn(`  ❌ ${slug} — sharp error: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🧮 CalculatorMate Article Image Generator v2\n');

  const slugArg = process.argv.find(a => a.startsWith('--slug='));
  const targetSlug = slugArg ? slugArg.split('=')[1] : null;
  const force = process.argv.includes('--force');

  const targets = targetSlug
    ? articles.filter(a => a.slug === targetSlug)
    : articles;

  console.log(`  Processing ${targets.length} articles${force ? ' (force regenerate)' : ''}...\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const article of targets) {
    await new Promise(r => setTimeout(r, 2000)); // Rate limit
    const success = await processArticle(article, force);
    if (success) {
      const webpPath = path.join(IMAGES_DIR, `${article.slug}.webp`);
      if (force || !fs.existsSync(webpPath)) generated++;
      else skipped++;
    } else {
      failed++;
    }
  }

  console.log(`\n  Done: ${generated} generated, ${skipped} skipped, ${failed} failed\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
