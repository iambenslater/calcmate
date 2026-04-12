/**
 * CalculatorMate — Results Enhancement Layer
 *
 * Adds shareable URLs, share modal, PDF export, and email results
 * to ALL calculators without modifying individual calculator JS files.
 *
 * Hooks into the calculate flow via window.onCalculateComplete() callback.
 */
(function() {
  'use strict';

  // ============================================================
  // PHASE 1: SHAREABLE URLs — Pre-fill from URL params + update URL after calculate
  // ============================================================

  const calcInputs = window._calcInputs || [];
  const calcSlug = window._calcSlug || '';
  const calcCategory = window._calcCategory || '';
  const calcTitle = window._calcTitle || '';
  // Pre-fill inputs from URL params on page load
  function prefillFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.toString() === '') return false;

    let filled = false;
    calcInputs.forEach(function(inp) {
      const val = params.get(inp.id);
      if (val === null) return;

      if (inp.type === 'radio') {
        const radio = document.querySelector('input[name="input-' + inp.id + '"][value="' + val + '"]');
        if (radio) { radio.checked = true; filled = true; }
      } else if (inp.type === 'checkbox') {
        const cb = document.getElementById('input-' + inp.id);
        if (cb) { cb.checked = (val === 'yes' || val === 'true' || val === '1'); filled = true; }
      } else {
        const el = document.getElementById('input-' + inp.id);
        if (el) { el.value = val; filled = true; }
      }
    });

    return filled;
  }

  // Update URL with current input values (no page reload)
  function updateShareableURL() {
    var params = new URLSearchParams();
    calcInputs.forEach(function(inp) {
      var val;
      if (inp.type === 'radio') {
        var radio = document.querySelector('input[name="input-' + inp.id + '"]:checked');
        val = radio ? radio.value : '';
      } else if (inp.type === 'checkbox') {
        var cb = document.getElementById('input-' + inp.id);
        val = cb && cb.checked ? 'yes' : 'no';
      } else {
        var el = document.getElementById('input-' + inp.id);
        val = el ? el.value : '';
      }
      if (val !== '' && val !== undefined) params.set(inp.id, val);
    });

    var newURL = window.location.pathname + '?' + params.toString();
    history.replaceState(null, '', newURL);
    return window.location.origin + newURL;
  }

  // Get primary result text for sharing
  function getPrimaryResult() {
    var boldRow = document.querySelector('#results-content .font-bold .result-value, #results-content .result-value');
    return boldRow ? boldRow.textContent.trim() : '';
  }

  // ============================================================
  // PHASE 3: SHARE MODAL
  // ============================================================

  function injectShareButton() {
    var resultsDiv = document.getElementById('calc-results');
    if (!resultsDiv) return;

    // Remove existing share button if present
    var existing = document.getElementById('share-result-btn');
    if (existing) existing.remove();

    var btn = document.createElement('button');
    btn.id = 'share-result-btn';
    btn.className = 'w-full sm:w-auto mt-4 px-6 py-3 bg-navy text-white font-bold rounded-lg hover:bg-blue-800 transition shadow-sm flex items-center justify-center gap-2';
    btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg> Share or Save This Result';
    btn.addEventListener('click', openShareModal);

    var resultsContent = document.getElementById('results-content');
    if (resultsContent) resultsContent.parentElement.appendChild(btn);
  }

  function openShareModal() {
    var shareUrl = updateShareableURL();
    var primaryResult = getPrimaryResult();
    var shareText = calcTitle + ': ' + primaryResult + ' — Calculate yours free at CalculatorMate';

    // Remove existing modal
    var existing = document.getElementById('share-modal-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'share-modal-overlay';
    overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

    var encodedUrl = encodeURIComponent(shareUrl);
    var encodedText = encodeURIComponent(shareText);

    overlay.innerHTML = '<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">' +
      '<div class="p-6">' +
        '<div class="flex justify-between items-center mb-4">' +
          '<h3 class="text-lg font-bold text-navy">Share or Save This Result</h3>' +
          '<button onclick="document.getElementById(\'share-modal-overlay\').remove()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>' +
        '</div>' +

        // Result preview
        '<div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">' +
          '<div class="font-medium text-navy">' + calcTitle + '</div>' +
          '<div class="text-gold font-bold mt-1">' + primaryResult + '</div>' +
        '</div>' +

        // Copy link
        '<div class="mb-4">' +
          '<label class="block text-sm font-medium text-gray-700 mb-1">Shareable Link</label>' +
          '<div class="flex gap-2">' +
            '<input type="text" value="' + shareUrl + '" readonly class="flex-1 px-3 py-2 text-sm border rounded-lg bg-gray-50 text-gray-600" id="share-url-input">' +
            '<button onclick="navigator.clipboard.writeText(document.getElementById(\'share-url-input\').value).then(function(){var b=event.target;b.textContent=\'Copied!\';setTimeout(function(){b.textContent=\'Copy\'},1500)})" class="px-4 py-2 bg-gold text-navy font-bold rounded-lg text-sm hover:bg-yellow-400 transition">Copy</button>' +
          '</div>' +
        '</div>' +

        // Social share
        '<div class="mb-4">' +
          '<label class="block text-sm font-medium text-gray-700 mb-2">Share on</label>' +
          '<div class="flex gap-2">' +
            '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl + '" target="_blank" rel="noopener" class="flex-1 py-2 bg-blue-600 text-white rounded-lg text-center text-sm font-medium hover:bg-blue-700 transition">Facebook</a>' +
            '<a href="https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedText + '" target="_blank" rel="noopener" class="flex-1 py-2 bg-gray-900 text-white rounded-lg text-center text-sm font-medium hover:bg-gray-700 transition">X</a>' +
            '<a href="https://wa.me/?text=' + encodedText + '%20' + encodedUrl + '" target="_blank" rel="noopener" class="flex-1 py-2 bg-green-500 text-white rounded-lg text-center text-sm font-medium hover:bg-green-600 transition">WhatsApp</a>' +
          '</div>' +
        '</div>' +

        // Download PDF
        '<button id="share-pdf-btn" class="w-full py-3 bg-gray-100 text-navy font-bold rounded-lg text-sm hover:bg-gray-200 transition flex items-center justify-center gap-2">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> Download as PDF' +
        '</button>' +

      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    // Wire up PDF button
    document.getElementById('share-pdf-btn').addEventListener('click', downloadPDF);
  }

  // ============================================================
  // PHASE 4: PDF EXPORT (Client-Side)
  // ============================================================

  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function downloadPDF() {
    var btn = document.getElementById('share-pdf-btn');
    btn.textContent = 'Generating PDF...';
    btn.disabled = true;

    try {
      // Lazy load libraries
      if (!window.jspdf) {
        await Promise.all([
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
        ]);
      }

      var jsPDF = window.jspdf.jsPDF;
      var doc = new jsPDF('p', 'mm', 'a4');
      var pageWidth = doc.internal.pageSize.getWidth();
      var margin = 15;
      var y = margin;

      // Header
      doc.setFillColor(0, 32, 91); // navy
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 184, 0); // gold
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CalculatorMate', margin, 13);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('calculatormate.com.au', pageWidth - margin, 13, { align: 'right' });
      y = 30;

      // Title
      doc.setTextColor(0, 32, 91);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(calcTitle, margin, y);
      y += 10;

      // Date
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Generated on ' + new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }), margin, y);
      y += 8;

      // Inputs used
      doc.setTextColor(0, 32, 91);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Inputs', margin, y);
      y += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);

      calcInputs.forEach(function(inp) {
        var val;
        if (inp.type === 'radio') {
          var r = document.querySelector('input[name="input-' + inp.id + '"]:checked');
          val = r ? r.value : '-';
        } else if (inp.type === 'checkbox') {
          var cb = document.getElementById('input-' + inp.id);
          val = cb && cb.checked ? 'Yes' : 'No';
        } else {
          var el = document.getElementById('input-' + inp.id);
          val = el ? el.value : '-';
        }
        doc.text(inp.label + ': ' + val, margin, y);
        y += 5;
      });
      y += 4;

      // Results — capture as image
      var resultsEl = document.getElementById('results-content');
      if (resultsEl) {
        var canvas = await html2canvas(resultsEl, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
        var imgData = canvas.toDataURL('image/png');
        var imgWidth = pageWidth - (margin * 2);
        var imgHeight = (canvas.height / canvas.width) * imgWidth;

        // Check if we need a new page
        if (y + imgHeight > 270) { doc.addPage(); y = margin; }

        doc.setTextColor(0, 32, 91);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Results', margin, y);
        y += 4;
        doc.addImage(imgData, 'PNG', margin, y, imgWidth, Math.min(imgHeight, 120));
        y += Math.min(imgHeight, 120) + 6;
      }

      // Disclaimer
      if (y + 20 > 280) { doc.addPage(); y = margin; }
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Disclaimer: This is an estimate only. Results should not be relied upon as financial, tax, or professional advice.', margin, y);
      y += 3;
      doc.text('Always consult a qualified professional. Australian tax rates based on ATO published rates for the current financial year.', margin, y);
      y += 3;
      doc.text('Generated by CalculatorMate — calculatormate.com.au', margin, y);

      doc.save(calcSlug + '-result.pdf');
    } catch (e) {
      console.error('PDF generation error:', e);
      alert('PDF generation failed. Please try again.');
    }

    btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> Download as PDF';
    btn.disabled = false;
  }

  // ============================================================
  // PHASE 5: EMAIL RESULTS
  // ============================================================

  function sendEmailResult() {
    var emailInput = document.getElementById('share-email-input');
    var statusEl = document.getElementById('share-email-status');
    var btn = document.getElementById('share-email-btn');
    var email = emailInput.value.trim();

    if (!email || !email.includes('@')) {
      statusEl.textContent = 'Please enter a valid email address.';
      statusEl.className = 'text-xs mt-1 text-red-500';
      return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;

    var shareUrl = window.location.origin + window.location.pathname + window.location.search;
    var primaryResult = getPrimaryResult();

    // Build result summary from result rows
    var rows = document.querySelectorAll('#results-content .result-row');
    var summary = '';
    rows.forEach(function(row) {
      var label = row.querySelector('.result-label');
      var value = row.querySelector('.result-value');
      if (label && value) summary += label.textContent.trim() + ': ' + value.textContent.trim() + '\n';
    });

    fetch('/api/email-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        calculatorTitle: calcTitle,
        calculatorSlug: calcSlug,
        calculatorCategory: calcCategory,
        resultsSummary: summary,
        primaryResult: primaryResult,
        shareUrl: shareUrl
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        statusEl.textContent = 'Result sent to ' + email + '!';
        statusEl.className = 'text-xs mt-1 text-green-600';
        emailInput.value = '';
      } else {
        statusEl.textContent = data.error || 'Failed to send. Try again.';
        statusEl.className = 'text-xs mt-1 text-red-500';
      }
    })
    .catch(function() {
      statusEl.textContent = 'Failed to send. Try again.';
      statusEl.className = 'text-xs mt-1 text-red-500';
    })
    .finally(function() {
      btn.textContent = 'Send';
      btn.disabled = false;
    });
  }

  // ============================================================
  // MAIN HOOK — Called after every calculate()
  // ============================================================

  window.onCalculateComplete = function() {
    // Update shareable URL
    updateShareableURL();

    // Inject share button
    injectShareButton();
  };

  // ============================================================
  // ON PAGE LOAD — Pre-fill from URL params and auto-calculate
  // ============================================================

  document.addEventListener('DOMContentLoaded', function() {
    if (prefillFromURL()) {
      // Auto-calculate after a short delay to ensure calculator JS is loaded
      setTimeout(function() {
        var btn = document.getElementById('calc-btn');
        if (btn) btn.click();
      }, 500);
    }
  });

})();
