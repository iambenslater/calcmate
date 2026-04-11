function calculate() {
  const principal = parseFloat(document.getElementById('input-principal').value) || 0;
  const annualRate = (parseFloat(document.getElementById('input-annualRate').value) || 0) / 100;
  const years = parseFloat(document.getElementById('input-years').value) || 0;

  const interest = principal * annualRate * years;
  const totalAmount = principal + interest;
  const monthlyInterest = years > 0 ? interest / (years * 12) : 0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Principal</span><span class="result-value">${fmt(principal)}</span></div>
    <div class="result-row"><span class="result-label">Annual Rate</span><span class="result-value">${(annualRate * 100).toFixed(2)}%</span></div>
    <div class="result-row"><span class="result-label">Time Period</span><span class="result-value">${years} year${years !== 1 ? 's' : ''}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row highlight"><span class="result-label">Total Interest</span><span class="result-value">${fmt(interest)}</span></div>
    <div class="result-row highlight"><span class="result-label">Total Amount (Principal + Interest)</span><span class="result-value">${fmt(totalAmount)}</span></div>
    <div class="result-row"><span class="result-label">Monthly Interest</span><span class="result-value">${fmt(monthlyInterest)}</span></div>
    <div class="result-row"><span class="result-label">Daily Interest</span><span class="result-value">${fmt(interest / Math.max(1, years * 365))}</span></div>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
