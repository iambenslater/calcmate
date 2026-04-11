function calculate() {
  const year = document.getElementById('input-year').value;
  const state = (document.getElementById('input-state').value || '').toUpperCase();

  if (!year || !state) { alert('Please select a year and state.'); return; }

  // National public holidays
  const national = {
    '2025': [
      { date: '2025-01-01', name: "New Year's Day" },
      { date: '2025-01-27', name: 'Australia Day' },
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-04-19', name: 'Saturday before Easter Sunday' },
      { date: '2025-04-21', name: 'Easter Monday' },
      { date: '2025-04-25', name: 'Anzac Day' },
      { date: '2025-06-09', name: "Queen's Birthday" },
      { date: '2025-12-25', name: 'Christmas Day' },
      { date: '2025-12-26', name: 'Boxing Day' },
    ],
    '2026': [
      { date: '2026-01-01', name: "New Year's Day" },
      { date: '2026-01-26', name: 'Australia Day' },
      { date: '2026-04-03', name: 'Good Friday' },
      { date: '2026-04-04', name: 'Saturday before Easter Sunday' },
      { date: '2026-04-06', name: 'Easter Monday' },
      { date: '2026-04-25', name: 'Anzac Day' },
      { date: '2026-06-08', name: "Queen's Birthday" },
      { date: '2026-12-25', name: 'Christmas Day' },
      { date: '2026-12-26', name: 'Boxing Day' },
    ],
    '2027': [
      { date: '2027-01-01', name: "New Year's Day" },
      { date: '2027-01-26', name: 'Australia Day' },
      { date: '2027-03-26', name: 'Good Friday' },
      { date: '2027-03-27', name: 'Saturday before Easter Sunday' },
      { date: '2027-03-29', name: 'Easter Monday' },
      { date: '2027-04-25', name: 'Anzac Day' },
      { date: '2027-06-14', name: "Queen's Birthday" },
      { date: '2027-12-25', name: 'Christmas Day' },
      { date: '2027-12-27', name: 'Boxing Day (substitute)' },
    ],
  };

  // State-specific holidays (approximate)
  const stateHolidays = {
    '2026': {
      NSW: [
        { date: '2026-08-03', name: 'Bank Holiday (financial sector)' },
      ],
      VIC: [
        { date: '2026-03-09', name: 'Labour Day' },
        { date: '2026-11-03', name: 'Melbourne Cup Day (metro)' },
      ],
      QLD: [
        { date: '2026-05-04', name: 'Labour Day' },
        { date: '2026-08-12', name: 'Royal Queensland Show (Brisbane)' },
        { date: '2026-10-26', name: "Queen's Birthday (QLD)" },
      ],
      SA: [
        { date: '2026-03-09', name: 'Adelaide Cup' },
        { date: '2026-12-24', name: 'Christmas Eve (from 7pm)' },
        { date: '2026-12-31', name: "New Year's Eve (from 7pm)" },
        { date: '2026-10-05', name: 'Labour Day' },
      ],
      WA: [
        { date: '2026-03-02', name: 'Labour Day' },
        { date: '2026-06-01', name: 'Western Australia Day' },
        { date: '2026-09-28', name: "Queen's Birthday (WA)" },
      ],
      TAS: [
        { date: '2026-02-09', name: 'Royal Hobart Regatta (south)' },
        { date: '2026-03-09', name: 'Eight Hours Day' },
        { date: '2026-11-02', name: 'Recreation Day (north)' },
      ],
      NT: [
        { date: '2026-05-04', name: 'May Day' },
        { date: '2026-07-06', name: 'Show Day (Alice Springs/Darwin)' },
        { date: '2026-08-03', name: 'Picnic Day' },
      ],
      ACT: [
        { date: '2026-03-09', name: 'Canberra Day' },
        { date: '2026-05-25', name: 'Reconciliation Day' },
        { date: '2026-10-05', name: 'Family & Community Day' },
      ],
    },
    '2025': {
      NSW: [], VIC: [{ date: '2025-03-10', name: 'Labour Day' }],
      QLD: [{ date: '2025-05-05', name: 'Labour Day' }, { date: '2025-10-27', name: "Queen's Birthday (QLD)" }],
      SA: [{ date: '2025-03-10', name: 'Adelaide Cup' }], WA: [{ date: '2025-03-03', name: 'Labour Day' }],
      TAS: [{ date: '2025-03-10', name: 'Eight Hours Day' }], NT: [{ date: '2025-05-05', name: 'May Day' }],
      ACT: [{ date: '2025-03-10', name: 'Canberra Day' }],
    },
    '2027': {
      NSW: [], VIC: [{ date: '2027-03-08', name: 'Labour Day' }],
      QLD: [{ date: '2027-05-03', name: 'Labour Day' }, { date: '2027-10-25', name: "Queen's Birthday (QLD)" }],
      SA: [{ date: '2027-03-08', name: 'Adelaide Cup' }], WA: [{ date: '2027-03-01', name: 'Labour Day' }],
      TAS: [{ date: '2027-03-08', name: 'Eight Hours Day' }], NT: [{ date: '2027-05-03', name: 'May Day' }],
      ACT: [{ date: '2027-03-08', name: 'Canberra Day' }],
    },
  };

  // Queen's Birthday is state-specific for QLD and WA, national for others
  const allHolidays = [
    ...(national[year] || []),
    ...(stateHolidays[year]?.[state] || []),
  ].sort((a, b) => a.date.localeCompare(b.date));

  // Remove duplicate Queen's Birthday for QLD/WA (they have their own date)
  let filtered = allHolidays;
  if (state === 'QLD' || state === 'WA') {
    filtered = allHolidays.filter(h => !(h.name === "Queen's Birthday" && !h.name.includes(state)));
  }

  const now = new Date();
  let rows = '';
  let upcomingCount = 0;
  for (const h of filtered) {
    const d = new Date(h.date + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-AU', { weekday: 'long' });
    const formatted = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
    const isPast = d < now;
    const style = isPast ? 'opacity: 0.5;' : '';
    if (!isPast) upcomingCount++;
    rows += `<div class="result-row" style="${style}"><span class="result-label">${h.name}</span><span class="result-value">${dayName}, ${formatted}</span></div>`;
  }

  const stateName = { NSW:'New South Wales', VIC:'Victoria', QLD:'Queensland', SA:'South Australia', WA:'Western Australia', TAS:'Tasmania', NT:'Northern Territory', ACT:'Australian Capital Territory' }[state];

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Total Public Holidays</span><span class="result-value">${filtered.length}</span></div>
    <div class="result-row"><span class="result-label">Upcoming</span><span class="result-value">${upcomingCount}</span></div>
    <div class="result-row"><span class="result-label">State</span><span class="result-value">${stateName}</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>${year} Public Holidays</strong>
    </div>
    ${rows}
    <p class="text-sm text-gray-500 mt-4">Past holidays shown dimmed. Some regional holidays (e.g., show days) vary by locality. Dates are approximate and should be confirmed with your state government.</p>
  `;
}
