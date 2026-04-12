function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;

  if (propertyValue <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a property value greater than zero.</p>';
    return;
  }

  const lvr = (loanAmount / propertyValue) * 100;
  const deposit = propertyValue - loanAmount;
  const depositPercent = (deposit / propertyValue) * 100;

  // LVR zone classification
  let zone = '';
  let zoneColor = '';
  let zoneNote = '';

  if (lvr <= 60) {
    zone = 'Excellent';
    zoneColor = 'text-green-600';
    zoneNote = 'Very low risk. Best interest rates typically available. No LMI required.';
  } else if (lvr <= 70) {
    zone = 'Very Good';
    zoneColor = 'text-green-600';
    zoneNote = 'Low risk. Competitive interest rates. No LMI required.';
  } else if (lvr <= 80) {
    zone = 'Good';
    zoneColor = 'text-green-600';
    zoneNote = 'Standard lending zone. No LMI required. Most lenders offer standard rates.';
  } else if (lvr <= 85) {
    zone = 'Acceptable — LMI Zone';
    zoneColor = 'text-amber-600';
    zoneNote = 'LMI required. Some rate loading may apply. LMI cost is relatively modest.';
  } else if (lvr <= 90) {
    zone = 'High LVR — LMI Required';
    zoneColor = 'text-amber-600';
    zoneNote = 'LMI required. Moderate LMI premium. Stricter lending criteria.';
  } else if (lvr <= 95) {
    zone = 'Very High LVR — Significant LMI';
    zoneColor = 'text-red-600';
    zoneNote = 'Substantial LMI premium. Limited lender options. May need genuine savings history.';
  } else {
    zone = 'Above 95% — Limited Options';
    zoneColor = 'text-red-600';
    zoneNote = 'Very few lenders will approve. Consider Family Guarantee or saving a larger deposit.';
  }

  // Calculate deposit needed for common LVR targets
  const targets = [80, 85, 90, 95];
  let targetRows = '';
  for (const t of targets) {
    const targetLoan = propertyValue * (t / 100);
    const targetDeposit = propertyValue - targetLoan;
    const diff = targetDeposit - deposit;
    targetRows += `<tr class="${t * 1 === 80 ? 'bg-green-50' : ''}">
      <td class="px-2 py-1">${t}%</td>
      <td class="px-2 py-1 text-right">${formatCurrency(targetLoan)}</td>
      <td class="px-2 py-1 text-right">${formatCurrency(targetDeposit)}</td>
      <td class="px-2 py-1 text-right ${diff > 0 ? 'text-red-600' : 'text-green-600'}">${diff > 0 ? '+' : ''}${formatCurrency(diff)}</td>
    </tr>`;
  }

  // Visual bar
  const barWidth = Math.min(lvr, 100);
  const barColor = lvr <= 80 ? '#10B981' : lvr <= 90 ? '#F59E0B' : '#EF4444';

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Loan-to-Value Ratio (LVR)</span><span class="result-value ${zoneColor}">${lvr.toFixed(1)}%</span></div>
    <div class="mb-3">
      <div class="w-full bg-gray-200 rounded-full h-6 relative">
        <div class="h-6 rounded-full transition-all" style="width: ${barWidth}%; background-color: ${barColor};"></div>
        <div class="absolute top-0 left-[80%] h-6 w-0.5 bg-gray-800" title="80% LMI threshold"></div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>0%</span>
        <span>80% (LMI threshold)</span>
        <span>100%</span>
      </div>
    </div>
    <div class="result-row"><span class="result-label">Zone</span><span class="result-value ${zoneColor}">${zone}</span></div>
    <p class="text-sm text-gray-600 mb-3">${zoneNote}</p>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Property Value</span><span class="result-value">${formatCurrency(propertyValue)}</span></div>
    <div class="result-row"><span class="result-label">Loan Amount</span><span class="result-value">${formatCurrency(loanAmount)}</span></div>
    <div class="result-row"><span class="result-label">Deposit</span><span class="result-value">${formatCurrency(deposit)} (${depositPercent.toFixed(1)}%)</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-2">Deposit Comparison</h4>
    <div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="border-b"><th class="px-2 py-1 text-left">LVR</th><th class="px-2 py-1 text-right">Loan</th><th class="px-2 py-1 text-right">Deposit Needed</th><th class="px-2 py-1 text-right">vs. Yours</th></tr></thead>
      <tbody>${targetRows}</tbody>
    </table></div>
  `;
}

function getTLDR() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  if (propertyValue <= 0) return '';
  const lvr = (loanAmount / propertyValue) * 100;
  const deposit = propertyValue - loanAmount;
  const lmiRequired = lvr > 80;
  const zone = lvr <= 60 ? 'Excellent' : lvr <= 70 ? 'Very Good' : lvr <= 80 ? 'Good' : lvr <= 90 ? 'High LVR' : 'Very High LVR';
  return 'Your LVR is ' + lvr.toFixed(1) + '% (' + zone + ') with a deposit of ' + formatCurrency(deposit) + ' on a ' + formatCurrency(propertyValue) + ' property' + (lmiRequired ? ' — LMI is required at this LVR.' : ' — no LMI required.');
}
