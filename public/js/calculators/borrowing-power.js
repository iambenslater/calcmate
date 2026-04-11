function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const grossIncome = parseFloat(document.getElementById('input-grossIncome').value) || 0;
  const partnerIncome = parseFloat(document.getElementById('input-partnerIncome').value) || 0;
  const annualIncome = grossIncome + partnerIncome;
  const monthlyExpenses = parseFloat(document.getElementById('input-monthlyExpenses').value) || 0;
  const existingDebts = parseFloat(document.getElementById('input-existingLoans').value) || 0;
  const creditCardLimits = parseFloat(document.getElementById('input-creditCardLimits').value) || 0;
  const dependants = parseInt(document.getElementById('input-dependants').value) || 0;
  const interestRate = (parseFloat(document.getElementById('input-interestRate').value) || 6.5) / 100;
  const loanTerm = parseInt(document.getElementById('input-loanTerm').value) || 30;

  // After-tax monthly income (rough estimate using average ~25% tax rate)
  const monthlyGross = annualIncome / 12;
  const estimatedTaxRate = annualIncome <= 18200 ? 0 : annualIncome <= 45000 ? 0.10 : annualIncome <= 135000 ? 0.22 : 0.32;
  const monthlyNet = monthlyGross * (1 - estimatedTaxRate);

  // HEM (Household Expenditure Measure) - simplified dependant cost
  const dependantCost = dependants * 400; // ~$400/month per dependant
  const livingExpenses = Math.max(monthlyExpenses, 1500 + dependantCost); // Floor of $1,500 + dependants

  // Credit card limits reduce borrowing capacity (~3% of limit per month)
  const creditCardMonthly = creditCardLimits * 0.03;

  // Net surplus
  const monthlySurplus = monthlyNet - livingExpenses - existingDebts - creditCardMonthly;

  // Banks use a serviceability buffer of ~3% above actual rate
  // Assume current rate ~6.5%, assessed at ~9.5%
  const assessmentRate = Math.max(interestRate + 0.03, 0.095);
  const monthlyAssessmentRate = assessmentRate / 12;
  const totalPayments = loanTerm * 12;
  const deposit = 0; // deposit not in this calculator's inputs

  // Maximum loan from monthly surplus: rearrange amortisation formula
  // P = M * [(1+r)^n - 1] / [r(1+r)^n]
  let maxLoan = 0;
  if (monthlySurplus > 0 && monthlyAssessmentRate > 0) {
    maxLoan = monthlySurplus * (Math.pow(1 + monthlyAssessmentRate, totalPayments) - 1) / (monthlyAssessmentRate * Math.pow(1 + monthlyAssessmentRate, totalPayments));
  }

  // DSR (Debt Service Ratio) — banks want < 30-35%
  const dsr = monthlyGross > 0 ? ((monthlySurplus > 0 ? (monthlyGross - monthlySurplus) / monthlyGross : 1) * 100) : 0;

  const maxPurchasePrice = maxLoan + deposit;
  const lvr = maxPurchasePrice > 0 ? ((maxLoan / maxPurchasePrice) * 100).toFixed(1) : 0;
  const needsLMI = parseFloat(lvr) > 80;

  // Monthly repayment at the given interest rate
  const realisticRate = interestRate / 12;
  const monthlyRepayment = maxLoan > 0 ? maxLoan * (realisticRate * Math.pow(1 + realisticRate, totalPayments)) / (Math.pow(1 + realisticRate, totalPayments) - 1) : 0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Estimated Borrowing Power</span><span class="result-value">${formatCurrency(Math.max(0, maxLoan))}</span></div>
    <div class="result-row font-bold"><span class="result-label">Maximum Purchase Price</span><span class="result-value">${formatCurrency(Math.max(0, maxPurchasePrice))}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Income Assessment</h4>
    <div class="result-row"><span class="result-label">Gross Monthly Income</span><span class="result-value">${formatCurrency(monthlyGross)}</span></div>
    <div class="result-row"><span class="result-label">Estimated Net Monthly</span><span class="result-value">${formatCurrency(monthlyNet)}</span></div>
    <div class="result-row"><span class="result-label">Living Expenses (assessed)</span><span class="result-value text-red-600">-${formatCurrency(livingExpenses)}</span></div>
    <div class="result-row"><span class="result-label">Existing Debt Repayments</span><span class="result-value text-red-600">-${formatCurrency(existingDebts)}</span></div>
    <div class="result-row"><span class="result-label">Monthly Surplus</span><span class="result-value ${monthlySurplus >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency(monthlySurplus)}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Loan Details</h4>
    <div class="result-row"><span class="result-label">Your Deposit</span><span class="result-value">${formatCurrency(deposit)}</span></div>
    <div class="result-row"><span class="result-label">Estimated LVR</span><span class="result-value">${lvr}%</span></div>
    <div class="result-row"><span class="result-label">Assessment Rate (buffered)</span><span class="result-value">${(assessmentRate * 100).toFixed(1)}%</span></div>
    <div class="result-row"><span class="result-label">Est. Monthly Repayment (at 6.5%)</span><span class="result-value">${formatCurrency(monthlyRepayment)}</span></div>
    ${needsLMI ? '<p class="text-sm text-amber-600 mt-2">LVR exceeds 80% — Lenders Mortgage Insurance (LMI) may be required.</p>' : '<p class="text-sm text-green-600 mt-2">LVR is 80% or below — no LMI required.</p>'}
    <p class="text-sm text-gray-500 mt-3">This is an estimate only. Actual borrowing power depends on your lender's specific criteria, credit history, and full financial assessment.</p>
  `;
}
