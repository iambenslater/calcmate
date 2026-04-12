function getServes(age, gender, pregnant, breastfeeding) {
  if (age <= 0) return { error: 'Please enter a valid age.' };
  if (age < 2) return { error: 'Guidelines for children under 2 should be discussed with your paediatrician.' };

  // Children/teens (both genders except 14-18)
  if (age <= 3) return { veg: 2.5, fruit: 1, grains: 4, protein: 1, dairy: 1.5 };
  if (age <= 8) return { veg: 4.5, fruit: 1.5, grains: 4, protein: 1.5, dairy: 2 };
  if (age <= 11) return { veg: 5, fruit: 2, grains: 5, protein: 2.5, dairy: 3 };
  if (age <= 13) return { veg: 5.5, fruit: 2, grains: 6, protein: 2.5, dairy: 3.5 };
  if (age <= 18 && gender === 'male') return { veg: 5.5, fruit: 2, grains: 7, protein: 2.5, dairy: 3.5 };
  if (age <= 18) return { veg: 5, fruit: 2, grains: 7, protein: 2.5, dairy: 3.5 };

  // Adults — check pregnancy/breastfeeding first (women only)
  if (gender === 'female' && breastfeeding === 'yes') return { veg: 7.5, fruit: 2, grains: 9, protein: 2.5, dairy: 2.5 };
  if (gender === 'female' && pregnant === 'yes') return { veg: 5, fruit: 2, grains: 8.5, protein: 3.5, dairy: 2.5 };

  // Adult men
  if (gender === 'male') {
    if (age <= 50) return { veg: 6, fruit: 2, grains: 6, protein: 3, dairy: 2.5 };
    if (age <= 70) return { veg: 5.5, fruit: 2, grains: 6, protein: 2.5, dairy: 2.5 };
    return { veg: 5, fruit: 2, grains: 4.5, protein: 2.5, dairy: 3.5 };
  }

  // Adult women (not pregnant/breastfeeding)
  if (age <= 50) return { veg: 5, fruit: 2, grains: 6, protein: 2.5, dairy: 2.5 };
  if (age <= 70) return { veg: 5, fruit: 2, grains: 4, protein: 2, dairy: 4 };
  return { veg: 5, fruit: 2, grains: 3, protein: 2, dairy: 4 };
}

function readInputs() {
  var age = parseInt(document.getElementById('input-age').value) || 30;

  var gender = 'male';
  var genderInputs = document.querySelectorAll('input[name="input-gender"]');
  for (var i = 0; i < genderInputs.length; i++) {
    if (genderInputs[i].checked) { gender = genderInputs[i].value; break; }
  }
  if (genderInputs.length === 0) {
    var el = document.getElementById('input-gender');
    if (el) gender = el.value || 'male';
  }

  var pregnant = 'no';
  var pregnantInputs = document.querySelectorAll('input[name="input-pregnant"]');
  for (var j = 0; j < pregnantInputs.length; j++) {
    if (pregnantInputs[j].checked) { pregnant = pregnantInputs[j].value; break; }
  }
  if (pregnantInputs.length === 0) {
    var elP = document.getElementById('input-pregnant');
    if (elP) pregnant = elP.value || 'no';
  }

  var breastfeeding = 'no';
  var bfInputs = document.querySelectorAll('input[name="input-breastfeeding"]');
  for (var k = 0; k < bfInputs.length; k++) {
    if (bfInputs[k].checked) { breastfeeding = bfInputs[k].value; break; }
  }
  if (bfInputs.length === 0) {
    var elB = document.getElementById('input-breastfeeding');
    if (elB) breastfeeding = elB.value || 'no';
  }

  return { age: age, gender: gender, pregnant: pregnant, breastfeeding: breastfeeding };
}

