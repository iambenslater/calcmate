function calculate() {
  const state = document.getElementById('input-state').value;
  const yearsOfService = parseFloat(document.getElementById('input-yearsOfService').value) || 0;
  const hoursPerWeek = parseFloat(document.getElementById('input-hoursPerWeek').value) || 38;
  const weeklyPayRate = parseFloat(document.getElementById('input-weeklyPayRate').value) || 0;

  if (!state || yearsOfService <= 0 || weeklyPayRate <= 0) {
    alert('Please fill in all fields.');
    return;
  }

  // LSL rules by state (simplified)
  // Most states: 8.6667 weeks (2 months) after 10 years continuous service
  const rules = {
    NSW:  { threshold: 10, weeksAfterThreshold: 8.6667, accrualPerYear: 0.8667, proRataFrom: 5 },
    VIC:  { threshold: 10, weeksAfterThreshold: 8.6667, accrualPerYear: 0.8667, proRataFrom: 7 },  // Pro-rata after 7 years if leaving
    QLD:  { threshold: 10, weeksAfterThreshold: 8.6667, accrualPerYear: 0.8667, proRataFrom: 7 },
    SA:   { threshold: 10, weeksAfterThreshold: 8.6667, accrualPerYear: 0.8667, proRataFrom: 7 },
    WA:   { threshold: 10, weeksAfterThreshold: 8.6667, accrualPerYear: 0.8667, proRataFrom: 7 },
    TAS:  { threshold: 10, weeksAfterThreshold: 8.6667, accrualPerYear: 0.8667, proRataFrom: 7 },
    NT:   { threshold: 10, weeksAfterThreshold: 8.6667, accrualPerYear: 0.8667, proRataFrom: 7 },
    ACT:  { threshold:  7, weeksAfterThreshold: 6.0667, accrualPerYear: 0.8667, proRataFrom: 5 },  // ACT: after 7 years
  };

  const rule = rules[state];
  if (!rule) { alert('Unknown state.'); return; }

  const ftRatio = hoursPerWeek / 38;
  const totalWeeksEntitlement = yearsOfService * rule.accrualPerYear * ftRatio;

  const eligible = yearsOfService >= rule.threshold;
  const proRataEligible = yearsOfService >= rule.proRataFrom;

  let entitlementWeeks;
  if (eligible) {
    entitlementWeeks = totalWeeksEntitlement;
  } else if (proRataEligible) {
    entitlementWeeks = totalWeeksEntitlement; // Pro-rata on termination
  } else {
    entitlementWeeks = 0;
  }

  const entitlementHours = entitlementWeeks * hoursPerWeek;
  const entitlementDays = entitlementWeeks * 5;
  const hourlyRate = weeklyPayRate / hoursPerWeek;
  const entitlementValue = entitlementHours * hourlyRate;

  const stateNames = {
    NSW:'New South Wales', VIC:'Victoria', QLD:'Queensland', SA:'South Australia',
    WA:'Western Australia', TAS:'Tasmania', NT:'Northern Territory', ACT:'Australian Capital Territory'
  };

  let statusText;
  if (eligible) {
    statusText = 'Fully entitled to LSL';
  } else if (proRataEligible) {
    statusText = 'Pro-rata entitlement on termination';
  } else {
    statusText = `Not yet eligible (need ${rule.proRataFrom}+ years for pro-rata, ${rule.threshold} years for full entitlement)`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Entitlement Status</span><span class="result-value">${statusText}</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">LSL Entitlement</span><span class="result-value">${entitlementWeeks.toFixed(2)} weeks</span></div>
    <div class="result-row"><span class="result-label">Working Days</span><span class="result-value">${entitlementDays.toFixed(1)} days</span></div>
    <div class="result-row"><span class="result-label">Hours</span><span class="result-value">${entitlementHours.toFixed(1)} hours</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Estimated Payout Value</span><span class="result-value">${fmt(entitlementValue)}</span></div>
    <div class="result-row"><span class="result-label">Years of Service</span><span class="result-value">${yearsOfService}</span></div>
    <div class="result-row"><span class="result-label">Hours per Week</span><span class="result-value">${hoursPerWeek} (${(ftRatio * 100).toFixed(0)}% FTE)</span></div>
    <div class="result-row"><span class="result-label">Weekly Pay Rate</span><span class="result-value">${fmt(weeklyPayRate)}</span></div>
    <div class="result-row"><span class="result-label">State</span><span class="result-value">${stateNames[state]}</span></div>
    <div class="result-row"><span class="result-label">Accrual Rate</span><span class="result-value">${rule.accrualPerYear} weeks per year of service</span></div>
    <div class="result-row"><span class="result-label">Full Entitlement After</span><span class="result-value">${rule.threshold} years</span></div>
    <div class="result-row"><span class="result-label">Pro-rata Available From</span><span class="result-value">${rule.proRataFrom} years (on termination)</span></div>
    <p class="text-sm text-gray-500 mt-4">Long service leave rules vary by state and may differ for specific industries or awards. The standard accrual is 8.6667 weeks (2 months) after 10 years of continuous service. Pro-rata access on termination typically applies after 5-7 years depending on state. Check your state's legislation for exact rules.</p>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
