function calculate() {
  const people = parseFloat(document.getElementById('input-people').value) || 12;
  const occasion = document.getElementById('input-occasion').value;
  const appetite = document.querySelector('input[name="input-appetite"]:checked').value;

  const occasionMult = { office: 1.5, party: 2.0, kids: 1.2, breakfast: 2.5, friday: 1.8 };
  const appetiteMult = { light: 0.75, normal: 1.0, hungry: 1.25 };
  const occasionLabels = { office: '🏢 Office morning tea', party: '🎉 Party', kids: '🧒 Kids birthday', breakfast: '🌅 Breakfast meeting', friday: '🍩 Friday treat' };

  const basePerPerson = occasionMult[occasion] || 1.5;
  const adjusted = basePerPerson * (appetiteMult[appetite] || 1.0);
  const totalRaw = people * adjusted;

  // Round up to nearest half-dozen
  const halfDozens = Math.ceil(totalRaw / 6);
  const totalDonuts = halfDozens * 6;
  const dozens = halfDozens / 2;

  const pricePerDonut = 4.0;
  const totalCost = totalDonuts * pricePerDonut;

  // Variety split
  const classic = Math.round(totalDonuts * 0.5);
  const filled = Math.round(totalDonuts * 0.3);
  const choc = totalDonuts - classic - filled;

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-navy/5 rounded-xl p-6 mb-4 text-center">
      <p class="text-4xl mb-2">🍩</p>
      <p class="text-sm text-gray-500 mb-1">For ${people} people at ${(occasionLabels[occasion] || 'your event').replace(/^[^\s]+\s/, '').toLowerCase()}</p>
      <p class="text-5xl font-bold text-navy">${totalDonuts}</p>
      <p class="text-lg text-gray-600 mt-1">donuts (${dozens % 1 === 0 ? dozens : dozens.toFixed(1)} dozen)</p>
    </div>
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-gray-50 rounded-lg p-3 text-center">
        <p class="text-xs text-gray-500">Per person</p>
        <p class="text-xl font-bold text-navy">${adjusted.toFixed(1)}</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-3 text-center">
        <p class="text-xs text-gray-500">Estimated cost</p>
        <p class="text-xl font-bold text-navy">$${totalCost.toFixed(0)}</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-3 text-center">
        <p class="text-xs text-gray-500">Leftovers</p>
        <p class="text-xl font-bold text-green-600">${(totalDonuts - Math.ceil(totalRaw))}</p>
      </div>
    </div>
    <div class="bg-gold-light rounded-xl p-4 mb-4">
      <p class="font-medium text-navy text-sm mb-2">🎨 Suggested variety split:</p>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div>
          <p class="text-lg font-bold text-navy">${classic}</p>
          <p class="text-xs text-gray-600">Classic/Glazed</p>
          <p class="text-[10px] text-gray-400">50%</p>
        </div>
        <div>
          <p class="text-lg font-bold text-navy">${filled}</p>
          <p class="text-xs text-gray-600">Filled/Specialty</p>
          <p class="text-[10px] text-gray-400">30%</p>
        </div>
        <div>
          <p class="text-lg font-bold text-navy">${choc}</p>
          <p class="text-xs text-gray-600">Chocolate</p>
          <p class="text-[10px] text-gray-400">20%</p>
        </div>
      </div>
    </div>
    <p class="text-xs text-gray-400">Pro tip: Nobody has ever been upset about too many donuts. When in doubt, round up. At ~$4/donut from an Australian bakery.</p>
  `;
}
