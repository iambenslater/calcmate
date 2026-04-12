function calculate() {
  const name1 = (document.getElementById('input-name1').value || '').trim();
  const name2 = (document.getElementById('input-name2').value || '').trim();

  if (!name1 || !name2) {
    const results = document.getElementById('calc-results');
    const content = document.getElementById('results-content');
    results.classList.remove('hidden');
    content.innerHTML = '<p class="text-red-600">Please enter both names.</p>';
    return;
  }

  const combined = (name1 + name2).toLowerCase().replace(/[^a-z]/g, '');
  let hash = 7;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) & 0xFFFFFF;
  }
  // Different seed from love calculator — use MATES BEST
  const words = 'matesbest';
  let bonus = 0;
  for (let i = 0; i < combined.length; i++) {
    if (words.includes(combined[i])) bonus += 3;
  }
  const score = ((hash + bonus) % 98) + 1;

  let emoji, verdict, desc;
  if (score >= 90) { emoji = '🏆'; verdict = 'Absolute Legends'; desc = 'You two are the kind of mates people write songs about. Ride or die.'; }
  else if (score >= 75) { emoji = '🤝'; verdict = 'Solid Mates'; desc = 'A proper friendship. You\'d help each other move house — and that\'s the ultimate test.'; }
  else if (score >= 60) { emoji = '😊'; verdict = 'Good Friends'; desc = 'You get along well. Could definitely grab a beer or coffee together any day.'; }
  else if (score >= 40) { emoji = '🙂'; verdict = 'Casual Friends'; desc = 'You\'re friendly enough, but maybe don\'t share your Netflix password just yet.'; }
  else if (score >= 20) { emoji = '😐'; verdict = 'Acquaintances'; desc = 'You know each other\'s names, and that\'s... something. Room to grow!'; }
  else { emoji = '🥶'; verdict = 'Strangers Energy'; desc = 'Awkward silence at a party level. But hey, every great friendship starts somewhere.'; }

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-navy/5 rounded-xl p-6 mb-4 text-center">
      <p class="text-4xl mb-2">${emoji}</p>
      <p class="text-sm text-gray-500 mb-1">${name1} & ${name2}</p>
      <p class="text-5xl font-bold text-navy">${score}%</p>
      <p class="text-lg font-semibold text-gold mt-2">${verdict}</p>
      <p class="text-sm text-gray-600 mt-2">${desc}</p>
    </div>
    <p class="text-xs text-gray-400 text-center">For entertainment purposes only. Real friendship is built on trust, shared experiences, and showing up when it matters.</p>
  `;
}
