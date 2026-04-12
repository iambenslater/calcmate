function calculate() {
  const weight = parseFloat(document.getElementById('input-weight').value) || 75;
  const drink = document.getElementById('input-drink').value;

  const drinks = {
    espresso: { name: 'espresso shots', mg: 63, emoji: '☕', ml: 30 },
    drip: { name: 'cups of drip coffee', mg: 95, emoji: '☕', ml: 250 },
    latte: { name: 'lattes / flat whites', mg: 130, emoji: '☕', ml: 300 },
    redbull: { name: 'Red Bulls (250ml)', mg: 80, emoji: '🥤', ml: 250 },
    monster: { name: 'Monsters (500ml)', mg: 160, emoji: '🥤', ml: 500 },
    coke: { name: 'Coca-Colas (375ml)', mg: 36, emoji: '🥤', ml: 375 },
    tea: { name: 'cups of black tea', mg: 47, emoji: '🍵', ml: 250 },
    matcha: { name: 'matcha lattes', mg: 70, emoji: '🍵', ml: 250 },
    chocolate: { name: 'dark chocolate bars (100g)', mg: 43, emoji: '🍫', ml: 0 }
  };

  const d = drinks[drink];
  const lethalDose = weight * 150; // mg (LD50)
  const lethalCount = Math.round(lethalDose / d.mg);
  const safeDaily = Math.floor(400 / d.mg); // 400mg safe limit
  const litres = d.ml > 0 ? ((lethalCount * d.ml) / 1000).toFixed(1) : null;

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-navy/5 rounded-xl p-5 mb-4 text-center">
      <p class="text-sm text-gray-500 mb-1">It would take approximately</p>
      <p class="text-5xl font-bold text-navy">${lethalCount.toLocaleString()}</p>
      <p class="text-lg text-gray-600 mt-1">${d.emoji} ${d.name}</p>
      <p class="text-xs text-gray-400 mt-2">to reach the LD50 caffeine dose for a ${weight}kg person</p>
    </div>
    <div class="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
      <p class="text-sm text-red-800 font-medium">⚠️ This is a theoretical calculation for entertainment only.</p>
      <p class="text-xs text-red-700 mt-1">Your body would reject the volume long before you reached this amount. Serious side effects occur at much lower doses. If you're concerned about caffeine intake, consult a doctor.</p>
    </div>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p class="text-xs text-gray-500">Lethal dose (LD50)</p>
        <p class="text-xl font-bold text-navy">${(lethalDose / 1000).toFixed(1)}g</p>
        <p class="text-xs text-gray-400">${lethalDose.toLocaleString()}mg caffeine</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p class="text-xs text-gray-500">Safe daily limit</p>
        <p class="text-xl font-bold text-green-700">${safeDaily}</p>
        <p class="text-xs text-gray-400">${d.name} (400mg max)</p>
      </div>
      ${litres ? `
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p class="text-xs text-gray-500">Total liquid volume</p>
        <p class="text-xl font-bold text-navy">${litres}L</p>
        <p class="text-xs text-gray-400">${(litres / 0.3).toFixed(0)} standard glasses</p>
      </div>` : ''}
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p class="text-xs text-gray-500">That's equivalent to</p>
        <p class="text-xl font-bold text-navy">${Math.round(lethalDose / 63)}</p>
        <p class="text-xs text-gray-400">espresso shots</p>
      </div>
    </div>
    <p class="text-xs text-gray-400">Based on LD50 of ~150mg caffeine per kg body weight. Individual tolerance varies significantly.</p>
  `;
}
