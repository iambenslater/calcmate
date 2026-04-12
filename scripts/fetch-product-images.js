#!/usr/bin/env node
/**
 * Fetch Amazon AU product images for all ASINs in affiliate-products.json
 * Extracts the main product image URL from each product page
 * Updates affiliate-products.json with an `image` field per product
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'affiliate-products.json');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Collect all unique ASINs
const allProducts = [];
const seenAsins = new Set();
for (const [ctx, products] of Object.entries(data.products)) {
  for (const p of products) {
    if (p.asin && !seenAsins.has(p.asin)) {
      seenAsins.add(p.asin);
      allProducts.push(p);
    }
  }
}

console.log(`Found ${allProducts.length} unique ASINs to fetch images for`);

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-AU,en;q=0.9',
        'Accept-Encoding': 'identity'  // No compression so we get plain text
      }
    };
    https.get(url, options, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extractImageUrl(html) {
  // Try multiple patterns to find the main product image

  // Pattern 1: data-a-dynamic-image attribute (most reliable)
  const dynamicMatch = html.match(/data-a-dynamic-image="\{&quot;(https:\/\/m\.media-amazon\.com\/images\/I\/[^&]+)/);
  if (dynamicMatch) return dynamicMatch[1];

  // Pattern 2: "large" image in image data JSON
  const largeMatch = html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  if (largeMatch) return largeMatch[1];

  // Pattern 3: hiRes image
  const hiResMatch = html.match(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  if (hiResMatch) return hiResMatch[1];

  // Pattern 4: main image in colorImages
  const colorMatch = html.match(/"mainUrl":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  if (colorMatch) return colorMatch[1];

  // Pattern 5: og:image meta tag
  const ogMatch = html.match(/property="og:image"[^>]*content="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  if (ogMatch) return ogMatch[1];

  // Pattern 6: any media-amazon image URL
  const anyMatch = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+_.-]+\._[^"'\s]+\.jpg/);
  if (anyMatch) return anyMatch[0];

  return null;
}

// Normalise image URL to a consistent 200px size for thumbnails
function normalizeImageUrl(url) {
  if (!url) return null;
  // Replace any existing size suffix with _SL200_
  // Amazon image URLs have format: ...ImageId._XX123_.jpg
  return url.replace(/\._[^.]+_\./, '._SL200_.');
}

async function main() {
  const imageMap = {};

  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    const url = `https://www.amazon.com.au/dp/${p.asin}`;
    console.log(`[${i + 1}/${allProducts.length}] Fetching ${p.asin} (${p.title.slice(0, 40)}...)...`);

    try {
      const html = await fetchPage(url);
      const imgUrl = extractImageUrl(html);
      if (imgUrl) {
        const normalized = normalizeImageUrl(imgUrl);
        imageMap[p.asin] = normalized;
        console.log(`  ✓ Found image: ${normalized.slice(-50)}`);
      } else {
        console.log(`  ✗ No image found (page length: ${html.length})`);
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
    }

    // Rate limit: 1.5s between requests
    if (i < allProducts.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Update all products with image URLs
  let updated = 0;
  for (const [ctx, products] of Object.entries(data.products)) {
    for (const p of products) {
      if (imageMap[p.asin]) {
        p.image = imageMap[p.asin];
        updated++;
      }
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
  console.log(`\nDone! Updated ${updated} product entries with images.`);
  console.log(`Image map:`, JSON.stringify(imageMap, null, 2));
}

main().catch(console.error);
