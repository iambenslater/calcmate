function calculate() {
  const category = document.getElementById('input-category').value;
  const inputValue = parseFloat(document.getElementById('input-value').value);
  const fromUnit = document.getElementById('input-fromUnit').value;
  const toUnit = document.getElementById('input-toUnit').value;

  if (isNaN(inputValue)) { alert('Please enter a valid number.'); return; }
  if (!category || !fromUnit || !toUnit) { alert('Please select all fields.'); return; }

  // Conversion factors to base unit per category
  const conversions = {
    length: {
      base: 'metres',
      units: {
        mm: 0.001, cm: 0.01, m: 1, km: 1000,
        in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344
      }
    },
    weight: {
      base: 'grams',
      units: {
        mg: 0.001, g: 1, kg: 1000, t: 1000000,
        oz: 28.3495, lb: 453.592, st: 6350.29
      }
    },
    volume: {
      base: 'millilitres',
      units: {
        ml: 1, L: 1000, 'cup (AU)': 250, tbsp: 20, tsp: 5,
        'fl oz (US)': 29.5735, 'gal (US)': 3785.41, 'gal (UK)': 4546.09
      }
    },
    area: {
      base: 'sq metres',
      units: {
        'sq mm': 0.000001, 'sq cm': 0.0001, 'sq m': 1, 'sq km': 1000000,
        'sq in': 0.000645, 'sq ft': 0.0929, 'sq yd': 0.8361,
        'acre': 4046.86, 'hectare': 10000
      }
    },
    speed: {
      base: 'km/h',
      units: {
        'km/h': 1, 'm/s': 3.6, 'mph': 1.60934, 'knots': 1.852, 'ft/s': 1.09728
      }
    }
  };

  const cat = conversions[category];
  if (!cat) { alert('Unknown category.'); return; }

  const fromFactor = cat.units[fromUnit];
  const toFactor = cat.units[toUnit];

  if (fromFactor === undefined || toFactor === undefined) {
    alert('Unknown unit. Please select valid units for this category.');
    return;
  }

  // Convert: input -> base -> target
  const baseValue = inputValue * fromFactor;
  const result = baseValue / toFactor;

  const conversionFactor = fromFactor / toFactor;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Input</span><span class="result-value">${inputValue.toLocaleString('en-AU')} ${fromUnit}</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Result</span><span class="result-value">${result.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${toUnit}</span></div>
    <div class="result-row"><span class="result-label">Conversion Factor</span><span class="result-value">1 ${fromUnit} = ${conversionFactor.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${toUnit}</span></div>
    <div class="result-row"><span class="result-label">Category</span><span class="result-value">${category.charAt(0).toUpperCase() + category.slice(1)}</span></div>
  `;
}

// Populate unit dropdowns based on category selection
function updateUnits() {
  const category = document.getElementById('input-category').value;
  const unitOptions = {
    length: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    weight: ['mg', 'g', 'kg', 't', 'oz', 'lb', 'st'],
    volume: ['ml', 'L', 'cup (AU)', 'tbsp', 'tsp', 'fl oz (US)', 'gal (US)', 'gal (UK)'],
    area: ['sq mm', 'sq cm', 'sq m', 'sq km', 'sq in', 'sq ft', 'sq yd', 'acre', 'hectare'],
    speed: ['km/h', 'm/s', 'mph', 'knots', 'ft/s']
  };

  const units = unitOptions[category] || [];
  const fromSelect = document.getElementById('input-fromUnit');
  const toSelect = document.getElementById('input-toUnit');

  if (fromSelect && toSelect) {
    fromSelect.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    toSelect.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    if (units.length > 1) toSelect.selectedIndex = 1;
  }
}

// Auto-update on category change
document.addEventListener('DOMContentLoaded', () => {
  const catEl = document.getElementById('input-category');
  if (catEl) {
    catEl.addEventListener('change', updateUnits);
    updateUnits();
  }
});
