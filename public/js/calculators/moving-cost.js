function calculate() {
  const bedrooms = document.getElementById('input-bedrooms').value;
  const floorLevel = document.getElementById('input-floorFrom').value;
  const needPacking = document.getElementById('input-packing').checked;
  const distanceKm = parseFloat(document.getElementById('input-distance').value) || 0;

  // Base cost by bedrooms (AU metro area estimates)
  const baseCosts = {
    '1': 400, '2': 600, '3': 900, '4': 1200, '5+': 1600
  };
  const baseCost = baseCosts[bedrooms] || 900;

  // Floor surcharge
  const floorSurcharges = {
    'ground': 0, '1st': 150, '2nd': 300, '3rd+': 500
  };
  const floorSurcharge = floorSurcharges[floorLevel] || 0;

  // Packing service
  const packingCost = needPacking ? (parseInt(bedrooms) || 3) * 200 : 0;

  // Distance surcharge: first 25km included, then ~$2-3/km
  const distanceSurcharge = distanceKm > 25 ? (distanceKm - 25) * 2.50 : 0;

  // Interstate surcharge for long distances
  const interstateSurcharge = distanceKm > 100 ? distanceKm * 1.50 : 0;

  const subtotal = baseCost + floorSurcharge + packingCost + distanceSurcharge + interstateSurcharge;

  // Insurance estimate (basic transit insurance ~$100-200)
  const insurance = 150;

  const total = subtotal + insurance;

  // Estimated hours
  const hours = parseInt(bedrooms) || 3;
  const estimatedHours = hours + (floorLevel !== 'ground' ? 1 : 0);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${bedrooms} bedroom${bedrooms === '1' ? '' : 's'}, ${floorLevel} floor, ${distanceKm}km move</p>
    <div class="result-row"><span class="result-label">Base Cost (${bedrooms} bed)</span><span class="result-value">${fmt(baseCost)}</span></div>
    ${floorSurcharge > 0 ? `<div class="result-row"><span class="result-label">Floor Surcharge (${floorLevel})</span><span class="result-value">+${fmt(floorSurcharge)}</span></div>` : ''}
    ${packingCost > 0 ? `<div class="result-row"><span class="result-label">Packing Service</span><span class="result-value">+${fmt(packingCost)}</span></div>` : ''}
    ${distanceSurcharge > 0 ? `<div class="result-row"><span class="result-label">Distance Surcharge (${distanceKm}km)</span><span class="result-value">+${fmt(distanceSurcharge)}</span></div>` : ''}
    ${interstateSurcharge > 0 ? `<div class="result-row"><span class="result-label">Long Distance/Interstate</span><span class="result-value">+${fmt(interstateSurcharge)}</span></div>` : ''}
    <div class="result-row"><span class="result-label">Transit Insurance</span><span class="result-value">+${fmt(insurance)}</span></div>
    <div class="result-row highlight"><span class="result-label">Estimated Total</span><span class="result-value">${fmt(total)}</span></div>
    <div class="result-row"><span class="result-label">Estimated Time</span><span class="result-value">${estimatedHours}-${estimatedHours + 2} hours</span></div>
    <div class="result-row"><span class="result-label">Budget Range</span><span class="result-value">${fmt(total * 0.8)} - ${fmt(total * 1.3)}</span></div>
    <p class="result-note">Estimates based on typical Australian removalist rates. Get at least 3 quotes. Prices vary significantly by city, time of year (peak = Dec-Jan), and day of week.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', {minimumFractionDigits:2, maximumFractionDigits:2}); }
