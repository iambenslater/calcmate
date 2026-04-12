function calculate() {
  const principal = parseFloat(document.getElementById('input-principal').value) || 0;
  const annualRate = (parseFloat(document.getElementById('input-rate').value) || 0) / 100;
  const frequency = document.getElementById('input-compounding').value;
  const years = parseFloat(document.getElementById('input-years').value) || 0;
  const monthlyContribution = parseFloat(document.getElementById('input-contribution').value) || 0;

  const freqMap = { 'daily': 365, 'monthly': 12, 'quarterly': 4, 'annually': 1 };
  const n = freqMap[frequency] || 12;

  // A = P(1 + r/n)^(nt)
  const compoundAmount = principal * Math.pow(1 + annualRate / n, n * years);

  // Future value of monthly contributions (series)
  const periodsTotal = n * years;
  const ratePerPeriod = annualRate / n;
  const contributionPerPeriod = monthlyContribution * (12 / n);
  const fvContributions = ratePerPeriod > 0
    ? contributionPerPeriod * ((Math.pow(1 + ratePerPeriod, periodsTotal) - 1) / ratePerPeriod)
    : contributionPerPeriod * periodsTotal;

  const totalValue = compoundAmount + fvContributions;
  const totalContributions = principal + (monthlyContribution * 12 * years);
  const totalInterest = totalValue - totalContributions;

  const freqLabel = frequency.charAt(0).toUpperCase() + frequency.slice(1);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Principal</span><span class="result-value">${fmt(principal)}</span></div>
    <div class="result-row"><span class="result-label">Annual Rate</span><span class="result-value">${(annualRate * 100).toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Compounding</span><span class="result-value">${freqLabel} (${n}x per year)</span></div>
    <div class="result-row"><span class="result-label">Time Period</span><span class="result-value">${years} years</span></div>
    <div class="result-row"><span class="result-label">Monthly Contributions</span><span class="result-value">${fmt(monthlyContribution)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Total Contributions</span><span class="result-value">${fmt(totalContributions)}</span></div>
    <div class="result-row"><span class="result-label">Total Interest Earned</span><span class="result-value">${fmt(totalInterest)}</span></div>
    <div class="result-row highlight"><span class="result-label">Final Balance</span><span class="result-value">${fmt(totalValue)}</span></div>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getTLDR() {
  var principal = parseFloat(document.getElementById('input-principal').value) || 0;
  var annualRate = (parseFloat(document.getElementById('input-rate').value) || 0) / 100;
  var frequency = document.getElementById('input-compounding').value;
  var years = parseFloat(document.getElementById('input-years').value) || 0;
  var monthlyContribution = parseFloat(document.getElementById('input-contribution').value) || 0;
  var freqMap = { 'daily': 365, 'monthly': 12, 'quarterly': 4, 'annually': 1 };
  var n = freqMap[frequency] || 12;
  var compoundAmount = principal * Math.pow(1 + annualRate / n, n * years);
  var periodsTotal = n * years;
  var ratePerPeriod = annualRate / n;
  var contributionPerPeriod = monthlyContribution * (12 / n);
  var fvContributions = ratePerPeriod > 0 ? contributionPerPeriod * ((Math.pow(1 + ratePerPeriod, periodsTotal) - 1) / ratePerPeriod) : contributionPerPeriod * periodsTotal;
  var totalValue = compoundAmount + fvContributions;
  var totalContributions = principal + (monthlyContribution * 12 * years);
  var totalInterest = totalValue - totalContributions;
  return fmt(principal) + ' invested at ' + (annualRate * 100).toFixed(2) + '% p.a. (' + frequency + ' compounding)' + (monthlyContribution > 0 ? ' with ' + fmt(monthlyContribution) + '/month contributions' : '') + ' grows to ' + fmt(totalValue) + ' after ' + years + ' years — ' + fmt(totalInterest) + ' in interest on ' + fmt(totalContributions) + ' total contributions.';
}

