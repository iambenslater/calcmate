function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateStampDuty(value, state) {
  switch (state) {
    case 'NSW':
      if (value <= 16000) return value * 0.015;
      if (value <= 35000) return 240 + (value - 16000) * 0.0175;
      if (value <= 93000) return 572.50 + (value - 35000) * 0.0175;
      if (value <= 351000) return 1587.50 + (value - 93000) * 0.035;
      if (value <= 1168000) return 10617.50 + (value - 351000) * 0.045;
      return 47382.50 + (value - 1168000) * 0.055;
    case 'VIC':
      if (value <= 25000) return value * 0.014;
      if (value <= 130000) return 350 + (value - 25000) * 0.024;
      if (value <= 960000) return 2870 + (value - 130000) * 0.06;
      return 52670 + (value - 960000) * 0.055;
    case 'QLD':
      if (value <= 5000) return 0;
      if (value <= 75000) return (value - 5000) * 0.015;
      if (value <= 540000) return 1050 + (value - 75000) * 0.035;
      if (value <= 1000000) return 17325 + (value - 540000) * 0.045;
      return 38025 + (value - 1000000) * 0.0575;
    case 'SA':
      if (value <= 12000) return value * 0.01;
      if (value <= 30000) return 120 + (value - 12000) * 0.02;
      if (value <= 50000) return 480 + (value - 30000) * 0.03;
      if (value <= 100000) return 1080 + (value - 50000) * 0.035;
      if (value <= 200000) return 2830 + (value - 100000) * 0.04;
      if (value <= 250000) return 6830 + (value - 200000) * 0.0425;
      if (value <= 300000) return 8955 + (value - 250000) * 0.0475;
      if (value <= 500000) return 11330 + (value - 300000) * 0.05;
      return 21330 + (value - 500000) * 0.055;
    case 'WA':
      if (value <= 120000) return value * 0.019;
      if (value <= 150000) return 2280 + (value - 120000) * 0.0285;
      if (value <= 360000) return 3135 + (value - 150000) * 0.038;
      if (value <= 725000) return 11115 + (value - 360000) * 0.0475;
      return 28453 + (value - 725000) * 0.0515;
    case 'TAS':
      if (value <= 3000) return value * 0.0175;
      if (value <= 25000) return 50 + (value - 3000) * 0.0225;
      if (value <= 75000) return 545 + (value - 25000) * 0.035;
      if (value <= 200000) return 2295 + (value - 75000) * 0.04;
      if (value <= 375000) return 7295 + (value - 200000) * 0.0425;
      return 14733 + (value - 375000) * 0.045;
    case 'ACT':
      if (value <= 260000) return value * 0.012 + 20;
      if (value <= 300000) return 3140 + (value - 260000) * 0.0235;
      if (value <= 500000) return 4080 + (value - 300000) * 0.0385;
      if (value <= 750000) return 11780 + (value - 500000) * 0.044;
      return 22780 + (value - 750000) * 0.0505;
    case 'NT':
      return (0.06571441 * Math.pow(value / 1000, 2)) + 15 * (value / 1000);
    default:
      return 0;
  }
}

function getFHOG(state, propertyPrice) {
  // First Home Owner Grants by state (new homes only — simplified)
  const grants = {
    NSW: { amount: 10000, cap: 600000 },
    VIC: { amount: 10000, cap: 750000 },
    QLD: { amount: 30000, cap: 750000 },
    SA: { amount: 15000, cap: 650000 },
    WA: { amount: 10000, cap: 750000 },
    TAS: { amount: 30000, cap: 600000 },
    ACT: { amount: 7500, cap: 750000 },
    NT: { amount: 10000, cap: 750000 }
  };
  const g = grants[state];
  return g && propertyPrice <= g.cap ? g.amount : 0;
}

