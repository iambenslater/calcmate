/**
 * CalcMate Tier 2 Math Verification Tests — Calculators 76-100
 *
 * Uses jsdom to run each calculator's JS in isolation, set specific input
 * values, call calculate(), and assert that expected results appear in
 * results-content innerHTML.
 *
 * Run: node tests/tier2-math-76-100.js
 */

'use strict';

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const CALC_DIR = path.join(__dirname, '..', 'public', 'js', 'calculators');

let passed = 0;
let failed = 0;
const errors = [];

function assert(label, condition, detail = '') {
  if (!condition) {
    const msg = detail ? `${label}: ${detail}` : label;
    throw new Error(msg);
  }
}

function assertContains(html, needle, label) {
  if (!html.includes(needle)) {
    throw new Error(`${label} — expected "${needle}" in results`);
  }
}

/**
 * Build a minimal jsdom with the required input IDs pre-populated.
 * inputs: [ { id, value, type } ]   type defaults to 'text'
 * radios: [ { name, value } ]        radio group where the given value is checked
 * checkboxes: [ { id, checked } ]
 * Returns { window, document, run } where run() calls calculate() in the dom context.
 */
function buildDOM(calcSlug, inputs = [], radios = [], checkboxes = []) {
  const jsSource = fs.readFileSync(path.join(CALC_DIR, `${calcSlug}.js`), 'utf8');

  // Build input HTML
  const inputHtml = inputs.map(({ id, value, type = 'text' }) =>
    `<input id="${id}" type="${type}" value="${value}">`
  ).join('\n');

  // Build radio HTML
  const radioHtml = radios.map(({ name, value, allValues }) => {
    const vals = allValues || [value];
    return vals.map(v =>
      `<input type="radio" name="${name}" value="${v}"${v === value ? ' checked' : ''}>`
    ).join('\n');
  }).join('\n');

  // Build checkbox HTML
  const checkHtml = checkboxes.map(({ id, checked }) =>
    `<input id="${id}" type="checkbox"${checked ? ' checked' : ''}>`
  ).join('\n');

  const html = `<!DOCTYPE html>
<html><body>
<div id="calc-inputs">
${inputHtml}
${radioHtml}
${checkHtml}
</div>
<div id="calc-results" class="hidden"></div>
<div id="results-content"></div>
<script>${jsSource}</script>
</body></html>`;

  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  return dom.window;
}

function buildSelectDOM(calcSlug, inputs = [], selects = [], radios = [], checkboxes = []) {
  const jsSource = fs.readFileSync(path.join(CALC_DIR, `${calcSlug}.js`), 'utf8');

  const inputHtml = inputs.map(({ id, value }) =>
    `<input id="${id}" type="text" value="${value}">`
  ).join('\n');

  const selectHtml = selects.map(({ id, value, options }) => {
    const opts = (options || [value]).map(o =>
      `<option value="${o}"${o === value ? ' selected' : ''}>${o}</option>`
    ).join('');
    return `<select id="${id}">${opts}</select>`;
  }).join('\n');

  const radioHtml = radios.map(({ name, value, allValues }) => {
    const vals = allValues || [value];
    return vals.map(v =>
      `<input type="radio" name="${name}" value="${v}"${v === value ? ' checked' : ''}>`
    ).join('\n');
  }).join('\n');

  const checkHtml = checkboxes.map(({ id, checked }) =>
    `<input id="${id}" type="checkbox"${checked ? ' checked' : ''}>`
  ).join('\n');

  const html = `<!DOCTYPE html>
<html><body>
<div id="calc-inputs">
${inputHtml}
${selectHtml}
${radioHtml}
${checkHtml}
</div>
<div id="calc-results" class="hidden"></div>
<div id="results-content"></div>
<script>${jsSource}</script>
</body></html>`;

  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  return dom.window;
}

function runTest(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
    failed++;
    errors.push({ name, error: err.message });
  }
}

console.log('\nCalcMate Tier 2 Math Tests — Calculators 76-100\n');

