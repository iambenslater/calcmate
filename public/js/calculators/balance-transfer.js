function calculate() {
  const currentBalance = parseFloat(document.getElementById('input-currentBalance').value) || 0;
  const currentRate = (parseFloat(document.getElementById('input-currentRate').value) || 20.0) / 100;
  const btRate = (parseFloat(document.getElementById('input-btRate').value) || 0) / 100;
  const btPeriod = parseInt(document.getElementById('input-btPeriod').value) || 12;
  const btFeePct = (parseFloat(document.getElementById('input-btFee').value) || 2) / 100;
  const monthlyRepayment = parseFloat(document.getElementById('input-monthlyRepayment').value) || 0;

  if (currentBalance <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<div class="result-row"><span class="result-label" style="color:var(--error,#e53e3e)">Please enter your current balance.</span></div>';
    return;
  }

  const revertRate = 0.2199; // typical revert rate after promo ends (~22%)

  // --- Scenario A: Stay on current card ---
  const monthlyRateCurrent = currentRate / 12;
  let balA = currentBalance;
  let totalInterestA = 0;
  let totalPaidA = 0;

  for (let m = 0; m < btPeriod; m++) {
    const interest = balA * monthlyRateCurrent;
    const payment = monthlyRepayment > 0
      ? Math.min(monthlyRepayment, balA + interest)
      : 0;
    balA = balA + interest - payment;
    totalInterestA += interest;
    totalPaidA += payment;
    if (balA < 0) balA = 0;
  }

  // --- Scenario B: Balance transfer ---
  const btFeeAmount = currentBalance * btFeePct;
  const monthlyRateBT = btRate / 12;
  let balB = currentBalance + btFeeAmount;
  let totalInterestB = 0;
  let totalPaidB = 0;

  for (let m = 0; m < btPeriod; m++) {
    const interest = balB * monthlyRateBT;
    const payment = monthlyRepayment > 0
      ? Math.min(monthlyRepayment, balB + interest)
      : 0;
    balB = balB + interest - payment;
    totalInterestB += interest;
    totalPaidB += payment;
    if (balB < 0) balB = 0;
  }

  const netSavings = (totalInterestA - totalInterestB);
  const worthTransferring = netSavings > 0;

  // --- After promo ends: monthly cost on remaining BT balance at revert rate ---
  const monthlyRevertCost = balB > 0 ? (balB * revertRate / 12) : 0;

  // Build output
  const verdictColour = worthTransferring ? 'color:#276749' : 'color:#c53030';
  const verdictText = worthTransferring
    ? `Transfer saves you ${fmt(netSavings)} over the promo period`
    : `Transfer costs more than staying — not recommended`;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <h4>Your situation</h4>
    <div class="result-row"><span class="result-label">Current balance</span><span class="result-value">${fmt(currentBalance)}</span></div>
    <div class="result-row"><span class="result-label">Current card rate</span><span class="result-value">${(currentRate * 100).toFixed(2)}% p.a.</span></div>
    <div class="result-row"><span class="result-label">BT promo rate</span><span class="result-value">${(btRate * 100).toFixed(2)}% p.a. for ${btPeriod} months</span></div>
    <div class="result-row"><span class="result-label">BT fee</span><span class="result-value">${(btFeePct * 100).toFixed(1)}% = ${fmt(btFeeAmount)}</span></div>
    ${monthlyRepayment > 0 ? `<div class="result-row"><span class="result-label">Monthly repayment</span><span class="result-value">${fmt(monthlyRepayment)}</span></div>` : ''}
    <hr style="border-color:var(--border);margin:12px 0">
    <h4>Over the ${btPeriod}-month promo period</h4>
    <div class="result-row"><span class="result-label">Interest — stay on current card</span><span class="result-value">${fmt(totalInterestA)}</span></div>
    <div class="result-row"><span class="result-label">Interest — balance transfer card</span><span class="result-value">${fmt(totalInterestB)}</span></div>
    <div class="result-row"><span class="result-label">BT fee cost</span><span class="result-value">${fmt(btFeeAmount)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Interest saving from transfer</span><span class="result-value">${fmt(Math.max(netSavings, 0))}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <h4>After promo ends</h4>
    <div class="result-row"><span class="result-label">Remaining balance (stay put)</span><span class="result-value">${fmt(Math.max(balA, 0))}</span></div>
    <div class="result-row"><span class="result-label">Remaining balance (after transfer)</span><span class="result-value">${fmt(Math.max(balB, 0))}</span></div>
    ${balB > 0 ? `<div class="result-row"><span class="result-label">Monthly interest at revert rate (~${(revertRate * 100).toFixed(2)}%)</span><span class="result-value">${fmt(monthlyRevertCost)}/mo</span></div>
    <div class="result-row"><span class="result-label" style="color:#c53030;font-size:0.88em">⚠ Pay off your BT balance before the promo period ends to avoid the revert rate.</span></div>` : '<div class="result-row"><span class="result-label" style="color:#276749">Balance fully paid off during promo period!</span></div>'}
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row font-bold"><span class="result-label">Verdict</span><span class="result-value" style="${verdictColour}">${verdictText}</span></div>
  `;
}

function fmt(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
