// CalcMate search — works across header, mobile, and hero inputs
(function() {
  let debounceTimer;

  const categoryIcons = {
    finance: '💰', property: '🏠', health: '❤️', business: '💼',
    car: '🚗', super: '🏦', trade: '🔨', conversions: '🔄',
    'advanced-finance': '📊', investment: '📈', fun: '🎉', lifestyle: '🌏'
  };

  const categoryLabels = {
    finance: 'Finance', property: 'Property', health: 'Health', business: 'Business',
    car: 'Car & Transport', super: 'Super', trade: 'Construction', conversions: 'Conversions',
    'advanced-finance': 'Advanced', investment: 'Investment', fun: 'Fun', lifestyle: 'Lifestyle'
  };

  // Popular searches shown on focus (hero only)
  var popularHtml = '<div class="px-4 pt-3 pb-1"><p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Popular calculators</p></div>' +
    [
      { url: '/finance/take-home-pay', title: 'Take Home Pay Calculator', cat: 'finance', desc: 'What will I actually take home?' },
      { url: '/property/mortgage-repayment', title: 'Mortgage Repayment Calculator', cat: 'property', desc: 'Monthly repayments on your home loan' },
      { url: '/property/stamp-duty-all-states', title: 'Stamp Duty Calculator', cat: 'property', desc: 'Stamp duty for every state' },
      { url: '/health/bmi', title: 'BMI Calculator', cat: 'health', desc: 'Check your body mass index' },
      { url: '/conversions/gst-calculator', title: 'GST Calculator', cat: 'conversions', desc: 'Add or remove GST instantly' },
      { url: '/finance/budget-planner', title: 'Budget Planner', cat: 'finance', desc: 'Build a 50/30/20 budget' }
    ].map(function(c) {
      return '<a href="' + c.url + '" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition">' +
        '<span class="text-lg shrink-0">' + (categoryIcons[c.cat] || '🔢') + '</span>' +
        '<div class="min-w-0 flex-1">' +
          '<div class="font-medium text-navy text-sm truncate">' + c.title + '</div>' +
          '<div class="text-xs text-gray-400 truncate">' + c.desc + '</div>' +
        '</div>' +
        '<span class="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">' + (categoryLabels[c.cat] || '') + '</span>' +
      '</a>';
    }).join('');

  function buildResultHtml(c) {
    var icon = categoryIcons[c.category] || '🔢';
    var label = categoryLabels[c.category] || c.category;
    return '<a href="' + c.url + '" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition border-b border-gray-50 last:border-0">' +
      '<span class="text-lg shrink-0">' + icon + '</span>' +
      '<div class="min-w-0 flex-1">' +
        '<div class="font-medium text-navy text-sm truncate">' + esc(c.title) + '</div>' +
        '<div class="text-xs text-gray-400 mt-0.5 truncate">' + esc(c.description) + '</div>' +
      '</div>' +
      '<span class="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">' + esc(label) + '</span>' +
    '</a>';
  }

  function setupSearch(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    if (!input || !results) return;
    const isHero = inputId === 'hero-search';

    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      const q = this.value.trim();
      if (q.length < 2) {
        if (isHero && q.length === 0 && document.activeElement === input) {
          results.innerHTML = popularHtml;
          results.classList.remove('hidden');
        } else {
          results.classList.add('hidden');
          results.innerHTML = '';
        }
        return;
      }
      // If AI mode is active (question detected), suppress keyword search
      if (window._aiMode && isHero) { results.classList.add('hidden'); results.innerHTML = ''; return; }
      debounceTimer = setTimeout(() => {
        fetch('/api/search?q=' + encodeURIComponent(q))
          .then(r => r.json())
          .then(data => {
            if (!data.length) {
              results.innerHTML = '<div class="p-4 text-sm text-gray-400">No calculators found — try a different term</div>';
              results.classList.remove('hidden');
              return;
            }
            results.innerHTML = data.map(buildResultHtml).join('');
            results.classList.remove('hidden');
          });
      }, 200);
    });

    input.addEventListener('blur', () => setTimeout(() => results.classList.add('hidden'), 200));
    input.addEventListener('focus', function() {
      var q = this.value.trim();
      if (isHero && q.length === 0) {
        results.innerHTML = popularHtml;
        results.classList.remove('hidden');
      } else if (q.length >= 2) {
        input.dispatchEvent(new Event('input'));
      }
    });
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  setupSearch('search-input', 'search-results');
  setupSearch('search-input-mobile', 'search-results-mobile');
  setupSearch('hero-search', 'hero-search-results');

  // Keyboard shortcut: Cmd+K or Ctrl+K focuses hero search
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      var heroInput = document.getElementById('hero-search');
      if (heroInput) { heroInput.focus(); heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
  });
})();
