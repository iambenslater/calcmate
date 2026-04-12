function calculate() {
  const a = parseFloat(document.getElementById('input-a').value) || 0;
  const b = parseFloat(document.getElementById('input-b').value) || 0;
  const c = parseFloat(document.getElementById('input-c').value) || 0;

  if (a === 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = `<p class="result-note">Coefficient 'a' cannot be zero for a quadratic equation. This would be a linear equation: x = ${b !== 0 ? fmt(-c / b) : 'undefined'}</p>`;
    return;
  }

  const discriminant = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;

  let rootsHtml = '';
  if (discriminant > 0) {
    const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    rootsHtml = `
      <div class="result-row"><span class="result-label">Root Type</span><span class="result-value">Two real roots</span></div>
      <div class="result-row highlight"><span class="result-label">x₁</span><span class="result-value">${fmt(r1)}</span></div>
      <div class="result-row highlight"><span class="result-label">x₂</span><span class="result-value">${fmt(r2)}</span></div>
    `;
  } else if (discriminant === 0) {
    const r = -b / (2 * a);
    rootsHtml = `
      <div class="result-row"><span class="result-label">Root Type</span><span class="result-value">One repeated real root</span></div>
      <div class="result-row highlight"><span class="result-label">x</span><span class="result-value">${fmt(r)}</span></div>
    `;
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(Math.abs(discriminant)) / (2 * a);
    rootsHtml = `
      <div class="result-row"><span class="result-label">Root Type</span><span class="result-value">Two complex roots</span></div>
      <div class="result-row highlight"><span class="result-label">x₁</span><span class="result-value">${fmt(realPart)} + ${fmt(Math.abs(imagPart))}i</span></div>
      <div class="result-row highlight"><span class="result-label">x₂</span><span class="result-value">${fmt(realPart)} - ${fmt(Math.abs(imagPart))}i</span></div>
    `;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">Equation: ${a}x² + ${b}x + ${c} = 0</p>
    <div class="result-row"><span class="result-label">Discriminant (b²-4ac)</span><span class="result-value">${fmt(discriminant)}</span></div>
    ${rootsHtml}
    <div class="result-row"><span class="result-label">Vertex (x)</span><span class="result-value">${fmt(vertexX)}</span></div>
    <div class="result-row"><span class="result-label">Vertex (y)</span><span class="result-value">${fmt(vertexY)}</span></div>
    <div class="result-row"><span class="result-label">Axis of Symmetry</span><span class="result-value">x = ${fmt(vertexX)}</span></div>
    <div class="result-row"><span class="result-label">Opens</span><span class="result-value">${a > 0 ? 'Upward (minimum)' : 'Downward (maximum)'}</span></div>
  `;
}

function fmt(n) {
  return parseFloat(n.toFixed(6)).toString();
}

function getTLDR() {
  const a = parseFloat(document.getElementById('input-a').value) || 0;
  const b = parseFloat(document.getElementById('input-b').value) || 0;
  const c = parseFloat(document.getElementById('input-c').value) || 0;

  if (a === 0) return '';

  const discriminant = b * b - 4 * a * c;

  if (discriminant > 0) {
    const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    return 'The equation ' + a + 'x\u00B2 + ' + b + 'x + ' + c + ' = 0 has two real roots: x\u2081 = ' + fmt(r1) + ' and x\u2082 = ' + fmt(r2) + '.';
  } else if (discriminant === 0) {
    const r = -b / (2 * a);
    return 'The equation ' + a + 'x\u00B2 + ' + b + 'x + ' + c + ' = 0 has one repeated root: x = ' + fmt(r) + '.';
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(Math.abs(discriminant)) / (2 * a);
    return 'The equation ' + a + 'x\u00B2 + ' + b + 'x + ' + c + ' = 0 has two complex roots: ' + fmt(realPart) + ' \u00B1 ' + fmt(Math.abs(imagPart)) + 'i (no real solutions).';
  }
}
