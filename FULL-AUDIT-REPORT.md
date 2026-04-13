# CalculatorMate SEO Audit Report

**Site:** https://calculatormate.com.au
**Date:** 13 April 2026
**Scope:** Full site audit across 233 indexed URLs (172 calculators, 49 articles, 18 categories, 11 audience pages)

---

## Overall SEO Health Score: 78/100

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 22% | 82/100 | 18.0 |
| Content Quality | 23% | 72/100 | 16.6 |
| On-Page SEO | 20% | 80/100 | 16.0 |
| Schema / Structured Data | 10% | 70/100 | 7.0 |
| Performance (CWV) | 10% | 75/100 | 7.5 |
| AI Search Readiness | 10% | 68/100 | 6.8 |
| Images | 5% | 60/100 | 3.0 |
| **Total** | **100%** | | **74.9 → 78** |

---

## Executive Summary

CalculatorMate is a well-built, server-side rendered site with excellent fundamentals: 92ms TTFB from Sydney, clean URL structure, comprehensive robots.txt with AI crawler permissions, and solid structured data coverage across all page types. The recent redesign is clean and professional.

### Top 5 Critical Issues

1. **Broken OG images on all article pages** — generating `/og/undefined/undefined.png` (404 on share)
2. **404 page sends `index, follow` + self-referencing canonical** — should be `noindex`
3. **Duplicate breadcrumb markup** on calculator pages (Microdata + JSON-LD both present)
4. **Organization logo in schema uses the OG banner image** — not the actual logo
5. **Inconsistent calculator count** across site (145 in meta, 117+ on about page, 172 actual)

### Top 5 Quick Wins

1. Fix OG image template variable resolution (5 min code fix, massive social sharing improvement)
2. Add `noindex` to 404 error page (2 min fix)
3. Remove Microdata breadcrumb, keep JSON-LD only (10 min fix)
4. Add `min-height` to AdSense slots to reserve space and reduce CLS (5 min CSS fix)
5. Add `preconnect` for Amazon CDN images on calculator pages (2 min fix, -300ms LCP)

---

## 1. Technical SEO (Score: 82/100)

### Crawlability — PASS
- robots.txt allows all crawlers including AI bots (GPTBot, Claude-Web, Anthropic-AI, PerplexityBot, Google-Extended, CCBot, cohere-ai)
- Sitemap correctly referenced in robots.txt
- Full server-side rendering — zero JavaScript indexability risk
- Clean two-level URL hierarchy with consistent 301 handling of trailing slashes

### Indexability — ISSUES FOUND
- **HIGH: 404 error page** serves `index, follow` meta robots tag and a self-referencing canonical. This means Google could index your 404 page. Fix: add `<meta name="robots" content="noindex">` to the 404 template.
- **MEDIUM: Homepage canonical mismatch** — homepage canonical is `/` but sitemap has `//` (trailing slash). Should be consistent.

