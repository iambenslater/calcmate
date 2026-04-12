function calculate() {
  const dateStr = document.getElementById('input-birthDate').value;
  if (!dateStr) {
    const results = document.getElementById('calc-results');
    const content = document.getElementById('results-content');
    results.classList.remove('hidden');
    content.innerHTML = '<p class="text-red-600">Please enter your birth date.</p>';
    return;
  }

  const digits = dateStr.replace(/-/g, '');
  let sum = digits.split('').reduce((a, d) => a + parseInt(d), 0);

  // Reduce to single digit or master number
  function reduce(n) {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce((a, d) => a + parseInt(d), 0);
    }
    return n;
  }

  const angelNumber = reduce(sum);
  const tripleAngel = String(angelNumber).repeat(3);

  const meanings = {
    1: { title: 'The Leader', emoji: '🌟', meaning: 'Independence, ambition, new beginnings. You are a natural leader with strong willpower and determination.', advice: 'Trust your instincts and take initiative. You\'re meant to forge your own path.' },
    2: { title: 'The Peacemaker', emoji: '☮️', meaning: 'Harmony, partnership, diplomacy. You have a gift for bringing people together and finding balance.', advice: 'Nurture your relationships and trust in divine timing. Patience is your superpower.' },
    3: { title: 'The Creative', emoji: '🎨', meaning: 'Creativity, expression, joy. You radiate positive energy and have a natural gift for communication.', advice: 'Express yourself freely. Your creativity is meant to inspire others.' },
    4: { title: 'The Builder', emoji: '🏗️', meaning: 'Stability, hard work, foundation. You are practical, reliable, and build things that last.', advice: 'Stay focused on your goals. Your discipline will pay off — trust the process.' },
    5: { title: 'The Adventurer', emoji: '🌍', meaning: 'Change, freedom, adventure. You thrive on variety and embrace transformation.', advice: 'Don\'t fear change — it\'s your catalyst for growth. Say yes to new experiences.' },
    6: { title: 'The Nurturer', emoji: '💚', meaning: 'Love, family, responsibility. You are naturally caring and create warmth wherever you go.', advice: 'Remember to care for yourself as much as you care for others. Balance is key.' },
    7: { title: 'The Seeker', emoji: '🔮', meaning: 'Wisdom, intuition, spirituality. You have a deep inner world and a natural curiosity about life\'s mysteries.', advice: 'Trust your intuition — it\'s sharper than you think. Seek knowledge and understanding.' },
    8: { title: 'The Achiever', emoji: '💰', meaning: 'Abundance, power, success. You have strong business sense and the drive to achieve material goals.', advice: 'Your potential for success is enormous. Stay ethical and use your power wisely.' },
    9: { title: 'The Humanitarian', emoji: '🌏', meaning: 'Compassion, wisdom, completion. You see the bigger picture and want to make the world better.', advice: 'Your purpose involves service to others. Let go of what no longer serves you.' },
    11: { title: 'Master Number — The Visionary', emoji: '✨', meaning: 'Spiritual insight, inspiration, enlightenment. You are a master number — rare and powerful.', advice: 'You\'re here to inspire and illuminate. Trust your heightened intuition and share your vision.' },
    22: { title: 'Master Number — The Master Builder', emoji: '🏛️', meaning: 'Master architect, turning dreams into reality. The most powerful number in numerology.', advice: 'Think big — you have the rare ability to manifest ambitious visions into tangible reality.' },
    33: { title: 'Master Number — The Master Teacher', emoji: '📿', meaning: 'Spiritual teaching, compassion, healing. The rarest and most spiritually significant number.', advice: 'You\'re here to uplift humanity through love and teaching. Your compassion is your gift.' }
  };

  const m = meanings[angelNumber];
  const date = new Date(dateStr);
  const dayOfWeek = date.toLocaleDateString('en-AU', { weekday: 'long' });

  const results = document.getElementById('calc-results');
  const content = document.getElementById('results-content');
  results.classList.remove('hidden');

  content.innerHTML = `
    <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-4 text-center border border-indigo-100">
      <p class="text-sm text-gray-500 mb-1">Your Angel Number</p>
      <p class="text-6xl font-bold text-indigo-900 mb-2">${angelNumber}</p>
      <p class="text-3xl mb-2">${m.emoji}</p>
      <p class="text-xl font-bold text-indigo-800">${m.title}</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-100 p-5 mb-4">
      <p class="text-sm text-gray-700 leading-relaxed">${m.meaning}</p>
      <p class="text-sm text-indigo-700 mt-3 font-medium">💫 ${m.advice}</p>
    </div>
    <div class="bg-gray-50 rounded-xl p-5 mb-4">
      <p class="text-sm font-medium text-gray-700 mb-2">Your repeating angel number sequence:</p>
      <p class="text-3xl font-bold text-indigo-600 tracking-widest">${tripleAngel}</p>
      <p class="text-xs text-gray-500 mt-2">If you keep seeing ${tripleAngel}, numerology says the universe is sending you a message aligned with your life path.</p>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-gray-50 rounded-lg p-3 text-center">
        <p class="text-xs text-gray-500">Born on a</p>
        <p class="text-sm font-bold text-navy">${dayOfWeek}</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-3 text-center">
        <p class="text-xs text-gray-500">Digit sum</p>
        <p class="text-sm font-bold text-navy">${sum} → ${angelNumber}</p>
      </div>
    </div>
    <p class="text-xs text-gray-400 mt-4 text-center">Numerology is not scientifically proven. This calculator is for entertainment and curiosity only.</p>
  `;
}
