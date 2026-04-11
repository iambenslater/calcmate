function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// State duty calculators
function nswDuty(v) {
  if (v <= 16000) return v * 0.015;
  if (v <= 35000) return 240 + (v - 16000) * 0.0175;
  if (v <= 93000) return 572.50 + (v - 35000) * 0.0175;
  if (v <= 351000) return 1587.50 + (v - 93000) * 0.035;
  if (v <= 1168000) return 10617.50 + (v - 351000) * 0.045;
  return 47382.50 + (v - 1168000) * 0.055;
}

function vicDuty(v) {
  if (v <= 25000) return v * 0.014;
  if (v <= 130000) return 350 + (v - 25000) * 0.024;
  if (v <= 960000) return 2870 + (v - 130000) * 0.06;
  if (v <= 2000000) return 52670 + (v - 960000) * 0.055;
  return 110000 + (v - 2000000) * 0.065; // $110,000 + 6.5% above $2M (SRO current rates)
}

function qldDuty(v) {
  if (v <= 5000) return 0;
  if (v <= 75000) return (v - 5000) * 0.015;
  if (v <= 540000) return 1050 + (v - 75000) * 0.035;
  if (v <= 1000000) return 17325 + (v - 540000) * 0.045;
  return 38025 + (v - 1000000) * 0.0575;
}

function saDuty(v) {
  if (v <= 12000) return v * 0.01;
  if (v <= 30000) return 120 + (v - 12000) * 0.02;
  if (v <= 50000) return 480 + (v - 30000) * 0.03;
  if (v <= 100000) return 1080 + (v - 50000) * 0.035;
  if (v <= 200000) return 2830 + (v - 100000) * 0.04;
  if (v <= 250000) return 6830 + (v - 200000) * 0.0425;
  if (v <= 300000) return 8955 + (v - 250000) * 0.0475;
  if (v <= 500000) return 11330 + (v - 300000) * 0.05;
  return 21330 + (v - 500000) * 0.055;
}

function waDuty(v) {
  if (v <= 120000) return v * 0.019;
  if (v <= 150000) return 2280 + (v - 120000) * 0.0285;
  if (v <= 360000) return 3135 + (v - 150000) * 0.038;
  if (v <= 725000) return 11115 + (v - 360000) * 0.0475;
  return 28453 + (v - 725000) * 0.0515;
}

function tasDuty(v) {
  if (v <= 3000) return v * 0.0175;
  if (v <= 25000) return 50 + (v - 3000) * 0.0225;
  if (v <= 75000) return 545 + (v - 25000) * 0.035;
  if (v <= 200000) return 2295 + (v - 75000) * 0.04;
  if (v <= 375000) return 7295 + (v - 200000) * 0.0425;
  if (v <= 725000) return 14733 + (v - 375000) * 0.045;
  return 30483 + (v - 725000) * 0.045;
}

function actDuty(v) {
  // ACT uses a conveyance duty formula
  if (v <= 260000) return v * 0.012 + 20;
  if (v <= 300000) return 3140 + (v - 260000) * 0.0235;
  if (v <= 500000) return 4080 + (v - 300000) * 0.0385;
  if (v <= 750000) return 11780 + (v - 500000) * 0.044;
  if (v <= 1000000) return 22780 + (v - 750000) * 0.0505;
  if (v <= 1455000) return 35405 + (v - 1000000) * 0.057;
  return 61340 + (v - 1455000) * 0.067;
}

function ntDuty(v) {
  // NT uses a formula: D = (0.06571441 * V^2) / 1000 + 15V
  // Simplified bracket approach:
  if (v <= 525000) return v * 0.0000652 * v / 1000 + v * 0.0015; // approx
  // Standard calc: V * 0.054 is approximate above $525k
  const d = (0.06571441 * Math.pow(v / 1000, 2)) + 15 * (v / 1000);
  return Math.max(0, d);
}

function calculate() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  const propertyType = document.getElementById('input-propertyType').value || 'existing';
  const firstHomeEl = document.querySelector('input[name="input-firstHomeBuyer"]:checked');
  const isFirstHome = firstHomeEl ? firstHomeEl.value === 'yes' : false;
  const foreignEl = document.querySelector('input[name="input-foreignBuyer"]:checked');
  const isForeign = foreignEl ? foreignEl.value === 'yes' : false;

  // Foreign surcharges: NSW increased to 9% from 1 Jan 2025
  const foreignSurcharges = {
    NSW: 0.09, VIC: 0.08, QLD: 0.08, SA: 0.07, WA: 0.07, TAS: 0.08, ACT: 0, NT: 0
  };

  const states = [
    { name: 'NSW', fn: nswDuty },
    { name: 'VIC', fn: vicDuty },
    { name: 'QLD', fn: qldDuty },
    { name: 'SA', fn: saDuty },
    { name: 'WA', fn: waDuty },
    { name: 'TAS', fn: tasDuty },
    { name: 'ACT', fn: actDuty },
    { name: 'NT', fn: ntDuty }
  ];

  let rows = '';
  let cheapest = { name: '', duty: Infinity };
  let mostExpensive = { name: '', duty: 0 };

  for (const state of states) {
    let duty = state.fn(propertyValue);
    const foreign = isForeign ? propertyValue * (foreignSurcharges[state.name] || 0) : 0;
    const total = duty + foreign;
    const pct = propertyValue > 0 ? (total / propertyValue * 100).toFixed(2) : '0.00';

    if (total < cheapest.duty) cheapest = { name: state.name, duty: total };
    if (total > mostExpensive.duty) mostExpensive = { name: state.name, duty: total };

    rows += `<tr>
      <td class="px-3 py-2 font-medium">${state.name}</td>
      <td class="px-3 py-2 text-right">${formatCurrency(duty)}</td>
      ${isForeign ? `<td class="px-3 py-2 text-right">${formatCurrency(foreign)}</td>` : ''}
      <td class="px-3 py-2 text-right font-semibold">${formatCurrency(total)}</td>
      <td class="px-3 py-2 text-right">${pct}%</td>
    </tr>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Property Value</span><span class="result-value">${formatCurrency(propertyValue)}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Stamp Duty Comparison — All States & Territories</h4>
    <div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="border-b">
        <th class="px-3 py-2 text-left">State</th>
        <th class="px-3 py-2 text-right">Base Duty</th>
        ${isForeign ? '<th class="px-3 py-2 text-right">Foreign Surcharge</th>' : ''}
        <th class="px-3 py-2 text-right">Total</th>
        <th class="px-3 py-2 text-right">% of Value</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <hr class="my-3">
    <div class="result-row"><span class="result-label">Cheapest</span><span class="result-value text-green-600">${cheapest.name}: ${formatCurrency(cheapest.duty)}</span></div>
    <div class="result-row"><span class="result-label">Most Expensive</span><span class="result-value text-red-600">${mostExpensive.name}: ${formatCurrency(mostExpensive.duty)}</span></div>
    <div class="result-row"><span class="result-label">Difference</span><span class="result-value">${formatCurrency(mostExpensive.duty - cheapest.duty)}</span></div>
    ${isFirstHome ? '<p class="text-sm text-gray-600 mt-3">Note: First home buyer concessions vary by state and are not reflected in this comparison table. See individual state calculators for concession details.</p>' : ''}
  `;
}
