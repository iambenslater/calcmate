/**
 * Australian Child Support Estimator
 * Based on Services Australia 8-step administrative assessment (2025-26 rates)
 */

var SSA = 28463; // Self-Support Amount 2025-26
var MIN_ANNUAL = 540; // Minimum annual child support rate
var FORTNIGHTS_PER_YEAR = 26.07;

var CARE_PCT_LOOKUP = [0, 7, 14, 21, 29, 36, 43, 50, 57, 64, 71, 79, 86, 93, 100];

// Income brackets for Costs of Children table (2025-26)
var BRACKETS = [
  { min: 0, max: 40182 },
  { min: 40183, max: 80364 },
  { min: 80365, max: 120546 },
  { min: 120547, max: 160728 },
  { min: 160729, max: 200910 }
];

// Rates indexed by bracket then: [1child_u13, 1child_o13, 2child_u13, 2child_o13, 2child_mixed]
var COST_RATES = [
  [0.17, 0.23, 0.24, 0.33, 0.285],
  [0.15, 0.22, 0.23, 0.32, 0.275],
  [0.12, 0.18, 0.20, 0.28, 0.24],
  [0.10, 0.15, 0.18, 0.25, 0.215],
  [0.07, 0.12, 0.15, 0.22, 0.185]
];

// Multipliers for 3+ children (applied to the 2-child cost)
var MULTI_CHILD = { 3: 1.19, 4: 1.31, 5: 1.40 };

