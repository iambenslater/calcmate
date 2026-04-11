function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const taxableIncome = parseFloat(document.getElementById('input-taxableIncome').value) || 0;
  const familyStatus = document.getElementById('input-familyStatus').value || 'single';
  const dependants = parseInt(document.getElementById('input-dependants').value) || 0;
  const privateHealthEl = document.querySelector('input[name="input-privateHealth"]:checked');
  const hasPrivateHealth = privateHealthEl ? privateHealthEl.value === 'yes' : false;

  // Medicare levy 2%
  // Reduction threshold for singles: $26,000 phase-in to $32,500
  // For families: $43,846 + $4,027 per child
  let medicareLevy = 0;
  let levyNote = '';

  if (familyStatus === 'single') {
    if (taxableIncome <= 26000) {
      medicareLevy = 0;
      levyNote = 'Below the Medicare levy threshold ($26,000) — no levy payable.';
    } else if (taxableIncome <= 32500) {
      // Phase-in: 10% of excess over $26,000
      medicareLevy = (taxableIncome - 26000) * 0.10;
      levyNote = 'Reduced Medicare levy applies (income in phase-in range $26,000–$32,500).';
    } else {
      medicareLevy = taxableIncome * 0.02;
      levyNote = 'Full Medicare levy of 2% applies.';
    }
  } else {
    const familyThreshold = 43846 + (dependants * 4027);
    const familyPhaseOut = familyThreshold * 1.25;
    if (taxableIncome <= familyThreshold) {
      medicareLevy = 0;
      levyNote = `Below the family Medicare levy threshold (${formatCurrency(familyThreshold)}) — no levy payable.`;
    } else if (taxableIncome <= familyPhaseOut) {
      medicareLevy = (taxableIncome - familyThreshold) * 0.10;
      levyNote = 'Reduced Medicare levy applies (income in family phase-in range).';
    } else {
      medicareLevy = taxableIncome * 0.02;
      levyNote = 'Full Medicare levy of 2% applies.';
    }
  }

  // Medicare Levy Surcharge (no PHI)
  let surcharge = 0;
  let surchargeRate = 0;
  let surchargeTier = 'None';

  if (!hasPrivateHealth) {
    const incomeForMLS = taxableIncome; // simplified - normally includes fringe benefits etc.
    const thresholds = familyStatus === 'single'
      ? [
          { min: 0, max: 93000, rate: 0, tier: 'No surcharge' },
          { min: 93001, max: 108000, rate: 0.01, tier: 'Tier 1' },
          { min: 108001, max: 144000, rate: 0.0125, tier: 'Tier 2' },
          { min: 144001, max: Infinity, rate: 0.015, tier: 'Tier 3' }
        ]
      : [
          { min: 0, max: 186000, rate: 0, tier: 'No surcharge' },
          { min: 186001, max: 216000, rate: 0.01, tier: 'Tier 1' },
          { min: 216001, max: 288000, rate: 0.0125, tier: 'Tier 2' },
          { min: 288001, max: Infinity, rate: 0.015, tier: 'Tier 3' }
        ];

    for (const t of thresholds) {
      if (incomeForMLS >= t.min && incomeForMLS <= (t.max === Infinity ? incomeForMLS + 1 : t.max)) {
        surchargeRate = t.rate;
        surchargeTier = t.tier;
        break;
      }
    }
    surcharge = taxableIncome * surchargeRate;
  }

  const totalLevy = medicareLevy + surcharge;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Taxable Income</span><span class="result-value">${formatCurrency(taxableIncome)}</span></div>
    <div class="result-row"><span class="result-label">Family Status</span><span class="result-value">${familyStatus === 'single' ? 'Single' : 'Family'} ${dependants > 0 ? '+ ' + dependants + ' dependant(s)' : ''}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Medicare Levy (2%)</span><span class="result-value">${formatCurrency(medicareLevy)}</span></div>
    <p class="text-sm text-gray-600 mb-3">${levyNote}</p>
    ${!hasPrivateHealth ? `
      <div class="result-row"><span class="result-label">Medicare Levy Surcharge</span><span class="result-value">${formatCurrency(surcharge)}</span></div>
      <div class="result-row"><span class="result-label">Surcharge Tier</span><span class="result-value">${surchargeTier} (${(surchargeRate * 100).toFixed(2)}%)</span></div>
      <p class="text-sm text-gray-600 mb-3">The Medicare Levy Surcharge applies if you don't have private hospital cover and your income exceeds the threshold.</p>
    ` : '<p class="text-sm text-green-600 mb-3">Private health insurance held — no Medicare Levy Surcharge applies.</p>'}
    <hr class="my-2">
    <div class="result-row font-bold"><span class="result-label">Total Medicare Costs</span><span class="result-value">${formatCurrency(totalLevy)}</span></div>
    <div class="result-row"><span class="result-label">Per Month</span><span class="result-value">${formatCurrency(totalLevy / 12)}</span></div>
    <div class="result-row"><span class="result-label">Per Fortnight</span><span class="result-value">${formatCurrency(totalLevy / 26)}</span></div>
  `;
}
