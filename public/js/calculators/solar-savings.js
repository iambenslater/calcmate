function calculate() {
  const systemSize = parseFloat(document.getElementById('input-systemSize').value) || 0;
  const state = document.getElementById('input-state').value;
  const tariffRate = parseFloat(document.getElementById('input-usageTariff').value) || 0;
  const feedInTariff = parseFloat(document.getElementById('input-feedInTariff').value) || 0;

  // Average peak sun hours by state
  const sunHours = {
    'QLD': 5.2, 'NSW': 4.6, 'VIC': 3.9, 'SA': 4.6,
    'WA': 5.0, 'TAS': 3.5
  };
  const hours = sunHours[state] || 4.5;

  // Daily generation
  const dailyKwh = systemSize * hours;
  const yearlyKwh = dailyKwh * 365;

  // Assume 70% self-consumption, 30% exported (typical AU household)
  const selfConsumptionRate = 0.70;
  const exportRate = 0.30;

  const selfConsumedKwh = yearlyKwh * selfConsumptionRate;
  const exportedKwh = yearlyKwh * exportRate;

  const tariffDollar = tariffRate / 100;
  const feedInDollar = feedInTariff / 100;

  const savingsFromSelfUse = selfConsumedKwh * tariffDollar;
  const feedInEarnings = exportedKwh * feedInDollar;
  const totalYearlySaving = savingsFromSelfUse + feedInEarnings;

  // Typical system cost: ~$1,000-$1,200 per kW installed (after STC rebate)
  const estimatedCost = systemSize * 1100;
  const paybackYears = totalYearlySaving > 0 ? estimatedCost / totalYearlySaving : 0;

  // 25-year projection
  const savings25yr = totalYearlySaving * 25;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${systemSize}kW system in ${state} (~${hours} peak sun hours/day)</p>
    <div class="result-row"><span class="result-label">Daily Generation</span><span class="result-value">${dailyKwh.toFixed(1)} kWh</span></div>
    <div class="result-row"><span class="result-label">Yearly Generation</span><span class="result-value">${yearlyKwh.toFixed(0).toLocaleString()} kWh</span></div>
    <div class="result-row"><span class="result-label">Self-Consumed (70%)</span><span class="result-value">${selfConsumedKwh.toFixed(0)} kWh</span></div>
    <div class="result-row"><span class="result-label">Exported (30%)</span><span class="result-value">${exportedKwh.toFixed(0)} kWh</span></div>
    <div class="result-row highlight"><span class="result-label">Savings (Self-Use)</span><span class="result-value">${fmt(savingsFromSelfUse)}/yr</span></div>
    <div class="result-row highlight"><span class="result-label">Feed-In Earnings</span><span class="result-value">${fmt(feedInEarnings)}/yr</span></div>
    <div class="result-row highlight"><span class="result-label">Total Annual Benefit</span><span class="result-value">${fmt(totalYearlySaving)}/yr</span></div>
    <div class="result-row"><span class="result-label">Estimated System Cost</span><span class="result-value">${fmt(estimatedCost)} (after STCs)</span></div>
    <div class="result-row highlight"><span class="result-label">Payback Period</span><span class="result-value">${paybackYears.toFixed(1)} years</span></div>
    <div class="result-row"><span class="result-label">25-Year Savings</span><span class="result-value">${fmt(savings25yr)}</span></div>
    <p class="result-note">Estimates assume 70/30 self-consumption/export split. Actual results depend on usage patterns, shading, panel orientation, and degradation over time. System cost is approximate post-STC rebate.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', {minimumFractionDigits:2, maximumFractionDigits:2}); }
