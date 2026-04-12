function calculate() {
  const deckLength = parseFloat(document.getElementById('input-deckLength').value) || 0;
  const deckWidth = parseFloat(document.getElementById('input-deckWidth').value) || 0;
  const boardWidth = parseInt(document.getElementById('input-boardWidth').value) || 90;
  const joistSpacing = parseInt(document.getElementById('input-joistSpacing').value) || 450;

  const area = deckLength * deckWidth;

  // Decking boards: run across the width, spaced by board width + 5mm gap
  const boardWidthM = (boardWidth + 5) / 1000; // board width + gap in metres
  const numBoards = Math.ceil(deckLength / boardWidthM);
  const boardLength = deckWidth;
  const totalBoardMetres = numBoards * boardLength;

  // Joists: run along the length, spaced at intervals across the width
  const joistSpacingM = joistSpacing / 1000;
  const numJoists = Math.ceil(deckWidth / joistSpacingM) + 1;
  const joistLength = deckLength;
  const totalJoistMetres = numJoists * joistLength;

  // Bearers: run across the width, spaced at 1.8m along the length
  const bearerSpacing = 1.8;
  const numBearers = Math.ceil(deckLength / bearerSpacing) + 1;
  const bearerLength = deckWidth;
  const totalBearerMetres = numBearers * bearerLength;

  // Posts: one per bearer-joist intersection at edges (every 1.8m along each bearer end + middle)
  const postsPerBearer = Math.ceil(deckWidth / 1.8) + 1;
  const numPosts = numBearers * postsPerBearer;

  // Screws: 2 per board per joist crossing
  const screws = numBoards * numJoists * 2;

  // Add 10% waste for boards
  const boardsWithWaste = Math.ceil(numBoards * 1.1);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">Deck: ${deckLength}m x ${deckWidth}m = ${area.toFixed(1)} m&sup2;</p>
    <div class="result-row highlight"><span class="result-label">Decking Boards (${boardWidth}mm)</span><span class="result-value">${boardsWithWaste} boards @ ${boardLength.toFixed(1)}m (incl. 10% waste)</span></div>
    <div class="result-row"><span class="result-label">Total Board Metres</span><span class="result-value">${(boardsWithWaste * boardLength).toFixed(1)}m</span></div>
    <div class="result-row highlight"><span class="result-label">Joists (${joistSpacing}mm centres)</span><span class="result-value">${numJoists} @ ${joistLength.toFixed(1)}m</span></div>
    <div class="result-row"><span class="result-label">Total Joist Metres</span><span class="result-value">${totalJoistMetres.toFixed(1)}m</span></div>
    <div class="result-row highlight"><span class="result-label">Bearers (1.8m centres)</span><span class="result-value">${numBearers} @ ${bearerLength.toFixed(1)}m</span></div>
    <div class="result-row"><span class="result-label">Total Bearer Metres</span><span class="result-value">${totalBearerMetres.toFixed(1)}m</span></div>
    <div class="result-row"><span class="result-label">Posts (approx.)</span><span class="result-value">${numPosts}</span></div>
    <div class="result-row"><span class="result-label">Decking Screws</span><span class="result-value">~${screws.toLocaleString()}</span></div>
    <p class="result-note">Joists typically 90x45mm or 140x45mm treated pine/hardwood. Bearers typically 140x90mm or 190x90mm. Posts typically 90x90mm or 100x100mm. Check local building codes for structural requirements.</p>
  `;
}

function getTLDR() {
  const deckLength = parseFloat(document.getElementById('input-deckLength').value) || 0;
  const deckWidth = parseFloat(document.getElementById('input-deckWidth').value) || 0;
  const boardWidth = parseInt(document.getElementById('input-boardWidth').value) || 90;
  const joistSpacing = parseInt(document.getElementById('input-joistSpacing').value) || 450;
  if (deckLength <= 0 || deckWidth <= 0) return '';
  const area = deckLength * deckWidth;
  const boardWidthM = (boardWidth + 5) / 1000;
  const numBoards = Math.ceil(deckLength / boardWidthM);
  const boardsWithWaste = Math.ceil(numBoards * 1.1);
  const numJoists = Math.ceil(deckWidth / (joistSpacing / 1000)) + 1;
  const numBearers = Math.ceil(deckLength / 1.8) + 1;
  return 'For a ' + deckLength + 'm x ' + deckWidth + 'm deck (' + area.toFixed(1) + ' m²) you\'ll need roughly ' + boardsWithWaste + ' decking boards, ' + numJoists + ' joists, and ' + numBearers + ' bearers (includes 10% waste on boards).';
}
