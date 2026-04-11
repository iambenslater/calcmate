function calculate() {
  const genderRadios = document.getElementsByName('input-gender');
  let gender = 'male';
  for (const r of genderRadios) { if (r.checked) gender = r.value; }
  const bodyWeight = parseFloat(document.getElementById('input-weight').value) || 0;
  const standardDrinks = parseFloat(document.getElementById('input-drinks').value) || 0;
  const drinkingHours = parseFloat(document.getElementById('input-hours').value) || 0;

  if (bodyWeight <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = `<p class="result-note">Please enter your body weight.</p>`;
    return;
  }

  // Widmark formula
  // BAC = (alcohol in grams) / (body weight in grams * r) - (elimination rate * hours)
  // 1 standard drink in AU = 10g of alcohol
  const alcoholGrams = standardDrinks * 10;
  const r = gender === 'male' ? 0.68 : 0.55;
  const eliminationRate = 0.015; // per hour

  const bac = Math.max(0, (alcoholGrams / (bodyWeight * 1000 * r)) * 100 - (eliminationRate * drinkingHours));

  // Time to reach zero
  const hoursToZero = bac > 0 ? bac / eliminationRate : 0;

  // Time to reach 0.05 (AU legal limit)
  const hoursToLegal = bac > 0.05 ? (bac - 0.05) / eliminationRate : 0;

  // Risk level
  let riskLevel = '';
  let riskClass = '';
  if (bac === 0) { riskLevel = 'Sober'; riskClass = ''; }
  else if (bac < 0.02) { riskLevel = 'Minimal impairment'; riskClass = ''; }
  else if (bac < 0.05) { riskLevel = 'Some impairment - under AU legal limit'; riskClass = ''; }
  else if (bac < 0.08) { riskLevel = 'Over AU legal limit (0.05)'; riskClass = 'highlight'; }
  else if (bac < 0.15) { riskLevel = 'Significant impairment'; riskClass = 'highlight'; }
  else { riskLevel = 'Severe impairment - dangerous'; riskClass = 'highlight'; }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row ${riskClass}"><span class="result-label">Estimated BAC</span><span class="result-value">${bac.toFixed(3)}%</span></div>
    <div class="result-row"><span class="result-label">Status</span><span class="result-value">${riskLevel}</span></div>
    <div class="result-row"><span class="result-label">AU Legal Limit</span><span class="result-value">0.050%</span></div>
    ${hoursToLegal > 0 ? `<div class="result-row highlight"><span class="result-label">Time to Reach 0.05%</span><span class="result-value">~${hoursToLegal.toFixed(1)} hours</span></div>` : ''}
    <div class="result-row highlight"><span class="result-label">Time to Reach 0.00%</span><span class="result-value">~${hoursToZero.toFixed(1)} hours</span></div>
    <div class="result-row"><span class="result-label">Alcohol Consumed</span><span class="result-value">${alcoholGrams.toFixed(0)}g (${standardDrinks} std drinks)</span></div>
    <div class="result-row"><span class="result-label">Widmark Factor (${gender})</span><span class="result-value">${r}</span></div>
    <p class="result-note"><strong>Disclaimer:</strong> This is an estimate only and should NOT be used to determine fitness to drive. BAC varies based on many factors including food intake, metabolism, medications, and hydration. When in doubt, don't drive. AU legal limit is 0.05% (0.00% for learners and P-platers).</p>
  `;
}
