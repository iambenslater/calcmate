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

  // LMI premium estimation based on LVR tiers and loan size
  // These are approximate rates based on typical Helia/QBE schedules
  function estimateLMI(loan, lvrPct) {
    if (lvrPct <= 80) return 0;

    // LMI rates vary by LVR band and loan amount
    // Rates are approximate percentages of loan amount
    let rate = 0;

    if (loan <= 300000) {
      if (lvrPct <= 85) rate = 0.0062;
      else if (lvrPct <= 90) rate = 0.0134;
      else if (lvrPct <= 95) rate = 0.0283;
      else rate = 0.0412;
    } else if (loan <= 500000) {
      if (lvrPct <= 85) rate = 0.0076;
      else if (lvrPct <= 90) rate = 0.0181;
      else if (lvrPct <= 95) rate = 0.0350;
      else rate = 0.0520;
    } else if (loan <= 700000) {
      if (lvrPct <= 85) rate = 0.0098;
      else if (lvrPct <= 90) rate = 0.0230;
      else if (lvrPct <= 95) rate = 0.0420;
      else rate = 0.0620;
    } else if (loan <= 1000000) {
      if (lvrPct <= 85) rate = 0.0118;
      else if (lvrPct <= 90) rate = 0.0280;
      else if (lvrPct <= 95) rate = 0.0515;
      else rate = 0.0750;
    } else {
      if (lvrPct <= 85) rate = 0.0140;
      else if (lvrPct <= 90) rate = 0.0350;
      else if (lvrPct <= 95) rate = 0.0600;
      else rate = 0.0900;
    }

    return loan * rate;
  }

  const lmiEstimate = estimateLMI(loanAmount, lvr);

  // Stamp duty on LMI (applies in some states)
  const lmiStampDuty = lmiEstimate * 0.10; // ~10% approximate

  const totalLMICost = lmiEstimate + lmiStampDuty;

  // If LMI is capitalised onto the loan
  const newLoanWithLMI = loanAmount + totalLMICost;
  const newLVR = (newLoanWithLMI / propertyValue) * 100;

  // Monthly interest cost of capitalised LMI (at 6.5% rate)
  const monthlyLMICost = totalLMICost * (0.065 / 12);
  const totalLMIInterest30yr = monthlyLMICost * 360; // over 30 years

  // Show what deposit you'd need to avoid LMI
  const depositFor80 = propertyValue * 0.20;
  const additionalNeeded = depositFor80 - deposit;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Property Value</span><span class="result-value">${formatCurrency(propertyValue)}</span></div>
    <div class="result-row"><span class="result-label">Loan Amount</span><span class="result-value">${formatCurrency(loanAmount)}</span></div>
    <div class="result-row"><span class="result-label">LVR</span><span class="result-value">${lvr.toFixed(1)}%</span></div>
    <div class="result-row"><span class="result-label">Deposit</span><span class="result-value">${formatCurrency(deposit)}</span></div>
    <hr class="my-2">
    ${lvr <= 80 ? `
      <p class="text-green-600 font-semibold text-lg">No LMI Required</p>
      <p class="text-sm text-gray-600 mt-1">Your LVR is 80% or below. LMI is not required.</p>
    ` : `
      <div class="result-row font-bold text-lg"><span class="result-label">Estimated LMI Premium</span><span class="result-value text-red-600">${formatCurrency(lmiEstimate)}</span></div>
      <div class="result-row"><span class="result-label">Stamp Duty on LMI (est.)</span><span class="result-value">${formatCurrency(lmiStampDuty)}</span></div>
      <div class="result-row font-bold"><span class="result-label">Total LMI Cost</span><span class="result-value text-red-600">${formatCurrency(totalLMICost)}</span></div>
      <hr class="my-2">
      <h4 class="font-semibold mb-2">If LMI is Capitalised onto Loan</h4>
      <div class="result-row"><span class="result-label">New Loan Amount</span><span class="result-value">${formatCurrency(newLoanWithLMI)}</span></div>
      <div class="result-row"><span class="result-label">New LVR</span><span class="result-value">${newLVR.toFixed(1)}%</span></div>
      <div class="result-row"><span class="result-label">Extra Monthly Cost (at 6.5%)</span><span class="result-value">${formatCurrency(monthlyLMICost)}</span></div>
      <div class="result-row"><span class="result-label">Interest on LMI over 30 years</span><span class="result-value text-red-600">${formatCurrency(totalLMIInterest30yr)}</span></div>
      <hr class="my-2">
      <h4 class="font-semibold mb-2">How to Avoid LMI</h4>
      <div class="result-row"><span class="result-label">Deposit Needed for 80% LVR</span><span class="result-value">${formatCurrency(depositFor80)}</span></div>
      <div class="result-row"><span class="result-label">Additional Deposit Required</span><span class="result-value text-amber-600">${formatCurrency(Math.max(0, additionalNeeded))}</span></div>
      <p class="text-sm text-gray-600 mt-2">Other options: Family Guarantee, First Home Guarantee Scheme (5% deposit, no LMI for eligible buyers), or saving a larger deposit.</p>
    `}
    <p class="text-sm text-gray-500 mt-3">LMI estimates are approximate and vary between insurers (Helia, QBE). Contact your lender for an exact quote.</p>
  `;
}

function getTLDR() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  if (propertyValue <= 0) return '';
  const lvr = (loanAmount / propertyValue) * 100;
  if (lvr <= 80) return 'Your LVR is ' + lvr.toFixed(1) + '% — no LMI required.';
  function estimateLMI(loan, lvrPct) {
    let rate = 0;
    if (loan <= 300000) { rate = lvrPct <= 85 ? 0.0062 : lvrPct <= 90 ? 0.0134 : lvrPct <= 95 ? 0.0283 : 0.0412; }
    else if (loan <= 500000) { rate = lvrPct <= 85 ? 0.0076 : lvrPct <= 90 ? 0.0181 : lvrPct <= 95 ? 0.0350 : 0.0520; }
    else if (loan <= 700000) { rate = lvrPct <= 85 ? 0.0098 : lvrPct <= 90 ? 0.0230 : lvrPct <= 95 ? 0.0420 : 0.0620; }
    else if (loan <= 1000000) { rate = lvrPct <= 85 ? 0.0118 : lvrPct <= 90 ? 0.0280 : lvrPct <= 95 ? 0.0515 : 0.0750; }
    else { rate = lvrPct <= 85 ? 0.0140 : lvrPct <= 90 ? 0.0350 : lvrPct <= 95 ? 0.0600 : 0.0900; }
    return loan * rate;
  }
  const lmiEstimate = estimateLMI(loanAmount, lvr);
  const totalLMICost = lmiEstimate * 1.10;
  const additionalNeeded = Math.max(propertyValue * 0.20 - (propertyValue - loanAmount), 0);
  return 'With a ' + lvr.toFixed(1) + '% LVR, you\'ll pay an estimated ' + formatCurrency(totalLMICost) + ' in LMI — you\'d need ' + formatCurrency(additionalNeeded) + ' more deposit to avoid it entirely.';
}
