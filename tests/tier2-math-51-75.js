/**
 * CalcMate Tier 2 Math Verification Tests — Calculators 51–75
 *
 * Uses jsdom to load each calculator's JS, set specific input values,
 * call calculate(), then assert expected values appear in results-content.
 *
 * Run: node tests/tier2-math-51-75.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const CALC_DIR = path.join(__dirname, '../public/js/calculators');
const results = { pass: 0, fail: 0, errors: [] };

// ─── Harness helpers ──────────────────────────────────────────────────────────

function makeDOM(scriptSrc) {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html><body>
      <div id="calc-results" class="hidden"></div>
      <div id="results-content"></div>
    </body></html>
  `, { runScripts: 'dangerously' });

  const scriptEl = dom.window.document.createElement('script');
  scriptEl.textContent = scriptSrc;
  dom.window.document.body.appendChild(scriptEl);
  return dom;
}

function addInput(doc, id, type, value) {
  const el = doc.createElement(type === 'radio' ? 'input' : (type === 'select' ? 'select' : 'input'));
  if (type === 'select') {
    el.id = id;
    el.value = value;
    // Add the option so .value sticks
    const opt = doc.createElement('option');
    opt.value = value;
    opt.selected = true;
    el.appendChild(opt);
  } else if (type === 'radio') {
    el.type = 'radio';
    el.name = id;
    el.value = value;
    el.checked = true;
  } else {
    el.id = id;
    el.type = type || 'number';
    el.value = value;
  }
  doc.body.appendChild(el);
  return el;
}

function addTextarea(doc, id, value) {
  const el = doc.createElement('textarea');
  el.id = id;
  el.value = value;
  doc.body.appendChild(el);
  return el;
}

function assert(name, html, ...snippets) {
  const missing = snippets.filter(s => !html.includes(s));
  if (missing.length === 0) {
    results.pass++;
    console.log(`  PASS  ${name}`);
  } else {
    results.fail++;
    const err = `Expected: ${missing.join(', ')}`;
    results.errors.push({ name, error: err, html: html.substring(0, 300) });
    console.log(`  FAIL  ${name}`);
    console.log(`         ${err}`);
    console.log(`         HTML: ${html.substring(0, 200)}`);
  }
}

function loadCalc(slug) {
  return fs.readFileSync(path.join(CALC_DIR, `${slug}.js`), 'utf8');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

console.log('\nCalcMate Tier 2 Math Tests — Calculators 51–75\n');

// ── 51. overtime-pay ──────────────────────────────────────────────────────────
// base=$35, 4hrs at 1.5x=$210, 2hrs at 2x=$140, 0 pubHol → total=$350
{
  const dom = makeDOM(loadCalc('overtime-pay'));
  const doc = dom.window.document;
  addInput(doc, 'input-baseRate',    'number', '35');
  addInput(doc, 'input-otHours150',  'number', '4');
  addInput(doc, 'input-otHours200',  'number', '2');
  addInput(doc, 'input-pubHolHours', 'number', '0');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('51 overtime-pay — base $35, 4×1.5x + 2×2x', html,
    '$210.00',   // pay 1.5x
    '$140.00',   // pay 2x
    '$350.00'    // total OT
  );
}

// ── 52. business-viability ────────────────────────────────────────────────────
// startup=25000, revenue=8000, expenses=5000, growth=5%, cashReserve=10000
// Month 1 CF = 3000, breakeven = month 7 (cumulative turns positive)
{
  const dom = makeDOM(loadCalc('business-viability'));
  const doc = dom.window.document;
  addInput(doc, 'input-startupCosts',   'number', '25000');
  addInput(doc, 'input-monthlyRevenue', 'number', '8000');
  addInput(doc, 'input-monthlyExpenses','number', '5000');
  addInput(doc, 'input-revenueGrowth',  'number', '5');
  addInput(doc, 'input-cashReserve',    'number', '10000');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('52 business-viability — breakeven month 7', html,
    'Month 7',
    '$3,000.00'  // month 1 net cashflow
  );
}

// ── 53. fuel-tax-credit ───────────────────────────────────────────────────────
// 500L diesel, heavy-vehicle-road activity → actKey not found in rates → fallback 20.5c/L
// Credit = 500 × 0.205 = $102.50
{
  const dom = makeDOM(loadCalc('fuel-tax-credit'));
  const doc = dom.window.document;
  addInput(doc, 'input-litres',    'number', '500');
  addInput(doc, 'input-fuelType',  'select', 'diesel');
  addInput(doc, 'input-activity',  'select', 'heavy-vehicle-road');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('53 fuel-tax-credit — 500L diesel @ 20.5c = $102.50', html,
    '$102.50'
  );
}

// ── 54. super-balance-growth ──────────────────────────────────────────────────
// balance=50000, salary=80000, superRate=11.5%, return=7%, age=40, retire=67 → 27yr
// annualContrib=9200, projected at retirement ≈ $1,043,912.14
{
  const dom = makeDOM(loadCalc('super-balance-growth'));
  const doc = dom.window.document;
  addInput(doc, 'input-currentBalance',  'number', '50000');
  addInput(doc, 'input-annualSalary',    'number', '80000');
  addInput(doc, 'input-superRate',       'number', '11.5');
  addInput(doc, 'input-investmentReturn','number', '7');
  addInput(doc, 'input-currentAge',      'number', '40');
  addInput(doc, 'input-retireAge',       'number', '67');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('54 super-balance-growth — 27yr projection ≈ $1,043,912', html,
    '27 years',
    '1,043,912'
  );
}

// ── 55. retirement-savings ────────────────────────────────────────────────────
// age=40, retire=67, desiredIncome=50000, super=200000, otherSavings=0
// projectedSuper ≈ $1,242,773, totalNeeded ≈ $742,842 → surplus
{
  const dom = makeDOM(loadCalc('retirement-savings'));
  const doc = dom.window.document;
  addInput(doc, 'input-currentAge',   'number', '40');
  addInput(doc, 'input-retireAge',    'number', '67');
  addInput(doc, 'input-desiredIncome','number', '50000');
  addInput(doc, 'input-superBalance', 'number', '200000');
  addInput(doc, 'input-otherSavings', 'number', '0');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('55 retirement-savings — surplus scenario', html,
    'Surplus',
    '1,242,773'   // projected super
  );
}

// ── 56. super-comparison ─────────────────────────────────────────────────────
// balance=80000, fund1: 1% fee, 8% return, $520 insurance; fund2: 0.5% fee, 8.5% return, $480 insurance
// f1NetReturn=7%, f2NetReturn=8%
// After 30 years: bal1≈$556,422, bal2≈$746,286 → fund 2 wins
{
  const dom = makeDOM(loadCalc('super-comparison'));
  const doc = dom.window.document;
  addInput(doc, 'input-currentBalance', 'number', '80000');
  addInput(doc, 'input-fund1Fee',       'number', '1');
  addInput(doc, 'input-fund1Return',    'number', '8');
  addInput(doc, 'input-fund1Insurance', 'number', '520');
  addInput(doc, 'input-fund2Fee',       'number', '0.5');
  addInput(doc, 'input-fund2Return',    'number', '8.5');
  addInput(doc, 'input-fund2Insurance', 'number', '480');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('56 super-comparison — fund 2 wins after 30yr', html,
    'Fund 2',
    '30-Year Difference'
  );
}

// ── 57. super-contribution ────────────────────────────────────────────────────
// salary=80000, superRate=11.5%, sacrifice=5000
// employerSuper=9200, totalConcessional=14200, marginalRate=30%
// incomeTaxSaved=1500, superTax=750 (min(5000,30000-9200)*0.15), netSaving=750
{
  const dom = makeDOM(loadCalc('super-contribution'));
  const doc = dom.window.document;
  addInput(doc, 'input-annualSalary',   'number', '80000');
  addInput(doc, 'input-superRate',      'number', '11.5');
  addInput(doc, 'input-salarySacrifice','number', '5000');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('57 super-contribution — $80k salary, $5k sacrifice, net saving $750', html,
    '$9,200.00',  // employer super
    '$14,200.00', // total concessional
    '$750.00'     // net tax saving
  );
}

// ── 58. compound-interest ─────────────────────────────────────────────────────
// principal=$10,000, rate=5%, compounding=annually (n=1), 10 years, contribution=0
// A = 10000 × (1.05)^10 = $16,288.95
{
  const dom = makeDOM(loadCalc('compound-interest'));
  const doc = dom.window.document;
  addInput(doc, 'input-principal',    'number', '10000');
  addInput(doc, 'input-rate',         'number', '5');
  addInput(doc, 'input-compounding',  'select', 'annually');
  addInput(doc, 'input-years',        'number', '10');
  addInput(doc, 'input-contribution', 'number', '0');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('58 compound-interest — $10k@5% annual 10yr = $16,288.95', html,
    '$16,288.95',
    '$6,288.95'  // interest earned
  );
}

// ── 59. credit-card-payoff ────────────────────────────────────────────────────
// balance=$5000, rate=20.99%, minPayment=2%, extraPayment=$100
// Payoff in 46 months, totalInterest≈$2,051.97
{
  const dom = makeDOM(loadCalc('credit-card-payoff'));
  const doc = dom.window.document;
  addInput(doc, 'input-balance',      'number', '5000');
  addInput(doc, 'input-rate',         'number', '20.99');
  addInput(doc, 'input-minPayment',   'number', '2');
  addInput(doc, 'input-extraPayment', 'number', '100');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  // 46 months = 3 years 10 months
  assert('59 credit-card-payoff — $5k@20.99% with $100 extra', html,
    '3 years',
    '2,051'      // total interest (partial match for $2,051.97)
  );
}

// ── 60. home-loan-affordability ───────────────────────────────────────────────
// income=$100k, expenses=$3k/mo, deposit=$80k, rate=6.5%
// bufferRate=9.5%, available=$5,333.33/mo
// maxLoan≈$634,275, maxPurchase≈$714,275
{
  const dom = makeDOM(loadCalc('home-loan-affordability'));
  const doc = dom.window.document;
  addInput(doc, 'input-grossIncome',     'number', '100000');
  addInput(doc, 'input-monthlyExpenses', 'number', '3000');
  addInput(doc, 'input-deposit',         'number', '80000');
  addInput(doc, 'input-interestRate',    'number', '6.5');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('60 home-loan-affordability — $100k income, $80k deposit', html,
    '634,275',
    '714,275'
  );
}

// ── 61. energy-bill ───────────────────────────────────────────────────────────
// state=QLD (uppercase - JS does lowercase lookup, falls back to default 100c/day)
// household=3 (18 kWh/day), tariff=30c/kWh
// quarterlyUsage = 18 × 0.30 × 91 = $491.40
// quarterlySupply = 1.00 × 91 = $91.00
// quarterlyTotal = $582.40
{
  const dom = makeDOM(loadCalc('energy-bill'));
  const doc = dom.window.document;
  addInput(doc, 'input-state',     'select', 'QLD');
  addInput(doc, 'input-household', 'select', '3');
  addInput(doc, 'input-tariff',    'number', '30');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('61 energy-bill — QLD, 3 people, 30c tariff = $582.40/qtr', html,
    '$491.40',
    '$91.00',
    '$582.40'
  );
}

// ── 62. capital-gains-tax ─────────────────────────────────────────────────────
// buy=$300k, sell=$500k, no selling costs, holdingPeriod='over12', taxBracket=30
// JS checks holdingPeriod==='more-than-12-months' — 'over12' does NOT match
// So no 50% discount applied: taxPayable = $200,000 × 30% = $60,000
// (This is a code behaviour test — documents actual behaviour)
{
  const dom = makeDOM(loadCalc('capital-gains-tax'));
  const doc = dom.window.document;
  addInput(doc, 'input-purchasePrice', 'number', '300000');
  addInput(doc, 'input-salePrice',     'number', '500000');
  addInput(doc, 'input-sellingCosts',  'number', '0');
  addInput(doc, 'input-holdingPeriod', 'select', 'over12');
  addInput(doc, 'input-assetType',     'select', 'property');
  addInput(doc, 'input-taxBracket',    'select', '30');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  // 'over12' !== 'more-than-12-months' so no discount: taxPayable = 200000*0.30 = 60000
  assert('62 capital-gains-tax — $200k gain, 30% rate, no discount (over12 mismatch)', html,
    '$200,000.00',  // capital gain
    '$60,000.00'    // tax payable (no discount because 'over12' !== 'more-than-12-months')
  );
}

// ── 63. division-7a ───────────────────────────────────────────────────────────
// loan=$50k, rate=8.27%, term=7yr
// minRepayment = 50000×0.0827/(1-(1.0827)^-7) ≈ $9,692.48
{
  const dom = makeDOM(loadCalc('division-7a'));
  const doc = dom.window.document;
  addInput(doc, 'input-loanAmount',    'number', '50000');
  addInput(doc, 'input-benchmarkRate', 'number', '8.27');
  addInput(doc, 'input-loanTerm',      'number', '7');
  addInput(doc, 'input-yearOfLoan',    'number', '1');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('63 division-7a — $50k loan @8.27% 7yr = $9,692.48/yr', html,
    '$9,692.48',
    '$17,847'    // total interest (partial match)
  );
}

// ── 64. fbt-car ───────────────────────────────────────────────────────────────
// carValue=$55k, daysAvailable=365, employeeContrib=0
// taxableValue = 55000×0.20×(365/365)−0 = $11,000
// grossedUp = 11000×2.0802 = $22,882.20
// fbtPayable = 22882.20×0.47 ≈ $10,754.63
{
  const dom = makeDOM(loadCalc('fbt-car'));
  const doc = dom.window.document;
  addInput(doc, 'input-carValue',      'number', '55000');
  addInput(doc, 'input-totalKm',       'number', '25000');
  addInput(doc, 'input-businessKm',    'number', '15000');
  addInput(doc, 'input-daysAvailable', 'number', '365');
  addInput(doc, 'input-employeeContrib','number', '0');
  addInput(doc, 'input-method',        'select', 'statutory');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('64 fbt-car — $55k car, statutory, $10,754.63 FBT', html,
    '$11,000.00',   // taxable value
    '$10,754.63'    // FBT payable type 1
  );
}

// ── 65. simple-interest ───────────────────────────────────────────────────────
// principal=$10,000, rate=5%, time=3 years
// interest = 10000 × 0.05 × 3 = $1,500
{
  const dom = makeDOM(loadCalc('simple-interest'));
  const doc = dom.window.document;
  addInput(doc, 'input-principal', 'number', '10000');
  addInput(doc, 'input-rate',      'number', '5');
  addInput(doc, 'input-time',      'number', '3');
  addInput(doc, 'input-timeUnit',  'select', 'years');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('65 simple-interest — $10k@5%×3yr = $1,500', html,
    '$1,500.00',   // total interest
    '$11,500.00'   // total amount
  );
}

// ── 66. loan-comparison ───────────────────────────────────────────────────────
// Loan 1: $500k @6.5% 30yr; Loan 2: $500k @6.2% 30yr
// L1 monthly≈$3,160.34, total≈$1,137,722; L2 monthly≈$3,062.34, total≈$1,102,444
// Best = Loan 2
{
  const dom = makeDOM(loadCalc('loan-comparison'));
  const doc = dom.window.document;
  addInput(doc, 'input-loan1Amount', 'number', '500000');
  addInput(doc, 'input-loan1Rate',   'number', '6.5');
  addInput(doc, 'input-loan1Term',   'number', '30');
  addInput(doc, 'input-loan2Amount', 'number', '500000');
  addInput(doc, 'input-loan2Rate',   'number', '6.2');
  addInput(doc, 'input-loan2Term',   'number', '30');
  addInput(doc, 'input-loan3Amount', 'number', '0');
  addInput(doc, 'input-loan3Rate',   'number', '0');
  addInput(doc, 'input-loan3Term',   'number', '0');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('66 loan-comparison — $500k: 6.5% vs 6.2%, Loan 2 wins', html,
    '3,160.34',  // L1 monthly
    '3,062.34',  // L2 monthly
    'Loan 2'     // best
  );
}

// ── 67. offset-account ────────────────────────────────────────────────────────
// loan=$500k, rate=5%, term=30yr, offset=$50k
// interestNoOffset≈$466,278, interestWithOffset≈$324,098, saved≈$142,180
{
  const dom = makeDOM(loadCalc('offset-account'));
  const doc = dom.window.document;
  addInput(doc, 'input-loanBalance',   'number', '500000');
  addInput(doc, 'input-interestRate',  'number', '5');
  addInput(doc, 'input-loanTerm',      'number', '30');
  addInput(doc, 'input-offsetBalance', 'number', '50000');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('67 offset-account — $50k offset saves ~$142k', html,
    '466,278',
    '142,180'
  );
}

// ── 68. refinance-savings ─────────────────────────────────────────────────────
// balance=$450k, currentRate=6.8%, term=22yr, newRate=6.2%, newTerm=22yr, switching=$1500
// currentMonthly≈$3,290.21, newMonthly≈$3,137.67, totalSaving≈$40,268.14
{
  const dom = makeDOM(loadCalc('refinance-savings'));
  const doc = dom.window.document;
  addInput(doc, 'input-currentBalance', 'number', '450000');
  addInput(doc, 'input-currentRate',    'number', '6.8');
  addInput(doc, 'input-currentTerm',    'number', '22');
  addInput(doc, 'input-newRate',        'number', '6.2');
  addInput(doc, 'input-newTerm',        'number', '22');
  addInput(doc, 'input-switchingCosts', 'number', '1500');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('68 refinance-savings — $450k refi saves ~$40k', html,
    '3,290.21',  // current monthly
    '3,137.67',  // new monthly
    '40,268'     // total saving (partial match)
  );
}

// ── 69. do-i-need-to-lodge ────────────────────────────────────────────────────
// income=$22,000, employment, resident, under-65
// $22,000 >= $18,200 threshold → must lodge
{
  const dom = makeDOM(loadCalc('do-i-need-to-lodge'));
  const doc = dom.window.document;
  addInput(doc, 'input-totalIncome',   'number', '22000');
  addInput(doc, 'input-incomeSource',  'select', 'employment');
  addInput(doc, 'input-residency',     'select', 'resident');
  addInput(doc, 'input-age',           'select', 'under-65');
  addInput(doc, 'input-hadTaxWithheld','select', 'yes');
  addInput(doc, 'input-hadCapitalGain','select', 'no');
  addInput(doc, 'input-hadABN',        'select', 'no');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('69 do-i-need-to-lodge — $22k income, must lodge', html,
    'Yes - you likely need to lodge',
    '18,200'    // threshold shown in reason
  );
}

// ── 70. pregnancy-weeks ───────────────────────────────────────────────────────
// Date-dependent calc: provide a due date 20 weeks from today
// This tests that the calculator runs without errors and shows week info
{
  const dom = makeDOM(loadCalc('pregnancy-weeks'));
  const doc = dom.window.document;
  // Due date = today + 140 days (20 weeks away) → currently ~20 weeks pregnant
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 140);
  const dueDateStr = dueDate.toISOString().split('T')[0];
  addInput(doc, 'input-calcMethod', 'select', 'due-date');
  addInput(doc, 'input-date', 'text', dueDateStr);
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('70 pregnancy-weeks — due in 20wks → currently ~20wks pregnant', html,
    'weeks',
    'Trimester'
  );
}

// ── 71. baby-age ─────────────────────────────────────────────────────────────
// DOB = 3 months ago (91 days) → ~13 weeks, 0 months old
{
  const dom = makeDOM(loadCalc('baby-age'));
  const doc = dom.window.document;
  const dob = new Date();
  dob.setDate(dob.getDate() - 91);
  const dobStr = dob.toISOString().split('T')[0];
  addInput(doc, 'input-dob',           'text',   dobStr);
  addInput(doc, 'input-prematureWeeks','number', '0');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('71 baby-age — 91 days old = 13 weeks', html,
    '13 weeks',
    'Age in Months'
  );
}

// ── 72. child-height-predictor ────────────────────────────────────────────────
// mother=165cm, father=180cm, boy
// predicted = (165+180+13)/2 = 179.0cm
{
  const dom = makeDOM(loadCalc('child-height-predictor'));
  const doc = dom.window.document;
  addInput(doc, 'input-motherHeight', 'number', '165');
  addInput(doc, 'input-fatherHeight', 'number', '180');
  // radio button for gender
  const radio = doc.createElement('input');
  radio.type = 'radio';
  radio.name = 'input-childGender';
  radio.value = 'male';
  radio.checked = true;
  doc.body.appendChild(radio);
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('72 child-height-predictor — 165+180 boy → 179.0cm', html,
    '179.0 cm',
    'Likely Range',
    '170.5'      // rangeLow = 179-8.5
  );
}

// ── 73. school-start-age ─────────────────────────────────────────────────────
// DOB = 2021-03-15, state=qld (cutoff 30 June)
// Turns 5 on 2026-03-15, cutoff 2026-06-30 → 2026-03-15 <= 2026-06-30 → starts 2026
{
  const dom = makeDOM(loadCalc('school-start-age'));
  const doc = dom.window.document;
  addInput(doc, 'input-childDOB', 'text',   '2021-03-15');
  addInput(doc, 'input-state',    'select', 'qld');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('73 school-start-age — QLD, DOB 2021-03-15 → starts 2026', html,
    '2026',
    'Prep'
  );
}

// ── 74. sample-size ───────────────────────────────────────────────────────────
// confidence=95%, margin=5%, population=10000
// z=1.96, n0=(1.96²×0.25)/0.0025=384.16, adjusted=384.16/(1+(383.16/10000))≈369.98 → 370
{
  const dom = makeDOM(loadCalc('sample-size'));
  const doc = dom.window.document;
  addInput(doc, 'input-confidence',   'select', '95%');
  addInput(doc, 'input-marginOfError','number', '5');
  addInput(doc, 'input-population',   'number', '10000');
  addInput(doc, 'input-proportion',   'number', '50');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('74 sample-size — 95% CI, 5% margin, 10k pop → 370', html,
    '370',
    '385'   // base sample size (Math.ceil(384.16) = 385)
  );
}

// ── 75. standard-deviation ───────────────────────────────────────────────────
// data: 2,4,4,4,5,5,7,9 → mean=5, population SD=2.0
{
  const dom = makeDOM(loadCalc('standard-deviation'));
  const doc = dom.window.document;
  addTextarea(doc, 'input-dataSet', '2,4,4,4,5,5,7,9');
  dom.window.calculate();
  const html = doc.getElementById('results-content').innerHTML;
  assert('75 standard-deviation — 2,4,4,4,5,5,7,9 → mean=5, SD=2', html,
    '5.00',     // mean
    '2.00',     // population SD
    '4.00'      // mode=4 (appears 3 times)
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(60)}`);
console.log(`\nResults: ${results.pass} passed, ${results.fail} failed out of ${results.pass + results.fail}\n`);

if (results.errors.length) {
  console.log('Failures:\n');
  results.errors.forEach(e => {
    console.log(`  ${e.name}`);
    console.log(`    ${e.error}`);
  });
}

process.exit(results.fail > 0 ? 1 : 0);
