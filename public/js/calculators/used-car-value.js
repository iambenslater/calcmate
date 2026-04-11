function calculate() {
  const purchasePrice = parseFloat(document.getElementById('input-purchasePrice').value) || 0;
  const yearManufactured = parseInt(document.getElementById('input-yearManufactured').value) || 0;
  const kilometres = parseFloat(document.getElementById('input-kilometres').value) || 0;
  const condition = document.getElementById('input-condition').value;

  if (purchasePrice <= 0 || yearManufactured <= 0) {
    alert('Please enter valid values.');
    return;
  }

  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - yearManufactured);

  // Depreciation by age (approximate annual rates)
  // Year 1: 20%, Year 2: 15%, Year 3: 12%, Years 4-5: 10%, Years 6-10: 7%, 10+: 4%
  let depreciatedValue = purchasePrice;
  for (let y = 1; y <= age; y++) {
    let rate;
    if (y === 1) rate = 0.20;
    else if (y === 2) rate = 0.15;
    else if (y === 3) rate = 0.12;
    else if (y <= 5) rate = 0.10;
    else if (y <= 10) rate = 0.07;
    else rate = 0.04;
    depreciatedValue *= (1 - rate);
  }

  // Kilometre adjustment: average 15,000 km/year
  const expectedKm = age * 15000;
  const kmDiff = kilometres - expectedKm;
  let kmAdjustment = 1.0;
  if (kmDiff > 0) {
    // Higher than average km — reduce value
    kmAdjustment = Math.max(0.7, 1 - (kmDiff / 200000));
  } else if (kmDiff < 0) {
    // Lower than average km — increase value
    kmAdjustment = Math.min(1.15, 1 + (Math.abs(kmDiff) / 300000));
  }

  // Condition multiplier
  const conditionMultipliers = {
    excellent: 1.10,
    good: 1.00,
    fair: 0.85,
    poor: 0.65
  };
  const condMulti = conditionMultipliers[condition] || 1.0;

  const estimatedValue = Math.max(500, depreciatedValue * kmAdjustment * condMulti);
  const totalDepreciation = purchasePrice - estimatedValue;
  const depreciationPercent = (totalDepreciation / purchasePrice) * 100;

  const conditionLabel = condition.charAt(0).toUpperCase() + condition.slice(1);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Estimated Current Value</span><span class="result-value">${fmt(estimatedValue)}</span></div>
    <div class="result-row"><span class="result-label">Original Purchase Price</span><span class="result-value">${fmt(purchasePrice)}</span></div>
    <div class="result-row"><span class="result-label">Total Depreciation</span><span class="result-value">${fmt(totalDepreciation)}</span></div>
    <div class="result-row"><span class="result-label">Depreciation</span><span class="result-value">${depreciationPercent.toFixed(1)}%</span></div>
    <div class="result-row"><span class="result-label">Vehicle Age</span><span class="result-value">${age} year${age !== 1 ? 's' : ''}</span></div>
    <div class="result-row"><span class="result-label">Kilometres</span><span class="result-value">${kilometres.toLocaleString('en-AU')} km</span></div>
    <div class="result-row"><span class="result-label">Expected Km for Age</span><span class="result-value">${expectedKm.toLocaleString('en-AU')} km</span></div>
    <div class="result-row"><span class="result-label">Km Adjustment</span><span class="result-value">${kmDiff > 0 ? 'Above' : 'Below'} average (${((kmAdjustment - 1) * 100).toFixed(1)}%)</span></div>
    <div class="result-row"><span class="result-label">Condition</span><span class="result-value">${conditionLabel}</span></div>
    <p class="text-sm text-gray-500 mt-4">This is a simplified depreciation model. Actual market value depends on make, model, demand, service history, and local market conditions. Use services like RedBook or CarsGuide for more accurate valuations.</p>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
