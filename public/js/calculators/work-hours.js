function calculate() {
  const startTime = document.getElementById('input-startTime').value;
  const endTime = document.getElementById('input-endTime').value;
  const breakMinutes = parseFloat(document.getElementById('input-breakMinutes').value) || 0;
  const daysPerWeek = parseFloat(document.getElementById('input-daysPerWeek').value) || 5;

  if (!startTime || !endTime) {
    alert('Please enter start and end times.');
    return;
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    alert('End time must be after start time.');
    return;
  }

  const grossMinutes = endMinutes - startMinutes;
  const netMinutes = grossMinutes - breakMinutes;

  if (netMinutes <= 0) {
    alert('Break time exceeds work time.');
    return;
  }

  const dailyHours = netMinutes / 60;
  const weeklyHours = dailyHours * daysPerWeek;
  const monthlyHours = weeklyHours * 4.33;
  const annualHours = weeklyHours * 52;

  const formatHM = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  };

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Daily Work Hours</span><span class="result-value">${dailyHours.toFixed(2)} hours (${formatHM(netMinutes)})</span></div>
    <div class="result-row"><span class="result-label">Weekly Work Hours</span><span class="result-value">${weeklyHours.toFixed(2)} hours</span></div>
    <div class="result-row"><span class="result-label">Monthly Work Hours</span><span class="result-value">${monthlyHours.toFixed(1)} hours</span></div>
    <div class="result-row"><span class="result-label">Annual Work Hours</span><span class="result-value">${annualHours.toFixed(0)} hours</span></div>
    <div class="result-row"><span class="result-label">Gross Hours (before break)</span><span class="result-value">${formatHM(grossMinutes)}</span></div>
    <div class="result-row"><span class="result-label">Break</span><span class="result-value">${breakMinutes} minutes</span></div>
    <div class="result-row"><span class="result-label">Days per Week</span><span class="result-value">${daysPerWeek}</span></div>
    <div class="result-row"><span class="result-label">Start Time</span><span class="result-value">${startTime}</span></div>
    <div class="result-row"><span class="result-label">End Time</span><span class="result-value">${endTime}</span></div>
  `;
}
