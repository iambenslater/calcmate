function formatCurrency(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function calcStampDuty(price, state, firstHome, propertyType) {
  let duty = 0;

  if (state === 'NSW') {
    // NSW 2024-25 general rates
    if (price <= 16000) duty = price * 0.0125;
    else if (price <= 35000) duty = 200 + (price - 16000) * 0.015;
    else if (price <= 93000) duty = 485 + (price - 35000) * 0.0175;
    else if (price <= 351000) duty = 1500 + (price - 93000) * 0.035;
    else if (price <= 1168000) duty = 10530 + (price - 351000) * 0.045;
    else duty = 47295 + (price - 1168000) * 0.055;

    // NSW FHBAS: exempt under $800k established, $1M new; concession $800k-$1M established
    if (firstHome) {
      if (propertyType === 'established' && price <= 800000) duty = 0;
      else if (propertyType === 'new' && price <= 1000000) duty = 0;
      else if (propertyType === 'established' && price <= 1000000) {
        // Taper: full duty * fraction over threshold
        const reduction = duty * (1000000 - price) / 200000;
        duty = Math.max(0, duty - reduction);
      }
    }

  } else if (state === 'VIC') {
    // VIC 2024-25 general rates
    if (price <= 25000) duty = price * 0.014;
    else if (price <= 130000) duty = 350 + (price - 25000) * 0.024;
    else if (price <= 440000) duty = 2870 + (price - 130000) * 0.06;
    else if (price <= 550000) duty = 21470 + (price - 440000) * 0.06;
    else duty = 28070 + (price - 550000) * 0.055;

    // VIC First Home: exempt under $600k established; new builds exempt under $750k
    if (firstHome) {
      if (propertyType === 'established' && price <= 600000) duty = 0;
      else if (propertyType === 'established' && price < 750000) {
        duty = duty * (price - 600000) / 150000;
      } else if (propertyType === 'new' && price <= 750000) duty = 0;
    }

  } else if (state === 'QLD') {
    // QLD 2024-25
    if (price <= 5000) duty = 0;
    else if (price <= 75000) duty = (price - 5000) * 0.015;
    else if (price <= 540000) duty = 1050 + (price - 75000) * 0.035;
    else if (price <= 1000000) duty = 17325 + (price - 540000) * 0.045;
    else duty = 38025 + (price - 1000000) * 0.0575;

    // QLD FHOG concession: $350k exempt, up to $540k concessional
    if (firstHome && price <= 500000) {
      if (price <= 350000) duty = 0;
      else duty = duty * (price - 350000) / 150000;
    }

  } else if (state === 'SA') {
    // SA 2024-25
    if (price <= 12000) duty = price * 0.01;
    else if (price <= 30000) duty = 120 + (price - 12000) * 0.02;
    else if (price <= 50000) duty = 480 + (price - 30000) * 0.03;
    else if (price <= 100000) duty = 1080 + (price - 50000) * 0.035;
    else if (price <= 200000) duty = 2830 + (price - 100000) * 0.04;
    else if (price <= 250000) duty = 6830 + (price - 200000) * 0.0425;
    else if (price <= 300000) duty = 8955 + (price - 250000) * 0.05;
    else if (price <= 500000) duty = 11455 + (price - 300000) * 0.055;
    else duty = 22455 + (price - 500000) * 0.055;
    // SA has no first home buyer stamp duty exemption (FHOG grant instead)

  } else if (state === 'WA') {
    // WA 2024-25
    if (price <= 80000) duty = price * 0.019;
    else if (price <= 100000) duty = 1520 + (price - 80000) * 0.0285;
    else if (price <= 250000) duty = 2090 + (price - 100000) * 0.0285;
    else if (price <= 500000) duty = 6365 + (price - 250000) * 0.038;
    else if (price <= 1000000) duty = 15865 + (price - 500000) * 0.0455;
    else duty = 38615 + (price - 1000000) * 0.051;

    // WA First Home: exempt under $430k, concessional to $530k
    if (firstHome) {
      if (price <= 430000) duty = 0;
      else if (price <= 530000) duty = duty * (price - 430000) / 100000;
    }

  } else if (state === 'TAS') {
    // TAS 2024-25
    if (price <= 3000) duty = price * 0.01;
    else if (price <= 25000) duty = 50 + (price - 3000) * 0.015;
    else if (price <= 75000) duty = 380 + (price - 25000) * 0.0225;
    else if (price <= 200000) duty = 1505 + (price - 75000) * 0.035;
    else if (price <= 375000) duty = 5880 + (price - 200000) * 0.04;
    else if (price <= 725000) duty = 12880 + (price - 375000) * 0.0425;
    else duty = 27755 + (price - 725000) * 0.045;
    // TAS first home: 50% concession on new builds
    if (firstHome && propertyType === 'new') duty = duty * 0.5;

  } else if (state === 'NT') {
    // NT 2024-25
    if (price <= 525000) {
      duty = (0.06571441 * price + 15) * price / 1000;
    } else if (price <= 3000000) {
      duty = price * 0.049;
    } else {
      duty = price * 0.055;
    }
    // NT first home: up to $500k exempt
    if (firstHome && price <= 500000) duty = 0;
    else if (firstHome && price < 650000) duty = duty * (price - 500000) / 150000;

  } else if (state === 'ACT') {
    // ACT 2024-25 (sliding scale duty)
    if (price <= 200000) duty = price * 0.0120;
    else if (price <= 300000) duty = 2400 + (price - 200000) * 0.022;
    else if (price <= 500000) duty = 4600 + (price - 300000) * 0.034;
    else if (price <= 750000) duty = 11400 + (price - 500000) * 0.043;
    else if (price <= 1000000) duty = 22150 + (price - 750000) * 0.054;
    else if (price <= 1455000) duty = 34650 + (price - 1000000) * 0.059;
    else duty = 61495 + (price - 1455000) * 0.066;

    // ACT first home: concession (Home Buyer Concession Scheme) for lower-income — simplified
    if (firstHome && price <= 900000) duty = 0;
  }

  return Math.max(0, Math.round(duty));
}

function calculate() {
  const price = parseFloat(document.getElementById('input-propertyPrice').value) || 0;
  const state = document.getElementById('input-state').value;
  const firstHome = document.getElementById('input-firstHomeBuyer').checked;
  const propertyType = document.querySelector('input[name="input-propertyType"]:checked')
    ? document.querySelector('input[name="input-propertyType"]:checked').value
    : 'established';

  if (price <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid property price.</p>';
    return;
  }

  const stampDuty = calcStampDuty(price, state, firstHome, propertyType);

  // Other costs — midpoint estimates
  const legalFee = price > 700000 ? 2500 : 1500;
  const buildingInspection = propertyType === 'vacant-land' ? 0 : 500;
  const pestInspection = propertyType === 'vacant-land' ? 0 : 300;
  const loanApplicationFee = 400;

  // LMI: required if deposit < 20% (assume 10% deposit if they're asking)
  const assumedDeposit = price * 0.10;
  const lvr = ((price - assumedDeposit) / price) * 100;
  let lmiEstimate = 0;
  if (lvr > 80) {
    // Rough LMI: ~1-3% of loan amount depending on LVR
    const loanAmt = price - assumedDeposit;
    lmiEstimate = loanAmt * (lvr > 90 ? 0.025 : 0.015);
  }

  const totalCosts = stampDuty + legalFee + buildingInspection + pestInspection + loanApplicationFee + lmiEstimate;
  const totalRequired = price + totalCosts;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Total Estimated Buying Costs</span><span class="result-value">${formatCurrency(totalCosts)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Total Funds Required</span><span class="result-value">${formatCurrency(totalRequired)}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Cost Breakdown</h4>
    <div class="result-row"><span class="result-label">Stamp Duty (${state}${firstHome ? ' — First Home Buyer' : ''})</span><span class="result-value">${formatCurrency(stampDuty)}</span></div>
    <div class="result-row"><span class="result-label">Legal / Conveyancing</span><span class="result-value">~${formatCurrency(legalFee)}</span></div>
    ${propertyType !== 'vacant-land' ? `<div class="result-row"><span class="result-label">Building Inspection</span><span class="result-value">~${formatCurrency(buildingInspection)}</span></div>` : ''}
    ${propertyType !== 'vacant-land' ? `<div class="result-row"><span class="result-label">Pest Inspection</span><span class="result-value">~${formatCurrency(pestInspection)}</span></div>` : ''}
    <div class="result-row"><span class="result-label">Loan Application Fee</span><span class="result-value">~${formatCurrency(loanApplicationFee)}</span></div>
    ${lmiEstimate > 0 ? `<div class="result-row"><span class="result-label">LMI Estimate (10% deposit assumed)</span><span class="result-value">~${formatCurrency(lmiEstimate)}</span></div>` : ''}
    ${lmiEstimate === 0 ? '<p class="text-sm text-green-600 mt-2">No LMI required if your deposit is 20% or more.</p>' : '<p class="text-sm text-amber-600 mt-2">LMI applies when your deposit is less than 20%. Bring the deposit to 20% to eliminate this cost.</p>'}
    ${firstHome && stampDuty === 0 ? '<p class="text-sm text-green-600 mt-2">First Home Buyer stamp duty exemption applied — $0 stamp duty.</p>' : ''}
    <p class="text-sm text-gray-500 mt-3">Costs are estimates. Stamp duty rates are 2024–25. Always confirm with your solicitor and lender.</p>
  `;
}
