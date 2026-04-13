function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function calculate() {
  var currentRent = parseFloat(document.getElementById('input-current-rent').value) || 0;
  var currentUtilities = parseFloat(document.getElementById('input-current-utilities').value) || 0;
  var currentGroceries = parseFloat(document.getElementById('input-current-groceries').value) || 0;
  var currentTransport = parseFloat(document.getElementById('input-current-transport').value) || 0;
  var currentInsurance = parseFloat(document.getElementById('input-current-insurance').value) || 0;
  var currentOther = parseFloat(document.getElementById('input-current-other').value) || 0;

  var newRent = parseFloat(document.getElementById('input-new-rent').value) || 0;
  var newUtilities = parseFloat(document.getElementById('input-new-utilities').value) || 0;
  var newGroceries = parseFloat(document.getElementById('input-new-groceries').value) || 0;
  var newTransport = parseFloat(document.getElementById('input-new-transport').value) || 0;
  var newInsurance = parseFloat(document.getElementById('input-new-insurance').value) || 0;
  var newOther = parseFloat(document.getElementById('input-new-other').value) || 0;

  var combinedIncome = parseFloat(document.getElementById('input-combined-income').value) || 0;

  var currentTotal = currentRent + currentUtilities + currentGroceries + currentTransport + currentInsurance + currentOther;
  var newTotal = newRent + newUtilities + newGroceries + newTransport + newInsurance + newOther;

  if (currentTotal <= 0 && newTotal <= 0) {
    var resultsDiv = document.getElementById('calc-results');
    var contentDiv = document.getElementById('results-content');
    contentDiv.innerHTML = '<p class="text-red-600 font-semibold">Please enter at least some costs to compare one home vs two homes.</p>';
    resultsDiv.classList.remove('hidden');
    return;
  }

  var twoHouseholdTotal = currentTotal + newTotal;
  var monthlyGap = twoHouseholdTotal - currentTotal;
  var annualGap = monthlyGap * 12;
  var percentIncrease = currentTotal > 0 ? ((monthlyGap / currentTotal) * 100).toFixed(0) : 0;

  // Budget analysis
  var surplus = combinedIncome - twoHouseholdTotal;
  var surplusLabel = surplus >= 0 ? 'Surplus' : 'Deficit';
  var surplusColor = surplus >= 0 ? '#10B981' : '#EF4444';

  // Per-parent split (assume 50/50 if no better data)
  var perParent = twoHouseholdTotal / 2;

  // Category comparison data
  var categories = [
    { name: 'Rent / Mortgage', current: currentRent, twoHome: currentRent + newRent },
    { name: 'Utilities', current: currentUtilities, twoHome: currentUtilities + newUtilities },
    { name: 'Groceries', current: currentGroceries, twoHome: currentGroceries + newGroceries },
    { name: 'Transport', current: currentTransport, twoHome: currentTransport + newTransport },
    { name: 'Insurance', current: currentInsurance, twoHome: currentInsurance + newInsurance },
    { name: 'Other', current: currentOther, twoHome: currentOther + newOther }
  ];

  // Build comparison table rows
  var compRows = '';
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    var diff = cat.twoHome - cat.current;
    var diffStr = diff > 0 ? '+' + formatCurrency(diff) : (diff === 0 ? '-' : formatCurrency(diff));
    var diffColor = diff > 0 ? '#EF4444' : (diff === 0 ? '#666' : '#10B981');
    compRows += '<tr class="border-b border-gray-100">' +
      '<td class="py-2 pr-3">' + cat.name + '</td>' +
      '<td class="py-2 px-2 text-right">' + formatCurrency(cat.current) + '</td>' +
      '<td class="py-2 px-2 text-right">' + formatCurrency(cat.twoHome) + '</td>' +
      '<td class="py-2 px-2 text-right font-semibold" style="color: ' + diffColor + ';">' + diffStr + '</td>' +
      '</tr>';
  }

  // Build bar chart for category comparison
  var maxVal = 0;
  for (var m = 0; m < categories.length; m++) {
    if (categories[m].twoHome > maxVal) maxVal = categories[m].twoHome;
  }

  var barChart = '';
  for (var b = 0; b < categories.length; b++) {
    var c = categories[b];
    if (c.current > 0 || c.twoHome > 0) {
      var w1 = maxVal > 0 ? Math.min((c.current / maxVal) * 100, 100) : 0;
      var w2 = maxVal > 0 ? Math.min((c.twoHome / maxVal) * 100, 100) : 0;
      barChart += '<div class="mb-3">' +
        '<div class="text-sm font-medium mb-1">' + c.name + '</div>' +
        '<div class="flex items-center gap-2 mb-1">' +
          '<span style="font-size: 11px; width: 65px; color: #666;">One home</span>' +
          '<div style="flex: 1; background: #E5E7EB; border-radius: 4px; height: 14px;">' +
            '<div style="width: ' + w1 + '%; background: #00205B; border-radius: 4px; height: 14px;"></div>' +
          '</div>' +
          '<span style="font-size: 12px; width: 70px; text-align: right;">' + formatCurrency(c.current) + '</span>' +
        '</div>' +
        '<div class="flex items-center gap-2">' +
          '<span style="font-size: 11px; width: 65px; color: #666;">Two homes</span>' +
          '<div style="flex: 1; background: #E5E7EB; border-radius: 4px; height: 14px;">' +
            '<div style="width: ' + w2 + '%; background: #FFB800; border-radius: 4px; height: 14px;"></div>' +
          '</div>' +
          '<span style="font-size: 12px; width: 70px; text-align: right;">' + formatCurrency(c.twoHome) + '</span>' +
        '</div>' +
      '</div>';
    }
  }

  var html = '' +
    // Monthly gap hero
    '<div style="background: #00205B; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">' +
      '<div style="font-size: 14px; opacity: 0.8; margin-bottom: 4px;">Extra Monthly Cost of Two Homes</div>' +
      '<div style="font-size: 36px; font-weight: 700; color: #FFB800;">+' + formatCurrency(monthlyGap) + '/mo</div>' +
      '<div style="font-size: 13px; opacity: 0.7; margin-top: 4px;">That\u2019s ' + formatCurrency(annualGap) + ' extra per year' + (currentTotal > 0 ? ' (' + percentIncrease + '% increase)' : '') + '</div>' +
    '</div>' +

    // Side by side totals
    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">' +
      '<div style="background: #F0F4FF; padding: 16px; border-radius: 8px; text-align: center;">' +
        '<div style="font-size: 12px; color: #666; margin-bottom: 4px;">One Home</div>' +
        '<div style="font-size: 24px; font-weight: 700; color: #00205B;">' + formatCurrency(currentTotal) + '</div>' +
        '<div style="font-size: 11px; color: #999;">/month</div>' +
      '</div>' +
      '<div style="background: #FFF7E6; padding: 16px; border-radius: 8px; text-align: center;">' +
        '<div style="font-size: 12px; color: #666; margin-bottom: 4px;">Two Homes</div>' +
        '<div style="font-size: 24px; font-weight: 700; color: #00205B;">' + formatCurrency(twoHouseholdTotal) + '</div>' +
        '<div style="font-size: 11px; color: #999;">/month</div>' +
      '</div>' +
    '</div>' +

    // Comparison table
    '<h4 class="font-semibold mb-3" style="color: #00205B;">Category Comparison</h4>' +
    '<div style="overflow-x: auto;">' +
    '<table class="w-full text-sm">' +
      '<thead><tr class="border-b-2" style="border-color: #00205B;">' +
        '<th class="py-2 pr-3 text-left">Category</th>' +
        '<th class="py-2 px-2 text-right">One Home</th>' +
        '<th class="py-2 px-2 text-right">Two Homes</th>' +
        '<th class="py-2 px-2 text-right">Diff</th>' +
      '</tr></thead>' +
      '<tbody>' + compRows +
        '<tr style="border-top: 2px solid #00205B; font-weight: 700;">' +
          '<td class="py-2 pr-3">Total</td>' +
          '<td class="py-2 px-2 text-right">' + formatCurrency(currentTotal) + '</td>' +
          '<td class="py-2 px-2 text-right">' + formatCurrency(twoHouseholdTotal) + '</td>' +
          '<td class="py-2 px-2 text-right" style="color: #EF4444;">+' + formatCurrency(monthlyGap) + '</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>' +
    '</div>' +

    // Visual bar chart
    '<h4 class="font-semibold mb-3 mt-5" style="color: #00205B;">Visual Breakdown</h4>' +
    '<div style="margin-bottom: 8px;">' +
      '<span style="display: inline-block; width: 12px; height: 12px; background: #00205B; border-radius: 2px; margin-right: 4px; vertical-align: middle;"></span>' +
      '<span style="font-size: 12px; color: #666; margin-right: 16px;">One home</span>' +
      '<span style="display: inline-block; width: 12px; height: 12px; background: #FFB800; border-radius: 2px; margin-right: 4px; vertical-align: middle;"></span>' +
      '<span style="font-size: 12px; color: #666;">Two homes</span>' +
    '</div>' +
    barChart;

  // Budget analysis (only if income provided)
  if (combinedIncome > 0) {
    var usedPct = ((twoHouseholdTotal / combinedIncome) * 100).toFixed(0);
    html += '' +
      '<div style="margin-top: 24px; background: ' + (surplus >= 0 ? '#F0FDF4' : '#FEF2F2') + '; border-left: 4px solid ' + surplusColor + '; padding: 14px 16px; border-radius: 0 8px 8px 0;">' +
        '<h4 class="font-semibold mb-2" style="color: #00205B;">Budget Analysis</h4>' +
        '<div class="text-sm" style="margin-bottom: 8px;">' +
          '<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Combined income</span><strong>' + formatCurrency(combinedIncome) + '/mo</strong></div>' +
          '<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Two-home expenses</span><strong>' + formatCurrency(twoHouseholdTotal) + '/mo</strong></div>' +
          '<div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid ' + (surplus >= 0 ? '#BBF7D0' : '#FECACA') + ';"><span style="font-weight: 600;">' + surplusLabel + '</span><strong style="color: ' + surplusColor + ';">' + formatCurrency(Math.abs(surplus)) + '/mo</strong></div>' +
        '</div>' +
        '<div style="font-size: 13px; color: #666;">Expenses consume <strong>' + usedPct + '%</strong> of combined income</div>' +
      '</div>';

    // Per-parent breakdown
    html += '' +
      '<div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">' +
        '<div style="background: #F0F4FF; padding: 14px; border-radius: 8px; text-align: center;">' +
          '<div style="font-size: 12px; color: #666; margin-bottom: 2px;">Parent A (stays)</div>' +
          '<div style="font-size: 20px; font-weight: 700; color: #00205B;">' + formatCurrency(currentTotal) + '</div>' +
          '<div style="font-size: 11px; color: #999;">/month</div>' +
        '</div>' +
        '<div style="background: #FFF7E6; padding: 14px; border-radius: 8px; text-align: center;">' +
          '<div style="font-size: 12px; color: #666; margin-bottom: 2px;">Parent B (moves)</div>' +
          '<div style="font-size: 20px; font-weight: 700; color: #00205B;">' + formatCurrency(newTotal) + '</div>' +
          '<div style="font-size: 11px; color: #999;">/month</div>' +
        '</div>' +
      '</div>';
  }

  // Tips
  html += '' +
    '<div style="margin-top: 24px; background: #F0F4FF; padding: 16px; border-radius: 8px;">' +
      '<h4 class="font-semibold mb-2" style="color: #00205B;">Good to Know</h4>' +
      '<ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">' +
        '<li style="padding: 6px 0; border-bottom: 1px solid #E0E7FF;">The average Australian separation increases total household costs by <strong>30\u201340%</strong></li>' +
        '<li style="padding: 6px 0; border-bottom: 1px solid #E0E7FF;">Shared costs like streaming, insurance, and internet are often duplicated \u2014 review every subscription</li>' +
        '<li style="padding: 6px 0; border-bottom: 1px solid #E0E7FF;">Grocery costs for a single adult are typically 60\u201370% of a couple\u2019s, not 50% \u2014 budget accordingly</li>' +
        '<li style="padding: 6px 0; border-bottom: 1px solid #E0E7FF;">If children split time between homes, factor in duplicate essentials (school supplies, toiletries, clothing)</li>' +
        '<li style="padding: 6px 0;">Services Australia can assess eligibility for Family Tax Benefit, rent assistance, and child support \u2014 call <strong>136 150</strong></li>' +
      '</ul>' +
    '</div>';

  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');
  contentDiv.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

