#!/usr/bin/env node
/**
 * AdSense Weekly Performance Report
 *
 * Pulls last 7 days of AdSense data and generates a summary.
 * Designed to run unattended (uses stored refresh token).
 *
 * Usage:
 *   node scripts/adsense-report.js              # last 7 days
 *   node scripts/adsense-report.js --days 30    # last 30 days
 *   node scripts/adsense-report.js --json       # output raw JSON
 *
 * Output: data/adsense-report-latest.json (always written)
 *         + human-readable summary to stdout
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────
const TOKEN_PATH = path.resolve(__dirname, '../data/adsense-token.json');
const REPORT_PATH = path.resolve(__dirname, '../data/adsense-report-latest.json');

const masterEnv = fs.readFileSync(
  path.resolve(__dirname, '../../../Secrets/master.env'), 'utf8'
);
function envVal(key) {
  const m = masterEnv.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

const CLIENT_ID = envVal('GOOGLE_CLIENT_ID');
const CLIENT_SECRET = envVal('GOOGLE_CLIENT_SECRET');

// ── Args ────────────────────────────────────────────────
const args = process.argv.slice(2);
const daysIdx = args.indexOf('--days');
const days = daysIdx >= 0 ? parseInt(args[daysIdx + 1], 10) || 7 : 7;
const jsonOnly = args.includes('--json');

// ── Dates ───────────────────────────────────────────────
function dateStr(d) {
  return d.toISOString().split('T')[0];
}
const endDate = new Date();
const startDate = new Date();
startDate.setDate(endDate.getDate() - days);

// ── Auth ────────────────────────────────────────────────
if (!fs.existsSync(TOKEN_PATH)) {
  console.error('No AdSense token found. Run: node scripts/adsense-auth.js');
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
oauth2Client.setCredentials(tokens);

// Refresh token if expired and save back
oauth2Client.on('tokens', (newTokens) => {
  const merged = { ...tokens, ...newTokens };
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
});

const adsense = google.adsense({ version: 'v2', auth: oauth2Client });

// ── Main ────────────────────────────────────────────────
async function main() {
  // 1. Find the AdSense account
  const accountsRes = await adsense.accounts.list();
  const accounts = accountsRes.data.accounts || [];
  if (!accounts.length) {
    console.error('No AdSense accounts found for this Google account.');
    process.exit(1);
  }
  const account = accounts[0];
  const accountId = account.name; // e.g. "accounts/pub-8414007005923504"

  console.log(`\n=== AdSense Report: ${dateStr(startDate)} → ${dateStr(endDate)} (${days} days) ===\n`);
  console.log(`Account: ${account.displayName || accountId}\n`);

  // 2. Overall summary
  const summaryRes = await adsense.accounts.reports.generate({
    account: accountId,
    'dateRange': 'CUSTOM',
    'startDate.year': startDate.getFullYear(),
    'startDate.month': startDate.getMonth() + 1,
    'startDate.day': startDate.getDate(),
    'endDate.year': endDate.getFullYear(),
    'endDate.month': endDate.getMonth() + 1,
    'endDate.day': endDate.getDate(),
    metrics: [
      'PAGE_VIEWS',
      'AD_REQUESTS',
      'MATCHED_AD_REQUESTS',
      'INDIVIDUAL_AD_IMPRESSIONS',
      'CLICKS',
      'ESTIMATED_EARNINGS',
      'PAGE_VIEWS_RPM',
      'AD_REQUESTS_CTR'
    ]
  });

  // 3. By ad unit
  const byUnitRes = await adsense.accounts.reports.generate({
    account: accountId,
    'dateRange': 'CUSTOM',
    'startDate.year': startDate.getFullYear(),
    'startDate.month': startDate.getMonth() + 1,
    'startDate.day': startDate.getDate(),
    'endDate.year': endDate.getFullYear(),
    'endDate.month': endDate.getMonth() + 1,
    'endDate.day': endDate.getDate(),
    dimensions: ['AD_UNIT_NAME'],
    metrics: [
      'AD_REQUESTS',
      'INDIVIDUAL_AD_IMPRESSIONS',
      'CLICKS',
      'ESTIMATED_EARNINGS',
      'AD_REQUESTS_CTR'
    ],
    orderBy: ['+ESTIMATED_EARNINGS']
  });

  // 4. By page (URL)
  const byPageRes = await adsense.accounts.reports.generate({
    account: accountId,
    'dateRange': 'CUSTOM',
    'startDate.year': startDate.getFullYear(),
    'startDate.month': startDate.getMonth() + 1,
    'startDate.day': startDate.getDate(),
    'endDate.year': endDate.getFullYear(),
    'endDate.month': endDate.getMonth() + 1,
    'endDate.day': endDate.getDate(),
    dimensions: ['URL_CHANNEL_NAME'],
    metrics: [
      'PAGE_VIEWS',
      'INDIVIDUAL_AD_IMPRESSIONS',
      'CLICKS',
      'ESTIMATED_EARNINGS',
      'PAGE_VIEWS_RPM'
    ],
    orderBy: ['+ESTIMATED_EARNINGS']
  });

  // 5. Daily trend
  const dailyRes = await adsense.accounts.reports.generate({
    account: accountId,
    'dateRange': 'CUSTOM',
    'startDate.year': startDate.getFullYear(),
    'startDate.month': startDate.getMonth() + 1,
    'startDate.day': startDate.getDate(),
    'endDate.year': endDate.getFullYear(),
    'endDate.month': endDate.getMonth() + 1,
    'endDate.day': endDate.getDate(),
    dimensions: ['DATE'],
    metrics: [
      'PAGE_VIEWS',
      'CLICKS',
      'ESTIMATED_EARNINGS'
    ],
    orderBy: ['+DATE']
  });

  // ── Parse results ──────────────────────────────────────
  function parseReport(res) {
    const headers = (res.data.headers || []).map(h => h.name || h.type);
    const rows = (res.data.rows || []).map(row => {
      const cells = row.cells || [];
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = cells[i] ? cells[i].value : '';
      });
      return obj;
    });
    return { headers, rows, totals: res.data.totalMatchedRows || '0' };
  }

  const summary = parseReport(summaryRes);
  const byUnit = parseReport(byUnitRes);
  const byPage = parseReport(byPageRes);
  const daily = parseReport(dailyRes);

  // ── Build report object ────────────────────────────────
  const report = {
    generated: new Date().toISOString(),
    period: { start: dateStr(startDate), end: dateStr(endDate), days },
    summary: summary.rows[0] || {},
    byAdUnit: byUnit.rows,
    byPage: byPage.rows.slice(0, 20), // top 20 pages
    daily: daily.rows
  };

  // Save JSON
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // ── Human-readable output ──────────────────────────────
  const s = report.summary;
  console.log('── Overall Summary ──');
  console.log(`  Page Views:     ${fmtNum(s.PAGE_VIEWS)}`);
  console.log(`  Ad Impressions: ${fmtNum(s.INDIVIDUAL_AD_IMPRESSIONS)}`);
  console.log(`  Clicks:         ${fmtNum(s.CLICKS)}`);
  console.log(`  CTR:            ${s.AD_REQUESTS_CTR || '0'}%`);
  console.log(`  Earnings:       $${fmtMoney(s.ESTIMATED_EARNINGS)}`);
  console.log(`  Page RPM:       $${fmtMoney(s.PAGE_VIEWS_RPM)}`);

  if (report.byAdUnit.length) {
    console.log('\n── By Ad Unit ──');
    report.byAdUnit.forEach(u => {
      console.log(`  ${(u.AD_UNIT_NAME || 'Unknown').padEnd(35)} | Impr: ${fmtNum(u.INDIVIDUAL_AD_IMPRESSIONS).padStart(7)} | Clicks: ${fmtNum(u.CLICKS).padStart(5)} | CTR: ${(u.AD_REQUESTS_CTR || '0').padStart(5)}% | $${fmtMoney(u.ESTIMATED_EARNINGS)}`);
    });
  }

  if (report.byPage.length) {
    console.log('\n── Top Pages ──');
    report.byPage.slice(0, 10).forEach(p => {
      const url = p.URL_CHANNEL_NAME || 'Unknown';
      console.log(`  ${url.padEnd(50)} | Views: ${fmtNum(p.PAGE_VIEWS).padStart(7)} | $${fmtMoney(p.ESTIMATED_EARNINGS)}`);
    });
  }

  if (report.daily.length) {
    console.log('\n── Daily Trend ──');
    report.daily.forEach(d => {
      const bar = '█'.repeat(Math.max(1, Math.round(parseFloat(d.ESTIMATED_EARNINGS || 0) * 20)));
      console.log(`  ${d.DATE} | Views: ${fmtNum(d.PAGE_VIEWS).padStart(7)} | $${fmtMoney(d.ESTIMATED_EARNINGS).padStart(6)} ${bar}`);
    });
  }

  console.log(`\nFull report saved to: data/adsense-report-latest.json\n`);
}

function fmtNum(v) { return parseInt(v || 0, 10).toLocaleString(); }
function fmtMoney(v) { return parseFloat(v || 0).toFixed(2); }

main().catch(err => {
  if (err.code === 401 || err.message?.includes('invalid_grant')) {
    console.error('Token expired or revoked. Re-run: node scripts/adsense-auth.js');
  } else {
    console.error('Error:', err.message || err);
  }
  process.exit(1);
});
