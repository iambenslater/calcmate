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
  const totalDeductions = parseFloat(document.getElementById('input-totalDeductions').value) || 0;
  const taxOffsets = parseFloat(document.getElementById('input-taxOffsets').value) || 0;
  const hasPrivateHealth = document.getElementById('input-privateHealth').checked;
  const spouseIncome = parseFloat(document.getElementById('input-spouseIncome').value) || 0;

  const taxableIncome = Math.max(0, totalIncome - totalDeductions);

  // Income tax on taxable income
  const grossTax = calculateTax(taxableIncome);

  // Low Income Tax Offset (LITO)
  let lito = 0;
  if (taxableIncome <= 45000) lito = 700;
  else if (taxableIncome <= 66667) lito = 700 - (taxableIncome - 45000) * 0.05;
  else lito = 0;
  lito = Math.max(0, lito);

  // Low and Middle Income Tax Offset is no longer available from 2025-26

  // Medicare levy
  const medicareLevy = taxableIncome > 26000 ? taxableIncome * 0.02 : 0;

  // Medicare levy surcharge (no PHI)
  let medicareSurcharge = 0;
  if (!hasPrivateHealth) {
    const mlsIncome = taxableIncome; // simplified
    if (mlsIncome > 140000) medicareSurcharge = mlsIncome * 0.015;
    else if (mlsIncome > 105000) medicareSurcharge = mlsIncome * 0.0125;
    else if (mlsIncome > 93000) medicareSurcharge = mlsIncome * 0.01;
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
