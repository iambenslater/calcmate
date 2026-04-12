function calculate() {
  const age = parseInt(document.getElementById('input-age').value) || 0;
  const weight = parseFloat(document.getElementById('input-weight').value) || 0;
  const height = parseFloat(document.getElementById('input-height').value) || 0;
  const activityLevel = document.getElementById('input-activityLevel').value || 'moderate';
  const goal = document.getElementById('input-goal').value || 'maintain';

  // Gender — radio buttons
  let gender = 'male';
  const genderInputs = document.querySelectorAll('input[name="input-gender"]');
  for (const input of genderInputs) {
    if (input.checked) { gender = input.value; break; }
  }
  if (genderInputs.length === 0) {
    const el = document.getElementById('input-gender');
    if (el) gender = el.value || 'male';
  }

  if (age <= 0 || weight <= 0 || height <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter valid values.</p>';
    return;
  }

  // Mifflin-St Jeor BMR
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // TDEE
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9
  };
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  const tdee = bmr * multiplier;

  // Goal adjustment
  let targetCalories;
  if (goal === 'lose') {
    targetCalories = tdee - 500;
  } else if (goal === 'gain') {
    targetCalories = tdee + 400;
  } else {
    targetCalories = tdee;
  }

  // Macros
  const proteinG = Math.round(2 * weight);
  const proteinCal = proteinG * 4;
  const fatCal = targetCalories * 0.25;
  const fatG = Math.round(fatCal / 9);
  const carbsCal = targetCalories - proteinCal - fatCal;
  const carbsG = Math.round(carbsCal / 4);

  const proteinPct = Math.round((proteinCal / targetCalories) * 100);
  const fatPct = 25;
  const carbsPct = Math.round((carbsCal / targetCalories) * 100);

  const fmt = (n) => Math.round(n).toLocaleString();

  document.getElementById('results-content').innerHTML =
    '<div class="space-y-3">' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Daily Calories</span>' +
        '<span class="font-semibold text-navy">' + fmt(targetCalories) + ' kcal</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Protein</span>' +
        '<span class="font-semibold text-navy">' + proteinG + 'g (' + proteinPct + '%)</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Carbs</span>' +
        '<span class="font-semibold text-navy">' + carbsG + 'g (' + carbsPct + '%)</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Fat</span>' +
        '<span class="font-semibold text-navy">' + fatG + 'g (' + fatPct + '%)</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">BMR</span>' +
        '<span class="font-semibold text-navy">' + fmt(bmr) + ' kcal</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">TDEE</span>' +
        '<span class="font-semibold text-navy">' + fmt(tdee) + ' kcal</span>' +
      '</div>' +
    '</div>';

  document.getElementById('calc-results').classList.remove('hidden');
}

function getTLDR() {
  const age = parseInt(document.getElementById('input-age').value) || 0;
  const weight = parseFloat(document.getElementById('input-weight').value) || 0;
  const height = parseFloat(document.getElementById('input-height').value) || 0;
  const activityLevel = document.getElementById('input-activityLevel').value || 'moderate';
  const goal = document.getElementById('input-goal').value || 'maintain';

  let gender = 'male';
  const genderInputs = document.querySelectorAll('input[name="input-gender"]');
  for (const input of genderInputs) {
    if (input.checked) { gender = input.value; break; }
  }
  if (genderInputs.length === 0) {
    const el = document.getElementById('input-gender');
    if (el) gender = el.value || 'male';
  }

  if (age <= 0 || weight <= 0 || height <= 0) {
    return 'Please enter valid values to calculate your macros.';
  }

  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9
  };
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  const tdee = bmr * multiplier;

  let targetCalories;
  if (goal === 'lose') {
    targetCalories = tdee - 500;
  } else if (goal === 'gain') {
    targetCalories = tdee + 400;
  } else {
    targetCalories = tdee;
  }

  const proteinG = Math.round(2 * weight);
  const fatCal = targetCalories * 0.25;
  const fatG = Math.round(fatCal / 9);
  const proteinCal = proteinG * 4;
  const carbsCal = targetCalories - proteinCal - fatCal;
  const carbsG = Math.round(carbsCal / 4);

  const goalLabels = { lose: 'lose weight', maintain: 'maintain your weight', gain: 'gain muscle' };
  const goalLabel = goalLabels[goal] || 'maintain your weight';
  const cals = Math.round(targetCalories).toLocaleString();

  return 'Based on your profile, you need approximately ' + cals + ' calories per day with ' + proteinG + 'g protein, ' + carbsG + 'g carbs, and ' + fatG + 'g fat to ' + goalLabel + '.';
}
