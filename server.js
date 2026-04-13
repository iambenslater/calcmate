const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const geoip = require('geoip-lite');

const app = express();
const PORT = process.env.PORT || 3000;

// Load calculator registry
const calculators = require('./data/calculators.json');

// Load affiliate product catalog
let affiliateProducts = { products: {} };
try {
  affiliateProducts = require('./data/affiliate-products.json');
} catch(e) { /* no product catalog yet */ }

// Load affiliate click stats (if available)
let affiliateStats = {};
try {
  affiliateStats = require('./data/affiliate-stats.json');
} catch(e) { /* no stats yet */ }

// Build lookup maps
const calcBySlug = {};
const calcsByCategory = {};
const categories = {};

calculators.forEach(calc => {
  calcBySlug[calc.slug] = calc;
  if (!calcsByCategory[calc.category]) calcsByCategory[calc.category] = [];
  calcsByCategory[calc.category].push(calc);
});

// Category metadata
const categoryMeta = {
  finance: { name: 'Finance & Pay', icon: '💰', description: 'Australian tax, pay, and budgeting calculators. Calculate your take-home pay, income tax, Medicare levy, and more using current ATO rates.' },
  property: { name: 'Property & Home Loans', icon: '🏠', description: 'Mortgage repayments, stamp duty by state, borrowing power, and first home buyer cost calculators for Australian property.' },
  health: { name: 'Health & Fitness', icon: '❤️', description: 'BMI, calorie intake, body fat, pregnancy due date, and other health calculators with metric units.' },
  car: { name: 'Car & Driving', icon: '🚗', description: 'Fuel cost, car registration, CTP, tolls, and car loan calculators for Australian drivers.' },
  time: { name: 'Time & Date', icon: '⏰', description: 'Days between dates, time zone converter, work hours, and Australian public holiday planners.' },
  conversions: { name: 'Conversions & Everyday', icon: '🔄', description: 'GST, percentage, metric/imperial, currency, cooking measurements, and unit converters.' },
  business: { name: 'Business & Work', icon: '💼', description: 'Leave entitlements, redundancy pay, overtime, hourly rate, and business viability calculators under Australian workplace law.' },
  super: { name: 'Super & Retirement', icon: '🏦', description: 'Superannuation balance projections, retirement savings gaps, fund comparisons, and contribution optimisers.' },
  'advanced-finance': { name: 'Advanced Finance', icon: '📊', description: 'Compound interest, capital gains tax, Division 7A, FBT, loan comparison, and offset account calculators.' },
  family: { name: 'Pregnancy & Family', icon: '👶', description: 'Pregnancy week tracker, baby age milestones, child height predictor, and school start age by state.' },
  science: { name: 'Science & Statistics', icon: '🔬', description: 'Sample size, standard deviation, probability, scientific notation, and quadratic equation calculators.' },
  trade: { name: 'Construction & Trade', icon: '🔨', description: 'Concrete, paint, timber, roofing, fencing, and decking material calculators for Australian tradies.' },
  lifestyle: { name: 'Lifestyle & Utility', icon: '🏡', description: 'Blood alcohol, electricity usage, solar savings, water usage, pet age, and size converter calculators.' },
  investment: { name: 'Investment & Crypto', icon: '📈', description: 'Rental yield, negative gearing, dividend reinvestment, and crypto profit/loss calculators for Australian investors.' },
  food: { name: 'Food & Nutrition', icon: '🥗', description: 'Macro calculator, meal cost comparison, daily serves, and grocery budget tools for healthy Australian eating.' },
  fun: { name: 'Fun & Miscellaneous', icon: '🎉', description: 'Love calculator, pizza split, coffee spending — fun calculators to brighten your day.' }
};

// Middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://www.google-analytics.com", "https://www.googletagmanager.com", "https://m.media-amazon.com"],
      connectSrc: ["'self'", "https:", "https://www.google-analytics.com", "https://analytics.google.com"]
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true }
}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0' }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// JSON body parser for API endpoints
app.use(express.json({ limit: '10kb' }));

// Simple rate limiter (in-memory, per IP)
const rateLimitMap = new Map();
function rateLimit(windowMs, maxRequests) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    const requests = rateLimitMap.get(ip) || [];
    const recent = requests.filter(t => t > windowStart);
    if (recent.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
    }
    recent.push(now);
    rateLimitMap.set(ip, recent);
    next();
  };
}