// ─────────────────────────────────────────────────────────────────────────────
// 76. probability
// Test: P(A)=60%, P(B)=40%, independent
// P(A and B) = 0.6 * 0.4 = 0.24 → 24.00%
// P(A or B) = 0.6 + 0.4 - 0.24 = 0.76 → 76.00%
// P(not A) = 0.4 → 40.00%
// ─────────────────────────────────────────────────────────────────────────────
runTest('76. probability — independent events', () => {
  const win = buildSelectDOM('probability',
    [
      { id: 'input-probA', value: '60' },
      { id: 'input-probB', value: '40' },
      { id: 'input-probBgivenA', value: '0' },
    ],
    [
      { id: 'input-relationship', value: 'independent', options: ['independent', 'dependent'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '24.00%', 'P(A and B)');
  assertContains(html, '76.00%', 'P(A or B)');
  assertContains(html, '40.00%', 'P(not A)');
});

// ─────────────────────────────────────────────────────────────────────────────
// 77. scientific-notation
// Test: 12345
// exp = floor(log10(12345)) = floor(4.0915) = 4
// coeff = 12345 / 10^4 = 1.2345
// Output: "1.2345 × 10⁴" (rendered from &times; and <sup>4</sup>)
// E notation: 1.234500e+4 → cleaned to "1.2345e+4"
// ─────────────────────────────────────────────────────────────────────────────
runTest('77. scientific-notation — 12345', () => {
  const win = buildSelectDOM('scientific-notation',
    [{ id: 'input-number', value: '12345' }]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  // coeff shown as "1.2345", exponent as 4 in <sup>
  assertContains(html, '1.2345', 'coefficient');
  assertContains(html, '<sup>4</sup>', 'exponent 4');
  assertContains(html, '12,345', 'standard form');
});

// ─────────────────────────────────────────────────────────────────────────────
// 78. quadratic-equation
// Test: a=1, b=-5, c=6
// discriminant = (-5)^2 - 4*1*6 = 25 - 24 = 1
// r1 = (5 + 1) / 2 = 3
// r2 = (5 - 1) / 2 = 2
// ─────────────────────────────────────────────────────────────────────────────
runTest('78. quadratic-equation — a=1 b=-5 c=6 → roots 2 and 3', () => {
  const win = buildSelectDOM('quadratic-equation',
    [
      { id: 'input-a', value: '1' },
      { id: 'input-b', value: '-5' },
      { id: 'input-c', value: '6' },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, 'Two real roots', 'root type');
  assertContains(html, '>3<', 'root x1=3');
  assertContains(html, '>2<', 'root x2=2');
  assertContains(html, 'Discriminant', 'discriminant label');
});

// ─────────────────────────────────────────────────────────────────────────────
// 79. concrete
// Test: slab, 5m × 3m × 100mm depth
// volume = 5 * 3 * (100/1000) = 1.5 m³
// with 10% waste = 1.5 * 1.1 = 1.65 m³ → "1.650 m³"
// ─────────────────────────────────────────────────────────────────────────────
runTest('79. concrete — slab 5m x 3m x 100mm → 1.5m³ + 10% = 1.65m³', () => {
  const win = buildSelectDOM('concrete',
    [
      { id: 'input-length', value: '5' },
      { id: 'input-width', value: '3' },
      { id: 'input-depth', value: '100' },
    ],
    [
      { id: 'input-shape', value: 'slab', options: ['slab', 'column', 'footing'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '1.500', 'net volume 1.500 m³');
  assertContains(html, '1.650', 'total with waste 1.650 m³');
  assertContains(html, '10%', 'waste allowance');
});

// ─────────────────────────────────────────────────────────────────────────────
// 80. paint
// Test: 4m × 3m room, 2.4m walls, 2 coats, 0 doors, 0 windows, no ceiling, 12 m²/L
// wallArea = 2 * (4+3) * 2.4 = 33.6 m²
// netWallArea = 33.6 m² (no deductions)
// wallLitres = 33.6 * 2 / 12 = 5.6L
// ─────────────────────────────────────────────────────────────────────────────
runTest('80. paint — 4mx3m room, 2.4m walls, 2 coats, no ceiling → 5.6L', () => {
  const win = buildSelectDOM('paint',
    [
      { id: 'input-roomLength', value: '4' },
      { id: 'input-roomWidth', value: '3' },
      { id: 'input-wallHeight', value: '2.4' },
      { id: 'input-coats', value: '2' },
      { id: 'input-doors', value: '0' },
      { id: 'input-windows', value: '0' },
      { id: 'input-coverageRate', value: '12' },
      { id: 'input-costPerLitre', value: '0' },
    ],
    [
      { id: 'input-includeCeiling', value: 'no', options: ['yes', 'no'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '33.6 m', 'gross wall area 33.6');
  assertContains(html, '5.6 L', 'walls paint 5.6L');
  assertContains(html, 'Walls Paint Needed', 'walls label');
});

// ─────────────────────────────────────────────────────────────────────────────
// 81. timber
// Test: 6m wall, 2.7m height, 600mm stud spacing
// numStuds = ceil(6/0.6) + 1 = 10 + 1 = 11
// noggingRows = 1 (height <= 2.7)
// noggingsPerRow = 11 - 1 = 10
// totalNoggingMetres = 1 * 10 * 0.6 = 6.0m
// totalPlateMetres = (2+1) * 6 = 18.0m
// totalStudMetres = 11 * 2.7 = 29.7m
// totalTimberMetres = 29.7 + 18 + 6 = 53.7m
// ─────────────────────────────────────────────────────────────────────────────
runTest('81. timber — 6m wall, 2.7m height, 600mm spacing → 11 studs', () => {
  const win = buildSelectDOM('timber',
    [
      { id: 'input-totalLength', value: '6' },
      { id: 'input-height', value: '2.7' },
      { id: 'input-wasteFactor', value: '10' },
      { id: 'input-pricePerMetre', value: '0' },
    ],
    [
      { id: 'input-projectType', value: 'wall', options: ['wall'] },
      { id: 'input-spacing', value: '600', options: ['450', '600'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '11 @', 'stud count 11');
  assertContains(html, '53.7m', 'grand total timber');
  assertContains(html, '29.7m', 'total stud metres');
});

// ─────────────────────────────────────────────────────────────────────────────
// 82. roofing
// Test: 100m² flat area, 22.5° pitch, colorbond
// pitchRad = 22.5 * PI/180 = 0.3927
// pitchFactor = 1/cos(0.3927) = 1/0.9239 = 1.0824
// roofLength = sqrt(100) = 10
// flatArea = 10*10 = 100
// actualArea = 100 * 1.0824 = 108.24
// colorbond: rakeLength = (10/2)/cos(0.3927) = 5/0.9239 = 5.412
// sheetsPerSide = ceil(10/0.762) = ceil(13.12) = 14
// sheetsNeeded = 14*2 = 28
// wasteUnits = ceil(28*0.05) = ceil(1.4) = 2
// totalUnits = 30
// ─────────────────────────────────────────────────────────────────────────────
runTest('82. roofing — 100m² flat area, 22.5° pitch, colorbond', () => {
  const win = buildSelectDOM('roofing',
    [
      { id: 'input-roofArea', value: '100' },
      { id: 'input-wasteFactor', value: '5' },
      { id: 'input-costPerUnit', value: '0' },
    ],
    [
      { id: 'input-pitch', value: '22.5', options: ['15', '22.5', '30', '45'] },
      { id: 'input-material', value: 'colorbond', options: ['colorbond', 'tiles'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, 'Flat Roof Area', 'flat roof area label');
  assertContains(html, '100.0 m', 'flat area 100');
  assertContains(html, 'Sheets Needed', 'sheets label');
  assertContains(html, 'Total to Order', 'total order label');
});

// ─────────────────────────────────────────────────────────────────────────────
// 83. fencing
// Test: 20m fence, 1.8m high, 2.7m post spacing, timber
// numPosts = ceil(20/2.7) + 1 = ceil(7.41) + 1 = 8 + 1 = 9 → Actually ceil(7.407)=8, +1=9
// numRailRows = 3 (height >= 1.8)
// totalRailMetres = 3 * 20 = 60m
// palings: 20 / 0.16 = 125 → ceil = 125
// ─────────────────────────────────────────────────────────────────────────────
runTest('83. fencing — 20m timber fence, 1.8m high, 2.7m spacing', () => {
  const win = buildSelectDOM('fencing',
    [
      { id: 'input-totalLength', value: '20' },
      { id: 'input-fenceHeight', value: '1.8' },
      { id: 'input-postSpacing', value: '2.7' },
    ],
    [
      { id: 'input-material', value: 'timber', options: ['timber', 'colorbond'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, 'Posts', 'posts label');
  assertContains(html, '60.0m total', 'total rail metres 60');
  assertContains(html, 'Palings (150mm)', 'palings label');
  assertContains(html, '125', 'palings count 125');
});

// ─────────────────────────────────────────────────────────────────────────────
// 84. decking
// Test: 6m × 4m deck, 90mm boards, 450mm joist spacing
// area = 6 * 4 = 24 m²
// boardWidthM = (90+5)/1000 = 0.095
// numBoards = ceil(6/0.095) = ceil(63.16) = 64
// boardsWithWaste = ceil(64 * 1.1) = ceil(70.4) = 71
// numJoists = ceil(4/0.45) + 1 = ceil(8.89) + 1 = 9 + 1 = 10
// numBearers = ceil(6/1.8) + 1 = ceil(3.33) + 1 = 4 + 1 = 5
// ─────────────────────────────────────────────────────────────────────────────
runTest('84. decking — 6m x 4m deck, 90mm boards, 450mm joists', () => {
  const win = buildSelectDOM('decking',
    [
      { id: 'input-deckLength', value: '6' },
      { id: 'input-deckWidth', value: '4' },
    ],
    [
      { id: 'input-boardWidth', value: '90', options: ['70', '90', '140'] },
      { id: 'input-joistSpacing', value: '450', options: ['400', '450', '600'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '24.0 m', 'deck area 24');
  assertContains(html, '71 boards', 'boards with waste 71');
  assertContains(html, '10 @', 'joist count 10');
  assertContains(html, '5 @', 'bearer count 5');
});

// ─────────────────────────────────────────────────────────────────────────────
// 85. blood-alcohol (Widmark formula)
// Test: male, 80kg, 4 standard drinks, 2 hours
// alcoholGrams = 4 * 10 = 40g
// r = 0.68 (male)
// BAC = (40 / (80 * 1000 * 0.68)) * 100 - (0.015 * 2)
//      = (40 / 54400) * 100 - 0.03
//      = 0.073529... - 0.03
//      = 0.043529... → 0.044%
// ─────────────────────────────────────────────────────────────────────────────
runTest('85. blood-alcohol — male 80kg, 4 drinks, 2 hours → ~0.044%', () => {
  const win = buildSelectDOM('blood-alcohol',
    [
      { id: 'input-weight', value: '80' },
      { id: 'input-drinks', value: '4' },
      { id: 'input-hours', value: '2' },
    ],
    [],
    [{ name: 'input-gender', value: 'male', allValues: ['male', 'female'] }]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  // BAC = 0.043529... → toFixed(3) = "0.044"
  assertContains(html, '0.044%', 'BAC 0.044%');
  assertContains(html, 'Estimated BAC', 'BAC label');
  assertContains(html, '0.68', 'Widmark factor male 0.68');
});

// ─────────────────────────────────────────────────────────────────────────────
// 86. electricity-usage
// Test: 2000W, 4hrs/day, 30c/kWh (input as 30 cents)
// kWhPerDay = 2000 * 4 / 1000 = 8 kWh
// tariffDollar = 30 / 100 = 0.30
// costPerDay = 8 * 0.30 = $2.40
// kWhPerMonth = 8 * 30.44 = 243.52
// costPerMonth = 243.52 * 0.30 = $73.06
// ─────────────────────────────────────────────────────────────────────────────
runTest('86. electricity-usage — 2000W, 4hrs/day, 30c/kWh → $2.40/day', () => {
  const win = buildSelectDOM('electricity-usage',
    [
      { id: 'input-watts', value: '2000' },
      { id: 'input-hoursPerDay', value: '4' },
      { id: 'input-tariff', value: '30' },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '8.00 kWh', 'daily usage 8 kWh');
  assertContains(html, '$2.40', 'daily cost $2.40');
  assertContains(html, 'Daily Cost', 'daily cost label');
  assertContains(html, 'Monthly Cost', 'monthly cost label');
});

// ─────────────────────────────────────────────────────────────────────────────
// 87. solar-savings
// Test: 6.6kW system, QLD (5.2 sun hours), 28c tariff, 8c feed-in
// dailyKwh = 6.6 * 5.2 = 34.32
// yearlyKwh = 34.32 * 365 = 12526.8
// selfConsumed = 12526.8 * 0.7 = 8768.76
// exported = 12526.8 * 0.3 = 3758.04
// savingsFromSelfUse = 8768.76 * 0.28 = $2455.25
// feedInEarnings = 3758.04 * 0.08 = $300.64
// total = $2755.89/yr (approx)
// payback = 6.6 * 1100 / 2755.89 = 7260 / 2755.89 ≈ 2.6 years
// ─────────────────────────────────────────────────────────────────────────────
runTest('87. solar-savings — 6.6kW, QLD, 28c tariff, 8c feed-in', () => {
  const win = buildSelectDOM('solar-savings',
    [
      { id: 'input-systemSize', value: '6.6' },
      { id: 'input-usageTariff', value: '28' },
      { id: 'input-feedInTariff', value: '8' },
    ],
    [
      { id: 'input-state', value: 'QLD', options: ['QLD', 'NSW', 'VIC', 'SA', 'WA', 'TAS'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '34.3 kWh', 'daily generation 34.3');
  assertContains(html, 'QLD', 'state in note');
  assertContains(html, 'Total Annual Benefit', 'annual benefit label');
  assertContains(html, 'Payback Period', 'payback label');
});

// ─────────────────────────────────────────────────────────────────────────────
// 88. water-usage
// Test: 2 people, 8 min shower, 1 shower/day, 4 washes/week, $3/kL
// showerDaily = 8 * 1 * 2 * 9 = 144 L
// toiletDaily = 2*5 * 4.5 = 45 L
// washingDaily = (4/7) * 60 = 34.28... L
// dishwasherDaily = 1 * 12 = 12 L
// drinkingCooking = 2 * 4 = 8 L
// garden = 30 L
// totalDaily = 144 + 45 + 34.29 + 12 + 8 + 30 = 273.29 L → ~273
// ─────────────────────────────────────────────────────────────────────────────
runTest('88. water-usage — 2 people, 8min shower, 4 washes/week', () => {
  const win = buildSelectDOM('water-usage',
    [
      { id: 'input-people', value: '2' },
      { id: 'input-showerMinutes', value: '8' },
      { id: 'input-showersPerDay', value: '1' },
      { id: 'input-washesPerWeek', value: '4' },
      { id: 'input-waterRate', value: '3' },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '144 L/day', 'shower daily 144L');
  assertContains(html, 'Total Daily Usage', 'total daily label');
  assertContains(html, 'Quarterly Cost', 'quarterly cost label');
});

// ─────────────────────────────────────────────────────────────────────────────
// 89. moving-cost
// Test: 3 bedroom, ground floor, no packing, 10km distance
// baseCost = $900 (3 bed)
// floorSurcharge = $0 (ground)
// packingCost = $0
// distanceSurcharge = $0 (≤25km)
// interstateSurcharge = $0
// insurance = $150
// total = 900 + 0 + 0 + 0 + 0 + 150 = $1,050
// ─────────────────────────────────────────────────────────────────────────────
runTest('89. moving-cost — 3bed, ground, no packing, 10km → $1,050', () => {
  const win = buildSelectDOM('moving-cost',
    [
      { id: 'input-distance', value: '10' },
    ],
    [
      { id: 'input-bedrooms', value: '3', options: ['1', '2', '3', '4', '5+'] },
      { id: 'input-floorFrom', value: 'ground', options: ['ground', '1st', '2nd', '3rd+'] },
    ],
    [],
    [{ id: 'input-packing', checked: false }]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '$900.00', 'base cost $900');
  assertContains(html, 'Transit Insurance', 'insurance label');
  assertContains(html, '$1,050.00', 'total $1,050');
});

// ─────────────────────────────────────────────────────────────────────────────
// 90. pet-age
// Test: cat, 5 years
// humanAge = 15 + 9 + (5-2)*4 = 15 + 9 + 12 = 36
// Stage: Prime (age >= 2 and < 6)
// ─────────────────────────────────────────────────────────────────────────────
runTest('90. pet-age — cat, 5 years → 36 human years', () => {
  const win = buildSelectDOM('pet-age',
    [
      { id: 'input-petAge', value: '5' },
    ],
    [
      { id: 'input-petType', value: 'cat', options: ['cat', 'dog'] },
      { id: 'input-breedSize', value: 'medium', options: ['small', 'medium', 'large'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '~36 human years', 'human age 36');
  assertContains(html, 'Prime', 'life stage Prime');
  assertContains(html, '12-18 years', 'cat life expectancy');
});

// ─────────────────────────────────────────────────────────────────────────────
// 91. shoe-size
// Test: male, 27.0cm foot → AU size 8, US 9, UK 8, EU 42
// ─────────────────────────────────────────────────────────────────────────────
runTest('91. shoe-size — male, 27cm → AU 8, US 9, UK 8, EU 42', () => {
  const win = buildSelectDOM('shoe-size',
    [
      { id: 'input-footLength', value: '27' },
    ],
    [],
    [{ name: 'input-gender', value: 'male', allValues: ['male', 'female'] }]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, 'AU/US', 'AU size label');
  assertContains(html, '>8<', 'AU size 8');
  assertContains(html, '>42<', 'EU size 42');
});

// ─────────────────────────────────────────────────────────────────────────────
// 92. dress-size
// Test: AU size 12
// chart: au=12 → us=8, uk=12, eu=40
// measurements: au=12 → bust=92, waist=74, hip=98
// ─────────────────────────────────────────────────────────────────────────────
runTest('92. dress-size — AU 12 → US 8, UK 12, EU 40', () => {
  const win = buildSelectDOM('dress-size',
    [
      { id: 'input-size', value: '12' },
    ],
    [
      { id: 'input-sizeSystem', value: 'AU', options: ['AU', 'US', 'UK', 'EU'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '>8<', 'US size 8');
  assertContains(html, '>40<', 'EU size 40');
  assertContains(html, '92 cm', 'bust 92cm');
  assertContains(html, '74 cm', 'waist 74cm');
});

// ─────────────────────────────────────────────────────────────────────────────
// 93. bra-size
// Test: underbust=73cm, overbust=87cm
// bandCm = round(73/2)*2 = round(36.5)*2 = 37*2 = 74 → but bandCm is underbust rounded to even
//   Actually: round(73/2) * 2 = round(36.5) * 2. JS Math.round(36.5) = 37. So bandCm = 74.
// diff = round(87 - 74) = 13 → cup: diff >= 12 → A (not >= 14 for B)
// Find closest band: looking for cm closest to 74. bandSizes: 68=10, 73=12, 78=14...
//   |68-74|=6, |73-74|=1 → bestBand = {cm:73, au:12}
// Result: AU size 12A
// ─────────────────────────────────────────────────────────────────────────────
runTest('93. bra-size — underbust 73cm, overbust 87cm → 12A', () => {
  const win = buildSelectDOM('bra-size',
    [
      { id: 'input-underBust', value: '73' },
      { id: 'input-overBust', value: '87' },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, 'AU Size', 'AU size label');
  assertContains(html, '12A', 'size 12A');
  assertContains(html, 'Sister Sizes', 'sister sizes');
});

// ─────────────────────────────────────────────────────────────────────────────
// 94. rental-yield
// Test: $600,000 property, $550/week, no extra expenses
// annualRent = 550 * 52 = $28,600
// grossYield = 28600 / 600000 * 100 = 4.7667% → 4.77%
// netYield = same when expenses = 0
// ─────────────────────────────────────────────────────────────────────────────
runTest('94. rental-yield — $600k property, $550/wk → gross yield 4.77%', () => {
  const win = buildSelectDOM('rental-yield',
    [
      { id: 'input-propertyValue', value: '600000' },
      { id: 'input-weeklyRent', value: '550' },
      { id: 'input-annualExpenses', value: '0' },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '4.77%', 'gross yield 4.77%');
  assertContains(html, '$28,600.00', 'annual rent $28,600');
  assertContains(html, 'Gross Yield', 'gross yield label');
});

// ─────────────────────────────────────────────────────────────────────────────
// 95. negative-gearing
// Test: $600k property, $480k loan, 6% interest, $500/wk rent, $5k expenses, 37% tax
// annualRent = 500 * 52 = $26,000
// annualInterest = 480000 * 0.06 = $28,800
// buildingDepreciation = 600000 * 0.6 * 0.025 = $9,000
// plantDepreciation = $2,000
// totalDepreciation = $11,000
// totalDeductions = 28800 + 5000 + 11000 = $44,800
// annualLoss = 44800 - 26000 = $18,800 (negatively geared)
// taxBenefit = 18800 * 0.37 = $6,956
// afterTaxCost = 18800 - 6956 = $11,844
// ─────────────────────────────────────────────────────────────────────────────
runTest('95. negative-gearing — $600k, $480k loan, 6%, $500/wk → negatively geared', () => {
  const win = buildSelectDOM('negative-gearing',
    [
      { id: 'input-propertyValue', value: '600000' },
      { id: 'input-loanAmount', value: '480000' },
      { id: 'input-interestRate', value: '6' },
      { id: 'input-weeklyRent', value: '500' },
      { id: 'input-annualExpenses', value: '5000' },
    ],
    [
      { id: 'input-marginalRate', value: '37', options: ['0', '16', '30', '37', '45'] },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, 'Negatively Geared', 'status negatively geared');
  assertContains(html, 'Tax Benefit', 'tax benefit label');
  assertContains(html, '$18,800.00', 'annual loss $18,800');
});

// ─────────────────────────────────────────────────────────────────────────────
// 96. dividend-reinvestment
// Test: $10,000 initial, 4% dividend yield, 7% capital growth, 10 years, reinvest=true
// Year 1 (with reinvestment):
//   reinvestDiv = 10000 * 0.04 = 400
//   reinvestValue = (10000 + 400) * 1.07 = 10400 * 1.07 = 11128
// After 10 years, reinvestValue >> cashValue + totalDivs
// ─────────────────────────────────────────────────────────────────────────────
runTest('96. dividend-reinvestment — $10k, 4% div, 7% growth, 10yr → positive DRP advantage', () => {
  const win = buildSelectDOM('dividend-reinvestment',
    [
      { id: 'input-initialInvestment', value: '10000' },
      { id: 'input-dividendYield', value: '4' },
      { id: 'input-capitalGrowth', value: '7' },
      { id: 'input-years', value: '10' },
    ],
    [],
    [],
    [{ id: 'input-drp', checked: true }]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, 'With Reinvestment (10yr)', 'reinvestment 10yr label');
  assertContains(html, 'DRP Advantage', 'DRP advantage label');
  // Year 1 row should appear
  assertContains(html, 'Year 1', 'year 1 row');
});

// ─────────────────────────────────────────────────────────────────────────────
// 97. crypto-profit
// Test: buy=$100, sell=$150, qty=10, buyFee=0%, sellFee=0%, holding=6 months
// totalBuyCost = 100 * 10 = $1,000
// totalSellValue = 150 * 10 = $1,500
// buyFee = 0, sellFee = 0, totalFees = 0
// grossProfit = 1500 - 1000 = $500
// netProfit = 500 - 0 = $500
// percentReturn = 500 / 1000 * 100 = 50.00%
// cgtDiscount = false (6 months < 12)
// taxableGain = $500 (no discount)
// ─────────────────────────────────────────────────────────────────────────────
runTest('97. crypto-profit — buy $100, sell $150, qty 10, no fees → $500 profit, 50% ROI', () => {
  const win = buildSelectDOM('crypto-profit',
    [
      { id: 'input-buyPrice', value: '100' },
      { id: 'input-sellPrice', value: '150' },
      { id: 'input-quantity', value: '10' },
      { id: 'input-buyFee', value: '0' },
      { id: 'input-sellFee', value: '0' },
      { id: 'input-holdingPeriod', value: '6' },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '$500.00', 'net profit $500');
  assertContains(html, '50.00%', 'return 50%');
  assertContains(html, 'Net Profit/Loss', 'profit label');
  assertContains(html, 'no CGT discount', 'no CGT discount under 12 months');
});

// ─────────────────────────────────────────────────────────────────────────────
// 98. love-calculator
// Test: just verify it produces a score 1-100
// Scores are hash-based and deterministic. "alice" + "bob" → some score in [1..100]
// ─────────────────────────────────────────────────────────────────────────────
runTest('98. love-calculator — produces a score 1-100', () => {
  const win = buildSelectDOM('love-calculator',
    [
      { id: 'input-name1', value: 'Alice' },
      { id: 'input-name2', value: 'Bob' },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, 'Love Score', 'love score label');
  // Score is a number 1-100 followed by %
  const scoreMatch = html.match(/(\d+)%/);
  assert('score found in output', !!scoreMatch, 'no % score in html');
  const score = parseInt(scoreMatch[1]);
  assert('score between 1 and 100', score >= 1 && score <= 100, `score was ${score}`);
  assertContains(html, 'Compatibility Breakdown', 'compatibility breakdown');
});

// ─────────────────────────────────────────────────────────────────────────────
// 99. pizza-split
// Test: 30cm pizza (≈12"), 2 pizzas, 4 people, 8 slices/pizza
// totalSlices = 2 * 8 = 16
// slicesPerPerson = 16 / 4 = 4.0
// wholeSlices = 4
// leftoverSlices = 16 % 4 = 0
// areaPerPizza = π * 15² = 706.86 cm²
// ─────────────────────────────────────────────────────────────────────────────
runTest('99. pizza-split — 30cm, 2 pizzas, 4 people, 8 slices → 4.0 each', () => {
  const win = buildSelectDOM('pizza-split',
    [
      { id: 'input-diameter', value: '30' },
      { id: 'input-pizzas', value: '2' },
      { id: 'input-people', value: '4' },
      { id: 'input-slicesPerPizza', value: '8' },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '16 slices', 'total slices 16');
  assertContains(html, '4.0 slices', 'slices per person 4.0');
  assertContains(html, '4 slices each', 'fair split 4 each');
});

// ─────────────────────────────────────────────────────────────────────────────
// 100. coffee-cost
// Test: 2 coffees/day, $5 each, 5 days/week (input-workDaysPerWeek = 5)
// workDaysPerYearCalc = 5 * 52 = 260
// dailyCost = 2 * 5 = $10
// weeklyCost = 10 * 5 = $50
// monthlyCost = 10 * (260/12) = 10 * 21.667 = $216.67
// yearlyCost = 10 * 260 = $2,600
// ─────────────────────────────────────────────────────────────────────────────
runTest('100. coffee-cost — 2 coffees/day, $5, 5 days/wk → $2,600/year', () => {
  const win = buildSelectDOM('coffee-cost',
    [
      { id: 'input-coffeesPerDay', value: '2' },
      { id: 'input-pricePerCoffee', value: '5' },
      { id: 'input-workDaysPerWeek', value: '5' },
    ]
  );
  win.calculate();
  const html = win.document.getElementById('results-content').innerHTML;
  assert('results visible', !win.document.getElementById('calc-results').classList.contains('hidden'));
  assertContains(html, '$10.00', 'daily cost $10');
  assertContains(html, '$2,600.00', 'yearly cost $2,600');
  assertContains(html, 'Yearly', 'yearly label');
  assertContains(html, '260 days', 'days per year in note');
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(60)}`);
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed}\n`);

if (errors.length) {
  console.log('Failures:\n');
  errors.forEach(e => console.log(`  ${e.name}\n    ${e.error}\n`));
}

process.exit(failed > 0 ? 1 : 0);
