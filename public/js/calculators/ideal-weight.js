function calculate() {
  const heightCm = parseFloat(document.getElementById('input-height').value) || 0;
  const gender = document.querySelector('input[name="input-gender"]:checked')?.value ||
                 document.getElementById('input-gender')?.value || 'male';

  if (heightCm <= 0) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid height in cm.</p>'; return; }

  const heightIn = heightCm / 2.54;
  const inchesOver5ft = Math.max(0, heightIn - 60);

  let devine, robinson, miller, hamwi;

  if (gender === 'male') {
    devine = 50.0 + 2.3 * inchesOver5ft;
    robinson = 52.0 + 1.9 * inchesOver5ft;
    miller = 56.2 + 1.41 * inchesOver5ft;
    hamwi = 48.0 + 2.7 * inchesOver5ft;
  } else {
    devine = 45.5 + 2.3 * inchesOver5ft;
    robinson = 49.0 + 1.7 * inchesOver5ft;
    miller = 53.1 + 1.36 * inchesOver5ft;
    hamwi = 45.5 + 2.2 * inchesOver5ft;
  }

  const avg = (devine + robinson + miller + hamwi) / 4;

  function fmtKg(n) { return n.toFixed(1) + ' kg'; }
  function fmtLb(n) { return (n * 2.20462).toFixed(1) + ' lb'; }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Devine Formula</span><span class="result-value">${fmtKg(devine)} (${fmtLb(devine)})</span></div>
    <div class="result-row"><span class="result-label">Robinson Formula</span><span class="result-value">${fmtKg(robinson)} (${fmtLb(robinson)})</span></div>
    <div class="result-row"><span class="result-label">Miller Formula</span><span class="result-value">${fmtKg(miller)} (${fmtLb(miller)})</span></div>
    <div class="result-row"><span class="result-label">Hamwi Formula</span><span class="result-value">${fmtKg(hamwi)} (${fmtLb(hamwi)})</span></div>
    <div class="result-row" style="border-top: 2px solid #e5e7eb; padding-top: 0.5rem; margin-top: 0.5rem;"><span class="result-label">Average</span><span class="result-value">${fmtKg(avg)} (${fmtLb(avg)})</span></div>
    <p class="text-sm text-gray-500 mt-4">These formulas estimate ideal body weight based on height. They were originally designed for drug dosage calculations and provide a rough guide only. Individual factors like muscle mass, frame size, and body composition are not considered.</p>
  `;
}
