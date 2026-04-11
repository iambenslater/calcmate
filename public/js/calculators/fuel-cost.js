function calculate() {
  const distance = parseFloat(document.getElementById('input-distance').value) || 0;
  const consumption = parseFloat(document.getElementById('input-consumption').value) || 0;
  const fuelPrice = parseFloat(document.getElementById('input-fuelPrice').value) || 0;

  if (distance <= 0 || consumption <= 0 || fuelPrice <= 0) {
    alert('Please enter valid values for all fields.');
    return;
  }

  const litresUsed = distance * (consumption / 100);
  const totalCost = litresUsed * fuelPrice;
  const costPerKm = totalCost / distance;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Total Fuel Cost</span><span class="result-value">${fmt(totalCost)}</span></div>
    <div class="result-row"><span class="result-label">Litres Used</span><span class="result-value">${litresUsed.toFixed(1)} L</span></div>
    <div class="result-row"><span class="result-label">Cost per Kilometre</span><span class="result-value">${fmt(costPerKm)}</span></div>
    <div class="result-row"><span class="result-label">Distance</span><span class="result-value">${distance.toLocaleString('en-AU')} km</span></div>
    <div class="result-row"><span class="result-label">Consumption Rate</span><span class="result-value">${consumption} L/100km</span></div>
    <div class="result-row"><span class="result-label">Fuel Price</span><span class="result-value">${fmt(fuelPrice)}/L</span></div>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
