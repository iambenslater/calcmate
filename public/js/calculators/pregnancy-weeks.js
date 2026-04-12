function calculate() {
  const dueDateStr = document.getElementById('input-date').value;
  const method = document.getElementById('input-calcMethod').value || 'due-date';

  if (!dueDateStr) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p>Please enter a date.</p>';
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(dueDateStr + 'T00:00:00');

  let lmpDate, dueDate;

  if (method === 'due-date') {
    dueDate = inputDate;
    // LMP = due date - 280 days
    lmpDate = new Date(dueDate);
    lmpDate.setDate(lmpDate.getDate() - 280);
  } else {
    // LMP method
    lmpDate = inputDate;
    dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);
  }

  const daysSinceLMP = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(daysSinceLMP / 7);
  const currentDay = daysSinceLMP % 7;
  const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
  const weeksUntilDue = Math.floor(daysUntilDue / 7);

  // Trimester
  let trimester = '';
  if (currentWeek < 13) trimester = 'First Trimester (Weeks 1-12)';
  else if (currentWeek < 27) trimester = 'Second Trimester (Weeks 13-26)';
  else if (currentWeek <= 42) trimester = 'Third Trimester (Weeks 27-40)';
  else trimester = 'Past Due Date';

  // Milestones
  const milestones = [
    { week: 8, label: 'First heartbeat detectable' },
    { week: 12, label: 'End of first trimester / dating scan' },
    { week: 13, label: 'Second trimester begins' },
    { week: 18, label: 'Anatomy scan window opens (18-22 weeks)' },
    { week: 24, label: 'Viability milestone' },
    { week: 27, label: 'Third trimester begins' },
    { week: 36, label: 'Full term approaching' },
    { week: 37, label: 'Early term' },
    { week: 40, label: 'Due date' },
  ];

  let upcoming = milestones.filter(m => m.week > currentWeek).slice(0, 3);

  const formatDate = d => d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row highlight"><span class="result-label">Current Pregnancy</span><span class="result-value">${currentWeek} weeks, ${currentDay} day${currentDay !== 1 ? 's' : ''}</span></div>
    <div class="result-row"><span class="result-label">Trimester</span><span class="result-value">${trimester}</span></div>
    <div class="result-row"><span class="result-label">Estimated Due Date</span><span class="result-value">${formatDate(dueDate)}</span></div>
    <div class="result-row"><span class="result-label">Days Until Due</span><span class="result-value">${daysUntilDue > 0 ? daysUntilDue + ' days (' + weeksUntilDue + ' weeks)' : 'Past due date'}</span></div>
    <div class="result-row"><span class="result-label">Estimated LMP</span><span class="result-value">${formatDate(lmpDate)}</span></div>
    ${upcoming.length > 0 ? `
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Upcoming Milestones</span><span class="result-value"></span></div>
    ${upcoming.map(m => {
      const mDate = new Date(lmpDate);
      mDate.setDate(mDate.getDate() + m.week * 7);
      return `<div class="result-row"><span class="result-label">Week ${m.week}</span><span class="result-value">${m.label} (${formatDate(mDate)})</span></div>`;
    }).join('')}` : ''}
  `;
}

function getTLDR() {
  const dueDateStr = document.getElementById('input-date').value;
  const method = document.getElementById('input-calcMethod').value || 'due-date';

  if (!dueDateStr) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(dueDateStr + 'T00:00:00');

  let lmpDate, dueDate;
  if (method === 'due-date') {
    dueDate = inputDate;
    lmpDate = new Date(dueDate);
    lmpDate.setDate(lmpDate.getDate() - 280);
  } else {
    lmpDate = inputDate;
    dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);
  }

  const daysSinceLMP = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(daysSinceLMP / 7);
  const currentDay = daysSinceLMP % 7;
  const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

  const formatShort = d => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  return 'You are ' + currentWeek + ' weeks and ' + currentDay + ' day' + (currentDay !== 1 ? 's' : '') + ' pregnant, due ' + formatShort(dueDate) + ' (' + (daysUntilDue > 0 ? daysUntilDue + ' days away' : 'past due date') + ').';
}
