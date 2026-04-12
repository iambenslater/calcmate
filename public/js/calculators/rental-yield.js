function calculate() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  const weeklyRent = parseFloat(document.getElementById('input-weeklyRent').value) || 0;
  const annualExpenses = parseFloat(document.getElementById('input-annualExpenses').value) || 0;

  const annualRent = weeklyRent * 52;
  const grossYield = propertyValue > 0 ? (annualRent / propertyValue) * 100 : 0;

  const netIncome = annualRent - annualExpenses;
  const netYield = propertyValue > 0 ? (netIncome / propertyValue) * 100 : 0;

  // Typical expense breakdown estimate
  const managementFee = annualRent * 0.08; // ~8% of rent
  const insurance = 1500;
  const councilRates = 1800;
  const waterRates = 1000;
  const maintenance = propertyValue * 0.005; // ~0.5% of value
  const typicalExpenses = managementFee + insurance + councilRates + waterRates + maintenance;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Property Value</span><span class="result-value">${fmt(propertyValue)}</span></div>
    <div class="result-row"><span class="result-label">Weekly Rent</span><span class="result-value">${fmt(weeklyRent)}/wk</span></div>
    <div class="result-row"><span class="result-label">Annual Rent</span><span class="result-value">${fmt(annualRent)}/yr</span></div>
    <div class="result-row highlight"><span class="result-label">Gross Yield</span><span class="result-value">${grossYield.toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Annual Expenses</span><span class="result-value">${fmt(annualExpenses)}</span></div>
    <div class="result-row"><span class="result-label">Net Annual Income</span><span class="result-value">${fmt(netIncome)}</span></div>
    <div class="result-row highlight"><span class="result-label">Net Yield</span><span class="result-value">${netYield.toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Monthly Net Income</span><span class="result-value">${fmt(netIncome / 12)}</span></div>
    <p class="result-note"><strong>Typical expense guide:</strong> Management ~${fmt(managementFee)}, Insurance ~${fmt(insurance)}, Council ~${fmt(councilRates)}, Water ~${fmt(waterRates)}, Maintenance ~${fmt(maintenance)} = ~${fmt(typicalExpenses)}/yr total</p>
    <p class="result-note">A gross yield above 5% is generally considered good in Australian capital cities. Net yield accounts for holding costs but not loan repayments or tax.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', {minimumFractionDigits:2, maximumFractionDigits:2}); }

function getTLDR() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  const weeklyRent = parseFloat(document.getElementById('input-weeklyRent').value) || 0;
  const annualExpenses = parseFloat(document.getElementById('input-annualExpenses').value) || 0;

  if (propertyValue <= 0 || weeklyRent <= 0) return '';

  const annualRent = weeklyRent * 52;
  const grossYield = (annualRent / propertyValue) * 100;
  const netIncome = annualRent - annualExpenses;
  const netYield = (netIncome / propertyValue) * 100;

  return 'Your ' + fmt(propertyValue) + ' property returning ' + fmt(weeklyRent) + '/week has a gross yield of ' + grossYield.toFixed(2) + '% and a net yield of ' + netYield.toFixed(2) + '% after expenses, generating ' + fmt(netIncome) + '/year net.';
}
