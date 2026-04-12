function calculate() {
  const gender = document.querySelector('input[name="input-gender"]:checked')?.value ||
                 document.getElementById('input-gender')?.value || 'male';
  const height = parseFloat(document.getElementById('input-height').value) || 0;
  const neck = parseFloat(document.getElementById('input-neck').value) || 0;
  const waist = parseFloat(document.getElementById('input-waist').value) || 0;
  const hip = parseFloat(document.getElementById('input-hip').value) || 0;

  if (height <= 0 || neck <= 0 || waist <= 0) {
    document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter valid measurements.</p>';
    return;
  }

  let bodyFat;
  if (gender === 'male') {
    if (waist - neck <= 0) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Waist must be greater than neck measurement.</p>'; return; }
    bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    if (waist + hip - neck <= 0) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Waist + hip must be greater than neck measurement.</p>'; return; }
    bodyFat = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
  }

  bodyFat = Math.max(0, bodyFat);

  let category;
  if (gender === 'male') {
    if (bodyFat < 6) category = 'Essential Fat';
    else if (bodyFat < 14) category = 'Athletes';
    else if (bodyFat < 18) category = 'Fitness';
    else if (bodyFat < 25) category = 'Average';
    else category = 'Above Average';
  } else {
    if (bodyFat < 14) category = 'Essential Fat';
    else if (bodyFat < 21) category = 'Athletes';
    else if (bodyFat < 25) category = 'Fitness';
    else if (bodyFat < 32) category = 'Average';
    else category = 'Above Average';
  }

  const weightKg = 0; // optional — not required for BF%
  let leanMass = '';
  let fatMass = '';

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Body Fat Percentage</span><span class="result-value">${bodyFat.toFixed(1)}%</span></div>
    <div class="result-row"><span class="result-label">Category</span><span class="result-value">${category}</span></div>
    <div class="result-row"><span class="result-label">Method</span><span class="result-value">US Navy Method</span></div>
    <div class="result-row"><span class="result-label">Gender</span><span class="result-value">${gender === 'male' ? 'Male' : 'Female'}</span></div>
    <p class="text-sm text-gray-500 mt-4">The US Navy method estimates body fat using circumference measurements. For best accuracy, measure in centimetres at the narrowest point (neck), navel level (waist), and widest point (hips, females only).</p>
  `;
}

function getTLDR() {
  var gender = document.querySelector('input[name="input-gender"]:checked')?.value || document.getElementById('input-gender')?.value || 'male';
  var height = parseFloat(document.getElementById('input-height').value) || 0;
  var neck = parseFloat(document.getElementById('input-neck').value) || 0;
  var waist = parseFloat(document.getElementById('input-waist').value) || 0;
  var hip = parseFloat(document.getElementById('input-hip').value) || 0;
  if (height <= 0 || neck <= 0 || waist <= 0) return '';
  var bodyFat;
  if (gender === 'male') {
    if (waist - neck <= 0) return '';
    bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    if (waist + hip - neck <= 0) return '';
    bodyFat = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
  }
  bodyFat = Math.max(0, bodyFat);
  var category;
  if (gender === 'male') {
    if (bodyFat < 6) category = 'Essential Fat'; else if (bodyFat < 14) category = 'Athletes'; else if (bodyFat < 18) category = 'Fitness'; else if (bodyFat < 25) category = 'Average'; else category = 'Above Average';
  } else {
    if (bodyFat < 14) category = 'Essential Fat'; else if (bodyFat < 21) category = 'Athletes'; else if (bodyFat < 25) category = 'Fitness'; else if (bodyFat < 32) category = 'Average'; else category = 'Above Average';
  }
  return 'Using the US Navy method, your estimated body fat is ' + bodyFat.toFixed(1) + '% — placing you in the ' + category + ' category for ' + (gender === 'male' ? 'men' : 'women') + '.';
}
