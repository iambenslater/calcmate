function calculate() {
  const quickPick = document.getElementById('input-quickPick').value;
  const now = new Date();
  let target, label;

  if (quickPick === 'custom') {
    const dateStr = document.getElementById('input-targetDate').value;
    if (!dateStr) {
      const results = document.getElementById('calc-results');
      const content = document.getElementById('results-content');
      results.classList.remove('hidden');
      content.innerHTML = '<p class="text-red-600">Please select a target date.</p>';
      return;
    }
    target = new Date(dateStr + 'T00:00:00');
    label = target.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } else {
    const year = now.getFullYear();
    const dates = {
      'christmas': { m: 11, d: 25, label: '🎄 Christmas Day' },
      'new-year': { m: 11, d: 31, label: '🎆 New Year\'s Eve' },
      'australia-day': { m: 0, d: 26, label: '🇦🇺 Australia Day' },
      'easter': { m: 0, d: 0, label: '🐣 Easter Sunday', calc: 'easter' },
      'eofy': { m: 5, d: 30, label: '💰 End of Financial Year' },
      'anzac': { m: 3, d: 25, label: '🌺 ANZAC Day' },
      'halloween': { m: 9, d: 31, label: '🎃 Halloween' },
      'valentines': { m: 1, d: 14, label: '💝 Valentine\'s Day' }
    };
    const ev = dates[quickPick];
    label = ev.label;

    if (ev.calc === 'easter') {
      // Computus algorithm for Easter
      function easter(y) {
        const a = y % 19, b = Math.floor(y/100), c = y % 100;
        const d = Math.floor(b/4), e = b % 4, f = Math.floor((b+8)/25);
        const g = Math.floor((b-f+1)/3), h = (19*a+b-d-g+15) % 30;
        const i = Math.floor(c/4), k = c % 4;
        const l = (32+2*e+2*i-h-k) % 7;
        const m = Math.floor((a+11*h+22*l)/451);
        const month = Math.floor((h+l-7*m+114)/31) - 1;
        const day = ((h+l-7*m+114) % 31) + 1;
        return new Date(y, month, day);
      }
      target = easter(year);
      if (target <= now) target = easter(year + 1);
    } else {
      target = new Date(year, ev.m, ev.d);
      if (target <= now) target = new Date(year + 1, ev.m, ev.d);
    }
  }

  const diff = target - now;
  if (diff < 0) {
    const results = document.getElementById('calc-results');
    const content = document.getElementById('results-content');
    results.classList.remove('hidden');
    content.innerHTML = '<p class="text-gray-600">That date has already passed! Try a future date.</p>';
    return;
  }

  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const totalSeconds = Math.floor(diff / 1000);
  const weeks = Math.floor(totalDays / 7);
  const months = Math.round(totalDays / 30.44 * 10) / 10;

  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
  const m = Math.floor((diff % (1000*60*60)) / (1000*60));

  let sleeps = totalDays;
  let funFact;
  if (totalDays <= 1) funFact = "It's practically here!";
  else if (totalDays <= 7) funFact = "Less than a week — you can almost taste it.";
  else if (totalDays <= 30) funFact = "About " + weeks + " week" + (weeks !== 1 ? "s" : "") + " to go. Start planning!";
  else if (totalDays <= 100) funFact = "That's roughly " + months + " months. Not long at all.";
  else funFact = "That's " + weeks + " weeks, or about " + months + " months away.";

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-navy/5 rounded-xl p-5 mb-4 text-center">
      <p class="text-sm text-gray-500 mb-2">${label}</p>
      <p class="text-5xl font-bold text-navy">${totalDays}</p>
      <p class="text-lg text-gray-600 mt-1">days to go</p>
    </div>
    <div class="bg-gold-light rounded-xl p-4 mb-4 text-center">
      <p class="text-sm text-gray-600">${d} days, ${h} hours, ${m} minutes</p>
      <p class="text-sm text-gray-500 mt-1">${funFact}</p>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-gray-50 rounded-lg p-3 text-center">
        <p class="text-xl font-bold text-navy">${weeks}</p>
        <p class="text-xs text-gray-500">weeks</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-3 text-center">
        <p class="text-xl font-bold text-navy">${totalHours.toLocaleString()}</p>
        <p class="text-xs text-gray-500">hours</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-3 text-center">
        <p class="text-xl font-bold text-navy">${totalMinutes.toLocaleString()}</p>
        <p class="text-xs text-gray-500">minutes</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-3 text-center">
        <p class="text-xl font-bold text-navy">${sleeps}</p>
        <p class="text-xs text-gray-500">sleeps 😴</p>
      </div>
    </div>
  `;
}
