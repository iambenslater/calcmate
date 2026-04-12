function calculate() {
  const amount = parseFloat(document.getElementById('input-amount').value) || 0;
  const fromCurrency = document.getElementById('input-fromCurrency').value;
  const toCurrency = document.getElementById('input-toCurrency').value;

  if (amount <= 0 || !fromCurrency || !toCurrency) {
    document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter a valid amount and select currencies.</p>';
    return;
  }

  // Hardcoded rates relative to AUD (approximate April 2026)
  const ratesFromAUD = {
    AUD: 1.00,
    USD: 0.64,
    GBP: 0.51,
    EUR: 0.59,
    NZD: 1.10,
    JPY: 97.50,
    CNY: 4.65,
    CAD: 0.89,
    SGD: 0.86,
    HKD: 5.00,
    INR: 53.80,
  };

  const fromRate = ratesFromAUD[fromCurrency];
  const toRate = ratesFromAUD[toCurrency];

  if (!fromRate || !toRate) { document.getElementById('calc-results').classList.remove('hidden'); document.getElementById('results-content').innerHTML = '<p class="text-red-600">Unsupported currency.</p>'; return; }

  // Convert: amount in fromCurrency -> AUD -> toCurrency
  const amountInAUD = amount / fromRate;
  const result = amountInAUD * toRate;
  const exchangeRate = toRate / fromRate;
  const inverseRate = fromRate / toRate;

  const symbols = {
    AUD: 'A$', USD: 'US$', GBP: '\u00a3', EUR: '\u20ac', NZD: 'NZ$',
    JPY: '\u00a5', CNY: '\u00a5', CAD: 'C$', SGD: 'S$', HKD: 'HK$', INR: '\u20b9'
  };

  const names = {
    AUD: 'Australian Dollar', USD: 'US Dollar', GBP: 'British Pound', EUR: 'Euro',
    NZD: 'New Zealand Dollar', JPY: 'Japanese Yen', CNY: 'Chinese Yuan',
    CAD: 'Canadian Dollar', SGD: 'Singapore Dollar', HKD: 'Hong Kong Dollar', INR: 'Indian Rupee'
  };

  const fromSym = symbols[fromCurrency] || fromCurrency;
  const toSym = symbols[toCurrency] || toCurrency;

  // Show conversion in a few other currencies for reference
  let refRows = '';
  const refCurrencies = ['AUD', 'USD', 'GBP', 'EUR', 'NZD', 'JPY'].filter(c => c !== fromCurrency && c !== toCurrency);
  for (const c of refCurrencies.slice(0, 4)) {
    const refResult = amountInAUD * ratesFromAUD[c];
    const refSym = symbols[c] || c;
    refRows += `<div class="result-row"><span class="result-label">${names[c]}</span><span class="result-value">${refSym}${refResult.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">${names[fromCurrency]}</span><span class="result-value">${fromSym}${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
    <div class="result-row" style="font-size: 1.1em; font-weight: bold;"><span class="result-label">${names[toCurrency]}</span><span class="result-value">${toSym}${result.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
    <div class="result-row"><span class="result-label">Exchange Rate</span><span class="result-value">1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}</span></div>
    <div class="result-row"><span class="result-label">Inverse Rate</span><span class="result-value">1 ${toCurrency} = ${inverseRate.toFixed(4)} ${fromCurrency}</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>Also Equals</strong>
    </div>
    ${refRows}
    <p class="text-sm text-gray-500 mt-4">Rates are approximate and for illustrative purposes only. For live rates, check your bank or a service like XE.com. Actual exchange rates will differ and may include fees and spreads.</p>
  `;
}

function getTLDR() {
  const amount = parseFloat(document.getElementById('input-amount').value) || 0;
  const fromCurrency = document.getElementById('input-fromCurrency').value;
  const toCurrency = document.getElementById('input-toCurrency').value;
  if (amount <= 0 || !fromCurrency || !toCurrency) return '';
  const ratesFromAUD = {
    AUD: 1.00, USD: 0.64, GBP: 0.51, EUR: 0.59, NZD: 1.10,
    JPY: 97.50, CNY: 4.65, CAD: 0.89, SGD: 0.86, HKD: 5.00, INR: 53.80,
  };
  const symbols = { AUD: 'A$', USD: 'US$', GBP: '£', EUR: '€', NZD: 'NZ$', JPY: '¥', CNY: '¥', CAD: 'C$', SGD: 'S$', HKD: 'HK$', INR: '₹' };
  const fromRate = ratesFromAUD[fromCurrency];
  const toRate = ratesFromAUD[toCurrency];
  if (!fromRate || !toRate) return '';
  const result = (amount / fromRate) * toRate;
  const exchangeRate = toRate / fromRate;
  const fromSym = symbols[fromCurrency] || fromCurrency;
  const toSym = symbols[toCurrency] || toCurrency;
  return fromSym + amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + fromCurrency + ' converts to ' + toSym + result.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + toCurrency + ' at a rate of 1 ' + fromCurrency + ' = ' + exchangeRate.toFixed(4) + ' ' + toCurrency + '.';
}
