function calculate() {
  const name1 = (document.getElementById('input-name1').value || '').trim().toLowerCase();
  const name2 = (document.getElementById('input-name2').value || '').trim().toLowerCase();

  if (!name1 || !name2) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = `<p class="result-note">Enter both names to calculate your love score!</p>`;
    return;
  }

  // Deterministic hash from both names (order-independent so A+B = B+A)
  const combined = [name1, name2].sort().join('');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Map to 1-100
  const score = Math.abs(hash % 100) + 1;

  // Fun messages based on score
  let message = '';
  let emoji = '';
  if (score >= 90) { message = 'A match made in heaven! You two are absolutely perfect together.'; emoji = '&#10084;&#65039;&#10084;&#65039;&#10084;&#65039;'; }
  else if (score >= 75) { message = 'Strong connection! The stars are definitely aligned for you two.'; emoji = '&#10084;&#65039;&#10084;&#65039;'; }
  else if (score >= 60) { message = 'Looking good! There is real potential here.'; emoji = '&#10084;&#65039;'; }
  else if (score >= 40) { message = 'Could go either way! Maybe give it a chance and see what happens.'; emoji = '&#128156;'; }
  else if (score >= 25) { message = 'Opposites attract... right? You might need to work at this one.'; emoji = '&#128148;'; }
  else { message = 'The universe might have other plans for you two. But who knows!'; emoji = '&#128517;'; }

  // Generate "compatibility breakdown" for fun
  const traits = ['Communication', 'Trust', 'Humour', 'Adventure', 'Romance'];
  const traitScores = traits.map((t, i) => {
    const s = Math.abs((hash * (i + 7)) % 100) + 1;
    return { name: t, score: s };
  });

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row highlight"><span class="result-label">Love Score</span><span class="result-value" style="font-size: 1.5rem">${score}% ${emoji}</span></div>
    <p class="result-note" style="text-align:center; font-size: 1.1rem;">${capitalise(name1)} &amp; ${capitalise(name2)}</p>
    <p class="result-note" style="text-align:center;">${message}</p>
    <hr style="border-color: var(--border-light); margin: 1rem 0;">
    <p class="result-note"><strong>Compatibility Breakdown:</strong></p>
    ${traitScores.map(t => `
      <div class="result-row">
        <span class="result-label">${t.name}</span>
        <span class="result-value">${t.score}%</span>
      </div>
    `).join('')}
    <p class="result-note" style="margin-top: 1rem; font-style: italic;">This is purely for entertainment and has absolutely no scientific basis whatsoever. Go talk to them instead of using a calculator.</p>
  `;
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
