function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const repaymentIncome = parseFloat(document.getElementById('input-repaymentIncome').value) || 0;
  const helpBalance = parseFloat(document.getElementById('input-helpBalance').value) || 0;

  // 2025-26 HELP/HECS repayment thresholds
  const thresholds = [
    { min: 0, max: 54435, rate: 0 },
    { min: 54436, max: 62850, rate: 0.01 },
    { min: 62851, max: 66620, rate: 0.02 },
    { min: 66621, max: 70618, rate: 0.025 },
    { min: 70619, max: 74855, rate: 0.03 },
    { min: 74856, max: 79346, rate: 0.035 },
    { min: 79347, max: 84107, rate: 0.04 },
    { min: 84108, max: 89154, rate: 0.045 },
    { min: 89155, max: 94503, rate: 0.05 },
    { min: 94504, max: 100174, rate: 0.055 },
    { min: 100175, max: 106185, rate: 0.06 },
    { min: 106186, max: 112556, rate: 0.065 },
    { min: 112557, max: 119309, rate: 0.07 },
    { min: 119310, max: 126467, rate: 0.075 },
    { min: 126468, max: 134056, rate: 0.08 },
    { min: 134057, max: 142100, rate: 0.085 },
    { min: 142101, max: 150626, rate: 0.09 },
    { min: 150627, max: 159663, rate: 0.095 },
    { min: 159664, max: Infinity, rate: 0.10 }
  ];

  let currentRate = 0;
  let currentTier = 'Below threshold';
  for (const t of thresholds) {
    if (repaymentIncome >= t.min && repaymentIncome <= (t.max === Infinity ? repaymentIncome + 1 : t.max)) {
      currentRate = t.rate;
      currentTier = t.rate === 0 ? 'Below threshold' : `${(t.rate * 100).toFixed(1)}%`;
      break;
    }
  }

  const annualRepayment = Math.min(repaymentIncome * currentRate, helpBalance);
  const fortnightlyRepayment = annualRepayment / 26;

  // Estimate years to repay (assuming CPI indexation of ~3.5% and same income)
  let balance = helpBalance;
  let years = 0;
  const indexRate = 0.035;
  while (balance > 0 && years < 50 && currentRate > 0) {
    balance = balance * (1 + indexRate); // indexation
    balance -= annualRepayment;
    years++;
  }

  // Build threshold table rows
  let tableRows = '';
  for (const t of thresholds) {
    const isActive = repaymentIncome >= t.min && repaymentIncome <= (t.max === Infinity ? repaymentIncome + 1 : t.max);
    tableRows += `<tr class="${isActive ? 'bg-blue-50 font-semibold' : ''}">
      <td class="px-2 py-1 text-sm">${formatCurrency(t.min)}${t.max === Infinity ? '+' : ' – ' + formatCurrency(t.max)}</td>
      <td class="px-2 py-1 text-sm text-center">${(t.rate * 100).toFixed(1)}%</td>
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
    ${currentRate > 0 && helpBalance > 0 ? `<div class="result-row"><span class="result-label">Estimated Years to Repay</span><span class="result-value">${years < 50 ? years + ' years' : '50+ years'}</span></div>` : ''}
    ${currentRate === 0 ? '<p class="text-sm text-green-600 mt-2">Your income is below the compulsory repayment threshold. No repayment required this financial year.</p>' : ''}
    <hr class="my-3">
    <h4 class="font-semibold mb-2">2025-26 Repayment Thresholds</h4>
    <div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="border-b"><th class="px-2 py-1 text-left">Income Range</th><th class="px-2 py-1 text-center">Rate</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table></div>
  `;
}
