function calculate() {
  const startStr = document.getElementById('input-startDate').value;
  const endStr = document.getElementById('input-endDate').value;
  const includeEndDate = document.getElementById('input-includeEndDate')?.checked || false;

  if (!startStr || !endStr) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please select both start and end dates.</p>';
    return;
  }

  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');

  if (end < start) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">End date must be on or after start date.</p>';
    return;
  }

  const msPerDay = 86400000;
  let totalDays = Math.round((end - start) / msPerDay);
  if (includeEndDate) totalDays += 1;

  // Calculate business days (exclude weekends)
  let businessDays = 0;
  let current = new Date(start);
  const endCheck = new Date(end);
  if (includeEndDate) endCheck.setDate(endCheck.getDate() + 1);

  while (current < endCheck) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) businessDays++;
    current.setDate(current.getDate() + 1);
  }

  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  const months = totalDays / 30.44;
  const weekendDays = totalDays - businessDays;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const startFormatted = start.toLocaleDateString('en-AU', options);
  const endFormatted = end.toLocaleDateString('en-AU', options);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Total Days</span><span class="result-value">${totalDays.toLocaleString('en-AU')}</span></div>
    <div class="result-row"><span class="result-label">Business Days</span><span class="result-value">${businessDays.toLocaleString('en-AU')}</span></div>
    <div class="result-row"><span class="result-label">Weekend Days</span><span class="result-value">${weekendDays.toLocaleString('en-AU')}</span></div>
    <div class="result-row"><span class="result-label">Weeks & Days</span><span class="result-value">${weeks} week${weeks !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}</span></div>
    <div class="result-row"><span class="result-label">Approx. Months</span><span class="result-value">${months.toFixed(1)}</span></div>
    <div class="result-row"><span class="result-label">From</span><span class="result-value">${startFormatted}</span></div>
    <div class="result-row"><span class="result-label">To</span><span class="result-value">${endFormatted}</span></div>
    <div class="result-row"><span class="result-label">Include End Date</span><span class="result-value">${includeEndDate ? 'Yes' : 'No'}</span></div>
    <p class="text-sm text-gray-500 mt-4">Business days exclude Saturdays and Sundays only. Public holidays are not excluded from the business day count.</p>
  `;
}

function getTLDR() {
  const startStr = document.getElementById('input-startDate').value;
  const endStr = document.getElementById('input-endDate').value;
  const includeEndDate = document.getElementById('input-includeEndDate')?.checked || false;
  if (!startStr || !endStr) return '';
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  if (end < start) return '';
  let totalDays = Math.round((end - start) / 86400000);
  if (includeEndDate) totalDays += 1;
  let businessDays = 0;
  let current = new Date(start);
  const endCheck = new Date(end);
  if (includeEndDate) endCheck.setDate(endCheck.getDate() + 1);
  while (current < endCheck) { const day = current.getDay(); if (day !== 0 && day !== 6) businessDays++; current.setDate(current.getDate() + 1); }
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  return 'There are ' + totalDays.toLocaleString('en-AU') + ' days between those two dates (' + businessDays.toLocaleString('en-AU') + ' business days), which works out to ' + weeks + ' week' + (weeks !== 1 ? 's' : '') + (remainingDays > 0 ? ' and ' + remainingDays + ' day' + (remainingDays !== 1 ? 's' : '') : '') + '.';
}
