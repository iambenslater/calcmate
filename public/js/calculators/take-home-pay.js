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
  // 2025-26 HELP repayment thresholds
  const thresholds = [
    { min: 0, max: 54435, rate: 0 },
    { min: 54436, max: 62850, rate: 0.01 },
    { min: 62851, max: 66620, rate: 0.02 },
    { min: 66621, max: 70618, rate: 0.025 },
    { min: 70619, max: 74855, rate: 0.03 },
    { min: 74856, max: 79346, rate: 0.035 },
    { min: 79347, max: 84107, rate: 0.04 },
    { min: 84108, max: 89154, rate: 0.045 },
    { min: 89155, max: 94503, rate: 0.05 },
    { min: 94504, max: 100174, rate: 0.055 },
    { min: 100175, max: 106185, rate: 0.06 },
    { min: 106186, max: 112556, rate: 0.065 },
    { min: 112557, max: 119309, rate: 0.07 },
    { min: 119310, max: 126467, rate: 0.075 },
    { min: 126468, max: 134056, rate: 0.08 },
    { min: 134057, max: 142100, rate: 0.085 },
    { min: 142101, max: 150626, rate: 0.09 },
    { min: 150627, max: 159663, rate: 0.095 },
    { min: 159664, max: Infinity, rate: 0.10 }
  ];
  for (const t of thresholds) {
    if (repaymentIncome >= t.min && repaymentIncome <= t.max) {
      return repaymentIncome * t.rate;
    }
  }
  return 0;
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

  // Super — if salary includes super, back it out
  let superAmount;
  if (includesSuper) {
    superAmount = annualGross - (annualGross / 1.115);
    annualGross = annualGross - superAmount;
  } else {
    superAmount = annualGross * 0.115;
  }

  // Income tax
  const incomeTax = calculateIncomeTax(annualGross);

  // Medicare levy 2%
  const medicareLevy = annualGross > 26000 ? annualGross * 0.02 : 0;

  // Medicare levy surcharge (no PHI and income > $93,000)
  let medicareSurcharge = 0;
  if (!hasPrivateHealth) {
    if (annualGross > 140001) medicareSurcharge = annualGross * 0.015;
    else if (annualGross > 105001) medicareSurcharge = annualGross * 0.0125;
    else if (annualGross > 93001) medicareSurcharge = annualGross * 0.01;
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
    <div class="result-row"><span class="result-label">Employer Super (11.5%)</span><span class="result-value">${formatCurrency(superAmount)}</span></div>
    <div class="result-row"><span class="result-label">Effective Tax Rate</span><span class="result-value">${(totalDeductions / annualGross * 100).toFixed(1)}%</span></div>
  `;
}
