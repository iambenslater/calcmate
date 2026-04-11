function calculate() {
  const state = document.getElementById('input-state').value.toUpperCase();
  const vehicleType = document.getElementById('input-vehicleType').value;
  const driverAge = parseInt(document.getElementById('input-driverAge').value) || 0;
  const claimsHistory = document.getElementById('input-claimHistory').value;

  if (!state || !vehicleType || driverAge <= 0) {
    document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please fill in all fields.</p>';
    return;
  }

  // Base CTP premiums by state (approximate 2025/26, annual)
  const basePremiums = {
    NSW:  { car: 550, motorcycle: 420, trailer: 0 },
    VIC:  { car: 520, motorcycle: 390, trailer: 0 },  // VIC uses TAC levy, built into rego
    QLD:  { car: 370, motorcycle: 290, trailer: 0 },
    SA:   { car: 410, motorcycle: 310, trailer: 0 },
    WA:   { car: 430, motorcycle: 330, trailer: 0 },
    TAS:  { car: 390, motorcycle: 300, trailer: 0 },
    NT:   { car: 480, motorcycle: 360, trailer: 0 },
    ACT:  { car: 500, motorcycle: 380, trailer: 0 },
  };

  let basePremium = basePremiums[state]?.[vehicleType] || 0;

  if (vehicleType === 'trailer') {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = `
      <div class="result-row"><span class="result-label">CTP Premium</span><span class="result-value">N/A</span></div>
      <p class="text-sm text-gray-500 mt-4">Trailers generally do not require separate CTP insurance in Australia.</p>
    `;
    return;
  }

  // Age factor
  let ageFactor = 1.0;
  if (driverAge < 21) ageFactor = 1.6;
  else if (driverAge < 25) ageFactor = 1.35;
  else if (driverAge < 30) ageFactor = 1.15;
  else if (driverAge < 55) ageFactor = 1.0;
  else if (driverAge < 65) ageFactor = 1.05;
  else ageFactor = 1.15;

  // Claims history factor
  let claimsFactor = 1.0;
  if (claimsHistory === '1') claimsFactor = 1.2;
  else if (claimsHistory === '2+') claimsFactor = 1.5;

  const adjustedPremium = basePremium * ageFactor * claimsFactor;
  const gst = adjustedPremium * 0.1;
  const stampDuty = adjustedPremium * 0.05;
  const total = adjustedPremium + gst + stampDuty;

  const stateName = {
    NSW: 'New South Wales', VIC: 'Victoria', QLD: 'Queensland', SA: 'South Australia',
    WA: 'Western Australia', TAS: 'Tasmania', NT: 'Northern Territory', ACT: 'Australian Capital Territory'
  }[state] || state;

  const ctpName = {
    NSW: 'Green Slip', VIC: 'TAC Charge (included in rego)', QLD: 'CTP Premium',
    SA: 'CTP Premium', WA: 'Motor Injury Insurance', TAS: 'CTP Premium',
    NT: 'MAITS Levy', ACT: 'CTP Premium'
  }[state] || 'CTP Premium';

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Estimated Annual CTP</span><span class="result-value">${fmt(total)}</span></div>
    <div class="result-row"><span class="result-label">Base Premium</span><span class="result-value">${fmt(basePremium)}</span></div>
    <div class="result-row"><span class="result-label">Age Adjustment</span><span class="result-value">${((ageFactor - 1) * 100).toFixed(0)}%${ageFactor > 1 ? ' surcharge' : ''}</span></div>
    <div class="result-row"><span class="result-label">Claims Loading</span><span class="result-value">${((claimsFactor - 1) * 100).toFixed(0)}%${claimsFactor > 1 ? ' surcharge' : ''}</span></div>
    <div class="result-row"><span class="result-label">Adjusted Premium</span><span class="result-value">${fmt(adjustedPremium)}</span></div>
    <div class="result-row"><span class="result-label">GST (10%)</span><span class="result-value">${fmt(gst)}</span></div>
    <div class="result-row"><span class="result-label">Stamp Duty (~5%)</span><span class="result-value">${fmt(stampDuty)}</span></div>
    <div class="result-row"><span class="result-label">State</span><span class="result-value">${stateName}</span></div>
    <div class="result-row"><span class="result-label">Local Name</span><span class="result-value">${ctpName}</span></div>
    <p class="text-sm text-gray-500 mt-4">This is a simplified estimate. Actual CTP premiums depend on your insurer, vehicle details, driving record, and postcode. In Victoria, CTP is included in registration fees via the TAC charge.</p>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
