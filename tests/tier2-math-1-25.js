/**
 * CalcMate — Tier 2 Math Verification Tests (Calculators 1–25)
 *
 * Uses jsdom to simulate a browser environment, loads each calculator's JS,
 * sets specific input values, calls calculate(), and asserts the results HTML
 * contains mathematically correct expected output strings.
 *
 * Run: node tests/tier2-math-1-25.js
 */

'use strict';

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const calculators = require('../data/calculators.json');

let pass = 0;
let fail = 0;
const errors = [];

// ---------------------------------------------------------------------------
// Core test harness
// ---------------------------------------------------------------------------

function testCalc(slug, inputValues, expectedResults) {
  const calc = calculators.find(c => c.slug === slug);
  if (!calc) {
    errors.push({ slug, error: 'Not found in calculators.json' });
    fail++;
    console.log(`  ❌ ${slug} — not found in calculators.json`);
    return;
  }

  // Build HTML with inputs matching the calculator's declared input IDs
  let inputsHtml = '';
  (calc.inputs || []).forEach(inp => {
    const val = inputValues[inp.id] !== undefined ? inputValues[inp.id] : (inp.default || '');
    if (inp.type === 'select') {
      inputsHtml += `<select id="input-${inp.id}"><option value="${val}" selected>${val}</option></select>`;
    } else if (inp.type === 'radio') {
      (inp.options || []).forEach(opt => {
        const checked = String(opt.value) === String(val) ? 'checked' : '';
        inputsHtml += `<input type="radio" name="input-${inp.id}" value="${opt.value}" ${checked}>`;
      });
    } else if (inp.type === 'checkbox') {
      inputsHtml += `<input type="checkbox" id="input-${inp.id}" ${val ? 'checked' : ''}>`;
    } else {
      // number, text, date — all render as <input>
      inputsHtml += `<input id="input-${inp.id}" value="${val}">`;
    }
  });

  const html = `
    <div id="calc-inputs">${inputsHtml}</div>
    <div id="calc-results" class="hidden">
      <div id="results-content"></div>
    </div>
  `;

  const dom = new JSDOM(html, { runScripts: 'dangerously' });

  // Load the calculator JS into the jsdom window
  const jsPath = path.join(__dirname, '..', 'public', 'js', 'calculators', `${slug}.js`);
  let jsCode;
  try {
    jsCode = fs.readFileSync(jsPath, 'utf8');
  } catch (e) {
    errors.push({ slug, error: `Could not read JS file: ${e.message}` });
    fail++;
    console.log(`  ❌ ${slug} — JS file not found`);
    dom.window.close();
    return;
  }

  dom.window.eval(jsCode);

  try {
    dom.window.calculate();
    const resultsHtml = dom.window.document.getElementById('results-content').innerHTML;

    let allMatch = true;
    for (const [label, expected] of Object.entries(expectedResults)) {
      if (!resultsHtml.includes(expected)) {
        errors.push({ slug, error: `Expected "${expected}" for "${label}" not found in results` });
        allMatch = false;
      }
    }

    if (allMatch) {
      pass++;
      console.log(`  ✅ ${slug}`);
    } else {
      fail++;
      console.log(`  ❌ ${slug}`);
    }
  } catch (e) {
    errors.push({ slug, error: e.message });
    fail++;
    console.log(`  ❌ ${slug} — ${e.message}`);
  }

  dom.window.close();
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

console.log('\nCalcMate — Tier 2 Math Verification Tests\n');
console.log('Running 25 tests...\n');

// ---------------------------------------------------------------------------
// 1. take-home-pay
// Inputs: grossSalary=85000, payFrequency=annually, helpDebt=no, privateHealth=no, includesSuper=no
// Expected: incomeTax = 4288 + (85000-45000)*0.30 = 16288
//           medicare  = 85000 * 0.02 = 1700
//           takeHome  = 85000 - 16288 - 1700 = 67012
//           super     = 85000 * 0.115 = 9775
// ---------------------------------------------------------------------------
testCalc(
  'take-home-pay',
  {
    grossSalary: 85000,
    payFrequency: 'annually',
    helpDebt: 'no',
    privateHealth: 'no',
    includesSuper: 'no'
  },
  {
    'Income Tax':          '$16,288.00',
    'Medicare Levy':       '$1,700.00',
    'Annual Take-Home Pay': '$67,012.00',
    'Employer Super':      '$9,775.00'
  }
);

// ---------------------------------------------------------------------------
// 2. income-tax
// Inputs: taxableIncome=100000, residency=resident, financialYear=2025-26
// Expected: tax = 4288 + (100000-45000)*0.30 = 20788
//           medicare = 100000 * 0.02 = 2000
//           afterTax = 100000 - 20788 - 2000 = 77212
// ---------------------------------------------------------------------------
testCalc(
  'income-tax',
  {
    taxableIncome: 100000,
    residency: 'resident',
    financialYear: '2025-26'
  },
  {
    'Income Tax':     '$20,788.00',
    'Medicare Levy':  '$2,000.00',
    'After-Tax Income': '$77,212.00'
  }
);

// ---------------------------------------------------------------------------
// 3. tax-withheld
// Inputs: grossPay=1500 (weekly), payFrequency=weekly, claimTaxFreeThreshold=yes
// Math: annualGross = 1500*52 = 78000
//       annualTax   = 4288 + (78000-45000)*0.30 = 14188
//       annualMed   = 78000 * 0.02 = 1560
//       taxPerWeek  = 14188/52 = 272.846...  → $272.85
//       medPerWeek  = 1560/52  = 30.00
//       netPay      = 1500 - 272.846... - 30 = 1197.15
// ---------------------------------------------------------------------------
testCalc(
  'tax-withheld',
  {
    grossPay: 1500,
    payFrequency: 'weekly',
    claimTaxFreeThreshold: 'yes'
  },
  {
    'Gross Pay':          '$1,500.00',
    'Annual Gross':       '$78,000.00',
    'Annual Tax':         '$14,188.00',
    'Net Pay':            '$1,197.15'
  }
);

// ---------------------------------------------------------------------------
// 4. tax-return-estimator
// Inputs: totalIncome=80000, deductions=5000, taxWithheld=0, privateHealthInsurance=no
// Math: taxableIncome = 75000
//       grossTax = 4288 + (75000-45000)*0.30 = 13288
//       lito: 75000 > 66667 → lito = 0
//       medicare = 75000 * 0.02 = 1500
//       netTax = 13288
//       totalOwing = 13288 + 1500 = 14788
//       paygWithheld = (4288+(80000-45000)*0.30) + 80000*0.02 = 14788+1600 = 16388
//       refund = 16388 - 14788 = 1600
// ---------------------------------------------------------------------------
testCalc(
  'tax-return-estimator',
  {
    totalIncome: 80000,
    deductions: 5000,
    taxWithheld: 0,
    privateHealthInsurance: 'no',
    helpDebt: 'no',
    lowIncomeOffset: 'auto'
  },
  {
    'Taxable Income':     '$75,000.00',
    'Net Tax Payable':    '$13,288.00',
    'Medicare Levy':      '$1,500.00',
    'Total Tax Owing':    '$14,788.00',
    'Estimated Tax Refund': '$1,600.00'
  }
);

// ---------------------------------------------------------------------------
// 5. medicare-levy
// Inputs: taxableIncome=85000, familyStatus=single, dependants=0, privateHealth=no
// Math: 85000 > 32500 → full levy = 85000 * 0.02 = 1700
//       surcharge: 85000 < 93001 → no surcharge (Tier 0)
//       total = 1700
// ---------------------------------------------------------------------------
testCalc(
  'medicare-levy',
  {
    taxableIncome: 85000,
    familyStatus: 'single',
    dependants: 0,
    privateHealth: 'no'
  },
  {
    'Medicare Levy (2%)':   '$1,700.00',
    'Total Medicare Costs': '$1,700.00',
    'Full Medicare levy of 2% applies': 'Full Medicare levy of 2% applies'
  }
);

// ---------------------------------------------------------------------------
// 6. home-office-expenses
// Inputs: hoursPerWeek=20, weeksPerYear=48, method=fixed
// Math: totalHours = 20 * 48 = 960
//       fixedDeduction = 960 * 0.67 = 643.20
//       taxSaving30 = 643.20 * 0.30 = 192.96
// ---------------------------------------------------------------------------
testCalc(
  'home-office-expenses',
  {
    hoursPerWeek: 20,
    weeksPerYear: 48,
    method: 'fixed'
  },
  {
    'Total Hours':      '960',
    'Total Deduction':  '$643.20',
    'At 30% marginal rate': '$192.96'
  }
);

// ---------------------------------------------------------------------------
// 7. study-loan-repayment
// Inputs: repaymentIncome=80000, helpBalance=25000
// Math: income 79347–84107 → rate 4%
//       annualRepayment = min(80000*0.04, 25000) = 3200
//       fortnightlyRepayment = 3200/26 ≈ 123.08
// ---------------------------------------------------------------------------
testCalc(
  'study-loan-repayment',
  {
    repaymentIncome: 80000,
    helpBalance: 25000,
    voluntaryRepayment: 0,
    incomeGrowth: 0
  },
  {
    'Annual Repayment':  '$3,200.00',
    'Per Fortnight':     '$123.08',
    'Repayment Rate':    '4.0%'
  }
);

// ---------------------------------------------------------------------------
// 8. super-guarantee
// Inputs: grossSalary=85000, payFrequency=annual
// Math: sgRate = 11.5%
//       annualSuper = 85000 * 0.115 = 9775
//       perQuarter  = 9775 / 4 = 2443.75
// ---------------------------------------------------------------------------
testCalc(
  'super-guarantee',
  {
    grossSalary: 85000,
    payFrequency: 'annual'
  },
  {
    'Annual Super Guarantee': '$9,775.00',
    'Per Quarter':            '$2,443.75',
    'SG Rate (2025-26)':      '11.5%'
  }
);

// ---------------------------------------------------------------------------
// 9. budget-planner
// Inputs: netIncome=5000, housing=1500, groceries=800 (others=0)
// Math: totalExpenses = 1500 + 800 = 2300
//       surplus = 5000 - 2300 = 2700
// ---------------------------------------------------------------------------
testCalc(
  'budget-planner',
  {
    netIncome: 5000,
    otherIncome: 0,
    housing: 1500,
    utilities: 0,
    groceries: 800,
    transport: 0,
    insurance: 0,
    entertainment: 0,
    subscriptions: 0,
    personalCare: 0,
    otherExpenses: 0
  },
  {
    'Total Income':    '$5,000.00',
    'Total Expenses':  '$2,300.00',
    'Surplus':         '$2,700.00'
  }
);

// ---------------------------------------------------------------------------
// 10. savings-goal
// Inputs: target=20000, currentSavings=5000, monthlyContribution=500, annualRate=5
// Math: monthly rate = 5/100/12 ≈ 0.004167
//       iterative compound: reaches $20000 after 28 months (2 years 4 months)
//       totalInterest ≈ $1,434.06
// ---------------------------------------------------------------------------
testCalc(
  'savings-goal',
  {
    target: 20000,
    currentSavings: 5000,
    monthlyContribution: 500,
    annualRate: 5,
    compounding: 'monthly'
  },
  {
    'Savings Goal':        '$20,000.00',
    'Monthly Contribution': '$500.00',
    'Time to Reach Goal':   '2 years 4 months'
  }
);

// ---------------------------------------------------------------------------
// 11. mortgage-repayment
// Inputs: loanAmount=500000, interestRate=6, loanTerm=30, repaymentFrequency=monthly
// Math: r = 6/100/12 = 0.005, n = 360
//       M = 500000 * (0.005 * 1.005^360) / (1.005^360 - 1) = 2997.75
//       totalRepaid ≈ 1079190.00, totalInterest ≈ 579190.95
// ---------------------------------------------------------------------------
testCalc(
  'mortgage-repayment',
  {
    loanAmount: 500000,
    interestRate: 6,
    loanTerm: 30,
    repaymentFrequency: 'monthly'
  },
  {
    'Monthly Repayment': '$2,997.75',
    'Loan Amount':       '$500,000.00',
    'Interest Rate':     '6% p.a.'
  }
);

// ---------------------------------------------------------------------------
// 12. borrowing-power
// Inputs: grossIncome=120000, partnerIncome=0, monthlyExpenses=2000,
//         existingLoans=0, creditCardLimits=0, dependants=0, interestRate=6.5, loanTerm=30
// Math: monthlyGross = 10000
//       taxRate = 0.22 (45001–135000 bracket)
//       monthlyNet = 10000 * 0.78 = 7800
//       livingExpenses = max(2000, 1500) = 2000
//       surplus = 7800 - 2000 = 5800
//       assessRate = max(0.065+0.03, 0.095) = 0.095
//       maxLoan = 5800 * PV annuity factor ≈ 689,774.75
// ---------------------------------------------------------------------------
testCalc(
  'borrowing-power',
  {
    grossIncome: 120000,
    partnerIncome: 0,
    monthlyExpenses: 2000,
    existingLoans: 0,
    creditCardLimits: 0,
    helpDebt: 'no',
    dependants: 0,
    interestRate: 6.5,
    loanTerm: 30
  },
  {
    'Estimated Borrowing Power': '$689,774.75',
    'Gross Monthly Income':      '$10,000.00',
    'Monthly Surplus':           '$5,800.00'
  }
);

// ---------------------------------------------------------------------------
// 13. stamp-duty-nsw
// Inputs: propertyValue=600000, propertyType=existing, firstHomeBuyer=no, foreignBuyer=no
// Math: 10617.50 + (600000-351000)*0.045 = 10617.50 + 11205 = 21822.50
// ---------------------------------------------------------------------------
testCalc(
  'stamp-duty-nsw',
  {
    propertyValue: 600000,
    propertyType: 'existing',
    firstHomeBuyer: 'no',
    foreignBuyer: 'no'
  },
  {
    'Total Stamp Duty (NSW)': '$21,822.50',
    'Base Transfer Duty':     '$21,822.50'
  }
);

// ---------------------------------------------------------------------------
// 14. stamp-duty-vic
// Inputs: propertyValue=750000, propertyType=existing, firstHomeBuyer=no, foreignBuyer=no
// Math: 2870 + (750000-130000)*0.06 = 2870 + 37200 = 40070
// ---------------------------------------------------------------------------
testCalc(
  'stamp-duty-vic',
  {
    propertyValue: 750000,
    propertyType: 'existing',
    firstHomeBuyer: 'no',
    foreignBuyer: 'no',
    principalResidence: 'no'
  },
  {
    'Total Stamp Duty (VIC)': '$40,070.00',
    'Base Transfer Duty':     '$40,070.00'
  }
);

// ---------------------------------------------------------------------------
// 15. stamp-duty-qld
// Inputs: propertyValue=600000, propertyType=existing, firstHomeBuyer=no, foreignBuyer=no
// Math base: 17325 + (600000-540000)*0.045 = 17325 + 2700 = 20025
//   Non-FHB, existing, value > 550000 → no home concession applies
//   Final duty = 20025
// ---------------------------------------------------------------------------
testCalc(
  'stamp-duty-qld',
  {
    propertyValue: 600000,
    propertyType: 'existing',
    firstHomeBuyer: 'no',
    foreignBuyer: 'no'
  },
  {
    'Total Transfer Duty (QLD)': '$20,025.00',
    'Base Transfer Duty':        '$20,025.00'
  }
);

// ---------------------------------------------------------------------------
// 16. stamp-duty-all-states
// Inputs: propertyValue=500000, propertyType=existing, firstHomeBuyer=no, foreignBuyer=no
// Math (all states, 500000):
//   NSW: 10617.50 + (500000-351000)*0.045 = 10617.50 + 6705 = 17322.50
//   VIC: 2870 + (500000-130000)*0.06 = 2870 + 22200 = 25070
//   QLD: 1050 + (500000-75000)*0.035 = 1050 + 14875 = 15925
//   ACT: 11780 + (500000-500000)*0.044 = 11780 (cheapest)
//   VIC = 25070 (most expensive)
// ---------------------------------------------------------------------------
testCalc(
  'stamp-duty-all-states',
  {
    propertyValue: 500000,
    state: 'all',
    propertyType: 'existing',
    firstHomeBuyer: 'no',
    foreignBuyer: 'no'
  },
  {
    'NSW duty':         '$17,322.50',
    'VIC duty':         '$25,070.00',
    'QLD duty':         '$15,925.00',
    'Cheapest ACT':     'ACT',
    'Most expensive':   'VIC'
  }
);

// ---------------------------------------------------------------------------
// 17. land-tax
// Inputs: landValue=1500000, state=nsw, primaryResidence=no
// Math: NSW threshold=$1,075,000
//       landTax = 100 + (1500000-1075000)*0.016 = 100 + 6800 = 6900
//       monthly = 6900/12 = 575
// ---------------------------------------------------------------------------
testCalc(
  'land-tax',
  {
    landValue: 1500000,
    state: 'nsw',
    primaryResidence: 'no',
    entityType: 'individual'
  },
  {
    'Annual Land Tax':    '$6,900.00',
    'Per Month':          '$575.00',
    'Tax-Free Threshold': '$1,075,000.00'
  }
);

// ---------------------------------------------------------------------------
// 18. first-home-buyer-costs
// Inputs: purchasePrice=550000, state=QLD, depositPercent=10, firstHomeBuyer=yes (existing)
// Math: deposit = 55000, loan = 495000, LVR = 90%
//       QLD stamp duty (this calculator uses calculateStampDuty, no FHB concession):
//         17325 + (550000-540000)*0.045 = 17775
//       FHOG: QLD, firstHome=yes → $30,000 (getFHOG doesn't check propertyType)
//       LMI: LVR=90%, loan ≤ 500000 → rate 0.022
//         lmiEst = 495000 * 0.022 = 10890 (simple estimate, no stamp duty added here)
//       fixedCosts = 1500+500+350+50+200+250 = 2850, moving = 1500
//       totalUpfront = 55000 + 17775 + 10890 + 2850 + 1500 = 88015
//       netUpfront = 88015 - 30000 = 58015
// ---------------------------------------------------------------------------
testCalc(
  'first-home-buyer-costs',
  {
    purchasePrice: 550000,
    state: 'qld',
    depositPercent: 10,
    firstHomeBuyer: 'yes',
    propertyType: 'existing',
    includeMovingCosts: 'yes'
  },
  {
    'Total Cash Needed Upfront': '$58,015.00',
    'Deposit':                   '$55,000.00',
    'Stamp Duty (QLD)':          '$17,775.00',
    'First Home Owner Grant':    '-$30,000.00',
    'Loan Amount':               '$495,000.00',
    'Total Upfront Costs':       '$88,015.00'
  }
);

// ---------------------------------------------------------------------------
// 19. lvr
// Inputs: propertyValue=600000, loanAmount=480000
// Math: LVR = 480000/600000 * 100 = 80.0%
//       deposit = 120000 (20.0%)
//       zone = "Good" (exactly 80%)
// ---------------------------------------------------------------------------
testCalc(
  'lvr',
  {
    propertyValue: 600000,
    loanAmount: 480000,
    purpose: 'purchase'
  },
  {
    'LVR':          '80.0%',
    'Deposit':      '$120,000.00',
    'Zone':         'Good'
  }
);

// ---------------------------------------------------------------------------
// 20. lmi
// Inputs: propertyValue=600000, loanAmount=550000
// Math: LVR = 550000/600000 = 91.67%
//       deposit = 50000
//       loan=550000 ≤ 700000, LVR > 90 ≤ 95 → rate = 0.0420
//       lmiEstimate = 550000 * 0.0420 = 23100
//       lmiStampDuty = 23100 * 0.10 = 2310
//       totalLMI = 25410
// ---------------------------------------------------------------------------
testCalc(
  'lmi',
  {
    propertyValue: 600000,
    loanAmount: 550000,
    firstHomeBuyer: 'no',
    state: 'nsw'
  },
  {
    'LVR':                   '91.7%',
    'Estimated LMI Premium': '$23,100.00',
    'Total LMI Cost':        '$25,410.00'
  }
);

// ---------------------------------------------------------------------------
// 21. bmi
// Inputs: height=175, weight=75
// Math: BMI = 75 / (1.75^2) = 75 / 3.0625 = 24.49
//       category = Healthy Weight (18.5 ≤ BMI < 25)
//       healthyMin = 18.5 * 1.75^2 = 56.6 kg
//       healthyMax = 24.9 * 1.75^2 = 76.2 kg
// ---------------------------------------------------------------------------
testCalc(
  'bmi',
  {
    height: 175,
    weight: 75
  },
  {
    'BMI':      '24.5',
    'Category': 'Healthy Weight'
  }
);

// ---------------------------------------------------------------------------
// 22. daily-energy
// Inputs: age=30, gender=male, height=175, weight=75, activityLevel=moderate
// Math: BMR (Mifflin-St Jeor male) = 10*75 + 6.25*175 - 5*30 + 5
//                                   = 750 + 1093.75 - 150 + 5 = 1698.75 → rounds to 1699
//       TDEE = 1699 * 1.55 = 2633 (rounded)
// ---------------------------------------------------------------------------
testCalc(
  'daily-energy',
  {
    age: 30,
    gender: 'male',
    height: 175,
    weight: 75,
    activityLevel: 'moderate',
    formula: 'mifflin'
  },
  {
    'BMR':  '1699 cal/day',
    'TDEE': '2633 cal/day'
  }
);

// ---------------------------------------------------------------------------
// 23. calorie-intake
// Inputs: age=30, gender=male, height=175, weight=75, activityLevel=moderate, goal=maintain
// Math: BMR = 1699 (Mifflin-St Jeor male, same formula as daily-energy)
//       TDEE = 1699 * 1.55 = 2633
//       goal=maintain → targetCalories = TDEE = 2633
//       macros: protein 30%, carbs 40%, fat 30%
//       protein = 2633*0.30/4 = 197g
//       carbs   = 2633*0.40/4 = 263g
//       fat     = 2633*0.30/9 = 88g
// Note: gender is a select element in this calculator
// ---------------------------------------------------------------------------
testCalc(
  'calorie-intake',
  {
    age: 30,
    gender: 'male',
    height: 175,
    weight: 75,
    activityLevel: 'moderate',
    goal: 'maintain',
    macroSplit: 'balanced'
  },
  {
    'Daily Calorie Target': '2633 cal/day',
    'Goal':                 'Maintain Weight',
    'Protein':              '197g'
  }
);

// ---------------------------------------------------------------------------
// 24. pregnancy-due-date
// Inputs: method=lmp, date=2026-03-01
// Math: Naegele's rule = LMP + 280 days
//       2026-03-01 + 280 days = 2026-12-06
//       Today (2026-04-12) is 42 days after LMP → 6 weeks 0 days
//       Trimester: First (< 13 weeks)
// ---------------------------------------------------------------------------
testCalc(
  'pregnancy-due-date',
  {
    method: 'lmp',
    date: '2026-03-01',
    cycleLength: 28
  },
  {
    'Estimated Due Date':     '6 December 2026',
    'Current Gestational Age': '6 weeks, 0 days',
    'Current Trimester':       'First Trimester'
  }
);

// ---------------------------------------------------------------------------
// 25. age-calculator
// Inputs: dateOfBirth=1990-01-15
// Math (relative to 2026-04-12, today's date):
//   years = 36, months = 2, days = 28
//   (Mar 15 → Apr 12 = 28 days; Jan 15 + 2 full months = Mar 15; then to Apr 12 = 28 more days)
//   totalDays = floor((2026-04-12 - 1990-01-15) / 86400000) = 13236
//   totalWeeks = floor(13236 / 7) = 1890
// ---------------------------------------------------------------------------
testCalc(
  'age-calculator',
  {
    dateOfBirth: '1990-01-15',
    targetDate: ''
  },
  {
    'Your Age':    '36 years, 2 months, 28 days',
    'Total Days':  '13,236',
    'Total Weeks': '1,890'
  }
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('\n─────────────────────────────────────────────');
console.log(`Results: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);

if (errors.length > 0) {
  console.log('\nFailures:');
  errors.forEach(e => {
    console.log(`  • ${e.slug}: ${e.error}`);
  });
}

console.log('─────────────────────────────────────────────\n');

// Exit with non-zero code if any tests failed (useful for CI)
process.exit(fail > 0 ? 1 : 0);
