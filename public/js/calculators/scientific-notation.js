function calculate() {
  const raw = document.getElementById('input-number').value.trim();
  if (!raw) return;

  let number;
  // Handle scientific notation input like 3.5e8 or 3.5 x 10^8
  const sciMatch = raw.match(/^([+-]?\d*\.?\d+)\s*[xX\*]\s*10\^([+-]?\d+)$/);
  if (sciMatch) {
    number = parseFloat(sciMatch[1]) * Math.pow(10, parseInt(sciMatch[2]));
  } else {
    number = parseFloat(raw);
  }

  if (isNaN(number)) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = `<p class="result-note">Please enter a valid number (e.g. 12345, 0.0034, or 3.5e8)</p>`;
    return;
  }

  // Scientific notation
  const exp = number === 0 ? 0 : Math.floor(Math.log10(Math.abs(number)));
  const coeff = number / Math.pow(10, exp);

  // Engineering notation (exponent divisible by 3)
  const engExp = Math.floor(exp / 3) * 3;
  const engCoeff = number / Math.pow(10, engExp);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Standard Form</span><span class="result-value">${number.toLocaleString('en-AU', {maximumFractionDigits: 20})}</span></div>
    <div class="result-row highlight"><span class="result-label">Scientific Notation</span><span class="result-value">${coeff.toFixed(6).replace(/\.?0+$/, '')} &times; 10<sup>${exp}</sup></span></div>
    <div class="result-row"><span class="result-label">E Notation</span><span class="result-value">${number.toExponential(6).replace(/\.?0+e/, 'e')}</span></div>
    <div class="result-row"><span class="result-label">Engineering Notation</span><span class="result-value">${engCoeff.toFixed(4).replace(/\.?0+$/, '')} &times; 10<sup>${engExp}</sup></span></div>
    <div class="result-row"><span class="result-label">Number of Digits</span><span class="result-value">${Math.abs(number).toString().replace('.', '').replace(/^0+/, '').length}</span></div>
  `;
}
