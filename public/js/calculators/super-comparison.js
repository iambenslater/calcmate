function calculate() {
  const balance = parseFloat(document.getElementById('input-currentBalance').value) || 0;
  const f1Fees = (parseFloat(document.getElementById('input-fund1Fee').value) || 0) / 100;
  const f1Return = (parseFloat(document.getElementById('input-fund1Return').value) || 0) / 100;
  const f1Insurance = parseFloat(document.getElementById('input-fund1Insurance').value) || 0;
  const f2Fees = (parseFloat(document.getElementById('input-fund2Fee').value) || 0) / 100;
  const f2Return = (parseFloat(document.getElementById('input-fund2Return').value) || 0) / 100;
  const f2Insurance = parseFloat(document.getElementById('input-fund2Insurance').value) || 0;

  const years = [1, 5, 10, 20, 30];
  let bal1 = balance;
  let bal2 = balance;
  let rows = '';

  const f1NetReturn = f1Return - f1Fees;
  const f2NetReturn = f2Return - f2Fees;

  for (let y = 1; y <= 30; y++) {
    bal1 = (bal1 - f1Insurance) * (1 + f1NetReturn);
    bal2 = (bal2 - f2Insurance) * (1 + f2NetReturn);
    if (years.includes(y)) {
      const diff = bal1 - bal2;
      rows += `<div class="result-row"><span class="result-label">Year ${y}</span><span class="result-value">Fund 1: ${fmt(bal1)} | Fund 2: ${fmt(bal2)} | Diff: ${fmt(diff)}</span></div>`;
    }
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Starting Balance</span><span class="result-value">${fmt(balance)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Fund 1 Net Return</span><span class="result-value">${(f1NetReturn * 100).toFixed(2)}% (${(f1Return * 100).toFixed(2)}% - ${(f1Fees * 100).toFixed(2)}% fees)</span></div>
    <div class="result-row"><span class="result-label">Fund 1 Insurance</span><span class="result-value">${fmt(f1Insurance)}/yr</span></div>
    <div class="result-row"><span class="result-label">Fund 2 Net Return</span><span class="result-value">${(f2NetReturn * 100).toFixed(2)}% (${(f2Return * 100).toFixed(2)}% - ${(f2Fees * 100).toFixed(2)}% fees)</span></div>
    <div class="result-row"><span class="result-label">Fund 2 Insurance</span><span class="result-value">${fmt(f2Insurance)}/yr</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Projected Balance Comparison</span><span class="result-value"></span></div>
    ${rows}
    <div class="result-row highlight"><span class="result-label">30-Year Difference</span><span class="result-value">${fmt(Math.abs(bal1 - bal2))} in favour of Fund ${bal1 >= bal2 ? '1' : '2'}</span></div>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getTLDR() {
  const balance = parseFloat(document.getElementById('input-currentBalance').value) || 0;
  if (balance <= 0) return '';

  const f1Fees = (parseFloat(document.getElementById('input-fund1Fee').value) || 0) / 100;
  const f1Return = (parseFloat(document.getElementById('input-fund1Return').value) || 0) / 100;
  const f1Insurance = parseFloat(document.getElementById('input-fund1Insurance').value) || 0;
  const f2Fees = (parseFloat(document.getElementById('input-fund2Fee').value) || 0) / 100;
  const f2Return = (parseFloat(document.getElementById('input-fund2Return').value) || 0) / 100;
  const f2Insurance = parseFloat(document.getElementById('input-fund2Insurance').value) || 0;

  const f1NetReturn = f1Return - f1Fees;
  const f2NetReturn = f2Return - f2Fees;
  let bal1 = balance;
  let bal2 = balance;
  for (let y = 1; y <= 30; y++) {
    bal1 = (bal1 - f1Insurance) * (1 + f1NetReturn);
    bal2 = (bal2 - f2Insurance) * (1 + f2NetReturn);
  }

  const diff = Math.abs(bal1 - bal2);
  const winner = bal1 >= bal2 ? 'Fund 1' : 'Fund 2';
  return 'Over 30 years, ' + winner + ' comes out ahead by ' + fmt(diff) + ' — from a starting balance of ' + fmt(balance) + ', Fund 1 would reach ' + fmt(bal1) + ' vs Fund 2 at ' + fmt(bal2) + '.';
}
