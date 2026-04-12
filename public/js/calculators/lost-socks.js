function calculate() {
  const age = parseFloat(document.getElementById('input-age').value) || 30;
  const loadsPerWeek = parseFloat(document.getElementById('input-laundryFreq').value) || 4;
  const household = parseFloat(document.getElementById('input-household').value) || 2;

  // Average sock loss rate: ~1.3 per person per month (Samsung study)
  // Adjusted for laundry frequency (baseline 4 loads/week for a 2-person household)
  const laundryFactor = (loadsPerWeek / 4) * (household / 2);
  const baseLossPerMonth = 1.3;
  const yearsDoingLaundry = Math.max(0, age - 10); // assume independent laundry from ~10

  const monthsOfLaundry = yearsDoingLaundry * 12;
  const totalSocksLost = Math.round(monthsOfLaundry * baseLossPerMonth * laundryFactor);
  const pairsDestroyed = Math.round(totalSocksLost); // Each lost sock = 1 orphan + 1 pair destroyed
  const orphanSocks = Math.round(totalSocksLost * 0.7); // Some get thrown, some keep hoping
  const costPerPair = 3.5; // AUD average
  const totalCost = Math.round(pairsDestroyed * costPerPair);
  const perYear = Math.round((baseLossPerMonth * 12 * laundryFactor));

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-navy/5 rounded-xl p-6 mb-4 text-center">
      <p class="text-4xl mb-2">🧦</p>
      <p class="text-sm text-gray-500 mb-1">In your lifetime, you've lost approximately</p>
      <p class="text-5xl font-bold text-navy">${totalSocksLost.toLocaleString()}</p>
      <p class="text-lg text-gray-600 mt-1">socks to the washing machine void</p>
    </div>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p class="text-xs text-gray-500">Pairs destroyed</p>
        <p class="text-2xl font-bold text-navy">${pairsDestroyed}</p>
        <p class="text-xs text-gray-400">1 lost = 1 pair ruined</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p class="text-xs text-gray-500">Orphan socks in your drawer</p>
        <p class="text-2xl font-bold text-navy">~${orphanSocks}</p>
        <p class="text-xs text-gray-400">Still waiting for their mate</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p class="text-xs text-gray-500">Cost of replacement</p>
        <p class="text-2xl font-bold text-red-600">$${totalCost.toLocaleString()}</p>
        <p class="text-xs text-gray-400">at ~$3.50/pair</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p class="text-xs text-gray-500">Socks lost per year</p>
        <p class="text-2xl font-bold text-navy">~${perYear}</p>
        <p class="text-xs text-gray-400">that's ${(perYear / 12).toFixed(1)}/month</p>
      </div>
    </div>
    <div class="bg-gold-light rounded-xl p-4">
      <p class="font-medium text-navy text-sm mb-2">🔍 Where do they actually go?</p>
      <ul class="text-sm text-gray-700 space-y-1">
        <li>• Stuck behind the drum (most common)</li>
        <li>• Sucked into the drain pump filter</li>
        <li>• Hiding inside fitted sheets and duvet covers</li>
        <li>• Kicked under or behind the machine</li>
        <li>• Static-clung inside other clothes</li>
      </ul>
    </div>
    <p class="text-xs text-gray-400 mt-4">Based on Samsung research showing 1.3 socks lost per person per month on average.</p>
  `;
}
