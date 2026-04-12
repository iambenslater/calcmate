#!/usr/bin/env node
/**
 * CalculatorMate — Article Image Generator
 *
 * Uses Google Gemini Imagen API to generate contextual images for articles.
 * Each article gets 1-2 images with calculator-linked captions.
 *
 * Run: GEMINI_API_KEY=xxx node scripts/generate-article-images.js
 * Or: node scripts/generate-article-images.js --slug=compound-interest-power
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('Missing GEMINI_API_KEY'); process.exit(1); }

const ARTICLES_PATH = path.join(__dirname, '..', 'data', 'articles.json');
const CALCS_PATH = path.join(__dirname, '..', 'data', 'calculators.json');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'articles');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));
const calcs = JSON.parse(fs.readFileSync(CALCS_PATH, 'utf8'));
const calcBySlug = {};
calcs.forEach(c => { calcBySlug[c.slug] = c; });

// Image prompt templates per category
const imagePrompts = {
  Finance: (title) => `Clean, modern flat illustration for a finance article titled "${title}". Australian context. Show money, charts, or financial planning elements. Professional blue and gold colour scheme. No text on the image. White background. Minimal style.`,
  Property: (title) => `Clean, modern flat illustration for an Australian property article titled "${title}". Show houses, property documents, or home buying elements. Professional blue and warm colour scheme. No text. White background. Minimal.`,
  Health: (title) => `Clean, modern flat illustration for a health article titled "${title}". Show health, wellness, or fitness elements. Fresh green and blue colour scheme. No text. White background. Minimal style.`,
  Lifestyle: (title) => `Clean, modern flat illustration for a lifestyle article titled "${title}". Australian context. Warm, inviting colours. No text. White background. Minimal flat style.`,
  Super: (title) => `Clean, modern flat illustration for an Australian superannuation article titled "${title}". Show retirement planning, nest egg, or growth chart. Professional blue and green colours. No text. White background. Minimal.`,
  Business: (title) => `Clean, modern flat illustration for a business article titled "${title}". Australian workplace context. Show office, work, or business elements. Professional grey and blue. No text. White background. Minimal.`,
  Car: (title) => `Clean, modern flat illustration for an Australian car and driving article titled "${title}". Show vehicles, roads, or driving elements. Blue and silver colours. No text. White background. Minimal.`,
  Trade: (title) => `Clean, modern flat illustration for a construction and trade article titled "${title}". Show tools, building materials, or construction. Yellow and grey colours. No text. White background. Minimal.`,
  Fun: (title) => `Fun, playful flat illustration for an article titled "${title}". Bright, cheerful colours. No text. White background. Minimal cartoon style.`
};

async function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{
        parts: [{ text: `Generate an image: ${prompt}` }]
      }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT']
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const parts = json.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find(p => p.inlineData);
          if (imagePart) {
            resolve(Buffer.from(imagePart.inlineData.data, 'base64'));
          } else {
            console.warn('  No image in response:', JSON.stringify(json).substring(0, 200));
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

async function processArticle(article) {
  const slug = article.slug;
  const imagePath = path.join(IMAGES_DIR, `${slug}.png`);

  // Skip if image already exists
  if (fs.existsSync(imagePath)) {
    console.log(`  ✓ ${slug} — image exists, skipping`);
    return true;
  }

  const category = article.category || 'Finance';
  const promptFn = imagePrompts[category] || imagePrompts.Finance;
  const prompt = promptFn(article.title);

  console.log(`  Generating: ${slug}...`);
  const imageData = await generateImage(prompt);

  if (imageData) {
    fs.writeFileSync(imagePath, imageData);
    console.log(`  ✅ ${slug} — saved (${(imageData.length / 1024).toFixed(0)}KB)`);
    return true;
  } else {
    console.log(`  ❌ ${slug} — failed to generate`);
    return false;
  }
}

// Build image HTML block for an article
function buildImageHtml(article) {
  const slug = article.slug;
  const relatedCalcs = (article.relatedCalculators || []).map(s => calcBySlug[s]).filter(Boolean);
  const primaryCalc = relatedCalcs[0];

  let caption = article.title;
  let captionLink = '';
  if (primaryCalc) {
    captionLink = `<a href="/${primaryCalc.category}/${primaryCalc.slug}" class="text-navy font-medium underline hover:text-gold">${primaryCalc.title} →</a>`;
    caption = `${article.excerpt.split('.')[0]}. ${captionLink}`;
  }

  return `<figure class="my-6 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
  <img src="/images/articles/${slug}.png" alt="${article.title}" class="w-full h-auto" loading="lazy">
  <figcaption class="px-4 py-3 bg-gray-50 text-sm text-gray-600">${caption}</figcaption>
</figure>`;
}

async function main() {
  console.log(`\n⚡ CalculatorMate Article Image Generator\n`);

  // Check for --slug flag
  const slugArg = process.argv.find(a => a.startsWith('--slug='));
  const targetSlug = slugArg ? slugArg.split('=')[1] : null;

  const targets = targetSlug
    ? articles.filter(a => a.slug === targetSlug)
    : articles;

  console.log(`  Processing ${targets.length} articles...\n`);

  let generated = 0;
  for (const article of targets) {
    // Rate limit: 1 request per 2 seconds for Gemini
    await new Promise(r => setTimeout(r, 2000));
    const success = await processArticle(article);
    if (success) generated++;
  }

  // Now inject image HTML into article content
  console.log('\n  Injecting images into articles...');
  let injected = 0;

  articles.forEach(article => {
    const imagePath = path.join(IMAGES_DIR, `${article.slug}.png`);
    if (!fs.existsSync(imagePath)) return;

    // Don't inject if already has an image
    if (article.content && article.content.includes(`/images/articles/${article.slug}.png`)) return;

    const imageHtml = buildImageHtml(article);

    // Insert image after the first H2 or after the first paragraph
    if (article.content) {
      const firstH2 = article.content.indexOf('</h2>');
      const firstP = article.content.indexOf('</p>');
      const insertPoint = firstH2 > -1 ? firstH2 + 5 : (firstP > -1 ? firstP + 4 : 0);

      if (insertPoint > 0) {
        article.content = article.content.substring(0, insertPoint) + '\n' + imageHtml + '\n' + article.content.substring(insertPoint);
        injected++;
      }
    }
  });

  // Save updated articles
  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2));
  console.log(`\n  Generated: ${generated} images`);
  console.log(`  Injected: ${injected} image blocks into articles`);
  console.log(`  Done.\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
