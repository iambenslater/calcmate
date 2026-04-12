function calculate() {
  const confidenceStr = document.getElementById('input-confidence').value;
  const marginOfError = (parseFloat(document.getElementById('input-marginOfError').value) || 5) / 100;
  const population = parseFloat(document.getElementById('input-population').value) || 0;
  const proportion = parseFloat(document.getElementById('input-proportion').value) || 50;

  // Z-scores for confidence levels
  const zScores = { '90%': 1.645, '95%': 1.96, '99%': 2.576 };
  const z = zScores[confidenceStr] || 1.96;
  const p = 0.5; // maximum variability (most conservative)

  // Base sample size: n = (Z^2 * p * (1-p)) / E^2
  const n0 = (z * z * p * (1 - p)) / (marginOfError * marginOfError);

  // Finite population correction
  let adjustedN;
  if (population > 0) {
    adjustedN = n0 / (1 + ((n0 - 1) / population));
  } else {
    adjustedN = n0;
  }

  const sampleSize = Math.ceil(adjustedN);

  // Also show for different margins of error
  const margins = [1, 2, 3, 5, 10];
  let compRows = '';
  margins.forEach(m => {
    const e = m / 100;
    let base = (z * z * p * (1 - p)) / (e * e);
    if (population > 0) base = base / (1 + ((base - 1) / population));
    compRows += `<div class="result-row"><span class="result-label">${m}% margin</span><span class="result-value">${Math.ceil(base).toLocaleString('en-AU')}</span></div>`;
  });

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Confidence Level</span><span class="result-value">${confidenceStr} (Z = ${z})</span></div>
    <div class="result-row"><span class="result-label">Margin of Error</span><span class="result-value">${(marginOfError * 100).toFixed(1)}%</span></div>
    <div class="result-row"><span class="result-label">Population Size</span><span class="result-value">${population > 0 ? population.toLocaleString('en-AU') : 'Infinite (no correction)'}</span></div>
    <div class="result-row"><span class="result-label">Assumed Proportion (p)</span><span class="result-value">50% (most conservative)</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Base Sample Size (infinite pop.)</span><span class="result-value">${Math.ceil(n0).toLocaleString('en-AU')}</span></div>
    ${population > 0 ? `<div class="result-row"><span class="result-label">Finite Population Correction</span><span class="result-value">Applied</span></div>` : ''}
    <div class="result-row highlight"><span class="result-label">Required Sample Size</span><span class="result-value">${sampleSize.toLocaleString('en-AU')}</span></div>
    ${population > 0 ? `<div class="result-row"><span class="result-label">Sample as % of Population</span><span class="result-value">${((sampleSize / population) * 100).toFixed(1)}%</span></div>` : ''}
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Quick Reference (${confidenceStr})</span><span class="result-value"></span></div>
    ${compRows}
  `;
}

function getTLDR() {
  const confidenceStr = document.getElementById('input-confidence').value;
  const marginOfError = (parseFloat(document.getElementById('input-marginOfError').value) || 5) / 100;
  const population = parseFloat(document.getElementById('input-population').value) || 0;

  const zScores = { '90%': 1.645, '95%': 1.96, '99%': 2.576 };
  const z = zScores[confidenceStr] || 1.96;
  const p = 0.5;

  const n0 = (z * z * p * (1 - p)) / (marginOfError * marginOfError);
  let adjustedN;
  if (population > 0) {
    adjustedN = n0 / (1 + ((n0 - 1) / population));
  } else {
    adjustedN = n0;
  }

  const sampleSize = Math.ceil(adjustedN);

  return 'To achieve ' + confidenceStr + ' confidence with a ' + (marginOfError * 100).toFixed(1) + '% margin of error' + (population > 0 ? ' from a population of ' + population.toLocaleString('en-AU') : '') + ', you need a sample size of ' + sampleSize.toLocaleString('en-AU') + '.';
}
