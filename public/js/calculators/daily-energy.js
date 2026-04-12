function calculate() {
  const age = parseInt(document.getElementById('input-age').value) || 0;
  const height = parseFloat(document.getElementById('input-height').value) || 0;
  const weight = parseFloat(document.getElementById('input-weight').value) || 0;
  const activityLevel = document.getElementById('input-activityLevel').value || 'moderate';

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

  if (age <= 0 || height <= 0 || weight <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter valid age, height, and weight values.</p>';
    return;
  }

  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const multipliers = {
    sedentary: { factor: 1.2, label: 'Sedentary (little/no exercise)' },
    light: { factor: 1.375, label: 'Lightly Active (1-3 days/week)' },
    moderate: { factor: 1.55, label: 'Moderately Active (3-5 days/week)' },
    active: { factor: 1.725, label: 'Very Active (6-7 days/week)' },
    extreme: { factor: 1.9, label: 'Extremely Active (athlete/physical job)' }
  };

  const activity = multipliers[activityLevel] || multipliers.moderate;
  const tdee = bmr * activity.factor;

  // Macronutrient estimates (balanced diet)
  const proteinCals = tdee * 0.30;
  const carbCals = tdee * 0.40;
  const fatCals = tdee * 0.30;

  const proteinGrams = proteinCals / 4;
  const carbGrams = carbCals / 4;
  const fatGrams = fatCals / 9;

  // Show TDEE for all activity levels
  let activityRows = '';
  for (const [key, val] of Object.entries(multipliers)) {
    const cal = bmr * val.factor;
    activityRows += `<tr class="${key === activityLevel ? 'bg-blue-50 font-semibold' : ''}">
      <td class="px-2 py-1 text-sm">${val.label}</td>
      <td class="px-2 py-1 text-right">${Math.round(cal)} cal</td>
    </tr>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Basal Metabolic Rate (BMR)</span><span class="result-value">${Math.round(bmr)} cal/day</span></div>
    <div class="result-row font-bold text-lg"><span class="result-label">Daily Energy Needs (TDEE)</span><span class="result-value">${Math.round(tdee)} cal/day</span></div>
    <div class="result-row"><span class="result-label">Activity Level</span><span class="result-value">${activity.label}</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-2">Suggested Macronutrient Split (30/40/30)</h4>
    <div class="result-row"><span class="result-label">Protein (30%)</span><span class="result-value">${Math.round(proteinGrams)}g (${Math.round(proteinCals)} cal)</span></div>
    <div class="result-row"><span class="result-label">Carbohydrates (40%)</span><span class="result-value">${Math.round(carbGrams)}g (${Math.round(carbCals)} cal)</span></div>
    <div class="result-row"><span class="result-label">Fat (30%)</span><span class="result-value">${Math.round(fatGrams)}g (${Math.round(fatCals)} cal)</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-2">TDEE by Activity Level</h4>
    <div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="border-b"><th class="px-2 py-1 text-left">Activity Level</th><th class="px-2 py-1 text-right">Calories</th></tr></thead>
      <tbody>${activityRows}</tbody>
    </table></div>
    <p class="text-xs text-gray-400 mt-3">Based on the Mifflin-St Jeor equation. Individual needs may vary. Consult a dietitian for personalised advice.</p>
  `;
}

function getTLDR() {
  const age = parseInt(document.getElementById('input-age').value) || 0;
  const height = parseFloat(document.getElementById('input-height').value) || 0;
  const weight = parseFloat(document.getElementById('input-weight').value) || 0;
  const activityLevel = document.getElementById('input-activityLevel').value || 'moderate';
  if (age <= 0 || height <= 0 || weight <= 0) return '';
  let gender = 'male';
  const genderInputs = document.querySelectorAll('input[name="input-gender"]');
  for (const input of genderInputs) { if (input.checked) { gender = input.value; break; } }
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extreme: 1.9 };
  const tdee = bmr * (multipliers[activityLevel] || 1.55);
  const activityLabels = { sedentary: 'sedentary', light: 'lightly active', moderate: 'moderately active', active: 'very active', extreme: 'extremely active' };
  return 'You need roughly ' + Math.round(tdee) + ' calories per day to maintain your weight at your current activity level (' + (activityLabels[activityLevel] || activityLevel) + '), with a basal metabolic rate of ' + Math.round(bmr) + ' cal/day.';
}
