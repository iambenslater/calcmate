// Fan Loyalty Test Calculator
// How loyal are you REALLY to your team?

function calculate() {
  // Grab all inputs
  var yearsEl = document.getElementById('input-years');
  var gamesEl = document.getElementById('input-games');
  var merchEl = document.querySelector('input[name="input-merch"]:checked');
  var badTimesEl = document.querySelector('input[name="input-bad-times"]:checked');
  var tattooEl = document.querySelector('input[name="input-tattoo"]:checked');
  var cryEl = document.querySelector('input[name="input-cry"]:checked');

  if (!yearsEl || !gamesEl || !merchEl || !badTimesEl || !tattooEl || !cryEl) {
    showResult('<p style="color:#ef4444;font-weight:600;text-align:center;">Answer all the questions, ya fence-sitter. We can\'t measure loyalty if you won\'t commit to a form.</p>');
    return;
  }

  var years = yearsEl.value;
  var games = gamesEl.value;
  var merch = merchEl.value;
  var badTimes = badTimesEl.value;
  var tattoo = tattooEl.value;
  var cry = cryEl.value;

  // Score each category
  var yearScores = { '1': 5, '3': 15, '10': 30, '20': 40, '99': 50 };
  var gameScores = { '2': 5, '8': 15, '15': 25, '24': 35 };
  var merchScores = { 'none': 0, 'some': 5, 'heaps': 10 };
  var badTimesScores = { 'no': 0, 'quiet': 5, 'yes': 15 };
  var tattooScores = { 'no': 0, 'considering': 5, 'yes': 20 };
  var cryScores = { 'no': 0, 'almost': 5, 'yes': 10 };

  var yearPts = yearScores[years] || 0;
  var gamePts = gameScores[games] || 0;
  var merchPts = merchScores[merch] || 0;
  var badTimesPts = badTimesScores[badTimes] || 0;
  var tattooPts = tattooScores[tattoo] || 0;
  var cryPts = cryScores[cry] || 0;

  var totalPts = yearPts + gamePts + merchPts + badTimesPts + tattooPts + cryPts;
  var maxPts = 140;
  var pct = Math.round((totalPts / maxPts) * 100);
  pct = Math.min(100, Math.max(0, pct));

  // Determine tier
  var tier = getTier(pct);

  // Build breakdown
  var breakdown = [
    { label: 'Years of loyalty', pts: yearPts, max: 50, emoji: '📅' },
    { label: 'Games attended', pts: gamePts, max: 35, emoji: '🏟️' },
    { label: 'Merch collection', pts: merchPts, max: 10, emoji: '👕' },
    { label: 'Stuck through bad times', pts: badTimesPts, max: 15, emoji: '💪' },
    { label: 'Team tattoo', pts: tattooPts, max: 20, emoji: '🖋️' },
    { label: 'Cried over a loss', pts: cryPts, max: 10, emoji: '😭' }
  ];

  showResult(buildHTML(pct, tier, breakdown, totalPts, maxPts));
}

function getTier(pct) {
  if (pct >= 90) return {
    name: 'RIDE OR DIE',
    emoji: '🫡',
    colour: '#dc2626',
    bg: '#fef2f2',
    roast: "You ARE the club. If they fold, you fold. Your blood runs in club colours and your funeral will have the team song."
  };
  if (pct >= 70) return {
    name: 'TRUE BELIEVER',
    emoji: '❤️‍🔥',
    colour: '#ea580c',
    bg: '#fff7ed',
    roast: "Proper supporter. You've seen the dark days and survived. When people question your loyalty, the scars speak for themselves."
  };
  if (pct >= 50) return {
    name: 'FAIR-WEATHER ADJACENT',
    emoji: '☁️',
    colour: '#ca8a04',
    bg: '#fefce8',
    roast: "You care, but there are limits. You watch most games, own a jersey, but you're not getting a tattoo anytime soon. Sensible, if a bit boring."
  };
  if (pct >= 30) return {
    name: 'BANDWAGON LEANER',
    emoji: '🛒',
    colour: '#2563eb',
    bg: '#eff6ff',
    roast: "You support them when they're winning and go quiet when they're losing. Your loyalty has terms and conditions."
  };
  return {
    name: 'PLASTIC FAN',
    emoji: '🥤',
    colour: '#6b7280',
    bg: '#f9fafb',
    roast: "You own a jersey you bought at Kmart and you can't name the coach. Do you even watch the games or just check the score on Monday?"
  };
}

