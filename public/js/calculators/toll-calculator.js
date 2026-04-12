function calculate() {
  const city = document.getElementById('input-city').value;
  const tollRoad = (document.getElementById('input-route').value || '').toUpperCase();
  const vehicleType = document.getElementById('input-vehicleType').value;
  const timeOfDay = document.getElementById('input-timeOfDay').value;
  const tripsPerWeek = parseFloat(document.getElementById('input-tripsPerWeek').value) || 0;

  if (!tollRoad || !vehicleType || tripsPerWeek <= 0) {
    document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please fill in all fields.</p>';
    return;
  }

  // Sydney toll road prices (approximate 2025/26, one-way)
  const tolls = {
    'M2':                    { car: 8.41,  truck: 16.82 },
    'M4':                    { car: 5.61,  truck: 11.22 },
    'M5':                    { car: 5.15,  truck: 10.30 },
    'M7':                    { car: 9.30,  truck: 18.60 },
    'Eastern Distributor':   { car: 8.45,  truck: 12.68 },
    'Sydney Harbour':        { car: 4.00,  truck: 8.00  },
    'Cross City':            { car: 6.72,  truck: 13.44 },
  };

  const tollPerTrip = tolls[tollRoad]?.[vehicleType] || 0;
  const weeklyCost = tollPerTrip * tripsPerWeek;
  const monthlyCost = weeklyCost * 4.33;
  const annualCost = weeklyCost * 52;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Toll per Trip</span><span class="result-value">${fmt(tollPerTrip)}</span></div>
    <div class="result-row"><span class="result-label">Weekly Cost</span><span class="result-value">${fmt(weeklyCost)}</span></div>
    <div class="result-row"><span class="result-label">Monthly Cost</span><span class="result-value">${fmt(monthlyCost)}</span></div>
    <div class="result-row"><span class="result-label">Annual Cost</span><span class="result-value">${fmt(annualCost)}</span></div>
    <div class="result-row"><span class="result-label">Toll Road</span><span class="result-value">${tollRoad}</span></div>
    <div class="result-row"><span class="result-label">Vehicle</span><span class="result-value">${vehicleType === 'car' ? 'Car / Light Vehicle' : 'Truck / Heavy Vehicle'}</span></div>
    <div class="result-row"><span class="result-label">Trips per Week</span><span class="result-value">${tripsPerWeek}</span></div>
    <p class="text-sm text-gray-500 mt-4">Toll amounts are approximate and based on maximum tolls for a full-length trip. Actual tolls may vary based on entry/exit points, time of day, and your e-tag provider. Some roads offer cashback or toll relief schemes.</p>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getTLDR() {
  const tollRoad = (document.getElementById('input-route').value || '').toUpperCase();
  const vehicleType = document.getElementById('input-vehicleType').value;
  const tripsPerWeek = parseFloat(document.getElementById('input-tripsPerWeek').value) || 0;
  if (!tollRoad || !vehicleType || tripsPerWeek <= 0) return '';

  const tolls = {
    'M2': { car: 8.41, truck: 16.82 }, 'M4': { car: 5.61, truck: 11.22 },
    'M5': { car: 5.15, truck: 10.30 }, 'M7': { car: 9.30, truck: 18.60 },
    'Eastern Distributor': { car: 8.45, truck: 12.68 }, 'Sydney Harbour': { car: 4.00, truck: 8.00 },
    'Cross City': { car: 6.72, truck: 13.44 }
  };

  const tollPerTrip = tolls[tollRoad]?.[vehicleType] || 0;
  if (tollPerTrip === 0) return '';

  const weeklyCost = tollPerTrip * tripsPerWeek;
  const annualCost = weeklyCost * 52;

  return 'Using the ' + tollRoad + ' ' + tripsPerWeek + ' times per week costs ' + fmt(weeklyCost) + '/week — that adds up to ' + fmt(annualCost) + ' a year in tolls.';
}
