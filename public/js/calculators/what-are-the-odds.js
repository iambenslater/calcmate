function calculate() {
  const eventType = document.getElementById('input-eventType').value;
  const attempts = parseFloat(document.getElementById('input-attempts').value) || 1;

  const presets = {
    'coin-heads-10': { odds: 1024, label: 'flipping 10 heads in a row' },
    'lottery': { odds: 45379620, label: 'winning Oz Lotto jackpot' },
    'lightning': { odds: 500000, label: 'getting struck by lightning this year' },
    'shark': { odds: 3748067, label: 'a shark attack in your lifetime' },
    'royal-flush': { odds: 649740, label: 'being dealt a royal flush' },
    'hole-in-one': { odds: 12500, label: 'hitting a hole in one' },
    'same-birthday': { odds: 1.77, label: 'two people in a room of 23 sharing a birthday' },
    'meteor': { odds: 1600000, label: 'being hit by a meteorite' },
    'perfect-bracket': { odds: 512, label: 'a perfect AFL tipping round (9 games)' }
  };

  let odds, label;
  if (eventType === 'custom') {
    odds = parseFloat(document.getElementById('input-customOdds').value) || 100;
    label = 'your custom event';
  } else {
    const p = presets[eventType];
    odds = p.odds;
    label = p.label;
  }

  const singleProb = 1 / odds;
  const cumProb = 1 - Math.pow(1 - singleProb, attempts);
  const attemptsFor50 = Math.ceil(Math.log(0.5) / Math.log(1 - singleProb));
  const attemptsFor95 = Math.ceil(Math.log(0.05) / Math.log(1 - singleProb));

  const pctSingle = (singleProb * 100);
  const pctCum = (cumProb * 100);

  let feeling;
  if (pctCum >= 90) feeling = "Almost certain. You'd be unlucky NOT to.";
  else if (pctCum >= 50) feeling = "Better than a coin flip. Decent shot.";
  else if (pctCum >= 10) feeling = "Possible but don't bet the house on it.";
  else if (pctCum >= 1) feeling = "Unlikely but stranger things have happened.";
  else if (pctCum >= 0.01) feeling = "You're dreaming, but dreams do come true occasionally.";
  else feeling = "More likely to be struck by lightning. Twice.";

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-navy/5 rounded-xl p-5 mb-4">
      <p class="text-sm text-gray-500 mb-1">The odds of ${label}</p>
      <p class="text-3xl font-bold text-navy">1 in ${odds.toLocaleString()}</p>
      <p class="text-sm text-gray-500 mt-1">${pctSingle < 0.0001 ? pctSingle.toExponential(2) : pctSingle.toFixed(pctSingle < 1 ? 4 : 2)}% chance per attempt</p>
    </div>
    ${attempts > 1 ? `
    <div class="bg-gold-light rounded-xl p-5 mb-4">
      <p class="text-sm text-gray-500 mb-1">After ${attempts.toLocaleString()} attempts</p>
      <p class="text-2xl font-bold text-navy">${pctCum < 0.0001 ? pctCum.toExponential(2) : pctCum.toFixed(pctCum < 1 ? 4 : 2)}% cumulative chance</p>
      <p class="text-sm text-gray-600 mt-1">${feeling}</p>
    </div>` : `
    <div class="bg-gold-light rounded-xl p-5 mb-4">
      <p class="text-sm text-gray-600">${feeling}</p>
    </div>`}
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-xs text-gray-500">Attempts for 50% chance</p>
        <p class="text-xl font-bold text-navy">${attemptsFor50.toLocaleString()}</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-xs text-gray-500">Attempts for 95% chance</p>
        <p class="text-xl font-bold text-navy">${attemptsFor95.toLocaleString()}</p>
      </div>
    </div>
    <p class="text-xs text-gray-400 mt-4">Based on independent probability theory. Real-world odds may vary.</p>
  `;
}
