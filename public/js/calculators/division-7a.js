function calculate() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const benchmarkRate = (parseFloat(document.getElementById('input-benchmarkRate').value) || 8.27) / 100;
  const loanTerm = parseInt(document.getElementById('input-loanTerm').value) || 7;
  const yearOfLoan = parseInt(document.getElementById('input-yearOfLoan').value) || 1;

  // Division 7A minimum yearly repayment formula (annuity)
  // PMT = PV * r / (1 - (1+r)^-n)
  const r = benchmarkRate;
  const n = loanTerm;

  const minRepayment = r > 0
    ? loanAmount * r / (1 - Math.pow(1 + r, -n))
    : loanAmount / n;

  const totalRepayments = minRepayment * n;
  const totalInterest = totalRepayments - loanAmount;

  // Build amortisation summary
  let balance = loanAmount;
  let rows = '';
  for (let y = 1; y <= n; y++) {
    const interest = balance * r;
    const principal = minRepayment - interest;
    balance = Math.max(0, balance - principal);
    if (y <= 5 || y === n) {
      rows += `<div class="result-row"><span class="result-label">Year ${y}</span><span class="result-value">Repay: ${fmt(minRepayment)} (Int: ${fmt(interest)} + Prin: ${fmt(principal)}) | Bal: ${fmt(balance)}</span></div>`;
    }
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Loan Amount</span><span class="result-value">${fmt(loanAmount)}</span></div>
    <div class="result-row"><span class="result-label">Benchmark Rate</span><span class="result-value">${(benchmarkRate * 100).toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Loan Term</span><span class="result-value">${n} years (Year ${yearOfLoan} of loan)</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row highlight"><span class="result-label">Minimum Yearly Repayment</span><span class="result-value">${fmt(minRepayment)}</span></div>
    <div class="result-row"><span class="result-label">Total Repayments</span><span class="result-value">${fmt(totalRepayments)}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value">${fmt(totalInterest)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Repayment Schedule</span><span class="result-value"></span></div>
    ${rows}
    <p style="margin-top:12px;font-size:0.85rem;color:var(--text-muted)">Failure to make the minimum yearly repayment will result in the shortfall being treated as an unfranked dividend.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
