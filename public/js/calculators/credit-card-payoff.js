function calculate() {
  const startBalance = parseFloat(document.getElementById('input-balance').value) || 0;
  const annualRate = (parseFloat(document.getElementById('input-annualRate').value) || 0) / 100;
  const minPayPct = (parseFloat(document.getElementById('input-minimumPaymentPercent').value) || 2) / 100;
  const extraPayment = parseFloat(document.getElementById('input-extraMonthlyPayment').value) || 0;

  const monthlyRate = annualRate / 12;
  let balance = startBalance;
  let totalInterest = 0;
  let totalPaid = 0;
  let months = 0;
  const maxMonths = 600; // 50 year cap

  while (balance > 0.01 && months < maxMonths) {
    const interest = balance * monthlyRate;
    const minPayment = Math.max(balance * minPayPct, 25); // minimum $25
    const payment = Math.min(balance + interest, minPayment + extraPayment);
    balance = balance + interest - payment;
    totalInterest += interest;
    totalPaid += payment;
    months++;
    if (balance < 0) balance = 0;
  }

  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  const timeStr = years > 0 ? `${years} year${years !== 1 ? 's' : ''} ${remainMonths} month${remainMonths !== 1 ? 's' : ''}` : `${remainMonths} month${remainMonths !== 1 ? 's' : ''}`;

  // Compare: min payment only
  let balMinOnly = startBalance;
  let totalIntMinOnly = 0;
  let monthsMinOnly = 0;
  while (balMinOnly > 0.01 && monthsMinOnly < maxMonths) {
    const int2 = balMinOnly * monthlyRate;
    const pay2 = Math.min(balMinOnly + int2, Math.max(balMinOnly * minPayPct, 25));
    balMinOnly = balMinOnly + int2 - pay2;
    totalIntMinOnly += int2;
    monthsMinOnly++;
    if (balMinOnly < 0) balMinOnly = 0;
  }

  const interestSaved = totalIntMinOnly - totalInterest;
  const timeSaved = monthsMinOnly - months;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Starting Balance</span><span class="result-value">${fmt(startBalance)}</span></div>
    <div class="result-row"><span class="result-label">Annual Interest Rate</span><span class="result-value">${(annualRate * 100).toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Minimum Payment</span><span class="result-value">${(minPayPct * 100).toFixed(1)}% (min $25)</span></div>
    <div class="result-row"><span class="result-label">Extra Monthly Payment</span><span class="result-value">${fmt(extraPayment)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row highlight"><span class="result-label">Time to Pay Off</span><span class="result-value">${months >= maxMonths ? 'Over 50 years' : timeStr}</span></div>
    <div class="result-row"><span class="result-label">Total Interest Paid</span><span class="result-value">${fmt(totalInterest)}</span></div>
    <div class="result-row"><span class="result-label">Total Amount Paid</span><span class="result-value">${fmt(totalPaid)}</span></div>
    ${extraPayment > 0 ? `
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Savings vs Minimum Only</span><span class="result-value"></span></div>
    <div class="result-row"><span class="result-label">Interest Saved</span><span class="result-value">${fmt(interestSaved)}</span></div>
    <div class="result-row"><span class="result-label">Time Saved</span><span class="result-value">${timeSaved} months</span></div>
    ` : ''}
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
