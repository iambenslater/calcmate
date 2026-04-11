function calculate() {
  const roofArea = parseFloat(document.getElementById('input-roofArea').value) || 0;
  const pitch = document.getElementById('input-pitch').value;
  const material = document.getElementById('input-material').value;
  const costPerUnit = parseFloat(document.getElementById('input-costPerUnit').value) || 0;
  const wasteFactor = parseFloat(document.getElementById('input-wasteFactor').value) || 5;

  const pitchDeg = parseFloat(pitch) || 22.5;
  const roofLength = Math.sqrt(roofArea); // approximate square root for display
  const roofWidth = roofLength;

  const pitchRad = pitch * Math.PI / 180;
  const pitchFactor = 1 / Math.cos(pitchRad);

  // Roof area adjusted for pitch (assumes gable roof, 2 sides)
  const flatArea = roofLength * roofWidth;
  const actualArea = flatArea * pitchFactor;

  let sheetsNeeded = 0;
  let materialInfo = '';
  let ridgeCapping = roofLength;
  let coveragePerUnit = 0;

  if (material === 'colorbond') {
    // Standard Colorbond sheet: effective cover width 762mm, custom length
    const sheetWidth = 0.762;
    const rakeLength = (roofWidth / 2) / Math.cos(pitchRad);
    const sheetsPerSide = Math.ceil(roofLength / sheetWidth);
    sheetsNeeded = sheetsPerSide * 2;
    coveragePerUnit = sheetWidth * rakeLength;
    materialInfo = `Colorbond corrugated sheets (762mm cover), rake length ${rakeLength.toFixed(2)}m`;
  } else {
    // Concrete/terracotta tiles: ~9.5 tiles per m²
    const tilesPerSqm = 9.5;
    sheetsNeeded = Math.ceil(actualArea * tilesPerSqm);
    coveragePerUnit = 1 / tilesPerSqm;
    materialInfo = `Roof tiles (~9.5 tiles per m&sup2;)`;
  }

  // Add 5% waste
  const wasteUnits = Math.ceil(sheetsNeeded * 0.05);
  const totalUnits = sheetsNeeded + wasteUnits;

  // Screws: ~7 per m² for colorbond, n/a for tiles
  const screws = material === 'colorbond' ? Math.ceil(actualArea * 7) : 0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${materialInfo}</p>
    <div class="result-row"><span class="result-label">Flat Roof Area</span><span class="result-value">${flatArea.toFixed(1)} m&sup2;</span></div>
    <div class="result-row"><span class="result-label">Pitch</span><span class="result-value">${pitch}&deg; (factor: ${pitchFactor.toFixed(3)})</span></div>
    <div class="result-row highlight"><span class="result-label">Actual Roof Area</span><span class="result-value">${actualArea.toFixed(1)} m&sup2;</span></div>
    <div class="result-row highlight"><span class="result-label">${material === 'colorbond' ? 'Sheets' : 'Tiles'} Needed</span><span class="result-value">${sheetsNeeded.toLocaleString()}</span></div>
    <div class="result-row"><span class="result-label">Waste (5%)</span><span class="result-value">+${wasteUnits}</span></div>
    <div class="result-row highlight"><span class="result-label">Total to Order</span><span class="result-value">${totalUnits.toLocaleString()}</span></div>
    <div class="result-row"><span class="result-label">Ridge Capping</span><span class="result-value">${ridgeCapping.toFixed(1)}m</span></div>
    ${screws ? `<div class="result-row"><span class="result-label">Roofing Screws</span><span class="result-value">~${screws.toLocaleString()}</span></div>` : ''}
    <p class="result-note">Assumes gable roof with two equal sides. Always confirm quantities with your supplier. Prices vary by region and profile.</p>
  `;
}
