function calculate() {
  const loans = [];
  for (let i = 1; i <= 3; i++) {
    const amount = parseFloat(document.getElementById(`input-loan${i}Amount`).value) || 0;
    const rate = (parseFloat(document.getElementById(`input-loan${i}Rate`).value) || 0) / 100;
    const term = parseInt(document.getElementById(`input-loan${i}Term`).value) || 0;
    if (amount > 0 && term > 0) {
      loans.push({ num: i, amount, rate, term });
    }
  }

  if (loans.length === 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p>Please enter at least one loan to compare.</p>';
    return;
  }

  function calcLoan(amount, annualRate, termYears) {
    const n = termYears * 12;
    const r = annualRate / 12;
    const monthlyPayment = r > 0
      ? amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : amount / n;
    const totalPaid = monthlyPayment * n;
    const totalInterest = totalPaid - amount;
    return { monthlyPayment, totalPaid, totalInterest };
  }

  let rows = '';
  let lowestTotal = Infinity;
  let bestLoan = 0;

  loans.forEach(l => {
    const c = calcLoan(l.amount, l.rate, l.term);
    if (c.totalPaid < lowestTotal) {
      lowestTotal = c.totalPaid;
      bestLoan = l.num;
    }
    rows += `
    <div class="result-row" style="font-weight:600;margin-top:12px"><span class="result-label">Loan ${l.num}</span><span class="result-value"></span></div>
    <div class="result-row"><span class="result-label">Amount</span><span class="result-value">${fmt(l.amount)}</span></div>
    <div class="result-row"><span class="result-label">Rate</span><span class="result-value">${(l.rate * 100).toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Term</span><span class="result-value">${l.term} years</span></div>
    <div class="result-row"><span class="result-label">Monthly Repayment</span><span class="result-value">${fmt(c.monthlyPayment)}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value">${fmt(c.totalInterest)}</span></div>
    <div class="result-row"><span class="result-label">Total Repaid</span><span class="result-value">${fmt(c.totalPaid)}</span></div>
    `;
  });

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    ${rows}
    ${loans.length > 1 ? `<hr style="border-color:var(--border);margin:12px 0"><div class="result-row highlight"><span class="result-label">Lowest Total Cost</span><span class="result-value">Loan ${bestLoan} (${fmt(lowestTotal)})</span></div>` : ''}
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
