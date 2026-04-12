function calculate() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('input-interestRate').value) || 0;
  const weeklyRent = parseFloat(document.getElementById('input-weeklyRent').value) || 0;
  const annualExpenses = parseFloat(document.getElementById('input-annualExpenses').value) || 0;
  const marginalTaxRateStr = document.getElementById('input-marginalRate').value;
  const marginalTaxRate = parseFloat(marginalTaxRateStr) / 100;

  const annualRent = weeklyRent * 52;
  const annualInterest = loanAmount * (interestRate / 100);

  // Depreciation estimate (building: 2.5% of construction cost, assume 60% of value)
  const buildingDepreciation = propertyValue * 0.60 * 0.025;
  // Plant & equipment depreciation estimate
  const plantDepreciation = 2000;
  const totalDepreciation = buildingDepreciation + plantDepreciation;

  // Total deductions
  const totalDeductions = annualInterest + annualExpenses + totalDepreciation;

  // Annual loss (negative gearing)
  const annualLoss = totalDeductions - annualRent;
  const isNegativelyGeared = annualLoss > 0;

  // Tax benefit
  const taxBenefit = isNegativelyGeared ? annualLoss * marginalTaxRate : 0;

  // After-tax cost
  const afterTaxCost = isNegativelyGeared ? annualLoss - taxBenefit : 0;
  const weeklyAfterTaxCost = afterTaxCost / 52;

  // Cash flow (before depreciation, which is non-cash)
  const cashLoss = (annualInterest + annualExpenses) - annualRent;
  const weeklyCashCost = cashLoss > 0 ? cashLoss / 52 : 0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">Property: ${fmt(propertyValue)} | Loan: ${fmt(loanAmount)} at ${interestRate}% | Tax bracket: ${(marginalTaxRate * 100).toFixed(0)}%</p>
    <div class="result-row"><span class="result-label">Annual Rental Income</span><span class="result-value">${fmt(annualRent)}</span></div>
    <div class="result-row"><span class="result-label">Annual Interest</span><span class="result-value">-${fmt(annualInterest)}</span></div>
    <div class="result-row"><span class="result-label">Annual Expenses</span><span class="result-value">-${fmt(annualExpenses)}</span></div>
    <div class="result-row"><span class="result-label">Depreciation (est.)</span><span class="result-value">-${fmt(totalDepreciation)}</span></div>
    <div class="result-row"><span class="result-label">Total Deductions</span><span class="result-value">${fmt(totalDeductions)}</span></div>
    <div class="result-row highlight"><span class="result-label">Annual Loss</span><span class="result-value">${isNegativelyGeared ? '-' : ''}${fmt(Math.abs(annualLoss))}</span></div>
    <div class="result-row highlight"><span class="result-label">Tax Benefit (${(marginalTaxRate * 100).toFixed(0)}%)</span><span class="result-value">${fmt(taxBenefit)}/yr</span></div>
    <div class="result-row highlight"><span class="result-label">After-Tax Cost</span><span class="result-value">${fmt(afterTaxCost)}/yr (${fmt(weeklyAfterTaxCost)}/wk)</span></div>
    <div class="result-row"><span class="result-label">Cash Out-of-Pocket</span><span class="result-value">${fmt(cashLoss > 0 ? cashLoss : 0)}/yr (${fmt(weeklyCashCost)}/wk)</span></div>
    <div class="result-row"><span class="result-label">Status</span><span class="result-value">${isNegativelyGeared ? 'Negatively Geared' : 'Positively Geared'}</span></div>
    <p class="result-note">Depreciation is estimated. Get a quantity surveyor report for accurate figures. This calculator does not account for capital gains, land tax, or changes in interest rates. Consult a tax professional for your specific situation. AU marginal tax rates 2024-25: $18,201-$45,000 = 16%, $45,001-$135,000 = 30%, $135,001-$190,000 = 37%, $190,001+ = 45%.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', {minimumFractionDigits:2, maximumFractionDigits:2}); }

function getTLDR() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('input-interestRate').value) || 0;
  const weeklyRent = parseFloat(document.getElementById('input-weeklyRent').value) || 0;
  const annualExpenses = parseFloat(document.getElementById('input-annualExpenses').value) || 0;
  const marginalTaxRate = parseFloat(document.getElementById('input-marginalRate').value) / 100;
  if (propertyValue <= 0 || weeklyRent <= 0) return '';
  const annualRent = weeklyRent * 52;
  const annualInterest = loanAmount * (interestRate / 100);
  const totalDepreciation = propertyValue * 0.60 * 0.025 + 2000;
  const totalDeductions = annualInterest + annualExpenses + totalDepreciation;
  const annualLoss = totalDeductions - annualRent;
  const isNegativelyGeared = annualLoss > 0;
  if (!isNegativelyGeared) return 'Your property is positively geared — rental income of ' + fmt(annualRent) + ' exceeds your total deductions of ' + fmt(totalDeductions) + '.';
  const taxBenefit = annualLoss * marginalTaxRate;
  const afterTaxCost = annualLoss - taxBenefit;
  return 'Your property is negatively geared with an annual loss of ' + fmt(annualLoss) + ' — the ' + (marginalTaxRate * 100).toFixed(0) + '% tax benefit of ' + fmt(taxBenefit) + ' brings your after-tax out-of-pocket cost to ' + fmt(afterTaxCost) + '/year (' + fmt(afterTaxCost / 52) + '/week).';
}
