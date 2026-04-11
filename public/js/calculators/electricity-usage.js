function calculate() {
  const wattage = parseFloat(document.getElementById('input-watts').value) || 0;
  const hoursPerDay = parseFloat(document.getElementById('input-hoursPerDay').value) || 0;
  const tariffRate = parseFloat(document.getElementById('input-tariff').value) || 0;

  const kwhPerDay = (wattage * hoursPerDay) / 1000;
  const kwhPerWeek = kwhPerDay * 7;
  const kwhPerMonth = kwhPerDay * 30.44;
  const kwhPerYear = kwhPerDay * 365;

  const tariffDollar = tariffRate / 100; // convert cents to dollars
  const costPerDay = kwhPerDay * tariffDollar;
  const costPerWeek = kwhPerWeek * tariffDollar;
  const costPerMonth = kwhPerMonth * tariffDollar;
  const costPerYear = kwhPerYear * tariffDollar;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${wattage}W appliance running ${hoursPerDay} hours/day at ${tariffRate}c/kWh</p>
    <div class="result-row"><span class="result-label">Daily Usage</span><span class="result-value">${kwhPerDay.toFixed(2)} kWh</span></div>
    <div class="result-row"><span class="result-label">Weekly Usage</span><span class="result-value">${kwhPerWeek.toFixed(2)} kWh</span></div>
    <div class="result-row"><span class="result-label">Monthly Usage</span><span class="result-value">${kwhPerMonth.toFixed(1)} kWh</span></div>
    <div class="result-row"><span class="result-label">Yearly Usage</span><span class="result-value">${kwhPerYear.toFixed(0)} kWh</span></div>
    <div class="result-row highlight"><span class="result-label">Daily Cost</span><span class="result-value">${fmt(costPerDay)}</span></div>
    <div class="result-row highlight"><span class="result-label">Weekly Cost</span><span class="result-value">${fmt(costPerWeek)}</span></div>
    <div class="result-row highlight"><span class="result-label">Monthly Cost</span><span class="result-value">${fmt(costPerMonth)}</span></div>
    <div class="result-row highlight"><span class="result-label">Yearly Cost</span><span class="result-value">${fmt(costPerYear)}</span></div>
    <p class="result-note">Average AU electricity tariff is ~25-35c/kWh depending on state and provider.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', {minimumFractionDigits:2, maximumFractionDigits:2}); }
