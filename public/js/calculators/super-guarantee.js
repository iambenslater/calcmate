function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const grossSalary = parseFloat(document.getElementById('input-grossSalary').value) || 0;
  const payFrequency = document.getElementById('input-payFrequency').value || 'annual';

  const multipliers = { annual: 1, monthly: 12, fortnightly: 26, weekly: 52 };
  const labels = { annual: 'Year', monthly: 'Month', fortnightly: 'Fortnight', weekly: 'Week' };
  const multiplier = multipliers[payFrequency] || 1;

  const annualGross = grossSalary * multiplier;

  // Super guarantee rate 2025-26: 11.5%
  const sgRate = 0.115;
  const annualSuper = annualGross * sgRate;

  // Maximum super contribution base (quarterly) for 2025-26: ~$62,270/quarter
  const quarterlyMaxBase = 62270;
  const annualMaxBase = quarterlyMaxBase * 4;
  const cappedSuper = Math.min(annualSuper, annualMaxBase * sgRate);
  const isAboveCap = annualGross > annualMaxBase;

  // Concessional contributions cap: $30,000/year
  const concessionalCap = 30000;
  const remainingCap = Math.max(0, concessionalCap - annualSuper);

  // Future rates
  const futureRates = [
    { year: '2025-26', rate: '11.5%' },
    { year: '2026-27', rate: '12.0%' },
    { year: '2027-28+', rate: '12.0% (legislated max)' }
  ];

  let futureRows = futureRates.map(r =>
    `<tr><td class="px-3 py-1">${r.year}</td><td class="px-3 py-1 text-right">${r.rate}</td></tr>`
  ).join('');

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Ordinary Time Earnings</span><span class="result-value">${formatCurrency(annualGross)} /year</span></div>
    <div class="result-row"><span class="result-label">SG Rate (2025-26)</span><span class="result-value">11.5%</span></div>
    <hr class="my-2">
    <div class="result-row font-bold"><span class="result-label">Annual Super Guarantee</span><span class="result-value">${formatCurrency(annualSuper)}</span></div>
    <div class="result-row"><span class="result-label">Per Quarter</span><span class="result-value">${formatCurrency(annualSuper / 4)}</span></div>
    <div class="result-row"><span class="result-label">Per ${labels[payFrequency]}</span><span class="result-value">${formatCurrency(annualSuper / multiplier)}</span></div>
    ${isAboveCap ? `
      <hr class="my-2">
      <p class="text-sm text-amber-600">Your salary exceeds the maximum super contribution base (${formatCurrency(annualMaxBase)}/year). Your employer is only required to pay SG on the capped amount: ${formatCurrency(cappedSuper)}/year.</p>
    ` : ''}
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Concessional Cap (2025-26)</span><span class="result-value">${formatCurrency(concessionalCap)}</span></div>
    <div class="result-row"><span class="result-label">Remaining Cap for Salary Sacrifice</span><span class="result-value">${formatCurrency(remainingCap)}</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-2">SG Rate Schedule</h4>
    <table class="w-full text-sm">
      <thead><tr class="border-b"><th class="px-3 py-1 text-left">Financial Year</th><th class="px-3 py-1 text-right">Rate</th></tr></thead>
      <tbody>${futureRows}</tbody>
    </table>
  `;
}
