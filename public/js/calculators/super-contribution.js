function calculate() {
  const salary = parseFloat(document.getElementById('input-annualSalary').value) || 0;
  const superRate = (parseFloat(document.getElementById('input-superRate').value) || 12) / 100;
  const salarySacrifice = parseFloat(document.getElementById('input-salarySacrifice').value) || 0;

  const concessionalCap = 30000;
  const employerSuper = salary * superRate;
  const totalConcessional = employerSuper + salarySacrifice;
  const overCap = Math.max(0, totalConcessional - concessionalCap);

  // Tax comparison
  const annualSacrifice = salarySacrifice;
  // Super contributions taxed at 15%
  const superTax = Math.min(annualSacrifice, concessionalCap - employerSuper) * 0.15;

  // Estimate marginal tax rate
  let marginalRate = 0;
  if (salary > 190000) marginalRate = 0.45;
  else if (salary > 135000) marginalRate = 0.37;
  else if (salary > 45000) marginalRate = 0.30;
  else if (salary > 18200) marginalRate = 0.16;

  const incomeTaxSaved = annualSacrifice * marginalRate;
  const netTaxSaving = incomeTaxSaved - superTax;
  const takeHomReduction = annualSacrifice * (1 - marginalRate);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Gross Salary</span><span class="result-value">${fmt(salary)}</span></div>
    <div class="result-row"><span class="result-label">Employer Super (${(superRate * 100).toFixed(1)}%)</span><span class="result-value">${fmt(employerSuper)}</span></div>
    <div class="result-row"><span class="result-label">Salary Sacrifice</span><span class="result-value">${fmt(annualSacrifice)}</span></div>
    <div class="result-row"><span class="result-label">Total Concessional Contributions</span><span class="result-value">${fmt(totalConcessional)}</span></div>
    <div class="result-row"><span class="result-label">Concessional Cap</span><span class="result-value">${fmt(concessionalCap)}</span></div>
    ${overCap > 0 ? `<div class="result-row" style="color:var(--error)"><span class="result-label">Over Cap (taxed at marginal rate)</span><span class="result-value">${fmt(overCap)}</span></div>` : ''}
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Estimated Marginal Tax Rate</span><span class="result-value">${(marginalRate * 100).toFixed(0)}%</span></div>
    <div class="result-row"><span class="result-label">Income Tax Saved</span><span class="result-value">${fmt(incomeTaxSaved)}</span></div>
    <div class="result-row"><span class="result-label">Super Tax on Sacrifice (15%)</span><span class="result-value">${fmt(superTax)}</span></div>
    <div class="result-row highlight"><span class="result-label">Net Tax Saving per Year</span><span class="result-value">${fmt(netTaxSaving)}</span></div>
    <div class="result-row"><span class="result-label">Take-home Reduction per Year</span><span class="result-value">${fmt(takeHomReduction)}</span></div>
    <div class="result-row"><span class="result-label">Take-home Reduction per Fortnight</span><span class="result-value">${fmt(takeHomReduction / 26)}</span></div>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getTLDR() {
  const salary = parseFloat(document.getElementById('input-annualSalary').value) || 0;
  const superRate = (parseFloat(document.getElementById('input-superRate').value) || 12) / 100;
  const salarySacrifice = parseFloat(document.getElementById('input-salarySacrifice').value) || 0;
  if (salary <= 0) return '';

  const employerSuper = salary * superRate;
  const totalConcessional = employerSuper + salarySacrifice;
  const concessionalCap = 30000;
  const overCap = Math.max(0, totalConcessional - concessionalCap);

  let marginalRate = 0;
  if (salary > 190000) marginalRate = 0.45;
  else if (salary > 135000) marginalRate = 0.37;
  else if (salary > 45000) marginalRate = 0.30;
  else if (salary > 18200) marginalRate = 0.16;

  const superTax = Math.min(salarySacrifice, concessionalCap - employerSuper) * 0.15;
  const netTaxSaving = salarySacrifice * marginalRate - superTax;

  if (salarySacrifice <= 0) return 'Your employer contributes ' + fmt(employerSuper) + '/year in super (at ' + (superRate * 100).toFixed(1) + '%), leaving ' + fmt(Math.max(0, concessionalCap - employerSuper)) + ' of your annual concessional cap available for salary sacrifice.';

  return 'Salary sacrificing ' + fmt(salarySacrifice) + '/year saves you ' + fmt(netTaxSaving) + ' in tax' + (overCap > 0 ? ' — but you\'re ' + fmt(overCap) + ' over the ' + fmt(concessionalCap) + ' concessional cap, so the excess will be taxed at your marginal rate' : '') + '.';
}
