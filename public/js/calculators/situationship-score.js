function calculate() {
  const fields = ['texts', 'plans', 'friends', 'label', 'socials', 'weekends'];
  const scoring = {
    texts:    { me: 0, equal: 1, them: 2 },
    plans:    { never: 0, sometimes: 1, always: 2 },
    friends:  { no: 0, once: 1, yes: 2 },
    label:    { avoided: 0, vague: 1, yes: 2 },
    socials:  { hidden: 0, stories: 1, posted: 2 },
    weekends: { rarely: 0, sometimes: 1, always: 2 }
  };

  let total = 0;
  let answered = 0;

  for (const field of fields) {
    const el = document.querySelector('input[name="input-' + field + '"]:checked');
    if (el) {
      total += scoring[field][el.value] || 0;
      answered++;
    }
  }

  if (answered < fields.length) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="result-note">Answer all six questions to get your verdict. No skipping — we need the full picture.</p>';
    return;
  }

  const pct = Math.round((total / 12) * 100);

  let tier, emoji, colour, roast;
  if (pct <= 25) {
    tier = 'BESTIE, RUN';
    emoji = '🚩';
    colour = '#dc2626';
    roast = "You're not in a relationship, you're on a roster. This person is keeping you around like a backup phone charger — useful when needed, forgotten in the drawer otherwise. The red flags aren't just waving, they're doing a choreographed dance.";
  } else if (pct <= 50) {
    tier = "IT'S GIVING... SITUATIONSHIP";
    emoji = '🫠';
    colour = '#f97316';
    roast = "You're in the grey area where you're too involved to date other people but not official enough to get upset about it. Schrodinger's relationship. You've definitely drafted the \"what are we\" text at least three times and deleted it every time.";
  } else if (pct <= 75) {
    tier = 'GETTING SOMEWHERE';
    emoji = '💛';
    colour = '#eab308';
    roast = "There are real signs here. They're making effort, you're meeting people, things are progressing. Don't blow it by sending this calculator to them. (Or do. Power move.) Either way, the vibes are cautiously optimistic.";
  } else {
    tier = "YOU'RE BASICALLY DATING";
    emoji = '💚';
    colour = '#22c55e';
    roast = "Babe, you're in a relationship. The only thing missing is the Instagram post. Have the talk. Or just send them this result — that should do it. You two are literally the couple that everyone else in the group chat is gossiping about.";
  }

  // Visual breakdown
  const labels = {
    texts: 'Who texts first',
    plans: 'Making plans',
    friends: 'Met friends',
    label: 'The label talk',
    socials: 'Social media',
    weekends: 'Weekend time'
  };
  const breakdownHTML = fields.map(f => {
    const el = document.querySelector('input[name="input-' + f + '"]:checked');
    const val = scoring[f][el.value];
    const pctBar = Math.round((val / 2) * 100);
    const barColour = val === 0 ? '#ef4444' : val === 1 ? '#eab308' : '#22c55e';
    return '<div style="margin-bottom: 0.5rem;">' +
      '<div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:2px;">' +
        '<span>' + labels[f] + '</span><span style="color:' + barColour + '; font-weight:600;">' + el.value + '</span>' +
      '</div>' +
      '<div style="background:#e5e7eb; border-radius:4px; height:8px; overflow:hidden;">' +
        '<div style="background:' + barColour + '; height:100%; width:' + pctBar + '%; border-radius:4px; transition:width 0.3s;"></div>' +
      '</div>' +
    '</div>';
  }).join('');

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div style="text-align:center; padding: 1.5rem 0;">
      <div style="font-size: 3.5rem; margin-bottom: 0.25rem;">${emoji}</div>
      <div style="font-size: 2.8rem; font-weight: 900; color: ${colour}; line-height: 1.1;">${pct}%</div>
      <div style="font-size: 1.5rem; font-weight: 700; color: ${colour}; margin-top: 0.5rem;">${tier}</div>
    </div>
    <p class="result-note" style="text-align:center; font-size: 1.05rem; max-width: 480px; margin: 0 auto 1.25rem; line-height: 1.5;">${roast}</p>
    <hr style="border-color: var(--border-light); margin: 1.25rem 0;">
    <p class="result-note" style="font-weight:600; margin-bottom: 0.75rem;">The Breakdown:</p>
    ${breakdownHTML}
    <div style="text-align:center; margin-top: 1.25rem;">
      <p class="result-note" style="font-style:italic; color:#64748b;">Screenshot this and send it to the group chat. You know you want to.</p>
    </div>
  `;
}

function getTLDR() {
  const fields = ['texts', 'plans', 'friends', 'label', 'socials', 'weekends'];
  const scoring = {
    texts:    { me: 0, equal: 1, them: 2 },
    plans:    { never: 0, sometimes: 1, always: 2 },
    friends:  { no: 0, once: 1, yes: 2 },
    label:    { avoided: 0, vague: 1, yes: 2 },
    socials:  { hidden: 0, stories: 1, posted: 2 },
    weekends: { rarely: 0, sometimes: 1, always: 2 }
  };

  let total = 0;
  let answered = 0;
  for (const field of fields) {
    const el = document.querySelector('input[name="input-' + field + '"]:checked');
    if (el) { total += scoring[field][el.value] || 0; answered++; }
  }
  if (answered < fields.length) return '';

  const pct = Math.round((total / 12) * 100);
  let tier;
  if (pct <= 25) tier = 'Bestie, Run';
  else if (pct <= 50) tier = 'Classic Situationship';
  else if (pct <= 75) tier = 'Getting Somewhere';
  else tier = 'Basically Dating';

  return 'Situationship score: ' + pct + '% — ' + tier + '. ' + (pct <= 50 ? 'Red flags detected. Proceed with caution (or don\'t proceed at all).' : 'Looking promising — might be time for the talk.');
}
