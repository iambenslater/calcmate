function calculate() {
  const underBust = parseFloat(document.getElementById('input-underBust').value) || 0;
  const overBust = parseFloat(document.getElementById('input-overBust').value) || 0;

  if (underBust <= 0 || overBust <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = `<p class="result-note">Please enter both measurements in centimetres.</p>`;
    return;
  }

  // Band size: round underbust to nearest even number
  const bandCm = Math.round(underBust / 2) * 2;

  // Cup: difference between overbust and band
  const diff = Math.round(overBust - bandCm);

  // AU cup sizes (each cup = ~2cm difference)
  const cupChart = [
    { diff: 10, cup: 'AA' },
    { diff: 12, cup: 'A' },
    { diff: 14, cup: 'B' },
    { diff: 16, cup: 'C' },
    { diff: 18, cup: 'D' },
    { diff: 20, cup: 'DD' },
    { diff: 22, cup: 'E' },
    { diff: 24, cup: 'F' },
    { diff: 26, cup: 'FF' },
    { diff: 28, cup: 'G' },
    { diff: 30, cup: 'GG' },
    { diff: 32, cup: 'H' },
    { diff: 34, cup: 'HH' },
    { diff: 36, cup: 'J' },
  ];

  let cup = 'AA';
  for (const c of cupChart) {
    if (diff >= c.diff) cup = c.cup;
  }

  // Convert band from cm to AU band size
  // AU band sizes: 8=63cm, 10=68cm, 12=73cm, 14=78cm, 16=83cm, 18=88cm, 20=93cm, 22=98cm
  const bandSizes = [
    { cm: 63, au: 8, us: 30, uk: 30, eu: 60 },
    { cm: 68, au: 10, us: 32, uk: 32, eu: 65 },
    { cm: 73, au: 12, us: 34, uk: 34, eu: 70 },
    { cm: 78, au: 14, us: 36, uk: 36, eu: 75 },
    { cm: 83, au: 16, us: 38, uk: 38, eu: 80 },
    { cm: 88, au: 18, us: 40, uk: 40, eu: 85 },
    { cm: 93, au: 20, us: 42, uk: 42, eu: 90 },
    { cm: 98, au: 22, us: 44, uk: 44, eu: 95 },
  ];

  let bestBand = bandSizes[2]; // default 12
  let minDiff = 999;
  for (const b of bandSizes) {
    const d = Math.abs(b.cm - bandCm);
    if (d < minDiff) { minDiff = d; bestBand = b; }
  }

  // Sister sizes (one band up + one cup down, one band down + one cup up)
  const bandIdx = bandSizes.indexOf(bestBand);
  const cupIdx = cupChart.findIndex(c => c.cup === cup);
  let sisterUp = '', sisterDown = '';
  if (bandIdx < bandSizes.length - 1 && cupIdx > 0) {
    sisterUp = `${bandSizes[bandIdx + 1].au}${cupChart[cupIdx - 1].cup}`;
  }
  if (bandIdx > 0 && cupIdx < cupChart.length - 1) {
    sisterDown = `${bandSizes[bandIdx - 1].au}${cupChart[cupIdx + 1].cup}`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Underbust</span><span class="result-value">${underBust} cm</span></div>
    <div class="result-row"><span class="result-label">Overbust</span><span class="result-value">${overBust} cm</span></div>
    <div class="result-row"><span class="result-label">Difference</span><span class="result-value">${diff} cm</span></div>
    <div class="result-row highlight"><span class="result-label">AU Size</span><span class="result-value">${bestBand.au}${cup}</span></div>
    <div class="result-row"><span class="result-label">US/UK Size</span><span class="result-value">${bestBand.us}${cup}</span></div>
    <div class="result-row"><span class="result-label">EU Size</span><span class="result-value">${bestBand.eu}${cup}</span></div>
    ${sisterUp || sisterDown ? `<div class="result-row"><span class="result-label">Sister Sizes</span><span class="result-value">${[sisterDown, sisterUp].filter(Boolean).join(' / ')}</span></div>` : ''}
    <p class="result-note">Sister sizes have the same cup volume with different band fits. Always try on before buying as sizing varies between brands. Measure without a bra or in an unpadded bra.</p>
  `;
}
