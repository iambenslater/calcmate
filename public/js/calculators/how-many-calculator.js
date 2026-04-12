function calculate() {
  const age = parseFloat(document.getElementById('input-age').value) || 30;
  const days = age * 365.25;
  const hours = days * 24;
  const wakeHours = days * 16;

  const stats = [
    { label: 'Heartbeats', value: Math.round(days * 100000), icon: '❤️', note: '~100,000 per day' },
    { label: 'Breaths', value: Math.round(days * 22000), icon: '🌬️', note: '~22,000 per day' },
    { label: 'Blinks', value: Math.round(wakeHours * 60 * 17), icon: '👁️', note: '~17 per minute (awake)' },
    { label: 'Hours slept', value: Math.round(days * 8), icon: '😴', note: '~8 hours per day' },
    { label: 'Meals eaten', value: Math.round(days * 3), icon: '🍽️', note: '~3 per day' },
    { label: 'Litres of water', value: Math.round(age * 2920), icon: '💧', note: '~8 glasses per day' },
    { label: 'Steps walked', value: Math.round(days * 7500), icon: '🚶', note: '~7,500 per day (average)' },
    { label: 'Words spoken', value: Math.round(days * 16000), icon: '🗣️', note: '~16,000 per day' },
    { label: 'Dreams had', value: Math.round(days * 5), icon: '💭', note: '~3-7 per night' },
    { label: 'Times laughed', value: Math.round(days * 15), icon: '😂', note: '~15 per day (adults)' },
    { label: 'Sneezes', value: Math.round(days * 4), icon: '🤧', note: '~4 per day' },
    { label: 'Yawns', value: Math.round(days * 8), icon: '🥱', note: '~8 per day' }
  ];

  const kmWalked = Math.round((days * 7500 * 0.0007));
  const earthCircs = (kmWalked / 40075).toFixed(1);
  const yearsSlept = (days * 8 / 24 / 365.25).toFixed(1);
  const bathtubsOfWater = Math.round(age * 2920 / 300);

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-navy/5 rounded-xl p-5 mb-4 text-center">
      <p class="text-sm text-gray-500 mb-1">In your ${age} years on Earth, you have lived</p>
      <p class="text-3xl font-bold text-navy">${Math.round(days).toLocaleString()} days</p>
      <p class="text-sm text-gray-500 mt-1">${Math.round(hours).toLocaleString()} hours · ${Math.round(hours * 60).toLocaleString()} minutes</p>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
      ${stats.map(s => `
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-2xl mb-1">${s.icon}</div>
          <p class="text-lg font-bold text-navy">${s.value >= 1000000000 ? (s.value / 1000000000).toFixed(1) + 'B' : s.value >= 1000000 ? (s.value / 1000000).toFixed(1) + 'M' : s.value.toLocaleString()}</p>
          <p class="text-xs font-medium text-gray-700">${s.label}</p>
          <p class="text-[10px] text-gray-400 mt-0.5">${s.note}</p>
        </div>
      `).join('')}
    </div>
    <div class="bg-gold-light rounded-xl p-5">
      <p class="font-bold text-navy mb-2">🤯 Fun facts about your life so far</p>
      <ul class="text-sm text-gray-700 space-y-1">
        <li>• You've walked roughly <strong>${kmWalked.toLocaleString()} km</strong> — that's ${earthCircs}× around the Earth</li>
        <li>• You've spent <strong>${yearsSlept} years</strong> sleeping</li>
        <li>• You've drunk enough water to fill <strong>${bathtubsOfWater} bathtubs</strong></li>
        <li>• Your heart has pumped about <strong>${Math.round(age * 7571).toLocaleString()} litres</strong> of blood</li>
      </ul>
    </div>
    <p class="text-xs text-gray-400 mt-4">Estimates based on medical and scientific averages. Individual results vary.</p>
  `;
}
