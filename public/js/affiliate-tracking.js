/**
 * Affiliate click tracking for CalculatorMate
 * Tracks clicks on Amazon AU affiliate links via sendBeacon
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('a[href*="amazon.com.au"][href*="tag=benslater-22"]');
    if (!links.length) return;

    var calcSlug =
      (document.querySelector('[data-calculator-slug]') || {}).dataset &&
      document.querySelector('[data-calculator-slug]').dataset.calculatorSlug
        ? document.querySelector('[data-calculator-slug]').dataset.calculatorSlug
        : window.location.pathname;

    var affContext =
      (document.querySelector('[data-affiliate-context]') || {}).dataset &&
      document.querySelector('[data-affiliate-context]').dataset.affiliateContext
        ? document.querySelector('[data-affiliate-context]').dataset.affiliateContext
        : 'unknown';

    links.forEach(function (link, index) {
      link.addEventListener('click', function () {
        var href = link.href || '';
        var product = '';

        // Try to extract ASIN from /dp/ASIN pattern
        var dpMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
        if (dpMatch) {
          product = dpMatch[1];
        } else {
          // Try to extract search query from ?k= param
          try {
            var url = new URL(href);
            product = url.searchParams.get('k') || url.searchParams.get('keywords') || '';
          } catch (e) {
            product = '';
          }
        }

        var payload = JSON.stringify({
          calculator: calcSlug,
          product: product,
          context: affContext,
          position: index
        });

        if (navigator.sendBeacon) {
          var blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/affiliate-click', blob);
        }
        // Do NOT prevent default — Amazon link opens normally
      });
    });
  });
})();
