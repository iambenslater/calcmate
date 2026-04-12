function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const hoursPerWeek = parseFloat(document.getElementById('input-hoursPerWeek').value) || 0;
  const weeksWorked = parseFloat(document.getElementById('input-weeksPerYear').value) || 0;

  // Determine method — check which radio is selected
  const methodInputs = document.querySelectorAll('input[name="input-method"]');
  let method = 'fixed';
  for (const input of methodInputs) {
    if (input.checked) {
      method = input.value;
      break;
    }
  }
  // Fallback: try getElementById for single element
  if (methodInputs.length === 0) {
    const el = document.getElementById('input-method');
    if (el) method = el.value || 'fixed';
  }

  const totalHours = hoursPerWeek * weeksWorked;

  // Fixed rate method: 67 cents per hour (2025-26)
  const fixedRate = 0.67;
  const fixedDeduction = totalHours * fixedRate;

  // Actual cost method: user tracks real expenses (we show estimate ranges)
  const estimatedElectricity = totalHours * 0.35; // rough estimate
  const estimatedInternet = totalHours * 0.15;
  const estimatedPhoneUsage = totalHours * 0.10;
  const estimatedDepreciation = weeksWorked * 5; // rough weekly depreciation on equipment
  const actualEstimate = estimatedElectricity + estimatedInternet + estimatedPhoneUsage + estimatedDepreciation;

  const deduction = method === 'fixed' ? fixedDeduction : actualEstimate;

  // Tax saving estimate (assuming 30% marginal rate as typical)
  const taxSaving30 = deduction * 0.30;
  const taxSaving37 = deduction * 0.37;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Hours Per Week</span><span class="result-value">${hoursPerWeek}</span></div>
    <div class="result-row"><span class="result-label">Weeks Worked</span><span class="result-value">${weeksWorked}</span></div>
    <div class="result-row"><span class="result-label">Total Hours</span><span class="result-value">${totalHours.toFixed(0)}</span></div>
    <hr class="my-2">
    ${method === 'fixed' ? `
      <h4 class="font-semibold mb-2">Fixed Rate Method (67c/hr)</h4>
      <div class="result-row"><span class="result-label">Rate Per Hour</span><span class="result-value">$0.67</span></div>
      <div class="result-row font-bold"><span class="result-label">Total Deduction</span><span class="result-value">${formatCurrency(fixedDeduction)}</span></div>
      <p class="text-sm text-gray-600 mt-2 mb-3">The fixed rate of 67c/hr covers electricity, phone, internet, stationery, and computer consumables. You can claim separately for the decline in value of depreciating assets (e.g., office furniture, tech equipment).</p>
    ` : `
      <h4 class="font-semibold mb-2">Actual Cost Method (Estimates)</h4>
      <div class="result-row"><span class="result-label">Electricity (est.)</span><span class="result-value">${formatCurrency(estimatedElectricity)}</span></div>
      <div class="result-row"><span class="result-label">Internet (est.)</span><span class="result-value">${formatCurrency(estimatedInternet)}</span></div>
      <div class="result-row"><span class="result-label">Phone (est.)</span><span class="result-value">${formatCurrency(estimatedPhoneUsage)}</span></div>
      <div class="result-row"><span class="result-label">Equipment Depreciation (est.)</span><span class="result-value">${formatCurrency(estimatedDepreciation)}</span></div>
      <div class="result-row font-bold"><span class="result-label">Estimated Total Deduction</span><span class="result-value">${formatCurrency(actualEstimate)}</span></div>
      <p class="text-sm text-gray-600 mt-2 mb-3">These are rough estimates. With the actual cost method you must keep records of all expenses and calculate the work-related portion.</p>
    `}
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Estimated Tax Saving</h4>
    <div class="result-row"><span class="result-label">At 30% marginal rate</span><span class="result-value text-green-600">${formatCurrency(taxSaving30)}</span></div>
    <div class="result-row"><span class="result-label">At 37% marginal rate</span><span class="result-value text-green-600">${formatCurrency(taxSaving37)}</span></div>
  `;
}

function getTLDR() {
  const hoursPerWeek = parseFloat(document.getElementById('input-hoursPerWeek').value) || 0;
  const weeksWorked = parseFloat(document.getElementById('input-weeksPerYear').value) || 0;
  if (hoursPerWeek <= 0 || weeksWorked <= 0) return '';
  const methodInputs = document.querySelectorAll('input[name="input-method"]');
  let method = 'fixed';
  for (const input of methodInputs) { if (input.checked) { method = input.value; break; } }
  const totalHours = hoursPerWeek * weeksWorked;
  const fixedDeduction = totalHours * 0.67;
  const estimatedElectricity = totalHours * 0.35;
  const estimatedInternet = totalHours * 0.15;
  const estimatedPhoneUsage = totalHours * 0.10;
  const estimatedDepreciation = weeksWorked * 5;
  const actualEstimate = estimatedElectricity + estimatedInternet + estimatedPhoneUsage + estimatedDepreciation;
  const deduction = method === 'fixed' ? fixedDeduction : actualEstimate;
  const taxSaving = deduction * 0.30;
  return 'Working from home for ' + totalHours.toFixed(0) + ' hours a year (' + hoursPerWeek + ' hrs/week) gives you a ' + (method === 'fixed' ? 'fixed rate' : 'actual cost') + ' deduction of ' + formatCurrency(deduction) + ', saving roughly ' + formatCurrency(taxSaving) + ' in tax at the 30% marginal rate.';
}
