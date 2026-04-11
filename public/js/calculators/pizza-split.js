function calculate() {
  const diameter = parseFloat(document.getElementById('input-diameter').value) || 0;
  const numPizzas = parseInt(document.getElementById('input-pizzas').value) || 1;
  const numPeople = parseInt(document.getElementById('input-people').value) || 1;
  const slicesPerPizza = parseInt(document.getElementById('input-slicesPerPizza').value) || 8;

  const radius = diameter / 2;
  const areaPerPizza = Math.PI * radius * radius;
  const totalArea = areaPerPizza * numPizzas;
  const areaPerPerson = totalArea / numPeople;

  const totalSlices = numPizzas * slicesPerPizza;
  const slicesPerPerson = totalSlices / numPeople;
  const wholeSlices = Math.floor(slicesPerPerson);
  const leftoverSlices = totalSlices % numPeople;

  // Compare to standard sizes
  const sizeGuide = diameter <= 20 ? 'Personal' :
    diameter <= 26 ? 'Small' :
    diameter <= 30 ? 'Medium' :
    diameter <= 36 ? 'Large' : 'Family/Party';

  // Fun fact: a single 18" pizza has more area than two 12" pizzas
  const areaOf18 = Math.PI * 9 * 9;
  const areaOfTwo12 = 2 * Math.PI * 6 * 6;

  // Area per slice
  const areaPerSlice = areaPerPizza / slicesPerPizza;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Pizza Size</span><span class="result-value">${diameter} cm (${(diameter / 2.54).toFixed(0)}") - ${sizeGuide}</span></div>
    <div class="result-row"><span class="result-label">Area per Pizza</span><span class="result-value">${areaPerPizza.toFixed(0)} cm&sup2;</span></div>
    <div class="result-row"><span class="result-label">Total Pizza Area</span><span class="result-value">${totalArea.toFixed(0)} cm&sup2;</span></div>
    <div class="result-row"><span class="result-label">Total Slices</span><span class="result-value">${totalSlices} slices</span></div>
    <div class="result-row highlight"><span class="result-label">Slices per Person</span><span class="result-value">${slicesPerPerson.toFixed(1)} slices</span></div>
    <div class="result-row highlight"><span class="result-label">Area per Person</span><span class="result-value">${areaPerPerson.toFixed(0)} cm&sup2;</span></div>
    <div class="result-row"><span class="result-label">Fair Split</span><span class="result-value">${wholeSlices} slices each${leftoverSlices > 0 ? `, ${leftoverSlices} slice${leftoverSlices > 1 ? 's' : ''} left over to fight for` : ''}</span></div>
    <div class="result-row"><span class="result-label">Area per Slice</span><span class="result-value">${areaPerSlice.toFixed(0)} cm&sup2;</span></div>
    <p class="result-note"><strong>Fun fact:</strong> One 46cm (18") pizza has ${areaOf18.toFixed(0)} cm&sup2; of pizza, while two 30cm (12") pizzas only have ${areaOfTwo12.toFixed(0)} cm&sup2;. Always go bigger!</p>
    <p class="result-note">Recommended: 2-3 slices of a large pizza per adult, 1-2 for kids. When in doubt, order one more pizza.</p>
  `;
}
