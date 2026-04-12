function calculate() {
  const doneness = document.querySelector('input[name="input-doneness"]:checked').value;
  const eggSize = document.getElementById('input-eggSize').value;
  const startTemp = document.querySelector('input[name="input-startTemp"]:checked').value;
  const altitude = parseInt(document.getElementById('input-altitude').value) || 0;

  // Base times in seconds (medium egg, room temp, sea level, into boiling water)
  const baseTimes = { soft: 360, medium: 480, hard: 720 };
  let time = baseTimes[doneness];

  // Egg size adjustment
  const sizeAdj = { small: -30, medium: 0, large: 30, xl: 45 };
  time += sizeAdj[eggSize] || 0;

  // Starting temperature
  if (startTemp === 'fridge') time += 30;

  // Altitude adjustment (+30s per 500m)
  time += Math.round((altitude / 500) * 30);

  const mins = Math.floor(time / 60);
  const secs = time % 60;
  const timeStr = secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`;

  const labels = { soft: 'Soft Boiled', medium: 'Medium (Jammy)', hard: 'Hard Boiled' };
  const emojis = { soft: '🥚', medium: '🥚', hard: '🥚' };
  const descs = {
    soft: 'Runny yolk, just-set white. Perfect for soldiers.',
    medium: 'Jammy, custardy yolk. The chef\'s favourite.',
    hard: 'Fully set yolk. Great for salads and sandwiches.'
  };

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-navy/5 rounded-xl p-6 mb-4 text-center">
      <p class="text-4xl mb-2">${emojis[doneness]}</p>
      <p class="text-sm text-gray-500 mb-1">${labels[doneness]}</p>
      <p class="text-5xl font-bold text-navy">${timeStr}</p>
      <p class="text-sm text-gray-500 mt-2">${descs[doneness]}</p>
    </div>
    <div class="bg-gold-light rounded-xl p-4 mb-4">
      <p class="font-medium text-navy text-sm mb-2">🍳 Perfect egg method:</p>
      <ol class="text-sm text-gray-700 space-y-1 list-decimal list-inside">
        <li>Bring a pot of water to a rolling boil</li>
        <li>Gently lower egg${eggSize === 'xl' ? 's' : ''} in with a spoon</li>
        <li>Set timer for <strong>${timeStr}</strong></li>
        <li>Transfer to ice water immediately when done</li>
        <li>Peel under running water for easy removal</li>
      </ol>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-gray-50 rounded-lg p-3 text-center ${doneness === 'soft' ? 'ring-2 ring-gold' : ''}">
        <p class="text-xs text-gray-500">Soft</p>
        <p class="text-sm font-bold text-navy">${Math.floor(baseTimes.soft / 60)}m${startTemp === 'fridge' ? '+' : ''}</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-3 text-center ${doneness === 'medium' ? 'ring-2 ring-gold' : ''}">
        <p class="text-xs text-gray-500">Medium</p>
        <p class="text-sm font-bold text-navy">${Math.floor(baseTimes.medium / 60)}m${startTemp === 'fridge' ? '+' : ''}</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-3 text-center ${doneness === 'hard' ? 'ring-2 ring-gold' : ''}">
        <p class="text-xs text-gray-500">Hard</p>
        <p class="text-sm font-bold text-navy">${Math.floor(baseTimes.hard / 60)}m${startTemp === 'fridge' ? '+' : ''}</p>
      </div>
    </div>
    <p class="text-xs text-gray-400 mt-4">Times assume eggs lowered into already-boiling water. Adjust to taste after your first attempt.</p>
  `;
}
