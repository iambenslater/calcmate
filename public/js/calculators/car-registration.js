function calculate() {
  const state = document.getElementById('input-state').value.toUpperCase();
  const vehicleType = document.getElementById('input-vehicleType').value;
  const engineSize = document.getElementById('input-cylinders').value;

  if (!state || !vehicleType || !engineSize) {
    document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please select all fields.</p>';
    return;
  }

  // Simplified registration cost lookup (approximate 2025/26 values)
  const regoData = {
    NSW:  { car: { '4cyl': 375, '6cyl': 505, '8cyl': 680 }, motorcycle: { '4cyl': 125, '6cyl': 125, '8cyl': 125 }, trailer: { '4cyl': 75, '6cyl': 75, '8cyl': 75 } },
    VIC:  { car: { '4cyl': 340, '6cyl': 470, '8cyl': 640 }, motorcycle: { '4cyl': 110, '6cyl': 110, '8cyl': 110 }, trailer: { '4cyl': 65, '6cyl': 65, '8cyl': 65 } },
    QLD:  { car: { '4cyl': 360, '6cyl': 490, '8cyl': 660 }, motorcycle: { '4cyl': 120, '6cyl': 120, '8cyl': 120 }, trailer: { '4cyl': 70, '6cyl': 70, '8cyl': 70 } },
    SA:   { car: { '4cyl': 320, '6cyl': 440, '8cyl': 600 }, motorcycle: { '4cyl': 100, '6cyl': 100, '8cyl': 100 }, trailer: { '4cyl': 55, '6cyl': 55, '8cyl': 55 } },
    WA:   { car: { '4cyl': 330, '6cyl': 460, '8cyl': 620 }, motorcycle: { '4cyl': 105, '6cyl': 105, '8cyl': 105 }, trailer: { '4cyl': 60, '6cyl': 60, '8cyl': 60 } },
    TAS:  { car: { '4cyl': 310, '6cyl': 430, '8cyl': 580 }, motorcycle: { '4cyl': 95,  '6cyl': 95,  '8cyl': 95  }, trailer: { '4cyl': 50, '6cyl': 50, '8cyl': 50 } },
    NT:   { car: { '4cyl': 300, '6cyl': 410, '8cyl': 560 }, motorcycle: { '4cyl': 90,  '6cyl': 90,  '8cyl': 90  }, trailer: { '4cyl': 45, '6cyl': 45, '8cyl': 45 } },
    ACT:  { car: { '4cyl': 350, '6cyl': 480, '8cyl': 650 }, motorcycle: { '4cyl': 115, '6cyl': 115, '8cyl': 115 }, trailer: { '4cyl': 68, '6cyl': 68, '8cyl': 68 } },
  };

  // Additional fees (approximate)
  const adminFees = { NSW: 73, VIC: 65, QLD: 55, SA: 48, WA: 52, TAS: 45, NT: 40, ACT: 60 };
  const trafficImprovement = { NSW: 30, VIC: 28, QLD: 25, SA: 22, WA: 24, TAS: 20, NT: 18, ACT: 27 };

  const baseCost = regoData[state]?.[vehicleType]?.[engineSize] || 0;
  const admin = adminFees[state] || 50;
  const traffic = trafficImprovement[state] || 25;
  const total = baseCost + admin + traffic;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Estimated Total Registration</span><span class="result-value">${fmt(total)}</span></div>
    <div class="result-row"><span class="result-label">Base Registration Fee</span><span class="result-value">${fmt(baseCost)}</span></div>
    <div class="result-row"><span class="result-label">Admin Fee</span><span class="result-value">${fmt(admin)}</span></div>
    <div class="result-row"><span class="result-label">Traffic Improvement Fee</span><span class="result-value">${fmt(traffic)}</span></div>
    <div class="result-row"><span class="result-label">State</span><span class="result-value">${state}</span></div>
    <div class="result-row"><span class="result-label">Vehicle Type</span><span class="result-value">${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}</span></div>
    <p class="text-sm text-gray-500 mt-4">These are simplified estimates only. Actual registration costs vary based on vehicle weight, emissions, stamp duty, and CTP insurance (shown separately). Check your state transport authority for exact fees.</p>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getTLDR() {
  var state = (document.getElementById('input-state').value || '').toUpperCase();
  var vehicleType = document.getElementById('input-vehicleType').value;
  var engineSize = document.getElementById('input-cylinders').value;
  if (!state || !vehicleType || !engineSize) return '';
  var regoData = {
    NSW:  { car: { '4cyl': 375, '6cyl': 505, '8cyl': 680 }, motorcycle: { '4cyl': 125, '6cyl': 125, '8cyl': 125 }, trailer: { '4cyl': 75, '6cyl': 75, '8cyl': 75 } },
    VIC:  { car: { '4cyl': 340, '6cyl': 470, '8cyl': 640 }, motorcycle: { '4cyl': 110, '6cyl': 110, '8cyl': 110 }, trailer: { '4cyl': 65, '6cyl': 65, '8cyl': 65 } },
    QLD:  { car: { '4cyl': 360, '6cyl': 490, '8cyl': 660 }, motorcycle: { '4cyl': 120, '6cyl': 120, '8cyl': 120 }, trailer: { '4cyl': 70, '6cyl': 70, '8cyl': 70 } },
    SA:   { car: { '4cyl': 320, '6cyl': 440, '8cyl': 600 }, motorcycle: { '4cyl': 100, '6cyl': 100, '8cyl': 100 }, trailer: { '4cyl': 55, '6cyl': 55, '8cyl': 55 } },
    WA:   { car: { '4cyl': 330, '6cyl': 460, '8cyl': 620 }, motorcycle: { '4cyl': 105, '6cyl': 105, '8cyl': 105 }, trailer: { '4cyl': 60, '6cyl': 60, '8cyl': 60 } },
    TAS:  { car: { '4cyl': 310, '6cyl': 430, '8cyl': 580 }, motorcycle: { '4cyl': 95,  '6cyl': 95,  '8cyl': 95  }, trailer: { '4cyl': 50, '6cyl': 50, '8cyl': 50 } },
    NT:   { car: { '4cyl': 300, '6cyl': 410, '8cyl': 560 }, motorcycle: { '4cyl': 90,  '6cyl': 90,  '8cyl': 90  }, trailer: { '4cyl': 45, '6cyl': 45, '8cyl': 45 } },
    ACT:  { car: { '4cyl': 350, '6cyl': 480, '8cyl': 650 }, motorcycle: { '4cyl': 115, '6cyl': 115, '8cyl': 115 }, trailer: { '4cyl': 68, '6cyl': 68, '8cyl': 68 } }
  };
  var adminFees = { NSW: 73, VIC: 65, QLD: 55, SA: 48, WA: 52, TAS: 45, NT: 40, ACT: 60 };
  var trafficFees = { NSW: 30, VIC: 28, QLD: 25, SA: 22, WA: 24, TAS: 20, NT: 18, ACT: 27 };
  var baseCost = (regoData[state] && regoData[state][vehicleType] && regoData[state][vehicleType][engineSize]) ? regoData[state][vehicleType][engineSize] : 0;
  var total = baseCost + (adminFees[state] || 50) + (trafficFees[state] || 25);
  var typeLabel = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);
  return 'Estimated annual registration for a ' + engineSize + ' ' + typeLabel.toLowerCase() + ' in ' + state + ' is approximately ' + fmt(total) + ' (including base fee, admin, and traffic improvement fee — CTP insurance is separate).';
}

