function calculate() {
  const dobStr = document.getElementById('input-dob').value;
  const prematureWeeks = parseFloat(document.getElementById('input-prematureWeeks').value) || 0;
  if (!dobStr) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p>Please enter a date of birth.</p>';
    return;
  }

  const dob = new Date(dobStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((today - dob) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const remainDays = totalDays % 7;

  // Calculate months
  let months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
  if (today.getDate() < dob.getDate()) months--;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  // Milestones
  const milestones = [
    { weeks: 6, label: 'First social smile' },
    { weeks: 8, label: '6-8 week health check' },
    { weeks: 12, label: 'Immunisations (2 months)' },
    { weeks: 16, label: 'Starts reaching for objects' },
    { weeks: 17, label: 'Immunisations (4 months)' },
    { weeks: 22, label: 'May start solids (around 6 months)' },
    { weeks: 26, label: 'Immunisations (6 months)' },
    { weeks: 30, label: 'May start crawling' },
    { weeks: 35, label: 'Separation anxiety may begin' },
    { weeks: 40, label: 'May start pulling to stand' },
    { weeks: 44, label: 'First words emerging' },
    { weeks: 48, label: 'Approaching first birthday!' },
    { weeks: 52, label: 'Immunisations (12 months)' },
    { weeks: 78, label: 'Immunisations (18 months)' },
    { weeks: 104, label: 'Two years old' },
    { weeks: 156, label: 'Three years old' },
    { weeks: 208, label: 'Immunisations (4 years)' },
  ];

  // Find recent and upcoming milestones
  const past = milestones.filter(m => m.weeks <= totalWeeks).slice(-2);
  const upcoming = milestones.filter(m => m.weeks > totalWeeks).slice(0, 3);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Date of Birth</span><span class="result-value">${dob.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
    <div class="result-row highlight"><span class="result-label">Age in Weeks</span><span class="result-value">${totalWeeks} weeks${remainDays > 0 ? ', ' + remainDays + ' day' + (remainDays !== 1 ? 's' : '') : ''}</span></div>
    <div class="result-row highlight"><span class="result-label">Age in Months</span><span class="result-value">${years > 0 ? years + ' year' + (years !== 1 ? 's' : '') + ', ' : ''}${remMonths} month${remMonths !== 1 ? 's' : ''}</span></div>
    <div class="result-row"><span class="result-label">Total Days</span><span class="result-value">${totalDays.toLocaleString('en-AU')} days</span></div>
    ${past.length > 0 ? `
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Recent Milestones</span><span class="result-value"></span></div>
    ${past.map(m => `<div class="result-row"><span class="result-label">Week ${m.weeks}</span><span class="result-value">${m.label}</span></div>`).join('')}` : ''}
    ${upcoming.length > 0 ? `
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Upcoming Milestones</span><span class="result-value"></span></div>
    ${upcoming.map(m => {
      const mDate = new Date(dob);
      mDate.setDate(mDate.getDate() + m.weeks * 7);
      return `<div class="result-row"><span class="result-label">Week ${m.weeks} (${mDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })})</span><span class="result-value">${m.label}</span></div>`;
    }).join('')}` : ''}
  `;
}
