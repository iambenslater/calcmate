(function() {
  var textarea = document.getElementById('ai-search');
  var btn = document.getElementById('ai-search-btn');
  var results = document.getElementById('ai-results');
  var loading = document.getElementById('ai-loading');
  if (!textarea || !btn) return;

  btn.addEventListener('click', doSearch);
  textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSearch(); }
  });

  function doSearch() {
    var query = textarea.value.trim();
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
          html += '<p class="text-xs text-gold mt-1 font-medium">Pre-filled with your values →</p>';
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
      results.innerHTML = '<p class="text-sm text-red-500">Something went wrong. Please try the keyword search instead.</p>';
      results.classList.remove('hidden');
    });
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
