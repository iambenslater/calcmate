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
    // 2025-26 thresholds: exempt ≤$27,222; phase-in 10c/$ to $34,028; full 2% above
    if (taxableIncome <= 27222) {
      medicareLevy = 0;
      levyNote = 'Below the Medicare levy threshold ($27,222) — no levy payable.';
    } else if (taxableIncome <= 34028) {
      medicareLevy = (taxableIncome - 27222) * 0.10;
      levyNote = 'Reduced Medicare levy applies (income in phase-in range $27,222–$34,028).';
    } else {
      medicareLevy = taxableIncome * 0.02;
      levyNote = 'Full Medicare levy of 2% applies.';
    }
  } else {
    // 2025-26 family threshold: $45,907 + $4,190 per dependant
    const familyThreshold = 45907 + (dependants * 4190);
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
    // MLS 2025-26: Single $101,001–$118,000 Tier 1 (1%), $118,001–$144,000 Tier 2 (1.25%), $144,001+ Tier 3 (1.5%)
    // Family: $202,001–$236,000 Tier 1, $236,001–$288,000 Tier 2, $288,001+ Tier 3
    const thresholds = familyStatus === 'single'
      ? [
          { min: 0, max: 101000, rate: 0, tier: 'No surcharge' },
          { min: 101001, max: 118000, rate: 0.01, tier: 'Tier 1' },
          { min: 118001, max: 144000, rate: 0.0125, tier: 'Tier 2' },
          { min: 144001, max: Infinity, rate: 0.015, tier: 'Tier 3' }
        ]
      : [
          { min: 0, max: 202000, rate: 0, tier: 'No surcharge' },
          { min: 202001, max: 236000, rate: 0.01, tier: 'Tier 1' },
          { min: 236001, max: 288000, rate: 0.0125, tier: 'Tier 2' },
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

function getTLDR() {
  const taxableIncome = parseFloat(document.getElementById('input-taxableIncome').value) || 0;
  if (taxableIncome <= 0) return '';
  const familyStatus = document.getElementById('input-familyStatus').value || 'single';
  const dependants = parseInt(document.getElementById('input-dependants').value) || 0;
  const privateHealthEl = document.querySelector('input[name="input-privateHealth"]:checked');
  const hasPrivateHealth = privateHealthEl ? privateHealthEl.value === 'yes' : false;
  let medicareLevy = 0;
  if (familyStatus === 'single') {
    if (taxableIncome > 34028) medicareLevy = taxableIncome * 0.02;
    else if (taxableIncome > 27222) medicareLevy = (taxableIncome - 27222) * 0.10;
  } else {
    const familyThreshold = 45907 + (dependants * 4190);
    const familyPhaseOut = familyThreshold * 1.25;
    if (taxableIncome > familyPhaseOut) medicareLevy = taxableIncome * 0.02;
    else if (taxableIncome > familyThreshold) medicareLevy = (taxableIncome - familyThreshold) * 0.10;
  }
  let surcharge = 0, surchargeRate = 0;
  if (!hasPrivateHealth) {
    const thresholds = familyStatus === 'single'
      ? [{ min: 101001, max: 118000, rate: 0.01 }, { min: 118001, max: 144000, rate: 0.0125 }, { min: 144001, max: Infinity, rate: 0.015 }]
      : [{ min: 202001, max: 236000, rate: 0.01 }, { min: 236001, max: 288000, rate: 0.0125 }, { min: 288001, max: Infinity, rate: 0.015 }];
    for (const t of thresholds) { if (taxableIncome >= t.min) { surchargeRate = t.rate; break; } }
    surcharge = taxableIncome * surchargeRate;
  }
  const totalLevy = medicareLevy + surcharge;
  const surchargeNote = surcharge > 0 ? ' plus ' + formatCurrency(surcharge) + ' Medicare Levy Surcharge (no private health cover)' : '';
  return 'On an income of ' + formatCurrency(taxableIncome) + ' you owe ' + formatCurrency(medicareLevy) + ' in Medicare levy' + surchargeNote + ' — totalling ' + formatCurrency(totalLevy) + '/year (' + formatCurrency(totalLevy / 26) + '/fortnight).';
}
