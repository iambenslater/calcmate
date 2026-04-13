// Rival Team Trash Talk Generator
// Data-driven roasts using real ladder stats

var _ladderData2 = null;
var _teamsPopulated2 = false;

// Fetch ladder data on load
(function() {
  fetch('/api/sports-ladders')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _ladderData2 = data;
      // Check URL params for shared links
      var params = new URLSearchParams(window.location.search);
      var sportEl = document.getElementById('input-sport2');
      var paramSport = params.get('sport2');
      if (paramSport && sportEl) sportEl.value = paramSport;
      if (sportEl && sportEl.value) populateTeams2(sportEl.value);
      // If team params exist, set them and auto-calculate
      var paramMyTeam = params.get('my-team');
      var paramRivalTeam = params.get('rival-team');
      if (paramMyTeam || paramRivalTeam) {
        var myTeamEl = document.getElementById('input-my-team');
        var rivalTeamEl = document.getElementById('input-rival-team');
        if (paramMyTeam && myTeamEl) myTeamEl.value = paramMyTeam;
        if (paramRivalTeam && rivalTeamEl) rivalTeamEl.value = paramRivalTeam;
        calculate();
      }
    })
    .catch(function() {});

  // Listen for sport changes
  var sportEl = document.getElementById('input-sport2');
  if (sportEl) {
    sportEl.addEventListener('change', function() {
      populateTeams2(this.value);
    });
    if (_ladderData2) populateTeams2(sportEl.value);
  }
})();

function populateTeams2(sport) {
  var myTeamEl = document.getElementById('input-my-team');
  var rivalTeamEl = document.getElementById('input-rival-team');
  if (!myTeamEl || !rivalTeamEl || !_ladderData2) return;

  var key = sport.toLowerCase();
  var teams = _ladderData2[key] || [];

  myTeamEl.innerHTML = '<option value="" disabled selected>Your team...</option>';
  rivalTeamEl.innerHTML = '<option value="" disabled selected>Their team...</option>';

  teams.forEach(function(t) {
    var opt1 = document.createElement('option');
    opt1.value = t.name;
    opt1.textContent = t.name;
    myTeamEl.appendChild(opt1);

    var opt2 = document.createElement('option');
    opt2.value = t.name;
    opt2.textContent = t.name;
    rivalTeamEl.appendChild(opt2);
  });
  _teamsPopulated2 = true;
}

function calculate() {
  var sportEl = document.getElementById('input-sport2');
  var myTeamEl = document.getElementById('input-my-team');
  var rivalTeamEl = document.getElementById('input-rival-team');

  if (!sportEl || !myTeamEl || !rivalTeamEl) {
    showResult2('<p style="color:#ef4444;font-weight:600;text-align:center;">Something went wrong loading the form. Refresh and try again.</p>');
    return;
  }

  if (!_ladderData2) {
    showResult2('<p style="color:#ef4444;font-weight:600;text-align:center;">Still loading ladder data... give it a sec and smash Calculate again.</p>');
    return;
  }

  var sport = sportEl.value;
  var myTeamName = myTeamEl.value;
  var rivalTeamName = rivalTeamEl.value;

  if (!myTeamName || !rivalTeamName) {
    showResult2('<p style="color:#ef4444;font-weight:600;text-align:center;">Pick both teams first. Can\'t generate trash talk against thin air.</p>');
    return;
  }

  // Same team check
  if (myTeamName === rivalTeamName) {
    showResult2(buildSameTeamHTML(myTeamName));
    return;
  }

  var key = sport.toLowerCase();
  var teams = _ladderData2[key] || [];
  var myTeam = teams.find(function(t) { return t.name === myTeamName; });
  var rivalTeam = teams.find(function(t) { return t.name === rivalTeamName; });

  if (!myTeam || !rivalTeam) {
    showResult2('<p style="color:#ef4444;font-weight:600;text-align:center;">Can\'t find one of those teams in the ladder. They might\'ve been relegated to park footy.</p>');
    return;
  }

  var roasts = generateRoasts(myTeam, rivalTeam, teams.length);
  showResult2(buildRoastHTML(myTeam, rivalTeam, roasts, teams.length));
}

