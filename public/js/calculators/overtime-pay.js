function calculate() {
  const base = parseFloat(document.getElementById('input-baseHourlyRate').value) || 0;
  const hours15 = parseFloat(document.getElementById('input-overtimeHours15').value) || 0;
  const hours20 = parseFloat(document.getElementById('input-overtimeHours20').value) || 0;
  const phHours = parseFloat(document.getElementById('input-publicHolidayHours').value) || 0;

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
