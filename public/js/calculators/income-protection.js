function calculate() {
  const annualIncome = parseFloat(document.getElementById('input-annualIncome').value) || 0;
  const coverPercentage = document.querySelector('input[name="input-coverPercentage"]:checked').value;
  const waitingPeriod = document.getElementById('input-waitingPeriod').value;
  const benefitPeriod = document.getElementById('input-benefitPeriod').value;
  const age = parseFloat(document.getElementById('input-age').value) || 35;
  const smoker = document.querySelector('input[name="input-smoker"]:checked').value;
  const occupation = document.getElementById('input-occupation').value;

  if (annualIncome <= 0) {
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter your annual income to calculate income protection details.</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }

  const fmt = (v) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  const fmtDec = (v, d = 2) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

  // Cover percentage
  const coverPct = coverPercentage === '85%' ? 0.85 : 0.75;

  // Monthly benefit
  const monthlyBenefit = (annualIncome * coverPct) / 12;
  const annualBenefit = annualIncome * coverPct;

  // Base premium rate: professional non-smoker at age 30 = ~1.5% of income
  // Increases ~0.1% per year of age from age 30
  const ageAdjustment = Math.max(age - 30, 0) * 0.001; // 0.1% per year over 30
  let basePremiumRate = 0.015 + ageAdjustment;

  // Occupation loading
  let occupationMultiplier = 1.0;
  let occupationLabel = '';
  if (occupation === 'professional') {
    occupationMultiplier = 1.0;
    occupationLabel = 'Professional (office-based)';
  } else if (occupation === 'white-collar') {
    occupationMultiplier = 1.2;
    occupationLabel = 'White collar (office/admin)';
  } else if (occupation === 'light-manual') {
    occupationMultiplier = 1.5;
    occupationLabel = 'Light manual';
  } else if (occupation === 'heavy-manual') {
    occupationMultiplier = 2.0;
    occupationLabel = 'Heavy manual / trades';
  }

  // Smoker loading
  const smokerMultiplier = smoker === 'yes' ? 1.5 : 1.0;

  // Cover percentage loading (85% cover costs ~15% more than 75%)
  const coverMultiplier = coverPct === 0.85 ? 1.15 : 1.0;

  // Waiting period discount (longer wait = lower premium)
  let waitingDiscount = 1.0;
  let waitingLabel = '';
  if (waitingPeriod === '14days') {
    waitingDiscount = 1.25;
    waitingLabel = '14 days';
  } else if (waitingPeriod === '30days') {
    waitingDiscount = 1.0;
    waitingLabel = '30 days';
  } else if (waitingPeriod === '60days') {
    waitingDiscount = 0.85;
    waitingLabel = '60 days';
  } else if (waitingPeriod === '90days') {
    waitingDiscount = 0.75;
    waitingLabel = '90 days';
  }

  // Benefit period loading
  let benefitMultiplier = 1.0;
  let benefitLabel = '';
  let totalBenefitMonths = 0;
  if (benefitPeriod === '2years') {
    benefitMultiplier = 1.0;
    benefitLabel = '2 years';
    totalBenefitMonths = 24;
  } else if (benefitPeriod === '5years') {
    benefitMultiplier = 1.4;
    benefitLabel = '5 years';
    totalBenefitMonths = 60;
  } else if (benefitPeriod === 'to-65') {
    benefitMultiplier = 2.2;
    benefitLabel = 'To age 65';
    totalBenefitMonths = Math.max((65 - age) * 12, 0);
  }

  // Final annual premium estimate
  const finalPremiumRate = basePremiumRate * occupationMultiplier * smokerMultiplier * coverMultiplier * waitingDiscount * benefitMultiplier;
  const annualPremium = annualIncome * finalPremiumRate;
  const monthlyPremium = annualPremium / 12;

  // Total potential benefit
  const totalPotentialBenefit = monthlyBenefit * totalBenefitMonths;

  // Cost vs benefit ratio (total premiums over benefit period vs total payout)
  const premiumsOverBenefitPeriod = annualPremium * (totalBenefitMonths / 12);
  const ratio = totalBenefitMonths > 0 ? (totalPotentialBenefit / premiumsOverBenefitPeriod).toFixed(1) : 'N/A';

  // Break-even (how many months of claims to recoup all premiums over that period)
  const monthsToBreakEven = monthlyBenefit > 0 ? Math.ceil(premiumsOverBenefitPeriod / monthlyBenefit) : 0;

  // Waiting period context
  let waitingContext = '';
  if (waitingPeriod === '14days') {
    waitingContext = 'Highest premium — suitable if you have little sick leave or savings buffer.';
  } else if (waitingPeriod === '30days') {
    waitingContext = 'Balanced option — allow for 4+ weeks of sick leave or emergency savings.';
  } else if (waitingPeriod === '60days') {
    waitingContext = 'Lower premium — suitable if you have 2+ months of sick leave or savings.';
  } else if (waitingPeriod === '90days') {
    waitingContext = 'Lowest premium — only suitable if you have 3+ months of financial runway.';
  }

  const html = `
    <h4>Your Monthly Benefit</h4>
    <div class="result-row font-bold">
      <span class="result-label">Monthly benefit if unable to work</span>
      <span class="result-value">${fmt(monthlyBenefit)}/month</span>
    </div>
    <div class="result-row">
      <span class="result-label">Annual benefit (${coverPercentage} of income)</span>
      <span class="result-value">${fmt(annualBenefit)}/year</span>
    </div>
    <div class="result-row">
      <span class="result-label">Waiting period before payments start</span>
      <span class="result-value">${waitingLabel}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Benefit period</span>
      <span class="result-value">${benefitLabel}</span>
    </div>
    <hr>
    <h4>Estimated Premium (Indicative Only)</h4>
    <div class="result-row font-bold">
      <span class="result-label">Estimated annual premium</span>
      <span class="result-value">${fmt(annualPremium)}/year</span>
    </div>
    <div class="result-row">
      <span class="result-label">Estimated monthly premium</span>
      <span class="result-value">${fmt(monthlyPremium)}/month</span>
    </div>
    <div class="result-row">
      <span class="result-label">Premium as % of income</span>
      <span class="result-value">${(finalPremiumRate * 100).toFixed(2)}%</span>
    </div>
    <hr>
    <h4>Premium Factors Applied</h4>
    <div class="result-row">
      <span class="result-label">Occupation</span>
      <span class="result-value">${occupationLabel}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Smoker status</span>
      <span class="result-value">${smoker === 'yes' ? 'Smoker (+50% loading)' : 'Non-smoker'}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Cover level</span>
      <span class="result-value">${coverPercentage}${coverPct === 0.85 ? ' (+15% loading)' : ''}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Waiting period</span>
      <span class="result-value">${waitingLabel} — ${waitingContext}</span>
    </div>
    <hr>
    <h4>Cover Value Over Benefit Period</h4>
    <div class="result-row">
      <span class="result-label">Maximum total benefit payout (${benefitLabel})</span>
      <span class="result-value">${fmt(totalPotentialBenefit)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Total premiums over same period</span>
      <span class="result-value">${fmt(premiumsOverBenefitPeriod)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Benefit-to-premium ratio</span>
      <span class="result-value">${ratio}× payout vs cost</span>
    </div>
    <div class="result-row">
      <span class="result-label">Months of claims to break even on premiums</span>
      <span class="result-value">${monthsToBreakEven} months</span>
    </div>
    <hr>
    <p class="text-sm text-gray-500 mt-2">
      <strong>Important:</strong> These premium estimates are indicative only and are based on general industry approximations. Actual premiums vary significantly by insurer, your specific health history, occupation classification, policy features (stepped vs. level premiums), and definitions of disability. Income protection premiums are generally tax-deductible in Australia when held outside superannuation. Speak with a licensed financial adviser or use an insurance comparison service such as Canstar or iSelect for accurate quotes.
    </p>
  `;

  document.getElementById('results-content').innerHTML = html;
  document.getElementById('calc-results').classList.remove('hidden');
}