function generateRoasts(myTeam, rivalTeam, totalTeams) {
  var roasts = [];
  var posGap = rivalTeam.position - myTeam.position;
  var myWinRate = myTeam.played > 0 ? (myTeam.wins / myTeam.played * 100).toFixed(0) : 0;
  var rivalWinRate = rivalTeam.played > 0 ? (rivalTeam.wins / rivalTeam.played * 100).toFixed(0) : 0;
  var weAreAbove = myTeam.position < rivalTeam.position;

  // Pool of templates for each category
  // LADDER POSITION roasts
  var ladderRoasts = [];
  if (weAreAbove) {
    ladderRoasts.push('Your mob are sitting ' + Math.abs(posGap) + ' spots below us on the ladder. Must be nice down there — less pressure, more parking.');
    ladderRoasts.push("We're " + myTeam.position + getSuffix(myTeam.position) + ". You're " + rivalTeam.position + getSuffix(rivalTeam.position) + ". That's not a rivalry, that's a charity case.");
    ladderRoasts.push(rivalTeam.name + " are " + Math.abs(posGap) + " rungs below us. At this rate you'll need a shovel to find your season.");
    if (Math.abs(posGap) >= 6) {
      ladderRoasts.push("I'd need to scroll down to find " + rivalTeam.name + " on the ladder. My thumb got tired.");
    }
  } else if (posGap === 0) {
    ladderRoasts.push("We're level on the ladder. Enjoy it while it lasts, because " + rivalTeam.name + " always find a way to choke.");
    ladderRoasts.push("Same ladder position? Don't worry, you'll find a way to drop. You always do.");
  } else {
    ladderRoasts.push("Look, they're " + Math.abs(posGap) + " spots above us right now. Even a broken clock is right twice a day. Enjoy the view while it lasts, " + rivalTeam.name + ".");
    ladderRoasts.push("Yeah alright, " + rivalTeam.name + " are above us. But being above " + myTeam.name + " isn't exactly Mount Everest, is it?");
    ladderRoasts.push("Sure, " + rivalTeam.name + " are " + Math.abs(posGap) + " spots ahead. But we all know September is a different story for them.");
  }

  // WIN RECORD roasts
  var winRoasts = [];
  if (myTeam.wins > rivalTeam.wins) {
    winRoasts.push("We've got " + myTeam.wins + " wins. You've got " + rivalTeam.wins + ". I'd say do the math but your team clearly can't count either.");
    winRoasts.push(myTeam.wins + " wins for us vs " + rivalTeam.wins + " for " + rivalTeam.name + ". That's not a comparison, that's an intervention.");
    winRoasts.push(rivalTeam.name + " have won " + rivalTeam.wins + " games. My nan's lawn bowls team has a better record.");
  } else if (myTeam.wins === rivalTeam.wins) {
    winRoasts.push("Same number of wins? Yeah but ours looked convincing. Yours looked like accidents.");
    winRoasts.push(myTeam.wins + " wins each. The difference is we meant it.");
  } else {
    winRoasts.push("You've got more wins than us. Congratulations. Want a trophy? Oh wait, " + rivalTeam.name + " don't know what those look like either.");
    winRoasts.push("More wins than us this year, sure. But at least our fans don't need therapy after every game.");
  }

  // POINTS DIFFERENTIAL roasts
  var diffRoasts = [];
  if (myTeam.pointsDiff > rivalTeam.pointsDiff) {
    var gap = myTeam.pointsDiff - rivalTeam.pointsDiff;
    diffRoasts.push("We're at " + (myTeam.pointsDiff > 0 ? "+" : "") + myTeam.pointsDiff + " points diff. You're at " + (rivalTeam.pointsDiff > 0 ? "+" : "") + rivalTeam.pointsDiff + ". That's not a gap, that's a canyon.");
    diffRoasts.push("Points differential says it all: us " + (myTeam.pointsDiff > 0 ? "+" : "") + myTeam.pointsDiff + ", you " + (rivalTeam.pointsDiff > 0 ? "+" : "") + rivalTeam.pointsDiff + ". " + gap + " points of pure pain.");
    if (rivalTeam.pointsDiff < -50) {
      diffRoasts.push(rivalTeam.name + " at " + rivalTeam.pointsDiff + " points diff. That's not a season, that's a crime scene.");
    }
  } else {
    diffRoasts.push("Your points diff is better? Cool. Ours has character. Yours has... spreadsheets.");
    diffRoasts.push("Better points diff doesn't mean better team. It means you beat up on the easy ones and crumbled when it mattered.");
  }

  // BOTTOM 4 / TOP 4 special roasts
  var specialRoasts = [];
  if (rivalTeam.position > totalTeams - 4) {
    specialRoasts.push(rivalTeam.name + " are so far down the ladder they need a periscope to see the finals. 🔭");
    specialRoasts.push("Bottom four. " + rivalTeam.name + " aren't rebuilding — they're demolishing.");
    specialRoasts.push(rivalTeam.name + "'s season is giving \"participation award\" energy. At least you showed up. Barely.");
  }
  if (rivalTeam.position === totalTeams) {
    specialRoasts.push("Dead last. " + rivalTeam.name + " are so bad the wooden spoon applied for them.");
    specialRoasts.push("🥄 WOODEN SPOON WATCH 🥄 — " + rivalTeam.name + " are collecting splinters at the bottom of the ladder.");
  }
  if (myTeam.position <= 4 && rivalTeam.position > 8) {
    specialRoasts.push("We're in the top four. You're in the... what do you call it? The irrelevant zone?");
  }

  // FORM roasts
  var formRoasts = [];
  if (rivalTeam.streak) {
    var streakMatch = rivalTeam.streak.match(/(\d+)([WL])/);
    if (streakMatch) {
      var count = parseInt(streakMatch[1]);
      var type = streakMatch[2];
      if (type === 'L' && count >= 3) {
        formRoasts.push(rivalTeam.name + " on a " + count + "-game losing streak. At what point does it stop being a streak and start being a lifestyle?");
        formRoasts.push(count + " losses in a row for " + rivalTeam.name + ". That's not a form slump, that's an identity.");
      }
      if (type === 'W' && count >= 3 && !weAreAbove) {
        formRoasts.push("Yeah " + rivalTeam.name + " are on a " + count + "-game win streak. We all know how that movie ends for them.");
      }
    }
  }
  if (rivalTeam.form) {
    var losses = (rivalTeam.form.match(/L/g) || []).length;
    if (losses >= 3) {
      formRoasts.push("Recent form: " + rivalTeam.form + ". If that was a report card, " + rivalTeam.name + " would be repeating the year.");
    }
  }

  // SELF-DEPRECATING if we're below them
  var selfDepRoasts = [];
  if (!weAreAbove && posGap !== 0) {
    selfDepRoasts.push("Look, we're not great either, but at least we're not " + rivalTeam.name + ". That's something to cling to.");
    selfDepRoasts.push("Are we in a position to talk trash? Not really. But " + rivalTeam.name + " make us feel better about our own misery.");
    selfDepRoasts.push("Supporting " + myTeam.name + " is pain. But at least it's not " + rivalTeam.name + " pain. There are levels.");
  }

  // Combine all pools
  var allRoasts = ladderRoasts.concat(winRoasts, diffRoasts, specialRoasts, formRoasts, selfDepRoasts);

  // Shuffle and pick 3-4
  shuffle(allRoasts);
  var picked = [];
  // Ensure at least one from each major category if available
  if (ladderRoasts.length) picked.push(pickRandom(ladderRoasts));
  if (winRoasts.length) picked.push(pickRandom(winRoasts));
  if (diffRoasts.length) picked.push(pickRandom(diffRoasts));

  // Fill up to 4 from remaining
  var used = new Set(picked);
  for (var i = 0; i < allRoasts.length && picked.length < 4; i++) {
    if (!used.has(allRoasts[i])) {
      picked.push(allRoasts[i]);
      used.add(allRoasts[i]);
    }
  }

  return picked;
}

