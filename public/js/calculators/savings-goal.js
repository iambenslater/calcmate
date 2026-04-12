function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const targetAmount = parseFloat(document.getElementById('input-target').value) || 0;
  const currentSavings = parseFloat(document.getElementById('input-currentSavings').value) || 0;
  const monthlyContribution = parseFloat(document.getElementById('input-monthlyContribution').value) || 0;
  const annualRate = parseFloat(document.getElementById('input-annualRate').value) || 0;

  if (targetAmount <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a target amount greater than zero.</p>';
    return;
  }

  const monthlyRate = annualRate / 100 / 12;
  let balance = currentSavings;
  let months = 0;
  const maxMonths = 600; // 50 year cap
  let totalContributions = currentSavings;
  let totalInterest = 0;

  // Build year-by-year table
  let yearRows = '';
  let yearBalance = currentSavings;

  while (balance < targetAmount && months < maxMonths) {
    const interest = balance * monthlyRate;
    balance += interest + monthlyContribution;
    totalInterest += interest;
    totalContributions += monthlyContribution;
    months++;

    // Snapshot at each 12-month mark
    if (months % 12 === 0) {
      yearRows += `<tr>
        <td class="px-2 py-1">Year ${months / 12}</td>
        <td class="px-2 py-1 text-right">${formatCurrency(balance)}</td>
        <td class="px-2 py-1 text-right">${formatCurrency(totalContributions)}</td>
        <td class="px-2 py-1 text-right">${formatCurrency(totalInterest)}</td>
      </tr>`;
    }
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const reached = balance >= targetAmount;

  // If no contributions, calculate required monthly
  const gap = targetAmount - currentSavings;
  let requiredMonthly = 0;
  if (gap > 0 && monthlyRate > 0) {
    // FV = PMT * [((1+r)^n - 1) / r] + PV*(1+r)^n
    // Solve for n=120 months (10 years)
    const n = 120;
    const fvPV = currentSavings * Math.pow(1 + monthlyRate, n);
    const remaining = targetAmount - fvPV;
    if (remaining > 0) {
      requiredMonthly = remaining / ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);
    }
  } else if (gap > 0) {
    requiredMonthly = gap / 120; // 10 years, no interest
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Savings Goal</span><span class="result-value">${formatCurrency(targetAmount)}</span></div>
    <div class="result-row"><span class="result-label">Starting Balance</span><span class="result-value">${formatCurrency(currentSavings)}</span></div>
    <div class="result-row"><span class="result-label">Monthly Contribution</span><span class="result-value">${formatCurrency(monthlyContribution)}</span></div>
    <div class="result-row"><span class="result-label">Annual Interest Rate</span><span class="result-value">${annualRate}%</span></div>
    <hr class="my-2">
    ${reached ? `
      <div class="result-row font-bold"><span class="result-label">Time to Reach Goal</span><span class="result-value">${years > 0 ? years + ' year' + (years !== 1 ? 's' : '') : ''} ${remainingMonths > 0 ? remainingMonths + ' month' + (remainingMonths !== 1 ? 's' : '') : ''}</span></div>
      <div class="result-row"><span class="result-label">Total Contributions</span><span class="result-value">${formatCurrency(totalContributions)}</span></div>
      <div class="result-row"><span class="result-label">Total Interest Earned</span><span class="result-value text-green-600">${formatCurrency(totalInterest)}</span></div>
      <div class="result-row"><span class="result-label">Final Balance</span><span class="result-value">${formatCurrency(balance)}</span></div>
    ` : `
      <p class="text-amber-600 font-semibold">At this rate, the goal won't be reached within 50 years.</p>
      <div class="result-row"><span class="result-label">Balance after 50 years</span><span class="result-value">${formatCurrency(balance)}</span></div>
      <div class="result-row"><span class="result-label">Shortfall</span><span class="result-value text-red-600">${formatCurrency(targetAmount - balance)}</span></div>
    `}
    ${requiredMonthly > 0 ? `
      <hr class="my-2">
      <div class="result-row"><span class="result-label">Monthly needed to reach goal in 10 years</span><span class="result-value">${formatCurrency(requiredMonthly)}</span></div>
    ` : ''}
    ${yearRows ? `
      <hr class="my-3">
      <h4 class="font-semibold mb-2">Year-by-Year Projection</h4>
      <div class="overflow-x-auto"><table class="w-full text-sm">
        <thead><tr class="border-b"><th class="px-2 py-1 text-left">Period</th><th class="px-2 py-1 text-right">Balance</th><th class="px-2 py-1 text-right">Contributed</th><th class="px-2 py-1 text-right">Interest</th></tr></thead>
        <tbody>${yearRows}</tbody>
      </table></div>
    ` : ''}
  `;
}

function getTLDR() {
  const targetAmount = parseFloat(document.getElementById('input-target').value) || 0;
  const currentSavings = parseFloat(document.getElementById('input-currentSavings').value) || 0;
  const monthlyContribution = parseFloat(document.getElementById('input-monthlyContribution').value) || 0;
  const annualRate = parseFloat(document.getElementById('input-annualRate').value) || 0;

  if (targetAmount <= 0 || monthlyContribution <= 0) return '';

  const monthlyRate = annualRate / 100 / 12;
  let balance = currentSavings;
  let months = 0;
  const maxMonths = 600;

  while (balance < targetAmount && months < maxMonths) {
    const interest = balance * monthlyRate;
    balance += interest + monthlyContribution;
    months++;
  }

  if (balance >= targetAmount) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const timeStr = (years > 0 ? years + ' year' + (years !== 1 ? 's' : '') + ' ' : '') + (remainingMonths > 0 ? remainingMonths + ' month' + (remainingMonths !== 1 ? 's' : '') : '');
    return 'Saving ' + formatCurrency(monthlyContribution) + '/month at ' + annualRate + '% interest, you\'ll reach your ' + formatCurrency(targetAmount) + ' goal in ' + timeStr.trim() + '.';
  } else {
    return 'At ' + formatCurrency(monthlyContribution) + '/month, you won\'t reach your ' + formatCurrency(targetAmount) + ' goal within 50 years — consider increasing your monthly contribution or interest rate.';
  }
}
