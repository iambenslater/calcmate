function calculate() {
  var nightsInput = document.getElementById('input-nights');
  var holidayDiffEl = document.querySelector('input[name="input-holiday-different"]:checked');
  var holidayNightsInput = document.getElementById('input-holiday-nights');
  var holidayWeeksInput = document.getElementById('input-holiday-weeks');

  if (!nightsInput || nightsInput.value === '') {
    showResults('<p style="color: #dc2626;">Please select the number of nights per fortnight.</p>');
    return;
  }

  var termNights = parseInt(nightsInput.value) || 0;
  var holidayDifferent = holidayDiffEl ? holidayDiffEl.value === 'yes' : false;
  var holidayNights = holidayNightsInput ? (parseInt(holidayNightsInput.value) || 0) : termNights;
  var holidayWeeks = holidayWeeksInput ? (parseFloat(holidayWeeksInput.value) || 0) : 0;

  // Care percentage lookup table (Services Australia)
  var careTable = [
    { nights: 0,  pct: 0,   level: 'No care',            costPct: 0 },
    { nights: 1,  pct: 7,   level: 'Below regular care',  costPct: 0 },
    { nights: 2,  pct: 14,  level: 'Regular care',         costPct: 24 },
    { nights: 3,  pct: 21,  level: 'Regular care',         costPct: 24 },
    { nights: 4,  pct: 29,  level: 'Regular care',         costPct: 24 },
    { nights: 5,  pct: 36,  level: 'Shared care',          costPct: 25 },
    { nights: 6,  pct: 43,  level: 'Shared care',          costPct: 33 },
    { nights: 7,  pct: 50,  level: 'Shared care',          costPct: 50 },
    { nights: 8,  pct: 57,  level: 'Shared care',          costPct: 67 },
    { nights: 9,  pct: 64,  level: 'Shared care',          costPct: 75 },
    { nights: 10, pct: 71,  level: 'Primary care',         costPct: 76 },
    { nights: 11, pct: 79,  level: 'Primary care',         costPct: 76 },
    { nights: 12, pct: 86,  level: 'Primary care',         costPct: 76 },
    { nights: 13, pct: 93,  level: 'Above primary care',   costPct: 100 },
    { nights: 14, pct: 100, level: 'Above primary care',   costPct: 100 }
  ];

  var effectiveNights = termNights;
  var blendedHtml = '';

  if (holidayDifferent && holidayWeeks > 0) {
    var termFortnights = (52 - holidayWeeks) / 2;
    var holidayFortnights = holidayWeeks / 2;
    var totalNightsYear = (termNights * termFortnights) + (holidayNights * holidayFortnights);
    var rawEffective = totalNightsYear / 26.07;
    effectiveNights = Math.round(rawEffective);
    if (effectiveNights > 14) effectiveNights = 14;
    if (effectiveNights < 0) effectiveNights = 0;

    blendedHtml = '' +
      '<div style="margin-top: 1rem; padding: 1rem; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #2C3520;">' +
        '<strong style="color: #2C3520;">Holiday Blending Calculation</strong>' +
        '<div style="margin-top: 0.5rem; font-size: 0.9em;">' +
          '<div class="result-row"><span class="result-label">Term nights per fortnight</span><span class="result-value">' + termNights + '</span></div>' +
          '<div class="result-row"><span class="result-label">Holiday nights per fortnight</span><span class="result-value">' + holidayNights + '</span></div>' +
          '<div class="result-row"><span class="result-label">Holiday weeks per year</span><span class="result-value">' + holidayWeeks + '</span></div>' +
          '<div class="result-row"><span class="result-label">Term fortnights</span><span class="result-value">' + termFortnights.toFixed(1) + '</span></div>' +
          '<div class="result-row"><span class="result-label">Holiday fortnights</span><span class="result-value">' + holidayFortnights.toFixed(1) + '</span></div>' +
          '<div class="result-row"><span class="result-label">Total nights per year</span><span class="result-value">' + totalNightsYear.toFixed(0) + '</span></div>' +
          '<div class="result-row" style="font-weight: bold;"><span class="result-label">Effective nights/fortnight</span><span class="result-value">' + rawEffective.toFixed(2) + ' \u2192 ' + effectiveNights + '</span></div>' +
        '</div>' +
      '</div>';
  }

  var row = careTable[effectiveNights];
  var yourPct = row.pct;
  var otherPct = 100 - yourPct;
  var nightsPerYear = Math.round(effectiveNights * 26.07);

  // Determine level colour
  var levelColour = '#2C3520';
  if (row.level === 'No care' || row.level === 'Below regular care') levelColour = '#dc2626';
  else if (row.level === 'Regular care') levelColour = '#ea580c';
  else if (row.level === 'Shared care') levelColour = '#16a34a';
  else if (row.level === 'Primary care' || row.level === 'Above primary care') levelColour = '#2C3520';

  // Visual bar
  var barHtml = '' +
    '<div style="margin: 1rem 0;">' +
      '<div style="display: flex; justify-content: space-between; font-size: 0.85em; margin-bottom: 4px;">' +
        '<span style="color: #2C3520; font-weight: 600;">You: ' + yourPct + '%</span>' +
        '<span style="color: #BFA956; font-weight: 600;">Other parent: ' + otherPct + '%</span>' +
      '</div>' +
      '<div style="display: flex; height: 32px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">' +
        '<div style="width: ' + yourPct + '%; background: #2C3520; transition: width 0.3s;"></div>' +
        '<div style="width: ' + otherPct + '%; background: #BFA956; transition: width 0.3s;"></div>' +
      '</div>' +
    '</div>';

  // Reference table
  var tableHtml = '' +
    '<div style="margin-top: 1.5rem; border-top: 2px solid #e5e7eb; padding-top: 0.75rem;">' +
      '<strong>Services Australia Care Percentage Table</strong>' +
      '<div style="overflow-x: auto; margin-top: 0.5rem;">' +
        '<table style="width: 100%; border-collapse: collapse; font-size: 0.85em;">' +
          '<thead><tr style="background: #2C3520; color: #fff;">' +
            '<th style="padding: 6px 8px; text-align: left;">Nights</th>' +
            '<th style="padding: 6px 8px; text-align: right;">Care %</th>' +
            '<th style="padding: 6px 8px; text-align: left;">Level</th>' +
            '<th style="padding: 6px 8px; text-align: right;">Cost %</th>' +
          '</tr></thead><tbody>';

  for (var i = 0; i < careTable.length; i++) {
    var r = careTable[i];
    var isActive = r.nights === effectiveNights;
    var rowStyle = isActive ? 'background: #fffbeb; font-weight: bold; border-left: 3px solid #BFA956;' : '';
    tableHtml += '<tr style="' + rowStyle + ' border-bottom: 1px solid #e5e7eb;">' +
      '<td style="padding: 6px 8px;">' + r.nights + '</td>' +
      '<td style="padding: 6px 8px; text-align: right;">' + r.pct + '%</td>' +
      '<td style="padding: 6px 8px;">' + r.level + '</td>' +
      '<td style="padding: 6px 8px; text-align: right;">' + r.costPct + '%</td>' +
      '</tr>';
  }
  tableHtml += '</tbody></table></div></div>';

  // Impact notes
  var impactHtml = '<div style="margin-top: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">' +
    '<strong style="color: #2C3520;">What This Means</strong><ul style="margin: 0.5rem 0 0 1.2rem; padding: 0;">';

  if (yourPct < 14) {
    impactHtml += '<li>With less than 14% care (below regular), you have no cost percentage applied and may owe the full child support amount based on income.</li>';
    impactHtml += '<li>You are unlikely to receive Family Tax Benefit (FTB) for the child.</li>';
  } else if (yourPct >= 14 && yourPct < 35) {
    impactHtml += '<li>With regular care (14\u201334%), a 24% cost percentage is applied. The other parent is considered the primary carer for child support purposes.</li>';
    impactHtml += '<li>You may receive a small share of Family Tax Benefit (FTB).</li>';
  } else if (yourPct >= 35 && yourPct <= 65) {
    impactHtml += '<li>With shared care (35\u201365%), both parents\u2019 incomes are assessed and the cost percentage scales with your care share.</li>';
    impactHtml += '<li>Both parents may receive a proportional share of Family Tax Benefit (FTB).</li>';
    impactHtml += '<li>At 50/50 care, child support may still be payable if there is an income difference.</li>';
  } else if (yourPct > 65 && yourPct < 87) {
    impactHtml += '<li>With primary care (above 65%), the other parent\u2019s cost percentage is capped at 76%. You are likely the receiving parent for child support.</li>';
    impactHtml += '<li>You will receive the majority of Family Tax Benefit (FTB).</li>';
  } else {
    impactHtml += '<li>With above primary care (87%+), the other parent bears 100% of the cost percentage. You are the receiving parent for child support.</li>';
    impactHtml += '<li>You will receive all Family Tax Benefit (FTB) for the child.</li>';
  }
  impactHtml += '</ul></div>';

  var html = '' +
    '<div class="result-row" style="font-size: 1.2em; font-weight: bold;">' +
      '<span class="result-label">Your Care Percentage</span>' +
      '<span class="result-value" style="color: #2C3520;">' + yourPct + '%</span>' +
    '</div>' +
    '<div class="result-row">' +
      '<span class="result-label">Other Parent\u2019s Care Percentage</span>' +
      '<span class="result-value">' + otherPct + '%</span>' +
    '</div>' +
    '<div class="result-row">' +
      '<span class="result-label">Care Level</span>' +
      '<span class="result-value" style="color: ' + levelColour + '; font-weight: bold;">' + row.level + '</span>' +
    '</div>' +
    '<div class="result-row">' +
      '<span class="result-label">Cost Percentage (Child Support)</span>' +
      '<span class="result-value">' + row.costPct + '%</span>' +
    '</div>' +
    '<div class="result-row">' +
      '<span class="result-label">Approximate Nights per Year</span>' +
      '<span class="result-value">' + nightsPerYear + ' of 365</span>' +
    '</div>' +
    barHtml +
    blendedHtml +
    tableHtml +
    impactHtml +
    '<p style="font-size: 0.8em; color: #6b7280; margin-top: 1rem;">Based on Services Australia care percentage guidelines. This is an estimate \u2014 actual assessments may vary. Speak to Services Australia or a family lawyer for your specific situation.</p>';

  showResults(html);
}

