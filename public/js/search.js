// CalcMate search — works across header, mobile, and hero inputs
(function() {
  let debounceTimer;

  function setupSearch(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    if (!input || !results) return;

    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      const q = this.value.trim();
      if (q.length < 2) { results.classList.add('hidden'); results.innerHTML = ''; return; }
      debounceTimer = setTimeout(() => {
        fetch('/api/search?q=' + encodeURIComponent(q))
          .then(r => r.json())
          .then(data => {
            if (!data.length) {
              results.innerHTML = '<div class="p-4 text-sm text-gray-400">No calculators found</div>';
              results.classList.remove('hidden');
              return;
            }
            results.innerHTML = data.map(c =>
              '<a href="' + c.url + '" class="block px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0">' +
                '<div class="font-medium text-navy text-sm">' + esc(c.title) + '</div>' +
                '<div class="text-xs text-gray-400 mt-0.5">' + esc(c.description) + '</div>' +
              '</a>'
            ).join('');
            results.classList.remove('hidden');
          });
      }, 200);
    });

    input.addEventListener('blur', () => setTimeout(() => results.classList.add('hidden'), 200));
    input.addEventListener('focus', function() { if (this.value.trim().length >= 2) input.dispatchEvent(new Event('input')); });
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  setupSearch('search-input', 'search-results');
  setupSearch('search-input-mobile', 'search-results-mobile');
  setupSearch('hero-search', 'hero-search-results');
})();
