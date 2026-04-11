function calculate() {
  const currentAge = parseInt(document.getElementById('input-currentAge').value) || 30;
  const retirementAge = parseInt(document.getElementById('input-retireAge').value) || 67;
  const desiredIncome = parseFloat(document.getElementById('input-desiredIncome').value) || 0;
  const currentSuper = parseFloat(document.getElementById('input-superBalance').value) || 0;
  const otherSavings = parseFloat(document.getElementById('input-otherSavings').value) || 0;

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const retirementYears = Math.max(0, 90 - retirementAge); // plan to age 90
  const growthRate = 0.07; // 7% assumed growth
  const drawdownRate = 0.04; // 4% assumed drawdown return

  // Project super balance to retirement (no additional contributions for simplicity)
  const projectedSuper = currentSuper * Math.pow(1 + growthRate, yearsToRetirement);
  const projectedOther = otherSavings * Math.pow(1 + growthRate, yearsToRetirement);
  const totalProjected = projectedSuper + projectedOther;

  // How much do they need? (present value of annuity at retirement)
  const totalNeeded = desiredIncome > 0 && drawdownRate > 0
    ? desiredIncome * ((1 - Math.pow(1 + drawdownRate, -retirementYears)) / drawdownRate)
    : desiredIncome * retirementYears;

  const gap = totalNeeded - totalProjected;
  const onTrack = gap <= 0;

  // Approximate additional annual savings needed to close gap
  const annualSavingsNeeded = gap > 0 && yearsToRetirement > 0
    ? (gap / (((Math.pow(1 + growthRate, yearsToRetirement) - 1) / growthRate)))
    : 0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Years to Retirement</span><span class="result-value">${yearsToRetirement} years</span></div>
    <div class="result-row"><span class="result-label">Retirement Duration (to age 90)</span><span class="result-value">${retirementYears} years</span></div>
    <div class="result-row"><span class="result-label">Desired Annual Income</span><span class="result-value">${fmt(desiredIncome)}</span></div>
    <div class="result-row"><span class="result-label">Total Savings Needed</span><span class="result-value">${fmt(totalNeeded)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Projected Super at ${retirementAge}</span><span class="result-value">${fmt(projectedSuper)}</span></div>
    <div class="result-row"><span class="result-label">Projected Other Savings at ${retirementAge}</span><span class="result-value">${fmt(projectedOther)}</span></div>
    <div class="result-row highlight"><span class="result-label">Total Projected Savings</span><span class="result-value">${fmt(totalProjected)}</span></div>
    <div class="result-row ${onTrack ? 'highlight' : ''}" style="color:${onTrack ? 'var(--success)' : 'var(--error)'}"><span class="result-label">${onTrack ? 'Surplus' : 'Shortfall'}</span><span class="result-value">${fmt(Math.abs(gap))}</span></div>
    ${!onTrack ? `<div class="result-row"><span class="result-label">Extra Annual Savings Needed</span><span class="result-value">${fmt(annualSavingsNeeded)}/yr</span></div>` : ''}
    <p style="margin-top:12px;font-size:0.85rem;color:var(--text-muted)">Assumes 7% growth pre-retirement, 4% drawdown return, and planning to age 90.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
