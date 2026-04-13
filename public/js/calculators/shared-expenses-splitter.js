function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  var p1Income = parseFloat(document.getElementById('input-parent1-income').value) || 0;
  var p2Income = parseFloat(document.getElementById('input-parent2-income').value) || 0;
  var combinedIncome = p1Income + p2Income;

  var methodEl = document.querySelector('input[name="input-split-method"]:checked');
  if (!methodEl) {
    var resultsDiv = document.getElementById('calc-results');
    var contentDiv = document.getElementById('results-content');
    contentDiv.innerHTML = '<p class="text-red-600">Please select a split method.</p>';
    resultsDiv.classList.remove('hidden');
    return;
  }
  var method = methodEl.value;

  var p1Pct, p2Pct;
  if (method === 'proportional') {
    if (combinedIncome <= 0) {
      var resultsDiv = document.getElementById('calc-results');
      var contentDiv = document.getElementById('results-content');
      contentDiv.innerHTML = '<p class="text-red-600">Please enter income for at least one parent to use proportional split.</p>';
      resultsDiv.classList.remove('hidden');
      return;
    }
    p1Pct = (p1Income / combinedIncome) * 100;
    p2Pct = (p2Income / combinedIncome) * 100;
  } else if (method === 'fifty-fifty') {
    p1Pct = 50;
    p2Pct = 50;
  } else {
    p1Pct = parseFloat(document.getElementById('input-custom-pct').value) || 50;
    if (p1Pct < 0) p1Pct = 0;
    if (p1Pct > 100) p1Pct = 100;
    p2Pct = 100 - p1Pct;
  }

  var categories = [
    { name: 'School Fees', amount: parseFloat(document.getElementById('input-school-fees').value) || 0 },
    { name: 'Medical & Health', amount: parseFloat(document.getElementById('input-medical').value) || 0 },
    { name: 'Childcare', amount: parseFloat(document.getElementById('input-childcare').value) || 0 },
    { name: 'Activities & Sports', amount: parseFloat(document.getElementById('input-activities').value) || 0 },
    { name: 'Clothing', amount: parseFloat(document.getElementById('input-clothing').value) || 0 },
    { name: 'Other Expenses', amount: parseFloat(document.getElementById('input-other-expenses').value) || 0 }
  ];

  var totalExpenses = 0;
  for (var i = 0; i < categories.length; i++) {
    totalExpenses += categories[i].amount;
  }

  if (totalExpenses <= 0) {
    var resultsDiv = document.getElementById('calc-results');
    var contentDiv = document.getElementById('results-content');
    contentDiv.innerHTML = '<p class="text-red-600">Please enter at least one expense amount.</p>';
    resultsDiv.classList.remove('hidden');
    return;
  }

  var p1Total = totalExpenses * (p1Pct / 100);
  var p2Total = totalExpenses * (p2Pct / 100);

  // Income split visual bar
  var p1IncomePct = combinedIncome > 0 ? ((p1Income / combinedIncome) * 100).toFixed(1) : '50.0';
  var p2IncomePct = combinedIncome > 0 ? ((p2Income / combinedIncome) * 100).toFixed(1) : '50.0';

  var incomeBarHTML = '';
  if (combinedIncome > 0) {
    incomeBarHTML = '' +
      '<div style="margin-bottom: 1.25rem;">' +
        '<p class="result-note" style="font-weight:600; margin-bottom: 0.5rem;">Income Split</p>' +
        '<div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">' +
          '<span>Parent 1: ' + p1IncomePct + '%</span>' +
          '<span>Parent 2: ' + p2IncomePct + '%</span>' +
        '</div>' +
        '<div style="display:flex; height:24px; border-radius:6px; overflow:hidden;">' +
          '<div style="width:' + p1IncomePct + '%; background:#2C3520; transition:width 0.3s;"></div>' +
          '<div style="width:' + p2IncomePct + '%; background:#BFA956; transition:width 0.3s;"></div>' +
        '</div>' +
        '<p style="font-size:0.8rem; color:#64748b; margin-top:4px;">Parent 1 earns ' + p1IncomePct + '% of combined income (' + formatCurrency(combinedIncome) + '/yr)</p>' +
      '</div>';
  }

  // Split method label
  var methodLabel = method === 'proportional' ? 'Proportional to Income' : method === 'fifty-fifty' ? '50/50 Equal Split' : 'Custom (' + p1Pct.toFixed(1) + '% / ' + p2Pct.toFixed(1) + '%)';

  // Expense split visual bar
  var splitBarHTML = '' +
    '<div style="margin-bottom: 1rem;">' +
      '<p class="result-note" style="font-weight:600; margin-bottom: 0.5rem;">Expense Split: ' + methodLabel + '</p>' +
      '<div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">' +
        '<span>Parent 1: ' + p1Pct.toFixed(1) + '%</span>' +
        '<span>Parent 2: ' + p2Pct.toFixed(1) + '%</span>' +
      '</div>' +
      '<div style="display:flex; height:24px; border-radius:6px; overflow:hidden;">' +
        '<div style="width:' + p1Pct.toFixed(1) + '%; background:#2C3520; transition:width 0.3s;"></div>' +
        '<div style="width:' + p2Pct.toFixed(1) + '%; background:#BFA956; transition:width 0.3s;"></div>' +
      '</div>' +
    '</div>';

  // Expense breakdown table
  var tableRows = '';
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    if (cat.amount > 0) {
      var p1Share = cat.amount * (p1Pct / 100);
      var p2Share = cat.amount * (p2Pct / 100);
      tableRows += '<tr>' +
        '<td style="padding:6px 8px; border-bottom:1px solid #e5e7eb;">' + cat.name + '</td>' +
        '<td style="padding:6px 8px; border-bottom:1px solid #e5e7eb; text-align:right;">' + formatCurrency(cat.amount) + '</td>' +
        '<td style="padding:6px 8px; border-bottom:1px solid #e5e7eb; text-align:right; color:#2C3520; font-weight:600;">' + formatCurrency(p1Share) + '</td>' +
        '<td style="padding:6px 8px; border-bottom:1px solid #e5e7eb; text-align:right; color:#b8860b; font-weight:600;">' + formatCurrency(p2Share) + '</td>' +
      '</tr>';
    }
  }

  var tableHTML = '' +
    '<table style="width:100%; border-collapse:collapse; font-size:0.9rem; margin-bottom:1.25rem;">' +
      '<thead>' +
        '<tr style="background:#f8fafc;">' +
          '<th style="padding:8px; text-align:left; border-bottom:2px solid #e5e7eb;">Expense</th>' +
          '<th style="padding:8px; text-align:right; border-bottom:2px solid #e5e7eb;">Annual</th>' +
          '<th style="padding:8px; text-align:right; border-bottom:2px solid #e5e7eb; color:#2C3520;">Parent 1</th>' +
          '<th style="padding:8px; text-align:right; border-bottom:2px solid #e5e7eb; color:#b8860b;">Parent 2</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' + tableRows +
        '<tr style="font-weight:700; background:#f8fafc;">' +
          '<td style="padding:8px; border-top:2px solid #2C3520;">Total</td>' +
          '<td style="padding:8px; text-align:right; border-top:2px solid #2C3520;">' + formatCurrency(totalExpenses) + '</td>' +
          '<td style="padding:8px; text-align:right; border-top:2px solid #2C3520; color:#2C3520;">' + formatCurrency(p1Total) + '</td>' +
          '<td style="padding:8px; text-align:right; border-top:2px solid #2C3520; color:#b8860b;">' + formatCurrency(p2Total) + '</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>';

  // Summary cards — annual, monthly, fortnightly
  var p1Monthly = p1Total / 12;
  var p2Monthly = p2Total / 12;
  var p1Fortnightly = p1Total / 26.07;
  var p2Fortnightly = p2Total / 26.07;

  var summaryHTML = '' +
    '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1.25rem;">' +
      '<div style="background:#2C3520; color:white; border-radius:8px; padding:1rem; text-align:center;">' +
        '<div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8; margin-bottom:4px;">Parent 1 — Annual</div>' +
        '<div style="font-size:1.5rem; font-weight:800;">' + formatCurrency(p1Total) + '</div>' +
        '<div style="font-size:0.8rem; opacity:0.8; margin-top:4px;">' + formatCurrency(p1Monthly) + '/mo &nbsp;·&nbsp; ' + formatCurrency(p1Fortnightly) + '/fn</div>' +
      '</div>' +
      '<div style="background:#BFA956; color:#2C3520; border-radius:8px; padding:1rem; text-align:center;">' +
        '<div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; opacity:0.7; margin-bottom:4px;">Parent 2 — Annual</div>' +
        '<div style="font-size:1.5rem; font-weight:800;">' + formatCurrency(p2Total) + '</div>' +
        '<div style="font-size:0.8rem; opacity:0.7; margin-top:4px;">' + formatCurrency(p2Monthly) + '/mo &nbsp;·&nbsp; ' + formatCurrency(p2Fortnightly) + '/fn</div>' +
      '</div>' +
    '</div>';

  var noteHTML = '<p style="font-size:0.8rem; color:#64748b; font-style:italic; margin-top:0.75rem;">Note: These are shared child-related expenses only. They are additional costs beyond any child support payments. Child support is calculated separately by Services Australia.</p>';

  var html = incomeBarHTML + splitBarHTML + tableHTML + summaryHTML + noteHTML;

  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');
  contentDiv.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

