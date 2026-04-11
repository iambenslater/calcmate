function calculate() {
  const litres = parseFloat(document.getElementById('input-litresUsed').value) || 0;
  const fuelType = document.getElementById('input-fuelType').value;
  const activityType = document.getElementById('input-activityType').value;

  // Simplified fuel tax credit rates (cents per litre) — 2024-25 indicative
  const rates = {
    'diesel': { 'heavy-vehicle': 48.8, 'machinery': 48.8, 'other': 20.5 },
    'petrol': { 'heavy-vehicle': 48.8, 'machinery': 48.8, 'other': 20.5 }
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
    <p style="margin-top:12px;font-size:0.85rem;color:var(--text-muted)">Rates are indicative for the 2024-25 financial year. Check the ATO for current rates applicable to your situation.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
