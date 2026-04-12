function formatCurrency(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function calculate() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const annualRate = parseFloat(document.getElementById('input-interestRate').value) || 6.5;
  const loanTerm = parseFloat(document.getElementById('input-loanTerm').value) || 30;

  if (loanAmount <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid loan amount.</p>';
    return;
  }

  const monthlyRate = (annualRate / 100) / 12;
  const totalMonths = loanTerm * 12;

  // Standard monthly repayment (amortisation formula)
  const monthlyRepayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Monthly scenario: amortise normally
  let balance = loanAmount;
  let totalInterestMonthly = 0;
  let monthsMonthly = 0;
  while (balance > 0.01 && monthsMonthly < 600) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(monthlyRepayment - interest, balance);
    totalInterestMonthly += interest;
    balance -= principalPaid;
    monthsMonthly++;
  }
  const totalPaidMonthly = loanAmount + totalInterestMonthly;

  // Fortnightly payment = monthly / 2
  // 26 fortnights per year = 13 monthly payments worth of money per year
  const fortnightlyPayment = monthlyRepayment / 2;

  // Fortnightly rate: (1 + annual_rate)^(1/26) - 1
  const fortnightlyRate = Math.pow(1 + annualRate / 100, 1 / 26) - 1;

  // Amortise fortnightly
  let balFn = loanAmount;
  let totalInterestFn = 0;
  let fortnights = 0;
  while (balFn > 0.01 && fortnights < 1400) {
    const interest = balFn * fortnightlyRate;
    const principalPaid = Math.min(fortnightlyPayment - interest, balFn);
    totalInterestFn += interest;
    balFn -= principalPaid;
    fortnights++;
  }

  const totalPaidFn = loanAmount + totalInterestFn;
  const weeksTotal = fortnights * 2;
  const yearsFn = Math.floor(weeksTotal / 52);
  const remainingWeeks = weeksTotal % 52;
  const mosFn = Math.round(remainingWeeks / 4.33);

  const origYears = Math.floor(monthsMonthly / 12);
  const origMos = monthsMonthly % 12;

  const interestSaved = totalInterestMonthly - totalInterestFn;
  const timeSavedMonths = monthsMonthly - Math.round(fortnights / 2.17); // approximate
  // More accurate time saved
  const fnYears = fortnights / 26;
  const timeSavedYears = loanTerm - fnYears;
  const tsy = Math.floor(timeSavedYears);
  const tsm = Math.round((timeSavedYears - tsy) * 12);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Interest Saved</span><span class="result-value text-green-600">${formatCurrency(interestSaved)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Time Saved</span><span class="result-value text-green-600">${tsy > 0 ? tsy + ' yr' + (tsy !== 1 ? 's' : '') : ''}${tsm > 0 ? ' ' + tsm + ' mo' : ''}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Monthly Repayments</h4>
    <div class="result-row"><span class="result-label">Monthly Payment</span><span class="result-value">${formatCurrency(monthlyRepayment)}</span></div>
    <div class="result-row"><span class="result-label">Loan Term</span><span class="result-value">${origYears} yrs${origMos > 0 ? ' ' + origMos + ' mo' : ''}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value text-red-600">${formatCurrency(totalInterestMonthly)}</span></div>
    <div class="result-row"><span class="result-label">Total Paid</span><span class="result-value">${formatCurrency(totalPaidMonthly)}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Fortnightly Repayments</h4>
    <div class="result-row"><span class="result-label">Fortnightly Payment (monthly ÷ 2)</span><span class="result-value">${formatCurrency(fortnightlyPayment)}</span></div>
    <div class="result-row"><span class="result-label">New Loan Term</span><span class="result-value">${yearsFn} yrs${mosFn > 0 ? ' ' + mosFn + ' mo' : ''}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value text-red-600">${formatCurrency(totalInterestFn)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Total Paid</span><span class="result-value">${formatCurrency(totalPaidFn)}</span></div>
    <hr class="my-2">
    <p class="text-sm text-gray-500">How it works: by paying half your monthly repayment every fortnight, you make 26 half-payments per year — equivalent to 13 full monthly payments. That extra month's payment each year chips away at principal faster, saving you years of interest.</p>
  `;
}
