function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateAnnualTax(annualIncome, claimTaxFree) {
  if (!claimTaxFree) {
    // No tax-free threshold — flat 30% up to $135k then marginal
    if (annualIncome <= 45000) return annualIncome * 0.16 + annualIncome * (18200 / annualIncome) * 0.16;
    // Simplified: foreign-resident-like rates but still resident
    // ATO Schedule 2 (no tax-free threshold)
    if (annualIncome <= 135000) return annualIncome * 0.30;
    if (annualIncome <= 190000) return 40500 + (annualIncome - 135000) * 0.37;
    return 60850 + (annualIncome - 190000) * 0.45;
  }
  // Standard resident brackets 2025-26
  if (annualIncome <= 18200) return 0;
  if (annualIncome <= 45000) return (annualIncome - 18200) * 0.16;
  if (annualIncome <= 135000) return 4288 + (annualIncome - 45000) * 0.30;
  if (annualIncome <= 190000) return 31288 + (annualIncome - 135000) * 0.37;
  return 51638 + (annualIncome - 190000) * 0.45;
}

function calculate() {
  const grossPay = parseFloat(document.getElementById('input-grossPay').value) || 0;
  const payFrequency = document.getElementById('input-payFrequency').value || 'weekly';
  const claimTaxFreeEl = document.querySelector('input[name="input-claimTaxFreeThreshold"]:checked');
  const claimTaxFree = claimTaxFreeEl ? claimTaxFreeEl.value === 'yes' : true;

  const multipliers = { weekly: 52, fortnightly: 26, monthly: 12, annual: 1 };
  const labels = { weekly: 'Week', fortnightly: 'Fortnight', monthly: 'Month', annual: 'Year' };
  const multiplier = multipliers[payFrequency] || 52;

  const annualGross = grossPay * multiplier;
  const annualTax = calculateAnnualTax(annualGross, claimTaxFree);
  // Medicare levy 2025-26: exempt ≤$27,222, phase-in 10c/$ to $34,028, full 2% above
  let annualMedicare = 0;
  if (annualGross > 34028) annualMedicare = annualGross * 0.02;
  else if (annualGross > 27222) annualMedicare = (annualGross - 27222) * 0.10;

  const taxPerPeriod = annualTax / multiplier;
  const medicarePerPeriod = annualMedicare / multiplier;
  const totalWithheld = taxPerPeriod + medicarePerPeriod;
  const netPay = grossPay - totalWithheld;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <h4 class="font-semibold mb-2">Per ${labels[payFrequency]} Breakdown</h4>
    <div class="result-row"><span class="result-label">Gross Pay</span><span class="result-value">${formatCurrency(grossPay)}</span></div>
    <div class="result-row"><span class="result-label">PAYG Tax Withheld</span><span class="result-value text-red-600">-${formatCurrency(taxPerPeriod)}</span></div>
    <div class="result-row"><span class="result-label">Medicare Levy</span><span class="result-value text-red-600">-${formatCurrency(medicarePerPeriod)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Net Pay</span><span class="result-value">${formatCurrency(netPay)}</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-2">Annual Summary</h4>
    <div class="result-row"><span class="result-label">Annual Gross</span><span class="result-value">${formatCurrency(annualGross)}</span></div>
    <div class="result-row"><span class="result-label">Annual Tax</span><span class="result-value text-red-600">-${formatCurrency(annualTax)}</span></div>
    <div class="result-row"><span class="result-label">Annual Medicare</span><span class="result-value text-red-600">-${formatCurrency(annualMedicare)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Annual Net</span><span class="result-value">${formatCurrency(annualGross - annualTax - annualMedicare)}</span></div>
    <div class="result-row"><span class="result-label">Tax-Free Threshold</span><span class="result-value">${claimTaxFree ? 'Claimed' : 'Not Claimed'}</span></div>
  `;
}

function getTLDR() {
  const grossPay = parseFloat(document.getElementById('input-grossPay').value) || 0;
  if (grossPay <= 0) return '';

  const payFrequency = document.getElementById('input-payFrequency').value || 'weekly';
  const claimTaxFreeEl = document.querySelector('input[name="input-claimTaxFreeThreshold"]:checked');
  const claimTaxFree = claimTaxFreeEl ? claimTaxFreeEl.value === 'yes' : true;

  const multipliers = { weekly: 52, fortnightly: 26, monthly: 12, annual: 1 };
  const labels = { weekly: 'week', fortnightly: 'fortnight', monthly: 'month', annual: 'year' };
  const multiplier = multipliers[payFrequency] || 52;

  const annualGross = grossPay * multiplier;
  const annualTax = calculateAnnualTax(annualGross, claimTaxFree);
  let annualMedicare = 0;
  if (annualGross > 34028) annualMedicare = annualGross * 0.02;
  else if (annualGross > 27222) annualMedicare = (annualGross - 27222) * 0.10;

  const totalWithheld = (annualTax + annualMedicare) / multiplier;
  const netPay = grossPay - totalWithheld;

  return 'From your ' + formatCurrency(grossPay) + ' per ' + labels[payFrequency] + ' pay, ' + formatCurrency(totalWithheld) + ' will be withheld in PAYG tax and Medicare, leaving you with ' + formatCurrency(netPay) + ' in hand.';
}
