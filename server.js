const express = require('express');
const path = require('path');
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
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://pagead2.googlesyndication.com", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
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

// Make data available to all templates
app.use((req, res, next) => {
  res.locals.calculators = calculators;
  res.locals.calcsByCategory = calcsByCategory;
  res.locals.categoryMeta = categoryMeta;
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
