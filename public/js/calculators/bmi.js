function calculate() {
  const height = parseFloat(document.getElementById('input-height').value) || 0;
  const weight = parseFloat(document.getElementById('input-weight').value) || 0;

  if (height <= 0 || weight <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter valid height and weight values.</p>';
    return;
  }

  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  // Category classification
  let category = '';
  let categoryColor = '';
  let advice = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    categoryColor = 'text-amber-600';
    advice = 'A BMI under 18.5 may indicate insufficient nutrition. Consider consulting a healthcare professional.';
  } else if (bmi < 25) {
    category = 'Healthy Weight';
    categoryColor = 'text-green-600';
    advice = 'Your BMI falls within the healthy weight range. Maintain a balanced diet and regular exercise.';
  } else if (bmi < 30) {
    category = 'Overweight';
    categoryColor = 'text-amber-600';
    advice = 'A BMI between 25 and 30 indicates overweight. Consider lifestyle adjustments for better health outcomes.';
  } else if (bmi < 35) {
    category = 'Obese (Class I)';
    categoryColor = 'text-red-600';
    advice = 'A BMI of 30+ indicates obesity. Consult a healthcare professional for personalised guidance.';
  } else if (bmi < 40) {
    category = 'Obese (Class II)';
    categoryColor = 'text-red-600';
    advice = 'A BMI of 35+ indicates significant obesity. Professional medical advice is recommended.';
  } else {
    category = 'Obese (Class III)';
    categoryColor = 'text-red-600';
    advice = 'A BMI of 40+ requires medical attention. Please consult your doctor.';
  }

  // Healthy weight range for this height
  const healthyMin = 18.5 * heightM * heightM;
  const healthyMax = 24.9 * heightM * heightM;

  // Distance to healthy range
  let toHealthy = '';
  if (bmi < 18.5) {
    toHealthy = `You need to gain ${(healthyMin - weight).toFixed(1)} kg to reach a healthy BMI.`;
  } else if (bmi >= 25) {
    toHealthy = `You need to lose ${(weight - healthyMax).toFixed(1)} kg to reach a healthy BMI.`;
  }

  // Visual indicator
  const barPosition = Math.min(Math.max((bmi / 50) * 100, 0), 100);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row font-bold text-2xl"><span class="result-label">Your BMI</span><span class="result-value ${categoryColor}">${bmi.toFixed(1)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Category</span><span class="result-value ${categoryColor}">${category}</span></div>
    <div class="mb-4 mt-2">
      <div class="w-full h-4 rounded-full flex overflow-hidden">
        <div class="h-4 bg-blue-300" style="width:18.5%"></div>
        <div class="h-4 bg-green-400" style="width:13%"></div>
        <div class="h-4 bg-amber-400" style="width:10%"></div>
        <div class="h-4 bg-red-400" style="width:10%"></div>
        <div class="h-4 bg-red-600" style="width:48.5%"></div>
      </div>
      <div class="relative h-4">
        <div class="absolute text-xs font-bold" style="left: ${barPosition}%; transform: translateX(-50%);">&#9650;</div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>Underweight<br>&lt;18.5</span>
        <span>Healthy<br>18.5-24.9</span>
        <span>Over<br>25-29.9</span>
        <span>Obese<br>30+</span>
      </div>
    </div>
    <p class="text-sm text-gray-600 mb-3">${advice}</p>
    <hr class="my-2">
    <div class="result-row"><span class="result-label">Height</span><span class="result-value">${height} cm (${(height / 2.54 / 12).toFixed(0)}' ${((height / 2.54) % 12).toFixed(0)}")</span></div>
    <div class="result-row"><span class="result-label">Weight</span><span class="result-value">${weight} kg (${(weight * 2.205).toFixed(1)} lbs)</span></div>
    <div class="result-row"><span class="result-label">Healthy Weight Range</span><span class="result-value">${healthyMin.toFixed(1)} – ${healthyMax.toFixed(1)} kg</span></div>
    ${toHealthy ? `<p class="text-sm text-amber-600 mt-2">${toHealthy}</p>` : ''}
    <p class="text-xs text-gray-400 mt-3">BMI is a screening tool and does not account for muscle mass, bone density, or body composition. Consult a healthcare professional for a comprehensive assessment.</p>
  `;
}
