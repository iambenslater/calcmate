function calculate() {
  const income = parseFloat(document.getElementById('input-householdIncome').value) || 0;
  const expenses = parseFloat(document.getElementById('input-monthlyExpenses').value) || 0;
  const deposit = parseFloat(document.getElementById('input-depositSaved').value) || 0;
  const rate = (parseFloat(document.getElementById('input-interestRate').value) || 0) / 100;

  // Serviceability buffer: banks typically add 3% to current rate
  const bufferRate = rate + 0.03;
  const monthlyIncome = income / 12;
  const availableForRepayment = monthlyIncome - expenses;

  // Max loan from available monthly repayment (30 year term)
  const n = 360; // 30 years in months
  const r = bufferRate / 12;
  const maxLoan = r > 0
    ? availableForRepayment * ((1 - Math.pow(1 + r, -n)) / r)
    : availableForRepayment * n;

  const maxPurchase = maxLoan + deposit;

  // Actual monthly repayment at offered rate
  const actualR = rate / 12;
  const actualRepayment = actualR > 0
    ? maxLoan * (actualR * Math.pow(1 + actualR, n)) / (Math.pow(1 + actualR, n) - 1)
    : maxLoan / n;

  // LVR
  const lvr = maxPurchase > 0 ? ((maxLoan / maxPurchase) * 100) : 0;
  const lmiWarning = lvr > 80;

  // Debt-to-income ratio
  const dti = income > 0 ? maxLoan / income : 0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Household Income</span><span class="result-value">${fmt(income)}/yr (${fmt(monthlyIncome)}/mo)</span></div>
    <div class="result-row"><span class="result-label">Monthly Expenses</span><span class="result-value">${fmt(expenses)}</span></div>
    <div class="result-row"><span class="result-label">Available for Repayments</span><span class="result-value">${fmt(availableForRepayment)}/mo</span></div>
    <div class="result-row"><span class="result-label">Deposit Saved</span><span class="result-value">${fmt(deposit)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Interest Rate</span><span class="result-value">${(rate * 100).toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Serviceability Rate (rate + 3%)</span><span class="result-value">${(bufferRate * 100).toFixed(2)}%</span></div>
    <div class="result-row highlight"><span class="result-label">Estimated Max Loan</span><span class="result-value">${fmt(maxLoan)}</span></div>
    <div class="result-row highlight"><span class="result-label">Estimated Max Purchase Price</span><span class="result-value">${fmt(maxPurchase)}</span></div>
    <div class="result-row"><span class="result-label">Estimated Monthly Repayment</span><span class="result-value">${fmt(actualRepayment)}</span></div>
    <div class="result-row"><span class="result-label">Loan-to-Value Ratio (LVR)</span><span class="result-value">${lvr.toFixed(1)}%</span></div>
    <div class="result-row"><span class="result-label">Debt-to-Income Ratio</span><span class="result-value">${dti.toFixed(1)}x</span></div>
    ${lmiWarning ? '<p style="margin-top:12px;font-size:0.85rem;color:var(--error)">LVR above 80% - Lenders Mortgage Insurance (LMI) may apply.</p>' : ''}
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
