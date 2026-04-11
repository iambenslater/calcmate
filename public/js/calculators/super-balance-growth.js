function calculate() {
  const currentBalance = parseFloat(document.getElementById('input-currentBalance').value) || 0;
  const annualSalary = parseFloat(document.getElementById('input-annualSalary').value) || 0;
  const superRate = (parseFloat(document.getElementById('input-superRate').value) || 12) / 100;
  const investmentReturn = (parseFloat(document.getElementById('input-investmentReturn').value) || 0) / 100;
  const currentAge = parseInt(document.getElementById('input-currentAge').value) || 30;
  const retirementAge = parseInt(document.getElementById('input-retireAge').value) || 67;

  const annualContribution = annualSalary * superRate;
  const years = Math.max(0, retirementAge - currentAge);
  let balance = currentBalance;
  let milestones = '';

  for (let y = 1; y <= years; y++) {
    balance = (balance + annualContribution) * (1 + investmentReturn);
    const age = currentAge + y;
    if (y === 1 || y === 5 || y === 10 || y === 15 || y === 20 || y === 25 || y === 30 || y === years) {
      milestones += `<div class="result-row"><span class="result-label">Age ${age} (Year ${y})</span><span class="result-value">${fmt(balance)}</span></div>`;
    }
  }

  const totalContributions = annualContribution * years;
  const totalGrowth = balance - currentBalance - totalContributions;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Current Balance</span><span class="result-value">${fmt(currentBalance)}</span></div>
    <div class="result-row"><span class="result-label">Years to Retirement</span><span class="result-value">${years} years</span></div>
    <div class="result-row"><span class="result-label">Total Contributions</span><span class="result-value">${fmt(totalContributions)}</span></div>
    <div class="result-row"><span class="result-label">Investment Growth</span><span class="result-value">${fmt(totalGrowth)}</span></div>
    <div class="result-row highlight"><span class="result-label">Projected Balance at ${retirementAge}</span><span class="result-value">${fmt(balance)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Growth Milestones</span><span class="result-value"></span></div>
    ${milestones}
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