function showResults(html) {
  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');
  contentDiv.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

function getTLDR() {
  var nightsInput = document.getElementById('input-nights');
  if (!nightsInput || nightsInput.value === '') return '';

  var careTable = [0, 7, 14, 21, 29, 36, 43, 50, 57, 64, 71, 79, 86, 93, 100];
  var levels = ['No care', 'Below regular care', 'Regular care', 'Regular care', 'Regular care', 'Shared care', 'Shared care', 'Shared care', 'Shared care', 'Shared care', 'Primary care', 'Primary care', 'Primary care', 'Above primary care', 'Above primary care'];

  var nights = parseInt(nightsInput.value) || 0;
  var holidayDiffEl = document.querySelector('input[name="input-holiday-different"]:checked');
  var holidayDifferent = holidayDiffEl ? holidayDiffEl.value === 'yes' : false;

  if (holidayDifferent) {
    var holidayNights = parseInt((document.getElementById('input-holiday-nights') || {}).value) || 0;
    var holidayWeeks = parseFloat((document.getElementById('input-holiday-weeks') || {}).value) || 0;
    if (holidayWeeks > 0) {
      var termFn = (52 - holidayWeeks) / 2;
      var holFn = holidayWeeks / 2;
      var total = (nights * termFn) + (holidayNights * holFn);
      nights = Math.round(total / 26.07);
      if (nights > 14) nights = 14;
      if (nights < 0) nights = 0;
    }
  }

  return nights + ' nights/fortnight = ' + careTable[nights] + '% care (' + levels[nights] + ')';
}
