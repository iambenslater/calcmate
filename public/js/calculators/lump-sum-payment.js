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
  const lumpSum = parseFloat(document.getElementById('input-lumpSum').value) || 0;
  const yearOfPayment = parseFloat(document.getElementById('input-yearOfPayment').value) || 5;

  if (loanAmount <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid loan amount.</p>';
    return;
  }
  if (lumpSum <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid lump sum amount.</p>';
    return;
  }
  if (yearOfPayment >= loanTerm) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Year of lump sum payment must be less than the loan term.</p>';
    return;
  }

  const monthlyRate = (annualRate / 100) / 12;
  const totalMonths = loanTerm * 12;

  // Standard monthly repayment
  const monthlyRepayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Original scenario (full amortise)
  const original = amortise(loanAmount, monthlyRate, monthlyRepayment);
  const originalTotalPaid = loanAmount + original.totalInterest;

  // With lump sum: amortise for yearOfPayment years, apply lump sum, then amortise remainder
  const monthsBeforeLump = Math.round(yearOfPayment * 12);
  let balance = loanAmount;
  let interestBeforeLump = 0;

  for (let m = 0; m < monthsBeforeLump && balance > 0.01; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(monthlyRepayment - interest, balance);
    interestBeforeLump += interest;
    balance -= principalPaid;
  }

  // Apply lump sum (don't go below zero)
  const lumpApplied = Math.min(lumpSum, balance);
  balance -= lumpApplied;

  // Amortise the remaining balance
  const remaining = balance > 0.01 ? amortise(balance, monthlyRate, monthlyRepayment) : { months: 0, totalInterest: 0 };
  const totalMonthsWithLump = monthsBeforeLump + remaining.months;
  const totalInterestWithLump = interestBeforeLump + remaining.totalInterest;
  const totalPaidWithLump = loanAmount + totalInterestWithLump;

  const interestSaved = original.totalInterest - totalInterestWithLump;
  const monthsSaved = original.months - totalMonthsWithLump;
  const yearsSaved = Math.floor(monthsSaved / 12);
  const mosSaved = monthsSaved % 12;

  const newYears = Math.floor(totalMonthsWithLump / 12);
  const newMos = totalMonthsWithLump % 12;
  const origYears = Math.floor(original.months / 12);
  const origMos = original.months % 12;

  // Payoff year estimate
  const today = new Date();
  const payoffDate = new Date(today.getFullYear(), today.getMonth() + totalMonthsWithLump, 1);
  const payoffStr = payoffDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Interest Saved</span><span class="result-value text-green-600">${formatCurrency(interestSaved)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Time Saved</span><span class="result-value text-green-600">${yearsSaved > 0 ? yearsSaved + ' yr' + (yearsSaved !== 1 ? 's' : '') : ''}${mosSaved > 0 ? ' ' + mosSaved + ' mo' : ''}</span></div>
    <div class="result-row font-bold"><span class="result-label">Estimated Payoff Date</span><span class="result-value">${payoffStr}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Without Lump Sum</h4>
    <div class="result-row"><span class="result-label">Monthly Repayment</span><span class="result-value">${formatCurrency(monthlyRepayment)}</span></div>
    <div class="result-row"><span class="result-label">Loan Term</span><span class="result-value">${origYears} yrs${origMos > 0 ? ' ' + origMos + ' mo' : ''}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value text-red-600">${formatCurrency(original.totalInterest)}</span></div>
    <div class="result-row"><span class="result-label">Total Paid</span><span class="result-value">${formatCurrency(originalTotalPaid)}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">With ${formatCurrency(lumpApplied)} Lump Sum at Year ${yearOfPayment}</h4>
    <div class="result-row"><span class="result-label">Balance Before Lump Sum</span><span class="result-value">${formatCurrency(balance + lumpApplied)}</span></div>
    <div class="result-row"><span class="result-label">Lump Sum Applied</span><span class="result-value text-green-600">-${formatCurrency(lumpApplied)}</span></div>
    <div class="result-row"><span class="result-label">Remaining Balance</span><span class="result-value">${formatCurrency(balance)}</span></div>
    <div class="result-row"><span class="result-label">New Loan Term</span><span class="result-value">${newYears} yrs${newMos > 0 ? ' ' + newMos + ' mo' : ''}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value text-red-600">${formatCurrency(totalInterestWithLump)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Total Paid (incl. lump sum)</span><span class="result-value">${formatCurrency(totalPaidWithLump)}</span></div>
    <p class="text-sm text-gray-500 mt-3">Assumes the lump sum is applied directly to reduce principal at month ${monthsBeforeLump}. Monthly repayment stays the same. Uses monthly compounding.</p>
  `;
}
