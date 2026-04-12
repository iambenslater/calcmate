function calculate() {
  const dobStr = document.getElementById('input-dateOfBirth').value;
  if (!dobStr) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter your date of birth.</p>'; return; }

  const dob = new Date(dobStr + 'T00:00:00');
  const now = new Date();

  if (dob > now) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Date of birth cannot be in the future.</p>'; return; }

  const msPerDay = 86400000;
  const totalMs = now - dob;
  const totalDays = Math.floor(totalMs / msPerDay);
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMinutes = Math.floor(totalMs / 60000);
  const totalSeconds = Math.floor(totalMs / 1000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = Math.floor(totalDays / 30.44);

  // Calculate exact years, months, days
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Next birthday
  let nextBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday <= now) {
    nextBirthday = new Date(now.getFullYear() + 1, dob.getMonth(), dob.getDate());
  }
  const daysUntilBirthday = Math.ceil((nextBirthday - now) / msPerDay);

  const dobFormatted = dob.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Exact Age</span><span class="result-value">${years} years, ${months} months, ${days} days</span></div>
    <div class="result-row"><span class="result-label">Total Days</span><span class="result-value">${totalDays.toLocaleString('en-AU')}</span></div>
    <div class="result-row"><span class="result-label">Total Weeks</span><span class="result-value">${totalWeeks.toLocaleString('en-AU')}</span></div>
    <div class="result-row"><span class="result-label">Total Months</span><span class="result-value">${totalMonths.toLocaleString('en-AU')}</span></div>
    <div class="result-row"><span class="result-label">Total Hours</span><span class="result-value">${totalHours.toLocaleString('en-AU')}</span></div>
    <div class="result-row"><span class="result-label">Total Minutes</span><span class="result-value">${totalMinutes.toLocaleString('en-AU')}</span></div>
    <div class="result-row"><span class="result-label">Total Seconds</span><span class="result-value" id="live-seconds">${totalSeconds.toLocaleString('en-AU')}</span></div>
    <div class="result-row"><span class="result-label">Born On</span><span class="result-value">${dobFormatted}</span></div>
    <div class="result-row"><span class="result-label">Next Birthday In</span><span class="result-value">${daysUntilBirthday} day${daysUntilBirthday !== 1 ? 's' : ''}</span></div>
  `;

  // Live counter for seconds
  if (window._ageInterval) clearInterval(window._ageInterval);
  window._ageInterval = setInterval(() => {
    const el = document.getElementById('live-seconds');
    if (!el) { clearInterval(window._ageInterval); return; }
    const secs = Math.floor((new Date() - dob) / 1000);
    el.textContent = secs.toLocaleString('en-AU');
  }, 1000);
}

function getTLDR() {
  var dobStr = document.getElementById('input-dateOfBirth').value;
  if (!dobStr) return '';
  var dob = new Date(dobStr + 'T00:00:00');
  var now = new Date();
  if (dob > now) return '';
  var totalDays = Math.floor((now - dob) / 86400000);
  var totalWeeks = Math.floor(totalDays / 7);
  var years = now.getFullYear() - dob.getFullYear();
  var months = now.getMonth() - dob.getMonth();
  var days = now.getDate() - dob.getDate();
  if (days < 0) { months--; var prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); days += prevMonth.getDate(); }
  if (months < 0) { years--; months += 12; }
  var nextBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday <= now) nextBirthday = new Date(now.getFullYear() + 1, dob.getMonth(), dob.getDate());
  var daysUntilBirthday = Math.ceil((nextBirthday - now) / 86400000);
  return 'You\'ve been alive for ' + totalDays.toLocaleString('en-AU') + ' days (' + totalWeeks.toLocaleString('en-AU') + ' weeks), or ' + years + ' years, ' + months + ' months and ' + days + ' days. Your next birthday is in ' + daysUntilBirthday + ' day' + (daysUntilBirthday !== 1 ? 's' : '') + '.';
}
