# CalculatorMate

Australian calculator SEO site — calculatormate.com.au

## bOS Context
Read `/Users/benslater/Library/CloudStorage/GoogleDrive-ben@benslater.me/My Drive/bOS/Root/CLAUDE.md` for full system context.

## Stack
- Node.js + Express + EJS templates + Tailwind CDN
- DigitalOcean Droplet: 134.199.144.82
- PM2 process manager (runs as `calcmate` user, not root)
- Data: `data/calculators.json` — all calculator definitions, inputs, FAQ, keywords

## Adding a New Calculator

Every calculator requires three things:

### 1. JSON entry in `data/calculators.json`
```json
{
  "slug": "kebab-case-name",
  "title": "Human Readable Title",
  "category": "finance|property|super|car|health|business|advanced-finance|investment|conversions|lifestyle",
  "description": "One-line description for SEO and cards",
  "inputs": [
    { "id": "fieldName", "label": "Label", "type": "number|select|radio|checkbox", "prefix": "$", "suffix": "%", "help": "optional" }
  ],
  "faq": [ { "q": "...", "a": "..." } ],
  "keywords": ["search", "terms"],
  "relatedSlugs": ["other-calc-slug"]
}
```

### 2. Calculator JS file at `public/js/calculators/{slug}.js`

Must define two functions:

**`calculate()`** — reads inputs from DOM, computes results, renders into `#results-content`:
```javascript
function calculate() {
  var value = parseFloat(document.getElementById('input-fieldName').value) || 0;
  // ... compute ...
  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Label</span><span class="result-value">$1,234</span></div>
  `;
}
```

**`getTLDR()`** — returns a plain English 1-2 sentence summary of results (no HTML, no DOM changes):
```javascript
function getTLDR() {
  var value = parseFloat(document.getElementById('input-fieldName').value) || 0;
  if (!value) return '';
  // ... recompute key results ...
  return 'On a $' + value.toLocaleString() + ' salary, you\'ll take home $' + takeHome.toLocaleString() + ' after tax.';
}
```

Rules for getTLDR():
- Re-read inputs from DOM (same as calculate), do NOT rely on global state
- Return a string, never HTML
- 1-2 sentences, plain English, conversational Australian tone
- Focus on the 2-3 numbers the user cares most about
- Return `''` if required inputs are missing/zero
- Use existing helper functions (formatCurrency, fmt, etc.) from the same file

### 3. Input IDs must match
Input elements in the template use `id="input-{fieldId}"` where `{fieldId}` matches the `id` in the JSON inputs array. Radio buttons use `name="input-{fieldId}"`.

## Deployment

```bash
# From local: commit, push, then SSH
ssh root@134.199.144.82
cd /home/calcmate/app && git pull
su - calcmate -c 'cd /home/calcmate/app && pm2 delete calcmate && pm2 start ecosystem.config.js'
```

Always restart PM2 under the `calcmate` user, not root. Use `pm2 delete` + `pm2 start` (not `pm2 restart`) to ensure env vars are loaded.

## AI Search
- POST `/api/ai-search` — Claude Haiku parses natural language queries
- $50 lifetime budget (~50,000 queries), tracked in `/home/calcmate/app/ai-query-count.json`
- 10 req/min per IP rate limit
