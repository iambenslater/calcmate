function formatCurrency(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function monthlyRepaymentCalc(principal, annualRate, termYears) {
  if (principal <= 0) return 0;
  const r = (annualRate / 100) / 12;
  const n = termYears * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function totalInterestCalc(principal, annualRate, termYears) {
  const monthly = monthlyRepaymentCalc(principal, annualRate, termYears);
  return monthly * termYears * 12 - principal;
}

function calculate() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const fixedRate = parseFloat(document.getElementById('input-fixedRate').value) || 6.0;
  const variableRate = parseFloat(document.getElementById('input-variableRate').value) || 6.5;
  const fixedPortion = parseFloat(document.getElementById('input-fixedPortion').value) || 50;
  const loanTerm = parseFloat(document.getElementById('input-loanTerm').value) || 30;

  if (loanAmount <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid loan amount.</p>';
    return;
  }
  if (fixedPortion < 0 || fixedPortion > 100) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Fixed portion must be between 0% and 100%.</p>';
    return;
  }

  const variablePortion = 100 - fixedPortion;
  const fixedAmount = loanAmount * (fixedPortion / 100);
  const variableAmount = loanAmount * (variablePortion / 100);

  // Split loan repayments
  const fixedRepayment = monthlyRepaymentCalc(fixedAmount, fixedRate, loanTerm);
  const variableRepayment = monthlyRepaymentCalc(variableAmount, variableRate, loanTerm);
  const totalRepayment = fixedRepayment + variableRepayment;

  // Total interest for split
  const fixedInterest = totalInterestCalc(fixedAmount, fixedRate, loanTerm);
  const variableInterest = totalInterestCalc(variableAmount, variableRate, loanTerm);
  const totalInterestSplit = fixedInterest + variableInterest;
  const totalPaidSplit = loanAmount + totalInterestSplit;

  // All-fixed comparison
  const allFixedRepayment = monthlyRepaymentCalc(loanAmount, fixedRate, loanTerm);
  const allFixedInterest = totalInterestCalc(loanAmount, fixedRate, loanTerm);

  // All-variable comparison
  const allVariableRepayment = monthlyRepaymentCalc(loanAmount, variableRate, loanTerm);
  const allVariableInterest = totalInterestCalc(loanAmount, variableRate, loanTerm);

  // Blended rate (weighted average)
  const blendedRate = (fixedRate * (fixedPortion / 100)) + (variableRate * (variablePortion / 100));

  // Savings vs each scenario
  const savedVsFixed = allFixedInterest - totalInterestSplit;
  const savedVsVariable = allVariableInterest - totalInterestSplit;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Combined Monthly Repayment</span><span class="result-value">${formatCurrency(totalRepayment)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Blended Interest Rate</span><span class="result-value">${blendedRate.toFixed(2)}% p.a.</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Split Loan Breakdown (${loanTerm} years)</h4>
    <div class="result-row"><span class="result-label">Fixed Portion (${fixedPortion}%)</span><span class="result-value">${formatCurrency(fixedAmount)}</span></div>
    <div class="result-row"><span class="result-label">Fixed Rate Monthly Repayment</span><span class="result-value">${formatCurrency(fixedRepayment)}</span></div>
    <div class="result-row"><span class="result-label">Fixed Total Interest</span><span class="result-value text-red-600">${formatCurrency(fixedInterest)}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Variable Portion (${variablePortion}%)</span><span class="result-value">${formatCurrency(variableAmount)}</span></div>
    <div class="result-row"><span class="result-label">Variable Rate Monthly Repayment</span><span class="result-value">${formatCurrency(variableRepayment)}</span></div>
    <div class="result-row"><span class="result-label">Variable Total Interest</span><span class="result-value text-red-600">${formatCurrency(variableInterest)}</span></div>
    <hr class="my-2">
    <div class="result-row font-bold"><span class="result-label">Total Interest (Split)</span><span class="result-value text-red-600">${formatCurrency(totalInterestSplit)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Total Paid (Split)</span><span class="result-value">${formatCurrency(totalPaidSplit)}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Comparison</h4>
    <div class="result-row"><span class="result-label">All Fixed (${fixedRate}%) — Monthly</span><span class="result-value">${formatCurrency(allFixedRepayment)}</span></div>
    <div class="result-row"><span class="result-label">All Fixed — Total Interest</span><span class="result-value">${formatCurrency(allFixedInterest)}</span></div>
    <div class="result-row"><span class="result-label">Split vs All Fixed</span><span class="result-value ${savedVsFixed >= 0 ? 'text-green-600' : 'text-red-600'}">${savedVsFixed >= 0 ? 'Save ' : 'Cost '} ${formatCurrency(Math.abs(savedVsFixed))}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">All Variable (${variableRate}%) — Monthly</span><span class="result-value">${formatCurrency(allVariableRepayment)}</span></div>
    <div class="result-row"><span class="result-label">All Variable — Total Interest</span><span class="result-value">${formatCurrency(allVariableInterest)}</span></div>
    <div class="result-row"><span class="result-label">Split vs All Variable</span><span class="result-value ${savedVsVariable >= 0 ? 'text-green-600' : 'text-red-600'}">${savedVsVariable >= 0 ? 'Save ' : 'Cost '} ${formatCurrency(Math.abs(savedVsVariable))}</span></div>
    <p class="text-sm text-gray-500 mt-3">Split loans give you rate certainty on the fixed portion while keeping flexibility (extra repayments, offset accounts) on the variable portion. Calculations assume rates remain constant. Variable rates can change at any time.</p>
  `;
}

function getTLDR() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const fixedRate = parseFloat(document.getElementById('input-fixedRate').value) || 6.0;
  const variableRate = parseFloat(document.getElementById('input-variableRate').value) || 6.5;
  const fixedPortion = parseFloat(document.getElementById('input-fixedPortion').value) || 50;
  const loanTerm = parseFloat(document.getElementById('input-loanTerm').value) || 30;

  if (loanAmount <= 0) return '';

  const variablePortion = 100 - fixedPortion;
  const fixedAmount = loanAmount * (fixedPortion / 100);
  const variableAmount = loanAmount * (variablePortion / 100);

  const fixedRepayment = monthlyRepaymentCalc(fixedAmount, fixedRate, loanTerm);
  const variableRepayment = monthlyRepaymentCalc(variableAmount, variableRate, loanTerm);
  const totalRepayment = fixedRepayment + variableRepayment;

  const blendedRate = (fixedRate * (fixedPortion / 100)) + (variableRate * (variablePortion / 100));
  const fixedInterest = totalInterestCalc(fixedAmount, fixedRate, loanTerm);
  const variableInterest = totalInterestCalc(variableAmount, variableRate, loanTerm);
  const totalInterestSplit = fixedInterest + variableInterest;

  return 'A ' + formatCurrency(loanAmount) + ' split loan (' + fixedPortion + '% fixed at ' + fixedRate + '%, ' + variablePortion + '% variable at ' + variableRate + '%) has a combined monthly repayment of ' + formatCurrency(totalRepayment) + ' at a blended rate of ' + blendedRate.toFixed(2) + '% over ' + loanTerm + ' years.';
}
