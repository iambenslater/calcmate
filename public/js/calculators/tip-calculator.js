function calculate() {
  const billAmount = parseFloat(document.getElementById('input-billAmount').value) || 0;
  const tipPercent = parseFloat(document.getElementById('input-tipPercent').value) || 0;
  const splitBetween = parseInt(document.getElementById('input-splitBetween').value) || 1;

  if (billAmount <= 0) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid bill amount.</p>'; return; }
  if (splitBetween < 1) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Split must be at least 1 person.</p>'; return; }

  const tipAmount = billAmount * (tipPercent / 100);
  const totalBill = billAmount + tipAmount;
  const perPerson = totalBill / splitBetween;
  const tipPerPerson = tipAmount / splitBetween;

  // Show alternatives at common tip percentages
  const altTips = [10, 15, 20].filter(t => t !== tipPercent);
  let altRows = '';
  for (const t of altTips) {
    const altTip = billAmount * (t / 100);
    const altTotal = billAmount + altTip;
    const altPP = altTotal / splitBetween;
    altRows += `<div class="result-row"><span class="result-label">${t}% tip</span><span class="result-value">Tip: ${fmt(altTip)} | Total: ${fmt(altTotal)} | Per person: ${fmt(altPP)}</span></div>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Tip Amount</span><span class="result-value">${fmt(tipAmount)}</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Total Bill</span><span class="result-value">${fmt(totalBill)}</span></div>
    ${splitBetween > 1 ? `<div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Per Person</span><span class="result-value">${fmt(perPerson)}</span></div>` : ''}
    ${splitBetween > 1 ? `<div class="result-row"><span class="result-label">Tip per Person</span><span class="result-value">${fmt(tipPerPerson)}</span></div>` : ''}
    <div class="result-row"><span class="result-label">Bill Amount</span><span class="result-value">${fmt(billAmount)}</span></div>
    <div class="result-row"><span class="result-label">Tip Percentage</span><span class="result-value">${tipPercent}%</span></div>
    <div class="result-row"><span class="result-label">Split Between</span><span class="result-value">${splitBetween} ${splitBetween === 1 ? 'person' : 'people'}</span></div>
    ${altRows ? `<div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;"><strong>Other Tip Amounts</strong></div>${altRows}` : ''}
    <p class="text-sm text-gray-500 mt-4">Tipping is not mandatory in Australia but is appreciated for good service. 10-15% is common at restaurants.</p>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
