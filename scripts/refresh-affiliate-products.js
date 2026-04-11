#!/usr/bin/env node
/**
 * CalculatorMate — Amazon Affiliate Product Refresher
 *
 * Queries Amazon Product Advertising API 5.0 for contextual products
 * matching each calculator's affiliate category. Saves results to
 * data/affiliate-products.json for the server to render.
 *
 * Run: node scripts/refresh-affiliate-products.js
 * Schedule: Weekly via cron or PM2
 *
 * Requires env vars:
 *   AMAZON_ACCESS_KEY    — PA-API access key
 *   AMAZON_SECRET_KEY    — PA-API secret key
 *   AMAZON_PARTNER_TAG   — Associates tag (benslater-22)
 */

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || 'benslater-22';
const HOST = 'webservices.amazon.com.au';
const REGION = 'us-west-2'; // AU PA-API uses us-west-2

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('Missing AMAZON_ACCESS_KEY or AMAZON_SECRET_KEY env vars');
  process.exit(1);
}

// Product search queries per affiliate context — prioritises high-commission categories
const SEARCH_QUERIES = {
  budgeting: [
    { keywords: 'budget planner notebook', category: 'OfficeProducts', maxPrice: 3000 },
    { keywords: 'financial calculator', category: 'OfficeProducts', maxPrice: 5000 },
    { keywords: 'money management book australia', category: 'Books', maxPrice: 4000 }
  ],
  'tax-software': [
    { keywords: 'document organiser folder tax', category: 'OfficeProducts', maxPrice: 4000 },
    { keywords: 'receipt scanner portable', category: 'Electronics', maxPrice: 15000 },
    { keywords: 'tax deduction guide australia', category: 'Books', maxPrice: 4000 }
  ],
  'health-insurance': [
    { keywords: 'blood pressure monitor digital', category: 'HealthPersonalCare', maxPrice: 10000 },
    { keywords: 'health journal planner', category: 'OfficeProducts', maxPrice: 3000 }
  ],
  'office-furniture': [
    { keywords: 'ergonomic office chair mesh', category: 'Furniture', maxPrice: 50000 },
    { keywords: 'standing desk electric', category: 'Furniture', maxPrice: 80000 },
    { keywords: 'desk organiser set', category: 'OfficeProducts', maxPrice: 5000 }
  ],
  education: [
    { keywords: 'scientific calculator casio', category: 'OfficeProducts', maxPrice: 8000 },
    { keywords: 'study planner notebook', category: 'OfficeProducts', maxPrice: 3000 }
  ],
  'finance-books': [
    { keywords: 'barefoot investor', category: 'Books', maxPrice: 4000 },
    { keywords: 'investing beginners australia', category: 'Books', maxPrice: 4000 },
    { keywords: 'property investment book australia', category: 'Books', maxPrice: 5000 }
  ],
  savings: [
    { keywords: 'savings challenge book', category: 'Books', maxPrice: 3000 },
    { keywords: 'cash envelope wallet budget', category: 'OfficeProducts', maxPrice: 3000 }
  ],
  'home-tools': [
    { keywords: 'laser tape measure digital', category: 'HomeImprovement', maxPrice: 8000 },
    { keywords: 'home tool kit starter', category: 'HomeImprovement', maxPrice: 10000 },
    { keywords: 'first home buyer book australia', category: 'Books', maxPrice: 4000 }
  ],
  fitness: [
    { keywords: 'body composition scale bluetooth', category: 'HealthPersonalCare', maxPrice: 8000 },
    { keywords: 'fitness tracker smart watch', category: 'Electronics', maxPrice: 15000 },
    { keywords: 'resistance bands set exercise', category: 'SportingGoods', maxPrice: 4000 }
  ],
  baby: [
    { keywords: 'pregnancy journal book', category: 'Books', maxPrice: 4000 },
    { keywords: 'baby monitor camera wifi', category: 'Electronics', maxPrice: 20000 },
    { keywords: 'nappy bag backpack', category: 'Baby', maxPrice: 10000 }
  ],
  general: [
    { keywords: 'calculator desktop large display', category: 'OfficeProducts', maxPrice: 3000 },
    { keywords: 'notebook journal premium', category: 'OfficeProducts', maxPrice: 3000 }
  ],
  'car-accessories': [
    { keywords: 'dash cam 4k front rear car', category: 'Electronics', maxPrice: 20000 },
    { keywords: 'car phone mount magnetic', category: 'Electronics', maxPrice: 5000 },
    { keywords: 'tyre inflator portable car 12v', category: 'Automotive', maxPrice: 10000 }
  ],
  travel: [
    { keywords: 'travel adapter universal', category: 'Electronics', maxPrice: 3000 },
    { keywords: 'packing cubes set luggage', category: 'Luggage', maxPrice: 4000 },
    { keywords: 'noise cancelling headphones', category: 'Electronics', maxPrice: 30000 }
  ],
  'office-supplies': [
    { keywords: 'desk calculator large display', category: 'OfficeProducts', maxPrice: 3000 },
    { keywords: 'planner diary 2026', category: 'OfficeProducts', maxPrice: 3000 },
    { keywords: 'whiteboard magnetic desktop', category: 'OfficeProducts', maxPrice: 5000 }
  ],
  kitchen: [
    { keywords: 'digital kitchen scale grams', category: 'Kitchen', maxPrice: 5000 },
    { keywords: 'measuring cups stainless steel set', category: 'Kitchen', maxPrice: 3000 },
    { keywords: 'kitchen timer digital magnetic', category: 'Kitchen', maxPrice: 2000 }
  ],
  'business-books': [
    { keywords: 'small business book australia', category: 'Books', maxPrice: 5000 },
    { keywords: 'business planner notebook', category: 'OfficeProducts', maxPrice: 4000 },
    { keywords: 'accounting ledger book', category: 'OfficeProducts', maxPrice: 3000 }
  ],
  'home-appliances': [
    { keywords: 'smart power meter plug wifi', category: 'HomeImprovement', maxPrice: 5000 },
    { keywords: 'led light bulb pack warm white', category: 'HomeImprovement', maxPrice: 3000 },
    { keywords: 'water saving shower head', category: 'HomeImprovement', maxPrice: 5000 }
  ],
  'trade-tools': [
    { keywords: 'laser level green beam', category: 'HomeImprovement', maxPrice: 15000 },
    { keywords: 'tool belt leather tradesman', category: 'HomeImprovement', maxPrice: 8000 },
    { keywords: 'work boots steel cap safety', category: 'Shoes', maxPrice: 15000 }
  ],
  health: [
    { keywords: 'personal breathalyser digital', category: 'HealthPersonalCare', maxPrice: 10000 },
    { keywords: 'first aid kit comprehensive', category: 'HealthPersonalCare', maxPrice: 5000 }
  ],
  pet: [
    { keywords: 'dog toys interactive puzzle', category: 'PetSupplies', maxPrice: 4000 },
    { keywords: 'pet grooming kit professional', category: 'PetSupplies', maxPrice: 5000 }
  ],
  fashion: [
    { keywords: 'body tape measure sewing retractable', category: 'OfficeProducts', maxPrice: 1500 },
    { keywords: 'shoe stretcher adjustable', category: 'Shoes', maxPrice: 3000 }
  ]
};

