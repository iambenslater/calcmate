function formatCurrency(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function calculate() {
  const salePrice = parseFloat(document.getElementById('input-salePrice').value) || 0;
  const commissionPct = parseFloat(document.getElementById('input-agentCommission').value) || 2.0;
  const marketingBudget = parseFloat(document.getElementById('input-marketingBudget').value) || 5000;
  const outstandingMortgage = parseFloat(document.getElementById('input-outstandingMortgage').value) || 0;
  const state = document.getElementById('input-state').value;
  const yearsOwned = parseFloat(document.getElementById('input-yearsOwned').value) || 5;

  if (salePrice <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid sale price.</p>';
    return;
  }

  // Agent commission
  const agentCommission = salePrice * (commissionPct / 100);

  // Auctioneer fee (if applicable — assume auction for all, midpoint)
  const auctioneerFee = 600;

  // Conveyancing / legal (seller)
  const conveyancingFee = 1100;

  // Mortgage discharge fee
  const dischargeFee = outstandingMortgage > 0 ? 400 : 0;

  // Capital Gains estimate (simplified — not CGT advice)
  // Assume purchase price roughly = sale price - appreciation at ~5%/yr compounded
  const estimatedPurchasePrice = salePrice / Math.pow(1.05, yearsOwned);
  const capitalGain = salePrice - estimatedPurchasePrice;
  // 50% CGT discount if held > 12 months
  const taxableGain = yearsOwned >= 1 ? capitalGain * 0.5 : capitalGain;
  // Estimate at marginal rate ~37% (mid-income assumption)
  const cgtEstimate = Math.max(0, taxableGain * 0.37);

  const totalCosts = agentCommission + marketingBudget + auctioneerFee + conveyancingFee + dischargeFee;
  const netProceedsBeforeCapitalGains = salePrice - totalCosts - outstandingMortgage;
  const netProceedsAfterCGT = netProceedsBeforeCapitalGains - cgtEstimate;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Total Selling Costs</span><span class="result-value">${formatCurrency(totalCosts)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Est. Net Proceeds (before CGT)</span><span class="result-value">${formatCurrency(Math.max(0, netProceedsBeforeCapitalGains))}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Selling Cost Breakdown</h4>
    <div class="result-row"><span class="result-label">Agent Commission (${commissionPct}%)</span><span class="result-value">${formatCurrency(agentCommission)}</span></div>
    <div class="result-row"><span class="result-label">Marketing Budget</span><span class="result-value">${formatCurrency(marketingBudget)}</span></div>
    <div class="result-row"><span class="result-label">Auctioneer Fee</span><span class="result-value">~${formatCurrency(auctioneerFee)}</span></div>
    <div class="result-row"><span class="result-label">Conveyancing / Legal</span><span class="result-value">~${formatCurrency(conveyancingFee)}</span></div>
    ${dischargeFee > 0 ? `<div class="result-row"><span class="result-label">Mortgage Discharge Fee</span><span class="result-value">~${formatCurrency(dischargeFee)}</span></div>` : ''}
    ${outstandingMortgage > 0 ? `<div class="result-row"><span class="result-label">Outstanding Mortgage Payout</span><span class="result-value text-red-600">-${formatCurrency(outstandingMortgage)}</span></div>` : ''}
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Capital Gains Estimate (${state})</h4>
    <div class="result-row"><span class="result-label">Estimated Purchase Price (${yearsOwned} yrs ago at 5% p.a.)</span><span class="result-value">${formatCurrency(estimatedPurchasePrice)}</span></div>
    <div class="result-row"><span class="result-label">Estimated Capital Gain</span><span class="result-value">${formatCurrency(capitalGain)}</span></div>
    <div class="result-row"><span class="result-label">Taxable Gain (50% CGT discount applied)</span><span class="result-value">${formatCurrency(taxableGain)}</span></div>
    <div class="result-row"><span class="result-label">Estimated CGT Payable (~37% marginal rate)</span><span class="result-value text-red-600">~${formatCurrency(cgtEstimate)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Est. Net Proceeds (after CGT)</span><span class="result-value">${formatCurrency(Math.max(0, netProceedsAfterCGT))}</span></div>
    <p class="text-sm text-amber-600 mt-2">CGT is an estimate only. Your actual purchase price, renovation costs, and tax situation will significantly affect your liability. Consult a tax professional.</p>
    <p class="text-sm text-gray-500 mt-2">Your principal place of residence is generally exempt from CGT. Costs are estimates only.</p>
  `;
}
