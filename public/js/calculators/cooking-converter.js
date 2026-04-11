function calculate() {
  const amount = parseFloat(document.getElementById('input-amount').value);
  const fromUnit = document.getElementById('input-fromUnit').value;
  const toUnit = document.getElementById('input-toUnit').value;

  if (isNaN(amount) || amount <= 0) { alert('Please enter a valid amount.'); return; }
  if (!fromUnit || !toUnit) { alert('Please select units.'); return; }

  // All values in millilitres (Australian metric cup = 250ml)
  const toMl = {
    'cup':   250,
    'tbsp':  20,     // Australian tablespoon = 20ml
    'tsp':   5,
    'ml':    1,
    'L':     1000,
    'fl-oz': 29.5735  // US fluid ounce
  };

  const fromFactor = toMl[fromUnit];
  const toFactor = toMl[toUnit];

  if (!fromFactor || !toFactor) { alert('Unknown unit.'); return; }

  const mlValue = amount * fromFactor;
  const result = mlValue / toFactor;
  const conversionRate = fromFactor / toFactor;

  const unitNames = {
    'cup': 'cups (AU, 250ml)',
    'tbsp': 'tablespoons (AU, 20ml)',
    'tsp': 'teaspoons (5ml)',
    'ml': 'millilitres',
    'L': 'litres',
    'fl-oz': 'fluid ounces (US)'
  };

  // Common reference conversions
  const refs = [
    { val: mlValue, unit: 'ml', label: 'Millilitres' },
    { val: mlValue / 250, unit: 'cup', label: 'Cups (AU)' },
    { val: mlValue / 20, unit: 'tbsp', label: 'Tablespoons (AU)' },
    { val: mlValue / 5, unit: 'tsp', label: 'Teaspoons' },
    { val: mlValue / 1000, unit: 'L', label: 'Litres' },
    { val: mlValue / 29.5735, unit: 'fl-oz', label: 'Fluid Ounces (US)' },
  ].filter(r => r.unit !== fromUnit && r.unit !== toUnit);

  let refRows = refs.map(r =>
    `<div class="result-row"><span class="result-label">${r.label}</span><span class="result-value">${r.val.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</span></div>`
  ).join('');

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">${unitNames[fromUnit]}</span><span class="result-value">${amount}</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">${unitNames[toUnit]}</span><span class="result-value">${result.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</span></div>
    <div class="result-row"><span class="result-label">Conversion</span><span class="result-value">1 ${fromUnit} = ${conversionRate.toFixed(4)} ${toUnit}</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>Also Equals</strong>
    </div>
    ${refRows}
    <p class="text-sm text-gray-500 mt-4">Australian tablespoon = 20ml (differs from US 15ml). Australian metric cup = 250ml. Fluid ounces shown are US measures (29.57ml).</p>
  `;
}
