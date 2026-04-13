function calculate() {
  const name = (document.getElementById('input-mate-name').value || '').trim();
  const reliability = parseFloat(document.getElementById('input-reliability').value) || 0;
  const barTab = parseFloat(document.getElementById('input-bar-tab').value) || 0;
  const wingman = parseFloat(document.getElementById('input-wingman').value) || 0;
  const secrets = parseFloat(document.getElementById('input-secrets').value) || 0;
  const banter = parseFloat(document.getElementById('input-banter').value) || 0;
  const crisis = parseFloat(document.getElementById('input-crisis').value) || 0;

  if (!name) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="result-note">Enter your mate\'s name to begin the roast. They deserve this.</p>';
    return;
  }

  // Weighted average out of 10, then scale to 100
  const weighted = (reliability * 2 + barTab * 1.5 + wingman * 1 + secrets * 1.5 + banter * 1 + crisis * 1) / 8;
  const score = Math.round(weighted * 10);

  let tier, emoji, colour, roast;
  if (score >= 90) {
    tier = 'S-TIER MATE';
    emoji = '👑';
    colour = '#22c55e';
    roast = name + ' is an absolute legend. Lock them in. If you lose this one, that\'s on you. This is the mate who\'d help you move house AND bring the beers. Treasure them.';
  } else if (score >= 75) {
    tier = 'SOLID LEGEND';
    emoji = '🤙';
    colour = '#84cc16';
    roast = name + ' is a reliable unit. Shows up when it counts, brings good energy, and only occasionally dodges the bar tab. Top 10% of mates, easy.';
  } else if (score >= 60) {
    tier = 'DECENT ENOUGH';
    emoji = '😐';
    colour = '#eab308';
    roast = name + ' is... fine. Not bad, not amazing. The kind of mate you\'d invite to the party but not trust with anything important. Mid-tier energy. Room for improvement.';
  } else if (score >= 40) {
    tier = 'BIT DODGY';
    emoji = '🫣';
    colour = '#f97316';
    roast = name + ' is on thin ice. Too many flaked plans, not enough shouts at the pub. Probationary mate status. One more "sorry can\'t make it" and they\'re getting demoted.';
  } else if (score >= 20) {
    tier = 'LIABILITY';
    emoji = '🚨';
    colour = '#ef4444';
    roast = name + ' is a net negative to the group. They owe everyone money, can\'t keep a secret, and their banter is painful. The group chat goes quiet when they text.';
  } else {
    tier = 'CUT THEM LOOSE';
    emoji = '✂️';
    colour = '#7f1d1d';
    roast = name + ' isn\'t a mate. They\'re a burden. Change the group chat name and don\'t add them back. You\'ll feel lighter immediately. Trust the process.';
  }

  // Category breakdown bars
  const categories = [
    { label: 'Reliability', value: reliability, weight: '2x', icon: '🤝' },
    { label: 'Bar Tab Generosity', value: barTab, weight: '1.5x', icon: '🍺' },
    { label: 'Wingman Ability', value: wingman, weight: '1x', icon: '🦅' },
    { label: 'Secret Keeping', value: secrets, weight: '1.5x', icon: '🤫' },
    { label: 'Banter Quality', value: banter, weight: '1x', icon: '😂' },
    { label: 'Crisis Support', value: crisis, weight: '1x', icon: '🆘' }
  ];

  const barsHTML = categories.map(c => {
    const pct = c.value * 10;
    const barColour = pct >= 70 ? '#22c55e' : pct >= 40 ? '#eab308' : '#ef4444';
    return '<div style="margin-bottom: 0.6rem;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; margin-bottom:3px;">' +
        '<span>' + c.icon + ' ' + c.label + ' <span style="color:#94a3b8; font-size:0.75rem;">(' + c.weight + ')</span></span>' +
        '<span style="font-weight:700; color:' + barColour + ';">' + c.value + '/10</span>' +
      '</div>' +
      '<div style="background:#e5e7eb; border-radius:4px; height:10px; overflow:hidden;">' +
        '<div style="background:' + barColour + '; height:100%; width:' + pct + '%; border-radius:4px; transition:width 0.3s;"></div>' +
      '</div>' +
    '</div>';
  }).join('');

  // Find the worst category for a bonus roast
  const worst = categories.reduce((a, b) => a.value < b.value ? a : b);
  const best = categories.reduce((a, b) => a.value > b.value ? a : b);
  let bonusRoast = '';
  if (worst.value <= 3) {
    bonusRoast = 'Biggest weakness: <strong>' + worst.label + '</strong> at ' + worst.value + '/10. Yikes. That needs work.';
  }
  if (best.value >= 8 && worst.value <= 4) {
    bonusRoast += (bonusRoast ? ' ' : '') + 'At least they nail <strong>' + best.label + '</strong> (' + best.value + '/10). Every cloud, eh?';
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div style="text-align:center; padding: 1.5rem 0;">
      <div style="font-size: 3rem; margin-bottom: 0.25rem;">${emoji}</div>
      <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); line-height: 1.2;">${name}</div>
      <div style="font-size: 3rem; font-weight: 900; color: ${colour}; margin-top: 0.25rem;">${score}/100</div>
      <div style="font-size: 1.4rem; font-weight: 700; color: ${colour}; margin-top: 0.25rem;">${tier} ${emoji}</div>
    </div>
    <p class="result-note" style="text-align:center; font-size: 1.05rem; max-width: 480px; margin: 0 auto 1.25rem; line-height: 1.5;">${roast}</p>
    <hr style="border-color: var(--border-light); margin: 1.25rem 0;">
    <p class="result-note" style="font-weight:600; margin-bottom: 0.75rem;">Category Breakdown:</p>
    ${barsHTML}
    ${bonusRoast ? '<p class="result-note" style="margin-top: 0.75rem; font-size: 0.9rem;">' + bonusRoast + '</p>' : ''}
    <div style="text-align:center; margin-top: 1.25rem;">
      <p class="result-note" style="font-style:italic; color:#64748b;">Send this to ${name}. Or send it to the group chat WITHOUT ${name}. Both are valid power moves.</p>
    </div>
  `;
}

function getTLDR() {
  const name = (document.getElementById('input-mate-name').value || '').trim();
  const reliability = parseFloat(document.getElementById('input-reliability').value) || 0;
  const barTab = parseFloat(document.getElementById('input-bar-tab').value) || 0;
  const wingman = parseFloat(document.getElementById('input-wingman').value) || 0;
  const secrets = parseFloat(document.getElementById('input-secrets').value) || 0;
  const banter = parseFloat(document.getElementById('input-banter').value) || 0;
  const crisis = parseFloat(document.getElementById('input-crisis').value) || 0;

  if (!name) return '';

  const weighted = (reliability * 2 + barTab * 1.5 + wingman * 1 + secrets * 1.5 + banter * 1 + crisis * 1) / 8;
  const score = Math.round(weighted * 10);

  let tier;
  if (score >= 90) tier = 'S-Tier Mate';
  else if (score >= 75) tier = 'Solid Legend';
  else if (score >= 60) tier = 'Decent Enough';
  else if (score >= 40) tier = 'Bit Dodgy';
  else if (score >= 20) tier = 'Liability';
  else tier = 'Cut Them Loose';

  return name + ' scored ' + score + '/100 — rated ' + tier + '. ' + (score >= 75 ? 'Lock this one in.' : score >= 40 ? 'They\'re on probation.' : 'Might be time to update the group chat.');
}