// Affiliate click tracking — rate limit: 10/min per IP
const affiliateClickRateMap = new Map();
setInterval(() => affiliateClickRateMap.clear(), 60000);

app.post('/api/affiliate-click', (req, res) => {
  const ip = req.ip;
  const count = (affiliateClickRateMap.get(ip) || 0) + 1;
  affiliateClickRateMap.set(ip, count);
  if (count > 10) return res.status(429).end();

  const { calculator, product, context, position } = req.body || {};
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    calculator: String(calculator || '').slice(0, 200),
    product: String(product || '').slice(0, 200),
    context: String(context || 'unknown').slice(0, 100),
    position: typeof position === 'number' ? position : 0,
    userAgent: String(req.headers['user-agent'] || '').slice(0, 100),
    referer: String(req.headers.referer || '').slice(0, 500)
  }) + '\n';

  // Fire and forget
  fs.appendFile(path.join(__dirname, 'data', 'affiliate-clicks.log'), line, () => {});
  res.status(204).end();
});

// Amazon geo-routing: detect visitor country → correct Amazon domain + affiliate tag
const amazonGeoConfig = {
  US: { domain: 'amazon.com', tag: 'calculatormat-20' },
  // Default (AU + everything else)
  default: { domain: 'amazon.com.au', tag: 'calculatormate-22' }
};

// Make data available to all templates
app.use((req, res, next) => {
  res.locals.calculators = calculators;
  res.locals.calcsByCategory = calcsByCategory;
  res.locals.categoryMeta = categoryMeta;
  res.locals.articles = articles;
  res.locals.affiliateProducts = affiliateProducts;
  res.locals.affiliateStats = affiliateStats;
  res.locals.currentPath = req.path;
  res.locals.siteUrl = process.env.SITE_URL || 'https://calculatormate.com.au';

  // Geo-detect Amazon domain + tag
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  const geo = geoip.lookup(ip);
  const countryCode = geo && geo.country ? geo.country : 'AU';
  const amazonConfig = amazonGeoConfig[countryCode] || amazonGeoConfig.default;
  res.locals.amazonDomain = amazonConfig.domain;
  res.locals.affiliateTag = amazonConfig.tag;

  next();
});

// Routes

// Health check (must be before /:category catch-all)
app.get('/healthz', (req, res) => res.send('ok'));

// Home
app.get('/', (req, res) => {
  const popular = calculators.filter(c =>
    ['take-home-pay', 'mortgage-repayment', 'bmi', 'gst-calculator', 'stamp-duty-all-states',
     'compound-interest', 'percentage', 'fuel-cost', 'days-between-dates', 'calorie-intake'].includes(c.slug)
  );
  res.render('home', { popular, title: 'CalculatorMate Australia — Free Online Calculators', metaDescription: 'Free Australian calculators for tax, mortgage, health, and more. 100+ calculators built for Australians with current ATO rates and state-specific data.' });
});

// Search API
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) return res.json([]);
  const results = calculators.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    (c.keywords && c.keywords.some(k => k.toLowerCase().includes(q)))
  ).slice(0, 10).map(c => ({
    slug: c.slug,
    title: c.title,
    category: c.category,
    description: c.description,
    url: `/${c.category}/${c.slug}`
  }));
  res.json(results);
});

