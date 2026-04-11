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

  // QLD Transfer Duty brackets (2025)
  function qldDuty(value) {
    if (value <= 5000) return 0;
    if (value <= 75000) return (value - 5000) * 0.015;
    if (value <= 540000) return 1050 + (value - 75000) * 0.035;
    if (value <= 1000000) return 17325 + (value - 540000) * 0.045;
    return 38025 + (value - 1000000) * 0.0575;
  }

  let duty = qldDuty(propertyValue);

  // QLD First Home Concession
  // Concession for homes up to $700,000 (home concession rate)
  // First home buyers: concession of up to $17,350 for homes up to $550,000
  // Phasing out between $550,001 and $700,000
  let fhbDiscount = 0;
  let fhbNote = '';
  if (isFirstHome) {
    if (propertyValue <= 550000) {
      // Full concession — reduced rate applies
      const concessionalDuty = qldHomeConcessionDuty(propertyValue);
      fhbDiscount = duty - concessionalDuty;
      if (fhbDiscount < 0) fhbDiscount = 0;
      fhbNote = 'Full first home concession applies (properties up to $550,000).';
    } else if (propertyValue <= 700000) {
      const fullConcession = duty - qldHomeConcessionDuty(propertyValue);
      const phaseOut = (propertyValue - 550000) / 150000;
      fhbDiscount = Math.max(0, fullConcession * (1 - phaseOut));
      fhbNote = 'Partial first home concession applies ($550,001–$700,000).';
    }
  } else {
    // Home concession rate (owner-occupied, not first home)
    if (propertyValue <= 550000 && propertyType !== 'vacant') {
      const concessionalDuty = qldHomeConcessionDuty(propertyValue);
      if (concessionalDuty < duty) {
        fhbDiscount = duty - concessionalDuty;
        fhbNote = 'QLD home concession rate applied (owner-occupied).';
      }
    }
  }

  function qldHomeConcessionDuty(value) {
    // Reduced rates for owner-occupied homes
    if (value <= 350000) return 0 + value * 0.01;
    if (value <= 540000) return 3500 + (value - 350000) * 0.035;
    if (value <= 1000000) return 10150 + (value - 540000) * 0.045;
    return 30850 + (value - 1000000) * 0.0575;
  }

  duty -= fhbDiscount;

  // Foreign buyer surcharge: 8% (AFAD)
  let foreignSurcharge = 0;
  if (isForeign) {
    foreignSurcharge = propertyValue * 0.08;
  }

  // First Home Owner Grant (QLD): $30,000 for new homes up to $750,000
  let fhog = 0;
  if (isFirstHome && (propertyType === 'new') && propertyValue <= 750000) {
    fhog = 30000;
  }

  const totalDuty = duty + foreignSurcharge;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Property Value</span><span class="result-value">${formatCurrency(propertyValue)}</span></div>
    <div class="result-row"><span class="result-label">Property Type</span><span class="result-value">${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Base Transfer Duty</span><span class="result-value">${formatCurrency(duty + fhbDiscount)}</span></div>
    ${fhbDiscount > 0 ? `<div class="result-row"><span class="result-label">${isFirstHome ? 'First Home' : 'Home'} Concession</span><span class="result-value text-green-600">-${formatCurrency(fhbDiscount)}</span></div>` : ''}
    ${isForeign ? `<div class="result-row"><span class="result-label">AFAD Foreign Surcharge (8%)</span><span class="result-value text-red-600">+${formatCurrency(foreignSurcharge)}</span></div>` : ''}
    <div class="result-row font-bold text-lg"><span class="result-label">Total Transfer Duty (QLD)</span><span class="result-value">${formatCurrency(totalDuty)}</span></div>
    <div class="result-row"><span class="result-label">Duty as % of Property Value</span><span class="result-value">${(totalDuty / propertyValue * 100).toFixed(2)}%</span></div>
    ${fhbNote ? `<p class="text-sm text-green-600 mt-2">${fhbNote}</p>` : ''}
    ${fhog > 0 ? `
      <hr class="my-2">
      <div class="result-row"><span class="result-label">First Home Owner Grant (QLD)</span><span class="result-value text-green-600">${formatCurrency(fhog)}</span></div>
      <p class="text-sm text-gray-600">Queensland offers $30,000 for new homes valued up to $750,000.</p>
    ` : ''}
  `;
}
