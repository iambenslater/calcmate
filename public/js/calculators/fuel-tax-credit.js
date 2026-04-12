function calculate() {
  const litres = parseFloat(document.getElementById('input-litres').value) || 0;
  const fuelType = document.getElementById('input-fuelType').value;
  const activityType = document.getElementById('input-activity').value;

  // Fuel tax credit rates (cents per litre) — 2025-26 ATO rates
  // Heavy vehicle on public road: full rate minus road user charge (32.4c) = ~20.1c
  // Off-road / machinery: full excise rate ~50.8c
  // Other business uses (light vehicles off-road etc.): ~50.8c
  const rates = {
    'diesel': { 'heavy-vehicle': 20.1, 'machinery': 50.8, 'other': 50.8 },
    'petrol': { 'heavy-vehicle': 20.1, 'machinery': 50.8, 'other': 50.8 }
  };

  const rateKey = fuelType || 'diesel';
  const actKey = activityType || 'heavy-vehicle';
  const centsPerLitre = (rates[rateKey] && rates[rateKey][actKey]) ? rates[rateKey][actKey] : 20.5;
  const creditPerLitre = centsPerLitre / 100;
  const totalCredit = litres * creditPerLitre;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Litres Used</span><span class="result-value">${litres.toLocaleString('en-AU')} L</span></div>
    <div class="result-row"><span class="result-label">Fuel Type</span><span class="result-value">${fuelType === 'petrol' ? 'Petrol' : 'Diesel'}</span></div>
    <div class="result-row"><span class="result-label">Activity Type</span><span class="result-value">${actKey.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span></div>
    <div class="result-row"><span class="result-label">Rate</span><span class="result-value">${centsPerLitre.toFixed(1)}c per litre</span></div>
    <div class="result-row highlight"><span class="result-label">Estimated Fuel Tax Credit</span><span class="result-value">${fmt(totalCredit)}</span></div>
    <p style="margin-top:12px;font-size:0.85rem;color:var(--text-muted)">Rates are for the 2025-26 financial year (1 July 2025–30 June 2026). Heavy vehicle on-road rate reflects the road user charge deduction. Check the ATO for current rates applicable to your situation.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getTLDR() {
  const litres = parseFloat(document.getElementById('input-litres').value) || 0;
  const fuelType = document.getElementById('input-fuelType').value;
  const activityType = document.getElementById('input-activity').value;
  if (litres <= 0) return '';
  const rates = { 'diesel': { 'heavy-vehicle': 20.1, 'machinery': 50.8, 'other': 50.8 }, 'petrol': { 'heavy-vehicle': 20.1, 'machinery': 50.8, 'other': 50.8 } };
  const rateKey = fuelType || 'diesel';
  const actKey = activityType || 'heavy-vehicle';
  const centsPerLitre = (rates[rateKey] && rates[rateKey][actKey]) ? rates[rateKey][actKey] : 20.5;
  const totalCredit = litres * (centsPerLitre / 100);
  const actLabels = { 'heavy-vehicle': 'heavy vehicle on public roads', 'machinery': 'off-road machinery', 'other': 'other business use' };
  return 'You can claim ' + fmt(totalCredit) + ' in fuel tax credits for ' + litres.toLocaleString('en-AU') + ' litres of ' + (fuelType === 'petrol' ? 'petrol' : 'diesel') + ' used in ' + (actLabels[actKey] || actKey) + ' at ' + centsPerLitre.toFixed(1) + 'c/litre.';
}
