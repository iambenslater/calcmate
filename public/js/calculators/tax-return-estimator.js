function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateTax(taxableIncome) {
  if (taxableIncome <= 18200) return 0;
  if (taxableIncome <= 45000) return (taxableIncome - 18200) * 0.16;
  if (taxableIncome <= 135000) return 4288 + (taxableIncome - 45000) * 0.30;
  if (taxableIncome <= 190000) return 31288 + (taxableIncome - 135000) * 0.37;
  return 51638 + (taxableIncome - 190000) * 0.45;
}

function calculate() {
  const totalIncome = parseFloat(document.getElementById('input-totalIncome').value) || 0;
  const totalDeductions = parseFloat(document.getElementById('input-deductions').value) || 0;
  const taxOffsets = parseFloat(document.getElementById('input-taxWithheld').value) || 0;
  const phiEl = document.querySelector('input[name="input-privateHealthInsurance"]:checked');
  const hasPrivateHealth = phiEl ? phiEl.value === 'yes' : false;
  const spouseIncome = 0;

  const taxableIncome = Math.max(0, totalIncome - totalDeductions);

  // Income tax on taxable income
  const grossTax = calculateTax(taxableIncome);

  // Low Income Tax Offset (LITO) 2025-26
  // Max $700 at ≤$37,500; reduces by 5c/$ from $37,501 to $45,000 (to $325);
  // then reduces by 1.5c/$ from $45,001 to $66,667 (to $0)
  let lito = 0;
  if (taxableIncome <= 37500) lito = 700;
  else if (taxableIncome <= 45000) lito = 700 - (taxableIncome - 37500) * 0.05;
  else if (taxableIncome <= 66667) lito = 325 - (taxableIncome - 45000) * 0.015;
  else lito = 0;
  lito = Math.max(0, lito);

  // Low and Middle Income Tax Offset is no longer available from 2025-26

  // Medicare levy 2025-26: exempt ≤$27,222, phase-in 10c/$ to $34,028, full 2% above
  let medicareLevy = 0;
  if (taxableIncome > 34028) medicareLevy = taxableIncome * 0.02;
  else if (taxableIncome > 27222) medicareLevy = (taxableIncome - 27222) * 0.10;

  // Medicare levy surcharge (no PHI) — 2025-26 thresholds
  // Tier 1: $101,001–$118,000 = 1%, Tier 2: $118,001–$144,000 = 1.25%, Tier 3: $144,001+ = 1.5%
  let medicareSurcharge = 0;
  if (!hasPrivateHealth) {
    const mlsIncome = taxableIncome; // simplified
    if (mlsIncome > 144000) medicareSurcharge = mlsIncome * 0.015;
    else if (mlsIncome > 118000) medicareSurcharge = mlsIncome * 0.0125;
    else if (mlsIncome > 101000) medicareSurcharge = mlsIncome * 0.01;
  }

  // Private health insurance rebate (simplified)
  let phiRebate = 0;
  if (hasPrivateHealth) {
    if (taxableIncome <= 93000) phiRebate = 0; // would be claimed on PHI premium
  }

  // Net tax payable
  const totalOffsets = taxOffsets + lito;
  const netTax = Math.max(0, grossTax - totalOffsets);
  const totalOwing = netTax + medicareLevy + medicareSurcharge;
  const afterTax = totalIncome - totalOwing;

  // Estimate PAYG already withheld (assume employer withheld based on total income)
  const paygWithheld = calculateTax(totalIncome) + (totalIncome > 26000 ? totalIncome * 0.02 : 0);
  const estimatedRefund = paygWithheld - totalOwing;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Total Income</span><span class="result-value">${formatCurrency(totalIncome)}</span></div>
    <div class="result-row"><span class="result-label">Total Deductions</span><span class="result-value text-red-600">-${formatCurrency(totalDeductions)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Taxable Income</span><span class="result-value">${formatCurrency(taxableIncome)}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Gross Tax on Taxable Income</span><span class="result-value">${formatCurrency(grossTax)}</span></div>
    <div class="result-row"><span class="result-label">Low Income Tax Offset</span><span class="result-value text-green-600">-${formatCurrency(lito)}</span></div>
    ${taxOffsets > 0 ? `<div class="result-row"><span class="result-label">Other Tax Offsets</span><span class="result-value text-green-600">-${formatCurrency(taxOffsets)}</span></div>` : ''}
    <div class="result-row"><span class="result-label">Net Tax Payable</span><span class="result-value">${formatCurrency(netTax)}</span></div>
    <div class="result-row"><span class="result-label">Medicare Levy</span><span class="result-value">${formatCurrency(medicareLevy)}</span></div>
    ${medicareSurcharge > 0 ? `<div class="result-row"><span class="result-label">Medicare Surcharge</span><span class="result-value">${formatCurrency(medicareSurcharge)}</span></div>` : ''}
    <div class="result-row font-bold"><span class="result-label">Total Tax Owing</span><span class="result-value text-red-600">${formatCurrency(totalOwing)}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Estimated PAYG Already Withheld</span><span class="result-value">${formatCurrency(paygWithheld)}</span></div>
    <div class="result-row font-bold text-lg"><span class="result-label">${estimatedRefund >= 0 ? 'Estimated Tax Refund' : 'Estimated Tax Bill'}</span><span class="result-value ${estimatedRefund >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency(Math.abs(estimatedRefund))}</span></div>
  `;
}

function getTLDR() {
  const totalIncome = parseFloat(document.getElementById('input-totalIncome').value) || 0;
  if (totalIncome <= 0) return '';

  const totalDeductions = parseFloat(document.getElementById('input-deductions').value) || 0;
  const taxOffsets = parseFloat(document.getElementById('input-taxWithheld').value) || 0;
  const phiEl = document.querySelector('input[name="input-privateHealthInsurance"]:checked');
  const hasPrivateHealth = phiEl ? phiEl.value === 'yes' : false;

  const taxableIncome = Math.max(0, totalIncome - totalDeductions);
  const grossTax = calculateTax(taxableIncome);

  let lito = 0;
  if (taxableIncome <= 37500) lito = 700;
  else if (taxableIncome <= 45000) lito = 700 - (taxableIncome - 37500) * 0.05;
  else if (taxableIncome <= 66667) lito = 325 - (taxableIncome - 45000) * 0.015;
  lito = Math.max(0, lito);

  let medicareLevy = 0;
  if (taxableIncome > 34028) medicareLevy = taxableIncome * 0.02;
  else if (taxableIncome > 27222) medicareLevy = (taxableIncome - 27222) * 0.10;

  let medicareSurcharge = 0;
  if (!hasPrivateHealth) {
    if (taxableIncome > 144000) medicareSurcharge = taxableIncome * 0.015;
    else if (taxableIncome > 118000) medicareSurcharge = taxableIncome * 0.0125;
    else if (taxableIncome > 101000) medicareSurcharge = taxableIncome * 0.01;
  }

  const netTax = Math.max(0, grossTax - taxOffsets - lito);
  const totalOwing = netTax + medicareLevy + medicareSurcharge;
  const paygWithheld = calculateTax(totalIncome) + (totalIncome > 26000 ? totalIncome * 0.02 : 0);
  const estimatedRefund = paygWithheld - totalOwing;

  return 'On a taxable income of ' + formatCurrency(taxableIncome) + ', your total tax owing is ' + formatCurrency(totalOwing) + ' — you\'re looking at an estimated ' + (estimatedRefund >= 0 ? 'refund of ' + formatCurrency(estimatedRefund) : 'tax bill of ' + formatCurrency(Math.abs(estimatedRefund))) + '.';
}
