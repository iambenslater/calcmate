function calculate() {
  const dobVal = document.getElementById('input-dateOfBirth').value;
  if (!dobVal) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter your date of birth.</p>';
    return;
  }

  const dob = new Date(dobVal);
  const today = new Date();

  if (dob > today) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Date of birth cannot be in the future.</p>';
    return;
  }

  // Calculate years, months, days
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Total calculations
  const totalDays = Math.floor((today - dob) / (24 * 60 * 60 * 1000));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // Day of the week born
  const dayBorn = dob.toLocaleDateString('en-AU', { weekday: 'long' });
  const formattedDOB = dob.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  // Next birthday
  let nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday <= today) {
    nextBirthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
  }
  const daysUntilBirthday = Math.ceil((nextBirthday - today) / (24 * 60 * 60 * 1000));
  const nextAge = nextBirthday.getFullYear() - dob.getFullYear();
  const isBirthdayToday = today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate();

  // Star sign
  const m = dob.getMonth() + 1;
  const d = dob.getDate();
  let starSign = '';
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) starSign = 'Aries';
  else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) starSign = 'Taurus';
  else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) starSign = 'Gemini';
  else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) starSign = 'Cancer';
  else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) starSign = 'Leo';
  else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) starSign = 'Virgo';
  else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) starSign = 'Libra';
  else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) starSign = 'Scorpio';
  else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) starSign = 'Sagittarius';
  else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) starSign = 'Capricorn';
  else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) starSign = 'Aquarius';
  else starSign = 'Pisces';

  // Generation
  const birthYear = dob.getFullYear();
  let generation = '';
  if (birthYear <= 1945) generation = 'Silent Generation';
  else if (birthYear <= 1964) generation = 'Baby Boomer';
  else if (birthYear <= 1980) generation = 'Generation X';
  else if (birthYear <= 1996) generation = 'Millennial';
  else if (birthYear <= 2012) generation = 'Generation Z';
  else generation = 'Generation Alpha';

  const num = n => n.toLocaleString('en-AU');

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-2xl"><span class="result-label">Your Age</span><span class="result-value">${years} years, ${months} months, ${days} days</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Date of Birth</span><span class="result-value">${formattedDOB} (${dayBorn})</span></div>
    <div class="result-row"><span class="result-label">Star Sign</span><span class="result-value">${starSign}</span></div>
    <div class="result-row"><span class="result-label">Generation</span><span class="result-value">${generation}</span></div>
    <hr class="my-2">
    <h4 class="font-semibold mb-2">Time Alive</h4>
    <div class="result-row"><span class="result-label">Total Days</span><span class="result-value">${num(totalDays)}</span></div>
    <div class="result-row"><span class="result-label">Total Weeks</span><span class="result-value">${num(totalWeeks)}</span></div>
    <div class="result-row"><span class="result-label">Total Months</span><span class="result-value">${num(totalMonths)}</span></div>
    <div class="result-row"><span class="result-label">Total Hours</span><span class="result-value">${num(totalHours)}</span></div>
    <div class="result-row"><span class="result-label">Total Minutes</span><span class="result-value">${num(totalMinutes)}</span></div>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Next Birthday</span><span class="result-value">${isBirthdayToday ? 'Happy Birthday! You turn ' + years + ' today!' : 'Turning ' + nextAge + ' in ' + daysUntilBirthday + ' days'}</span></div>
  `;
}

function getTLDR() {
  var dobVal = document.getElementById('input-dateOfBirth').value;
  if (!dobVal) return '';
  var dob = new Date(dobVal);
  var today = new Date();
  if (dob > today) return '';
  var years = today.getFullYear() - dob.getFullYear();
  var months = today.getMonth() - dob.getMonth();
  var days = today.getDate() - dob.getDate();
  if (days < 0) { months--; var prevMonth = new Date(today.getFullYear(), today.getMonth(), 0); days += prevMonth.getDate(); }
  if (months < 0) { years--; months += 12; }
  var totalDays = Math.floor((today - dob) / (24 * 60 * 60 * 1000));
  var nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday <= today) nextBirthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
  var daysUntilBirthday = Math.ceil((nextBirthday - today) / (24 * 60 * 60 * 1000));
  var nextAge = nextBirthday.getFullYear() - dob.getFullYear();
  return 'You are ' + years + ' years, ' + months + ' months and ' + days + ' days old — that\'s ' + totalDays.toLocaleString('en-AU') + ' days alive in total. Your next birthday is in ' + daysUntilBirthday + ' days, when you\'ll turn ' + nextAge + '.';
}
