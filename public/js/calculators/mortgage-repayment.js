function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('input-interestRate').value) || 0;
  const loanTerm = parseFloat(document.getElementById('input-loanTerm').value) || 30;
  const repaymentFrequency = document.getElementById('input-repaymentFrequency').value || 'monthly';

  if (loanAmount <= 0 || interestRate <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a loan amount and interest rate greater than zero.</p>';
    return;
  }

  // Standard amortisation: M = P[r(1+r)^n] / [(1+r)^n - 1]
  const periodsPerYear = { monthly: 12, fortnightly: 26, weekly: 52 };
  const periods = periodsPerYear[repaymentFrequency] || 12;
  const totalPeriods = loanTerm * periods;
  const periodRate = interestRate / 100 / periods;

  let repayment;
  if (periodRate === 0) {
    repayment = loanAmount / totalPeriods;
  } else {
    repayment = loanAmount * (periodRate * Math.pow(1 + periodRate, totalPeriods)) / (Math.pow(1 + periodRate, totalPeriods) - 1);
  }

  const totalRepaid = repayment * totalPeriods;
  const totalInterest = totalRepaid - loanAmount;

  // Build first 5 years of amortisation schedule
  let scheduleRows = '';
  let balance = loanAmount;
  let yearInterest = 0;
  let yearPrincipal = 0;

  for (let period = 1; period <= Math.min(totalPeriods, periods * 5); period++) {
    const interestPayment = balance * periodRate;
    const principalPayment = repayment - interestPayment;
    balance -= principalPayment;
    yearInterest += interestPayment;
    yearPrincipal += principalPayment;

    if (period % periods === 0) {
      const year = period / periods;
      scheduleRows += `<tr>
        <td class="px-2 py-1">Year ${year}</td>
        <td class="px-2 py-1 text-right">${formatCurrency(yearPrincipal)}</td>
        <td class="px-2 py-1 text-right">${formatCurrency(yearInterest)}</td>
        <td class="px-2 py-1 text-right">${formatCurrency(Math.max(0, balance))}</td>
      </tr>`;
      yearInterest = 0;
      yearPrincipal = 0;
    }
  }

  const frequencyLabel = { monthly: 'Monthly', fortnightly: 'Fortnightly', weekly: 'Weekly' };

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Loan Amount</span><span class="result-value">${formatCurrency(loanAmount)}</span></div>
    <div class="result-row"><span class="result-label">Interest Rate</span><span class="result-value">${interestRate}% p.a.</span></div>
    <div class="result-row"><span class="result-label">Loan Term</span><span class="result-value">${loanTerm} years</span></div>
    <hr class="my-2">
    <div class="result-row font-bold text-lg"><span class="result-label">${frequencyLabel[repaymentFrequency]} Repayment</span><span class="result-value">${formatCurrency(repayment)}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Total Repaid</span><span class="result-value">${formatCurrency(totalRepaid)}</span></div>
    <div class="result-row"><span class="result-label">Total Interest</span><span class="result-value text-red-600">${formatCurrency(totalInterest)}</span></div>
    <div class="result-row"><span class="result-label">Interest as % of Loan</span><span class="result-value">${(totalInterest / loanAmount * 100).toFixed(1)}%</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-2">Comparison: All Frequencies</h4>
    <table class="w-full text-sm mb-4">
      <thead><tr class="border-b"><th class="px-2 py-1 text-left">Frequency</th><th class="px-2 py-1 text-right">Repayment</th><th class="px-2 py-1 text-right">Total Interest</th></tr></thead>
      <tbody>
        ${['monthly', 'fortnightly', 'weekly'].map(freq => {
          const p = periodsPerYear[freq];
          const tp = loanTerm * p;
          const pr = interestRate / 100 / p;
          const r = pr === 0 ? loanAmount / tp : loanAmount * (pr * Math.pow(1 + pr, tp)) / (Math.pow(1 + pr, tp) - 1);
          const ti = r * tp - loanAmount;
          return `<tr class="${freq === repaymentFrequency ? 'bg-blue-50 font-semibold' : ''}">
            <td class="px-2 py-1">${frequencyLabel[freq]}</td>
            <td class="px-2 py-1 text-right">${formatCurrency(r)}</td>
            <td class="px-2 py-1 text-right">${formatCurrency(ti)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <h4 class="font-semibold mb-2">Amortisation (First 5 Years)</h4>
    <div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="border-b"><th class="px-2 py-1 text-left">Year</th><th class="px-2 py-1 text-right">Principal</th><th class="px-2 py-1 text-right">Interest</th><th class="px-2 py-1 text-right">Balance</th></tr></thead>
      <tbody>${scheduleRows}</tbody>
    </table></div>
  `;
}

function getTLDR() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('input-interestRate').value) || 0;
  const loanTerm = parseFloat(document.getElementById('input-loanTerm').value) || 30;
  const repaymentFrequency = document.getElementById('input-repaymentFrequency').value || 'monthly';
  if (loanAmount <= 0 || interestRate <= 0) return '';
  const periodsPerYear = { monthly: 12, fortnightly: 26, weekly: 52 };
  const periods = periodsPerYear[repaymentFrequency] || 12;
  const totalPeriods = loanTerm * periods;
  const periodRate = interestRate / 100 / periods;
  const repayment = loanAmount * (periodRate * Math.pow(1 + periodRate, totalPeriods)) / (Math.pow(1 + periodRate, totalPeriods) - 1);
  const totalInterest = repayment * totalPeriods - loanAmount;
  const freqLabel = { monthly: 'month', fortnightly: 'fortnight', weekly: 'week' };
  return 'A ' + formatCurrency(loanAmount) + ' loan at ' + interestRate + '% over ' + loanTerm + ' years costs ' + formatCurrency(repayment) + ' per ' + (freqLabel[repaymentFrequency] || 'month') + ', with ' + formatCurrency(totalInterest) + ' in total interest over the life of the loan.';
}
