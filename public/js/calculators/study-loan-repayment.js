function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const repaymentIncome = parseFloat(document.getElementById('input-repaymentIncome').value) || 0;
  const helpBalance = parseFloat(document.getElementById('input-helpBalance').value) || 0;

  // 2025-26 HELP repayment — new marginal system (law from 1 Jul 2025)
  // No repayment below $67,000; marginal rates apply on income above threshold
  let annualRepayment = 0;
  let currentTier = 'Below threshold';
  if (repaymentIncome <= 67000) {
    annualRepayment = 0;
    currentTier = 'Below threshold ($67,000)';
  } else if (repaymentIncome <= 125000) {
    annualRepayment = (repaymentIncome - 67000) * 0.15;
    currentTier = '15c per $1 over $67,000';
  } else if (repaymentIncome <= 179285) {
    annualRepayment = 8700 + (repaymentIncome - 125000) * 0.17;
    currentTier = '$8,700 + 17c per $1 over $125,000';
  } else {
    annualRepayment = repaymentIncome * 0.10;
    currentTier = '10% of total repayment income';
  }
  annualRepayment = Math.min(annualRepayment, helpBalance);
  const fortnightlyRepayment = annualRepayment / 26;

  // Estimate years to repay (assuming CPI indexation of ~3.5% and same income)
  let balance = helpBalance;
  let years = 0;
  const indexRate = 0.035;
  while (balance > 0 && years < 50 && annualRepayment > 0) {
    balance = balance * (1 + indexRate); // indexation
    balance -= annualRepayment;
    years++;
  }

  // Build threshold table rows (2025-26 marginal system)
  const tableData = [
    { label: '$0 – $67,000', desc: 'Nil' },
    { label: '$67,001 – $125,000', desc: '15c per $1 over $67,000' },
    { label: '$125,001 – $179,285', desc: '$8,700 + 17c per $1 over $125,000' },
    { label: '$179,286+', desc: '10% of total repayment income' },
  ];
  let tableRows = '';
  for (const row of tableData) {
    const isActive = currentTier !== 'Below threshold ($67,000)' && currentTier.includes(row.desc.substring(0, 5));
    tableRows += `<tr class="${isActive ? 'bg-blue-50 font-semibold' : ''}">
      <td class="px-2 py-1 text-sm">${row.label}</td>
      <td class="px-2 py-1 text-sm text-center">${row.desc}</td>
    </tr>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Repayment Income</span><span class="result-value">${formatCurrency(repaymentIncome)}</span></div>
    <div class="result-row"><span class="result-label">HELP Balance</span><span class="result-value">${formatCurrency(helpBalance)}</span></div>
    <div class="result-row"><span class="result-label">Repayment Rate</span><span class="result-value">${currentTier}</span></div>
    <hr class="my-2">
    <div class="result-row font-bold"><span class="result-label">Annual Repayment</span><span class="result-value">${formatCurrency(annualRepayment)}</span></div>
    <div class="result-row"><span class="result-label">Per Fortnight (withheld)</span><span class="result-value">${formatCurrency(fortnightlyRepayment)}</span></div>
    ${annualRepayment > 0 && helpBalance > 0 ? `<div class="result-row"><span class="result-label">Estimated Years to Repay</span><span class="result-value">${years < 50 ? years + ' years' : '50+ years'}</span></div>` : ''}
    ${repaymentIncome <= 67000 ? '<p class="text-sm text-green-600 mt-2">Your income is below the compulsory repayment threshold ($67,000). No repayment required this financial year.</p>' : ''}
    <hr class="my-3">
    <h4 class="font-semibold mb-2">2025-26 Repayment Thresholds (Marginal System)</h4>
    <div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="border-b"><th class="px-2 py-1 text-left">Income Range</th><th class="px-2 py-1 text-center">Repayment</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table></div>
  `;
}

function getTLDR() {
  const repaymentIncome = parseFloat(document.getElementById('input-repaymentIncome').value) || 0;
  const helpBalance = parseFloat(document.getElementById('input-helpBalance').value) || 0;
  if (repaymentIncome <= 0 || helpBalance <= 0) return '';

  let annualRepayment = 0;
  if (repaymentIncome <= 67000) annualRepayment = 0;
  else if (repaymentIncome <= 125000) annualRepayment = (repaymentIncome - 67000) * 0.15;
  else if (repaymentIncome <= 179285) annualRepayment = 8700 + (repaymentIncome - 125000) * 0.17;
  else annualRepayment = repaymentIncome * 0.10;
  annualRepayment = Math.min(annualRepayment, helpBalance);

  if (annualRepayment === 0) return 'Your income of ' + formatCurrency(repaymentIncome) + ' is below the $67,000 HELP repayment threshold — no compulsory repayment is required this year.';

  let balance = helpBalance;
  let years = 0;
  while (balance > 0 && years < 50 && annualRepayment > 0) {
    balance = balance * 1.035 - annualRepayment;
    years++;
  }

  return 'On a ' + formatCurrency(repaymentIncome) + ' income, you\'ll repay ' + formatCurrency(annualRepayment) + '/year (' + formatCurrency(annualRepayment / 26) + ' per fortnight) toward your ' + formatCurrency(helpBalance) + ' HELP debt, paying it off in roughly ' + (years < 50 ? years + ' years' : '50+ years') + '.';
}