// Amazon commission tiers (approximate AU rates)
const COMMISSION_TIERS = {
  Furniture: 8, HomeImprovement: 8, Kitchen: 8, Luggage: 8,
  Baby: 6, SportingGoods: 6, PetSupplies: 6, Toys: 6,
  Books: 4.5, Electronics: 4, OfficeProducts: 4,
  Automotive: 4, HealthPersonalCare: 4.5, Shoes: 7,
  default: 4
};

// --- AWS Signature V4 for PA-API ---

function sha256(data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest();
}

function hmacSha256(key, data) {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function getSignatureKey(key, dateStamp, region, service) {
  const kDate = hmacSha256('AWS4' + key, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, 'aws4_request');
}

async function searchProducts(keywords, searchIndex) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substr(0, 8);
  const service = 'ProductAdvertisingAPI';

  const payload = JSON.stringify({
    Keywords: keywords,
    SearchIndex: searchIndex || 'All',
    PartnerTag: PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com.au',
    Resources: [
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Type',
      'Offers.Listings.DeliveryInfo.IsPrimeEligible',
      'Images.Primary.Medium',
      'BrowseNodeInfo.BrowseNodes',
      'CustomerReviews.StarRating'
    ],
    ItemCount: 5,
    SortBy: 'Relevance'
  });

  const canonicalUri = '/paapi5/searchitems';
  const canonicalQueryString = '';
  const headers = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    'host': HOST,
    'x-amz-date': amzDate,
    'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
  };

  const signedHeaders = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.keys(headers).sort().map(k => k + ':' + headers[k]).join('\n') + '\n';
  const payloadHash = sha256(payload).toString('hex');

  const canonicalRequest = [
    'POST', canonicalUri, canonicalQueryString,
    canonicalHeaders, signedHeaders, payloadHash
  ].join('\n');

  const credentialScope = `${dateStamp}/${REGION}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, credentialScope,
    sha256(canonicalRequest).toString('hex')
  ].join('\n');

  const signingKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, service);
  const signature = hmacSha256(signingKey, stringToSign).toString('hex');

  const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      path: canonicalUri,
      method: 'POST',
      headers: { ...headers, 'Authorization': authHeader }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.Errors) {
            console.warn(`  API error for "${keywords}": ${json.Errors[0]?.Message || 'Unknown'}`);
            resolve([]);
            return;
          }
          const items = (json.SearchResult?.Items || []).map(item => ({
            asin: item.ASIN,
            title: item.ItemInfo?.Title?.DisplayValue || '',
            url: item.DetailPageURL,
            price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || null,
            priceValue: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
            inStock: item.Offers?.Listings?.[0]?.Availability?.Type === 'Now',
            isPrime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false,
            imageUrl: item.Images?.Primary?.Medium?.URL || null,
            rating: item.CustomerReviews?.StarRating?.Value || null,
            category: searchIndex
          }));
          resolve(items);
        } catch (e) {
          console.warn(`  Parse error for "${keywords}": ${e.message}`);
          resolve([]);
        }
      });
    });

    req.on('error', e => { console.warn(`  Request error: ${e.message}`); resolve([]); });
    req.write(payload);
    req.end();
  });
}

// --- Main ---

async function refreshProducts() {
  console.log(`\n⚡ CalculatorMate Affiliate Product Refresh`);
  console.log(`  Tag: ${PARTNER_TAG}`);
  console.log(`  Time: ${new Date().toISOString()}\n`);

  const results = {};
  const contexts = Object.keys(SEARCH_QUERIES);
  let totalProducts = 0;
  let totalContexts = 0;

  for (const context of contexts) {
    const queries = SEARCH_QUERIES[context];
    const contextProducts = [];

    for (const q of queries) {
      // Rate limit: PA-API allows 1 req/sec
      await new Promise(r => setTimeout(r, 1100));

      console.log(`  Searching: "${q.keywords}" in ${q.category}...`);
      const items = await searchProducts(q.keywords, q.category);

      // Filter: in stock, has price, 4+ stars preferred
      const filtered = items
        .filter(item => item.inStock && item.price && item.title)
        .filter(item => !q.maxPrice || item.priceValue <= q.maxPrice)
        .sort((a, b) => {
          // Prefer: Prime > high rating > reasonable price
          if (a.isPrime !== b.isPrime) return b.isPrime ? 1 : -1;
          if (a.rating !== b.rating) return (b.rating || 0) - (a.rating || 0);
          return a.priceValue - b.priceValue;
        })
        .slice(0, 2);

      filtered.forEach(item => {
        item.commissionTier = COMMISSION_TIERS[q.category] || COMMISSION_TIERS.default;
        item.searchKeywords = q.keywords;
      });

      contextProducts.push(...filtered);
    }

    // Deduplicate by ASIN, keep top 3 per context
    const seen = new Set();
    const unique = contextProducts.filter(p => {
      if (seen.has(p.asin)) return false;
      seen.add(p.asin);
      return true;
    }).slice(0, 3);

    if (unique.length > 0) {
      results[context] = unique;
      totalProducts += unique.length;
      totalContexts++;
      console.log(`  ✅ ${context}: ${unique.length} products\n`);
    } else {
      console.log(`  ⚠️  ${context}: no products found\n`);
    }
  }

  // Save results
  const output = {
    lastUpdated: new Date().toISOString(),
    partnerTag: PARTNER_TAG,
    totalProducts,
    totalContexts,
    products: results
  };

  const outPath = path.join(__dirname, '..', 'data', 'affiliate-products.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n📦 Saved ${totalProducts} products across ${totalContexts} contexts to ${outPath}`);
  console.log(`   Run took ${((Date.now() - startTime) / 1000).toFixed(0)}s\n`);
}

const startTime = Date.now();
refreshProducts().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
