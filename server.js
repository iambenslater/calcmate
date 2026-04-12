const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Load calculator registry
const calculators = require('./data/calculators.json');

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
  fun: { name: 'Fun & Miscellaneous', icon: '🎉', description: 'Love calculator, pizza split, coffee spending — fun calculators to brighten your day.' }
};

// Middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://pagead2.googlesyndication.com", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
      connectSrc: ["'self'", "https:", "https://www.google-analytics.com", "https://analytics.google.com"]
    }
  }
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

// Make data available to all templates
app.use((req, res, next) => {
  res.locals.calculators = calculators;
  res.locals.calcsByCategory = calcsByCategory;
  res.locals.categoryMeta = categoryMeta;
  res.locals.articles = articles;
  res.locals.currentPath = req.path;
  res.locals.siteUrl = process.env.SITE_URL || 'https://calculatormate.com.au';
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
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += `  <url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n`;
  Object.keys(categoryMeta).forEach(cat => {
    xml += `  <url><loc>${baseUrl}/${cat}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  });
  calculators.forEach(calc => {
    xml += `  <url><loc>${baseUrl}/${calc.category}/${calc.slug}</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>\n`;
  });
  articles.forEach(article => {
    xml += `  <url><loc>${baseUrl}/articles/${article.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
  });
  xml += `  <url><loc>${baseUrl}/for</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
  audiences.forEach(a => {
    xml += `  <url><loc>${baseUrl}/for/${a.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
  });
  xml += '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${res.locals.siteUrl}/sitemap.xml\n`);
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
    title: `${article.title} | CalculatorMate Australia`,
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
