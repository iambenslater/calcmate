(function() {
  var input = document.getElementById('hero-search');
  var btn = document.getElementById('ai-search-btn');
  var keywordResults = document.getElementById('hero-search-results');
  var results = document.getElementById('ai-results');
  var loading = document.getElementById('ai-loading');
  if (!input || !btn) return;

  function looksLikeQuestion(q) {
    if (q.indexOf('?') !== -1) return true;
    var starters = /^(what|how|can|do|should|will|is|are|if i|i want|i need|i earn|i make|my |calculate my|show me|help me|tell me|i'm |im |i am )/i;
    if (starters.test(q)) return true;
    // Contains a dollar amount + other words = likely a question
    if (/\$[\d,]+/.test(q) && q.split(/\s+/).length >= 4) return true;
    return false;
  }

  // Show/hide Ask Mate button based on input
  input.addEventListener('input', function() {
    var q = input.value.trim();
    if (q.length >= 8 && looksLikeQuestion(q)) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
    // Hide AI results when user changes input
    results.classList.add('hidden');
  });

  // Enter key: if it looks like a question, do AI search instead of keyword
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var q = input.value.trim();
      if (q.length >= 8 && looksLikeQuestion(q)) {
        e.preventDefault();
        // Hide keyword results
        keywordResults.classList.add('hidden');
        doSearch();
      }
      // Otherwise, let the default keyword search handle it
    }
  });

  btn.addEventListener('click', function() {
    keywordResults.classList.add('hidden');
    doSearch();
  });

  function doSearch() {
    var query = input.value.trim();
    if (query.length < 10) {
      results.innerHTML = '<p class="text-sm text-red-500">Please ask a more detailed question.</p>';
      results.classList.remove('hidden');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Thinking...';
    loading.classList.remove('hidden');
    results.classList.add('hidden');

    fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      loading.classList.add('hidden');
      btn.disabled = false;
      btn.textContent = 'Ask Mate';

      if (data.error) {
        results.innerHTML = '<p class="text-sm text-red-500">' + escHtml(data.error) + '</p>';
        results.classList.remove('hidden');
        return;
      }

      if (!data.matches || data.matches.length === 0) {
        results.innerHTML = '<p class="text-sm text-gray-500">' + escHtml(data.summary || 'No matching calculators found.') + '</p>';
        results.classList.remove('hidden');
        return;
      }

      var html = '<div class="text-left">';
      html += '<p class="text-sm text-gray-600 mb-3">' + escHtml(data.summary) + '</p>';
      html += '<div class="space-y-2">';

      data.matches.forEach(function(m, idx) {
        var url = m.url;
        if (m.inputs && Object.keys(m.inputs).length > 0) {
          var params = new URLSearchParams();
          params.set('prefill', '1');
          Object.keys(m.inputs).forEach(function(k) {
            params.set(k, m.inputs[k]);
          });
          url += '?' + params.toString();
        }

        html += '<a href="' + escHtml(url) + '" class="group flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md border border-gray-100 hover:border-gold/50 transition">';
        html += '<span class="flex-shrink-0 w-7 h-7 rounded-full bg-navy text-white text-sm font-bold flex items-center justify-center mt-0.5">' + (idx + 1) + '</span>';
        html += '<div class="flex-1 min-w-0">';
        html += '<h3 class="font-semibold text-sm text-navy group-hover:text-gold transition">' + escHtml(m.title) + '</h3>';
        html += '<p class="text-xs text-gray-500 mt-0.5">' + escHtml(m.reason) + '</p>';
        if (m.inputs && Object.keys(m.inputs).length > 0) {
          html += '<p class="text-xs text-gold mt-1 font-medium">Pre-filled with your values \u2192</p>';
        }
        html += '</div></a>';
      });

      html += '</div></div>';
      results.innerHTML = html;
      results.classList.remove('hidden');
    })
    .catch(function() {
      loading.classList.add('hidden');
      btn.disabled = false;
      btn.textContent = 'Ask Mate';
      results.innerHTML = '<p class="text-sm text-red-500">Something went wrong. Please try a keyword search instead.</p>';
      results.classList.remove('hidden');
    });
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
