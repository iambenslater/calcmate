function calculate() {
  const fenceLength = parseFloat(document.getElementById('input-totalLength').value) || 0;
  const fenceHeight = parseFloat(document.getElementById('input-fenceHeight').value) || 1.8;
  const postSpacing = parseFloat(document.getElementById('input-postSpacing').value) || 2.7;
  const material = document.getElementById('input-material').value;

  // Posts: length / spacing + 1
  const numPosts = Math.ceil(fenceLength / postSpacing) + 1;
  const postLength = fenceHeight + 0.6; // 600mm in ground

  // Rails
  const numRailRows = fenceHeight >= 1.8 ? 3 : 2;
  const totalRailMetres = numRailRows * fenceLength;

  let panelsOrPalings = 0;
  let unitName = '';
  let unitWidth = 0;

  if (material === 'timber') {
    // Standard paling: 150mm wide with 10mm gap
    unitWidth = 0.16; // 150mm paling + 10mm gap
    panelsOrPalings = Math.ceil(fenceLength / unitWidth);
    unitName = 'Palings (150mm)';
  } else {
    // Colorbond: standard panel = 2.38m wide to fit between posts at 2.4m spacing
    // Or sheets between rails
    unitWidth = postSpacing;
    panelsOrPalings = numPosts - 1; // panels between posts
    unitName = 'Colorbond Panels';
  }

  // Gate allowance
  const gateNote = 'Add gates separately: standard pedestrian gate ~1m, double gate ~3m';

  // Concrete for posts: 1 bag (20kg) per post for standard, 2 for corner/end
  const concreteBags = numPosts * 1.5;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${material === 'timber' ? 'Timber paling' : 'Colorbond'} fence: ${fenceLength}m long x ${fenceHeight}m high</p>
    <div class="result-row highlight"><span class="result-label">Posts</span><span class="result-value">${numPosts} @ ${postLength.toFixed(1)}m (${material === 'timber' ? '100x100mm treated pine' : '65x65mm steel'})</span></div>
    <div class="result-row"><span class="result-label">Post Spacing</span><span class="result-value">${postSpacing}m centres</span></div>
    <div class="result-row highlight"><span class="result-label">Rails</span><span class="result-value">${numRailRows} rows = ${totalRailMetres.toFixed(1)}m total</span></div>
    <div class="result-row highlight"><span class="result-label">${unitName}</span><span class="result-value">${panelsOrPalings.toLocaleString()}</span></div>
    <div class="result-row"><span class="result-label">Concrete (20kg bags)</span><span class="result-value">${Math.ceil(concreteBags)} bags</span></div>
    ${material === 'timber' ? `<div class="result-row"><span class="result-label">Nails/Screws</span><span class="result-value">~${(panelsOrPalings * numRailRows * 2).toLocaleString()} (2 per paling per rail)</span></div>` : ''}
    <div class="result-row"><span class="result-label">Post Caps</span><span class="result-value">${numPosts}</span></div>
    <p class="result-note">${gateNote}. Posts include 600mm depth in ground. Check local council regulations for fence height limits.</p>
  `;
}

function getTLDR() {
  const fenceLength = parseFloat(document.getElementById('input-totalLength').value) || 0;
  const fenceHeight = parseFloat(document.getElementById('input-fenceHeight').value) || 1.8;
  const postSpacing = parseFloat(document.getElementById('input-postSpacing').value) || 2.7;
  const material = document.getElementById('input-material').value;
  if (fenceLength <= 0) return '';
  const numPosts = Math.ceil(fenceLength / postSpacing) + 1;
  const numRailRows = fenceHeight >= 1.8 ? 3 : 2;
  const totalRailMetres = numRailRows * fenceLength;
  const panelsOrPalings = material === 'timber'
    ? Math.ceil(fenceLength / 0.16)
    : numPosts - 1;
  const unitName = material === 'timber' ? 'palings' : 'Colorbond panels';
  return 'For a ' + fenceLength + 'm ' + (material === 'timber' ? 'timber paling' : 'Colorbond') + ' fence you\'ll need ' + numPosts + ' posts, ' + totalRailMetres.toFixed(0) + 'm of rails, and ' + panelsOrPalings.toLocaleString() + ' ' + unitName + '.';
}
