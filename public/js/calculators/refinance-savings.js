function calculate() {
  const balance = parseFloat(document.getElementById('input-currentBalance').value) || 0;
  const currentRate = (parseFloat(document.getElementById('input-currentRate').value) || 0) / 100;
  const currentTermRemaining = parseInt(document.getElementById('input-currentTerm').value) || 0;
  const newRate = (parseFloat(document.getElementById('input-newRate').value) || 0) / 100;
  const newTerm = parseInt(document.getElementById('input-newTerm').value) || 0;
  const switchingCosts = parseFloat(document.getElementById('input-switchingCosts').value) || 0;

  function calcRepayment(principal, annualRate, termYears) {
    const n = termYears * 12;
    const r = annualRate / 12;
    if (r <= 0 || n <= 0) return principal / Math.max(n, 1);
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const currentMonthly = calcRepayment(balance, currentRate, currentTermRemaining);
  const currentTotal = currentMonthly * currentTermRemaining * 12;
  const currentInterest = currentTotal - balance;

  const newMonthly = calcRepayment(balance + switchingCosts, newRate, newTerm);
  const newTotal = newMonthly * newTerm * 12;
  const newInterest = newTotal - balance - switchingCosts;

  const monthlySaving = currentMonthly - newMonthly;
  const totalSaving = currentTotal - newTotal;
  const breakEvenMonths = monthlySaving > 0 ? Math.ceil(switchingCosts / monthlySaving) : 0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row" style="font-weight:600"><span class="result-label">Current Loan</span><span class="result-value"></span></div>
    <div class="result-row"><span class="result-label">Balance</span><span class="result-value">${fmt(balance)}</span></div>
    <div class="result-row"><span class="result-label">Rate</span><span class="result-value">${(currentRate * 100).toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Remaining Term</span><span class="result-value">${currentTermRemaining} years</span></div>
    <div class="result-row"><span class="result-label">Monthly Repayment</span><span class="result-value">${fmt(currentMonthly)}</span></div>
    <div class="result-row"><span class="result-label">Total Interest Remaining</span><span class="result-value">${fmt(currentInterest)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">New Loan</span><span class="result-value"></span></div>
    <div class="result-row"><span class="result-label">Rate</span><span class="result-value">${(newRate * 100).toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Term</span><span class="result-value">${newTerm} years</span></div>
    <div class="result-row"><span class="result-label">Switching Costs</span><span class="result-value">${fmt(switchingCosts)}</span></div>
    <div class="result-row"><span class="result-label">Monthly Repayment</span><span class="result-value">${fmt(newMonthly)}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value">${fmt(newInterest)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row highlight"><span class="result-label">Monthly Saving</span><span class="result-value">${fmt(monthlySaving)}</span></div>
    <div class="result-row highlight"><span class="result-label">Total Saving (incl. switching costs)</span><span class="result-value">${fmt(totalSaving)}</span></div>
    ${switchingCosts > 0 && monthlySaving > 0 ? `<div class="result-row"><span class="result-label">Break-even Point</span><span class="result-value">${breakEvenMonths} months</span></div>` : ''}
    <div class="result-row" style="color:${totalSaving > 0 ? 'var(--success)' : 'var(--error)'}"><span class="result-label">Verdict</span><span class="result-value">${totalSaving > 0 ? 'Refinancing saves you money' : 'Refinancing costs more overall'}</span></div>
  `;
}

function fmt(n) { return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getTLDR() {
  const balance = parseFloat(document.getElementById('input-currentBalance').value) || 0;
  const currentRate = (parseFloat(document.getElementById('input-currentRate').value) || 0) / 100;
  const currentTermRemaining = parseInt(document.getElementById('input-currentTerm').value) || 0;
  const newRate = (parseFloat(document.getElementById('input-newRate').value) || 0) / 100;
  const newTerm = parseInt(document.getElementById('input-newTerm').value) || 0;
  const switchingCosts = parseFloat(document.getElementById('input-switchingCosts').value) || 0;

  if (balance <= 0) return '';

  function calcRepayment(principal, annualRate, termYears) {
    const n = termYears * 12;
    const r = annualRate / 12;
    if (r <= 0 || n <= 0) return principal / Math.max(n, 1);
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const currentMonthly = calcRepayment(balance, currentRate, currentTermRemaining);
  const currentTotal = currentMonthly * currentTermRemaining * 12;

  const newMonthly = calcRepayment(balance + switchingCosts, newRate, newTerm);
  const newTotal = newMonthly * newTerm * 12;

  const monthlySaving = currentMonthly - newMonthly;
  const totalSaving = currentTotal - newTotal;
  const breakEvenMonths = monthlySaving > 0 && switchingCosts > 0 ? Math.ceil(switchingCosts / monthlySaving) : 0;

  if (totalSaving > 0) {
    return 'Refinancing saves you ' + fmt(monthlySaving) + '/month and ' + fmt(totalSaving) + ' overall' + (breakEvenMonths > 0 ? ', breaking even in ' + breakEvenMonths + ' months' : '') + '.';
  } else {
    return 'Refinancing would cost you ' + fmt(Math.abs(totalSaving)) + ' more overall — staying with your current loan is cheaper.';
  }
}
