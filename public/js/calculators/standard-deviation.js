function calculate() {
  const raw = document.getElementById('input-dataSet').value || '';
  const numbers = raw.split(',')
    .map(s => s.trim())
    .filter(s => s !== '' && !isNaN(s))
    .map(Number);

  if (numbers.length === 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p>Please enter comma-separated numbers (e.g. 10, 20, 30, 40, 50).</p>';
    return;
  }

  const n = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  // Variance (population)
  const variancePop = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const sdPop = Math.sqrt(variancePop);

  // Variance (sample)
  const varianceSample = n > 1 ? numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1) : 0;
  const sdSample = Math.sqrt(varianceSample);

  // Median
  const sorted = [...numbers].sort((a, b) => a - b);
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  // Mode
  const freq = {};
  numbers.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const modes = Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);
  const modeStr = maxFreq === 1 ? 'No mode (all unique)' : modes.join(', ');

  // Range
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  // Quartiles
  function quartile(arr, q) {
    const pos = (arr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return arr[base + 1] !== undefined
      ? arr[base] + rest * (arr[base + 1] - arr[base])
      : arr[base];
  }
  const q1 = quartile(sorted, 0.25);
  const q3 = quartile(sorted, 0.75);
  const iqr = q3 - q1;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Count (n)</span><span class="result-value">${n}</span></div>
    <div class="result-row"><span class="result-label">Sum</span><span class="result-value">${fmtNum(sum)}</span></div>
    <div class="result-row highlight"><span class="result-label">Mean (Average)</span><span class="result-value">${fmtNum(mean)}</span></div>
    <div class="result-row highlight"><span class="result-label">Median</span><span class="result-value">${fmtNum(median)}</span></div>
    <div class="result-row"><span class="result-label">Mode</span><span class="result-value">${modeStr}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row highlight"><span class="result-label">Standard Deviation (Population)</span><span class="result-value">${fmtNum(sdPop)}</span></div>
    <div class="result-row"><span class="result-label">Standard Deviation (Sample)</span><span class="result-value">${fmtNum(sdSample)}</span></div>
    <div class="result-row"><span class="result-label">Variance (Population)</span><span class="result-value">${fmtNum(variancePop)}</span></div>
    <div class="result-row"><span class="result-label">Variance (Sample)</span><span class="result-value">${fmtNum(varianceSample)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Minimum</span><span class="result-value">${fmtNum(min)}</span></div>
    <div class="result-row"><span class="result-label">Maximum</span><span class="result-value">${fmtNum(max)}</span></div>
    <div class="result-row"><span class="result-label">Range</span><span class="result-value">${fmtNum(range)}</span></div>
    <div class="result-row"><span class="result-label">Q1 (25th percentile)</span><span class="result-value">${fmtNum(q1)}</span></div>
    <div class="result-row"><span class="result-label">Q3 (75th percentile)</span><span class="result-value">${fmtNum(q3)}</span></div>
    <div class="result-row"><span class="result-label">IQR (Q3 - Q1)</span><span class="result-value">${fmtNum(iqr)}</span></div>
  `;
}

function fmtNum(n) { return n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 4 }); }
