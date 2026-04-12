function calculate() {
  const motherHeight = parseFloat(document.getElementById('input-motherHeight').value) || 0;
  const fatherHeight = parseFloat(document.getElementById('input-fatherHeight').value) || 0;
  const genderRadios = document.querySelectorAll('input[name="input-childGender"]');
  let gender = 'male';
  genderRadios.forEach(r => { if (r.checked) gender = r.value; });

  if (motherHeight === 0 || fatherHeight === 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p>Please enter both parent heights.</p>';
    return;
  }

  // Mid-parental height method
  // Boys: (mother + father + 13) / 2
  // Girls: (mother + father - 13) / 2
  const adjustment = gender === 'male' ? 13 : -13;
  const predicted = (motherHeight + fatherHeight + adjustment) / 2;

  // Range is typically +/- 8.5cm
  const rangeLow = predicted - 8.5;
  const rangeHigh = predicted + 8.5;

  // Convert to feet/inches for display
  function cmToFtIn(cm) {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Mother's Height</span><span class="result-value">${motherHeight.toFixed(1)} cm (${cmToFtIn(motherHeight)})</span></div>
    <div class="result-row"><span class="result-label">Father's Height</span><span class="result-value">${fatherHeight.toFixed(1)} cm (${cmToFtIn(fatherHeight)})</span></div>
    <div class="result-row"><span class="result-label">Child's Gender</span><span class="result-value">${gender === 'male' ? 'Male (+13cm)' : 'Female (-13cm)'}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row highlight"><span class="result-label">Predicted Adult Height</span><span class="result-value">${predicted.toFixed(1)} cm (${cmToFtIn(predicted)})</span></div>
    <div class="result-row"><span class="result-label">Likely Range</span><span class="result-value">${rangeLow.toFixed(1)} - ${rangeHigh.toFixed(1)} cm</span></div>
    <div class="result-row"><span class="result-label">Range in Feet</span><span class="result-value">${cmToFtIn(rangeLow)} - ${cmToFtIn(rangeHigh)}</span></div>
    <p style="margin-top:12px;font-size:0.85rem;color:var(--text-muted)">Based on the mid-parental height method. Actual height depends on nutrition, health, and other factors. Accuracy is approximately +/- 8.5cm.</p>
  `;
}

function getTLDR() {
  var motherHeight = parseFloat(document.getElementById('input-motherHeight').value) || 0;
  var fatherHeight = parseFloat(document.getElementById('input-fatherHeight').value) || 0;
  var genderRadios = document.querySelectorAll('input[name="input-childGender"]');
  var gender = 'male';
  genderRadios.forEach(function(r) { if (r.checked) gender = r.value; });
  if (motherHeight === 0 || fatherHeight === 0) return '';
  var adjustment = gender === 'male' ? 13 : -13;
  var predicted = (motherHeight + fatherHeight + adjustment) / 2;
  var rangeLow = (predicted - 8.5).toFixed(1);
  var rangeHigh = (predicted + 8.5).toFixed(1);
  function cmToFtIn(cm) { var totalInches = cm / 2.54; var feet = Math.floor(totalInches / 12); var inches = Math.round(totalInches % 12); return feet + '\'' + inches + '"'; }
  return 'Based on parent heights, your ' + (gender === 'male' ? 'son' : 'daughter') + '\'s predicted adult height is ' + predicted.toFixed(1) + ' cm (' + cmToFtIn(predicted) + '), with a likely range of ' + rangeLow + '–' + rangeHigh + ' cm.';
}
