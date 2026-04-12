function calculate() {
  const roomLength = parseFloat(document.getElementById('input-roomLength').value) || 0;
  const roomWidth = parseFloat(document.getElementById('input-roomWidth').value) || 0;
  const roomHeight = parseFloat(document.getElementById('input-wallHeight').value) || 0;
  const numCoats = parseInt(document.getElementById('input-coats').value) || 2;
  const numDoors = parseInt(document.getElementById('input-doors').value) || 0;
  const numWindows = parseInt(document.getElementById('input-windows').value) || 0;
  const includeCeiling = document.getElementById('input-includeCeiling').value !== 'no';
  const coverageRate = parseFloat(document.getElementById('input-coverageRate').value) || 12;
  const costPerLitre = parseFloat(document.getElementById('input-costPerLitre').value) || 0;

  const doorArea = 1.9 * 0.82; // standard AU door
  const windowArea = 1.2 * 1.0; // standard AU window

  const wallArea = 2 * (roomLength + roomWidth) * roomHeight;
  const ceilingArea = roomLength * roomWidth;
  const deductions = (numDoors * doorArea) + (numWindows * windowArea);
  const netWallArea = Math.max(0, wallArea - deductions);
  const totalArea = netWallArea + (includeCeiling ? ceilingArea : 0);

  const coveragePerLitre = coverageRate; // m² per litre
  const wallLitres = (netWallArea * numCoats) / coveragePerLitre;
  const ceilingLitres = includeCeiling ? (ceilingArea * numCoats) / coveragePerLitre : 0;
  const totalLitres = wallLitres + ceilingLitres;

  // Standard tin sizes in AU: 1L, 2L, 4L, 10L, 15L
  const tins = getBestTins(totalLitres);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Gross Wall Area</span><span class="result-value">${wallArea.toFixed(1)} m&sup2;</span></div>
    <div class="result-row"><span class="result-label">Door Deductions (${numDoors})</span><span class="result-value">-${(numDoors * doorArea).toFixed(1)} m&sup2;</span></div>
    <div class="result-row"><span class="result-label">Window Deductions (${numWindows})</span><span class="result-value">-${(numWindows * windowArea).toFixed(1)} m&sup2;</span></div>
    <div class="result-row"><span class="result-label">Net Wall Area</span><span class="result-value">${netWallArea.toFixed(1)} m&sup2;</span></div>
    <div class="result-row"><span class="result-label">Ceiling Area</span><span class="result-value">${ceilingArea.toFixed(1)} m&sup2;</span></div>
    <div class="result-row"><span class="result-label">Total Paintable Area</span><span class="result-value">${totalArea.toFixed(1)} m&sup2;</span></div>
    <div class="result-row"><span class="result-label">Coats</span><span class="result-value">${numCoats}</span></div>
    <div class="result-row highlight"><span class="result-label">Walls Paint Needed</span><span class="result-value">${wallLitres.toFixed(1)} L</span></div>
    <div class="result-row highlight"><span class="result-label">Ceiling Paint Needed</span><span class="result-value">${ceilingLitres.toFixed(1)} L</span></div>
    <div class="result-row highlight"><span class="result-label">Total Paint</span><span class="result-value">${totalLitres.toFixed(1)} L</span></div>
    <div class="result-row"><span class="result-label">Suggested Purchase</span><span class="result-value">${tins}</span></div>
    <p class="result-note">Based on ~12 m&sup2; coverage per litre. Actual coverage varies by paint type and surface. Standard door: 1.9m x 0.82m. Standard window: 1.2m x 1.0m.</p>
  `;
}

function getBestTins(litres) {
  const sizes = [15, 10, 4, 2, 1];
  let remaining = Math.ceil(litres);
  const result = [];
  for (const s of sizes) {
    if (remaining >= s) {
      const count = Math.floor(remaining / s);
      result.push(`${count} x ${s}L`);
      remaining -= count * s;
    }
  }
  if (remaining > 0) result.push(`1 x 1L`);
  return result.join(' + ') || '0L';
}

function getTLDR() {
  const roomLength = parseFloat(document.getElementById('input-roomLength').value) || 0;
  const roomWidth = parseFloat(document.getElementById('input-roomWidth').value) || 0;
  const roomHeight = parseFloat(document.getElementById('input-wallHeight').value) || 0;
  if (roomLength <= 0 || roomWidth <= 0 || roomHeight <= 0) return '';
  const numCoats = parseInt(document.getElementById('input-coats').value) || 2;
  const numDoors = parseInt(document.getElementById('input-doors').value) || 0;
  const numWindows = parseInt(document.getElementById('input-windows').value) || 0;
  const includeCeiling = document.getElementById('input-includeCeiling').value !== 'no';
  const coverageRate = parseFloat(document.getElementById('input-coverageRate').value) || 12;
  const wallArea = 2 * (roomLength + roomWidth) * roomHeight;
  const deductions = (numDoors * 1.9 * 0.82) + (numWindows * 1.2 * 1.0);
  const netWallArea = Math.max(0, wallArea - deductions);
  const ceilingArea = roomLength * roomWidth;
  const totalArea = netWallArea + (includeCeiling ? ceilingArea : 0);
  const totalLitres = (netWallArea * numCoats + (includeCeiling ? ceilingArea * numCoats : 0)) / coverageRate;
  const tins = getBestTins(totalLitres);
  return 'Your ' + roomLength + 'm x ' + roomWidth + 'm room needs ' + totalLitres.toFixed(1) + 'L of paint for ' + numCoats + ' coat' + (numCoats !== 1 ? 's' : '') + ' across ' + totalArea.toFixed(1) + 'm\u00b2 — buy ' + tins + '.';
}
