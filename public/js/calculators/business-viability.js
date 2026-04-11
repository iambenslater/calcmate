function calculate() {
  const startupCosts = parseFloat(document.getElementById('input-startupCosts').value) || 0;
  const monthlyRevenue = parseFloat(document.getElementById('input-monthlyRevenue').value) || 0;
  const monthlyExpenses = parseFloat(document.getElementById('input-monthlyExpenses').value) || 0;
  const growthRate = (parseFloat(document.getElementById('input-monthlyGrowthRate').value) || 0) / 100;

  let cumulative = -startupCosts;
  let breakEvenMonth = null;
  const months = 36;
  let rows = '';

  for (let m = 1; m <= months; m++) {
    const rev = monthlyRevenue * Math.pow(1 + growthRate, m - 1);
    const cashflow = rev - monthlyExpenses;
    cumulative += cashflow;
    if (breakEvenMonth === null && cumulative >= 0) {
      breakEvenMonth = m;
    }
    if (m <= 12 || m === 24 || m === 36 || m === breakEvenMonth) {
      rows += `<div class="result-row"><span class="result-label">Month ${m}</span><span class="result-value">CF: ${fmt(cashflow)} | Cumulative: ${fmt(cumulative)}</span></div>`;
    }
  }

  const monthlyNet = monthlyRevenue - monthlyExpenses;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Startup Costs</span><span class="result-value">${fmt(startupCosts)}</span></div>
    <div class="result-row"><span class="result-label">Month 1 Net Cashflow</span><span class="result-value">${fmt(monthlyNet)}</span></div>
    <div class="result-row highlight"><span class="result-label">Break-even Month</span><span class="result-value">${breakEvenMonth ? 'Month ' + breakEvenMonth : 'Not within 36 months'}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Monthly Projection</span><span class="result-value"></span></div>
    ${rows}
  `;
}

function fmt(n) { return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
