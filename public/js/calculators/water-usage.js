function calculate() {
  const householdSize = parseInt(document.getElementById('input-people').value) || 1;
  const showerMinutes = parseFloat(document.getElementById('input-showerMinutes').value) || 0;
  const showersPerDay = parseFloat(document.getElementById('input-showersPerDay').value) || 0;
  const washingLoads = parseFloat(document.getElementById('input-washesPerWeek').value) || 0;
  const waterPrice = parseFloat(document.getElementById('input-waterRate').value) || 0;

  // Water usage per activity (litres)
  const showerLitresPerMin = 9; // standard showerhead
  const toiletFlushes = householdSize * 5; // avg 5 flushes per person per day
  const toiletLitresPerFlush = 4.5; // dual flush average
  const washingLitresPerLoad = 60; // front loader average
  const dishwasherLoads = 1; // assume 1 per day
  const dishwasherLitres = 12;
  const drinkingCooking = householdSize * 4; // litres per person
  const gardenLitres = 30; // average daily

  const showerDaily = showerMinutes * showersPerDay * householdSize * showerLitresPerMin;
  const toiletDaily = toiletFlushes * toiletLitresPerFlush;
  const washingDaily = (washingLoads / 7) * washingLitresPerLoad; // convert weekly to daily
  const dishwasherDaily = dishwasherLoads * dishwasherLitres;

  const totalDaily = showerDaily + toiletDaily + washingDaily + dishwasherDaily + drinkingCooking + gardenLitres;
  const perPersonDaily = totalDaily / householdSize;
  const auAvgPerPerson = 340;

  const totalYearly = totalDaily * 365;
  const costPerKL = waterPrice; // price per 1000L
  const yearlyCost = (totalYearly / 1000) * costPerKL;
  const quarterlyCost = yearlyCost / 4;

  const comparison = perPersonDaily / auAvgPerPerson * 100;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">Household of ${householdSize} — daily water breakdown</p>
    <div class="result-row"><span class="result-label">Showers</span><span class="result-value">${showerDaily.toFixed(0)} L/day</span></div>
    <div class="result-row"><span class="result-label">Toilets (~${toiletFlushes} flushes)</span><span class="result-value">${toiletDaily.toFixed(0)} L/day</span></div>
    <div class="result-row"><span class="result-label">Washing Machine</span><span class="result-value">${washingDaily.toFixed(0)} L/day</span></div>
    <div class="result-row"><span class="result-label">Dishwasher</span><span class="result-value">${dishwasherDaily.toFixed(0)} L/day</span></div>
    <div class="result-row"><span class="result-label">Drinking & Cooking</span><span class="result-value">${drinkingCooking.toFixed(0)} L/day</span></div>
    <div class="result-row"><span class="result-label">Garden (est.)</span><span class="result-value">${gardenLitres} L/day</span></div>
    <div class="result-row highlight"><span class="result-label">Total Daily Usage</span><span class="result-value">${totalDaily.toFixed(0)} L/day</span></div>
    <div class="result-row highlight"><span class="result-label">Per Person</span><span class="result-value">${perPersonDaily.toFixed(0)} L/day</span></div>
    <div class="result-row"><span class="result-label">vs AU Average (340L)</span><span class="result-value">${comparison.toFixed(0)}% ${comparison > 100 ? '(above average)' : '(below average)'}</span></div>
    <div class="result-row"><span class="result-label">Yearly Usage</span><span class="result-value">${(totalYearly / 1000).toFixed(1)} kL</span></div>
    <div class="result-row highlight"><span class="result-label">Quarterly Cost</span><span class="result-value">${fmt(quarterlyCost)}</span></div>
    <div class="result-row highlight"><span class="result-label">Yearly Cost</span><span class="result-value">${fmt(yearlyCost)}</span></div>
    <p class="result-note">Australian average is ~340L per person per day. Water prices vary by council/provider. Typical range: $2-$4 per kL.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', {minimumFractionDigits:2, maximumFractionDigits:2}); }
