function calculate() {
  const householdSize = parseFloat(document.getElementById('input-householdSize').value) || 0;
  const mealsPerWeek = parseFloat(document.getElementById('input-mealsPerWeek').value) || 0;
  const homeCookCost = parseFloat(document.getElementById('input-homeCookCost').value) || 12;
  const mealKitCost = parseFloat(document.getElementById('input-mealKitCost').value) || 9.50;
  const takeawayCost = parseFloat(document.getElementById('input-takeawayCost').value) || 18;
  const homeCookMeals = parseFloat(document.getElementById('input-homeCookMeals').value) || 0;
  const mealKitMeals = parseFloat(document.getElementById('input-mealKitMeals').value) || 0;
  const takeawayMeals = parseFloat(document.getElementById('input-takeawayMeals').value) || 0;

  const resultsEl = document.getElementById('results-content');
  const containerEl = document.getElementById('calc-results');

  if (householdSize <= 0 || mealsPerWeek <= 0) {
    containerEl.classList.remove('hidden');
    resultsEl.innerHTML = '<div class="result-row"><span class="result-label" style="color:var(--error,#e53e3e)">Household size and meals per week must be greater than zero.</span></div>';
    return;
  }

  const totalMealsSplit = homeCookMeals + mealKitMeals + takeawayMeals;
  const mealMismatch = totalMealsSplit !== mealsPerWeek;

  // Weekly costs
  const weeklyHomeCook = homeCookMeals * homeCookCost;
  const weeklyMealKit = mealKitMeals * mealKitCost * householdSize;
  const weeklyTakeaway = takeawayMeals * takeawayCost * householdSize;
  const weeklyTotal = weeklyHomeCook + weeklyMealKit + weeklyTakeaway;

  const monthlyTotal = weeklyTotal * 4.33;
  const annualTotal = weeklyTotal * 52;
  const avgCostPerMeal = mealsPerWeek > 0 ? weeklyTotal / mealsPerWeek : 0;

  // Percentages
  const homePct = weeklyTotal > 0 ? ((weeklyHomeCook / weeklyTotal) * 100).toFixed(1) : '0.0';
  const kitPct = weeklyTotal > 0 ? ((weeklyMealKit / weeklyTotal) * 100).toFixed(1) : '0.0';
  const takeawayPct = weeklyTotal > 0 ? ((weeklyTakeaway / weeklyTotal) * 100).toFixed(1) : '0.0';

  // Comparison scenarios
  const allHomeCookedWeekly = mealsPerWeek * homeCookCost;
  const allMealKitsWeekly = mealsPerWeek * mealKitCost * householdSize;
  const allTakeawayWeekly = mealsPerWeek * takeawayCost * householdSize;

  // Savings
  const annualSavings = annualTotal - (allHomeCookedWeekly * 52);

  function fmt(val) {
    return '$' + val.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function row(label, value) {
    return '<div class="flex justify-between py-2 border-b border-gray-100">' +
      '<span class="text-gray-600">' + label + '</span>' +
      '<span class="font-semibold text-navy">' + value + '</span>' +
      '</div>';
  }

  var warningHtml = '';
  if (mealMismatch) {
    warningHtml = '<div class="py-2 px-3 mb-3 rounded" style="background:#fef3cd;border:1px solid #f0d361;color:#856404;font-size:0.9rem;">Note: Your meal split (' + totalMealsSplit + ' meals) doesn\'t add up to your total meals per week (' + mealsPerWeek + '). Results are based on the split you entered.</div>';
  }

  var html = warningHtml;

  // Section 1: Your Current Mix
  html += '<h3 class="text-lg font-semibold text-navy mb-2 mt-4">Your Current Mix</h3>';
  html += '<div class="space-y-3">';
  html += row('Weekly total', fmt(weeklyTotal));
  html += row('Monthly total', fmt(monthlyTotal));
  html += row('Annual total', fmt(annualTotal));
  html += row('Average cost per meal', fmt(avgCostPerMeal));
  html += '</div>';

  // Section 2: Cost Breakdown
  html += '<h3 class="text-lg font-semibold text-navy mb-2 mt-6">Cost Breakdown</h3>';
  html += '<div class="space-y-3">';
  html += row('Home cooking weekly', fmt(weeklyHomeCook) + ' (' + homePct + '%)');
  html += row('Meal kits weekly', fmt(weeklyMealKit) + ' (' + kitPct + '%)');
  html += row('Takeaway weekly', fmt(weeklyTakeaway) + ' (' + takeawayPct + '%)');
  html += '</div>';

  // Section 3: Comparison Scenarios
  html += '<h3 class="text-lg font-semibold text-navy mb-2 mt-6">Comparison Scenarios</h3>';
  html += '<div class="space-y-3">';
  html += row('If all home-cooked (weekly)', fmt(allHomeCookedWeekly));
  html += row('If all meal kits (weekly)', fmt(allMealKitsWeekly));
  html += row('If all takeaway (weekly)', fmt(allTakeawayWeekly));
  html += '</div>';

  // Section 4: Potential Annual Savings
  html += '<h3 class="text-lg font-semibold text-navy mb-2 mt-6">Potential Annual Savings</h3>';
  html += '<div class="space-y-3">';
  if (annualSavings > 0) {
    html += row('Switching fully to home cooking', fmt(annualSavings) + '/year');
  } else {
    html += row('Switching fully to home cooking', 'You\'re already at the lowest cost mix!');
  }
  html += '</div>';

  resultsEl.innerHTML = html;
  containerEl.classList.remove('hidden');
}

function getTLDR() {
  var householdSize = parseFloat(document.getElementById('input-householdSize').value) || 0;
  var mealsPerWeek = parseFloat(document.getElementById('input-mealsPerWeek').value) || 0;
  var homeCookCost = parseFloat(document.getElementById('input-homeCookCost').value) || 12;
  var mealKitCost = parseFloat(document.getElementById('input-mealKitCost').value) || 9.50;
  var takeawayCost = parseFloat(document.getElementById('input-takeawayCost').value) || 18;
  var homeCookMeals = parseFloat(document.getElementById('input-homeCookMeals').value) || 0;
  var mealKitMeals = parseFloat(document.getElementById('input-mealKitMeals').value) || 0;
  var takeawayMeals = parseFloat(document.getElementById('input-takeawayMeals').value) || 0;

  if (householdSize <= 0 || mealsPerWeek <= 0) {
    return 'Please enter valid household size and meals per week to see your summary.';
  }

  var weeklyHomeCook = homeCookMeals * homeCookCost;
  var weeklyMealKit = mealKitMeals * mealKitCost * householdSize;
  var weeklyTakeaway = takeawayMeals * takeawayCost * householdSize;
  var weeklyTotal = weeklyHomeCook + weeklyMealKit + weeklyTakeaway;
  var annualTotal = weeklyTotal * 52;

  var allHomeCookedWeekly = mealsPerWeek * homeCookCost;
  var annualSavings = annualTotal - (allHomeCookedWeekly * 52);

  function fmt(val) {
    return '$' + Math.round(val).toLocaleString('en-AU');
  }

  var summary = 'Your household of ' + householdSize + ' spends approximately ' + fmt(weeklyTotal) + ' per week on meals (' + fmt(annualTotal) + '/year).';

  if (annualSavings > 0) {
    summary += ' Switching entirely to home cooking could save you ' + fmt(annualSavings) + ' per year.';
  } else {
    summary += ' Your current mix is already cost-efficient — you\'re spending at or below the all-home-cooked baseline.';
  }

  return summary;
}
