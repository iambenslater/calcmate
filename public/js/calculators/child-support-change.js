/**
 * Child Support Change Calculator — What-If Comparison
 * Runs the Services Australia 8-step formula for two scenarios side by side
 */

var SSA = 28463;
var MIN_ANNUAL = 540;
var FORTNIGHTS_PER_YEAR = 26.07;

var CARE_PCT_LOOKUP = [0, 7, 14, 21, 29, 36, 43, 50, 57, 64, 71, 79, 86, 93, 100];

var BRACKETS = [
  { min: 0, max: 40182 },
  { min: 40183, max: 80364 },
  { min: 80365, max: 120546 },
  { min: 120547, max: 160728 },
  { min: 160729, max: 200910 }
];

var COST_RATES = [
  [0.17, 0.23, 0.24, 0.33, 0.285],
  [0.15, 0.22, 0.23, 0.32, 0.275],
  [0.12, 0.18, 0.20, 0.28, 0.24],
  [0.10, 0.15, 0.18, 0.25, 0.215],
  [0.07, 0.12, 0.15, 0.22, 0.185]
];

var MULTI_CHILD = { 3: 1.19, 4: 1.31, 5: 1.40 };

function fmt(n) {
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getCostRateIndex(numChildren, childAges) {
  if (numChildren === 1) return childAges === 'over13' ? 1 : 0;
  if (childAges === 'under13') return 2;
  if (childAges === 'over13') return 3;
  return 4;
}

function getCarePct(nights) {
  if (nights < 0) nights = 0;
  if (nights > 14) nights = 14;
  return CARE_PCT_LOOKUP[nights];
}

function getCostPct(carePct) {
  if (carePct <= 13) return 0;
  if (carePct >= 87) return 100;
  if (carePct >= 14 && carePct <= 35) return 24;
  if (carePct >= 66 && carePct <= 86) return 76;
  if (carePct >= 48 && carePct <= 52) return 50;
  if (carePct >= 36 && carePct <= 47) return 25 + (carePct - 36);
  if (carePct >= 53 && carePct <= 65) return 51 + (carePct - 53);
  return 50;
}

function getCareBandName(carePct) {
  if (carePct < 14) return 'Below Regular';
  if (carePct <= 35) return 'Regular';
  if (carePct <= 47) return 'Shared (Below Equal)';
  if (carePct <= 52) return 'Shared (Equal)';
  if (carePct <= 65) return 'Shared (Above Equal)';
  if (carePct <= 86) return 'Primary';
  return 'Sole';
}

function calcCostOfChildren(combinedCSI, numChildren, childAges) {
  var rateIdx = getCostRateIndex(numChildren <= 2 ? numChildren : 2, childAges);
  var cappedCSI = Math.min(combinedCSI, 200910);
  var totalCost = 0;

  for (var i = 0; i < BRACKETS.length; i++) {
    var b = BRACKETS[i];
    if (cappedCSI <= b.min) break;
    var taxableInBracket = i === 0 ? Math.min(cappedCSI, b.max) : Math.min(cappedCSI, b.max) - b.min;
    if (taxableInBracket <= 0) break;
    totalCost += taxableInBracket * COST_RATES[i][rateIdx];
  }

  if (numChildren >= 3) {
    totalCost *= MULTI_CHILD[Math.min(numChildren, 5)];
  }

  return totalCost;
}

function runFormula(p1Income, p2Income, numChildren, childAges, p1Nights) {
  var p1CSI = Math.max(0, p1Income - SSA);
  var p2CSI = Math.max(0, p2Income - SSA);
  var combinedCSI = p1CSI + p2CSI;

  var p1IncomePct = combinedCSI > 0 ? p1CSI / combinedCSI : 0.5;

  var p1CarePct = getCarePct(p1Nights);
  var p2CarePct = 100 - p1CarePct;

  var p1CostPct = getCostPct(p1CarePct) / 100;

  var p1CSPct = p1IncomePct - p1CostPct;
  var p1Pays = p1CSPct > 0;

  var costOfChildren = calcCostOfChildren(combinedCSI, numChildren, childAges);
  var annualAmount = Math.abs(p1CSPct) * costOfChildren;

  var minApplied = false;
  if (annualAmount > 0 && annualAmount < MIN_ANNUAL) {
    var payerIncome = p1Pays ? p1Income : p2Income;
    if (payerIncome > SSA) {
      annualAmount = MIN_ANNUAL;
      minApplied = true;
    }
  }

  return {
    p1Pays: p1Pays,
    payer: p1Pays ? 'Parent 1' : 'Parent 2',
    receiver: p1Pays ? 'Parent 2' : 'Parent 1',
    annualAmount: annualAmount,
    monthly: annualAmount / 12,
    fortnightly: annualAmount / FORTNIGHTS_PER_YEAR,
    p1CarePct: p1CarePct,
    p2CarePct: p2CarePct,
    p1CareBand: getCareBandName(p1CarePct),
    p2CareBand: getCareBandName(p2CarePct),
    p1Nights: p1Nights,
    p2Nights: 14 - p1Nights,
    combinedCSI: combinedCSI,
    costOfChildren: costOfChildren,
    minApplied: minApplied
  };
}

function calculate() {
  var cp1Inc = parseFloat(document.getElementById('input-current-parent1-income').value) || 0;
  var cp2Inc = parseFloat(document.getElementById('input-current-parent2-income').value) || 0;
  var cNum = parseInt(document.getElementById('input-current-num-children').value) || 1;
  var cAges = document.getElementById('input-current-child-ages').value || 'under13';
  var cNights = parseInt(document.getElementById('input-current-parent1-nights').value) || 0;

  var np1Inc = parseFloat(document.getElementById('input-new-parent1-income').value) || 0;
  var np2Inc = parseFloat(document.getElementById('input-new-parent2-income').value) || 0;
  var nNum = parseInt(document.getElementById('input-new-num-children').value) || 1;
  var nAges = document.getElementById('input-new-child-ages').value || 'under13';
  var nNights = parseInt(document.getElementById('input-new-parent1-nights').value) || 0;

  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');

  if (cp1Inc <= 0 && cp2Inc <= 0 && np1Inc <= 0 && np2Inc <= 0) {
    contentDiv.innerHTML = '<p style="color: #dc2626; font-weight: 600;">Please enter income values for at least one scenario.</p>';
    resultsDiv.classList.remove('hidden');
    return;
  }

  var cur = runFormula(cp1Inc, cp2Inc, cNum, cAges, cNights);
  var nw = runFormula(np1Inc, np2Inc, nNum, nAges, nNights);

  // Calculate difference from payer's perspective
  // If payer changes between scenarios, treat as full swing
  var diff = nw.annualAmount - cur.annualAmount;
  // If payer flipped, the effective change is the sum (one stops paying, the other starts)
  var payerFlipped = cur.p1Pays !== nw.p1Pays && cur.annualAmount > 0 && nw.annualAmount > 0;
  var diffMonthly = diff / 12;
  var diffFortnightly = diff / FORTNIGHTS_PER_YEAR;
  var pctChange = cur.annualAmount > 0 ? (diff / cur.annualAmount * 100) : (nw.annualAmount > 0 ? 100 : 0);

  // Colour: from the payer's perspective, increase = red, decrease = green
  var diffColour = diff > 0 ? '#dc2626' : (diff < 0 ? '#16a34a' : '#64748b');
  var diffLabel = diff > 0 ? 'Increase' : (diff < 0 ? 'Decrease' : 'No change');
  var diffArrow = diff > 0 ? '\u2191' : (diff < 0 ? '\u2193' : '\u2194');

  var html = '';

  // Hero difference banner
  html += '<div style="background:linear-gradient(135deg,#1a1a1a,#003380);color:#fff;border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">';
  if (payerFlipped) {
    html += '<div style="font-size:0.9em;opacity:0.8;margin-bottom:4px;">Payer changes from ' + cur.payer + ' to ' + nw.payer + '</div>';
    html += '<div style="font-size:1.6em;font-weight:700;color:#FFB800;">Direction reverses</div>';
    html += '<div style="margin-top:8px;font-size:0.9em;opacity:0.8;">Current: ' + cur.payer + ' pays ' + fmt(cur.annualAmount) + '/yr \u2192 Proposed: ' + nw.payer + ' pays ' + fmt(nw.annualAmount) + '/yr</div>';
  } else if (Math.abs(diff) < 1) {
    html += '<div style="font-size:1.4em;font-weight:700;color:#FFB800;">No Change</div>';
    html += '<div style="margin-top:8px;font-size:0.9em;opacity:0.8;">Both scenarios produce the same result</div>';
  } else {
    html += '<div style="font-size:0.9em;opacity:0.8;margin-bottom:4px;">' + diffLabel + ' in payment</div>';
    html += '<div style="font-size:2em;font-weight:700;color:' + (diff > 0 ? '#ef4444' : '#4ade80') + ';">' + diffArrow + ' ' + fmt(Math.abs(diff)) + '<span style="font-size:0.4em;opacity:0.8;">/year</span></div>';
    html += '<div style="display:flex;justify-content:center;gap:24px;margin-top:12px;font-size:0.95em;">';
    html += '<span>' + (diff > 0 ? '+' : '') + fmt(diff / 12) + '/month</span>';
    html += '<span>' + (diff > 0 ? '+' : '') + fmt(diff / FORTNIGHTS_PER_YEAR) + '/fortnight</span>';
    html += '</div>';
    html += '<div style="margin-top:8px;font-size:0.85em;opacity:0.7;">' + (pctChange > 0 ? '+' : '') + pctChange.toFixed(1) + '% change</div>';
  }
  html += '</div>';

  // Side-by-side comparison table
  html += '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;">';

  // Header
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:#1a1a1a;color:#fff;font-weight:600;font-size:0.9em;">';
  html += '<div style="padding:12px;"></div>';
  html += '<div style="padding:12px;text-align:center;">Current</div>';
  html += '<div style="padding:12px;text-align:center;">Proposed</div>';
  html += '</div>';

  // Row helper
  function row(label, curVal, newVal, highlight) {
    var bg = highlight ? 'background:#f0f9ff;' : '';
    var fw = highlight ? 'font-weight:600;' : '';
    return '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid #e2e8f0;' + bg + '">' +
      '<div style="padding:10px 12px;font-size:0.9em;color:#374151;' + fw + '">' + label + '</div>' +
      '<div style="padding:10px 12px;text-align:center;font-size:0.9em;' + fw + '">' + curVal + '</div>' +
      '<div style="padding:10px 12px;text-align:center;font-size:0.9em;' + fw + '">' + newVal + '</div>' +
      '</div>';
  }

  html += row('Who pays', cur.annualAmount < 1 ? 'Nobody' : cur.payer, nw.annualAmount < 1 ? 'Nobody' : nw.payer, false);
  html += row('Annual', fmt(cur.annualAmount), fmt(nw.annualAmount), true);
  html += row('Monthly', fmt(cur.monthly), fmt(nw.monthly), false);
  html += row('Fortnightly', fmt(cur.fortnightly), fmt(nw.fortnightly), false);
  html += row('P1 care', cur.p1CarePct + '% (' + cur.p1CareBand + ')', nw.p1CarePct + '% (' + nw.p1CareBand + ')', false);
  html += row('P2 care', cur.p2CarePct + '% (' + cur.p2CareBand + ')', nw.p2CarePct + '% (' + nw.p2CareBand + ')', false);
  html += row('P1 nights', cur.p1Nights + '/14', nw.p1Nights + '/14', false);
  html += row('Combined CSI', fmt(cur.combinedCSI), fmt(nw.combinedCSI), false);
  html += row('Cost of children', fmt(cur.costOfChildren), fmt(nw.costOfChildren), false);

  html += '</div>'; // end table

  // Difference summary card
  if (Math.abs(diff) >= 1 && !payerFlipped) {
    html += '<div style="background:' + (diff > 0 ? '#fef2f2' : '#f0fdf4') + ';border:1px solid ' + (diff > 0 ? '#fca5a5' : '#86efac') + ';border-radius:10px;padding:16px;margin-bottom:16px;">';
    html += '<div style="font-weight:600;color:' + diffColour + ';font-size:1em;margin-bottom:8px;">' + diffArrow + ' ' + diffLabel + ' of ' + fmt(Math.abs(diff)) + '/year for ' + (cur.p1Pays ? 'Parent 1' : 'Parent 2') + '</div>';
    html += '<div style="font-size:0.9em;color:#374151;">That\'s ' + fmt(Math.abs(diff / 12)) + '/month or ' + fmt(Math.abs(diff / FORTNIGHTS_PER_YEAR)) + '/fortnight ' + (diff > 0 ? 'more' : 'less') + ' than the current arrangement.</div>';
    html += '</div>';
  }

  // Disclaimer
  html += '<div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;font-size:0.85em;color:#92400e;">';
  html += '<strong>Disclaimer:</strong> This is an estimate only. The actual amount may differ based on factors like other dependants, departure orders, or change of assessment decisions. For your official assessment, contact Services Australia on <strong>131 272</strong>.';
  html += '</div>';

  contentDiv.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

function getTLDR() {
  var cp1Inc = parseFloat(document.getElementById('input-current-parent1-income').value) || 0;
  var cp2Inc = parseFloat(document.getElementById('input-current-parent2-income').value) || 0;
  var cNum = parseInt(document.getElementById('input-current-num-children').value) || 1;
  var cAges = document.getElementById('input-current-child-ages').value || 'under13';
  var cNights = parseInt(document.getElementById('input-current-parent1-nights').value) || 0;

  var np1Inc = parseFloat(document.getElementById('input-new-parent1-income').value) || 0;
  var np2Inc = parseFloat(document.getElementById('input-new-parent2-income').value) || 0;
  var nNum = parseInt(document.getElementById('input-new-num-children').value) || 1;
  var nAges = document.getElementById('input-new-child-ages').value || 'under13';
  var nNights = parseInt(document.getElementById('input-new-parent1-nights').value) || 0;

  if (cp1Inc <= 0 && cp2Inc <= 0 && np1Inc <= 0 && np2Inc <= 0) return '';

  var cur = runFormula(cp1Inc, cp2Inc, cNum, cAges, cNights);
  var nw = runFormula(np1Inc, np2Inc, nNum, nAges, nNights);
  var diff = nw.annualAmount - cur.annualAmount;

  if (Math.abs(diff) < 1) {
    return 'No change in child support — both scenarios produce ' + fmt(cur.annualAmount) + '/year.';
  }

  return 'Child support changes by ' + (diff > 0 ? '+' : '') + fmt(diff) + '/year (from ' + fmt(cur.annualAmount) + ' to ' + fmt(nw.annualAmount) + ') — a ' + (diff > 0 ? 'increase' : 'decrease') + ' of ' + fmt(Math.abs(diff / 12)) + '/month.';
}
