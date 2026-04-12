function calculate() {
  const base = parseFloat(document.getElementById('input-baseRate').value) || 0;
  const hours15 = parseFloat(document.getElementById('input-otHours150').value) || 0;
  const hours20 = parseFloat(document.getElementById('input-otHours200').value) || 0;
  const phHours = parseFloat(document.getElementById('input-pubHolHours').value) || 0;

  const pay15 = base * 1.5 * hours15;
  const pay20 = base * 2.0 * hours20;
  const payPH = base * 2.5 * phHours;
  const totalOT = pay15 + pay20 + payPH;
  const totalHours = hours15 + hours20 + phHours;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Base Hourly Rate</span><span class="result-value">${fmt(base)}/hr</span></div>
    <div class="result-row"><span class="result-label">Time-and-a-half (1.5x) Pay</span><span class="result-value">${fmt(pay15)}</span></div>
    <div class="result-row"><span class="result-label">Double Time (2x) Pay</span><span class="result-value">${fmt(pay20)}</span></div>
    <div class="result-row"><span class="result-label">Public Holiday (2.5x) Pay</span><span class="result-value">${fmt(payPH)}</span></div>
    <div class="result-row highlight"><span class="result-label">Total Overtime Pay</span><span class="result-value">${fmt(totalOT)}</span></div>
    <div class="result-row"><span class="result-label">Total Overtime Hours</span><span class="result-value">${totalHours.toFixed(1)} hrs</span></div>
    <div class="result-row"><span class="result-label">Effective OT Rate</span><span class="result-value">${totalHours > 0 ? fmt(totalOT / totalHours) : '$0.00'}/hr</span></div>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getTLDR() {
  const base = parseFloat(document.getElementById('input-baseRate').value) || 0;
  if (base <= 0) return '';
  const hours15 = parseFloat(document.getElementById('input-otHours150').value) || 0;
  const hours20 = parseFloat(document.getElementById('input-otHours200').value) || 0;
  const phHours = parseFloat(document.getElementById('input-pubHolHours').value) || 0;
  const totalOT = base * 1.5 * hours15 + base * 2.0 * hours20 + base * 2.5 * phHours;
  const totalHours = hours15 + hours20 + phHours;
  if (totalHours === 0) return '';
  return 'For ' + totalHours.toFixed(1) + ' hours of overtime at a base rate of ' + fmt(base) + '/hr, you\'ll earn ' + fmt(totalOT) + ' in overtime pay (effective rate: ' + fmt(totalOT / totalHours) + '/hr).';
}
