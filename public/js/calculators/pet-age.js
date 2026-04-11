function calculate() {
  const petType = document.getElementById('input-petType').value;
  const breedSize = document.getElementById('input-breedSize').value;
  const petAge = parseFloat(document.getElementById('input-petAge').value) || 0;

  let humanAge = 0;
  let explanation = '';

  if (petType === 'cat') {
    // Cat: 15 for first year, 9 for second, 4 for each year after
    if (petAge <= 0) {
      humanAge = 0;
    } else if (petAge <= 1) {
      humanAge = petAge * 15;
    } else if (petAge <= 2) {
      humanAge = 15 + (petAge - 1) * 9;
    } else {
      humanAge = 15 + 9 + (petAge - 2) * 4;
    }
    explanation = 'Cat aging: 15 human years for year 1, +9 for year 2, then +4 per year';
  } else {
    // Dog: varies by size
    // Small (<10kg): slower aging after initial years
    // Medium (10-25kg): moderate aging
    // Large (>25kg): faster aging
    const agingRates = {
      'small':  { first2: 10.5, after: 4.0 },
      'medium': { first2: 10.5, after: 5.0 },
      'large':  { first2: 10.5, after: 6.0 }
    };
    const rate = agingRates[breedSize] || agingRates['medium'];

    if (petAge <= 0) {
      humanAge = 0;
    } else if (petAge <= 2) {
      humanAge = petAge * rate.first2;
    } else {
      humanAge = 2 * rate.first2 + (petAge - 2) * rate.after;
    }
    explanation = `${breedSize.charAt(0).toUpperCase() + breedSize.slice(1)} dog: ${rate.first2} human yrs for each of first 2 years, then +${rate.after} per year`;
  }

  // Life stage
  let stage = '';
  if (petType === 'cat') {
    if (petAge < 0.5) stage = 'Kitten';
    else if (petAge < 2) stage = 'Junior';
    else if (petAge < 6) stage = 'Prime';
    else if (petAge < 10) stage = 'Mature';
    else if (petAge < 14) stage = 'Senior';
    else stage = 'Geriatric';
  } else {
    const seniorAge = breedSize === 'small' ? 10 : breedSize === 'medium' ? 8 : 6;
    if (petAge < 0.5) stage = 'Puppy';
    else if (petAge < 1) stage = 'Junior';
    else if (petAge < 3) stage = 'Young Adult';
    else if (petAge < seniorAge) stage = 'Adult';
    else stage = 'Senior';
  }

  // Average life expectancy
  const lifeExpectancy = petType === 'cat' ? '12-18 years' :
    breedSize === 'small' ? '12-16 years' :
    breedSize === 'medium' ? '10-14 years' : '8-12 years';

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <p class="result-note">${explanation}</p>
    <div class="result-row highlight"><span class="result-label">${petType === 'cat' ? 'Cat' : 'Dog'} Age</span><span class="result-value">${petAge} years</span></div>
    <div class="result-row highlight"><span class="result-label">Human Equivalent</span><span class="result-value">~${Math.round(humanAge)} human years</span></div>
    <div class="result-row"><span class="result-label">Life Stage</span><span class="result-value">${stage}</span></div>
    <div class="result-row"><span class="result-label">Average Life Expectancy</span><span class="result-value">${lifeExpectancy}</span></div>
    <p class="result-note">Age conversion is approximate. Actual aging depends on breed, diet, health, and lifestyle. Large breed dogs tend to age faster than small breeds.</p>
  `;
}
