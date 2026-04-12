function calculate() {
  const state = (document.getElementById('input-state').value || '').toUpperCase();
  const householdSize = document.getElementById('input-household').value;
  const tariffRate = parseFloat(document.getElementById('input-tariff').value) || 0;

  // Average daily usage (kWh) by household size - indicative Australian averages
  const usageBySize = { '1': 8, '2': 14, '3': 18, '4': 22, '5+': 28 };
  const dailyUsage = usageBySize[householdSize] || 18;

  // Default supply charge by state (cents/day) - indicative
  const supplyCharges = {
    'nsw': 110, 'vic': 105, 'qld': 100, 'sa': 120,
    'wa': 95, 'tas': 100, 'nt': 90, 'act': 95
  };
  const dailySupply = (supplyCharges[state] || 100) / 100; // convert cents to dollars

  // Use provided tariff or default by state
  const tariff = tariffRate > 0 ? tariffRate : 30; // cents per kWh
  const tariffDollars = tariff / 100;

  const daysInQuarter = 91;
  const quarterlyUsageCost = dailyUsage * tariffDollars * daysInQuarter;
  const quarterlySupplyCost = dailySupply * daysInQuarter;
  const quarterlyTotal = quarterlyUsageCost + quarterlySupplyCost;
  const annualEstimate = quarterlyTotal * 4;
  const dailyCost = quarterlyTotal / daysInQuarter;

  const stateNames = {
    'nsw': 'New South Wales', 'vic': 'Victoria', 'qld': 'Queensland',
    'sa': 'South Australia', 'wa': 'Western Australia', 'tas': 'Tasmania',
    'nt': 'Northern Territory', 'act': 'ACT'
  };

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">State</span><span class="result-value">${stateNames[state] || state}</span></div>
    <div class="result-row"><span class="result-label">Household Size</span><span class="result-value">${householdSize} ${householdSize === '1' ? 'person' : 'people'}</span></div>
    <div class="result-row"><span class="result-label">Estimated Daily Usage</span><span class="result-value">${dailyUsage} kWh/day</span></div>
    <div class="result-row"><span class="result-label">Tariff Rate</span><span class="result-value">${tariff.toFixed(1)}c/kWh</span></div>
    <div class="result-row"><span class="result-label">Daily Supply Charge</span><span class="result-value">${fmt(dailySupply)}/day</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Quarterly Usage Cost</span><span class="result-value">${fmt(quarterlyUsageCost)}</span></div>
    <div class="result-row"><span class="result-label">Quarterly Supply Cost</span><span class="result-value">${fmt(quarterlySupplyCost)}</span></div>
    <div class="result-row highlight"><span class="result-label">Estimated Quarterly Bill</span><span class="result-value">${fmt(quarterlyTotal)}</span></div>
    <div class="result-row"><span class="result-label">Daily Cost</span><span class="result-value">${fmt(dailyCost)}/day</span></div>
    <div class="result-row"><span class="result-label">Annual Estimate</span><span class="result-value">${fmt(annualEstimate)}</span></div>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getTLDR() {
  const state = (document.getElementById('input-state').value || '').toLowerCase();
  const householdSize = document.getElementById('input-household').value;
  const tariffRate = parseFloat(document.getElementById('input-tariff').value) || 0;
  if (!householdSize) return '';
  const usageBySize = { '1': 8, '2': 14, '3': 18, '4': 22, '5+': 28 };
  const dailyUsage = usageBySize[householdSize] || 18;
  const supplyCharges = { nsw: 110, vic: 105, qld: 100, sa: 120, wa: 95, tas: 100, nt: 90, act: 95 };
  const dailySupply = (supplyCharges[state] || 100) / 100;
  const tariff = tariffRate > 0 ? tariffRate : 30;
  const quarterlyTotal = (dailyUsage * (tariff / 100) * 91) + (dailySupply * 91);
  const annualEstimate = quarterlyTotal * 4;
  return 'A ' + householdSize + '-person household in ' + (state.toUpperCase() || 'your state') + ' can expect a quarterly electricity bill of roughly ' + fmt(quarterlyTotal) + ' (' + fmt(annualEstimate) + '/year), based on ' + dailyUsage + ' kWh/day at ' + tariff + 'c/kWh.';
}
