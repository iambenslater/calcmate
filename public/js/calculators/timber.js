function calculate() {
  const projectType = document.getElementById('input-projectType').value;
  const wallLength = parseFloat(document.getElementById('input-totalLength').value) || 0;
  const wallHeight = parseFloat(document.getElementById('input-height').value) || 0;
  const studSpacing = parseInt(document.getElementById('input-spacing').value) || 600;
  const wasteFactor = parseFloat(document.getElementById('input-wasteFactor').value) || 10;
  const pricePerMetre = parseFloat(document.getElementById('input-pricePerMetre').value) || 0;

  const spacingM = studSpacing / 1000;

  // Number of studs = wall length / spacing + 1 (rounded up)
  const numStuds = Math.ceil(wallLength / spacingM) + 1;

  // Top plate and bottom plate (2 lengths each for double top plate)
  const topPlates = 2; // double top plate
  const bottomPlates = 1;
  const plateLength = wallLength;
  const totalPlateMetres = (topPlates + bottomPlates) * plateLength;

  // Nogging rows: 1 row for walls under 2.7m, 2 rows for taller
  const noggingRows = wallHeight <= 2.7 ? 1 : 2;
  const noggingsPerRow = numStuds - 1;
  const noggingLength = spacingM; // each nogging spans between studs
  const totalNoggingMetres = noggingRows * noggingsPerRow * noggingLength;

  // Standard stud size: 90x45mm pine
  const studLength = wallHeight;
  const totalStudMetres = numStuds * studLength;
  const totalTimberMetres = totalStudMetres + totalPlateMetres + totalNoggingMetres;

  // Standard lengths: 2.4m, 2.7m, 3.0m, 3.6m, 4.2m, 4.8m, 5.4m, 6.0m
  const bestStudLength = [2.4, 2.7, 3.0, 3.6, 4.2, 4.8, 5.4, 6.0].find(l => l >= wallHeight) || 6.0;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">Wall: ${wallLength}m long x ${wallHeight}m high, studs at ${studSpacing}mm centres</p>
    <div class="result-row highlight"><span class="result-label">Studs (90x45mm)</span><span class="result-value">${numStuds} @ ${bestStudLength}m lengths</span></div>
    <div class="result-row"><span class="result-label">Bottom Plate</span><span class="result-value">${bottomPlates} x ${plateLength.toFixed(1)}m = ${(bottomPlates * plateLength).toFixed(1)}m</span></div>
    <div class="result-row"><span class="result-label">Top Plates (double)</span><span class="result-value">${topPlates} x ${plateLength.toFixed(1)}m = ${(topPlates * plateLength).toFixed(1)}m</span></div>
    <div class="result-row"><span class="result-label">Nogging Rows</span><span class="result-value">${noggingRows}</span></div>
    <div class="result-row"><span class="result-label">Noggings per Row</span><span class="result-value">${noggingsPerRow}</span></div>
    <div class="result-row"><span class="result-label">Total Nogging</span><span class="result-value">${totalNoggingMetres.toFixed(1)}m</span></div>
    <div class="result-row highlight"><span class="result-label">Total Stud Metres</span><span class="result-value">${totalStudMetres.toFixed(1)}m</span></div>
    <div class="result-row highlight"><span class="result-label">Total Plate Metres</span><span class="result-value">${totalPlateMetres.toFixed(1)}m</span></div>
    <div class="result-row highlight"><span class="result-label">Grand Total Timber</span><span class="result-value">${totalTimberMetres.toFixed(1)}m</span></div>
    <p class="result-note">Assumes 90x45mm framing pine. Double top plate, single bottom plate. Add extra for corners, trimmers, and jack studs around openings.</p>
  `;
}

function getTLDR() {
  const wallLength = parseFloat(document.getElementById('input-totalLength').value) || 0;
  const wallHeight = parseFloat(document.getElementById('input-height').value) || 0;
  const studSpacing = parseInt(document.getElementById('input-spacing').value) || 600;
  const pricePerMetre = parseFloat(document.getElementById('input-pricePerMetre').value) || 0;
  if (wallLength <= 0 || wallHeight <= 0) return '';

  const spacingM = studSpacing / 1000;
  const numStuds = Math.ceil(wallLength / spacingM) + 1;
  const totalPlateMetres = 3 * wallLength;
  const noggingRows = wallHeight <= 2.7 ? 1 : 2;
  const noggingsPerRow = numStuds - 1;
  const totalNoggingMetres = noggingRows * noggingsPerRow * spacingM;
  const totalStudMetres = numStuds * wallHeight;
  const totalTimberMetres = totalStudMetres + totalPlateMetres + totalNoggingMetres;

  const costNote = pricePerMetre > 0 ? ', costing about $' + (totalTimberMetres * pricePerMetre).toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '';
  return 'For a ' + wallLength + 'm x ' + wallHeight + 'm wall at ' + studSpacing + 'mm centres, you\'ll need ' + numStuds + ' studs and ' + totalTimberMetres.toFixed(1) + 'm of timber in total' + costNote + '.';
}
