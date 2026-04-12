function calculate() {
  const annualIncome = parseFloat(document.getElementById('input-annualIncome').value) || 0;
  const age = parseFloat(document.getElementById('input-age').value) || 35;
  const dependantsVal = document.getElementById('input-dependants').value;
  const mortgageOwing = parseFloat(document.getElementById('input-mortgageOwing').value) || 0;
  const otherDebts = parseFloat(document.getElementById('input-otherDebts').value) || 0;
  const existingCover = parseFloat(document.getElementById('input-existingCover').value) || 0;
  const yearsOfSupport = parseFloat(document.getElementById('input-yearsOfSupport').value) || 10;
  const hasPartnerIncome = document.getElementById('input-hasPartnerIncome').checked;
  const partnerIncome = hasPartnerIncome ? (parseFloat(document.getElementById('input-partnerIncome').value) || 0) : 0;

  if (annualIncome <= 0) {
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter your annual income to calculate cover needs.</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }

  const fmt = (v) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  // Dependants
  let numDependants = 0;
  if (dependantsVal === '1') numDependants = 1;
  else if (dependantsVal === '2') numDependants = 2;
  else if (dependantsVal === '3') numDependants = 3;
  else if (dependantsVal === '4+') numDependants = 4;

  // Income replacement (discounted for partner income offset)
  const effectiveIncome = hasPartnerIncome ? Math.max(annualIncome - partnerIncome * 0.5, annualIncome * 0.5) : annualIncome;
  const incomeReplacement = effectiveIncome * yearsOfSupport;

  // Debt clearance
  const debtClearance = mortgageOwing + otherDebts;

  // Children's education fund ($50k per child)
  const educationFund = numDependants * 50000;

  // Funeral/estate costs
  const funeralCosts = 12500; // midpoint of $10k–$15k

  // Total recommended
  const totalRecommended = incomeReplacement + debtClearance + educationFund + funeralCosts;

  // Net recommended (minus existing cover)
  const netRecommended = Math.max(totalRecommended - existingCover, 0);

  // Cover adequacy
  const adequacy = existingCover >= totalRecommended
    ? 'Your existing cover appears sufficient based on these estimates.'
    : existingCover > 0
      ? `You may have a cover shortfall of ${fmt(netRecommended)}.`
      : `You currently have no existing cover recorded.`;

  const html = `
    <h4>Cover Component Breakdown</h4>
    <div class="result-row">
      <span class="result-label">Income replacement (${fmt(effectiveIncome)}/yr × ${yearsOfSupport} yrs)</span>
      <span class="result-value">${fmt(incomeReplacement)}</span>
    </div>
    ${hasPartnerIncome && partnerIncome > 0 ? `
    <div class="result-row">
      <span class="result-label">Partner income offset applied (50% of ${fmt(partnerIncome)}/yr)</span>
      <span class="result-value" style="color:#6b7280;">Reduced income basis</span>
    </div>` : ''}
    <div class="result-row">
      <span class="result-label">Debt clearance (mortgage + other debts)</span>
      <span class="result-value">${fmt(debtClearance)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Children's education fund (${numDependants} × $50,000)</span>
      <span class="result-value">${fmt(educationFund)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Funeral &amp; estate costs (estimate)</span>
      <span class="result-value">${fmt(funeralCosts)}</span>
    </div>
    <hr>
    <div class="result-row font-bold">
      <span class="result-label">Total Recommended Cover</span>
      <span class="result-value">${fmt(totalRecommended)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Less: existing cover</span>
      <span class="result-value">−${fmt(existingCover)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Suggested Additional Cover Needed</span>
      <span class="result-value">${fmt(netRecommended)}</span>
    </div>
    <hr>
    <h4>Your Situation</h4>
    <div class="result-row">
      <span class="result-label">Age</span>
      <span class="result-value">${age}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Dependants</span>
      <span class="result-value">${dependantsVal === '0' ? 'None' : dependantsVal}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Cover adequacy</span>
      <span class="result-value">${adequacy}</span>
    </div>
    <hr>
    <p class="text-sm text-gray-500 mt-2">
      <strong>Important:</strong> These figures are a general guide only. As a rule of thumb, life insurance needs typically decrease as you age, pay down debts, and your children become financially independent. Superannuation funds often include default life cover — check your super statement. Speak with a licensed financial adviser for a personalised recommendation.
    </p>
  `;

  document.getElementById('results-content').innerHTML = html;
  document.getElementById('calc-results').classList.remove('hidden');
}
