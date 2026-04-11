function calculate() {
  const mode = document.getElementById('input-mode').value;
  const valueA = parseFloat(document.getElementById('input-valueA').value);
  const valueB = parseFloat(document.getElementById('input-valueB').value);

  if (isNaN(valueA) || isNaN(valueB)) {
    alert('Please enter valid numbers.');
    return;
  }

  let result, description, formula;

  switch (mode) {
    case 'of':
      // What is X% of Y?
      result = (valueA / 100) * valueB;
      description = `${valueA}% of ${valueB}`;
      formula = `${valueA} / 100 x ${valueB} = ${result}`;
      break;
    case 'is':
      // What percentage is X of Y?
      if (valueB === 0) { alert('Cannot divide by zero.'); return; }
      result = (valueA / valueB) * 100;
      description = `${valueA} is what % of ${valueB}?`;
      formula = `${valueA} / ${valueB} x 100 = ${result.toFixed(4)}%`;
      break;
    case 'change':
      // Percentage change from X to Y
      if (valueA === 0) { alert('Starting value cannot be zero.'); return; }
      result = ((valueB - valueA) / Math.abs(valueA)) * 100;
      description = `% change from ${valueA} to ${valueB}`;
      formula = `(${valueB} - ${valueA}) / |${valueA}| x 100 = ${result.toFixed(4)}%`;
      break;
    default:
      alert('Please select a mode.'); return;
  }

  let resultDisplay;
  if (mode === 'of') {
    resultDisplay = result.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } else {
    resultDisplay = result.toFixed(2) + '%';
  }

  let extraInfo = '';
  if (mode === 'change') {
    const diff = valueB - valueA;
    const direction = diff >= 0 ? 'increase' : 'decrease';
    extraInfo = `
      <div class="result-row"><span class="result-label">Direction</span><span class="result-value">${direction.charAt(0).toUpperCase() + direction.slice(1)}</span></div>
      <div class="result-row"><span class="result-label">Absolute Difference</span><span class="result-value">${Math.abs(diff).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span></div>
    `;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Result</span><span class="result-value">${resultDisplay}</span></div>
    <div class="result-row"><span class="result-label">Question</span><span class="result-value">${description}</span></div>
    <div class="result-row"><span class="result-label">Formula</span><span class="result-value">${formula}</span></div>
    ${extraInfo}
  `;
}
