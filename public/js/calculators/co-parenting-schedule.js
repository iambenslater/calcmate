function calculate() {
  var scheduleInput = document.getElementById('input-schedule');
  if (!scheduleInput || !scheduleInput.value) {
    showResults('<p style="color: #dc2626;">Please select a parenting schedule.</p>');
    return;
  }

  var selected = scheduleInput.value;

  // Care percentage lookup (same as Services Australia table)
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

  var schedules = {
    '7-7':     { label: 'Week on / week off',              p1: 7,  p2: 7,  changeovers: 2, longestP1: '7 days', longestP2: '7 days', desc: 'Alternating full weeks. Simple, consistent, and easy for everyone to remember. Works well for school-age children who can handle a full week away from each parent.' },
    '5-2-2-5': { label: '5-2-2-5 split',                   p1: 7,  p2: 7,  changeovers: 4, longestP1: '5 days', longestP2: '5 days', desc: 'Shorter stretches with more changeovers. No child goes more than 5 days without seeing each parent. Popular for younger children or families who live close together.' },
    '4-3':     { label: '4-3 alternating split',            p1: 8,  p2: 6,  changeovers: 2, longestP1: '4 days', longestP2: '4 days', desc: 'One parent gets 4 days, the other gets 3, alternating each week. Good for younger kids who benefit from shorter stretches. Results in a 57/43 split.' },
    '10-4':    { label: 'Every other weekend',              p1: 10, p2: 4,  changeovers: 2, longestP1: '10 days', longestP2: '10 days', desc: 'Traditional arrangement where one parent has weekdays and the other has every second weekend (Fri\u2013Sun). Common in court orders but means long stretches away from the weekend parent.' },
    '9-5':     { label: 'Every other weekend + midweek',    p1: 9,  p2: 5,  changeovers: 4, longestP1: '5 days', longestP2: '5 days', desc: 'Adds a midweek overnight to the standard weekend schedule. Reduces the longest time away from the non-primary parent to 5 days.' },
    '8-6':     { label: '60/40 split',                      p1: 8,  p2: 6,  changeovers: 3, longestP1: 'varies', longestP2: 'varies', desc: 'A flexible 60/40 arrangement that can be structured in several ways. Often used as a step toward equal time or when one parent works weekends.' },
    '12-2':    { label: 'Alternate weekends only',          p1: 12, p2: 2,  changeovers: 2, longestP1: '12 days', longestP2: '12 days', desc: 'One parent has primary care with the other having alternating weekends only. Common for very young children or where there are distance/logistic constraints.' },
    '13-1':    { label: 'Primary with one overnight',       p1: 13, p2: 1,  changeovers: 2, longestP1: '13 days', longestP2: '13 days', desc: 'Minimal time with the second parent \u2014 just one overnight per fortnight. Sometimes used as a starting point for reunification or where safety concerns limit contact.' }
  };

  // Calendar pattern for the 2-week visual grid
  // P1 = 1, P2 = 2. Each array is 14 days (Mon-Sun x 2 weeks)
  var calendarPatterns = {
    '7-7':     [1,1,1,1,1,1,1, 2,2,2,2,2,2,2],
    '5-2-2-5': [1,1,1,1,1,2,2, 2,2,2,2,2,1,1],
    '4-3':     [1,1,1,1,2,2,2, 2,2,2,2,1,1,1],
    '10-4':    [1,1,1,1,1,2,2, 1,1,1,1,1,1,1],
    '9-5':     [1,1,1,2,1,2,2, 1,1,1,2,1,1,1],
    '8-6':     [1,1,1,1,2,2,2, 1,1,1,1,1,2,2],
    '12-2':    [1,1,1,1,1,1,1, 1,1,1,1,1,2,2],
    '13-1':    [1,1,1,1,1,1,1, 1,1,1,1,1,1,2]
  };

  var s = schedules[selected];
  if (!s) {
    showResults('<p style="color: #dc2626;">Unknown schedule selected.</p>');
    return;
  }

  var p1Care = careTable[s.p1];
  var p2Care = careTable[s.p2];

  // Calendar visual
  var pattern = calendarPatterns[selected];
  var dayLabels = ['M','T','W','T','F','S','S'];
  var calHtml = '<div style="margin: 1rem 0;">' +
    '<div style="display: grid; grid-template-columns: auto repeat(7, 1fr); gap: 2px; max-width: 350px;">';

  // Header row
  calHtml += '<div style="font-size: 0.75em; color: #6b7280; padding: 4px; text-align: center; font-weight: 600;">Wk</div>';
  for (var d = 0; d < 7; d++) {
    calHtml += '<div style="font-size: 0.75em; color: #6b7280; padding: 4px; text-align: center; font-weight: 600;">' + dayLabels[d] + '</div>';
  }

  // Week 1
  calHtml += '<div style="font-size: 0.75em; color: #6b7280; padding: 6px 4px; text-align: center;">1</div>';
  for (var i = 0; i < 7; i++) {
    var bg = pattern[i] === 1 ? '#2C3520' : '#BFA956';
    var fg = pattern[i] === 1 ? '#fff' : '#2C3520';
    calHtml += '<div style="background: ' + bg + '; color: ' + fg + '; padding: 6px 4px; text-align: center; border-radius: 4px; font-size: 0.8em; font-weight: 600;">P' + pattern[i] + '</div>';
  }

  // Week 2
  calHtml += '<div style="font-size: 0.75em; color: #6b7280; padding: 6px 4px; text-align: center;">2</div>';
  for (var j = 7; j < 14; j++) {
    var bg2 = pattern[j] === 1 ? '#2C3520' : '#BFA956';
    var fg2 = pattern[j] === 1 ? '#fff' : '#2C3520';
    calHtml += '<div style="background: ' + bg2 + '; color: ' + fg2 + '; padding: 6px 4px; text-align: center; border-radius: 4px; font-size: 0.8em; font-weight: 600;">P' + pattern[j] + '</div>';
  }
  calHtml += '</div>';

  // Legend
  calHtml += '<div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.8em;">' +
    '<span><span style="display: inline-block; width: 12px; height: 12px; background: #2C3520; border-radius: 2px; vertical-align: middle; margin-right: 4px;"></span>Parent 1</span>' +
    '<span><span style="display: inline-block; width: 12px; height: 12px; background: #BFA956; border-radius: 2px; vertical-align: middle; margin-right: 4px;"></span>Parent 2</span>' +
    '</div></div>';

  // Care percentage bar
  var barHtml = '' +
    '<div style="margin: 1rem 0;">' +
      '<div style="display: flex; justify-content: space-between; font-size: 0.85em; margin-bottom: 4px;">' +
        '<span style="color: #2C3520; font-weight: 600;">P1: ' + p1Care.pct + '%</span>' +
        '<span style="color: #BFA956; font-weight: 600;">P2: ' + p2Care.pct + '%</span>' +
      '</div>' +
      '<div style="display: flex; height: 28px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">' +
        '<div style="width: ' + p1Care.pct + '%; background: #2C3520;"></div>' +
        '<div style="width: ' + p2Care.pct + '%; background: #BFA956;"></div>' +
      '</div>' +
    '</div>';

  // Detail card
  var isShared = (p1Care.pct >= 35 && p1Care.pct <= 65) || (p2Care.pct >= 35 && p2Care.pct <= 65);
  var sharedBadge = isShared ? '<span style="display: inline-block; background: #16a34a; color: #fff; font-size: 0.75em; padding: 2px 8px; border-radius: 12px; margin-left: 8px;">Shared Care</span>' : '';

  var detailHtml = '' +
    '<div style="font-size: 1.2em; font-weight: bold; color: #2C3520; margin-bottom: 0.5rem;">' + s.label + sharedBadge + '</div>' +
    calHtml +
    barHtml +
    '<div class="result-row"><span class="result-label">Parent 1 care</span><span class="result-value" style="font-weight: bold;">' + p1Care.pct + '% \u2014 ' + p1Care.level + '</span></div>' +
    '<div class="result-row"><span class="result-label">Parent 2 care</span><span class="result-value">' + p2Care.pct + '% \u2014 ' + p2Care.level + '</span></div>' +
    '<div class="result-row"><span class="result-label">P1 nights per fortnight</span><span class="result-value">' + s.p1 + '</span></div>' +
    '<div class="result-row"><span class="result-label">P2 nights per fortnight</span><span class="result-value">' + s.p2 + '</span></div>' +
    '<div class="result-row"><span class="result-label">Changeovers per fortnight</span><span class="result-value">' + s.changeovers + '</span></div>' +
    '<div class="result-row"><span class="result-label">Longest away from P1</span><span class="result-value">' + s.longestP1 + '</span></div>' +
    '<div class="result-row"><span class="result-label">Longest away from P2</span><span class="result-value">' + s.longestP2 + '</span></div>' +
    '<div style="margin-top: 1rem; padding: 0.75rem; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #2C3520;">' +
      '<p style="margin: 0; font-size: 0.9em;">' + s.desc + '</p>' +
    '</div>';

  // Comparison table of all schedules
  var compHtml = '' +
    '<div style="margin-top: 1.5rem; border-top: 2px solid #e5e7eb; padding-top: 0.75rem;">' +
      '<strong>All Schedules Comparison</strong>' +
      '<div style="overflow-x: auto; margin-top: 0.5rem;">' +
        '<table style="width: 100%; border-collapse: collapse; font-size: 0.8em;">' +
          '<thead><tr style="background: #2C3520; color: #fff;">' +
            '<th style="padding: 6px 8px; text-align: left;">Schedule</th>' +
            '<th style="padding: 6px 8px; text-align: center;">P1</th>' +
            '<th style="padding: 6px 8px; text-align: center;">P2</th>' +
            '<th style="padding: 6px 8px; text-align: center;">P1 Care %</th>' +
            '<th style="padding: 6px 8px; text-align: center;">P2 Care %</th>' +
            '<th style="padding: 6px 8px; text-align: center;">Level</th>' +
            '<th style="padding: 6px 8px; text-align: center;">Changeovers</th>' +
          '</tr></thead><tbody>';

  var scheduleKeys = ['7-7', '5-2-2-5', '4-3', '10-4', '9-5', '8-6', '12-2', '13-1'];
  for (var k = 0; k < scheduleKeys.length; k++) {
    var key = scheduleKeys[k];
    var sch = schedules[key];
    var p1c = careTable[sch.p1];
    var p2c = careTable[sch.p2];
    var isActive = key === selected;
    var rowStyle = isActive ? 'background: #fffbeb; font-weight: bold; border-left: 3px solid #BFA956;' : '';
    var sharedTag = (p1c.pct >= 35 && p1c.pct <= 65) ? ' \u2705' : '';
    compHtml += '<tr style="' + rowStyle + ' border-bottom: 1px solid #e5e7eb;">' +
      '<td style="padding: 6px 8px;">' + sch.label + '</td>' +
      '<td style="padding: 6px 8px; text-align: center;">' + sch.p1 + '</td>' +
      '<td style="padding: 6px 8px; text-align: center;">' + sch.p2 + '</td>' +
      '<td style="padding: 6px 8px; text-align: center;">' + p1c.pct + '%</td>' +
      '<td style="padding: 6px 8px; text-align: center;">' + p2c.pct + '%</td>' +
      '<td style="padding: 6px 8px; text-align: center;">' + p1c.level + sharedTag + '</td>' +
      '<td style="padding: 6px 8px; text-align: center;">' + sch.changeovers + '</td>' +
      '</tr>';
  }
  compHtml += '</tbody></table></div></div>';

  // Shared care note
  var noteHtml = '<div style="margin-top: 1rem; padding: 0.75rem; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">' +
    '<strong style="color: #2C3520;">Shared Care for Child Support</strong>' +
    '<p style="margin: 0.5rem 0 0; font-size: 0.85em;">Under Australian child support law, <strong>shared care</strong> applies when each parent has at least 35% care (5+ nights per fortnight). ' +
    'Only the <strong>7-7</strong>, <strong>5-2-2-5</strong>, and <strong>4-3</strong> schedules in this table qualify as shared care. ' +
    'With shared care, both parents\u2019 incomes are assessed and the cost percentage scales proportionally. ' +
    'Below shared care, the non-primary parent\u2019s cost percentage is lower (or zero), which significantly affects the child support amount.</p>' +
    '</div>';

  var html = detailHtml + compHtml + noteHtml +
    '<p style="font-size: 0.8em; color: #6b7280; margin-top: 1rem;">Care percentages based on Services Australia guidelines. Actual arrangements may vary \u2014 consult a family lawyer for advice specific to your situation.</p>';

  showResults(html);
}

function showResults(html) {
  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');
  contentDiv.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

function getTLDR() {
  var scheduleInput = document.getElementById('input-schedule');
  if (!scheduleInput || !scheduleInput.value) return '';

  var labels = {
    '7-7': 'Week on/week off', '5-2-2-5': '5-2-2-5 split', '4-3': '4-3 split',
    '10-4': 'Every other weekend', '9-5': 'Weekend + midweek', '8-6': '60/40 split',
    '12-2': 'Alternate weekends', '13-1': 'Primary + one overnight'
  };
  var p1nights = { '7-7': 7, '5-2-2-5': 7, '4-3': 8, '10-4': 10, '9-5': 9, '8-6': 8, '12-2': 12, '13-1': 13 };
  var carePcts = [0, 7, 14, 21, 29, 36, 43, 50, 57, 64, 71, 79, 86, 93, 100];

  var sel = scheduleInput.value;
  var n = p1nights[sel] || 0;
  return (labels[sel] || sel) + ': P1 gets ' + carePcts[n] + '% care (' + n + '/14 nights)';
}
