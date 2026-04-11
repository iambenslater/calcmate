function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const netIncome = parseFloat(document.getElementById('input-netIncome').value) || 0;
  const otherIncome = parseFloat(document.getElementById('input-otherIncome').value) || 0;
  const income = netIncome + otherIncome;
  const housing = parseFloat(document.getElementById('input-housing').value) || 0;
  const transport = parseFloat(document.getElementById('input-transport').value) || 0;
  const food = parseFloat(document.getElementById('input-groceries').value) || 0;
  const utilities = parseFloat(document.getElementById('input-utilities').value) || 0;
  const entertainment = parseFloat(document.getElementById('input-entertainment').value) || 0;
  const insurance = parseFloat(document.getElementById('input-insurance').value) || 0;
  const subscriptions = parseFloat(document.getElementById('input-subscriptions').value) || 0;
  const personalCare = parseFloat(document.getElementById('input-personalCare').value) || 0;
  const savings = 0;
  const other = parseFloat(document.getElementById('input-otherExpenses').value) || 0;

  const totalExpenses = housing + transport + food + utilities + entertainment + insurance + subscriptions + personalCare + savings + other;
  const remaining = income - totalExpenses;

  const categories = [
    { name: 'Housing', amount: housing, color: '#3B82F6' },
    { name: 'Transport', amount: transport, color: '#10B981' },
    { name: 'Food & Groceries', amount: food, color: '#F59E0B' },
    { name: 'Utilities', amount: utilities, color: '#EF4444' },
    { name: 'Entertainment', amount: entertainment, color: '#8B5CF6' },
    { name: 'Savings', amount: savings, color: '#06B6D4' },
    { name: 'Other', amount: other, color: '#6B7280' }
  ];

  const pct = (amount) => income > 0 ? ((amount / income) * 100).toFixed(1) : '0.0';

  // Build percentage bar chart
  let barChart = '';
  for (const cat of categories) {
    if (cat.amount > 0) {
      const widthPct = income > 0 ? Math.min((cat.amount / income) * 100, 100) : 0;
      barChart += `
        <div class="mb-2">
          <div class="flex justify-between text-sm mb-1">
            <span>${cat.name}</span>
            <span>${formatCurrency(cat.amount)} (${pct(cat.amount)}%)</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4">
            <div class="h-4 rounded-full" style="width: ${widthPct}%; background-color: ${cat.color};"></div>
          </div>
        </div>
      `;
    }
  }

  // 50/30/20 rule comparison
  const needs = housing + transport + food + utilities;
  const wants = entertainment + other;
  const savingsTotal = savings;
  const rule50 = income * 0.50;
  const rule30 = income * 0.30;
  const rule20 = income * 0.20;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Total Income</span><span class="result-value">${formatCurrency(income)}</span></div>
    <div class="result-row"><span class="result-label">Total Expenses</span><span class="result-value text-red-600">${formatCurrency(totalExpenses)}</span></div>
    <div class="result-row font-bold"><span class="result-label">${remaining >= 0 ? 'Surplus' : 'Deficit'}</span><span class="result-value ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency(Math.abs(remaining))}</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-3">Spending Breakdown</h4>
    ${barChart}
    <hr class="my-3">
    <h4 class="font-semibold mb-2">50/30/20 Rule Comparison</h4>
    <table class="w-full text-sm">
      <thead><tr class="border-b"><th class="px-2 py-1 text-left">Category</th><th class="px-2 py-1 text-right">Actual</th><th class="px-2 py-1 text-right">Guideline</th><th class="px-2 py-1 text-right">Status</th></tr></thead>
      <tbody>
        <tr>
          <td class="px-2 py-1">Needs (50%)</td>
          <td class="px-2 py-1 text-right">${formatCurrency(needs)} (${pct(needs)}%)</td>
          <td class="px-2 py-1 text-right">${formatCurrency(rule50)}</td>
          <td class="px-2 py-1 text-right ${needs <= rule50 ? 'text-green-600' : 'text-red-600'}">${needs <= rule50 ? 'On track' : 'Over'}</td>
        </tr>
        <tr>
          <td class="px-2 py-1">Wants (30%)</td>
          <td class="px-2 py-1 text-right">${formatCurrency(wants)} (${pct(wants)}%)</td>
          <td class="px-2 py-1 text-right">${formatCurrency(rule30)}</td>
          <td class="px-2 py-1 text-right ${wants <= rule30 ? 'text-green-600' : 'text-red-600'}">${wants <= rule30 ? 'On track' : 'Over'}</td>
        </tr>
        <tr>
          <td class="px-2 py-1">Savings (20%)</td>
          <td class="px-2 py-1 text-right">${formatCurrency(savingsTotal)} (${pct(savingsTotal)}%)</td>
          <td class="px-2 py-1 text-right">${formatCurrency(rule20)}</td>
          <td class="px-2 py-1 text-right ${savingsTotal >= rule20 ? 'text-green-600' : 'text-amber-600'}">${savingsTotal >= rule20 ? 'On track' : 'Below'}</td>
        </tr>
      </tbody>
    </table>
  `;
}
