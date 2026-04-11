function calculate() {
  const inputTime = document.getElementById('input-time').value;
  const inputDate = document.getElementById('input-date').value;
  const sourceTimezone = document.getElementById('input-sourceTimezone').value;
  const targetTimezone = document.getElementById('input-targetTimezone').value;

  if (!inputTime || !sourceTimezone || !targetTimezone) {
    document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please fill in all fields.</p>';
    return;
  }

  // UTC offsets in hours
  const offsets = {
    'AEST':  10,
    'AEDT':  11,
    'ACST':  9.5,
    'ACDT':  10.5,
    'AWST':  8,
    'UTC':   0,
    'GMT':   0,
    'EST':  -5,   // US Eastern
    'PST':  -8,   // US Pacific
    'CST':  -6,   // US Central
    'JST':   9,
    'IST':   5.5,
    'CET':   1,
    'NZST':  12,
    'NZDT':  13,
  };

  const sourceOffset = offsets[sourceTimezone];
  const targetOffset = offsets[targetTimezone];

  if (sourceOffset === undefined || targetOffset === undefined) {
    document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Invalid timezone selected.</p>';
    return;
  }

  // Parse time (HH:MM format)
  const [hours, minutes] = inputTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid time.</p>';
    return;
  }

  // Convert to UTC then to target
  const diffHours = targetOffset - sourceOffset;
  let targetMinutes = hours * 60 + minutes + diffHours * 60;

  let dayShift = 0;
  if (targetMinutes >= 1440) { targetMinutes -= 1440; dayShift = 1; }
  else if (targetMinutes < 0) { targetMinutes += 1440; dayShift = -1; }

  const targetH = Math.floor(targetMinutes / 60);
  const targetM = Math.round(targetMinutes % 60);

  const formatTime = (h, m) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const format24 = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  const dayNote = dayShift === 1 ? ' (next day)' : dayShift === -1 ? ' (previous day)' : '';
  const diffSign = diffHours >= 0 ? '+' : '';
  const diffDisplay = Number.isInteger(diffHours) ? diffHours : diffHours.toFixed(1);

  // Show a selection of common zones for reference
  const referenceZones = ['AEST', 'AEDT', 'AWST', 'UTC', 'EST', 'PST', 'JST'];
  let refRows = '';
  for (const tz of referenceZones) {
    if (tz === sourceTimezone || tz === targetTimezone) continue;
    const refDiff = offsets[tz] - sourceOffset;
    let refMin = hours * 60 + minutes + refDiff * 60;
    let refDay = '';
    if (refMin >= 1440) { refMin -= 1440; refDay = ' (+1d)'; }
    else if (refMin < 0) { refMin += 1440; refDay = ' (-1d)'; }
    const rH = Math.floor(refMin / 60);
    const rM = Math.round(refMin % 60);
    refRows += `<div class="result-row"><span class="result-label">${tz} (UTC${offsets[tz] >= 0 ? '+' : ''}${offsets[tz]})</span><span class="result-value">${formatTime(rH, rM)}${refDay}</span></div>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">${sourceTimezone}</span><span class="result-value">${formatTime(hours, minutes)} (${format24(hours, minutes)})</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">${targetTimezone}</span><span class="result-value">${formatTime(targetH, targetM)} (${format24(targetH, targetM)})${dayNote}</span></div>
    <div class="result-row"><span class="result-label">Time Difference</span><span class="result-value">${diffSign}${diffDisplay} hours</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>Other Timezones</strong>
    </div>
    ${refRows}
    <p class="text-sm text-gray-500 mt-4">Offsets are fixed approximations. Daylight saving transitions change actual offsets. AEDT/ACDT are Australian daylight saving time zones (summer).</p>
  `;
}
