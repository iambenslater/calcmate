function calculate() {
  const inputValue = parseFloat(document.getElementById('input-inputValue').value);
  const unitType = document.getElementById('input-unitType').value;
  const direction = document.querySelector('input[name="input-direction"]:checked')?.value ||
                    document.getElementById('input-direction')?.value || 'metric-to-imperial';

  if (isNaN(inputValue)) { alert('Please enter a valid number.'); return; }
  if (!unitType) { alert('Please select a unit type.'); return; }

  const toMetric = direction === 'imperial-to-metric';
  let result, fromLabel, toLabel, formula;

  switch (unitType) {
    case 'length':
      if (toMetric) {
        result = inputValue * 2.54;
        fromLabel = 'inches'; toLabel = 'centimetres';
        formula = `${inputValue} in x 2.54 = ${result.toFixed(4)} cm`;
      } else {
        result = inputValue / 2.54;
        fromLabel = 'centimetres'; toLabel = 'inches';
        formula = `${inputValue} cm / 2.54 = ${result.toFixed(4)} in`;
      }
      break;
    case 'weight':
      if (toMetric) {
        result = inputValue * 0.453592;
        fromLabel = 'pounds'; toLabel = 'kilograms';
        formula = `${inputValue} lb x 0.4536 = ${result.toFixed(4)} kg`;
      } else {
        result = inputValue * 2.20462;
        fromLabel = 'kilograms'; toLabel = 'pounds';
        formula = `${inputValue} kg x 2.2046 = ${result.toFixed(4)} lb`;
      }
      break;
    case 'distance':
      if (toMetric) {
        result = inputValue * 1.60934;
        fromLabel = 'miles'; toLabel = 'kilometres';
        formula = `${inputValue} mi x 1.6093 = ${result.toFixed(4)} km`;
      } else {
        result = inputValue / 1.60934;
        fromLabel = 'kilometres'; toLabel = 'miles';
        formula = `${inputValue} km / 1.6093 = ${result.toFixed(4)} mi`;
      }
      break;
    case 'temperature':
      if (toMetric) {
        result = (inputValue - 32) * 5 / 9;
        fromLabel = 'Fahrenheit'; toLabel = 'Celsius';
        formula = `(${inputValue} - 32) x 5/9 = ${result.toFixed(2)}`;
      } else {
        result = inputValue * 9 / 5 + 32;
        fromLabel = 'Celsius'; toLabel = 'Fahrenheit';
        formula = `${inputValue} x 9/5 + 32 = ${result.toFixed(2)}`;
      }
      break;
    case 'volume':
      if (toMetric) {
        result = inputValue * 3.78541;
        fromLabel = 'US gallons'; toLabel = 'litres';
        formula = `${inputValue} gal x 3.7854 = ${result.toFixed(4)} L`;
      } else {
        result = inputValue / 3.78541;
        fromLabel = 'litres'; toLabel = 'US gallons';
        formula = `${inputValue} L / 3.7854 = ${result.toFixed(4)} gal`;
      }
      break;
    default:
      alert('Unknown unit type.'); return;
  }

  const unitSymbols = {
    centimetres: 'cm', inches: 'in', kilograms: 'kg', pounds: 'lb',
    kilometres: 'km', miles: 'mi', Celsius: '\u00b0C', Fahrenheit: '\u00b0F',
    litres: 'L', 'US gallons': 'gal'
  };

  const fromSym = unitSymbols[fromLabel] || '';
  const toSym = unitSymbols[toLabel] || '';

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">${fromLabel}</span><span class="result-value">${inputValue} ${fromSym}</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">${toLabel}</span><span class="result-value">${result.toFixed(4)} ${toSym}</span></div>
    <div class="result-row"><span class="result-label">Formula</span><span class="result-value">${formula}</span></div>
    <div class="result-row"><span class="result-label">Direction</span><span class="result-value">${toMetric ? 'Imperial to Metric' : 'Metric to Imperial'}</span></div>
  `;
}
