#!/usr/bin/env node
/**
 * CalculatorMate — Audience Page Image Generator
 *
 * Uses Google Gemini Imagen API to generate hero images for audience pages.
 *
 * Run: GEMINI_API_KEY=xxx node scripts/generate-audience-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('Missing GEMINI_API_KEY'); process.exit(1); }

const AUDIENCES_PATH = path.join(__dirname, '..', 'data', 'audiences.json');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'audiences');

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const audiences = JSON.parse(fs.readFileSync(AUDIENCES_PATH, 'utf8'));

const prompts = {
  'first-home-buyers': 'Clean, modern flat illustration of a young Australian couple looking at their first home. Keys handover moment. Warm blue and gold colour scheme. No text. White background. Minimal style. 16:9 aspect ratio.',
  'teenagers-young-adults': 'Clean, modern flat illustration of a young Australian adult at a desk with a laptop, managing money and budgeting. Fresh, youthful colours — teal and gold. No text. White background. Minimal style.',
  'approaching-retirement': 'Clean, modern flat illustration of an Australian couple in their 50s-60s planning retirement. Nest egg, charts, relaxed beach lifestyle in background. Warm blue and gold. No text. White background. Minimal.',
  'families': 'Clean, modern flat illustration of an Australian family with young children at a kitchen table, doing household budgeting. Warm, homey colours. No text. White background. Minimal style.',
  'small-business': 'Clean, modern flat illustration of a small business owner in an Australian shop or office, reviewing finances. Professional blue and gold. No text. White background. Minimal style.',
  'property-investors': 'Clean, modern flat illustration of Australian property investment — multiple houses, growth charts, rental income. Professional blue and green. No text. White background. Minimal.',
  'freelancers-gig-workers': 'Clean, modern flat illustration of a freelancer working from a home office or cafe in Australia, laptop open, invoices. Modern purple and gold. No text. White background. Minimal.',
  'recent-migrants': 'Clean, modern flat illustration of a diverse person arriving in Australia, with city skyline (Sydney/Melbourne), suitcase, and financial documents. Welcoming warm colours. No text. White background. Minimal.',
  'car-buyers': 'Clean, modern flat illustration of a person at an Australian car dealership, looking at cars, calculator in hand. Blue and silver colours. No text. White background. Minimal style.'
};

async function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '16:9' }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/imagen-4.0-fast-generate-001:predict`,
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

async function main() {
  console.log(`\n⚡ CalculatorMate Audience Image Generator\n`);
  console.log(`  Processing ${audiences.length} audience pages...\n`);

  let generated = 0;
  for (const aud of audiences) {
    const imagePath = path.join(IMAGES_DIR, `${aud.slug}.png`);

    if (fs.existsSync(imagePath)) {
      console.log(`  ✓ ${aud.slug} — exists, skipping`);
      generated++;
      continue;
    }

    const prompt = prompts[aud.slug] || `Clean, modern flat illustration for "${aud.title}". Australian context. Professional blue and gold colours. No text. White background. Minimal style.`;

    console.log(`  Generating: ${aud.slug}...`);
    await new Promise(r => setTimeout(r, 2000));

    const imageData = await generateImage(prompt);
    if (imageData) {
      fs.writeFileSync(imagePath, imageData);
      console.log(`  ✅ ${aud.slug} — saved (${(imageData.length / 1024).toFixed(0)}KB)`);
      generated++;
    } else {
      console.log(`  ❌ ${aud.slug} — failed`);
    }
  }

  console.log(`\n  Generated: ${generated}/${audiences.length} images`);
  console.log(`  Done.\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
