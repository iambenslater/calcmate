function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateIncomeTax(taxableIncome) {
  // 2025-26 Australian tax brackets (resident)
  if (taxableIncome <= 18200) return 0;
  if (taxableIncome <= 45000) return (taxableIncome - 18200) * 0.16;
  if (taxableIncome <= 135000) return 4288 + (taxableIncome - 45000) * 0.30;
  if (taxableIncome <= 190000) return 31288 + (taxableIncome - 135000) * 0.37;
  return 51638 + (taxableIncome - 190000) * 0.45;
}

function calculateHELPRepayment(repaymentIncome) {
  // 2025-26 HELP repayment — new marginal system (from 1 Jul 2025)
  // No repayment below $67,000
  // 15c per $1 over $67,000 up to $125,000
  // $8,700 + 17c per $1 over $125,000 up to $179,285
  // 10% of total repayment income above $179,285
  if (repaymentIncome <= 67000) return 0;
  if (repaymentIncome <= 125000) return (repaymentIncome - 67000) * 0.15;
  if (repaymentIncome <= 179285) return 8700 + (repaymentIncome - 125000) * 0.17;
  return repaymentIncome * 0.10;
}

// Helper to read radio/checkbox value — works with both input types
function getRadioVal(name) {
  const el = document.querySelector('input[name="input-' + name + '"]:checked');
  if (el) return el.value;
  const cb = document.getElementById('input-' + name);
  if (cb && cb.type === 'checkbox') return cb.checked ? 'yes' : 'no';
  return 'no';
}

function calculate() {
  const grossSalary = parseFloat(document.getElementById('input-grossSalary').value) || 0;
  const payFrequency = document.getElementById('input-payFrequency').value || 'annual';
  const hasHELP = getRadioVal('helpDebt') === 'yes';
  const hasPrivateHealth = getRadioVal('privateHealth') === 'yes';
  const includesSuper = getRadioVal('includesSuper') === 'yes';

  // Annualise if needed
  let annualGross = grossSalary;
  if (payFrequency === 'monthly') annualGross = grossSalary * 12;
  else if (payFrequency === 'fortnightly') annualGross = grossSalary * 26;
  else if (payFrequency === 'weekly') annualGross = grossSalary * 52;

  // Super — if salary includes super, back it out (SG rate: 12% from 1 Jul 2025)
  let superAmount;
  if (includesSuper) {
    superAmount = annualGross - (annualGross / 1.12);
    annualGross = annualGross - superAmount;
  } else {
    superAmount = annualGross * 0.12;
  }

  // Income tax
  const incomeTax = calculateIncomeTax(annualGross);

  // Medicare levy 2% (threshold $27,222 for 2025-26; phase-in 10c/$ from $27,222 to $34,028)
  let medicareLevy = 0;
  if (annualGross <= 27222) {
    medicareLevy = 0;
  } else if (annualGross <= 34028) {
    medicareLevy = (annualGross - 27222) * 0.10;
  } else {
    medicareLevy = annualGross * 0.02;
  }

  // Medicare levy surcharge (no PHI) — 2025-26 thresholds
  // Tier 1: $101,001–$118,000 = 1%, Tier 2: $118,001–$144,000 = 1.25%, Tier 3: $144,001+ = 1.5%
  let medicareSurcharge = 0;
  if (!hasPrivateHealth) {
    if (annualGross > 144000) medicareSurcharge = annualGross * 0.015;
    else if (annualGross > 118000) medicareSurcharge = annualGross * 0.0125;
    else if (annualGross > 101000) medicareSurcharge = annualGross * 0.01;
  }

  // HELP repayment
  const helpRepayment = hasHELP ? calculateHELPRepayment(annualGross) : 0;

  const totalDeductions = incomeTax + medicareLevy + medicareSurcharge + helpRepayment;
  const annualTakeHome = annualGross - totalDeductions;

  // Per-period breakdown
  const divisors = { annual: 1, monthly: 12, fortnightly: 26, weekly: 52 };
  const divisor = divisors[payFrequency] || 1;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Gross Annual Salary</span><span class="result-value">${formatCurrency(annualGross)}</span></div>
    <div class="result-row"><span class="result-label">Income Tax</span><span class="result-value text-red-600">-${formatCurrency(incomeTax)}</span></div>
    <div class="result-row"><span class="result-label">Medicare Levy</span><span class="result-value text-red-600">-${formatCurrency(medicareLevy)}</span></div>
    ${medicareSurcharge > 0 ? `<div class="result-row"><span class="result-label">Medicare Surcharge (no PHI)</span><span class="result-value text-red-600">-${formatCurrency(medicareSurcharge)}</span></div>` : ''}
    ${hasHELP ? `<div class="result-row"><span class="result-label">HELP Repayment</span><span class="result-value text-red-600">-${formatCurrency(helpRepayment)}</span></div>` : ''}
    <hr class="my-2">
    <div class="result-row font-bold"><span class="result-label">Annual Take-Home Pay</span><span class="result-value">${formatCurrency(annualTakeHome)}</span></div>
    <div class="result-row"><span class="result-label">Monthly Take-Home</span><span class="result-value">${formatCurrency(annualTakeHome / 12)}</span></div>
    <div class="result-row"><span class="result-label">Fortnightly Take-Home</span><span class="result-value">${formatCurrency(annualTakeHome / 26)}</span></div>
    <div class="result-row"><span class="result-label">Weekly Take-Home</span><span class="result-value">${formatCurrency(annualTakeHome / 52)}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Employer Super (12%)</span><span class="result-value">${formatCurrency(superAmount)}</span></div>
    <div class="result-row"><span class="result-label">Effective Tax Rate</span><span class="result-value">${(totalDeductions / annualGross * 100).toFixed(1)}%</span></div>
  `;
}
