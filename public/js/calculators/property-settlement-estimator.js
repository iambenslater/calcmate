function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatCurrencyExact(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  var relationshipYears = parseFloat(document.getElementById('input-relationship-years').value) || 0;
  var numChildren = parseInt(document.getElementById('input-num-children').value) || 0;
  var primaryCarerEl = document.querySelector('input[name="input-primary-carer"]:checked');
  var primaryCarer = primaryCarerEl ? primaryCarerEl.value : 'none';

  var propertyValue = parseFloat(document.getElementById('input-property-value').value) || 0;
  var mortgage = parseFloat(document.getElementById('input-mortgage').value) || 0;
  var p1Super = parseFloat(document.getElementById('input-parent1-super').value) || 0;
  var p2Super = parseFloat(document.getElementById('input-parent2-super').value) || 0;
  var savings = parseFloat(document.getElementById('input-savings').value) || 0;
  var vehicles = parseFloat(document.getElementById('input-vehicles').value) || 0;
  var otherAssets = parseFloat(document.getElementById('input-other-assets').value) || 0;
  var otherDebts = parseFloat(document.getElementById('input-other-debts').value) || 0;

  var p1Income = parseFloat(document.getElementById('input-parent1-income').value) || 0;
  var p2Income = parseFloat(document.getElementById('input-parent2-income').value) || 0;

  // Step 1: Asset Pool
  var totalAssets = propertyValue + p1Super + p2Super + savings + vehicles + otherAssets;
  var totalDebts = mortgage + otherDebts;
  var netPool = totalAssets - totalDebts;
  var superTotal = p1Super + p2Super;

  if (totalAssets <= 0) {
    var resultsDiv = document.getElementById('calc-results');
    var contentDiv = document.getElementById('results-content');
    contentDiv.innerHTML = '<p class="text-red-600">Please enter at least one asset value to estimate a settlement.</p>';
    resultsDiv.classList.remove('hidden');
    return;
  }

  // Step 2: Estimate split adjustments
  // Start at 50/50, calculate adjustment range that shifts toward one parent
  var adjLow = 0;  // low end of adjustment (percentage points toward favoured parent)
  var adjHigh = 0; // high end of adjustment

  var factors = [];
  var favouredParent = ''; // 'parent1' or 'parent2' — who gets the extra

  // Primary carer adjustment
  var carerAdj = 0;
  var carerAdjHigh = 0;
  if (primaryCarer === 'parent1' || primaryCarer === 'parent2') {
    if (numChildren >= 3) { carerAdj = 7; carerAdjHigh = 10; }
    else if (numChildren === 2) { carerAdj = 5; carerAdjHigh = 7; }
    else if (numChildren === 1) { carerAdj = 3; carerAdjHigh = 5; }
    else { carerAdj = 0; carerAdjHigh = 0; }

    if (carerAdj > 0) {
      factors.push({
        description: 'Primary carer of ' + numChildren + ' child' + (numChildren > 1 ? 'ren' : '') + ' (' + (primaryCarer === 'parent1' ? 'Parent 1' : 'Parent 2') + ')',
        direction: primaryCarer,
        low: carerAdj,
        high: carerAdjHigh
      });
    }
  } else if (primaryCarer === 'shared') {
    factors.push({
      description: 'Shared care arrangement — no carer adjustment',
      direction: 'neutral',
      low: 0,
      high: 0
    });
  }

  // Income disparity adjustment
  var combinedIncome = p1Income + p2Income;
  var incomeAdj = 0;
  var incomeAdjHigh = 0;
  var lowerEarner = '';
  if (combinedIncome > 0) {
    var higherIncome = Math.max(p1Income, p2Income);
    var disparityRatio = higherIncome / combinedIncome;
    lowerEarner = p1Income <= p2Income ? 'parent1' : 'parent2';

    if (disparityRatio > 0.65) {
      incomeAdj = 5;
      incomeAdjHigh = 7;
      factors.push({
        description: 'Significant income disparity (' + (disparityRatio * 100).toFixed(0) + '/' + ((1 - disparityRatio) * 100).toFixed(0) + ' split) — adjustment toward ' + (lowerEarner === 'parent1' ? 'Parent 1' : 'Parent 2'),
        direction: lowerEarner,
        low: incomeAdj,
        high: incomeAdjHigh
      });
    } else if (disparityRatio > 0.55) {
      incomeAdj = 3;
      incomeAdjHigh = 5;
      factors.push({
        description: 'Moderate income disparity (' + (disparityRatio * 100).toFixed(0) + '/' + ((1 - disparityRatio) * 100).toFixed(0) + ' split) — adjustment toward ' + (lowerEarner === 'parent1' ? 'Parent 1' : 'Parent 2'),
        direction: lowerEarner,
        low: incomeAdj,
        high: incomeAdjHigh
      });
    }
  }

  // Relationship length modifier
  var lengthNote = '';
  if (relationshipYears < 5) {
    lengthNote = 'Short relationship (' + relationshipYears + ' years) — adjustments reduced';
    for (var i = 0; i < factors.length; i++) {
      if (factors[i].direction !== 'neutral') {
        factors[i].low = Math.round(factors[i].low * 0.5);
        factors[i].high = Math.round(factors[i].high * 0.5);
        factors[i].description += ' (halved for short relationship)';
      }
    }
  } else if (relationshipYears > 20) {
    lengthNote = 'Long relationship (' + relationshipYears + ' years) — contributions tend to equalise';
    // Cap total adjustments
    for (var i = 0; i < factors.length; i++) {
      if (factors[i].high > 5) {
        factors[i].high = 5;
        if (factors[i].low > factors[i].high) factors[i].low = factors[i].high;
        factors[i].description += ' (capped for long relationship)';
      }
    }
  }

  // Calculate net adjustments per parent
  var p1AdjLow = 0, p1AdjHigh = 0;
  for (var i = 0; i < factors.length; i++) {
    if (factors[i].direction === 'parent1') {
      p1AdjLow += factors[i].low;
      p1AdjHigh += factors[i].high;
    } else if (factors[i].direction === 'parent2') {
      p1AdjLow -= factors[i].high;
      p1AdjHigh -= factors[i].low;
    }
  }

  // Final split range for Parent 1
  var p1PctLow = 50 + Math.min(p1AdjLow, p1AdjHigh);
  var p1PctHigh = 50 + Math.max(p1AdjLow, p1AdjHigh);

  // Ensure sensible bounds
  if (p1PctLow < 20) p1PctLow = 20;
  if (p1PctHigh > 80) p1PctHigh = 80;
  if (p1PctLow > p1PctHigh) { var tmp = p1PctLow; p1PctLow = p1PctHigh; p1PctHigh = tmp; }

  var p2PctLow = 100 - p1PctHigh;
  var p2PctHigh = 100 - p1PctLow;

  var p1DollarLow = netPool * (p1PctLow / 100);
  var p1DollarHigh = netPool * (p1PctHigh / 100);
  var p2DollarLow = netPool * (p2PctLow / 100);
  var p2DollarHigh = netPool * (p2PctHigh / 100);

  // Build output HTML

  // Asset pool breakdown table
  var assetRows = '';
  var assetItems = [
    { name: 'Property / Home', value: propertyValue, type: 'asset' },
    { name: 'Parent 1 Superannuation', value: p1Super, type: 'asset' },
    { name: 'Parent 2 Superannuation', value: p2Super, type: 'asset' },
    { name: 'Savings & Cash', value: savings, type: 'asset' },
    { name: 'Vehicles', value: vehicles, type: 'asset' },
    { name: 'Other Assets', value: otherAssets, type: 'asset' },
    { name: 'Mortgage', value: mortgage, type: 'debt' },
    { name: 'Other Debts', value: otherDebts, type: 'debt' }
  ];

  for (var i = 0; i < assetItems.length; i++) {
    var item = assetItems[i];
    if (item.value > 0) {
      var isDebt = item.type === 'debt';
      assetRows += '<tr>' +
        '<td style="padding:6px 8px; border-bottom:1px solid #e5e7eb;">' + item.name + '</td>' +
        '<td style="padding:6px 8px; border-bottom:1px solid #e5e7eb; text-align:right; color:' + (isDebt ? '#dc2626' : '#16a34a') + '; font-weight:600;">' + (isDebt ? '−' : '') + formatCurrency(item.value) + '</td>' +
      '</tr>';
    }
  }

  var poolTableHTML = '' +
    '<p class="result-note" style="font-weight:600; margin-bottom:0.5rem;">Asset Pool Breakdown</p>' +
    '<table style="width:100%; border-collapse:collapse; font-size:0.9rem; margin-bottom:1rem;">' +
      '<thead>' +
        '<tr style="background:#f8fafc;">' +
          '<th style="padding:8px; text-align:left; border-bottom:2px solid #e5e7eb;">Item</th>' +
          '<th style="padding:8px; text-align:right; border-bottom:2px solid #e5e7eb;">Value</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' + assetRows +
        '<tr style="background:#f8fafc;">' +
          '<td style="padding:8px; font-weight:700; border-top:2px solid #1a1a1a;">Total Assets</td>' +
          '<td style="padding:8px; text-align:right; font-weight:700; color:#16a34a; border-top:2px solid #1a1a1a;">' + formatCurrency(totalAssets) + '</td>' +
        '</tr>' +
        '<tr style="background:#f8fafc;">' +
          '<td style="padding:8px; font-weight:700;">Total Debts</td>' +
          '<td style="padding:8px; text-align:right; font-weight:700; color:#dc2626;">−' + formatCurrency(totalDebts) + '</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>';

  // Net asset pool big number
  var poolColour = netPool >= 0 ? '#1a1a1a' : '#dc2626';
  var netPoolHTML = '' +
    '<div style="text-align:center; padding:1.25rem 0; margin-bottom:1rem; background:#f8fafc; border-radius:8px;">' +
      '<div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:#64748b; margin-bottom:4px;">Net Asset Pool</div>' +
      '<div style="font-size:2.2rem; font-weight:900; color:' + poolColour + ';">' + formatCurrency(Math.abs(netPool)) + '</div>' +
      (superTotal > 0 ? '<div style="font-size:0.8rem; color:#64748b; margin-top:4px;">Includes ' + formatCurrency(superTotal) + ' in superannuation</div>' : '') +
    '</div>';

  // Super callout
  var superHTML = '';
  if (superTotal > 0) {
    superHTML = '' +
      '<div style="background:#fefce8; border:1px solid #fde68a; border-radius:8px; padding:0.75rem 1rem; margin-bottom:1.25rem; font-size:0.85rem;">' +
        '<strong style="color:#92400e;">Superannuation Note:</strong> Super (' + formatCurrency(superTotal) + ') is included in the asset pool but is treated differently to other assets. Super splitting requires a separate agreement or court order, and there may be tax implications. A superannuation split does not give you immediate access to those funds.' +
      '</div>';
  }

  // Split range cards
  var splitHTML = '' +
    '<p class="result-note" style="font-weight:600; margin-bottom:0.5rem;">Estimated Settlement Range</p>' +
    '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1rem;">' +
      '<div style="background:#1a1a1a; color:white; border-radius:8px; padding:1rem; text-align:center;">' +
        '<div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8; margin-bottom:4px;">Parent 1</div>' +
        '<div style="font-size:1.3rem; font-weight:800;">' + p1PctLow + '% – ' + p1PctHigh + '%</div>' +
        '<div style="font-size:0.85rem; opacity:0.85; margin-top:4px;">' + formatCurrency(p1DollarLow) + ' – ' + formatCurrency(p1DollarHigh) + '</div>' +
      '</div>' +
      '<div style="background:#FFB800; color:#1a1a1a; border-radius:8px; padding:1rem; text-align:center;">' +
        '<div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; opacity:0.7; margin-bottom:4px;">Parent 2</div>' +
        '<div style="font-size:1.3rem; font-weight:800;">' + p2PctLow + '% – ' + p2PctHigh + '%</div>' +
        '<div style="font-size:0.85rem; opacity:0.7; margin-top:4px;">' + formatCurrency(p2DollarLow) + ' – ' + formatCurrency(p2DollarHigh) + '</div>' +
      '</div>' +
    '</div>';

  // Split range bar visual
  var midP1 = (p1PctLow + p1PctHigh) / 2;
  var splitBarHTML = '' +
    '<div style="margin-bottom:1.25rem;">' +
      '<div style="display:flex; height:24px; border-radius:6px; overflow:hidden; position:relative;">' +
        '<div style="width:' + midP1 + '%; background:#1a1a1a; transition:width 0.3s;"></div>' +
        '<div style="width:' + (100 - midP1) + '%; background:#FFB800; transition:width 0.3s;"></div>' +
      '</div>' +
      '<div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b; margin-top:2px;">' +
        '<span>Parent 1</span><span>Parent 2</span>' +
      '</div>' +
    '</div>';

  // Factors list
  var factorsHTML = '';
  if (factors.length > 0 || lengthNote) {
    factorsHTML = '<p class="result-note" style="font-weight:600; margin-bottom:0.5rem;">Factors Influencing the Split</p><ul style="font-size:0.85rem; padding-left:1.25rem; margin-bottom:1rem; color:#334155;">';
    for (var i = 0; i < factors.length; i++) {
      var icon = factors[i].direction === 'neutral' ? '&#8596;' : (factors[i].direction === 'parent1' ? '&#8592; P1' : 'P2 &#8594;');
      factorsHTML += '<li style="margin-bottom:4px;">' + factors[i].description + ' <span style="color:#1a1a1a; font-weight:600;">(+' + factors[i].low + '–' + factors[i].high + '%)</span></li>';
    }
    if (lengthNote) {
      factorsHTML += '<li style="margin-bottom:4px; font-style:italic;">' + lengthNote + '</li>';
    }
    factorsHTML += '</ul>';
  }

  // Disclaimer
  var disclaimerHTML = '' +
    '<div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:0.75rem 1rem; margin-top:1rem; font-size:0.85rem; color:#991b1b;">' +
      '<strong>Important:</strong> This is a general guide only. Property settlement in Australia depends on your individual circumstances, including financial and non-financial contributions, future needs, and what the court considers just and equitable. The Family Law Act 1975 does not prescribe fixed percentages. <strong>Get legal advice from a family lawyer before making any decisions about property settlement.</strong>' +
    '</div>';

  var html = poolTableHTML + netPoolHTML + superHTML + splitHTML + splitBarHTML + factorsHTML + disclaimerHTML;

  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');
  contentDiv.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

function getTLDR() {
  var propertyValue = parseFloat(document.getElementById('input-property-value').value) || 0;
  var mortgage = parseFloat(document.getElementById('input-mortgage').value) || 0;
  var p1Super = parseFloat(document.getElementById('input-parent1-super').value) || 0;
  var p2Super = parseFloat(document.getElementById('input-parent2-super').value) || 0;
  var savings = parseFloat(document.getElementById('input-savings').value) || 0;
  var vehicles = parseFloat(document.getElementById('input-vehicles').value) || 0;
  var otherAssets = parseFloat(document.getElementById('input-other-assets').value) || 0;
  var otherDebts = parseFloat(document.getElementById('input-other-debts').value) || 0;

  var totalAssets = propertyValue + p1Super + p2Super + savings + vehicles + otherAssets;
  var totalDebts = mortgage + otherDebts;
  var netPool = totalAssets - totalDebts;

  if (totalAssets <= 0) return '';

  var numChildren = parseInt(document.getElementById('input-num-children').value) || 0;
  var primaryCarerEl = document.querySelector('input[name="input-primary-carer"]:checked');
  var hasCarer = primaryCarerEl && (primaryCarerEl.value === 'parent1' || primaryCarerEl.value === 'parent2');

  var summary = 'Net asset pool: ' + formatCurrency(netPool) + '.';
  if (hasCarer && numChildren > 0) {
    summary += ' Primary carer (' + (primaryCarerEl.value === 'parent1' ? 'P1' : 'P2') + ') with ' + numChildren + ' child' + (numChildren > 1 ? 'ren' : '') + ' may receive a larger share.';
  } else {
    summary += ' Starting point is a 50/50 split.';
  }
  summary += ' Get legal advice — this is a guide only.';
  return summary;
}
