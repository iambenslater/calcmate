function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const landValue = parseFloat(document.getElementById('input-landValue').value) || 0;
  const state = document.getElementById('input-state').value.toUpperCase() || 'NSW';
  const primaryEl = document.querySelector('input[name="input-primaryResidence"]:checked');
  const isPrimary = primaryEl ? primaryEl.value === 'yes' : false;

  let landTax = 0;
  let threshold = 0;
  let notes = '';

  if (isPrimary) {
    // Primary residence is exempt in all states
    landTax = 0;
    notes = 'Your principal place of residence is exempt from land tax in all states and territories.';
  } else {
    switch (state) {
      case 'NSW':
        // NSW: $1,075,000 general threshold; premium threshold $6,571,000 (2025 land tax year)
        threshold = 1075000;
        if (landValue <= threshold) { landTax = 0; }
        else if (landValue <= 6571000) { landTax = 100 + (landValue - threshold) * 0.016; }
        else { landTax = 100 + (6571000 - threshold) * 0.016 + (landValue - 6571000) * 0.02; }
        notes = 'NSW threshold: $1,075,000. Rate: 1.6% + $100 up to $6.571M, then 2%.';
        break;

      case 'VIC':
        // VIC: General threshold $50,000 from 1 Jan 2024 (SRO current rates)
        // Rates: $50k–$100k: $500 flat; $100k–$300k: $975 flat; $300k+: $975 + 0.1% surcharge on total
        // Plus standard rates: $50k–$100k 0.2%, $100k–$300k 0.375%, higher tiers up to 2.25%
        threshold = 50000;
        if (landValue <= threshold) { landTax = 0; }
        else if (landValue <= 100000) { landTax = 500 + (landValue - 50000) * 0.002; }
        else if (landValue <= 300000) { landTax = 975 + (landValue - 100000) * 0.00375; }
        else if (landValue <= 600000) { landTax = 1725 + (landValue - 300000) * 0.0065; }
        else if (landValue <= 1000000) { landTax = 3675 + (landValue - 600000) * 0.009; }
        else if (landValue <= 1800000) { landTax = 7275 + (landValue - 1000000) * 0.013; }
        else if (landValue <= 3000000) { landTax = 17675 + (landValue - 1800000) * 0.017; }
        else { landTax = 38075 + (landValue - 3000000) * 0.0225; }
        notes = 'VIC threshold: $50,000 (lowered from $300,000 in Jan 2024). Standard rates + COVID debt surcharge (2024–2033). Rates 0.2%–2.25%.';
        break;

      case 'QLD':
        // QLD: $600,000 threshold for individuals
        threshold = 600000;
        if (landValue <= threshold) { landTax = 0; }
        else if (landValue <= 1000000) { landTax = 500 + (landValue - 600000) * 0.01; }
        else if (landValue <= 3000000) { landTax = 4500 + (landValue - 1000000) * 0.0165; }
        else if (landValue <= 5000000) { landTax = 37500 + (landValue - 3000000) * 0.0125; }
        else if (landValue <= 10000000) { landTax = 62500 + (landValue - 5000000) * 0.0175; }
        else { landTax = 150000 + (landValue - 10000000) * 0.0275; }
        notes = 'QLD threshold: $600,000 for individuals. Rates: 1% to 2.75%.';
        break;

      case 'SA':
        // SA: $450,000 threshold
        threshold = 450000;
        if (landValue <= threshold) { landTax = 0; }
        else if (landValue <= 750000) { landTax = (landValue - 450000) * 0.005; }
        else if (landValue <= 1000000) { landTax = 1500 + (landValue - 750000) * 0.01; }
        else { landTax = 4000 + (landValue - 1000000) * 0.024; }
        notes = 'SA threshold: $450,000. Rates: 0.5% to 2.4%.';
        break;

      case 'WA':
        // WA: $300,000 threshold
        threshold = 300000;
        if (landValue <= threshold) { landTax = 0; }
        else if (landValue <= 420000) { landTax = 300; }
        else if (landValue <= 1000000) { landTax = 300 + (landValue - 420000) * 0.0025; }
        else if (landValue <= 1800000) { landTax = 1750 + (landValue - 1000000) * 0.009; }
        else if (landValue <= 5000000) { landTax = 8950 + (landValue - 1800000) * 0.014; }
        else { landTax = 53750 + (landValue - 5000000) * 0.027; }
        notes = 'WA threshold: $300,000. Rates: flat $300 to 2.7%.';
        break;

      case 'TAS':
        // TAS: $100,000 threshold
        threshold = 100000;
        if (landValue <= threshold) { landTax = 0; }
        else if (landValue <= 350000) { landTax = 50 + (landValue - 100000) * 0.005; }
        else { landTax = 1300 + (landValue - 350000) * 0.015; }
        notes = 'TAS threshold: $100,000. Rates: 0.5% to 1.5%.';
        break;

      case 'ACT':
        // ACT: No threshold - charges on all non-exempt land (rates-based system)
        threshold = 0;
        if (landValue <= 150000) { landTax = landValue * 0.0054 + 1326; }
        else if (landValue <= 275000) { landTax = 2136 + (landValue - 150000) * 0.0081; }
        else if (landValue <= 2000000) { landTax = 3148.50 + (landValue - 275000) * 0.0126; }
        else { landTax = 24885 + (landValue - 2000000) * 0.015; }
        notes = 'ACT has a land-tax/rates hybrid system with no threshold. All investment properties are taxed.';
        break;

      case 'NT':
        // NT: No land tax
        landTax = 0;
        notes = 'The Northern Territory does not charge land tax.';
        break;
    }
  }

  const monthly = landTax / 12;
  const weekly = landTax / 52;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Land Value</span><span class="result-value">${formatCurrency(landValue)}</span></div>
    <div class="result-row"><span class="result-label">State/Territory</span><span class="result-value">${state}</span></div>
    <div class="result-row"><span class="result-label">Primary Residence</span><span class="result-value">${isPrimary ? 'Yes (exempt)' : 'No (investment/other)'}</span></div>
    <hr class="my-2">
    ${threshold > 0 && !isPrimary ? `<div class="result-row"><span class="result-label">Tax-Free Threshold</span><span class="result-value">${formatCurrency(threshold)}</span></div>` : ''}
    <div class="result-row font-bold text-lg"><span class="result-label">Annual Land Tax</span><span class="result-value">${formatCurrency(landTax)}</span></div>
    ${landTax > 0 ? `
      <div class="result-row"><span class="result-label">Per Month</span><span class="result-value">${formatCurrency(monthly)}</span></div>
      <div class="result-row"><span class="result-label">Per Week</span><span class="result-value">${formatCurrency(weekly)}</span></div>
      ${landValue > 0 ? `<div class="result-row"><span class="result-label">Effective Rate</span><span class="result-value">${(landTax / landValue * 100).toFixed(3)}%</span></div>` : ''}
    ` : ''}
    <p class="text-sm text-gray-600 mt-3">${notes}</p>
  `;
}
