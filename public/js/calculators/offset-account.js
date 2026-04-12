function calculate() {
  const loanBalance = parseFloat(document.getElementById('input-loanBalance').value) || 0;
  const rate = (parseFloat(document.getElementById('input-interestRate').value) || 0) / 100;
  const loanTerm = parseInt(document.getElementById('input-loanTerm').value) || 30;
  const offset = parseFloat(document.getElementById('input-offsetBalance').value) || 0;

  const monthlyRate = rate / 12;
  const totalMonths = loanTerm * 12;

  // Monthly repayment (stays the same regardless of offset)
  const monthlyPayment = monthlyRate > 0
    ? loanBalance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    : loanBalance / totalMonths;

  // Without offset
  const totalNoOffset = monthlyPayment * totalMonths;
  const interestNoOffset = totalNoOffset - loanBalance;

  // With offset — simulate month by month
  let balWithOffset = loanBalance;
  let totalInterestOffset = 0;
  let monthsWithOffset = 0;

  while (balWithOffset > 0.01 && monthsWithOffset < totalMonths * 2) {
    const effectiveBalance = Math.max(0, balWithOffset - offset);
    const interest = effectiveBalance * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    if (principalPaid <= 0) break; // payment doesn't cover interest
    balWithOffset -= principalPaid;
    totalInterestOffset += interest;
    monthsWithOffset++;
    if (balWithOffset < 0) balWithOffset = 0;
  }

  const interestSaved = interestNoOffset - totalInterestOffset;
  const timeSavedMonths = totalMonths - monthsWithOffset;
  const timeSavedYears = Math.floor(timeSavedMonths / 12);
  const timeSavedRemMonths = timeSavedMonths % 12;

  const annualInterestSaved = offset * rate;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Loan Balance</span><span class="result-value">${fmt(loanBalance)}</span></div>
    <div class="result-row"><span class="result-label">Interest Rate</span><span class="result-value">${(rate * 100).toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Loan Term</span><span class="result-value">${loanTerm} years</span></div>
    <div class="result-row"><span class="result-label">Offset Balance</span><span class="result-value">${fmt(offset)}</span></div>
    <div class="result-row"><span class="result-label">Monthly Repayment</span><span class="result-value">${fmt(monthlyPayment)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Interest Without Offset</span><span class="result-value">${fmt(interestNoOffset)}</span></div>
    <div class="result-row"><span class="result-label">Interest With Offset</span><span class="result-value">${fmt(totalInterestOffset)}</span></div>
    <div class="result-row highlight"><span class="result-label">Total Interest Saved</span><span class="result-value">${fmt(interestSaved)}</span></div>
    <div class="result-row"><span class="result-label">Annual Interest Saved</span><span class="result-value">${fmt(annualInterestSaved)}/yr</span></div>
    <div class="result-row highlight"><span class="result-label">Time Saved</span><span class="result-value">${timeSavedYears > 0 ? timeSavedYears + ' years ' : ''}${timeSavedRemMonths} months</span></div>
    <div class="result-row"><span class="result-label">Loan Paid Off In</span><span class="result-value">${Math.floor(monthsWithOffset / 12)} years ${monthsWithOffset % 12} months</span></div>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getTLDR() {
  const loanBalance = parseFloat(document.getElementById('input-loanBalance').value) || 0;
  const rate = (parseFloat(document.getElementById('input-interestRate').value) || 0) / 100;
  const loanTerm = parseInt(document.getElementById('input-loanTerm').value) || 30;
  const offset = parseFloat(document.getElementById('input-offsetBalance').value) || 0;
  if (loanBalance <= 0 || rate <= 0) return '';
  const monthlyRate = rate / 12;
  const totalMonths = loanTerm * 12;
  const monthlyPayment = loanBalance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const interestNoOffset = monthlyPayment * totalMonths - loanBalance;
  let balWithOffset = loanBalance, totalInterestOffset = 0, monthsWithOffset = 0;
  while (balWithOffset > 0.01 && monthsWithOffset < totalMonths * 2) {
    const effectiveBalance = Math.max(0, balWithOffset - offset);
    const interest = effectiveBalance * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    if (principalPaid <= 0) break;
    balWithOffset -= principalPaid; totalInterestOffset += interest; monthsWithOffset++;
    if (balWithOffset < 0) balWithOffset = 0;
  }
  const interestSaved = interestNoOffset - totalInterestOffset;
  const timeSavedMonths = totalMonths - monthsWithOffset;
  const timeSavedYears = Math.floor(timeSavedMonths / 12), timeSavedRemMonths = timeSavedMonths % 12;
  const timeSavedStr = (timeSavedYears > 0 ? timeSavedYears + ' year' + (timeSavedYears !== 1 ? 's' : '') + ' ' : '') + (timeSavedRemMonths > 0 ? timeSavedRemMonths + ' month' + (timeSavedRemMonths !== 1 ? 's' : '') : '');
  return 'Keeping ' + fmt(offset) + ' in your offset account saves ' + fmt(interestSaved) + ' in interest and cuts ' + timeSavedStr.trim() + ' off your loan term.';
}
