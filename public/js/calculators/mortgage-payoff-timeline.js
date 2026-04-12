function formatCurrency(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function calculate() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const annualRate = parseFloat(document.getElementById('input-interestRate').value) || 6.5;
  const monthlyRepayment = parseFloat(document.getElementById('input-monthlyRepayment').value) || 0;

  if (loanAmount <= 0 || monthlyRepayment <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid loan amount and monthly repayment.</p>';
    return;
  }

  const monthlyRate = (annualRate / 100) / 12;

  // Check if repayment covers interest
  const firstMonthInterest = loanAmount * monthlyRate;
  if (monthlyRepayment <= firstMonthInterest) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = `
      <div class="p-3 bg-red-50 border border-red-200 rounded">
        <p class="text-red-700 font-semibold">Repayment too low — loan will never be paid off.</p>
        <p class="text-red-600 mt-1">Your monthly repayment of ${formatCurrency(monthlyRepayment)} doesn't cover the first month's interest of ${formatCurrency(firstMonthInterest)}. Increase your repayment to at least ${formatCurrency(Math.ceil(firstMonthInterest + 1))} to start reducing the balance.</p>
      </div>
    `;
    return;
  }

  // Amortise month by month
  let balance = loanAmount;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600; // 50 year cap

  while (balance > 0 && months < maxMonths) {
    const interestCharge = balance * monthlyRate;
    const principal = Math.min(monthlyRepayment - interestCharge, balance);
    totalInterest += interestCharge;
    balance -= principal;
    months++;
    if (balance < 0.01) break;
  }

  const totalPaid = loanAmount + totalInterest;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  // Build a milestone amortisation summary (every 5 years or at payoff)
  let milestones = '';
  let bal = loanAmount;
  let cumInterest = 0;
  let cumPrincipal = 0;
  const checkpoints = [12, 60, 120, 180, 240, 300, 360];
  let lastCheckpoint = 0;

  for (let m = 1; m <= months; m++) {
    const interest = bal * monthlyRate;
    const principal = Math.min(monthlyRepayment - interest, bal);
    cumInterest += interest;
    cumPrincipal += principal;
    bal -= principal;

    if (checkpoints.includes(m) && m <= months) {
      const yr = m / 12;
      milestones += `<div class="result-row"><span class="result-label">After ${yr} year${yr > 1 ? 's' : ''}</span><span class="result-value">Balance: ${formatCurrency(Math.max(0, bal))} | Interest paid: ${formatCurrency(cumInterest)}</span></div>`;
      lastCheckpoint = m;
    }
    if (bal < 0.01) break;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Loan Paid Off In</span><span class="result-value">${years > 0 ? years + ' yr' + (years !== 1 ? 's' : '') : ''}${remainingMonths > 0 ? ' ' + remainingMonths + ' mo' : ''} (${months} months)</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Summary</h4>
    <div class="result-row"><span class="result-label">Loan Amount</span><span class="result-value">${formatCurrency(loanAmount)}</span></div>
    <div class="result-row"><span class="result-label">Monthly Repayment</span><span class="result-value">${formatCurrency(monthlyRepayment)}</span></div>
    <div class="result-row"><span class="result-label">Interest Rate</span><span class="result-value">${annualRate}% p.a.</span></div>
    <div class="result-row"><span class="result-label">Total Interest Paid</span><span class="result-value text-red-600">${formatCurrency(totalInterest)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Total Amount Paid</span><span class="result-value">${formatCurrency(totalPaid)}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Balance Milestones</h4>
    ${milestones}
    <p class="text-sm text-gray-500 mt-3">Calculation uses monthly compounding. Does not account for rate changes over the loan term.</p>
  `;
}

function getTLDR() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const annualRate = parseFloat(document.getElementById('input-interestRate').value) || 6.5;
  const monthlyRepayment = parseFloat(document.getElementById('input-monthlyRepayment').value) || 0;
  if (loanAmount <= 0 || monthlyRepayment <= 0) return '';
  const monthlyRate = (annualRate / 100) / 12;
  const firstMonthInterest = loanAmount * monthlyRate;
  if (monthlyRepayment <= firstMonthInterest) return 'Your repayment of ' + formatCurrency(monthlyRepayment) + ' doesn\'t cover the first month\'s interest of ' + formatCurrency(firstMonthInterest) + ' — the loan will never be paid off at this rate.';
  let balance = loanAmount, totalInterest = 0, months = 0;
  while (balance > 0 && months < 600) {
    const interest = balance * monthlyRate;
    const principal = Math.min(monthlyRepayment - interest, balance);
    totalInterest += interest; balance -= principal; months++;
    if (balance < 0.01) break;
  }
  const years = Math.floor(months / 12), remainingMonths = months % 12;
  return 'At ' + formatCurrency(monthlyRepayment) + '/month, your ' + formatCurrency(loanAmount) + ' loan will be paid off in ' + (years > 0 ? years + ' year' + (years !== 1 ? 's' : '') : '') + (remainingMonths > 0 ? ' ' + remainingMonths + ' month' + (remainingMonths !== 1 ? 's' : '') : '') + ', with ' + formatCurrency(totalInterest) + ' in total interest paid.';
}
