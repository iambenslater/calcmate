function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  const propertyType = document.getElementById('input-propertyType').value || 'existing';
  const firstHomeEl = document.querySelector('input[name="input-firstHomeBuyer"]:checked');
  const isFirstHome = firstHomeEl ? firstHomeEl.value === 'yes' : false;
  const foreignEl = document.querySelector('input[name="input-foreignBuyer"]:checked');
  const isForeign = foreignEl ? foreignEl.value === 'yes' : false;

  // VIC Transfer Duty brackets (2025)
  function vicDuty(value) {
    if (value <= 25000) return value * 0.014;
    if (value <= 130000) return 350 + (value - 25000) * 0.024;
    if (value <= 960000) return 2870 + (value - 130000) * 0.06;
    if (value <= 2000000) return 52670 + (value - 960000) * 0.055;
    return 110000 + (value - 2000000) * 0.065; // $110,000 + 6.5% above $2M (SRO current rates)
  }

  let duty = vicDuty(propertyValue);

  // First Home Buyer concessions (VIC)
  // Full exemption for properties up to $600,000
  // Concession for $600,001–$750,000
  let fhbDiscount = 0;
  let fhbNote = '';
  if (isFirstHome) {
    if (propertyValue <= 600000) {
      fhbDiscount = duty;
      fhbNote = 'Full stamp duty exemption for first home buyers (properties up to $600,000).';
    } else if (propertyValue <= 750000) {
      const reduction = 1 - ((propertyValue - 600000) / 150000);
      fhbDiscount = duty * reduction;
      fhbNote = 'Partial first home buyer concession applies ($600,001–$750,000).';
    }
  }

  duty -= fhbDiscount;

  // Foreign buyer surcharge: 8%
  let foreignSurcharge = 0;
  if (isForeign) {
    foreignSurcharge = propertyValue * 0.08;
  }

  // First Home Owner Grant (VIC): $10,000 for new homes up to $750,000
  let fhog = 0;
  if (isFirstHome && (propertyType === 'new') && propertyValue <= 750000) {
    fhog = 10000;
  }

  const totalDuty = duty + foreignSurcharge;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Property Value</span><span class="result-value">${formatCurrency(propertyValue)}</span></div>
    <div class="result-row"><span class="result-label">Property Type</span><span class="result-value">${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Base Transfer Duty</span><span class="result-value">${formatCurrency(duty + fhbDiscount)}</span></div>
    ${isFirstHome && fhbDiscount > 0 ? `<div class="result-row"><span class="result-label">First Home Buyer Concession</span><span class="result-value text-green-600">-${formatCurrency(fhbDiscount)}</span></div>` : ''}
    ${isForeign ? `<div class="result-row"><span class="result-label">Foreign Buyer Surcharge (8%)</span><span class="result-value text-red-600">+${formatCurrency(foreignSurcharge)}</span></div>` : ''}
    <div class="result-row font-bold text-lg"><span class="result-label">Total Stamp Duty (VIC)</span><span class="result-value">${formatCurrency(totalDuty)}</span></div>
    <div class="result-row"><span class="result-label">Duty as % of Property Value</span><span class="result-value">${(totalDuty / propertyValue * 100).toFixed(2)}%</span></div>
    ${fhbNote ? `<p class="text-sm text-green-600 mt-2">${fhbNote}</p>` : ''}
    ${fhog > 0 ? `
      <hr class="my-2">
      <div class="result-row"><span class="result-label">First Home Owner Grant (VIC)</span><span class="result-value text-green-600">${formatCurrency(fhog)}</span></div>
      <p class="text-sm text-gray-600">Available for new homes valued up to $750,000.</p>
    ` : ''}
  `;
}
