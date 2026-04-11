function calculate() {
  const size = parseInt(document.getElementById('input-size').value) || 0;
  const fromSystem = document.getElementById('input-sizeSystem').value;

  // Conversion table: AU, US, UK, EU
  const chart = [
    { au: 4,  us: 0,  uk: 4,  eu: 32 },
    { au: 6,  us: 2,  uk: 6,  eu: 34 },
    { au: 8,  us: 4,  uk: 8,  eu: 36 },
    { au: 10, us: 6,  uk: 10, eu: 38 },
    { au: 12, us: 8,  uk: 12, eu: 40 },
    { au: 14, us: 10, uk: 14, eu: 42 },
    { au: 16, us: 12, uk: 16, eu: 44 },
    { au: 18, us: 14, uk: 18, eu: 46 },
    { au: 20, us: 16, uk: 20, eu: 48 },
    { au: 22, us: 18, uk: 22, eu: 50 },
    { au: 24, us: 20, uk: 24, eu: 52 },
    { au: 26, us: 22, uk: 26, eu: 54 },
  ];

  // Approximate body measurements for each AU size
  const measurements = [
    { au: 4,  bust: 76, waist: 58, hip: 82 },
    { au: 6,  bust: 80, waist: 62, hip: 86 },
    { au: 8,  bust: 84, waist: 66, hip: 90 },
    { au: 10, bust: 88, waist: 70, hip: 94 },
    { au: 12, bust: 92, waist: 74, hip: 98 },
    { au: 14, bust: 96, waist: 78, hip: 102 },
    { au: 16, bust: 100, waist: 82, hip: 106 },
    { au: 18, bust: 104, waist: 86, hip: 110 },
    { au: 20, bust: 110, waist: 92, hip: 116 },
    { au: 22, bust: 116, waist: 98, hip: 122 },
    { au: 24, bust: 122, waist: 104, hip: 128 },
    { au: 26, bust: 128, waist: 110, hip: 134 },
  ];

  // Find matching row
  const key = fromSystem.toLowerCase();
  const match = chart.find(r => r[key] === size);

  if (!match) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = `<p class="result-note">Size ${size} not found in ${fromSystem} system. Common ${fromSystem} sizes: ${chart.map(r => r[key]).join(', ')}</p>`;
    return;
  }

  const meas = measurements.find(m => m.au === match.au);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">Converting ${fromSystem} size ${size}</p>
    <div class="result-row ${fromSystem === 'AU' ? 'highlight' : ''}"><span class="result-label">Australian (AU)</span><span class="result-value">${match.au}</span></div>
    <div class="result-row ${fromSystem === 'US' ? 'highlight' : ''}"><span class="result-label">United States (US)</span><span class="result-value">${match.us}</span></div>
    <div class="result-row ${fromSystem === 'UK' ? 'highlight' : ''}"><span class="result-label">United Kingdom (UK)</span><span class="result-value">${match.uk}</span></div>
    <div class="result-row ${fromSystem === 'EU' ? 'highlight' : ''}"><span class="result-label">European (EU)</span><span class="result-value">${match.eu}</span></div>
    ${meas ? `
    <div class="result-row"><span class="result-label">Approx. Bust</span><span class="result-value">${meas.bust} cm</span></div>
    <div class="result-row"><span class="result-label">Approx. Waist</span><span class="result-value">${meas.waist} cm</span></div>
    <div class="result-row"><span class="result-label">Approx. Hip</span><span class="result-value">${meas.hip} cm</span></div>
    ` : ''}
    <p class="result-note">AU and UK sizes are generally the same. Sizes vary between brands. Always refer to the specific brand's size chart when available.</p>
  `;
}
