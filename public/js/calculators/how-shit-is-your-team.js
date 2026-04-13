// How Shit Is Your Team? Calculator
// Pulls real NRL/AFL ladder data and delivers a brutally honest verdict

let _ladderData = null;
let _teamsPopulated = false;

// Fetch ladder data on load
(function() {
  fetch('/api/sports-ladders')
    .then(r => r.json())
    .then(data => {
      _ladderData = data;
      // If sport is already selected, populate teams
      const sportEl = document.getElementById('input-sport');
      if (sportEl && sportEl.value) populateTeams(sportEl.value);
    })
    .catch(() => {});

  // Listen for sport changes to populate team dropdown
  const sportEl = document.getElementById('input-sport');
  if (sportEl) {
    sportEl.addEventListener('change', function() {
      populateTeams(this.value);
    });
    // Trigger initial population
    if (_ladderData) populateTeams(sportEl.value);
  }
})();

function populateTeams(sport) {
  const teamEl = document.getElementById('input-team');
  if (!teamEl || !_ladderData) return;

  const key = sport.toLowerCase();
  const teams = _ladderData[key] || [];

  // Clear existing options
  teamEl.innerHTML = '<option value="" disabled selected>Pick your team...</option>';
  teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.name;
    opt.textContent = t.name;
    teamEl.appendChild(opt);
  });
  _teamsPopulated = true;
}

function calculate() {
  const sport = document.getElementById('input-sport').value;
  const teamName = document.getElementById('input-team').value;

  if (!_ladderData) {
    showResult('Ladder data is still loading... give it a sec and try again.');
    return;
  }

  if (!teamName) {
    showResult('Pick a team first, ya drongo.');
    return;
  }

  const key = sport.toLowerCase();
  const teams = _ladderData[key] || [];
  const team = teams.find(t => t.name === teamName);

  if (!team) {
    showResult("Can't find that team. Are they so shit they got kicked out of the comp?");
    return;
  }

  const totalTeams = teams.length;
  const result = calculateShitRating(team, totalTeams, sport);

  showResult(buildResultHTML(team, result, sport, totalTeams));
}

function calculateShitRating(team, totalTeams, sport) {
  // Position score (0-40 points of shit) — bottom of ladder = max shit
  const positionPct = (team.position - 1) / (totalTeams - 1); // 0 = top, 1 = bottom
  const positionScore = positionPct * 40;

  // Win rate score (0-30 points of shit) — fewer wins = more shit
  const winRate = team.played > 0 ? team.wins / team.played : 0;
  const winScore = (1 - winRate) * 30;

  // Points differential score (0-20 points of shit)
  let diffScore = 0;
  if (team.pointsDiff < -100) diffScore = 20;
  else if (team.pointsDiff < -50) diffScore = 15;
  else if (team.pointsDiff < -20) diffScore = 10;
  else if (team.pointsDiff < 0) diffScore = 5;
  else diffScore = 0;

  // Form/streak bonus (0-10 points of shit)
  let formScore = 0;
  if (team.streak) {
    const streakMatch = team.streak.match(/(\d+)([WL])/);
    if (streakMatch) {
      const count = parseInt(streakMatch[1]);
      const type = streakMatch[2];
      if (type === 'L') formScore = Math.min(count * 2.5, 10);
      else if (type === 'W' && count >= 3) formScore = -5; // bonus for hot streak
    }
  }

  const rawScore = Math.round(positionScore + winScore + diffScore + formScore);
  const shitRating = Math.max(0, Math.min(100, rawScore));

  return {
    shitRating,
    tier: getShitTier(shitRating),
    positionScore: Math.round(positionScore),
    winScore: Math.round(winScore),
    diffScore: Math.round(diffScore),
    formScore: Math.round(formScore)
  };
}