function buildRoastHTML(myTeam, rivalTeam, roasts, totalTeams) {
  var html = '';

  // Header
  html += '<div style="text-align:center;margin-bottom:1.5rem;">';
  html += '<div style="font-size:2.5rem;font-weight:900;color:#1f2937;line-height:1.2;">';
  html += '🔥 ' + myTeam.name + ' <span style="color:#9ca3af;font-weight:400;">vs</span> ' + rivalTeam.name + ' 🔥';
  html += '</div>';
  html += '<div style="font-size:0.875rem;color:#6b7280;margin-top:0.5rem;">Data-driven trash talk. Facts don\'t care about their feelings.</div>';
  html += '</div>';

  // Quick stat comparison bar
  html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:0.5rem;margin-bottom:1.5rem;text-align:center;font-size:0.8125rem;">';
  html += buildStatRow(myTeam.position + getSuffix(myTeam.position), '📊 Ladder', rivalTeam.position + getSuffix(rivalTeam.position), myTeam.position < rivalTeam.position);
  html += buildStatRow(myTeam.wins + 'W-' + myTeam.losses + 'L', '🏆 Record', rivalTeam.wins + 'W-' + rivalTeam.losses + 'L', myTeam.wins > rivalTeam.wins);
  html += buildStatRow((myTeam.pointsDiff > 0 ? '+' : '') + myTeam.pointsDiff, '⚖️ Pts Diff', (rivalTeam.pointsDiff > 0 ? '+' : '') + rivalTeam.pointsDiff, myTeam.pointsDiff > rivalTeam.pointsDiff);
  var myWR = myTeam.played > 0 ? (myTeam.wins / myTeam.played * 100).toFixed(0) + '%' : '0%';
  var rivalWR = rivalTeam.played > 0 ? (rivalTeam.wins / rivalTeam.played * 100).toFixed(0) + '%' : '0%';
  html += buildStatRow(myWR, '📈 Win Rate', rivalWR, parseFloat(myWR) > parseFloat(rivalWR));
  html += '</div>';

  // Roast cards
  var colours = ['#dc2626', '#ea580c', '#7c3aed', '#0891b2'];
  var bgColours = ['#fef2f2', '#fff7ed', '#f5f3ff', '#ecfeff'];
  var emojis = ['🔥', '💀', '🗣️', '😤', '💣', '🎯', '🪦', '📢'];

  for (var i = 0; i < roasts.length; i++) {
    var colour = colours[i % colours.length];
    var bg = bgColours[i % bgColours.length];
    var emoji = emojis[Math.floor(Math.random() * emojis.length)];
    html += '<div style="background:' + bg + ';border:2px solid ' + colour + ';border-radius:16px;padding:1.25rem;margin-bottom:1rem;text-align:center;">';
    html += '<div style="font-size:1.5rem;margin-bottom:0.5rem;">' + emoji + '</div>';
    html += '<p style="font-size:1.0625rem;font-weight:600;color:#1f2937;margin:0;line-height:1.5;">"' + roasts[i] + '"</p>';
    html += '</div>';
  }

  // Generate More button
  html += '<div style="text-align:center;margin-top:1rem;margin-bottom:0.5rem;">';
  html += '<button onclick="calculate()" style="background:#1f2937;color:white;border:none;padding:0.75rem 1.5rem;border-radius:12px;font-weight:700;font-size:0.9375rem;cursor:pointer;">🔄 Generate More Trash Talk</button>';
  html += '</div>';

  // Data freshness
  html += '<div style="font-size:0.6875rem;color:#d1d5db;text-align:center;margin-top:0.5rem;">Ladder data updated: ' + new Date(_ladderData2.updated).toLocaleDateString('en-AU') + '</div>';

  return html;
}

