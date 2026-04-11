function calculate() {
  const pA = parseFloat(document.getElementById('input-probA').value) || 0;
  const pB = parseFloat(document.getElementById('input-probB').value) || 0;
  const relationship = document.getElementById('input-relationship').value || 'independent';
  const probBgivenA = parseFloat(document.getElementById('input-probBgivenA').value) || 0;

  const pADec = pA / 100;
  const pBDec = pB / 100;

  // P(A and B)
  const pAnd = relationship === 'independent' ? pADec * pBDec : Math.min(pADec, pBDec);
  // P(A or B)
  const pOr = pADec + pBDec - pAnd;
  // P(not A)
  const pNotA = 1 - pADec;
  // P(not B)
  const pNotB = 1 - pBDec;
  // P(neither)
  const pNeither = 1 - pOr;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${relationship === 'independent' ? 'Events are independent: P(A and B) = P(A) x P(B)' : 'Events are dependent: assuming maximum overlap'}</p>
    <div class="result-row"><span class="result-label">P(A)</span><span class="result-value">${pct(pADec)}</span></div>
    <div class="result-row"><span class="result-label">P(B)</span><span class="result-value">${pct(pBDec)}</span></div>
    <div class="result-row highlight"><span class="result-label">P(A and B)</span><span class="result-value">${pct(pAnd)}</span></div>
    <div class="result-row highlight"><span class="result-label">P(A or B)</span><span class="result-value">${pct(pOr)}</span></div>
    <div class="result-row"><span class="result-label">P(not A)</span><span class="result-value">${pct(pNotA)}</span></div>
    <div class="result-row"><span class="result-label">P(not B)</span><span class="result-value">${pct(pNotB)}</span></div>
    <div class="result-row"><span class="result-label">P(neither A nor B)</span><span class="result-value">${pct(pNeither)}</span></div>
  `;
}

function pct(n) {
  return (n * 100).toFixed(2) + '%';
}
