function calculate() {
  const priceRaw = parseFloat(document.getElementById('input-carPrice').value);
  const fuelType = document.querySelector('input[name="input-fuelType"]:checked').value;
  const gstIncluded = document.querySelector('input[name="input-gstIncluded"]:checked').value;

  if (isNaN(priceRaw) || priceRaw <= 0) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Please enter a valid car price.</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }

  const fmt = v => new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: 'AUD',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(v);

  // LCT thresholds 2024-25
  const LCT_THRESHOLD_STANDARD = 76950;
  const LCT_THRESHOLD_FUEL_EFFICIENT = 89332;
  const LCT_RATE = 0.33;
  const GST_RATE = 0.1;

  const isFuelEfficient = fuelType === 'electric-hybrid';
  const threshold = isFuelEfficient ? LCT_THRESHOLD_FUEL_EFFICIENT : LCT_THRESHOLD_STANDARD;

  // Normalise price to GST-inclusive
  let priceGSTInclusive;
  if (gstIncluded === 'yes') {
    priceGSTInclusive = priceRaw;
  } else {
    priceGSTInclusive = priceRaw * (1 + GST_RATE);
  }

  const gstComponent = priceGSTInclusive - (priceGSTInclusive / (1 + GST_RATE));

  let html = '';

  if (priceGSTInclusive <= threshold) {
    html += `
      <div class="result-row">
        <span class="result-label">LCT Threshold (${isFuelEfficient ? 'fuel-efficient' : 'standard'})</span>
        <span class="result-value">${fmt(threshold)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Your vehicle price (GST-incl.)</span>
        <span class="result-value">${fmt(priceGSTInclusive)}</span>
      </div>
      <hr>
      <div class="result-row font-bold">
        <span class="result-label">LCT Payable</span>
        <span class="result-value">No LCT applies</span>
      </div>
      <p class="text-sm text-gray-500 mt-3">Your vehicle is below the LCT threshold. No Luxury Car Tax is payable.</p>
    `;
  } else {
    // LCT = (GST-incl price − threshold) × LCT rate ÷ (1 + LCT rate)
    // ATO formula: taxable value × 33/133
    const taxableAmount = priceGSTInclusive - threshold;
    const lctPayable = taxableAmount * (LCT_RATE / (1 + LCT_RATE));
    const totalDriveAway = priceGSTInclusive + lctPayable;

    html += `
      <h4>Vehicle Price Breakdown</h4>
      <div class="result-row">
        <span class="result-label">Vehicle price (as entered)</span>
        <span class="result-value">${fmt(priceRaw)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Vehicle price (GST-inclusive)</span>
        <span class="result-value">${fmt(priceGSTInclusive)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">GST component</span>
        <span class="result-value">${fmt(gstComponent)}</span>
      </div>
      <hr>
      <h4>Luxury Car Tax Calculation</h4>
      <div class="result-row">
        <span class="result-label">LCT threshold (${isFuelEfficient ? 'fuel-efficient vehicle' : 'standard vehicle'})</span>
        <span class="result-value">${fmt(threshold)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Amount above threshold</span>
        <span class="result-value">${fmt(taxableAmount)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">LCT rate</span>
        <span class="result-value">33%</span>
      </div>
      <div class="result-row font-bold">
        <span class="result-label">LCT payable</span>
        <span class="result-value">${fmt(lctPayable)}</span>
      </div>
      <hr>
      <div class="result-row font-bold">
        <span class="result-label">Total drive-away cost (incl. LCT)</span>
        <span class="result-value">${fmt(totalDriveAway)}</span>
      </div>
      <p class="text-sm text-gray-500 mt-3">LCT is calculated as: (GST-inclusive price − threshold) × 33 ÷ 133. Rates are for the 2024–25 financial year. Fuel-efficient vehicles (electric and hybrids) attract the higher threshold of ${fmt(LCT_THRESHOLD_FUEL_EFFICIENT)}.</p>
    `;
  }

  document.getElementById('results-content').innerHTML = html;
  document.getElementById('calc-results').classList.remove('hidden');
}

function getTLDR() {
  const priceRaw = parseFloat(document.getElementById('input-carPrice').value);
  if (isNaN(priceRaw) || priceRaw <= 0) return '';
  const fuelType = document.querySelector('input[name="input-fuelType"]:checked').value;
  const gstIncluded = document.querySelector('input[name="input-gstIncluded"]:checked').value;
  const fmt = v => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  const isFuelEfficient = fuelType === 'electric-hybrid';
  const threshold = isFuelEfficient ? 89332 : 76950;
  const priceGSTInclusive = gstIncluded === 'yes' ? priceRaw : priceRaw * 1.1;
  if (priceGSTInclusive <= threshold) return 'Your ' + (isFuelEfficient ? 'fuel-efficient' : 'standard') + ' vehicle at ' + fmt(priceGSTInclusive) + ' is below the LCT threshold of ' + fmt(threshold) + ' — no Luxury Car Tax applies.';
  const lctPayable = (priceGSTInclusive - threshold) * (0.33 / 1.33);
  return 'Your vehicle at ' + fmt(priceGSTInclusive) + ' is ' + fmt(priceGSTInclusive - threshold) + ' above the LCT threshold, attracting ' + fmt(lctPayable) + ' in Luxury Car Tax — bringing the total to ' + fmt(priceGSTInclusive + lctPayable) + '.';
}