function getTLDR() {
  var methodEl = document.querySelector('input[name="input-split-method"]:checked');
  if (!methodEl) return '';

  var categories = [
    parseFloat(document.getElementById('input-school-fees').value) || 0,
    parseFloat(document.getElementById('input-medical').value) || 0,
    parseFloat(document.getElementById('input-childcare').value) || 0,
    parseFloat(document.getElementById('input-activities').value) || 0,
    parseFloat(document.getElementById('input-clothing').value) || 0,
    parseFloat(document.getElementById('input-other-expenses').value) || 0
  ];

  var total = 0;
  for (var i = 0; i < categories.length; i++) total += categories[i];
  if (total <= 0) return '';

  var method = methodEl.value;
  var p1Pct;
  if (method === 'proportional') {
    var p1Inc = parseFloat(document.getElementById('input-parent1-income').value) || 0;
    var p2Inc = parseFloat(document.getElementById('input-parent2-income').value) || 0;
    var combined = p1Inc + p2Inc;
    if (combined <= 0) return '';
    p1Pct = (p1Inc / combined) * 100;
  } else if (method === 'fifty-fifty') {
    p1Pct = 50;
  } else {
    p1Pct = parseFloat(document.getElementById('input-custom-pct').value) || 50;
  }

  var p1Total = total * (p1Pct / 100);
  var p2Total = total - p1Total;

  return 'Shared expenses: ' + formatCurrency(total) + '/yr. Parent 1 pays ' + formatCurrency(p1Total) + ' (' + p1Pct.toFixed(0) + '%), Parent 2 pays ' + formatCurrency(p2Total) + ' (' + (100 - p1Pct).toFixed(0) + '%). That\'s ' + formatCurrency(p1Total / 26.07) + ' vs ' + formatCurrency(p2Total / 26.07) + ' per fortnight.';
}
