function calculate() {
  const drinks = parseFloat(document.getElementById('input-drinks').value) || 0;
  const hours = parseFloat(document.getElementById('input-hours').value) || 0;
  const weight = parseFloat(document.getElementById('input-weight').value) || 0;
  const genderEl = document.querySelector('input[name="input-gender"]:checked');
  const foodEl = document.querySelector('input[name="input-food"]:checked');

  if (!drinks || !weight || !genderEl) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="result-note">Fill in your drinks, weight, and gender to find out how cooked you are.</p>';
    return;
  }

  const gender = genderEl.value;
  const food = foodEl ? foodEl.value : 'no';

  const genderFactor = gender === 'male' ? 0.68 : 0.55;
  const foodMultiplier = food === 'yes' ? 0.6 : food === 'some' ? 0.8 : 1.0;
  const effectiveDrinks = drinks * foodMultiplier;

  let bac = (effectiveDrinks * 10) / (weight * genderFactor) - (0.015 * hours);
  bac = Math.max(0, bac);

  // Determine tier
  let tier, roast, colour, emoji;
  if (bac === 0) {
    tier = 'Stone Cold Sober';
    roast = "You're the designated driver. Hero. Everyone else is going to owe you a kebab tomorrow.";
    colour = '#22c55e';
    emoji = '🧊';
  } else if (bac <= 0.03) {
    tier = 'Loosened Up';
    roast = "One drink in and you're already telling everyone you love them. Your Uber rating is safe... for now.";
    colour = '#84cc16';
    emoji = '😊';
  } else if (bac <= 0.06) {
    tier = 'Nicely Buzzed';
    roast = "Sweet spot. You're funny, you're confident, you're... slightly louder than necessary. This is peak you. Stay here.";
    colour = '#eab308';
    emoji = '🍻';
  } else if (bac <= 0.10) {
    tier = 'Properly Pissed';
    roast = "You've started giving life advice to strangers. Your dance moves have... evolved. You just called your ex \"legend\" in a text you'll regret.";
    colour = '#f97316';
    emoji = '🕺';
  } else if (bac <= 0.15) {
    tier = 'Absolutely Cooked';
    roast = "You've lost one shoe and you're trying to order a kebab in what you think is the kebab shop's language. Your mates are filming you. This WILL end up on the group chat.";
    colour = '#ef4444';
    emoji = '🫠';
  } else if (bac <= 0.20) {
    tier = 'Talking to the Bins';
    roast = "The bins are your best mates now. You're having a deep and meaningful with the recycling. You've told three strangers they're your \"brother from another mother.\"";
    colour = '#dc2626';
    emoji = '🗑️';
  } else {
    tier = 'Call an Ambulance';
    roast = "This is genuinely concerning. You need water, a safe place, and mates looking after you. This isn't funny anymore — look after yourself.";
    colour = '#7f1d1d';
    emoji = '🚑';
  }

  // Time until sober
  const hoursToSober = bac > 0 ? (bac / 0.015) : 0;
  const soberHours = Math.floor(hoursToSober);
  const soberMins = Math.round((hoursToSober - soberHours) * 60);

  const foodLabel = food === 'yes' ? 'Full meal' : food === 'some' ? 'Snacks' : 'Empty stomach';

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div style="text-align:center; padding: 1.5rem 0;">
      <div style="font-size: 3rem; margin-bottom: 0.25rem;">${emoji}</div>
      <div style="font-size: 2.2rem; font-weight: 800; color: ${colour}; line-height: 1.2;">${tier}</div>
      <div style="font-size: 1.4rem; color: #64748b; margin-top: 0.5rem;">Estimated BAC: <strong style="color: ${colour};">${bac.toFixed(3)}%</strong></div>
    </div>
    <p class="result-note" style="text-align:center; font-size: 1.1rem; max-width: 500px; margin: 0 auto; line-height: 1.5;">${roast}</p>
    <hr style="border-color: var(--border-light); margin: 1.25rem 0;">
    <div class="result-row"><span class="result-label">Standard Drinks</span><span class="result-value">${drinks} (${foodLabel} &rarr; ${effectiveDrinks.toFixed(1)} effective)</span></div>
    <div class="result-row"><span class="result-label">Drinking Time</span><span class="result-value">${hours} hour${hours !== 1 ? 's' : ''}</span></div>
    <div class="result-row highlight"><span class="result-label">Time Until Sober</span><span class="result-value">${bac > 0 ? soberHours + 'h ' + soberMins + 'm' : 'You\'re already sober, legend'}</span></div>
    ${bac > 0 ? '<div class="result-row"><span class="result-label">Sober By (approx)</span><span class="result-value">' + getSoberByTime(hoursToSober) + '</span></div>' : ''}
    <div style="text-align:center; margin-top: 1.25rem;">
      <p class="result-note" style="font-size: 1.1rem;">💧 <strong>Drink water.</strong> One glass per standard drink. Your future self will thank you.</p>
    </div>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
      <p class="result-note" style="margin: 0; color: #991b1b; font-size: 0.85rem;"><strong>⚠️ Disclaimer:</strong> This is for entertainment only. BAC depends on dozens of factors we can't measure here. <strong>Never use this to decide if you're safe to drive.</strong> If you've had any alcohol, don't drive. Full stop. The legal limit in Australia is 0.05% — and even under that, your reaction time is reduced. Get an Uber, call a mate, or sleep it off.</p>
    </div>
  `;
}

function getSoberByTime(hoursFromNow) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + hoursFromNow * 60);
  const h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  const displayH = h % 12 || 12;
  const displayM = m < 10 ? '0' + m : m;
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayLabel = now >= tomorrow ? ' tomorrow' : '';
  return displayH + ':' + displayM + ' ' + ampm + dayLabel;
}

function getTLDR() {
  const drinks = parseFloat(document.getElementById('input-drinks').value) || 0;
  const hours = parseFloat(document.getElementById('input-hours').value) || 0;
  const weight = parseFloat(document.getElementById('input-weight').value) || 0;
  const genderEl = document.querySelector('input[name="input-gender"]:checked');
  const foodEl = document.querySelector('input[name="input-food"]:checked');

  if (!drinks || !weight || !genderEl) return '';

  const gender = genderEl.value;
  const food = foodEl ? foodEl.value : 'no';
  const genderFactor = gender === 'male' ? 0.68 : 0.55;
  const foodMultiplier = food === 'yes' ? 0.6 : food === 'some' ? 0.8 : 1.0;
  const effectiveDrinks = drinks * foodMultiplier;
  let bac = (effectiveDrinks * 10) / (weight * genderFactor) - (0.015 * hours);
  bac = Math.max(0, bac);

  let tier;
  if (bac === 0) tier = 'Stone Cold Sober';
  else if (bac <= 0.03) tier = 'Loosened Up';
  else if (bac <= 0.06) tier = 'Nicely Buzzed';
  else if (bac <= 0.10) tier = 'Properly Pissed';
  else if (bac <= 0.15) tier = 'Absolutely Cooked';
  else if (bac <= 0.20) tier = 'Talking to the Bins';
  else tier = 'Call an Ambulance';

  const hoursToSober = bac > 0 ? (bac / 0.015) : 0;
  const soberH = Math.floor(hoursToSober);
  const soberM = Math.round((hoursToSober - soberH) * 60);

  return 'After ' + drinks + ' drinks over ' + hours + ' hours, estimated BAC is ' + bac.toFixed(3) + '% — verdict: ' + tier + '.' + (bac > 0 ? ' Roughly ' + soberH + 'h ' + soberM + 'm until sober.' : '') + ' (Entertainment only — never use this to decide if you can drive.)';
}
