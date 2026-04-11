function calculate() {
  const annualSalary = parseFloat(document.getElementById('input-annualSalary').value) || 0;
  const hoursPerWeek = parseFloat(document.getElementById('input-hoursPerWeek').value) || 38;
  const weeksPerYear = parseFloat(document.getElementById('input-weeksPerYear').value) || 52;

  if (annualSalary <= 0) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid annual salary.</p>'; return; }
  if (hoursPerWeek <= 0 || weeksPerYear <= 0) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter valid hours and weeks.</p>'; return; }

  const totalHoursPerYear = hoursPerWeek * weeksPerYear;
  const hourlyRate = annualSalary / totalHoursPerYear;
  const dailyRate = hourlyRate * (hoursPerWeek / 5);
  const weeklyRate = annualSalary / weeksPerYear;
  const fortnightlyRate = weeklyRate * 2;
  const monthlyRate = annualSalary / 12;

  // Super on top
  const superRate = 0.12; // 12% from 1 July 2025
  const superAmount = annualSalary * superRate;
  const totalPackage = annualSalary + superAmount;
  const hourlyRateIncSuper = totalPackage / totalHoursPerYear;

  // Reverse calculations at different hourly rates for reference
  const refRates = [25, 35, 50, 75, 100].filter(r => Math.abs(r - hourlyRate) > 5);
  let refRows = '';
  for (const r of refRates.slice(0, 4)) {
    const refAnnual = r * totalHoursPerYear;
    refRows += `<div class="result-row"><span class="result-label">${fmt(r)}/hr</span><span class="result-value">${fmt(refAnnual)}/year</span></div>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Hourly Rate</span><span class="result-value">${fmt(hourlyRate)}</span></div>
    <div class="result-row"><span class="result-label">Daily Rate</span><span class="result-value">${fmt(dailyRate)}</span></div>
    <div class="result-row"><span class="result-label">Weekly Rate</span><span class="result-value">${fmt(weeklyRate)}</span></div>
    <div class="result-row"><span class="result-label">Fortnightly Rate</span><span class="result-value">${fmt(fortnightlyRate)}</span></div>
    <div class="result-row"><span class="result-label">Monthly Rate</span><span class="result-value">${fmt(monthlyRate)}</span></div>
    <div class="result-row"><span class="result-label">Annual Salary</span><span class="result-value">${fmt(annualSalary)}</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>Including Superannuation (12%)</strong>
    </div>
    <div class="result-row"><span class="result-label">Super Contribution</span><span class="result-value">${fmt(superAmount)}/year</span></div>
    <div class="result-row"><span class="result-label">Total Package</span><span class="result-value">${fmt(totalPackage)}/year</span></div>
    <div class="result-row"><span class="result-label">Hourly (inc. super)</span><span class="result-value">${fmt(hourlyRateIncSuper)}</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>Working Assumptions</strong>
    </div>
    <div class="result-row"><span class="result-label">Hours per Week</span><span class="result-value">${hoursPerWeek}</span></div>
    <div class="result-row"><span class="result-label">Weeks per Year</span><span class="result-value">${weeksPerYear}</span></div>
    <div class="result-row"><span class="result-label">Total Hours/Year</span><span class="result-value">${totalHoursPerYear.toLocaleString('en-AU')}</span></div>
    ${refRows ? `<div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;"><strong>Rate Comparison</strong></div>${refRows}` : ''}
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