function buildHTML(pct, tier, breakdown, totalPts, maxPts) {
  var html = '';

  // Big loyalty percentage
  html += '<div style="text-align:center;margin-bottom:1.5rem;">';
  html += '<div style="font-size:5rem;font-weight:900;color:' + tier.colour + ';line-height:1;">' + tier.emoji + '</div>';
  html += '<div style="font-size:4rem;font-weight:900;color:' + tier.colour + ';line-height:1.1;">' + pct + '%</div>';
  html += '<div style="font-size:0.875rem;color:#9ca3af;margin-top:0.25rem;">LOYAL</div>';
  html += '<div style="font-size:1.75rem;font-weight:800;color:' + tier.colour + ';letter-spacing:0.05em;margin-top:0.5rem;">' + tier.name + '</div>';
  html += '</div>';

  // Loyalty bar
  html += '<div style="background:#e5e7eb;border-radius:999px;height:20px;margin-bottom:1.5rem;overflow:hidden;">';
  html += '<div style="background:' + tier.colour + ';height:100%;width:' + pct + '%;border-radius:999px;transition:width 0.5s;"></div>';
  html += '</div>';

  // The roast card
  html += '<div style="background:' + tier.bg + ';border:2px solid ' + tier.colour + ';border-radius:16px;padding:1.25rem;margin-bottom:1.5rem;text-align:center;">';
  html += '<p style="font-size:1.125rem;color:#1f2937;margin:0;line-height:1.6;font-weight:500;">' + tier.roast + '</p>';
  html += '</div>';

  // Breakdown
  html += '<div style="margin-bottom:1rem;">';
  html += '<div style="font-weight:700;color:#374151;margin-bottom:0.75rem;font-size:0.9375rem;">📊 Loyalty Breakdown</div>';
  for (var i = 0; i < breakdown.length; i++) {
    var b = breakdown[i];
    var barPct = b.max > 0 ? Math.round((b.pts / b.max) * 100) : 0;
    var barColour = barPct >= 75 ? '#22c55e' : barPct >= 40 ? '#eab308' : '#ef4444';
    html += '<div style="margin-bottom:0.625rem;">';
    html += '<div style="display:flex;justify-content:space-between;font-size:0.8125rem;color:#6b7280;margin-bottom:0.2rem;">';
    html += '<span>' + b.emoji + ' ' + b.label + '</span>';
    html += '<span style="font-weight:600;color:#374151;">' + b.pts + '/' + b.max + '</span>';
    html += '</div>';
    html += '<div style="background:#f3f4f6;border-radius:999px;height:8px;overflow:hidden;">';
    html += '<div style="background:' + barColour + ';height:100%;width:' + barPct + '%;border-radius:999px;"></div>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';

  // Total
  html += '<div style="text-align:center;font-size:0.75rem;color:#9ca3af;">';
  html += 'Total: ' + totalPts + '/' + maxPts + ' loyalty points';
  html += '</div>';

  return html;
}

function showResult(html) {
  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');
  if (resultsDiv && contentDiv) {
    contentDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
  }
}

function getTLDR() {
  var yearsEl = document.getElementById('input-years');
  var gamesEl = document.getElementById('input-games');
  var merchEl = document.querySelector('input[name="input-merch"]:checked');
  var badTimesEl = document.querySelector('input[name="input-bad-times"]:checked');
  var tattooEl = document.querySelector('input[name="input-tattoo"]:checked');
  var cryEl = document.querySelector('input[name="input-cry"]:checked');

  if (!yearsEl || !gamesEl || !merchEl || !badTimesEl || !tattooEl || !cryEl) return '';

  var yearScores = { '1': 5, '3': 15, '10': 30, '20': 40, '99': 50 };
  var gameScores = { '2': 5, '8': 15, '15': 25, '24': 35 };
  var merchScores = { 'none': 0, 'some': 5, 'heaps': 10 };
  var badTimesScores = { 'no': 0, 'quiet': 5, 'yes': 15 };
  var tattooScores = { 'no': 0, 'considering': 5, 'yes': 20 };
  var cryScores = { 'no': 0, 'almost': 5, 'yes': 10 };

  var total = (yearScores[yearsEl.value] || 0) + (gameScores[gamesEl.value] || 0) +
    (merchScores[merchEl.value] || 0) + (badTimesScores[badTimesEl.value] || 0) +
    (tattooScores[tattooEl.value] || 0) + (cryScores[cryEl.value] || 0);
  var pct = Math.round((total / 140) * 100);
  pct = Math.min(100, Math.max(0, pct));
  var tier = getTier(pct);
  return pct + '% loyal — ' + tier.name + ' ' + tier.emoji + '. ' + tier.roast;
}
