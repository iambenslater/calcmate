function calculate() {
  const shape = document.getElementById('input-shape').value;
  const length = parseFloat(document.getElementById('input-length').value) || 0;
  const width = parseFloat(document.getElementById('input-width').value) || 0;
  const depth = parseFloat(document.getElementById('input-depth').value) || 0;

  // Convert mm depth to metres
  const depthM = depth / 1000;
  let volume = 0;
  let shapeDesc = '';

  if (shape === 'slab') {
    volume = length * width * depthM;
    shapeDesc = `Slab: ${length}m x ${width}m x ${depth}mm`;
  } else if (shape === 'column') {
    // width = diameter in mm for column
    const radiusM = (width / 1000) / 2;
    volume = Math.PI * radiusM * radiusM * length;
    shapeDesc = `Column: ${width}mm diameter x ${length}m height`;
  } else if (shape === 'footing') {
    volume = length * width * depthM;
    shapeDesc = `Footing: ${length}m x ${width}m x ${depth}mm`;
  }

  const wastePercent = 10;
  const volumeWithWaste = volume * (1 + wastePercent / 100);

  // 20kg premix bag covers approximately 0.009 m³
  const bagVolume = 0.009;
  const bags20kg = Math.ceil(volumeWithWaste / bagVolume);

  // Ready-mix concrete typically delivered in 0.2m³ increments
  const readyMixM3 = Math.ceil(volumeWithWaste * 5) / 5;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${shapeDesc}</p>
    <div class="result-row"><span class="result-label">Net Volume</span><span class="result-value">${volume.toFixed(3)} m&sup3;</span></div>
    <div class="result-row"><span class="result-label">Waste Allowance</span><span class="result-value">${wastePercent}%</span></div>
    <div class="result-row highlight"><span class="result-label">Total Volume (incl. waste)</span><span class="result-value">${volumeWithWaste.toFixed(3)} m&sup3;</span></div>
    <div class="result-row highlight"><span class="result-label">20kg Premix Bags</span><span class="result-value">${bags20kg.toLocaleString()} bags</span></div>
    <div class="result-row"><span class="result-label">Ready-Mix Order</span><span class="result-value">${readyMixM3.toFixed(1)} m&sup3;</span></div>
    <div class="result-row"><span class="result-label">Approx. Weight</span><span class="result-value">${(volumeWithWaste * 2400).toFixed(0).toLocaleString()} kg</span></div>
    <p class="result-note">Based on standard concrete density of 2,400 kg/m&sup3;. 20kg premix = ~0.009 m&sup3;. Always confirm with your supplier.</p>
  `;
}

function getTLDR() {
  var shape = document.getElementById('input-shape').value;
  var length = parseFloat(document.getElementById('input-length').value) || 0;
  var width = parseFloat(document.getElementById('input-width').value) || 0;
  var depth = parseFloat(document.getElementById('input-depth').value) || 0;
  var depthM = depth / 1000;
  var volume = 0;
  if (shape === 'slab' || shape === 'footing') { volume = length * width * depthM; }
  else if (shape === 'column') { var radiusM = (width / 1000) / 2; volume = Math.PI * radiusM * radiusM * length; }
  if (volume <= 0) return '';
  var volumeWithWaste = volume * 1.10;
  var bags20kg = Math.ceil(volumeWithWaste / 0.009);
  var readyMixM3 = Math.ceil(volumeWithWaste * 5) / 5;
  return 'Your ' + shape + ' requires ' + volumeWithWaste.toFixed(3) + ' m\u00b3 of concrete (including 10% waste) — that\'s ' + bags20kg.toLocaleString('en-AU') + ' x 20kg premix bags or a ' + readyMixM3.toFixed(1) + ' m\u00b3 ready-mix order.';
}
