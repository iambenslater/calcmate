# CalculatorMate SEO Action Plan

**Generated:** 13 April 2026
**Overall Score:** 78/100

---

## CRITICAL (fix immediately)

| # | Issue | Category | Effort | Impact |
|---|-------|----------|--------|--------|
| 1 | Fix broken OG images on all article pages (`/og/undefined/undefined.png` → 404) | Images / Social | 5 min | High — every social share shows broken image |
| 2 | Add `noindex` to 404 error page (currently serves `index, follow` + canonical) | Technical | 2 min | High — prevents 404 page indexation |
| 3 | Fix calculator count inconsistency (145/117+/172) — pick real number, update everywhere | Content / AI | 15 min | High — conflicting self-reported facts reduce AI citation confidence |
| 4 | Remove duplicate Microdata breadcrumb from calculator pages (keep JSON-LD only) | Schema | 10 min | Medium — prevents Google picking wrong markup |
| 5 | Fix Organization logo in schema (currently uses OG banner, not actual logo) | Schema | 10 min | Medium — incorrect logo in Knowledge Panel |

---

## HIGH (fix within 1 week)

| # | Issue | Category | Effort | Impact |
|---|-------|----------|--------|--------|
| 6 | Create /llms.txt file for AI crawler consumption | AI Readiness | 30 min | High — emerging standard for AI-readable site summaries |
| 7 | Add `min-height: 250px` to AdSense slot containers to prevent CLS | Performance | 5 min | High — reduces layout shift when ads load |
| 8 | Add `preconnect` for Amazon CDN + `fetchpriority="high"` on above-fold images | Performance | 5 min | High — saves 300-500ms on calculator page LCP |
| 9 | Expand about page with professional context, methodology, and calculator links | Content / E-E-A-T | 45 min | High — AI engines use expertise signals as legitimacy proxy |
| 10 | Add inline source citations to articles (link ATO rates to source URLs) | Content / AI | 30 min | High — Perplexity and AI Overviews prefer source-aware pages |
| 11 | Add missing `/articles` listing page to sitemap | Sitemap | 5 min | Medium — important page missing from crawl directives |
| 12 | Investigate 11-URL sitemap discrepancy (233 actual vs 244 expected) | Sitemap | 15 min | Medium — ensure all pages are discoverable |
| 13 | Add missing `item` URL on breadcrumb position 3 for audience pages | Schema | 10 min | Medium — incomplete breadcrumb data |
| 14 | Add Article publisher `logo` ImageObject to all article schema | Schema | 10 min | Medium — incomplete Article rich result |

---

## MEDIUM (fix within 1 month)

| # | Issue | Category | Effort | Impact |
|---|-------|----------|--------|--------|
| 15 | Replace blanket same-day lastmod in sitemap with real modification dates | Sitemap | 1 hr | Medium — Google ignores lastmod when it's clearly fabricated |
| 16 | Add CSP `frame-src` for AdSense iframe domains | Technical | 10 min | Medium — may silently block ads in strict browsers |
| 17 | Preload Inter woff2 font file | Performance | 15 min | Medium — saves 200-400ms LCP |
| 18 | Extend static asset cache to 1 year with `immutable` flag | Performance | 10 min | Medium — repeat visit performance |
| 19 | Add `width`/`height` attributes to Amazon affiliate images | Performance | 20 min | Medium — prevents CLS from image loading |
| 20 | Update article FAQ questions to 2025-26 financial year | Content | 30 min | Medium — AI systems prefer current-year answers |
| 21 | Make affiliate recommendations contextually relevant per calculator | Content | 1 hr | Medium — editorial integrity signal for E-E-A-T |
| 22 | Increase Finance article word count to 1,400-1,600 words | Content | 2 hrs | Medium — more comprehensive content ranks better |
| 23 | Add `@id` URIs to Organization/WebSite schema for cross-page graph | Schema | 15 min | Medium — enables connected Knowledge Graph |
| 24 | Wrap SearchAction target in `EntryPoint` with `urlTemplate` | Schema | 10 min | Low-Medium — cleaner spec compliance |
| 25 | Add OAI-SearchBot to robots.txt Allow rules | AI Readiness | 2 min | Low-Medium — covers OpenAI retrieval crawler |
| 26 | Add `Person` schema to /about page for Ben Slater | Schema | 15 min | Low-Medium — strengthens author entity |
| 27 | Fix homepage canonical trailing slash mismatch with sitemap | Technical | 5 min | Low-Medium |
| 28 | Add outbound authority links to ATO from calculator pages | Content | 30 min | Medium — trust signal for quality raters |

---

## LOW (backlog)

| # | Issue | Category | Effort | Impact |
|---|-------|----------|--------|--------|
| 29 | Add `ItemList` schema on category and audience pages | Schema | 30 min | Low — list rich result opportunity |
| 30 | Add `sameAs` on Organization schema (ABN Lookup / LinkedIn) | Schema | 5 min | Low — entity resolution for AI |
| 31 | Add Author `image` and `sameAs` (LinkedIn) to article schema | Schema | 10 min | Low — richer author entity |
| 32 | Self-host Inter font to eliminate Google Fonts dependency | Performance | 30 min | Low — cleanest long-term LCP fix |
| 33 | Enable Brotli compression in nginx | Performance | 15 min | Low — 15-20% savings on text assets |
| 34 | Implement IndexNow for faster Bing/Yandex freshness | Technical | 20 min | Low — ~20 lines of Node.js code |
| 35 | Strip `priority` and `changefreq` from sitemap (Google ignores both) | Sitemap | 10 min | Low — housekeeping, reduces file 38KB→16KB |
| 36 | Retry 8 failed article image generations | Images | 30 min | Low — completeness |
| 37 | Pursue off-site brand signals (YouTube/Reddit mentions) | AI Readiness | Ongoing | Medium-term — strongest AI citation signal |

---

## Implementation Roadmap

### Sprint 1 (This week): Critical + Quick Wins
Items 1-5 (Critical) + 7, 8 (easy HIGH performance wins)
**Estimated effort: 1 hour**
**Expected score improvement: +5-7 points**

### Sprint 2 (Next week): High Priority
Items 6, 9-14
**Estimated effort: 3 hours**
**Expected score improvement: +4-6 points**

### Sprint 3 (Weeks 3-4): Medium Priority
Items 15-28
**Estimated effort: 6-8 hours**
**Expected score improvement: +3-5 points**

### Backlog
Items 29-37 — tackle opportunistically

**Target score after Sprint 1-3: 90-96/100**
