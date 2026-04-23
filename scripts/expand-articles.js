#!/usr/bin/env node
/**
 * Expand thin articles to 1500+ words by appending substantive new sections.
 * The existing content stays untouched — we only APPEND new, non-duplicative sections.
 *
 * Usage:
 *   node scripts/expand-articles.js --count=20
 *   node scripts/expand-articles.js --slug=paint-calculator-how-much
 *   node scripts/expand-articles.js --all  (any article under 1500w)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk').default;

const DATA_PATH = path.join(__dirname, '..', 'data', 'articles.json');
const MODEL = 'claude-sonnet-4-5';
const TARGET_WORDS = 1500;

function loadApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const masterEnv = fs.readFileSync(path.resolve(process.env.HOME, 'Library/CloudStorage/GoogleDrive-ben@benslater.me/My Drive/bOS/Root/Secrets/master.env'), 'utf8');
    const match = masterEnv.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {}
  throw new Error('No ANTHROPIC_API_KEY found');
}
const client = new Anthropic({ apiKey: loadApiKey() });

function wordCount(str) { return (str || '').replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length; }

function buildPrompt(article) {
  const current = wordCount(article.content);
  const gap = Math.max(TARGET_WORDS - current, 500);
  return `You are expanding an existing Australian article with 2-4 NEW sections appended to the end. The existing article MUST NOT be modified or duplicated — only append new material.

ARTICLE TITLE: ${article.title}
CATEGORY: ${article.category}
CURRENT WORD COUNT: ${current} words
TARGET: add approximately ${gap} NEW words

EXISTING CONTENT (for context — do not duplicate these points):
${article.content}

Your task: write 2-4 new HTML sections that add genuine depth to this article. Each section should cover something the existing article does NOT already cover. Options include (pick what's most useful for THIS article):

- A worked example with real Australian numbers and a named person
- State-by-state variations (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)
- Common mistakes and how to avoid them
- Edge cases and tricky scenarios
- Recent policy or rate changes (2024–2026)
- How this compares to similar/related topics
- Industry-specific or life-stage-specific nuances
- When the standard advice does NOT apply
- ATO/Fair Work/Services Australia rules that matter

RULES:
- Australian English (colour, organisation, superannuation). Current rates (2025-26 ATO). Accurate or hedged.
- Plain confident voice. Short paragraphs. No marketing fluff, no "dive deep", no "in today's world".
- No em-dashes (use hyphens or commas).
- Use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a>. No wrapper div, no markdown, no code fences.
- Each section starts with <h2>. Be specific. Use real numbers, real rules, real place names.
- Total output: ${gap}+ words of new HTML.
- Output ONLY the new HTML sections. No preamble, no explanation, no fences.`;
}

async function expandArticle(article) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 6000,
    messages: [{ role: 'user', content: buildPrompt(article) }]
  });
  let newHtml = response.content[0].text.trim();
  newHtml = newHtml.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '');
  return newHtml;
}

async function main() {
  const args = process.argv.slice(2);
  const singleSlug = args.find(a => a.startsWith('--slug='))?.split('=')[1];
  const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '20');
  const all = args.includes('--all');

  const articles = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  let targets;
  if (singleSlug) {
    targets = articles.filter(a => a.slug === singleSlug);
  } else if (all) {
    targets = articles.filter(a => wordCount(a.content) < TARGET_WORDS && !a.expanded);
  } else {
    targets = articles
      .filter(a => wordCount(a.content) < TARGET_WORDS && !a.expanded)
      .sort((x, y) => wordCount(x.content) - wordCount(y.content))
      .slice(0, count);
  }

  console.log(`Expanding ${targets.length} article(s)`);
  if (!targets.length) return;

  const CONCURRENCY = 4;
  let completed = 0;
  const errors = [];

  async function worker(queue) {
    while (queue.length) {
      const article = queue.shift();
      try {
        const before = wordCount(article.content);
        const newHtml = await expandArticle(article);
        const combined = article.content + '\n\n' + newHtml;
        const idx = articles.findIndex(a => a.slug === article.slug);
        articles[idx] = { ...articles[idx], content: combined, expanded: true, expandedAt: new Date().toISOString() };
        const after = wordCount(combined);
        completed++;
        console.log(`  [${completed}/${targets.length}] ${article.slug}: ${before}w → ${after}w (+${after-before})`);
        fs.writeFileSync(DATA_PATH, JSON.stringify(articles, null, 2));
      } catch (err) {
        console.error(`  FAIL ${article.slug}: ${err.message}`);
        errors.push({ slug: article.slug, error: err.message });
      }
    }
  }

  const queue = [...targets];
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

  console.log(`Done. Success: ${completed}, Errors: ${errors.length}`);
  if (errors.length) console.log(errors);
}

main().catch(err => { console.error(err); process.exit(1); });
