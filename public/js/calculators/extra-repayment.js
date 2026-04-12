function formatCurrency(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function amortise(principal, monthlyRate, payment) {
  // Returns { months, totalInterest }
  let balance = principal;
  let totalInterest = 0;
  let months = 0;
  const max = 600;
  while (balance > 0.01 && months < max) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(payment - interest, balance);
    totalInterest += interest;
    balance -= principalPaid;
    months++;
  }
  return { months, totalInterest };
}

function calculate() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const annualRate = parseFloat(document.getElementById('input-interestRate').value) || 6.5;
  const loanTerm = parseFloat(document.getElementById('input-loanTerm').value) || 30;
  const extraMonthly = parseFloat(document.getElementById('input-extraMonthly').value) || 0;

  if (loanAmount <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid loan amount.</p>';
    return;
  }

  const monthlyRate = (annualRate / 100) / 12;
  const totalMonths = loanTerm * 12;

  // Standard monthly repayment (amortisation formula)
  const baseRepayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Original scenario
  const original = amortise(loanAmount, monthlyRate, baseRepayment);
  const originalTotalPaid = loanAmount + original.totalInterest;

  // Extra repayment scenario
  const newRepayment = baseRepayment + extraMonthly;
  const extra = amortise(loanAmount, monthlyRate, newRepayment);
  const newTotalPaid = loanAmount + extra.totalInterest;

  // Savings
  const interestSaved = original.totalInterest - extra.totalInterest;
  const monthsSaved = original.months - extra.months;
  const yearsSaved = Math.floor(monthsSaved / 12);
  const mosSaved = monthsSaved % 12;

  const newYears = Math.floor(extra.months / 12);
  const newMos = extra.months % 12;
  const origYears = Math.floor(original.months / 12);
  const origMos = original.months % 12;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Interest Saved</span><span class="result-value text-green-600">${formatCurrency(interestSaved)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Time Saved</span><span class="result-value text-green-600">${yearsSaved > 0 ? yearsSaved + ' yr' + (yearsSaved !== 1 ? 's' : '') : ''}${mosSaved > 0 ? ' ' + mosSaved + ' mo' : ''}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Without Extra Repayments</h4>
    <div class="result-row"><span class="result-label">Monthly Repayment</span><span class="result-value">${formatCurrency(baseRepayment)}</span></div>
    <div class="result-row"><span class="result-label">Loan Term</span><span class="result-value">${origYears} yrs${origMos > 0 ? ' ' + origMos + ' mo' : ''}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value text-red-600">${formatCurrency(original.totalInterest)}</span></div>
    <div class="result-row"><span class="result-label">Total Paid</span><span class="result-value">${formatCurrency(originalTotalPaid)}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">With ${formatCurrency(extraMonthly)}/month Extra</h4>
    <div class="result-row"><span class="result-label">Monthly Repayment</span><span class="result-value">${formatCurrency(newRepayment)}</span></div>
    <div class="result-row"><span class="result-label">New Loan Term</span><span class="result-value">${newYears} yrs${newMos > 0 ? ' ' + newMos + ' mo' : ''}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value text-red-600">${formatCurrency(extra.totalInterest)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Total Paid</span><span class="result-value">${formatCurrency(newTotalPaid)}</span></div>
    <p class="text-sm text-gray-500 mt-3">Uses monthly compounding. Assumes the interest rate remains constant over the loan term.</p>
  `;
}
