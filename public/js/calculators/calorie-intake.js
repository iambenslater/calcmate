function calculate() {
  const age = parseInt(document.getElementById('input-age').value) || 0;
  const height = parseFloat(document.getElementById('input-height').value) || 0;
  const weight = parseFloat(document.getElementById('input-weight').value) || 0;
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

  if (age <= 0 || height <= 0 || weight <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter valid age, height, and weight values.</p>';
    return;
  }

  // Mifflin-St Jeor BMR
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

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  // Goal adjustments
  let targetCalories = tdee;
  let goalLabel = '';
  let deficit = 0;
  let weeklyChange = 0;

  switch (goal) {
    case 'lose':
      // Moderate deficit of 500 cal/day = ~0.5kg/week
      deficit = 500;
      targetCalories = tdee - deficit;
      goalLabel = 'Weight Loss (moderate deficit)';
      weeklyChange = -0.5;
      break;
    case 'gain':
      // Surplus of 400 cal/day = ~0.35kg/week lean gain
      deficit = -400;
      targetCalories = tdee + 400;
      goalLabel = 'Weight Gain (lean bulk)';
      weeklyChange = 0.35;
      break;
    default:
      goalLabel = 'Maintain Weight';
      weeklyChange = 0;
  }

  // Don't go below safe minimums
  const safeMin = gender === 'male' ? 1500 : 1200;
  if (targetCalories < safeMin) targetCalories = safeMin;

  // Macros for each goal
  let proteinRatio, carbRatio, fatRatio;
  if (goal === 'lose') {
    proteinRatio = 0.35; carbRatio = 0.35; fatRatio = 0.30;
  } else if (goal === 'gain') {
    proteinRatio = 0.30; carbRatio = 0.45; fatRatio = 0.25;
  } else {
    proteinRatio = 0.30; carbRatio = 0.40; fatRatio = 0.30;
  }

  const proteinGrams = (targetCalories * proteinRatio) / 4;
  const carbGrams = (targetCalories * carbRatio) / 4;
  const fatGrams = (targetCalories * fatRatio) / 9;

  // Protein per kg body weight
  const proteinPerKg = proteinGrams / weight;

  // Timeline projection
  let projectionRows = '';
  if (goal !== 'maintain') {
    let projWeight = weight;
    for (let week = 4; week <= 24; week += 4) {
      projWeight += weeklyChange * 4;
      projectionRows += `<tr>
        <td class="px-2 py-1">Week ${week}</td>
        <td class="px-2 py-1 text-right">${projWeight.toFixed(1)} kg</td>
        <td class="px-2 py-1 text-right">${(projWeight - weight > 0 ? '+' : '') + (projWeight - weight).toFixed(1)} kg</td>
      </tr>`;
    }
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Goal</span><span class="result-value">${goalLabel}</span></div>
    <div class="result-row"><span class="result-label">Maintenance (TDEE)</span><span class="result-value">${Math.round(tdee)} cal/day</span></div>
    <div class="result-row font-bold text-lg"><span class="result-label">Daily Calorie Target</span><span class="result-value">${Math.round(targetCalories)} cal/day</span></div>
    ${deficit !== 0 ? `<div class="result-row"><span class="result-label">${deficit > 0 ? 'Deficit' : 'Surplus'}</span><span class="result-value">${Math.abs(deficit)} cal/day</span></div>` : ''}
    ${weeklyChange !== 0 ? `<div class="result-row"><span class="result-label">Expected Weekly Change</span><span class="result-value">${weeklyChange > 0 ? '+' : ''}${weeklyChange} kg/week</span></div>` : ''}
    <hr class="my-3">
    <h4 class="font-semibold mb-2">Daily Macronutrient Targets</h4>
    <div class="result-row"><span class="result-label">Protein (${Math.round(proteinRatio*100)}%)</span><span class="result-value">${Math.round(proteinGrams)}g (${proteinPerKg.toFixed(1)}g/kg)</span></div>
    <div class="result-row"><span class="result-label">Carbohydrates (${Math.round(carbRatio*100)}%)</span><span class="result-value">${Math.round(carbGrams)}g</span></div>
    <div class="result-row"><span class="result-label">Fat (${Math.round(fatRatio*100)}%)</span><span class="result-value">${Math.round(fatGrams)}g</span></div>
    ${projectionRows ? `
      <hr class="my-3">
      <h4 class="font-semibold mb-2">Weight Projection</h4>
      <div class="overflow-x-auto"><table class="w-full text-sm">
        <thead><tr class="border-b"><th class="px-2 py-1 text-left">Week</th><th class="px-2 py-1 text-right">Est. Weight</th><th class="px-2 py-1 text-right">Change</th></tr></thead>
        <tbody>${projectionRows}</tbody>
      </table></div>
    ` : ''}
    <p class="text-xs text-gray-400 mt-3">Based on the Mifflin-St Jeor equation. Results are estimates and individual metabolism varies. Consult a healthcare professional before making significant dietary changes.</p>
  `;
}