function getTLDR() {
  var currentRent = parseFloat(document.getElementById('input-current-rent').value) || 0;
  var currentUtilities = parseFloat(document.getElementById('input-current-utilities').value) || 0;
  var currentGroceries = parseFloat(document.getElementById('input-current-groceries').value) || 0;
  var currentTransport = parseFloat(document.getElementById('input-current-transport').value) || 0;
  var currentInsurance = parseFloat(document.getElementById('input-current-insurance').value) || 0;
  var currentOther = parseFloat(document.getElementById('input-current-other').value) || 0;

  var newRent = parseFloat(document.getElementById('input-new-rent').value) || 0;
  var newUtilities = parseFloat(document.getElementById('input-new-utilities').value) || 0;
  var newGroceries = parseFloat(document.getElementById('input-new-groceries').value) || 0;
  var newTransport = parseFloat(document.getElementById('input-new-transport').value) || 0;
  var newInsurance = parseFloat(document.getElementById('input-new-insurance').value) || 0;
  var newOther = parseFloat(document.getElementById('input-new-other').value) || 0;

  var combinedIncome = parseFloat(document.getElementById('input-combined-income').value) || 0;

  var currentTotal = currentRent + currentUtilities + currentGroceries + currentTransport + currentInsurance + currentOther;
  var newTotal = newRent + newUtilities + newGroceries + newTransport + newInsurance + newOther;
  var twoHouseholdTotal = currentTotal + newTotal;
  var monthlyGap = twoHouseholdTotal - currentTotal;

  if (currentTotal <= 0 && newTotal <= 0) return '';

  var result = 'Running two homes costs ' + '$' + twoHouseholdTotal.toLocaleString('en-AU') + '/month vs ' + '$' + currentTotal.toLocaleString('en-AU') + ' for one — an extra $' + monthlyGap.toLocaleString('en-AU') + '/month ($' + (monthlyGap * 12).toLocaleString('en-AU') + '/year).';

  if (combinedIncome > 0) {
    var surplus = combinedIncome - twoHouseholdTotal;
    result += surplus >= 0
      ? ' On $' + combinedIncome.toLocaleString('en-AU') + ' combined income, you have a $' + surplus.toLocaleString('en-AU') + '/month surplus.'
      : ' On $' + combinedIncome.toLocaleString('en-AU') + ' combined income, you face a $' + Math.abs(surplus).toLocaleString('en-AU') + '/month shortfall.';
  }

  return result;
}