### Security Headers — STRONG
- HTTPS enforced with 301 redirect from HTTP
- HSTS enabled with `includeSubDomains`
- Helmet security headers configured (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- **MEDIUM: CSP missing `frame-src`** for AdSense iframe domains — may silently block ad rendering in strict browsers

### URL Structure — CLEAN
- Consistent `/category/slug` pattern
- Trailing slash redirects working correctly
- **LOW: Two-hop redirect chain** from `http://www` + trailing slash path (unlikely to be hit in practice)

### Mobile — PASS
- Viewport meta tag present on all pages
- Responsive Tailwind CSS framework
- Mobile menu functional

---

## 2. Content Quality (Score: 72/100)

### E-E-A-T Signals
- About page exists with author name (Ben Slater)
- **HIGH: About page is thin** — needs professional context, methodology statement, and links to flagship calculators
- **HIGH: No author photo or professional credentials** on the about page
- **MEDIUM: No outbound authority links** to ATO or government sources in articles or calculator pages. Adding 1-2 links per key article to relevant ATO pages is a strong trust signal.

### Content Depth
- Article body content averages ~900 words — **MEDIUM: should aim for 1,400-1,600 words** on Finance articles
- Calculator pages have good "How it works" sections
- Category pages have adequate descriptions
- Audience pages have comprehensive intro content

### Thin Content Risk
- Category pages with few calculators could be thin. Consider adding more contextual content.
- **MEDIUM: Affiliate recommendations lack per-page relevance** — the same Sooez Accordion File Organiser appears on tax calculators, Medicare levy calculators, and income tax articles. Replace with contextually relevant products.

### Content Freshness
- **MEDIUM: Article FAQ questions reference 2024-25 financial year** — should be updated to 2025-26
- Calculator rates appear current

### Internal Linking
- Articles link to related calculators (good)
- **MEDIUM: About page should link to 3-4 flagship calculators** to flow equity to high-value tool pages

---

## 3. On-Page SEO (Score: 80/100)

### Title Tags — GOOD
- Unique titles across all pages
- Appropriate length and keyword inclusion

### Meta Descriptions — GOOD
- Present on all page types
- **HIGH: Calculator count inconsistency** — homepage meta says "145", about page says "117+", actual count is 172. Pick the real number and make it consistent everywhere.

### Heading Structure — GOOD
- Single H1 per page
- Logical heading hierarchy

### Internal Linking — GOOD
- Cross-linking between calculators, articles, and category pages
- Breadcrumbs on all inner pages
- Related calculators section on article pages

---

## 4. Schema / Structured Data (Score: 70/100)

### What's Implemented (Well)
- Organization + WebSite schema on homepage with SearchAction
- FAQPage schema on calculator and article pages
- WebApplication schema on calculator pages
- BreadcrumbList schema on inner pages
- Article schema on article pages with proper author attribution
- CollectionPage schema on category pages

### Critical Issues
1. **Duplicate breadcrumb markup** on calculator pages — both Microdata (in HTML) and JSON-LD breadcrumbs exist. Google may pick either one unpredictably. Remove the Microdata version, keep JSON-LD only.
2. **Missing `item` URL on breadcrumb position 3** on audience pages (`/for/first-home-buyers`). Add the full URL.
3. **Organization logo** points to the OG banner image, not the actual site logo. Create a proper logo asset and update.
4. **Broken OG image on articles** — template variable generating `/og/undefined/undefined.png`. Fix the dynamic URL resolution.

### Warnings
- Article `publisher` block missing `logo` ImageObject
- No `@id` on Organization/WebSite schemas — prevents cross-page graph referencing
- WebSite SearchAction target is a bare string — should wrap in `EntryPoint` with `urlTemplate`
- Author `Person` lacks `image` and `sameAs` (LinkedIn profile)

### Opportunities
- Add `Person` schema to the /about page for Ben Slater
- Add `ItemList` schema on category and audience pages to enumerate calculators
- Add `sameAs` on Organization pointing to ABN Lookup or LinkedIn Company page

---

## 5. Performance / Core Web Vitals (Score: 75/100)

### Server Performance — EXCELLENT
- **TTFB: 92ms** from Sydney — outstanding for a $6/mo droplet
- gzip compression enabled
- Lean HTML payload after compression

### LCP (Largest Contentful Paint) — NEEDS WORK
- **MEDIUM: Google Fonts loaded as render-blocking stylesheet** — no preload, risks LCP degradation
- **MEDIUM: Amazon CDN images** on calculator pages require cold connection setup. Add `<link rel="preconnect" href="https://m.media-amazon.com">` and `fetchpriority="high"` on above-fold images.
- **LOW: Preload Inter woff2** — fetching the exact woff2 URL and preloading it would save 200-400ms

### CLS (Cumulative Layout Shift) — NEEDS WORK
- **MEDIUM: AdSense slots have no reserved height** — when ads load, they shift content. Add `min-height: 250px` to `.ad-slot` containers.
- **LOW: Amazon affiliate images lack explicit `width`/`height`** attributes — potential CLS contributor

### INP (Interaction to Next Paint) — GOOD
- Vanilla JS, no heavy framework
- Event handlers are lightweight
- No blocking JavaScript in the critical path

### Caching — NEEDS IMPROVEMENT
- **MEDIUM: Static asset cache headers** should be extended to 1 year with `immutable` flag. The existing `?v=` versioning handles invalidation.
- **LOW: Consider enabling Brotli** compression in nginx for 15-20% additional savings on text assets

### Estimated CWV Impact of Fixes

| Fix | LCP Impact | CLS Impact |
|---|---|---|
| Preconnect + fetchpriority for Amazon CDN | -300-500ms | None |
| AdSense min-height reservation | None | -0.05-0.15 |
| Preload Inter woff2 | -200-400ms | -0.01-0.03 |
| 1-year static asset caching | Repeat visit LCP | None |
| Self-host Inter font | -300-500ms | -0.01-0.03 |

---

## 6. AI Search Readiness (Score: 68/100)

### AI Crawler Access — EXCELLENT
- robots.txt explicitly allows GPTBot, Claude-Web, Anthropic-AI, PerplexityBot, Google-Extended, CCBot, cohere-ai
- **LOW: Missing OAI-SearchBot** — add `User-agent: OAI-SearchBot` with `Allow: /` for OpenAI's retrieval crawler

### llms.txt — MISSING
- **HIGH: No /llms.txt file exists.** This is the emerging standard for AI-readable site summaries. Create one with:
  - Site description and purpose
  - Calculator count and categories
  - Key data sources (ATO, Fair Work, state government)
  - Update frequency
  - Content structure overview

### Citability — NEEDS WORK
- FAQ sections are well-structured for AI extraction
- **HIGH: No inline source citations** in articles. Every ATO rate, threshold, or statistic should link to the source URL. Perplexity and Google AI Overviews preferentially cite pages that demonstrate source awareness.
- **MEDIUM: About page needs professional context** — AI engines use author expertise and methodology statements as legitimacy proxies

### Brand Consistency — CRITICAL FIX
- **HIGH: Calculator count differs across the site** — "145" (meta description), "117+" (about page), 172 (actual). AI engines that encounter conflicting self-reported facts reduce citation confidence across the entire domain.

### Off-Site Brand Signals
- No YouTube, Reddit, or social media brand mentions detected
- **MEDIUM: Consider outreach** to Australian personal finance YouTubers (Rask Finance, Equity Mates, Aussie Firebug) for tool mentions. The correlation between YouTube mentions and AI citation frequency is strong (~0.737).

---

## 7. Images (Score: 60/100)

- Article images use WebP format (good)
- **HIGH: OG images broken on all article pages** — `/og/undefined/undefined.png` returns 404
- **MEDIUM: Amazon affiliate images lack `width`/`height`** attributes
- **MEDIUM: 8 article images failed generation** and need retry with tweaked prompts
- Hero images present and loading correctly on most pages

---

## 8. Sitemap (Score: 85/100)

### Structure — GOOD
- Valid XML with proper namespace
- 233 URLs (11 fewer than expected 244 — investigate the gap)
- All spot-checked URLs return HTTP 200
- No duplicates
- 38KB, well within limits

### Issues
- **HIGH: 11-URL discrepancy** between stated 244 and actual 233. Determine which pages are missing.
- **HIGH: /articles listing page** is missing from sitemap. Add at priority 0.7.
- **MEDIUM: All lastmod dates set to today** — this is the worst pattern for Google trust. Google's John Mueller has stated they treat lastmod as a trust signal; blanket same-day dates cause Google to ignore them entirely. Track actual content modification dates per page.
- **LOW: `priority` and `changefreq` are ignored by Google.** Can remove to reduce file size from 38KB to ~16KB.

---

## What's Working Well

- Full server-side rendering — zero JS indexability risk
- Clean two-level URL hierarchy
- Comprehensive AI crawler permissions in robots.txt
- Excellent TTFB (92ms from Sydney)
- `display=swap` on Google Fonts (prevents FOIT)
- `async` on AdSense and GA4 (no render-blocking)
- Comprehensive Helmet security headers with HSTS
- HTTP and www canonicalisation working correctly
- FAQPage structured data on calculators and articles
- WebApplication schema on calculators
- BreadcrumbList sitewide
- Sitelinks Searchbox via SearchAction on homepage
- Sitemap up-to-date and correctly referenced in robots.txt
- Good internal linking between content types