function getTLDR() {
  const annualIncome = parseFloat(document.getElementById('input-annualIncome').value) || 0;
  if (annualIncome <= 0) return '';
  const coverPercentage = document.querySelector('input[name="input-coverPercentage"]:checked').value;
  const waitingPeriod = document.getElementById('input-waitingPeriod').value;
  const benefitPeriod = document.getElementById('input-benefitPeriod').value;
  const age = parseFloat(document.getElementById('input-age').value) || 35;
  const smoker = document.querySelector('input[name="input-smoker"]:checked').value;
  const occupation = document.getElementById('input-occupation').value;
  const fmt = (v) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  const coverPct = coverPercentage === '85%' ? 0.85 : 0.75;
  const monthlyBenefit = (annualIncome * coverPct) / 12;
  const ageAdjustment = Math.max(age - 30, 0) * 0.001;
  let basePremiumRate = 0.015 + ageAdjustment;
  const occupationMultiplier = occupation === 'professional' ? 1.0 : occupation === 'white-collar' ? 1.2 : occupation === 'light-manual' ? 1.5 : 2.0;
  const smokerMultiplier = smoker === 'yes' ? 1.5 : 1.0;
  const coverMultiplier = coverPct === 0.85 ? 1.15 : 1.0;
  const waitingDiscount = waitingPeriod === '14days' ? 1.25 : waitingPeriod === '30days' ? 1.0 : waitingPeriod === '60days' ? 0.85 : 0.75;
  const benefitMultiplier = benefitPeriod === '2years' ? 1.0 : benefitPeriod === '5years' ? 1.4 : 2.2;
  const waitingLabel = waitingPeriod === '14days' ? '14 days' : waitingPeriod === '30days' ? '30 days' : waitingPeriod === '60days' ? '60 days' : '90 days';
  const benefitLabel = benefitPeriod === '2years' ? '2 years' : benefitPeriod === '5years' ? '5 years' : 'to age 65';
  const finalPremiumRate = basePremiumRate * occupationMultiplier * smokerMultiplier * coverMultiplier * waitingDiscount * benefitMultiplier;
  const annualPremium = annualIncome * finalPremiumRate;
  const monthlyPremium = annualPremium / 12;
  return 'If you can\'t work, this policy would pay you ' + fmt(monthlyBenefit) + '/month (' + coverPercentage + ' of income) after a ' + waitingLabel + ' wait, for ' + benefitLabel + ' — at an estimated cost of ' + fmt(monthlyPremium) + '/month (' + fmt(annualPremium) + '/year).';
}