function calculate() {
  var inputs = readInputs();
  var result = getServes(inputs.age, inputs.gender, inputs.pregnant, inputs.breastfeeding);

  document.getElementById('calc-results').classList.remove('hidden');

  if (result.error) {
    document.getElementById('results-content').innerHTML = '<p class="result-note">' + result.error + '</p>';
    return;
  }

  var s = result;
  var desc = inputs.age + '-year-old ' + inputs.gender;
  if (inputs.gender === 'female' && inputs.breastfeeding === 'yes') desc += ' (breastfeeding)';
  else if (inputs.gender === 'female' && inputs.pregnant === 'yes') desc += ' (pregnant)';

  document.getElementById('results-content').innerHTML =
    '<p class="result-note" style="margin-bottom:0.75rem"><strong>Daily serves for a ' + desc + ':</strong></p>' +
    '<div class="space-y-3">' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Vegetables &amp; Legumes</span>' +
        '<span class="font-semibold text-navy">' + s.veg + ' serves</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Fruit</span>' +
        '<span class="font-semibold text-navy">' + s.fruit + ' serves</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Grains &amp; Cereals</span>' +
        '<span class="font-semibold text-navy">' + s.grains + ' serves</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Lean Meat &amp; Protein</span>' +
        '<span class="font-semibold text-navy">' + s.protein + ' serves</span>' +
      '</div>' +
      '<div class="flex justify-between py-2 border-b border-gray-100">' +
        '<span class="text-gray-600">Dairy &amp; Alternatives</span>' +
        '<span class="font-semibold text-navy">' + s.dairy + ' serves</span>' +
      '</div>' +
    '</div>' +
    '<div style="margin-top:1.25rem">' +
      '<p class="result-note" style="margin-bottom:0.5rem"><strong>What counts as one serve?</strong></p>' +
      '<div class="space-y-3">' +
        '<div class="flex justify-between py-2 border-b border-gray-100">' +
          '<span class="text-gray-600">Vegetables</span>' +
          '<span class="font-semibold text-navy">75g or &frac12; cup cooked veg</span>' +
        '</div>' +
        '<div class="flex justify-between py-2 border-b border-gray-100">' +
          '<span class="text-gray-600">Fruit</span>' +
          '<span class="font-semibold text-navy">150g or 1 medium piece</span>' +
        '</div>' +
        '<div class="flex justify-between py-2 border-b border-gray-100">' +
          '<span class="text-gray-600">Grains</span>' +
          '<span class="font-semibold text-navy">1 slice bread or &frac12; cup cooked rice/pasta</span>' +
        '</div>' +
        '<div class="flex justify-between py-2 border-b border-gray-100">' +
          '<span class="text-gray-600">Protein</span>' +
          '<span class="font-semibold text-navy">65g cooked red meat or 100g fish</span>' +
        '</div>' +
        '<div class="flex justify-between py-2 border-b border-gray-100">' +
          '<span class="text-gray-600">Dairy</span>' +
          '<span class="font-semibold text-navy">1 cup milk or 40g cheese</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<p class="result-note" style="margin-top:1rem">Source: Australian Dietary Guidelines — <a href="https://www.eatforhealth.gov.au" target="_blank" rel="noopener">Eat for Health</a>. Individual needs may vary — consult a dietitian for personalised advice.</p>';
}

function getTLDR() {
  var inputs = readInputs();
  var result = getServes(inputs.age, inputs.gender, inputs.pregnant, inputs.breastfeeding);

  if (result.error) return result.error;

  var desc = inputs.age + '-year-old ' + inputs.gender;
  if (inputs.gender === 'female' && inputs.breastfeeding === 'yes') desc += ' who is breastfeeding';
  else if (inputs.gender === 'female' && inputs.pregnant === 'yes') desc += ' who is pregnant';

  return 'As a ' + desc + ', you need ' + result.veg + ' serves of vegetables, ' + result.fruit + ' of fruit, ' + result.grains + ' of grains, ' + result.protein + ' of protein, and ' + result.dairy + ' of dairy per day.';
}
