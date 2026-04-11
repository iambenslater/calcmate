function calculate() {
  const dailyCoffees = parseFloat(document.getElementById('input-coffeesPerDay').value) || 0;
  const pricePerCoffee = parseFloat(document.getElementById('input-pricePerCoffee').value) || 0;
  const workDaysPerYear = parseInt(document.getElementById('input-workDaysPerWeek').value) || 5;
  const workDaysPerYearCalc = workDaysPerYear * 52;

  const dailyCost = dailyCoffees * pricePerCoffee;
  const weeklyCost = dailyCost * workDaysPerYear;
  const monthlyCost = dailyCost * (workDaysPerYearCalc / 12);
  const yearlyCost = dailyCost * workDaysPerYearCalc;

  const inflationRate = 0.03; // 3% annual inflation

  // Project forward
  function futureValue(annual, years, inflation) {
    let total = 0;
    for (let y = 0; y < years; y++) {
      total += annual * Math.pow(1 + inflation, y);
    }
    return total;
  }

  // If invested instead (7% average return)
  function investedValue(annual, years, returnRate) {
    let total = 0;
    for (let y = 0; y < years; y++) {
      total = (total + annual) * (1 + returnRate);
    }
    return total;
  }

  const cost5yr = futureValue(yearlyCost, 5, inflationRate);
  const cost10yr = futureValue(yearlyCost, 10, inflationRate);
  const cost30yr = futureValue(yearlyCost, 30, inflationRate);

  const invested5yr = investedValue(yearlyCost, 5, 0.07);
  const invested10yr = investedValue(yearlyCost, 10, 0.07);
  const invested30yr = investedValue(yearlyCost, 30, 0.07);

  // Comparison: home brew cost
  const homeBrewCost = 0.50; // per cup estimate
  const homeBrewDaily = dailyCoffees * homeBrewCost;
  const homeBrewYearly = homeBrewDaily * workDaysPerYearCalc;
  const yearlySavings = yearlyCost - homeBrewYearly;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${dailyCoffees} coffee${dailyCoffees > 1 ? 's' : ''}/day at ${fmt(pricePerCoffee)} each, ${workDaysPerYearCalc} days/year</p>
    <div class="result-row"><span class="result-label">Daily</span><span class="result-value">${fmt(dailyCost)}</span></div>
    <div class="result-row"><span class="result-label">Weekly</span><span class="result-value">${fmt(weeklyCost)}</span></div>
    <div class="result-row"><span class="result-label">Monthly</span><span class="result-value">${fmt(monthlyCost)}</span></div>
    <div class="result-row highlight"><span class="result-label">Yearly</span><span class="result-value">${fmt(yearlyCost)}</span></div>
    <hr style="border-color: var(--border-light); margin: 1rem 0;">
    <p class="result-note"><strong>Long-term cost (with 3% inflation):</strong></p>
    <div class="result-row"><span class="result-label">5 Years</span><span class="result-value">${fmt(cost5yr)}</span></div>
    <div class="result-row"><span class="result-label">10 Years</span><span class="result-value">${fmt(cost10yr)}</span></div>
    <div class="result-row highlight"><span class="result-label">30 Years</span><span class="result-value">${fmt(cost30yr)}</span></div>
    <hr style="border-color: var(--border-light); margin: 1rem 0;">
    <p class="result-note"><strong>If invested at 7% return instead:</strong></p>
    <div class="result-row"><span class="result-label">5 Years</span><span class="result-value">${fmt(invested5yr)}</span></div>
    <div class="result-row"><span class="result-label">10 Years</span><span class="result-value">${fmt(invested10yr)}</span></div>
    <div class="result-row highlight"><span class="result-label">30 Years</span><span class="result-value">${fmt(invested30yr)}</span></div>
    <hr style="border-color: var(--border-light); margin: 1rem 0;">
    <div class="result-row"><span class="result-label">Home brew cost (~$0.50/cup)</span><span class="result-value">${fmt(homeBrewYearly)}/yr</span></div>
    <div class="result-row highlight"><span class="result-label">Annual savings if switching</span><span class="result-value">${fmt(yearlySavings)}/yr</span></div>
    <p class="result-note">But honestly, you deserve that coffee. This is just maths, not life advice.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', {minimumFractionDigits:2, maximumFractionDigits:2}); }
