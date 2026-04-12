function calculate() {
  const beersPerWeek = parseFloat(document.getElementById('input-beersPerWeek').value) || 6;
  const years = parseFloat(document.getElementById('input-drinkingYears').value) || 10;
  const beerType = document.getElementById('input-beerType').value;
  const pricePerBeer = parseFloat(document.getElementById('input-pricePerBeer').value) || 10;

  const volumes = { schooner: 425, pint: 570, stubby: 375, tinny: 375, midi: 285 };
  const names = { schooner: 'schooners', pint: 'pints', stubby: 'stubbies', tinny: 'tinnies', midi: 'midis/pots' };
  const foamLoss = { schooner: 0.10, pint: 0.10, stubby: 0.03, tinny: 0.02, midi: 0.10 };

  const ml = volumes[beerType];
  const totalBeers = beersPerWeek * 52 * years;
  const totalLitres = (totalBeers * ml) / 1000;

  // Loss calculations
  const foamPct = foamLoss[beerType];
  const dregsPct = 0.05;
  const spillPct = 0.03;
  const matesTax = 0.08; // beers bought for mates who never shout back

  const foamLitres = totalLitres * foamPct;
  const dregsLitres = totalLitres * dregsPct;
  const spillLitres = totalLitres * spillPct;
  const matesBeers = Math.round(totalBeers * matesTax);
  const matesLitres = (matesBeers * ml) / 1000;

  const totalLossLitres = foamLitres + dregsLitres + spillLitres + matesLitres;
  const totalLossPct = (totalLossLitres / totalLitres * 100);
  const totalLossDollars = Math.round(totalLossLitres / (ml / 1000) * pricePerBeer);

  const bathtubs = (totalLitres / 300).toFixed(1);
  const lostBathtubs = (totalLossLitres / 300).toFixed(1);

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-navy/5 rounded-xl p-5 mb-4 text-center">
      <p class="text-4xl mb-2">🍺</p>
      <p class="text-sm text-gray-500 mb-1">Over ${years} years of drinking ${beersPerWeek} ${names[beerType]}/week</p>
      <p class="text-3xl font-bold text-navy">${totalBeers.toLocaleString()} beers</p>
      <p class="text-sm text-gray-500 mt-1">${totalLitres.toFixed(0).toLocaleString()} litres · ${bathtubs} bathtubs</p>
    </div>
    <div class="bg-red-50 border border-red-100 rounded-xl p-5 mb-4 text-center">
      <p class="text-sm text-red-800 font-medium mb-1">🚨 Total beer lost forever</p>
      <p class="text-3xl font-bold text-red-700">${totalLossLitres.toFixed(1)}L</p>
      <p class="text-sm text-red-600 mt-1">${totalLossPct.toFixed(1)}% of everything you've paid for · $${totalLossDollars.toLocaleString()} wasted</p>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-xs text-gray-500">🫧 Lost to foam</p>
        <p class="text-lg font-bold text-navy">${foamLitres.toFixed(1)}L</p>
        <p class="text-xs text-gray-400">${(foamPct * 100).toFixed(0)}% per ${names[beerType].slice(0, -1)}</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-xs text-gray-500">🌡️ Warm dregs left</p>
        <p class="text-lg font-bold text-navy">${dregsLitres.toFixed(1)}L</p>
        <p class="text-xs text-gray-400">The warm flat bit at the bottom</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-xs text-gray-500">💦 Spillage</p>
        <p class="text-lg font-bold text-navy">${spillLitres.toFixed(1)}L</p>
        <p class="text-xs text-gray-400">Bumps, knocks, and gestures</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-xs text-gray-500">🤝 Mates tax</p>
        <p class="text-lg font-bold text-navy">${matesBeers} beers</p>
        <p class="text-xs text-gray-400">Bought for mates who never shout</p>
      </div>
    </div>
    <div class="bg-gold-light rounded-xl p-4">
      <p class="text-sm text-gray-700">💡 At $${pricePerBeer}/beer, your lifetime beer spend is <strong>$${(totalBeers * pricePerBeer).toLocaleString()}</strong>. That's ${(totalBeers * pricePerBeer / years).toFixed(0)}/year or $${(totalBeers * pricePerBeer / years / 52).toFixed(0)}/week.</p>
    </div>
    <p class="text-xs text-gray-400 mt-4">Foam loss data from draught beer studies. Mates tax is an estimate — you know who they are.</p>
  `;
}
