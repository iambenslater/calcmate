#!/usr/bin/env node
/**
 * AdSense OAuth2 Authorization
 *
 * Run once to authorize CalcMate to read your AdSense reporting data.
 * Stores a refresh token in data/adsense-token.json for unattended use.
 *
 * Usage: node scripts/adsense-auth.js
 *
 * Prerequisites:
 *   1. Enable "AdSense Management API" in Google Cloud Console
 *   2. Add http://localhost:8844/oauth/callback as an authorized redirect URI
 *      on the OAuth 2.0 Client in GCP Credentials
 */

const http = require('http');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load credentials from bOS master.env
const masterEnv = fs.readFileSync(
  path.resolve(__dirname, '../../../Secrets/master.env'), 'utf8'
);
function envVal(key) {
  const m = masterEnv.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

const CLIENT_ID = envVal('GOOGLE_CLIENT_ID');
const CLIENT_SECRET = envVal('GOOGLE_CLIENT_SECRET');
const REDIRECT_URI = 'http://localhost:8844/oauth/callback';
const TOKEN_PATH = path.resolve(__dirname, '../data/adsense-token.json');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in master.env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Request read-only AdSense access
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/adsense.readonly']
});

console.log('\n=== AdSense Authorization ===\n');
console.log('Opening your browser to authorize AdSense access...\n');

// Start a temporary server to catch the callback
const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth/callback')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const url = new URL(req.url, 'http://localhost:8844');
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<h1>Authorization denied</h1><p>${error}</p><p>You can close this tab.</p>`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<h1>Missing code parameter</h1>');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('Refresh token saved to data/adsense-token.json');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center;">
        <h1 style="color:#00205B;">AdSense Connected</h1>
        <p style="color:#666;">CalcMate can now pull your AdSense reporting data automatically.</p>
        <p style="color:#999;font-size:14px;">You can close this tab.</p>
      </body></html>
    `);

    server.close();
    console.log('\nDone! You can now run: node scripts/adsense-report.js\n');
    process.exit(0);
  } catch (err) {
    console.error('Token exchange failed:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h1>Token exchange failed</h1><p>${err.message}</p>`);
    server.close();
    process.exit(1);
  }
});

server.listen(8844, () => {
  console.log('Waiting for OAuth callback on http://localhost:8844/oauth/callback ...\n');

  // Open browser
  try {
    execSync(`open "${authUrl}"`);
  } catch {
    console.log('Could not open browser automatically. Visit this URL:\n');
    console.log(authUrl);
    console.log('');
  }
});