function buildStatRow(myVal, label, rivalVal, myWins) {
  var myColour = myWins ? '#22c55e' : '#ef4444';
  var rivalColour = myWins ? '#ef4444' : '#22c55e';
  var html = '';
  html += '<div style="font-weight:700;color:' + myColour + ';">' + myVal + '</div>';
  html += '<div style="color:#9ca3af;font-weight:500;">' + label + '</div>';
  html += '<div style="font-weight:700;color:' + rivalColour + ';">' + rivalVal + '</div>';
  return html;
}

function buildSameTeamHTML(teamName) {
  var html = '';
  html += '<div style="text-align:center;padding:2rem 1rem;">';
  html += '<div style="font-size:4rem;margin-bottom:1rem;">🤦</div>';
  html += '<div style="font-size:1.5rem;font-weight:800;color:#1f2937;margin-bottom:1rem;">Mate... really?</div>';
  html += '<div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:16px;padding:1.25rem;margin-bottom:1rem;">';
  html += '<p style="font-size:1.125rem;font-weight:600;color:#1f2937;margin:0;line-height:1.5;">"You can\'t trash talk yourself. Well, you can, but that\'s just called being a ' + teamName + ' fan."</p>';
  html += '</div>';
  html += '<div style="font-size:0.875rem;color:#6b7280;">Pick two different teams and come back when you\'re ready for actual banter.</div>';
  html += '</div>';
  return html;
}

function getSuffix(pos) {
  if (pos === 1) return 'st';
  if (pos === 2) return 'nd';
  if (pos === 3) return 'rd';
  return 'th';
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function showResult2(html) {
  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');
  if (resultsDiv && contentDiv) {
    contentDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
  }
}

function getTLDR() {
  var myTeamEl = document.getElementById('input-my-team');
  var rivalTeamEl = document.getElementById('input-rival-team');
  if (!myTeamEl || !rivalTeamEl || !_ladderData2) return '';
  var sportEl = document.getElementById('input-sport2');
  if (!sportEl) return '';

  var myTeamName = myTeamEl.value;
  var rivalTeamName = rivalTeamEl.value;
  if (!myTeamName || !rivalTeamName) return '';
  if (myTeamName === rivalTeamName) return "You tried to trash talk yourself. Classic " + myTeamName + " fan.";

  var key = sportEl.value.toLowerCase();
  var teams = _ladderData2[key] || [];
  var myTeam = teams.find(function(t) { return t.name === myTeamName; });
  var rivalTeam = teams.find(function(t) { return t.name === rivalTeamName; });
  if (!myTeam || !rivalTeam) return '';

  var posGap = Math.abs(rivalTeam.position - myTeam.position);
  return myTeam.name + ' vs ' + rivalTeam.name + ' — ' + posGap + ' ladder spots apart. Data-driven trash talk generated.';
}
