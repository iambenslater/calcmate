# CalculatorMate — CLAUDE.md

## bOS Integration

This project operates within Ben Slater's Business Operating System (bOS).
This CLAUDE.md lives inside the bOS Google Drive folder, so all paths resolve relatively.

Before doing anything, read the bOS root context (two levels up from this file):

```
../../CLAUDE.md
```

Then read the CalculatorMate venture skill:

```
../../Skills/venture-skills/calculatormate/SKILL.md
```

If relative paths don't resolve (e.g. Claude Code was opened from a symlinked or different
working directory), fall back to finding bOS dynamically:

```bash
find ~/Library/CloudStorage -path "*/bOS/Root/CLAUDE.md" 2>/dev/null | head -1
```

All bOS principles apply — API keys from `deploy-keys.sh`, check API Registry before using
any service, capture learnings back into the venture skill at session end.

## Project Overview

| Field | Value |
|-------|-------|
| Project | CalculatorMate |
| URL | https://calculatormate.com.au |
| Repo | github.com/iambenslater/calcmate |
| Droplet | 134.199.144.82 (syd1, $6/mo, Ubuntu 24.04) |
| User | calcmate |
| PM2 | calcmate (port 3000) |
| Stack | Node.js + EJS, data-driven via `data/calculators.json` |
| Monetisation | Amazon Associates AU (benslater-22), future AdSense |

## SEO Tool — claude-seo (INSTALL ON FIRST SESSION)

This project uses the **claude-seo** plugin for SEO auditing and content planning.

**Check if already installed:**
```bash
ls ~/.claude/skills/seo/SKILL.md 2>/dev/null && echo "Already installed" || echo "Not installed"
```

**If not installed, run this first:**
```bash
git clone --depth 1 https://github.com/AgriciDaniel/claude-seo.git /tmp/claude-seo && bash /tmp/claude-seo/install.sh && rm -rf /tmp/claude-seo
```

**Then run the full site audit:**
```
/seo audit https://calculatormate.com.au
```

**Useful follow-up commands for this site:**
- `/seo schema https://calculatormate.com.au` — validate FAQ schema across calculator pages
- `/seo geo https://calculatormate.com.au` — AI Overview / AEO optimisation (core to the site's strategy)
- `/seo technical https://calculatormate.com.au` — Core Web Vitals, crawlability, indexability
- `/seo page https://calculatormate.com.au/finance/take-home-pay` — deep-dive a single calculator
- `/seo plan "Australian calculator and financial tools website"` — strategic plan before building articles section

**Priority:** Run `/seo audit` before building the articles section. The audit will surface which
content gaps to fill first, so articles are written against real keyword data, not guesswork.

## Architecture

Data-driven: `data/calculators.json` defines all 121 calculators. Each has inputs, a JS file
at `public/js/calculators/{slug}.js` with a `calculate()` function, FAQ, SEO metadata,
affiliate context, and related calculators. Adding a calculator = JSON entry + JS file only.

## Content Formatting Standard (MANDATORY)

ALL HTML content (articles, audience pages, guides) MUST:
1. Wrap in `<div class="article-content">` — applies shared typography from `style.css`
2. Use standard HTML tags — H2, H3, p, ul, ol, strong, a, table, blockquote. No inline styles.
3. Use `q` and `a` for FAQ keys (not `question`/`answer`)
4. Escape quotes in JSON with `\"` — never use HTML entities (`&quot;`, `&apos;`) in JSON data
5. Include a Gemini-generated image via `scripts/generate-article-images.js`
6. Calculator links use `/finance/take-home-pay` format (not `/calculator/` prefix)
7. Amazon links use `tag=benslater-22`

## Testing

```bash
node tests/smoke-test.js          # Tier 1: all pages load, calculate() works
node tests/tier2-math-*.js        # Tier 2: 100/100 known-correct math assertions
```
Tier 3 is manual audit against ATO, Fair Work, and state gov sources.

## Known Gotchas

1. **State input:** JSON sends lowercase (`nsw`), JS lookups use uppercase (`NSW`) — always `.toUpperCase()`
2. **Radio buttons:** `querySelector('input[name="input-{id}"]:checked')`, not `getElementById`
3. **No `alert()`:** Use inline error messages — `alert()` blocks Puppeteer tests
4. **Deploy sequence:** push first, then SSH pull
5. **JSON-LD uses `<%- %>` NOT `<%= %>`:** Inside `<script type="application/ld+json">` blocks, ALWAYS use `<%- %>` (unescaped) with `.replace(/"/g, '\\"')` for text fields. EJS `<%= %>` HTML-encodes `&`, `'`, `"` etc. but JSON parsers don't decode HTML entities — so `&amp;` renders literally as "Food &amp; Nutrition" instead of "Food & Nutrition". This applies to ALL templates.
6. **No HTML entities in calculators.json:** FAQ answers, descriptions, and titles must use raw characters (`'` not `&apos;`, `½` not `&frac12;`). The data goes into JSON-LD `<script>` tags which don't parse HTML entities. Only escape JSON quotes (`\"`). Run `grep -E '&amp;|&apos;|&quot;|&frac|&lt;|&gt;' data/calculators.json` to check before deploying new calculators.

## Deploy

```bash
# From this directory
git add -A && git commit -m "message" && git push
ssh calcmate@134.199.144.82 "cd /home/calcmate/app && bash deploy.sh"
```

## Session End Checklist

Before closing any session on this project:
1. Propose updates to `Skills/venture-skills/calculatormate/SKILL.md` in bOS
2. If SEO audit surfaced insights → note them in the venture skill
3. If a new API was used → check the API Registry and propose an update
4. If a reusable pattern was built → propose update to the relevant domain skill
