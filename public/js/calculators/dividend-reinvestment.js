function calculate() {
  const initialInvestment = parseFloat(document.getElementById('input-initialInvestment').value) || 0;
  const dividendYield = parseFloat(document.getElementById('input-dividendYield').value) || 0;
  const capitalGrowthRate = parseFloat(document.getElementById('input-capitalGrowthRate').value) || 0;
  const reinvestDividends = document.getElementById('input-reinvestDividends').checked;
  const years = parseInt(document.getElementById('input-years').value) || 10;

  const divRate = dividendYield / 100;
  const growthRate = capitalGrowthRate / 100;

  let reinvestValue = initialInvestment;
  let cashValue = initialInvestment;
  let totalDividendsPaidOut = 0;
  let totalDividendsReinvested = 0;

  const tableRows = [];

  for (let y = 1; y <= years; y++) {
    // With reinvestment: dividends buy more shares, compound grows
    const reinvestDiv = reinvestValue * divRate;
    totalDividendsReinvested += reinvestDiv;
    reinvestValue = (reinvestValue + reinvestDiv) * (1 + growthRate);

    // Without reinvestment: capital grows, dividends taken as cash
    const cashDiv = cashValue * divRate;
    totalDividendsPaidOut += cashDiv;
    cashValue = cashValue * (1 + growthRate);

    if (y <= 10 || y === years || y % 5 === 0) {
      tableRows.push(`
        <div class="result-row"><span class="result-label">Year ${y}</span><span class="result-value">${reinvestDividends ? fmt(reinvestValue) : fmt(cashValue) + ' + ' + fmt(totalDividendsPaidOut) + ' divs'}</span></div>
      `);
    }
  }

  const reinvestTotal = reinvestValue;
  const cashTotal = cashValue + totalDividendsPaidOut;
  const difference = reinvestTotal - cashTotal;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">Initial: ${fmt(initialInvestment)} | Dividend yield: ${dividendYield}% | Capital growth: ${capitalGrowthRate}% | ${years} years</p>
    <div class="result-row highlight"><span class="result-label">With Reinvestment (${years}yr)</span><span class="result-value">${fmt(reinvestTotal)}</span></div>
    <div class="result-row"><span class="result-label">Without Reinvestment</span><span class="result-value">${fmt(cashValue)} portfolio + ${fmt(totalDividendsPaidOut)} dividends</span></div>
    <div class="result-row highlight"><span class="result-label">Without Reinvestment Total</span><span class="result-value">${fmt(cashTotal)}</span></div>
    <div class="result-row highlight"><span class="result-label">DRP Advantage</span><span class="result-value">${fmt(difference)} (${((difference / cashTotal) * 100).toFixed(1)}% more)</span></div>
    <div class="result-row"><span class="result-label">Total Growth</span><span class="result-value">${((reinvestDividends ? reinvestTotal : cashTotal) / initialInvestment * 100 - 100).toFixed(1)}%</span></div>
    <hr style="border-color: var(--border-light); margin: 1rem 0;">
    <p class="result-note"><strong>Year-by-year (${reinvestDividends ? 'reinvested' : 'cash dividends'}):</strong></p>
    ${tableRows.join('')}
    <p class="result-note">Assumes constant dividend yield and growth rate. Does not account for tax, franking credits, or market volatility. DRP (Dividend Reinvestment Plan) compounds returns over time.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', {minimumFractionDigits:2, maximumFractionDigits:2}); }