// Sports ladder data (for "How Shit Is Your Team?" calculator)
app.get('/api/sports-ladders', (req, res) => {
  const ladderFile = path.join(__dirname, 'data', 'sports-ladders.json');
  try {
    const data = JSON.parse(fs.readFileSync(ladderFile, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(503).json({ error: 'Ladder data not available. Run scrape-ladders.js first.' });
  }
});

// Dynamic OG images for social sharing
const { Resvg } = require('@resvg/resvg-js');
const OG_CACHE_DIR = path.join(__dirname, 'data', 'og-cache');
const OG_FONT_DIR = path.join(__dirname, 'data', 'fonts');
if (!fs.existsSync(OG_CACHE_DIR)) fs.mkdirSync(OG_CACHE_DIR, { recursive: true });

// Calculator icon SVG (inline, matches favicon)
const CALC_ICON = `<g transform="translate(80, 564) scale(1.4)">
  <rect width="32" height="32" rx="6" fill="#00205B"/>
  <rect x="5" y="5" width="22" height="22" rx="3" fill="#FFB800"/>
  <rect x="8" y="8" width="16" height="5" rx="1" fill="#00205B" opacity="0.9"/>
  <rect x="8" y="15" width="4" height="4" rx="0.5" fill="#00205B" opacity="0.7"/>
  <rect x="14" y="15" width="4" height="4" rx="0.5" fill="#00205B" opacity="0.7"/>
  <rect x="20" y="15" width="4" height="4" rx="0.5" fill="#00205B" opacity="0.7"/>
  <rect x="8" y="21" width="4" height="4" rx="0.5" fill="#00205B" opacity="0.7"/>
  <rect x="14" y="21" width="4" height="4" rx="0.5" fill="#00205B" opacity="0.7"/>
  <rect x="20" y="21" width="4" height="4" rx="0.5" fill="#FFB800" stroke="#00205B" stroke-width="0.5"/>
</g>`;

function generateOgSvg(title, description, categoryName) {
  const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Word-wrap description into 2 lines at ~65 chars
  let desc1 = '', desc2 = '';
  const dWords = (description || '').split(' ');
  for (const w of dWords) {
    if (!desc2 && (desc1 + ' ' + w).trim().length <= 65) {
      desc1 = (desc1 + ' ' + w).trim();
    } else if ((desc2 + ' ' + w).trim().length <= 65) {
      desc2 = (desc2 + ' ' + w).trim();
    }
  }
  if (!desc2 && desc1.length > 68) desc1 = desc1.substring(0, 65) + '...';
  if (desc2.length > 68) desc2 = desc2.substring(0, 65) + '...';

  // Word-wrap title at ~28 chars per line (max 2 lines)
  const words = title.split(' ');
  let line1 = '', line2 = '';
  for (const w of words) {
    if (!line2 && (line1 + ' ' + w).trim().length <= 30) {
      line1 = (line1 + ' ' + w).trim();
    } else {
      line2 = (line2 + ' ' + w).trim();
    }
  }
  if (line2.length > 32) line2 = line2.substring(0, 29) + '...';
  const titleY = line2 ? 230 : 260;
  const descY = line2 ? titleY + 140 : titleY + 90;

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00205B"/>
      <stop offset="100%" style="stop-color:#001a4a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="540" width="1200" height="90" fill="#FFB800"/>
  <rect x="0" y="536" width="1200" height="8" fill="#FFB800" opacity="0.6"/>
  <!-- Category badge -->
  <rect x="80" y="80" rx="24" ry="24" width="${esc(categoryName).length * 14 + 48}" height="48" fill="rgba(255,184,0,0.15)"/>
  <text x="104" y="112" font-family="Inter" font-size="22" fill="#FFB800" font-weight="600">${esc(categoryName)}</text>
  <!-- Title -->
  <text x="80" y="${titleY}" font-family="Inter" font-size="58" fill="white" font-weight="800">${esc(line1)}</text>
  ${line2 ? `<text x="80" y="${titleY + 70}" font-family="Inter" font-size="58" fill="white" font-weight="800">${esc(line2)}</text>` : ''}
  <!-- Description -->
  <text x="80" y="${descY}" font-family="Inter" font-size="24" fill="rgba(255,255,255,0.6)" font-weight="400">${esc(desc1)}</text>
  ${desc2 ? `<text x="80" y="${descY + 32}" font-family="Inter" font-size="24" fill="rgba(255,255,255,0.6)" font-weight="400">${esc(desc2)}</text>` : ''}
  <!-- Footer: calculator icon + branding -->
  ${CALC_ICON}
  <text x="132" y="590" font-family="Inter" font-size="28" font-weight="700" fill="#00205B">Calculator<tspan font-weight="800" fill="white">Mate</tspan></text>
  <text x="1120" y="588" font-family="Inter" font-size="20" fill="rgba(0,32,91,0.6)" text-anchor="end" font-weight="500">calculatormate.com.au</text>
</svg>`;
}

app.get('/og/:category/:slug.png', (req, res) => {
  const calc = calcBySlug[req.params.slug];
  if (!calc || calc.category !== req.params.category) return res.status(404).end();

  const cacheFile = path.join(OG_CACHE_DIR, `${calc.slug}.png`);

  // Serve from cache if exists
  if (fs.existsSync(cacheFile)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=604800');
    return res.sendFile(cacheFile);
  }

  try {
    const catMeta = categoryMeta[calc.category] || { name: 'Calculator', icon: '🧮' };
    const svg = generateOgSvg(calc.title, calc.metaDescription || calc.description, catMeta.name);
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: {
        fontDirs: [OG_FONT_DIR],
        loadSystemFonts: false,
        defaultFontFamily: 'Inter'
      }
    });
    const png = resvg.render().asPng();
    fs.writeFileSync(cacheFile, png);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=604800');
    res.send(png);
  } catch (err) {
    console.error('OG image generation failed:', err.message);
    res.redirect('/images/og-default.png');
  }
});

// AI-powered natural language calculator search
const AI_BUDGET_FILE = path.join(__dirname, 'data', 'ai-query-count.json');
const AI_QUERY_LIMIT = 50000; // ~$50 at $0.001/query

function getAIQueryCount() {
  try {
    const data = JSON.parse(fs.readFileSync(AI_BUDGET_FILE, 'utf8'));
    return data.count || 0;
  } catch { return 0; }
}
function incrementAIQueryCount() {
  const count = getAIQueryCount() + 1;
  fs.writeFileSync(AI_BUDGET_FILE, JSON.stringify({ count, lastQuery: new Date().toISOString() }));
  return count;
}

// Rate limiter: 10 req/min per IP
const aiRateLimit = {};
function checkAIRateLimit(ip) {
  const now = Date.now();
  if (!aiRateLimit[ip]) aiRateLimit[ip] = [];
  aiRateLimit[ip] = aiRateLimit[ip].filter(t => now - t < 60000);
  if (aiRateLimit[ip].length >= 10) return false;
  aiRateLimit[ip].push(now);
  return true;
}

// Build compressed calculator index for AI prompt
const calcIndex = calculators.map(c => {
  const inputs = (c.inputs || []).map(i => {
    let desc = `${i.id}(${i.type}`;
    if (i.options) desc += ':' + i.options.map(o => o.value).join('/');
    if (i.prefix) desc += ',prefix:' + i.prefix;
    if (i.suffix) desc += ',suffix:' + i.suffix;
    desc += ')';
    return desc;
  }).join(', ');
  return `${c.category}/${c.slug}: ${c.title} — ${c.description} | Inputs: ${inputs}`;
}).join('\n');

app.post('/api/ai-search', express.json(), async (req, res) => {
  const query = (req.body.query || '').trim();
  if (!query || query.length < 10) return res.json({ error: 'Please ask a more detailed question.' });
  if (query.length > 500) return res.json({ error: 'Question too long.' });

  // Budget check
  if (getAIQueryCount() >= AI_QUERY_LIMIT) {
    return res.json({ error: 'AI search is temporarily unavailable. Please use the keyword search.' });
  }

  // Rate limit
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkAIRateLimit(ip)) {
    return res.json({ error: 'Too many requests. Please wait a moment.' });
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `You are CalculatorMate's AI assistant. Given a user's question, identify which Australian calculators are relevant and extract input values from their question.

Available calculators (category/slug: title — description | Inputs):
${calcIndex}

Respond with JSON only, no markdown. Format:
{"matches":[{"slug":"calculator-slug","category":"category","reason":"one-line why this is relevant","inputs":{"inputId":"value"}}],"summary":"one sentence explaining what you found"}

Rules:
- ALWAYS return matching calculators even if you can only extract some inputs — users will fill in the rest
- Return 1-5 matches, most relevant first
- Only include inputs you can confidently extract from the question — omit uncertain ones
- Use exact input IDs from the calculator definitions
- For select/radio inputs, use exact option values
- For checkbox inputs, use true/false
- Australian context: amounts in AUD, states as NSW/VIC/QLD etc
- If the question isn't about calculations, return {"matches":[],"summary":"I can only help with calculator questions."}`,
      messages: [{ role: 'user', content: query }]
    });

    incrementAIQueryCount();

    const text = response.content[0].text;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { matches: [], summary: 'Could not parse response.' };
    }

    // Enrich matches with full calculator data
    if (parsed.matches) {
      parsed.matches = parsed.matches.map(m => {
        const calc = calcBySlug[m.slug];
        if (!calc) return null;
        return {
          ...m,
          title: calc.title,
          description: calc.description,
          url: `/${calc.category}/${calc.slug}`
        };
      }).filter(Boolean).slice(0, 5);
    }

    parsed.remaining = AI_QUERY_LIMIT - getAIQueryCount();
    res.json(parsed);
  } catch (err) {
    console.error('AI search error:', err.message);
    res.json({ error: 'AI search is temporarily unavailable. Please use the keyword search.' });
  }
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = res.locals.siteUrl;
  const today = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += `  <url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n`;
  Object.keys(categoryMeta).forEach(cat => {
    xml += `  <url><loc>${baseUrl}/${cat}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  });
  calculators.forEach(calc => {
    xml += `  <url><loc>${baseUrl}/${calc.category}/${calc.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>\n`;
  });
  articles.forEach(article => {
    const lastmod = article.dateModified || article.datePublished || today;
    xml += `  <url><loc>${baseUrl}/articles/${article.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
  });
  xml += `  <url><loc>${baseUrl}/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/for</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
  audiences.forEach(a => {
    xml += `  <url><loc>${baseUrl}/for/${a.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
  });
  xml += '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${res.locals.siteUrl}/sitemap.xml\n\n# AI crawlers\nUser-agent: GPTBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: Claude-Web\nAllow: /\nUser-agent: Anthropic-AI\nAllow: /\nUser-agent: Perplexity-User\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\nUser-agent: CCBot\nAllow: /\nUser-agent: cohere-ai\nAllow: /\n`);
});

