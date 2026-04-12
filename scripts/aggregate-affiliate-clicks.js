#!/usr/bin/env node
/**
 * Aggregate affiliate-clicks.log into affiliate-stats.json
 * Run manually or via cron:
 *   node scripts/aggregate-affiliate-clicks.js
 */
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'data', 'affiliate-clicks.log');
const STATS_FILE = path.join(__dirname, '..', 'data', 'affiliate-stats.json');

function run() {
  if (!fs.existsSync(LOG_FILE)) {
    console.log('No affiliate-clicks.log found — nothing to aggregate.');
    process.exit(0);
  }

  const raw = fs.readFileSync(LOG_FILE, 'utf8').trim();
  if (!raw) {
    console.log('affiliate-clicks.log is empty — nothing to aggregate.');
    process.exit(0);
  }

  const lines = raw.split('\n');
  const byProduct = {};
  const byCalculator = {};
  const byContext = {};
  let parsed = 0;
  let errors = 0;

  lines.forEach(line => {
    if (!line.trim()) return;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (e) {
      errors++;
      return;
    }
    parsed++;

    const { product, calculator, context, timestamp } = entry;

    // byProduct
    if (product) {
      if (!byProduct[product]) byProduct[product] = { clicks: 0, lastClick: null, calculators: {} };
      byProduct[product].clicks++;
      byProduct[product].lastClick = timestamp;
      byProduct[product].calculators[calculator] = (byProduct[product].calculators[calculator] || 0) + 1;
    }

    // byCalculator
    if (calculator) {
      if (!byCalculator[calculator]) byCalculator[calculator] = { totalClicks: 0, products: {} };
      byCalculator[calculator].totalClicks++;
      if (product) {
        byCalculator[calculator].products[product] = (byCalculator[calculator].products[product] || 0) + 1;
      }
    }

    // byContext
    const ctx = context || 'unknown';
    if (!byContext[ctx]) byContext[ctx] = { totalClicks: 0, productCounts: {} };
    byContext[ctx].totalClicks++;
    if (product) {
      byContext[ctx].productCounts[product] = (byContext[ctx].productCounts[product] || 0) + 1;
    }
  });

  // Build topProducts for each context (top 10 by clicks)
  Object.keys(byContext).forEach(ctx => {
    const counts = byContext[ctx].productCounts;
    byContext[ctx].topProducts = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([p]) => p);
    delete byContext[ctx].productCounts;
  });

  const stats = {
    lastUpdated: new Date().toISOString(),
    totalClicks: parsed,
    parseErrors: errors,
    byProduct,
    byCalculator,
    byContext
  };

  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  console.log(`Aggregated ${parsed} clicks (${errors} parse errors) into ${STATS_FILE}`);
}

run();
