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

  // NSW Transfer Duty brackets (2025)
  function nswDuty(value) {
    if (value <= 16000) return value * 0.015;
    if (value <= 35000) return 240 + (value - 16000) * 0.0175;
    if (value <= 93000) return 572.50 + (value - 35000) * 0.0175;
    if (value <= 351000) return 1587.50 + (value - 93000) * 0.035;
    if (value <= 1168000) return 10617.50 + (value - 351000) * 0.045;
    return 47382.50 + (value - 1168000) * 0.055;
  }

  let duty = nswDuty(propertyValue);

  // Premium property duty (over $3.5M) — additional 7%
  if (propertyValue > 3505000) {
    duty = nswDuty(3505000) + (propertyValue - 3505000) * 0.07;
  }

  // First Home Buyer concessions (NSW)
  // Full exemption for new homes up to $800,000, existing up to $800,000
  // Concession scales from $800,001 to $1,000,000
  let fhbDiscount = 0;
  let fhbNote = '';
  if (isFirstHome) {
    if (propertyType === 'new' || propertyType === 'vacant') {
      if (propertyValue <= 800000) {
        fhbDiscount = duty;
        fhbNote = 'Full stamp duty exemption for first home buyers (new/vacant land up to $800,000).';
      } else if (propertyValue <= 1000000) {
        const reduction = 1 - ((propertyValue - 800000) / 200000);
        fhbDiscount = duty * reduction;
        fhbNote = 'Partial first home buyer concession applies (new home $800,001–$1,000,000).';
      }
    } else {
      // Existing home
      if (propertyValue <= 800000) {
        fhbDiscount = duty;
        fhbNote = 'Full stamp duty exemption for first home buyers (existing homes up to $800,000).';
      } else if (propertyValue <= 1000000) {
        const reduction = 1 - ((propertyValue - 800000) / 200000);
        fhbDiscount = duty * reduction;
        fhbNote = 'Partial first home buyer concession applies (existing home $800,001–$1,000,000).';
      }
    }
  }

  duty -= fhbDiscount;

  // Foreign buyer surcharge: 9% (increased from 8% on 1 Jan 2025)
  let foreignSurcharge = 0;
  if (isForeign) {
    foreignSurcharge = propertyValue * 0.09;
  }

  // First Home Owner Grant (NSW): $10,000 for new homes up to $600,000
  let fhog = 0;
  if (isFirstHome && (propertyType === 'new') && propertyValue <= 600000) {
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
    ${isForeign ? `<div class="result-row"><span class="result-label">Foreign Buyer Surcharge (9%)</span><span class="result-value text-red-600">+${formatCurrency(foreignSurcharge)}</span></div>` : ''}
    <div class="result-row font-bold text-lg"><span class="result-label">Total Stamp Duty (NSW)</span><span class="result-value">${formatCurrency(totalDuty)}</span></div>
    <div class="result-row"><span class="result-label">Duty as % of Property Value</span><span class="result-value">${(totalDuty / propertyValue * 100).toFixed(2)}%</span></div>
    ${fhbNote ? `<p class="text-sm text-green-600 mt-2">${fhbNote}</p>` : ''}
    ${fhog > 0 ? `
      <hr class="my-2">
      <div class="result-row"><span class="result-label">First Home Owner Grant (NSW)</span><span class="result-value text-green-600">${formatCurrency(fhog)}</span></div>
      <p class="text-sm text-gray-600">Available for new homes valued up to $600,000.</p>
    ` : ''}
  `;
}

function getTLDR() {
  const propertyValue = parseFloat(document.getElementById('input-propertyValue').value) || 0;
  if (propertyValue <= 0) return '';

  const propertyType = document.getElementById('input-propertyType').value || 'existing';
  const firstHomeEl = document.querySelector('input[name="input-firstHomeBuyer"]:checked');
  const isFirstHome = firstHomeEl ? firstHomeEl.value === 'yes' : false;
  const foreignEl = document.querySelector('input[name="input-foreignBuyer"]:checked');
  const isForeign = foreignEl ? foreignEl.value === 'yes' : false;

  function nswDuty(value) {
    if (value <= 16000) return value * 0.015;
    if (value <= 35000) return 240 + (value - 16000) * 0.0175;
    if (value <= 93000) return 572.50 + (value - 35000) * 0.0175;
    if (value <= 351000) return 1587.50 + (value - 93000) * 0.035;
    if (value <= 1168000) return 10617.50 + (value - 351000) * 0.045;
    return 47382.50 + (value - 1168000) * 0.055;
  }

  let duty = nswDuty(propertyValue);
  if (propertyValue > 3505000) duty = nswDuty(3505000) + (propertyValue - 3505000) * 0.07;

  let fhbDiscount = 0;
  if (isFirstHome) {
    if (propertyValue <= 800000) fhbDiscount = duty;
    else if (propertyValue <= 1000000) fhbDiscount = duty * (1 - ((propertyValue - 800000) / 200000));
  }
  duty -= fhbDiscount;

  const foreignSurcharge = isForeign ? propertyValue * 0.09 : 0;
  const totalDuty = duty + foreignSurcharge;

  const context = isFirstHome && fhbDiscount > 0 ? ' (first home buyer concession applied)' : '';
  return 'Buying a ' + formatCurrency(propertyValue) + ' property in NSW will cost ' + formatCurrency(totalDuty) + ' in stamp duty' + context + ', which is ' + (totalDuty / propertyValue * 100).toFixed(2) + '% of the purchase price.';
}
