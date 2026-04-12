function calculate() {
  const yearsOfService = parseFloat(document.getElementById('input-yearsService').value) || 0;
  const baseWeeklyPay = parseFloat(document.getElementById('input-basePay').value) || 0;
  const hoursPerWeek = parseFloat(document.getElementById('input-hoursPerWeek').value) || 38;

  if (yearsOfService <= 0 || baseWeeklyPay <= 0) {
    document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter valid values.</p>';
    return;
  }

  // NES Redundancy Pay Scale
  // Less than 1 year: 0 weeks
  // 1 year: 4 weeks
  // 2 years: 6 weeks
  // 3 years: 7 weeks
  // 4 years: 8 weeks
  // 5 years: 10 weeks
  // 6 years: 11 weeks
  // 7 years: 13 weeks
  // 8 years: 14 weeks
  // 9 years: 16 weeks
  // 10+ years: 12 weeks
  const scale = [
    { min: 0,  max: 1,  weeks: 0 },
    { min: 1,  max: 2,  weeks: 4 },
    { min: 2,  max: 3,  weeks: 6 },
    { min: 3,  max: 4,  weeks: 7 },
    { min: 4,  max: 5,  weeks: 8 },
    { min: 5,  max: 6,  weeks: 10 },
    { min: 6,  max: 7,  weeks: 11 },
    { min: 7,  max: 8,  weeks: 13 },
    { min: 8,  max: 9,  weeks: 14 },
    { min: 9,  max: 10, weeks: 16 },
    { min: 10, max: 999, weeks: 12 },
  ];

  let redundancyWeeks = 0;
  for (const bracket of scale) {
    if (yearsOfService >= bracket.min && yearsOfService < bracket.max) {
      redundancyWeeks = bracket.weeks;
      break;
    }
    if (yearsOfService >= bracket.min && bracket.max === 999) {
      redundancyWeeks = bracket.weeks;
      break;
    }
  }

  const ftRatio = hoursPerWeek / 38;
  const adjustedWeeklyPay = baseWeeklyPay;
  const redundancyPay = redundancyWeeks * adjustedWeeklyPay;

  // Notice period under NES
  let noticeWeeks;
  if (yearsOfService < 1) noticeWeeks = 1;
  else if (yearsOfService < 3) noticeWeeks = 2;
  else if (yearsOfService < 5) noticeWeeks = 3;
  else noticeWeeks = 4;

  const noticePay = noticeWeeks * adjustedWeeklyPay;
  const totalPayout = redundancyPay + noticePay;

  // Build scale reference table
  let scaleRows = '';
  for (const bracket of scale) {
    const label = bracket.max === 999 ? '10+ years' : `${bracket.min}-${bracket.max} years`;
    const isCurrent = yearsOfService >= bracket.min && (yearsOfService < bracket.max || bracket.max === 999);
    const style = isCurrent ? 'font-weight: bold; background: #f0f9ff;' : '';
    scaleRows += `<div class="result-row" style="${style}"><span class="result-label">${label}</span><span class="result-value">${bracket.weeks} weeks</span></div>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Redundancy Pay</span><span class="result-value">${fmt(redundancyPay)} (${redundancyWeeks} weeks)</span></div>
    <div class="result-row"><span class="result-label">Notice Pay</span><span class="result-value">${fmt(noticePay)} (${noticeWeeks} weeks)</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">Total Payout</span><span class="result-value">${fmt(totalPayout)}</span></div>
    <div class="result-row"><span class="result-label">Years of Service</span><span class="result-value">${yearsOfService}</span></div>
    <div class="result-row"><span class="result-label">Base Weekly Pay</span><span class="result-value">${fmt(baseWeeklyPay)}</span></div>
    <div class="result-row"><span class="result-label">Hours per Week</span><span class="result-value">${hoursPerWeek}</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>NES Redundancy Pay Scale</strong>
    </div>
    ${scaleRows}
    <p class="text-sm text-gray-500 mt-4">Redundancy pay under the National Employment Standards (NES) is based on continuous service with the employer. The NES scale reduces to 12 weeks after 10 years. Some awards, enterprise agreements, or contracts may provide higher amounts. Small businesses (fewer than 15 employees) may be exempt from paying redundancy. Notice pay is in addition to redundancy pay.</p>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getTLDR() {
  const yearsOfService = parseFloat(document.getElementById('input-yearsService').value) || 0;
  const baseWeeklyPay = parseFloat(document.getElementById('input-basePay').value) || 0;

  if (yearsOfService <= 0 || baseWeeklyPay <= 0) return '';

  const scale = [
    { min: 0, max: 1, weeks: 0 }, { min: 1, max: 2, weeks: 4 }, { min: 2, max: 3, weeks: 6 },
    { min: 3, max: 4, weeks: 7 }, { min: 4, max: 5, weeks: 8 }, { min: 5, max: 6, weeks: 10 },
    { min: 6, max: 7, weeks: 11 }, { min: 7, max: 8, weeks: 13 }, { min: 8, max: 9, weeks: 14 },
    { min: 9, max: 10, weeks: 16 }, { min: 10, max: 999, weeks: 12 },
  ];

  let redundancyWeeks = 0;
  for (const bracket of scale) {
    if (yearsOfService >= bracket.min && (yearsOfService < bracket.max || bracket.max === 999)) {
      redundancyWeeks = bracket.weeks;
      break;
    }
  }

  let noticeWeeks;
  if (yearsOfService < 1) noticeWeeks = 1;
  else if (yearsOfService < 3) noticeWeeks = 2;
  else if (yearsOfService < 5) noticeWeeks = 3;
  else noticeWeeks = 4;

  const redundancyPay = redundancyWeeks * baseWeeklyPay;
  const noticePay = noticeWeeks * baseWeeklyPay;
  const totalPayout = redundancyPay + noticePay;

  return 'After ' + yearsOfService + ' year' + (yearsOfService !== 1 ? 's' : '') + ' of service at ' + fmt(baseWeeklyPay) + '/week, you\'re entitled to ' + fmt(redundancyPay) + ' redundancy pay (' + redundancyWeeks + ' weeks) plus ' + fmt(noticePay) + ' notice pay (' + noticeWeeks + ' weeks), totalling ' + fmt(totalPayout) + '.';
}
