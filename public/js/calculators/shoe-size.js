function calculate() {
  const footLength = parseFloat(document.getElementById('input-footLength').value) || 0;
  const genderRadios = document.getElementsByName('input-gender');
  let gender = 'male';
  for (const r of genderRadios) { if (r.checked) gender = r.value; }

  if (footLength < 15 || footLength > 35) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = `<p class="result-note">Please enter foot length between 15cm and 35cm.</p>`;
    return;
  }

  // Conversion tables based on foot length (cm)
  // Men's sizes
  const menSizes = [
    { cm: 24.0, au: 5, us: 6, uk: 5, eu: 38 },
    { cm: 24.5, au: 5.5, us: 6.5, uk: 5.5, eu: 38.5 },
    { cm: 25.0, au: 6, us: 7, uk: 6, eu: 39 },
    { cm: 25.5, au: 6.5, us: 7.5, uk: 6.5, eu: 40 },
    { cm: 26.0, au: 7, us: 8, uk: 7, eu: 41 },
    { cm: 26.5, au: 7.5, us: 8.5, uk: 7.5, eu: 41.5 },
    { cm: 27.0, au: 8, us: 9, uk: 8, eu: 42 },
    { cm: 27.5, au: 8.5, us: 9.5, uk: 8.5, eu: 42.5 },
    { cm: 28.0, au: 9, us: 10, uk: 9, eu: 43 },
    { cm: 28.5, au: 9.5, us: 10.5, uk: 9.5, eu: 44 },
    { cm: 29.0, au: 10, us: 11, uk: 10, eu: 44.5 },
    { cm: 29.5, au: 10.5, us: 11.5, uk: 10.5, eu: 45 },
    { cm: 30.0, au: 11, us: 12, uk: 11, eu: 46 },
    { cm: 30.5, au: 11.5, us: 12.5, uk: 11.5, eu: 46.5 },
    { cm: 31.0, au: 12, us: 13, uk: 12, eu: 47 },
    { cm: 32.0, au: 13, us: 14, uk: 13, eu: 48 },
  ];

  // Women's sizes
  const womenSizes = [
    { cm: 22.0, au: 5, us: 5, uk: 3, eu: 35.5 },
    { cm: 22.5, au: 5.5, us: 5.5, uk: 3.5, eu: 36 },
    { cm: 23.0, au: 6, us: 6, uk: 4, eu: 36.5 },
    { cm: 23.5, au: 6.5, us: 6.5, uk: 4.5, eu: 37 },
    { cm: 24.0, au: 7, us: 7, uk: 5, eu: 37.5 },
    { cm: 24.5, au: 7.5, us: 7.5, uk: 5.5, eu: 38 },
    { cm: 25.0, au: 8, us: 8, uk: 6, eu: 39 },
    { cm: 25.5, au: 8.5, us: 8.5, uk: 6.5, eu: 39.5 },
    { cm: 26.0, au: 9, us: 9, uk: 7, eu: 40 },
    { cm: 26.5, au: 9.5, us: 9.5, uk: 7.5, eu: 41 },
    { cm: 27.0, au: 10, us: 10, uk: 8, eu: 42 },
    { cm: 27.5, au: 10.5, us: 10.5, uk: 8.5, eu: 42.5 },
    { cm: 28.0, au: 11, us: 11, uk: 9, eu: 43 },
  ];

  const sizes = gender === 'male' ? menSizes : womenSizes;

  // Find closest match
  let best = sizes[0];
  let minDiff = 999;
  for (const s of sizes) {
    const diff = Math.abs(s.cm - footLength);
    if (diff < minDiff) { minDiff = diff; best = s; }
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${gender === 'male' ? "Men's" : "Women's"} shoe size for ${footLength}cm foot length</p>
    <div class="result-row highlight"><span class="result-label">AU/US${gender === 'male' ? '' : ' (AU)'} Size</span><span class="result-value">${best.au}</span></div>
    <div class="result-row highlight"><span class="result-label">US Size</span><span class="result-value">${best.us}</span></div>
    <div class="result-row highlight"><span class="result-label">UK Size</span><span class="result-value">${best.uk}</span></div>
    <div class="result-row highlight"><span class="result-label">EU Size</span><span class="result-value">${best.eu}</span></div>
    <div class="result-row"><span class="result-label">Closest Chart Length</span><span class="result-value">${best.cm} cm</span></div>
    <p class="result-note">Sizes are approximate. Fit varies by brand and shoe style. Measure your foot at the end of the day when feet are slightly larger. In Australia, men's sizes = US sizes. Women's AU sizes may differ slightly from US.</p>
  `;
}
