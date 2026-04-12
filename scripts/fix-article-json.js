#!/usr/bin/env node
/**
 * Fixes broken article JSON files that have unescaped double quotes
 * inside HTML content strings.
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const broken = ['articles-batch-01.json', 'articles-batch-06.json', 'articles-batch-08.json', 'articles-batch-09.json'];

let totalRecovered = 0;

broken.forEach(filename => {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) { console.log(filename + ': not found'); return; }

  const raw = fs.readFileSync(filepath, 'utf8');

  // First try: maybe it's already valid
  try {
    const data = JSON.parse(raw);
    console.log(filename + ': already valid (' + data.length + ' articles)');
    totalRecovered += data.length;
    return;
  } catch (e) {
    // Need to fix
  }

  // Strategy: replace unescaped quotes inside JSON string values with &quot;
  // Walk through char by char tracking whether we're inside a JSON string
  let result = '';
  let inString = false;
  let prevChar = '';

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (prevChar === '\\') {
      // This char is escaped, just add it
      result += ch;
      prevChar = ch;
      continue;
    }

    if (ch === '"') {
      if (!inString) {
        // Opening a string
        inString = true;
        result += ch;
      } else {
        // Either closing the string or an unescaped internal quote
        // Look ahead to see what follows (skipping whitespace)
        let j = i + 1;
        while (j < raw.length && (raw[j] === ' ' || raw[j] === '\t' || raw[j] === '\n' || raw[j] === '\r')) j++;
        const next = raw[j];

        if (next === ',' || next === '}' || next === ']' || next === ':' || next === undefined) {
          // Closing quote
          inString = false;
          result += ch;
        } else {
          // Unescaped internal quote — replace with HTML entity
          result += '&quot;';
        }
      }
    } else {
      result += ch;
    }

    prevChar = ch;
  }

  try {
    const data = JSON.parse(result);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(filename + ': FIXED (' + data.length + ' articles)');
    totalRecovered += data.length;
  } catch (e) {
    // Show where it's still broken
    const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || 0);
    console.log(filename + ': still broken at pos ' + pos);
    if (pos > 0) {
      console.log('  Context: ...' + result.substring(pos - 40, pos) + ' >>> ' + result.substring(pos, pos + 40) + '...');
    }
  }
});

console.log('\nTotal recovered: ' + totalRecovered + ' articles');
