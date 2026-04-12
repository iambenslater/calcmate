function calculate() {
  // Assets
  const cash           = parseFloat(document.getElementById('input-cash').value)            || 0;
  const super_         = parseFloat(document.getElementById('input-superBalance').value)    || 0;
  const property       = parseFloat(document.getElementById('input-propertyValue').value)   || 0;
  const vehicle        = parseFloat(document.getElementById('input-vehicleValue').value)    || 0;
  const investments    = parseFloat(document.getElementById('input-investmentValue').value) || 0;
  const otherAssets    = parseFloat(document.getElementById('input-otherAssets').value)     || 0;

  // Liabilities
  const mortgage       = parseFloat(document.getElementById('input-mortgageOwing').value)   || 0;
  const carLoan        = parseFloat(document.getElementById('input-carLoan').value)         || 0;
  const creditCard     = parseFloat(document.getElementById('input-creditCardDebt').value)  || 0;
  const studentDebt    = parseFloat(document.getElementById('input-studentDebt').value)     || 0;
  const otherDebts     = parseFloat(document.getElementById('input-otherDebts').value)      || 0;

  // Age
  const age            = parseInt(document.getElementById('input-age').value)               || 30;

  const totalAssets      = cash + super_ + property + vehicle + investments + otherAssets;
  const totalLiabilities = mortgage + carLoan + creditCard + studentDebt + otherDebts;
  const netWorth         = totalAssets - totalLiabilities;

  // ABS-based Australian median net worth by age bracket (approximate, 2021-22 survey data)
  // Source: ABS Household Income and Wealth, Australia 2021-22
  const medianData = [
    { label: 'Under 25',  min: 0,  max: 24,  median: 35000,   p25: 5000,    p75: 80000 },
    { label: '25–34',     min: 25, max: 34,  median: 150000,  p25: 25000,   p75: 370000 },
    { label: '35–44',     min: 35, max: 44,  median: 500000,  p25: 130000,  p75: 950000 },
    { label: '45–54',     min: 45, max: 54,  median: 850000,  p25: 280000,  p75: 1500000 },
    { label: '55–64',     min: 55, max: 64,  median: 1100000, p25: 420000,  p75: 1900000 },
    { label: '65+',       min: 65, max: 999, median: 1000000, p25: 340000,  p75: 1750000 },
  ];

  const bracket = medianData.find(b => age >= b.min && age <= b.max) || medianData[1];

  // Rough percentile estimate using a log-normal approximation around the median
  // We have p25 and p75 to anchor two points; interpolate/extrapolate for user's value
  function estimatePercentile(value, p25, median, p75) {
    if (value <= 0) return 'Below 25th';
    if (value < p25) {
      const frac = value / p25;
      const est = Math.round(25 * frac);
      return `~${Math.max(est, 1)}th percentile`;
    }
    if (value < median) {
      const frac = (value - p25) / (median - p25);
      const est = Math.round(25 + 25 * frac);
      return `~${est}th percentile`;
    }
    if (value < p75) {
      const frac = (value - median) / (p75 - median);
      const est = Math.round(50 + 25 * frac);
      return `~${est}th percentile`;
    }
    // Above p75 — extrapolate gently
    const frac = Math.min((value - p75) / p75, 2);
    const est = Math.round(75 + 20 * frac);
    return `~${Math.min(est, 99)}th percentile`;
  }

  const percentileStr = estimatePercentile(netWorth, bracket.p25, bracket.median, bracket.p75);
  const vsMedian = netWorth - bracket.median;
  const vsMedianLabel = vsMedian >= 0
    ? `${fmt(vsMedian)} above the median`
    : `${fmt(Math.abs(vsMedian))} below the median`;

  const nwColour = netWorth >= 0 ? 'color:#276749' : 'color:#c53030';

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <h4>Assets breakdown</h4>
    ${cash        > 0 ? `<div class="result-row"><span class="result-label">Cash &amp; savings</span><span class="result-value">${fmt(cash)}</span></div>` : ''}
    ${super_      > 0 ? `<div class="result-row"><span class="result-label">Superannuation</span><span class="result-value">${fmt(super_)}</span></div>` : ''}
    ${property    > 0 ? `<div class="result-row"><span class="result-label">Property value</span><span class="result-value">${fmt(property)}</span></div>` : ''}
    ${vehicle     > 0 ? `<div class="result-row"><span class="result-label">Vehicles</span><span class="result-value">${fmt(vehicle)}</span></div>` : ''}
    ${investments > 0 ? `<div class="result-row"><span class="result-label">Investments (shares, ETFs etc.)</span><span class="result-value">${fmt(investments)}</span></div>` : ''}
    ${otherAssets > 0 ? `<div class="result-row"><span class="result-label">Other assets</span><span class="result-value">${fmt(otherAssets)}</span></div>` : ''}
    <div class="result-row font-bold"><span class="result-label">Total assets</span><span class="result-value">${fmt(totalAssets)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <h4>Liabilities breakdown</h4>
    ${mortgage    > 0 ? `<div class="result-row"><span class="result-label">Mortgage owing</span><span class="result-value">${fmt(mortgage)}</span></div>` : ''}
    ${carLoan     > 0 ? `<div class="result-row"><span class="result-label">Car loan</span><span class="result-value">${fmt(carLoan)}</span></div>` : ''}
    ${creditCard  > 0 ? `<div class="result-row"><span class="result-label">Credit card debt</span><span class="result-value">${fmt(creditCard)}</span></div>` : ''}
    ${studentDebt > 0 ? `<div class="result-row"><span class="result-label">HECS-HELP / student debt</span><span class="result-value">${fmt(studentDebt)}</span></div>` : ''}
    ${otherDebts  > 0 ? `<div class="result-row"><span class="result-label">Other debts</span><span class="result-value">${fmt(otherDebts)}</span></div>` : ''}
    ${totalLiabilities === 0 ? '<div class="result-row"><span class="result-label">No liabilities entered</span></div>' : ''}
    <div class="result-row font-bold"><span class="result-label">Total liabilities</span><span class="result-value">${fmt(totalLiabilities)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row font-bold"><span class="result-label">Net worth</span><span class="result-value" style="${nwColour}">${fmt(netWorth)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <h4>How you compare — Australians aged ${bracket.label}</h4>
    <div class="result-row"><span class="result-label">Median net worth (your age group)</span><span class="result-value">${fmt(bracket.median)}</span></div>
    <div class="result-row"><span class="result-label">Your net worth vs median</span><span class="result-value">${vsMedianLabel}</span></div>
    <div class="result-row font-bold"><span class="result-label">Estimated percentile</span><span class="result-value">${percentileStr}</span></div>
    <div class="result-row" style="font-size:0.82em;color:#718096"><span class="result-label">Benchmarks based on ABS Household Income and Wealth, Australia 2021–22. Percentile estimates are approximations. Super is included in net worth, consistent with ABS methodology.</span></div>
  `;
}

function fmt(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function getTLDR() {
  const cash        = parseFloat(document.getElementById('input-cash').value)            || 0;
  const super_      = parseFloat(document.getElementById('input-superBalance').value)    || 0;
  const property    = parseFloat(document.getElementById('input-propertyValue').value)   || 0;
  const vehicle     = parseFloat(document.getElementById('input-vehicleValue').value)    || 0;
  const investments = parseFloat(document.getElementById('input-investmentValue').value) || 0;
  const otherAssets = parseFloat(document.getElementById('input-otherAssets').value)     || 0;
  const mortgage    = parseFloat(document.getElementById('input-mortgageOwing').value)   || 0;
  const carLoan     = parseFloat(document.getElementById('input-carLoan').value)         || 0;
  const creditCard  = parseFloat(document.getElementById('input-creditCardDebt').value)  || 0;
  const studentDebt = parseFloat(document.getElementById('input-studentDebt').value)     || 0;
  const otherDebts  = parseFloat(document.getElementById('input-otherDebts').value)      || 0;
  const age         = parseInt(document.getElementById('input-age').value)               || 30;
  const totalAssets = cash + super_ + property + vehicle + investments + otherAssets;
  const totalLiabilities = mortgage + carLoan + creditCard + studentDebt + otherDebts;
  if (totalAssets === 0 && totalLiabilities === 0) return '';
  const netWorth = totalAssets - totalLiabilities;
  const medianData = [
    { min: 0,  max: 24,  median: 35000 }, { min: 25, max: 34, median: 150000 },
    { min: 35, max: 44,  median: 500000 }, { min: 45, max: 54, median: 850000 },
    { min: 55, max: 64,  median: 1100000 }, { min: 65, max: 999, median: 1000000 },
  ];
  const bracket = medianData.find(b => age >= b.min && age <= b.max) || medianData[1];
  const vsMedian = netWorth - bracket.median;
  const comparison = vsMedian >= 0 ? fmt(vsMedian) + ' above' : fmt(Math.abs(vsMedian)) + ' below';
  return 'Your net worth is ' + fmt(netWorth) + ' (' + fmt(totalAssets) + ' in assets minus ' + fmt(totalLiabilities) + ' in liabilities) — ' + comparison + ' the Australian median for your age group.';
}
