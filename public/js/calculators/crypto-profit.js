function calculate() {
  const buyPrice = parseFloat(document.getElementById('input-buyPrice').value) || 0;
  const sellPrice = parseFloat(document.getElementById('input-sellPrice').value) || 0;
  const quantity = parseFloat(document.getElementById('input-quantity').value) || 0;
  const buyFeeRate = parseFloat(document.getElementById('input-buyFee').value) || 0;
  const sellFeeRate = parseFloat(document.getElementById('input-sellFee').value) || 0;
  const holdingMonths = parseInt(document.getElementById('input-holdingPeriod').value) || 0;

  const totalBuyCost = buyPrice * quantity;
  const totalSellValue = sellPrice * quantity;

  // Exchange fees on both buy and sell
  const buyFee = totalBuyCost * (buyFeeRate / 100);
  const sellFee = totalSellValue * (sellFeeRate / 100);
  const totalFees = buyFee + sellFee;

  const grossProfit = totalSellValue - totalBuyCost;
  const netProfit = grossProfit - totalFees;
  const percentReturn = totalBuyCost > 0 ? (netProfit / totalBuyCost) * 100 : 0;

  // Australian CGT
  // Crypto is treated as property for CGT purposes
  // Held > 12 months = 50% CGT discount for individuals
  const cgtDiscount = holdingMonths >= 12;
  const taxableGain = netProfit > 0 ? (cgtDiscount ? netProfit * 0.5 : netProfit) : 0;

  // Estimate tax at different brackets
  const taxBrackets = [
    { rate: 0.16, label: '16%', tax: taxableGain * 0.16 },
    { rate: 0.30, label: '30%', tax: taxableGain * 0.30 },
    { rate: 0.37, label: '37%', tax: taxableGain * 0.37 },
    { rate: 0.45, label: '45%', tax: taxableGain * 0.45 },
  ];

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Buy Total</span><span class="result-value">${fmt(totalBuyCost)}</span></div>
    <div class="result-row"><span class="result-label">Sell Total</span><span class="result-value">${fmt(totalSellValue)}</span></div>
    <div class="result-row"><span class="result-label">Buy Fee (${buyFeeRate}%)</span><span class="result-value">-${fmt(buyFee)}</span></div>
    <div class="result-row"><span class="result-label">Sell Fee (${sellFeeRate}%)</span><span class="result-value">-${fmt(sellFee)}</span></div>
    <div class="result-row"><span class="result-label">Total Fees</span><span class="result-value">${fmt(totalFees)}</span></div>
    <div class="result-row highlight"><span class="result-label">Net Profit/Loss</span><span class="result-value">${netProfit >= 0 ? '' : '-'}${fmt(Math.abs(netProfit))}</span></div>
    <div class="result-row"><span class="result-label">Return</span><span class="result-value">${percentReturn.toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Holding Period</span><span class="result-value">${holdingMonths} months ${cgtDiscount ? '(50% CGT discount applies)' : '(no CGT discount < 12 months)'}</span></div>
    ${netProfit > 0 ? `
    <div class="result-row"><span class="result-label">Taxable Capital Gain</span><span class="result-value">${fmt(taxableGain)}${cgtDiscount ? ' (after 50% discount)' : ''}</span></div>
    <hr style="border-color: var(--border-light); margin: 1rem 0;">
    <p class="result-note"><strong>Estimated CGT by tax bracket:</strong></p>
    ${taxBrackets.map(b => `<div class="result-row"><span class="result-label">Tax at ${b.label}</span><span class="result-value">${fmt(b.tax)} (keep ${fmt(netProfit - b.tax)})</span></div>`).join('')}
    ` : ''}
    <p class="result-note">In Australia, crypto is a CGT asset. Holding 12+ months qualifies for a 50% discount. Capital losses can offset gains. This is not financial advice — consult a tax professional. The ATO tracks crypto transactions.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', {minimumFractionDigits:2, maximumFractionDigits:2}); }