function getShitTier(rating) {
  if (rating <= 10) return {
    name: 'DYNASTY MODE',
    emoji: '👑',
    colour: '#10b981',
    roast: "Your team is genuinely terrifying. Your mates hate you for picking them. You probably peaked in high school too.",
    verdict: "Not shit at all. Disgustingly good."
  };
  if (rating <= 25) return {
    name: 'LEGIT CONTENDER',
    emoji: '💪',
    colour: '#22c55e',
    roast: "Solid team. You can talk trash at the pub, but don't get too cocky — September is a different beast.",
    verdict: "Only slightly shit. Enjoy it while it lasts."
  };
  if (rating <= 40) return {
    name: 'YEAH, ALRIGHT',
    emoji: '😐',
    colour: '#eab308',
    roast: "Your team is the human equivalent of a 6/10. Not bad, not great. The Toyota Camry of footy teams.",
    verdict: "A bit shit. Like a warm beer — tolerable but disappointing."
  };
  if (rating <= 55) return {
    name: 'MEDIOCRE MERCHANTS',
    emoji: '🫤',
    colour: '#f59e0b',
    roast: "Too good to get a decent draft pick, too shit to play finals. You're stuck in purgatory and the footy gods are laughing.",
    verdict: "Quite shit. Your team is the embodiment of 'meh'."
  };
  if (rating <= 70) return {
    name: 'CERTIFIED BATTLERS',
    emoji: '😬',
    colour: '#f97316',
    roast: "Every week is a new creative way to lose. Your team doesn't just lose games — they find innovative new methods of heartbreak.",
    verdict: "Pretty shit. Time to develop a 'rebuilding year' personality."
  };
  if (rating <= 85) return {
    name: 'ABSOLUTE SHAMBLES',
    emoji: '💀',
    colour: '#ef4444',
    roast: "Your team couldn't win a raffle at this point. Opposition fans don't even bother sledging you anymore — it's just pity.",
    verdict: "Really shit. Your team is a charity case."
  };
  return {
    name: 'WOODEN SPOON ENERGY',
    emoji: '🥄',
    colour: '#dc2626',
    roast: "Pack it up. Your team is so bad even their own mascot has started supporting someone else. The wooden spoon is already engraved.",
    verdict: "Cosmically shit. Your team is a war crime against sport."
  };
}

function buildResultHTML(team, result, sport, totalTeams) {
  const tier = result.tier;
  const winRate = team.played > 0 ? ((team.wins / team.played) * 100).toFixed(0) : 0;
  const sportLabel = sport.toUpperCase();

  let html = '';

  // Big shit rating
  html += '<div style="text-align:center;margin-bottom:1.5rem;">';
  html += '<div style="font-size:4rem;font-weight:900;color:' + tier.colour + ';">' + tier.emoji + ' ' + result.shitRating + '/100</div>';
  html += '<div style="font-size:1.5rem;font-weight:800;color:' + tier.colour + ';letter-spacing:0.05em;">' + tier.name + '</div>';
  html += '<div style="font-size:0.875rem;color:#6b7280;margin-top:0.25rem;">' + tier.verdict + '</div>';
  html += '</div>';

  // Team stats card
  html += '<div style="background:#f9fafb;border-radius:12px;padding:1rem;margin-bottom:1rem;">';
  html += '<div style="font-weight:700;color:#00205B;margin-bottom:0.5rem;">' + team.name + ' — ' + sportLabel + ' ' + _ladderData.season + '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;font-size:0.875rem;">';
  html += '<div>📊 Ladder position: <strong>' + team.position + '/' + totalTeams + '</strong></div>';
  html += '<div>🏆 Record: <strong>' + team.wins + 'W-' + team.losses + 'L' + (team.draws > 0 ? '-' + team.draws + 'D' : '') + '</strong></div>';
  html += '<div>📈 Win rate: <strong>' + winRate + '%</strong></div>';
  html += '<div>⚖️ Points diff: <strong>' + (team.pointsDiff > 0 ? '+' : '') + team.pointsDiff + '</strong></div>';
  if (team.streak) html += '<div>🔥 Streak: <strong>' + team.streak + '</strong></div>';
  if (team.form) html += '<div>📋 Form: <strong>' + team.form + '</strong></div>';
  html += '</div></div>';

  // The roast
  html += '<div style="background:' + tier.colour + '10;border-left:4px solid ' + tier.colour + ';border-radius:8px;padding:1rem;margin-bottom:1rem;">';
  html += '<p style="font-size:0.9375rem;color:#374151;margin:0;line-height:1.6;">' + tier.roast + '</p>';
  html += '</div>';

  // Breakdown
  html += '<details style="margin-bottom:0.5rem;"><summary style="cursor:pointer;font-size:0.8125rem;color:#9ca3af;">How we calculated your shit rating</summary>';
  html += '<div style="font-size:0.8125rem;color:#6b7280;margin-top:0.5rem;">';
  html += '<div>Ladder position: +' + result.positionScore + ' shit points</div>';
  html += '<div>Win rate: +' + result.winScore + ' shit points</div>';
  html += '<div>Points differential: +' + result.diffScore + ' shit points</div>';
  html += '<div>Current form: ' + (result.formScore >= 0 ? '+' : '') + result.formScore + ' shit points</div>';
  html += '</div></details>';

  // Data freshness
  html += '<div style="font-size:0.6875rem;color:#d1d5db;text-align:center;margin-top:0.5rem;">Ladder data updated: ' + new Date(_ladderData.updated).toLocaleDateString('en-AU') + '</div>';

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
  var sport = document.getElementById('input-sport').value;
  var teamName = document.getElementById('input-team').value;
  if (!_ladderData || !teamName) return '';
  var teams = _ladderData[sport.toLowerCase()] || [];
  var team = teams.find(function(t) { return t.name === teamName; });
  if (!team) return '';
  var result = calculateShitRating(team, teams.length, sport);
  return team.name + ' scored ' + result.shitRating + '/100 on the shit meter. ' + result.tier.verdict;
}
