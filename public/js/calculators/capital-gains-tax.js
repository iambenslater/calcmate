function calculate() {
  const purchasePrice = parseFloat(document.getElementById('input-purchasePrice').value) || 0;
  const salePrice = parseFloat(document.getElementById('input-salePrice').value) || 0;
  const sellingCosts = parseFloat(document.getElementById('input-sellingCosts').value) || 0;
  const holdingPeriod = document.getElementById('input-holdingPeriod').value;
  const assetType = document.getElementById('input-assetType').value;
  const marginalRateStr = document.getElementById('input-taxBracket').value;

  const marginalRate = parseFloat(marginalRateStr) / 100 || 0;
  const adjustedSalePrice = salePrice - sellingCosts;
  const capitalGain = adjustedSalePrice - purchasePrice;
  const isLoss = capitalGain < 0;
  const eligible50Discount = (holdingPeriod === 'over12' || holdingPeriod === 'more-than-12-months') && !isLoss;
  const discountedGain = eligible50Discount ? capitalGain * 0.5 : capitalGain;
  const taxPayable = isLoss ? 0 : discountedGain * marginalRate;
  const netProfit = capitalGain - taxPayable;
  const effectiveRate = capitalGain > 0 ? (taxPayable / capitalGain) * 100 : 0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Purchase Price</span><span class="result-value">${fmt(purchasePrice)}</span></div>
    <div class="result-row"><span class="result-label">Sale Price</span><span class="result-value">${fmt(salePrice)}</span></div>
    <div class="result-row"><span class="result-label">Selling Costs</span><span class="result-value">${fmt(sellingCosts)}</span></div>
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

function getTLDR() {
  var purchasePrice = parseFloat(document.getElementById('input-purchasePrice').value) || 0;
  var salePrice = parseFloat(document.getElementById('input-salePrice').value) || 0;
  var sellingCosts = parseFloat(document.getElementById('input-sellingCosts').value) || 0;
  var holdingPeriod = document.getElementById('input-holdingPeriod').value;
  var marginalRate = parseFloat(document.getElementById('input-taxBracket').value) / 100 || 0;
  var capitalGain = (salePrice - sellingCosts) - purchasePrice;
  var isLoss = capitalGain < 0;
  var eligible50Discount = (holdingPeriod === 'over12' || holdingPeriod === 'more-than-12-months') && !isLoss;
  var discountedGain = eligible50Discount ? capitalGain * 0.5 : capitalGain;
  var taxPayable = isLoss ? 0 : discountedGain * marginalRate;
  var netProfit = capitalGain - taxPayable;
  if (isLoss) {
    return 'This asset was sold at a loss of ' + fmt(Math.abs(capitalGain)) + ' — no CGT is payable, and this loss can be carried forward to offset future capital gains.';
  }
  return 'Your capital gain of ' + fmt(capitalGain) + (eligible50Discount ? ' (reduced to ' + fmt(discountedGain) + ' with the 50% discount for holding 12+ months)' : '') + ' results in estimated CGT of ' + fmt(taxPayable) + ', leaving a net profit of ' + fmt(netProfit) + ' after tax.';
}

