function calculate() {
  const purchasePrice = parseFloat(document.getElementById('input-purchasePrice').value) || 0;
  const salePrice = parseFloat(document.getElementById('input-salePrice').value) || 0;
  const holdingMonths = parseInt(document.getElementById('input-holdingMonths').value) || 0;
  const marginalRateStr = document.getElementById('input-marginalTaxRate').value;

  const marginalRate = parseFloat(marginalRateStr) / 100 || 0;
  const capitalGain = salePrice - purchasePrice;
  const isLoss = capitalGain < 0;
  const eligible50Discount = holdingMonths >= 12 && !isLoss;
  const discountedGain = eligible50Discount ? capitalGain * 0.5 : capitalGain;
  const taxPayable = isLoss ? 0 : discountedGain * marginalRate;
  const netProfit = capitalGain - taxPayable;
  const effectiveRate = capitalGain > 0 ? (taxPayable / capitalGain) * 100 : 0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Purchase Price</span><span class="result-value">${fmt(purchasePrice)}</span></div>
    <div class="result-row"><span class="result-label">Sale Price</span><span class="result-value">${fmt(salePrice)}</span></div>
    <div class="result-row"><span class="result-label">Holding Period</span><span class="result-value">${holdingMonths} months</span></div>
    <div class="result-row"><span class="result-label">Capital Gain</span><span class="result-value">${fmt(capitalGain)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">50% CGT Discount</span><span class="result-value">${eligible50Discount ? 'Yes (held 12+ months)' : 'No'}</span></div>
    <div class="result-row"><span class="result-label">Taxable Capital Gain</span><span class="result-value">${fmt(Math.max(0, discountedGain))}</span></div>
    <div class="result-row"><span class="result-label">Marginal Tax Rate</span><span class="result-value">${(marginalRate * 100).toFixed(0)}%</span></div>
    <div class="result-row highlight"><span class="result-label">Estimated CGT Payable</span><span class="result-value">${fmt(taxPayable)}</span></div>
    <div class="result-row"><span class="result-label">Net Profit After Tax</span><span class="result-value">${fmt(netProfit)}</span></div>
    <div class="result-row"><span class="result-label">Effective Tax Rate on Gain</span><span class="result-value">${effectiveRate.toFixed(1)}%</span></div>
    ${isLoss ? '<p style="margin-top:12px;font-size:0.85rem;color:var(--text-muted)">Capital losses can be carried forward to offset future capital gains.</p>' : ''}
  `;
}

function fmt(n) { return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
