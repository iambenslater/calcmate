function calculate() {
  const lmpDateStr = document.getElementById('input-date').value;

  // Method — radio buttons
  let method = 'lmp';
  const methodInputs = document.querySelectorAll('input[name="input-method"]');
  for (const input of methodInputs) {
    if (input.checked) { method = input.value; break; }
  }
  if (methodInputs.length === 0) {
    const el = document.getElementById('input-method');
    if (el) method = el.value || 'lmp';
  }

  if (!lmpDateStr) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a date.</p>';
    return;
  }

  const startDate = new Date(lmpDateStr);

  // Naegele's rule: LMP + 280 days (40 weeks)
  // If conception date: + 266 days (38 weeks)
  const daysToAdd = method === 'lmp' ? 280 : 266;
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + daysToAdd);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate current gestational age
  const referenceDate = method === 'lmp' ? startDate : new Date(startDate.getTime() - 14 * 24 * 60 * 60 * 1000);
  const daysSinceRef = Math.floor((today - referenceDate) / (1000 * 60 * 60 * 24));
  const gestWeeks = Math.floor(daysSinceRef / 7);
  const gestDays = daysSinceRef % 7;

  const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
  const weeksUntilDue = Math.floor(daysUntilDue / 7);

  let currentTrimester = '';
  if (daysSinceRef < 0) currentTrimester = 'Not yet started';
  else if (gestWeeks < 13) currentTrimester = 'First Trimester (weeks 1-12)';
  else if (gestWeeks < 28) currentTrimester = 'Second Trimester (weeks 13-27)';
  else if (gestWeeks <= 42) currentTrimester = 'Third Trimester (weeks 28-40)';
  else currentTrimester = 'Past due date';

  function addWeeks(date, weeks) {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
  }

  const formatDate = (d) => d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatShort = (d) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

  const milestones = [
    { week: 8, label: 'First prenatal visit' },
    { week: 12, label: 'End of first trimester / NT scan' },
    { week: 20, label: 'Anatomy scan (morphology)' },
    { week: 24, label: 'Viability milestone' },
    { week: 28, label: 'Third trimester begins' },
    { week: 36, label: 'Weekly appointments begin' },
    { week: 37, label: 'Early term' },
    { week: 40, label: 'Due date' }
  ];

  let milestoneRows = milestones.map(m => {
    const mDate = addWeeks(referenceDate, m.week);
    const isPast = today >= mDate;
    return `<tr class="${isPast ? 'text-gray-400' : ''}">
      <td class="px-2 py-1">Week ${m.week}</td>
      <td class="px-2 py-1">${m.label}</td>
      <td class="px-2 py-1 text-right">${formatShort(mDate)}</td>
      <td class="px-2 py-1 text-center">${isPast ? 'Done' : ''}</td>
    </tr>`;
  }).join('');

  const conceptionEst = method === 'lmp' ? addWeeks(startDate, 2) : startDate;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-lg"><span class="result-label">Estimated Due Date</span><span class="result-value">${formatDate(dueDate)}</span></div>
    <hr class="my-2">
    ${daysSinceRef >= 0 ? `
      <div class="result-row"><span class="result-label">Current Gestational Age</span><span class="result-value">${gestWeeks} weeks, ${gestDays} days</span></div>
      <div class="result-row"><span class="result-label">Current Trimester</span><span class="result-value">${currentTrimester}</span></div>
      <div class="result-row"><span class="result-label">Days Until Due Date</span><span class="result-value">${daysUntilDue > 0 ? daysUntilDue + ' days (' + weeksUntilDue + ' weeks)' : 'Due date has passed'}</span></div>
    ` : `
      <div class="result-row"><span class="result-label">Status</span><span class="result-value">Future date</span></div>
    `}
    <div class="result-row"><span class="result-label">Estimated Conception</span><span class="result-value">${formatShort(conceptionEst)}</span></div>
    <div class="result-row"><span class="result-label">Calculation Method</span><span class="result-value">${method === 'lmp' ? 'Last Menstrual Period (LMP + 280 days)' : 'Conception Date (+ 266 days)'}</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-2">Key Milestones</h4>
    <div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="border-b"><th class="px-2 py-1 text-left">Week</th><th class="px-2 py-1 text-left">Milestone</th><th class="px-2 py-1 text-right">Date</th><th class="px-2 py-1 text-center"></th></tr></thead>
      <tbody>${milestoneRows}</tbody>
    </table></div>
    <p class="text-xs text-gray-400 mt-3">Due dates are estimates. Only about 5% of babies arrive on their due date. A normal full-term delivery ranges from 37 to 42 weeks. Consult your healthcare provider for personalised care.</p>
  `;
}

function getTLDR() {
  const lmpDateStr = document.getElementById('input-date').value;
  if (!lmpDateStr) return '';

  let method = 'lmp';
  const methodInputs = document.querySelectorAll('input[name="input-method"]');
  for (const input of methodInputs) {
    if (input.checked) { method = input.value; break; }
  }

  const startDate = new Date(lmpDateStr);
  const daysToAdd = method === 'lmp' ? 280 : 266;
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + daysToAdd);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const referenceDate = method === 'lmp' ? startDate : new Date(startDate.getTime() - 14 * 24 * 60 * 60 * 1000);
  const daysSinceRef = Math.floor((today - referenceDate) / (1000 * 60 * 60 * 24));
  const gestWeeks = Math.floor(daysSinceRef / 7);
  const gestDays = daysSinceRef % 7;
  const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

  const formatShort = (d) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  if (daysSinceRef < 0) {
    return 'Your estimated due date is ' + formatShort(dueDate) + '.';
  }
  return 'You are currently ' + gestWeeks + ' weeks and ' + gestDays + ' day' + (gestDays !== 1 ? 's' : '') + ' pregnant, with an estimated due date of ' + formatShort(dueDate) + ' (' + (daysUntilDue > 0 ? daysUntilDue + ' days to go' : 'past due date') + ').';
}
