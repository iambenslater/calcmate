function calculate() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('input-interestRate').value) || 0;
  const loanTerm = parseFloat(document.getElementById('input-loanTerm').value) || 0;
  const balloonPayment = parseFloat(document.getElementById('input-balloonPayment').value) || 0;

  if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0) {
    alert('Please enter valid loan details.');
    return;
  }

  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTerm * 12;

  // Amortisation formula with optional balloon
  // PMT = [PV * r - FV * r / ((1+r)^n - 1)] / [1 - 1/(1+r)^n] ... simplified:
  // PMT = (PV - FV/(1+r)^n) * r / (1 - (1+r)^-n)
  const pvBalloon = balloonPayment / Math.pow(1 + monthlyRate, totalMonths);
  const adjustedLoan = loanAmount - pvBalloon;
  const monthlyPayment = adjustedLoan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  const totalPayments = monthlyPayment * totalMonths + balloonPayment;
  const totalInterest = totalPayments - loanAmount;
  const weeklyPayment = monthlyPayment * 12 / 52;
  const fortnightlyPayment = monthlyPayment * 12 / 26;

  // Build simple amortisation summary (first 12 months or full term)
  let balance = loanAmount;
  let yearRows = '';
  const yearsToShow = Math.min(loanTerm, 10);
  for (let y = 1; y <= yearsToShow; y++) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    for (let m = 1; m <= 12; m++) {
      if (y * 12 - 12 + m > totalMonths) break;
      const intPayment = balance * monthlyRate;
      const princPayment = monthlyPayment - intPayment;
      yearInterest += intPayment;
      yearPrincipal += princPayment;
      balance -= princPayment;
    }
    yearRows += `<div class="result-row"><span class="result-label">Year ${y}</span><span class="result-value">Principal: ${fmt(yearPrincipal)} | Interest: ${fmt(yearInterest)} | Balance: ${fmt(Math.max(0, balance))}</span></div>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Monthly Payment</span><span class="result-value">${fmt(monthlyPayment)}</span></div>
    <div class="result-row"><span class="result-label">Fortnightly Payment</span><span class="result-value">${fmt(fortnightlyPayment)}</span></div>
    <div class="result-row"><span class="result-label">Weekly Payment</span><span class="result-value">${fmt(weeklyPayment)}</span></div>
    <div class="result-row"><span class="result-label">Total Repayments</span><span class="result-value">${fmt(totalPayments)}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value">${fmt(totalInterest)}</span></div>
    ${balloonPayment > 0 ? `<div class="result-row"><span class="result-label">Balloon Payment (end of term)</span><span class="result-value">${fmt(balloonPayment)}</span></div>` : ''}
    <div class="result-row"><span class="result-label">Loan Amount</span><span class="result-value">${fmt(loanAmount)}</span></div>
    <div class="result-row"><span class="result-label">Interest Rate</span><span class="result-value">${interestRate}% p.a.</span></div>
    <div class="result-row"><span class="result-label">Loan Term</span><span class="result-value">${loanTerm} year${loanTerm !== 1 ? 's' : ''} (${totalMonths} months)</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>Amortisation Summary</strong>
    </div>
    ${yearRows}
    ${loanTerm > 10 ? '<p class="text-sm text-gray-400">(Showing first 10 years)</p>' : ''}
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