// Articles
let articles = [];
try { articles = require('./data/articles.json'); } catch(e) { /* no articles yet */ }
const articleBySlug = {};
articles.forEach(a => { articleBySlug[a.slug] = a; });

app.get('/articles', (req, res) => {
  res.render('articles', {
    articles,
    title: 'Articles & Guides | CalculatorMate Australia',
    metaDescription: 'Australian finance, property, health, and lifestyle guides. Expert articles with free calculators to help you make smarter decisions.'
  });
});

app.get('/articles/:slug', (req, res) => {
  const article = articleBySlug[req.params.slug];
  if (!article) return res.status(404).render('404', { title: 'Page Not Found | CalculatorMate' });
  const relatedCalcs = (article.relatedCalculators || []).map(s => calcBySlug[s]).filter(Boolean);
  res.render('article', {
    article,
    articles,
    relatedCalcs,
    calc: { affiliateContext: article.affiliateContext || 'general' },
    title: `${article.title} | CalculatorMate`,
    metaDescription: article.metaDescription || article.excerpt
  });
});

// Email results endpoint
app.post('/api/email-results', rateLimit(60000, 1), async (req, res) => {
  try {
    const { email, calculatorTitle, resultsSummary, primaryResult, shareUrl } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
    if (!resultsSummary) return res.status(400).json({ error: 'No results to send' });

    // Try SendGrid if available
    const sgKey = process.env.SENDGRID_API_KEY;
    if (sgKey) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(sgKey);
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM || 'results@calculatormate.com.au',
        subject: `Your ${calculatorTitle} Result — CalculatorMate`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #00205B; padding: 16px 24px; border-radius: 8px 8px 0 0;">
              <span style="color: #FFB800; font-size: 20px; font-weight: bold;">Calculator</span><span style="color: white; font-size: 20px; font-weight: bold;">Mate</span>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #00205B; margin: 0 0 8px 0;">${calculatorTitle}</h2>
              <div style="background: #FFF3D0; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
                <span style="color: #00205B; font-weight: bold; font-size: 18px;">${primaryResult || ''}</span>
              </div>
              <pre style="font-family: Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap; margin: 0 0 16px 0;">${resultsSummary}</pre>
              <a href="${shareUrl}" style="display: inline-block; background: #FFB800; color: #00205B; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Full Result →</a>
            </div>
            <div style="padding: 12px 24px; font-size: 11px; color: #9ca3af;">
              <p>This is an estimate only. Consult a qualified professional before making decisions based on these results.</p>
              <p>CalculatorMate — calculatormate.com.au</p>
            </div>
          </div>
        `
      });
      return res.json({ success: true });
    }

    // Fallback: mailto link (no SendGrid configured)
    return res.json({ success: false, error: 'Email service not configured. Use the share link instead.' });
  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: 'Failed to send email. Try again.' });
  }
});

// Audience pages
let audiences = [];
try { audiences = require('./data/audiences.json'); } catch(e) {}
const audienceBySlug = {};
audiences.forEach(a => { audienceBySlug[a.slug] = a; });

app.get('/for', (req, res) => {
  res.render('audiences', {
    audiences,
    title: 'Calculators For... | CalculatorMate Australia',
    metaDescription: 'Find the right Australian calculators for your situation — first home buyers, families, retirees, small business owners, teenagers, and more.'
  });
});

app.get('/for/:slug', (req, res) => {
  const audience = audienceBySlug[req.params.slug];
  if (!audience) return res.status(404).render('404', { title: 'Page Not Found | CalculatorMate' });
  res.render('audience', {
    audience,
    audiences,
    allCalcs: calcBySlug,
    title: `${audience.title} | CalculatorMate Australia`,
    metaDescription: audience.metaDescription
  });
});

// About
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About CalculatorMate — Built by a Brisbane Dad',
    metaDescription: 'CalculatorMate was built by Ben Slater, a Brisbane-based father of three, to give every Australian free access to accurate, easy-to-use financial, property, health, and lifestyle calculators.'
  });
});

// llms.txt — AI crawler discoverability
app.get('/llms.txt', (req, res) => {
  const baseUrl = res.locals.siteUrl;
  let txt = '# CalculatorMate Australia\n';
  txt += '> 117 free online calculators built for Australians — tax, mortgage, health, business, and more.\n\n';
  txt += `## About\nCalculatorMate provides free, accurate calculators using current ATO rates, state-specific stamp duty, Medicare levy thresholds, and Australian workplace law. All calculations run client-side in the browser.\n\n`;
  txt += '## Calculators\n';
  Object.entries(categoryMeta).forEach(([key, meta]) => {
    const calcs = calcsByCategory[key] || [];
    txt += `\n### ${meta.name}\n`;
    calcs.forEach(c => {
      txt += `- [${c.title}](${baseUrl}/${c.category}/${c.slug}): ${c.description}\n`;
    });
  });
  if (articles.length) {
    txt += '\n## Articles & Guides\n';
    articles.forEach(a => {
      txt += `- [${a.title}](${baseUrl}/articles/${a.slug}): ${a.metaDescription || a.excerpt}\n`;
    });
  }
  txt += `\n## Links\n- Homepage: ${baseUrl}\n- About: ${baseUrl}/about\n- Sitemap: ${baseUrl}/sitemap.xml\n`;
  res.type('text/plain');
  res.send(txt);
});

// Terms & Privacy
app.get('/terms', (req, res) => {
  res.render('terms', { title: 'Terms of Use | CalculatorMate Australia', metaDescription: 'Terms of use for CalculatorMate Australia. Calculator results are estimates only and should not be used as professional advice.' });
});
app.get('/privacy', (req, res) => {
  res.render('privacy', { title: 'Privacy Policy | CalculatorMate Australia', metaDescription: 'Privacy policy for CalculatorMate Australia. We do not collect personal information. Calculators run entirely in your browser.' });
});

// Category page
app.get('/:category', (req, res) => {
  const cat = req.params.category;
  const meta = categoryMeta[cat];
  if (!meta || !calcsByCategory[cat]) return res.status(404).render('404', { title: 'Page Not Found | CalculatorMate' });
  res.render('category', {
    category: cat,
    categoryName: meta.name,
    categoryIcon: meta.icon,
    categoryDescription: meta.description,
    calcs: calcsByCategory[cat],
    title: `${meta.name} Calculators | CalculatorMate Australia`,
    metaDescription: meta.description
  });
});

// Calculator page
app.get('/:category/:slug', (req, res) => {
  const calc = calcBySlug[req.params.slug];
  if (!calc || calc.category !== req.params.category) return res.status(404).render('404', { title: 'Page Not Found | CalculatorMate' });
  const catMeta = categoryMeta[calc.category];
  const related = (calc.relatedSlugs || []).map(s => calcBySlug[s]).filter(Boolean);
  res.render('calculator', {
    calc,
    categoryName: catMeta.name,
    categoryIcon: catMeta.icon,
    related,
    title: `${calc.title} | CalculatorMate Australia`,
    metaDescription: calc.metaDescription || calc.description
  });
});

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found | CalculatorMate' });
});

app.listen(PORT, () => {
  console.log(`CalcMate running on port ${PORT} with ${calculators.length} calculators`);
});
