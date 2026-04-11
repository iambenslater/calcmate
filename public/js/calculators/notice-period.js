function calculate() {
  const yearsOfService = parseFloat(document.getElementById('input-yearsService').value) || 0;
  const over45 = document.getElementById('input-over45')?.checked || false;
  const weeklyPay = parseFloat(document.getElementById('input-weeklyPay').value) || 0;

  if (yearsOfService < 0 || weeklyPay <= 0) {
    alert('Please enter valid values.');
    return;
  }

  // NES Minimum Notice Periods
  // Less than 1 year: 1 week
  // 1 to 3 years: 2 weeks
  // 3 to 5 years: 3 weeks
  // 5+ years: 4 weeks
  // +1 week if employee is over 45 and has 2+ years of service

  let baseNotice;
  let bracket;
  if (yearsOfService < 1) {
    baseNotice = 1;
    bracket = 'Less than 1 year';
  } else if (yearsOfService < 3) {
    baseNotice = 2;
    bracket = '1 to 3 years';
  } else if (yearsOfService < 5) {
    baseNotice = 3;
    bracket = '3 to 5 years';
  } else {
    baseNotice = 4;
    bracket = '5 or more years';
  }

  const over45Bonus = (over45 && yearsOfService >= 2) ? 1 : 0;
  const totalNotice = baseNotice + over45Bonus;
  const noticePay = totalNotice * weeklyPay;

  const dailyRate = weeklyPay / 5;
  const noticePayDays = totalNotice * 5;

  // Calculate last working day if notice given today
  const today = new Date();
  const lastDay = new Date(today);
  lastDay.setDate(lastDay.getDate() + totalNotice * 7);
  const lastDayFormatted = lastDay.toLocaleDateString('en-AU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Minimum Notice Period</span><span class="result-value">${totalNotice} week${totalNotice !== 1 ? 's' : ''}</span></div>
    <div class="result-row"><span class="result-label">Base Notice</span><span class="result-value">${baseNotice} week${baseNotice !== 1 ? 's' : ''} (${bracket})</span></div>
    ${over45Bonus ? `<div class="result-row"><span class="result-label">Over 45 Addition</span><span class="result-value">+1 week</span></div>` : ''}
    <div class="result-row"><span class="result-label">Working Days</span><span class="result-value">${noticePayDays} days</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Payment in Lieu of Notice</span><span class="result-value">${fmt(noticePay)}</span></div>
    <div class="result-row"><span class="result-label">Weekly Pay</span><span class="result-value">${fmt(weeklyPay)}</span></div>
    <div class="result-row"><span class="result-label">Daily Rate</span><span class="result-value">${fmt(dailyRate)}</span></div>
    <div class="result-row"><span class="result-label">Years of Service</span><span class="result-value">${yearsOfService}</span></div>
    <div class="result-row"><span class="result-label">Over 45 with 2+ Years</span><span class="result-value">${over45 && yearsOfService >= 2 ? 'Yes (+1 week)' : 'No'}</span></div>
    <div class="result-row"><span class="result-label">If Notice Given Today</span><span class="result-value">Last day: ${lastDayFormatted}</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>NES Notice Period Scale</strong>
    </div>
    <div class="result-row"><span class="result-label">Less than 1 year</span><span class="result-value">1 week</span></div>
    <div class="result-row"><span class="result-label">1 to 3 years</span><span class="result-value">2 weeks</span></div>
    <div class="result-row"><span class="result-label">3 to 5 years</span><span class="result-value">3 weeks</span></div>
    <div class="result-row"><span class="result-label">5+ years</span><span class="result-value">4 weeks</span></div>
    <div class="result-row"><span class="result-label">Over 45 with 2+ years</span><span class="result-value">+1 week additional</span></div>
    <p class="text-sm text-gray-500 mt-4">These are the minimum notice periods under the National Employment Standards (NES). Your award, enterprise agreement, or contract may provide for longer notice periods. The employer can choose to pay in lieu of notice instead of requiring you to work the notice period.</p>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
