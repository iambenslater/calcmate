function calculate() {
  const assetPrice = parseFloat(document.getElementById('input-assetPrice').value);
  const depositPct = parseFloat(document.getElementById('input-deposit').value);
  const interestRate = parseFloat(document.getElementById('input-interestRate').value);
  const termYears = parseInt(document.getElementById('input-term').value);
  const balloonPct = parseFloat(document.getElementById('input-balloonPayment').value);
  const gstRegistered = document.getElementById('input-gstRegistered').checked;

  if (isNaN(assetPrice) || assetPrice <= 0) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Please enter a valid asset price.</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }
  if (isNaN(depositPct) || depositPct < 0 || depositPct >= 100) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Please enter a valid deposit percentage (0–99%).</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }
  if (isNaN(interestRate) || interestRate <= 0) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Please enter a valid interest rate.</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }
  if (isNaN(balloonPct) || balloonPct < 0 || balloonPct >= 100) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Please enter a valid balloon payment percentage (0–99%).</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }

  const fmt = v => new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: 'AUD',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(v);

  const fmt2 = v => new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: 'AUD',
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(v);

  const GST_RATE = 0.1;
  const COMPANY_TAX_RATE = 0.25;

  // GST on purchase (if registered, can claim input credit)
  const assetExGST = assetPrice / (1 + GST_RATE);
  const gstOnAsset = assetPrice - assetExGST;

  // Deposit
  const depositAmt = assetPrice * (depositPct / 100);

  // Finance amount: if GST-registered, lender finances ex-GST amount (ATO pays GST direct)
  // Standard CHP: lender pays the seller in full, buyer repays lender
  // GST input credit is claimed in first BAS
  const financeAmount = assetPrice - depositAmt;

  // Balloon amount
  const balloonAmount = financeAmount * (balloonPct / 100);
  const amountToFinance = financeAmount - balloonAmount; // PV of regular payments

  const months = termYears * 12;
  const monthlyRate = (interestRate / 100) / 12;

  function monthlyRepayment(principal, months, mRate, balloon = 0) {
    // PV = PMT × [(1 - (1+r)^-n) / r] + balloon × (1+r)^-n
    // Solve for PMT:
    if (mRate === 0) return (principal - balloon / Math.pow(1, months)) / months;
    const pvBalloon = balloon / Math.pow(1 + mRate, months);
    const pmt = (principal - pvBalloon) * (mRate * Math.pow(1 + mRate, months)) / (Math.pow(1 + mRate, months) - 1);
    return pmt;
  }

  // With balloon
  const monthlyWithBalloon = monthlyRepayment(financeAmount, months, monthlyRate, balloonAmount);
  const totalRegularWithBalloon = monthlyWithBalloon * months;
  const totalCostWithBalloon = depositAmt + totalRegularWithBalloon + balloonAmount;
  const totalInterestWithBalloon = totalCostWithBalloon - assetPrice;

  // Without balloon (for comparison)
  const monthlyNoBalloon = monthlyRepayment(financeAmount, months, monthlyRate, 0);
  const totalRegularNoBalloon = monthlyNoBalloon * months;
  const totalCostNoBalloon = depositAmt + totalRegularNoBalloon;
  const totalInterestNoBalloon = totalCostNoBalloon - assetPrice;

  // GST input credit (claimed in BAS)
  const gstInputCredit = gstRegistered ? gstOnAsset : 0;

  // Tax benefit: interest + depreciation deductible for business
  // CHP: interest deductible, asset depreciated (Div 40 instant asset write-off or MACRS)
  // Simplified: assume interest deductible and some depreciation benefit
  const totalInterestForTax = totalInterestWithBalloon;
  // Straight-line depreciation over term (simplified)
  const annualDepreciation = assetExGST / termYears;
  const totalDepreciationBenefit = annualDepreciation * termYears * COMPANY_TAX_RATE;
  const interestTaxBenefit = totalInterestForTax * COMPANY_TAX_RATE;
  const totalTaxBenefit = interestTaxBenefit + (gstRegistered ? 0 : 0) + totalDepreciationBenefit;

  // Effective cost after tax benefit (with balloon)
  const effectiveCostAfterTax = totalCostWithBalloon - totalTaxBenefit - gstInputCredit;

  const html = `
    <h4>Asset &amp; Finance Structure</h4>
    <div class="result-row">
      <span class="result-label">Asset price (GST-inclusive)</span>
      <span class="result-value">${fmt(assetPrice)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Asset price (ex-GST)</span>
      <span class="result-value">${fmt(assetExGST)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">GST on asset</span>
      <span class="result-value">${fmt(gstOnAsset)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Deposit (${depositPct}%)</span>
      <span class="result-value">${fmt(depositAmt)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Finance amount</span>
      <span class="result-value">${fmt(financeAmount)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Balloon / residual (${balloonPct}%)</span>
      <span class="result-value">${fmt(balloonAmount)}</span>
    </div>
    <hr>
    <h4>Repayments — With ${balloonPct}% Balloon</h4>
    <div class="result-row font-bold">
      <span class="result-label">Monthly repayment</span>
      <span class="result-value">${fmt2(monthlyWithBalloon)}/month</span>
    </div>
    <div class="result-row">
      <span class="result-label">Total regular repayments (${months} months)</span>
      <span class="result-value">${fmt(totalRegularWithBalloon)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Balloon payment at end of term</span>
      <span class="result-value">${fmt(balloonAmount)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Total interest payable</span>
      <span class="result-value">${fmt(totalInterestWithBalloon)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Total cost (with balloon)</span>
      <span class="result-value">${fmt(totalCostWithBalloon)}</span>
    </div>
    <hr>
    <h4>Comparison — Without Balloon Payment</h4>
    <div class="result-row">
      <span class="result-label">Monthly repayment (no balloon)</span>
      <span class="result-value">${fmt2(monthlyNoBalloon)}/month</span>
    </div>
    <div class="result-row">
      <span class="result-label">Total interest (no balloon)</span>
      <span class="result-value">${fmt(totalInterestNoBalloon)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Total cost (no balloon)</span>
      <span class="result-value">${fmt(totalCostNoBalloon)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Monthly saving with balloon</span>
      <span class="result-value">${fmt2(monthlyNoBalloon - monthlyWithBalloon)}/month</span>
    </div>
    <div class="result-row">
      <span class="result-label">Extra interest cost with balloon</span>
      <span class="result-value">${fmt(totalInterestWithBalloon - totalInterestNoBalloon)}</span>
    </div>
    <hr>
    <h4>Tax &amp; GST Benefits${gstRegistered ? ' (GST Registered)' : ''}</h4>
    ${gstRegistered ? `
    <div class="result-row">
      <span class="result-label">GST input tax credit (claim on BAS)</span>
      <span class="result-value">${fmt(gstInputCredit)}</span>
    </div>` : `
    <div class="result-row">
      <span class="result-label">GST input tax credit</span>
      <span class="result-value">Not applicable (not GST registered)</span>
    </div>`}
    <div class="result-row">
      <span class="result-label">Interest tax deduction (${(COMPANY_TAX_RATE * 100).toFixed(0)}% company rate)</span>
      <span class="result-value">${fmt(interestTaxBenefit)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Depreciation tax benefit (Div 40, ${(COMPANY_TAX_RATE * 100).toFixed(0)}% rate)</span>
      <span class="result-value">${fmt(totalDepreciationBenefit)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Total tax &amp; GST benefit</span>
      <span class="result-value">${fmt(totalTaxBenefit + gstInputCredit)}</span>
    </div>
    <hr>
    <div class="result-row font-bold">
      <span class="result-label">Effective cost after all tax benefits</span>
      <span class="result-value">${fmt(effectiveCostAfterTax)}</span>
    </div>
    <p class="text-sm text-gray-500 mt-3">Commercial Hire Purchase (CHP): the lender owns the asset during the term; ownership transfers to you upon final payment. Interest and depreciation are generally tax deductible for business use. GST input credits are claimable upfront if GST registered (and asset used for business purposes). Tax benefit estimates use a 25% company tax rate. Consult your accountant for your specific situation — actual deductions depend on business use percentage and ATO instant asset write-off rules.</p>
  `;

  document.getElementById('results-content').innerHTML = html;
  document.getElementById('calc-results').classList.remove('hidden');
}
