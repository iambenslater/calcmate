function calculate() {
  const adults = parseInt(document.getElementById('input-adults').value) || 0;
  const children = parseInt(document.getElementById('input-children').value) || 0;
  const teens = parseInt(document.getElementById('input-teens').value) || 0;

  const totalPeople = adults + children + teens;
  if (totalPeople === 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600 font-semibold">Please enter at least 1 person (adult, teen, or child).</p>';
    return;
  }

  // Read radio: budgetStyle
  let budgetStyle = 'moderate';
  const budgetInputs = document.querySelectorAll('input[name="input-budgetStyle"]');
  for (const input of budgetInputs) {
    if (input.checked) { budgetStyle = input.value; break; }
  }
  if (budgetInputs.length === 0) {
    const el = document.getElementById('input-budgetStyle');
    if (el) budgetStyle = el.value || 'moderate';
  }

  const dietaryNeeds = document.getElementById('input-dietaryNeeds').value || 'standard';
  const location = document.getElementById('input-location').value || 'metro';

  // Australian grocery cost benchmarks per person per week (2025-26)
  const rates = {
    adult:   { thrifty: 65, moderate: 95, comfortable: 135 },
    teen:    { thrifty: 70, moderate: 100, comfortable: 145 },
    child:   { thrifty: 45, moderate: 65, comfortable: 90 }
  };

  const adultRate = rates.adult[budgetStyle] || rates.adult.moderate;
  const teenRate = rates.teen[budgetStyle] || rates.teen.moderate;
  const childRate = rates.child[budgetStyle] || rates.child.moderate;

  const adultsCost = adults * adultRate;
  const teensCost = teens * teenRate;
  const childrenCost = children * childRate;
  const baseWeekly = adultsCost + teensCost + childrenCost;

  // Dietary adjustment
  const dietaryMultipliers = {
    standard: 1.0,
    vegetarian: 0.90,
    vegan: 0.85,
    'gluten-free': 1.20
  };
  const dietaryMult = dietaryMultipliers[dietaryNeeds] || 1.0;
  const dietaryLabel = dietaryNeeds === 'standard' ? 'None' :
    dietaryNeeds === 'vegetarian' ? '-10%' :
    dietaryNeeds === 'vegan' ? '-15%' :
    dietaryNeeds === 'gluten-free' ? '+20%' : 'None';

  // Location adjustment
  const locationMultipliers = {
    metro: 1.0,
    regional: 1.08,
    remote: 1.25
  };
  const locationMult = locationMultipliers[location] || 1.0;
  const locationLabel = location === 'metro' ? 'None' :
    location === 'regional' ? '+8%' :
    location === 'remote' ? '+25%' : 'None';

  const weekly = baseWeekly * dietaryMult * locationMult;
  const fortnightly = weekly * 2;
  const monthly = weekly * 4.33;
  const annual = weekly * 52;
  const daily = weekly / 7;
  const perPersonPerDay = daily / totalPeople;
  const perPersonPerWeek = weekly / totalPeople;

  function fmt(n) {
    return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Budget tips based on style
  let tips = '';
  if (budgetStyle === 'thrifty') {
    tips =
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Buy in bulk at Aldi or Costco for staples like rice, pasta, and canned goods</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Plan meals weekly and shop with a list to avoid impulse buys</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Use frozen vegetables \u2014 they are just as nutritious and last much longer</span>' +
      '</div>' +
      '<div class="flex justify-between py-2">' +
        '<span class="text-gray-600">Check half-price specials on the Coles and Woolworths apps before shopping</span>' +
      '</div>';
  } else if (budgetStyle === 'moderate') {
    tips =
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Mix store-brand staples with name-brand items you prefer for best value</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Batch cook on weekends to reduce midweek takeaway temptation</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Buy seasonal fruit and veg at local markets for better prices and freshness</span>' +
      '</div>' +
      '<div class="flex justify-between py-2">' +
        '<span class="text-gray-600">Freeze leftovers in portions for easy lunches throughout the week</span>' +
      '</div>';
  } else {
    tips =
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Shop at farmers markets for premium quality produce at fair prices</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Consider a meal kit service for variety without food waste</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Buy meat in bulk from a local butcher and freeze in meal-sized portions</span>' +
      '</div>' +
      '<div class="flex justify-between py-2">' +
        '<span class="text-gray-600">Invest in quality pantry staples \u2014 good olive oil, spices, and condiments elevate every meal</span>' +
      '</div>';
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML =
    '<div class="space-y-3">' +
      '<h3 class="font-semibold text-navy text-lg">Weekly Grocery Budget</h3>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Weekly</span>' +
        '<span class="font-semibold text-navy">' + fmt(weekly) + '</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Fortnightly</span>' +
        '<span class="font-semibold text-navy">' + fmt(fortnightly) + '</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Monthly</span>' +
        '<span class="font-semibold text-navy">' + fmt(monthly) + '</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Annual</span>' +
        '<span class="font-semibold text-navy">' + fmt(annual) + '</span>' +
      '</div>' +
    '</div>' +

    '<div class="space-y-3 mt-6">' +
      '<h3 class="font-semibold text-navy text-lg">Cost Breakdown</h3>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Adults (' + adults + ') weekly cost</span>' +
        '<span class="font-semibold text-navy">' + fmt(adultsCost) + '</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Teens (' + teens + ') weekly cost</span>' +
        '<span class="font-semibold text-navy">' + fmt(teensCost) + '</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Children (' + children + ') weekly cost</span>' +
        '<span class="font-semibold text-navy">' + fmt(childrenCost) + '</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Dietary adjustment (' + dietaryNeeds + ')</span>' +
        '<span class="font-semibold text-navy">' + dietaryLabel + '</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Location adjustment (' + location + ')</span>' +
        '<span class="font-semibold text-navy">' + locationLabel + '</span>' +
      '</div>' +
    '</div>' +

    '<div class="space-y-3 mt-6">' +
      '<h3 class="font-semibold text-navy text-lg">Per Person</h3>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Daily cost per person</span>' +
        '<span class="font-semibold text-navy">' + fmt(perPersonPerDay) + '</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Weekly cost per person</span>' +
        '<span class="font-semibold text-navy">' + fmt(perPersonPerWeek) + '</span>' +
      '</div>' +
    '</div>' +

    '<div class="space-y-3 mt-6">' +
      '<h3 class="font-semibold text-navy text-lg">Budget Tips</h3>' +
      tips +
    '</div>';
}

function getTLDR() {
  const adults = parseInt(document.getElementById('input-adults').value) || 0;
  const children = parseInt(document.getElementById('input-children').value) || 0;
  const teens = parseInt(document.getElementById('input-teens').value) || 0;

  const totalPeople = adults + children + teens;
  if (totalPeople === 0) return 'Please enter at least 1 person to calculate a grocery budget.';

  let budgetStyle = 'moderate';
  const budgetInputs = document.querySelectorAll('input[name="input-budgetStyle"]');
  for (const input of budgetInputs) {
    if (input.checked) { budgetStyle = input.value; break; }
  }
  if (budgetInputs.length === 0) {
    const el = document.getElementById('input-budgetStyle');
    if (el) budgetStyle = el.value || 'moderate';
  }

  const dietaryNeeds = document.getElementById('input-dietaryNeeds').value || 'standard';
  const location = document.getElementById('input-location').value || 'metro';

  const rates = {
    adult:   { thrifty: 65, moderate: 95, comfortable: 135 },
    teen:    { thrifty: 70, moderate: 100, comfortable: 145 },
    child:   { thrifty: 45, moderate: 65, comfortable: 90 }
  };

  const baseWeekly = (adults * (rates.adult[budgetStyle] || 95)) +
                     (teens * (rates.teen[budgetStyle] || 100)) +
                     (children * (rates.child[budgetStyle] || 65));

  const dietaryMultipliers = { standard: 1.0, vegetarian: 0.90, vegan: 0.85, 'gluten-free': 1.20 };
  const locationMultipliers = { metro: 1.0, regional: 1.08, remote: 1.25 };

  const weekly = baseWeekly * (dietaryMultipliers[dietaryNeeds] || 1.0) * (locationMultipliers[location] || 1.0);
  const annual = weekly * 52;

  const familyDesc = totalPeople === 1 ? '1 person' : 'a family of ' + totalPeople;
  const locationDesc = location === 'metro' ? 'metro' : location === 'regional' ? 'regional' : 'remote';

  return familyDesc.charAt(0).toUpperCase() + familyDesc.slice(1) +
    ' in ' + locationDesc + ' Australia on a ' + budgetStyle +
    ' budget should expect to spend around $' +
    Math.round(weekly).toLocaleString() + ' per week ($' +
    Math.round(annual).toLocaleString() + '/year) on groceries.';
}