function calculate() {
  const propertyPrice = parseFloat(document.getElementById('input-purchasePrice').value) || 0;
  const state = document.getElementById('input-state').value || 'QLD';
  const depositPercent = parseFloat(document.getElementById('input-depositPercent').value) || 20;
  const firstHomeBuyerEl = document.querySelector('input[name="input-firstHomeBuyer"]:checked');
  const isFirstHomeBuyer = firstHomeBuyerEl ? firstHomeBuyerEl.value === 'yes' : true;
  const includeMovingEl = document.querySelector('input[name="input-includeMovingCosts"]:checked');
  const includeMoving = includeMovingEl ? includeMovingEl.value === 'yes' : true;
  const conveyancingCost = 1500; // default fixed cost

  const deposit = propertyPrice * (depositPercent / 100);
  const loanAmount = propertyPrice - deposit;
  const lvr = propertyPrice > 0 ? (loanAmount / propertyPrice * 100) : 0;

  const stampDuty = calculateStampDuty(propertyPrice, state);
  const fhog = getFHOG(state, propertyPrice);

  // LMI estimate (rough) if LVR > 80%
  let lmi = 0;
  if (lvr > 80 && lvr <= 85) lmi = loanAmount * 0.01;
  else if (lvr > 85 && lvr <= 90) lmi = loanAmount * 0.022;
  else if (lvr > 90 && lvr <= 95) lmi = loanAmount * 0.04;
  else if (lvr > 95) lmi = loanAmount * 0.06;

  // Other costs
  const buildingInspection = 500;
  const pestInspection = 350;
  const titleSearch = 50;
  const mortgageRegistration = 200;
  const transferFee = 250;
  const movingCosts = 1500;

  const fixedCosts = conveyancingCost + buildingInspection + pestInspection + titleSearch + mortgageRegistration + transferFee;
  const totalUpfrontCosts = deposit + stampDuty + lmi + fixedCosts + movingCosts;
  const netUpfront = totalUpfrontCosts - fhog;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Total Cash Needed Upfront</span><span class="result-value">${formatCurrency(netUpfront)}</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-2">Purchase Breakdown</h4>
    <div class="result-row"><span class="result-label">Property Price</span><span class="result-value">${formatCurrency(propertyPrice)}</span></div>
    <div class="result-row"><span class="result-label">Deposit (${depositPercent}%)</span><span class="result-value">${formatCurrency(deposit)}</span></div>
    <div class="result-row"><span class="result-label">Loan Amount</span><span class="result-value">${formatCurrency(loanAmount)}</span></div>
    <div class="result-row"><span class="result-label">LVR</span><span class="result-value">${lvr.toFixed(1)}%</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Government Costs</h4>
    <div class="result-row"><span class="result-label">Stamp Duty (${state})</span><span class="result-value">${formatCurrency(stampDuty)}</span></div>
    <div class="result-row"><span class="result-label">Transfer/Registration Fees</span><span class="result-value">${formatCurrency(transferFee + mortgageRegistration)}</span></div>
    ${fhog > 0 ? `<div class="result-row"><span class="result-label">First Home Owner Grant (${state})</span><span class="result-value text-green-600">-${formatCurrency(fhog)}</span></div>` : ''}
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Professional & Other Costs</h4>
    <div class="result-row"><span class="result-label">Conveyancing/Solicitor</span><span class="result-value">${formatCurrency(conveyancingCost)}</span></div>
    <div class="result-row"><span class="result-label">Building Inspection</span><span class="result-value">${formatCurrency(buildingInspection)}</span></div>
    <div class="result-row"><span class="result-label">Pest Inspection</span><span class="result-value">${formatCurrency(pestInspection)}</span></div>
    <div class="result-row"><span class="result-label">Title Search</span><span class="result-value">${formatCurrency(titleSearch)}</span></div>
    ${lmi > 0 ? `<div class="result-row"><span class="result-label">Lenders Mortgage Insurance (est.)</span><span class="result-value text-red-600">${formatCurrency(lmi)}</span></div>` : ''}
    <div class="result-row"><span class="result-label">Moving Costs (est.)</span><span class="result-value">${formatCurrency(movingCosts)}</span></div>
    <hr class="my-2">
    <div class="result-row font-bold"><span class="result-label">Total Upfront Costs</span><span class="result-value">${formatCurrency(totalUpfrontCosts)}</span></div>
    ${fhog > 0 ? `<div class="result-row font-bold"><span class="result-label">After FHOG</span><span class="result-value">${formatCurrency(netUpfront)}</span></div>` : ''}
    <div class="result-row"><span class="result-label">Costs Beyond Deposit</span><span class="result-value">${formatCurrency(netUpfront - deposit)}</span></div>
  `;
}