function fmt(n) {
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getCostRateIndex(numChildren, childAges) {
  if (numChildren === 1) {
    return childAges === 'over13' ? 1 : 0; // under13 or mixed treated as under13 for 1 child
  }
  // 2+ children
  if (childAges === 'under13') return 2;
  if (childAges === 'over13') return 3;
  return 4; // mixed
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
  // 36-47: starts at 25% for 36, +1 per point
  if (carePct >= 36 && carePct <= 47) return 25 + (carePct - 36);
  // 53-65: starts at 51% for 53, +1 per point → mirrors upward
  if (carePct >= 53 && carePct <= 65) return 51 + (carePct - 53);
  return 50; // fallback
}

function getCareBandName(carePct) {
  if (carePct < 14) return 'Below Regular (0-13%)';
  if (carePct <= 35) return 'Regular (14-35%)';
  if (carePct <= 47) return 'Shared — Below Equal (36-47%)';
  if (carePct <= 52) return 'Shared — Equal (48-52%)';
  if (carePct <= 65) return 'Shared — Above Equal (53-65%)';
  if (carePct <= 86) return 'Primary (66-86%)';
  return 'Sole (87-100%)';
}

function calcCostOfChildren(combinedCSI, numChildren, childAges) {
  var rateIdx = getCostRateIndex(numChildren <= 2 ? numChildren : 2, childAges);
  var cappedCSI = Math.min(combinedCSI, 200910);
  var totalCost = 0;
  var breakdown = [];

  for (var i = 0; i < BRACKETS.length; i++) {
    var b = BRACKETS[i];
    if (cappedCSI <= b.min) break;
    var taxableInBracket = Math.min(cappedCSI, b.max) - b.min;
    if (i === 0) taxableInBracket = Math.min(cappedCSI, b.max); // first bracket starts at 0
    else taxableInBracket = Math.min(cappedCSI, b.max) - b.min;
    // For first bracket the min is 0 so taxableInBracket = min(cappedCSI, 40182)
    if (taxableInBracket <= 0) break;
    var rate = COST_RATES[i][rateIdx];
    var cost = taxableInBracket * rate;
    totalCost += cost;
    breakdown.push({ bracket: i + 1, amount: taxableInBracket, rate: rate, cost: cost });
  }

  // Apply multiplier for 3+ children
  if (numChildren >= 3) {
    var mult = MULTI_CHILD[Math.min(numChildren, 5)];
    totalCost *= mult;
    for (var j = 0; j < breakdown.length; j++) {
      breakdown[j].cost *= mult;
    }
  }

  return { total: totalCost, breakdown: breakdown };
}

function runChildSupportFormula(p1Income, p2Income, numChildren, childAges, p1Nights) {
  // Step 1: Child Support Income
  var p1CSI = Math.max(0, p1Income - SSA);
  var p2CSI = Math.max(0, p2Income - SSA);

  // Step 2: Combined CSI
  var combinedCSI = p1CSI + p2CSI;

  // Step 3: Income percentages
  var p1IncomePct = combinedCSI > 0 ? p1CSI / combinedCSI : 0.5;
  var p2IncomePct = combinedCSI > 0 ? p2CSI / combinedCSI : 0.5;

  // Step 4: Care percentages
  var p1CarePct = getCarePct(p1Nights);
  var p2CarePct = 100 - p1CarePct;
  var p2Nights = 14 - p1Nights;

  // Step 5: Cost percentages
  var p1CostPct = getCostPct(p1CarePct) / 100;
  var p2CostPct = getCostPct(p2CarePct) / 100;

  // Step 6: Child Support percentage
  var p1CSPct = p1IncomePct - p1CostPct;
  var p2CSPct = p2IncomePct - p2CostPct;

  // Step 7: Cost of Children
  var costResult = calcCostOfChildren(combinedCSI, numChildren, childAges);
  var costOfChildren = costResult.total;

  // Step 8: Annual amount
  // Positive p1CSPct means P1 pays, negative means P1 receives
  var annualAmount = Math.abs(p1CSPct) * costOfChildren;
  var p1Pays = p1CSPct > 0;

  // Apply minimum rate if applicable
  var minApplied = false;
  if (annualAmount > 0 && annualAmount < MIN_ANNUAL) {
    // Check if the paying parent has income above SSA
    var payerIncome = p1Pays ? p1Income : p2Income;
    if (payerIncome > SSA) {
      annualAmount = MIN_ANNUAL;
      minApplied = true;
    }
  }

  var monthly = annualAmount / 12;
  var fortnightly = annualAmount / FORTNIGHTS_PER_YEAR;

  return {
    p1CSI: p1CSI,
    p2CSI: p2CSI,
    combinedCSI: combinedCSI,
    p1IncomePct: p1IncomePct,
    p2IncomePct: p2IncomePct,
    p1CarePct: p1CarePct,
    p2CarePct: p2CarePct,
    p1Nights: p1Nights,
    p2Nights: p2Nights,
    p1CostPct: p1CostPct,
    p2CostPct: p2CostPct,
    p1CSPct: p1CSPct,
    p2CSPct: p2CSPct,
    costOfChildren: costOfChildren,
    costBreakdown: costResult.breakdown,
    annualAmount: annualAmount,
    monthly: monthly,
    fortnightly: fortnightly,
    p1Pays: p1Pays,
    minApplied: minApplied,
    p1CareBand: getCareBandName(p1CarePct),
    p2CareBand: getCareBandName(p2CarePct)
  };
}

function calculate() {
  var p1Income = parseFloat(document.getElementById('input-parent1-income').value) || 0;
  var p2Income = parseFloat(document.getElementById('input-parent2-income').value) || 0;
  var numChildren = parseInt(document.getElementById('input-num-children').value) || 1;
  var childAges = document.getElementById('input-child-ages').value || 'under13';
  var p1Nights = parseInt(document.getElementById('input-parent1-nights').value) || 0;

  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');

  if (p1Income <= 0 && p2Income <= 0) {
    contentDiv.innerHTML = '<p style="color: #dc2626; font-weight: 600;">Please enter at least one parent\'s income.</p>';
    resultsDiv.classList.remove('hidden');
    return;
  }

  var r = runChildSupportFormula(p1Income, p2Income, numChildren, childAges, p1Nights);

  var payer = r.p1Pays ? 'Parent 1' : 'Parent 2';
  var receiver = r.p1Pays ? 'Parent 2' : 'Parent 1';

  // Build cost breakdown rows
  var costRows = '';
  for (var i = 0; i < r.costBreakdown.length; i++) {
    var cb = r.costBreakdown[i];
    costRows += '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.9em;color:#4a5568;">' +
      '<span>Bracket ' + cb.bracket + ': ' + fmt(cb.amount) + ' @ ' + (cb.rate * 100).toFixed(1) + '%</span>' +
      '<span>' + fmt(cb.cost) + '</span></div>';
  }

  var agesLabel = childAges === 'under13' ? 'All under 13' : (childAges === 'over13' ? 'All 13+' : 'Mixed ages');

  var html = '';

  // Hero result
  html += '<div style="background:linear-gradient(135deg,#1a1a1a,#003380);color:#fff;border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">';
  if (r.annualAmount < 1) {
    html += '<div style="font-size:1.1em;opacity:0.9;">No child support payable</div>';
    html += '<div style="font-size:0.9em;opacity:0.7;margin-top:8px;">Both parents contribute equally based on income and care shares</div>';
  } else {
    html += '<div style="font-size:0.9em;opacity:0.8;margin-bottom:4px;">' + payer + ' pays ' + receiver + '</div>';
    html += '<div style="font-size:2em;font-weight:700;color:#FFB800;">' + fmt(r.annualAmount) + '<span style="font-size:0.4em;opacity:0.8;">/year</span></div>';
    html += '<div style="display:flex;justify-content:center;gap:24px;margin-top:12px;font-size:0.95em;">';
    html += '<span>' + fmt(r.monthly) + '/month</span>';
    html += '<span>' + fmt(r.fortnightly) + '/fortnight</span>';
    html += '</div>';
    if (r.minApplied) {
      html += '<div style="margin-top:8px;font-size:0.8em;opacity:0.7;">Minimum annual rate of ' + fmt(MIN_ANNUAL) + ' applied</div>';
    }
  }
  html += '</div>';

  // Step-by-step breakdown
  html += '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:16px;">';
  html += '<h3 style="margin:0 0 16px;font-size:1.1em;color:#1a1a1a;">Step-by-Step Breakdown</h3>';

  // Step 1
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-weight:600;color:#1a1a1a;font-size:0.95em;">Step 1: Child Support Income</div>';
  html += '<div style="font-size:0.85em;color:#64748b;margin-bottom:4px;">ATI minus Self-Support Amount (' + fmt(SSA) + ')</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 1 CSI</span><span style="font-weight:600;">' + fmt(r.p1CSI) + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 2 CSI</span><span style="font-weight:600;">' + fmt(r.p2CSI) + '</span></div>';
  html += '</div>';

  // Step 2
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-weight:600;color:#1a1a1a;font-size:0.95em;">Step 2: Combined Child Support Income</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Combined CSI</span><span style="font-weight:600;">' + fmt(r.combinedCSI) + '</span></div>';
  html += '</div>';

  // Step 3
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-weight:600;color:#1a1a1a;font-size:0.95em;">Step 3: Income Percentages</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 1 income share</span><span style="font-weight:600;">' + (r.p1IncomePct * 100).toFixed(1) + '%</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 2 income share</span><span style="font-weight:600;">' + (r.p2IncomePct * 100).toFixed(1) + '%</span></div>';
  html += '</div>';

  // Step 4
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-weight:600;color:#1a1a1a;font-size:0.95em;">Step 4: Care Percentages</div>';
  html += '<div style="font-size:0.85em;color:#64748b;margin-bottom:4px;">Based on nights per fortnight</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 1: ' + r.p1Nights + ' nights</span><span style="font-weight:600;">' + r.p1CarePct + '% — ' + r.p1CareBand + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 2: ' + r.p2Nights + ' nights</span><span style="font-weight:600;">' + r.p2CarePct + '% — ' + r.p2CareBand + '</span></div>';
  html += '</div>';

  // Step 5
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-weight:600;color:#1a1a1a;font-size:0.95em;">Step 5: Cost Percentages</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 1 cost %</span><span style="font-weight:600;">' + (r.p1CostPct * 100).toFixed(0) + '%</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 2 cost %</span><span style="font-weight:600;">' + (r.p2CostPct * 100).toFixed(0) + '%</span></div>';
  html += '</div>';

  // Step 6
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-weight:600;color:#1a1a1a;font-size:0.95em;">Step 6: Child Support Percentage</div>';
  html += '<div style="font-size:0.85em;color:#64748b;margin-bottom:4px;">Income % minus Cost % (positive = pays, negative = receives)</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 1</span><span style="font-weight:600;color:' + (r.p1CSPct > 0 ? '#dc2626' : '#16a34a') + ';">' + (r.p1CSPct * 100).toFixed(1) + '%</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Parent 2</span><span style="font-weight:600;color:' + (r.p2CSPct > 0 ? '#dc2626' : '#16a34a') + ';">' + (r.p2CSPct * 100).toFixed(1) + '%</span></div>';
  html += '</div>';

  // Step 7
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-weight:600;color:#1a1a1a;font-size:0.95em;">Step 7: Costs of Children</div>';
  html += '<div style="font-size:0.85em;color:#64748b;margin-bottom:4px;">' + numChildren + ' child' + (numChildren > 1 ? 'ren' : '') + ' (' + agesLabel + ') — marginal rate calculation on ' + fmt(Math.min(r.combinedCSI, 200910)) + '</div>';
  html += costRows;
  if (numChildren >= 3) {
    html += '<div style="font-size:0.85em;color:#64748b;padding-top:4px;">Multi-child multiplier: \u00d7' + MULTI_CHILD[Math.min(numChildren, 5)] + '</div>';
  }
  html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #e2e8f0;margin-top:6px;font-weight:600;"><span>Total cost of children</span><span>' + fmt(r.costOfChildren) + '</span></div>';
  html += '</div>';

  // Step 8
  html += '<div style="margin-bottom:0;">';
  html += '<div style="font-weight:600;color:#1a1a1a;font-size:0.95em;">Step 8: Annual Child Support</div>';
  html += '<div style="font-size:0.85em;color:#64748b;margin-bottom:4px;">|Child Support %| \u00d7 Cost of Children</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>|' + (Math.abs(r.p1CSPct) * 100).toFixed(1) + '%| \u00d7 ' + fmt(r.costOfChildren) + '</span><span style="font-weight:600;">' + fmt(r.annualAmount) + '/year</span></div>';
  html += '</div>';

  html += '</div>'; // end breakdown card

  // Disclaimer
  html += '<div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;font-size:0.85em;color:#92400e;">';
  html += '<strong>Disclaimer:</strong> This is an estimate only. The actual amount may differ based on factors like other dependants, departure orders, or change of assessment decisions. For your official assessment, contact Services Australia on <strong>131 272</strong>.';
  html += '</div>';

  contentDiv.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

function getTLDR() {
  var p1Income = parseFloat(document.getElementById('input-parent1-income').value) || 0;
  var p2Income = parseFloat(document.getElementById('input-parent2-income').value) || 0;
  var numChildren = parseInt(document.getElementById('input-num-children').value) || 1;
  var childAges = document.getElementById('input-child-ages').value || 'under13';
  var p1Nights = parseInt(document.getElementById('input-parent1-nights').value) || 0;

  if (p1Income <= 0 && p2Income <= 0) return '';

  var r = runChildSupportFormula(p1Income, p2Income, numChildren, childAges, p1Nights);

  if (r.annualAmount < 1) {
    return 'No child support payable — both parents contribute equally based on income and care shares.';
  }

  var payer = r.p1Pays ? 'Parent 1' : 'Parent 2';
  var receiver = r.p1Pays ? 'Parent 2' : 'Parent 1';
  return payer + ' pays ' + receiver + ' approximately ' + fmt(r.annualAmount) + '/year (' + fmt(r.monthly) + '/month) in child support for ' + numChildren + ' child' + (numChildren > 1 ? 'ren' : '') + '.';
}
