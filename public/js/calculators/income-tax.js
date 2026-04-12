function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const taxableIncome = parseFloat(document.getElementById('input-taxableIncome').value) || 0;
  const residency = document.getElementById('input-residency').value || 'resident';
  const fy = document.getElementById('input-financialYear').value || '2025-26';

  let tax = 0;
  let bracketRows = '';

  if (residency === 'resident') {
    // 2025-26 resident brackets
    const brackets = [
      { from: 0, to: 18200, rate: 0, base: 0 },
      { from: 18201, to: 45000, rate: 0.16, base: 0 },
      { from: 45001, to: 135000, rate: 0.30, base: 4288 },
      { from: 135001, to: 190000, rate: 0.37, base: 31288 },
      { from: 190001, to: Infinity, rate: 0.45, base: 51638 }
    ];

    if (fy === '2024-25') {
      // 2024-25 brackets (same Stage 3 rates apply from 1 Jul 2024)
      brackets[1].rate = 0.16;
      brackets[2].rate = 0.30;
    }

    for (const b of brackets) {
      if (taxableIncome >= b.from) {
        const taxableInBracket = Math.min(taxableIncome, b.to === Infinity ? taxableIncome : b.to) - b.from + 1;
        const taxInBracket = b.rate === 0 ? 0 : (b.from === brackets[0].from ? 0 : taxableInBracket * b.rate);
        const actualTaxable = Math.min(taxableIncome, b.to === Infinity ? taxableIncome : b.to) - b.from + (b.from === 0 ? 0 : 1);

        bracketRows += `<tr>
          <td class="px-3 py-1">${formatCurrency(b.from)} – ${b.to === Infinity ? '∞' : formatCurrency(b.to)}</td>
          <td class="px-3 py-1 text-center">${(b.rate * 100).toFixed(0)}%</td>
          <td class="px-3 py-1 text-right">${formatCurrency(actualTaxable * b.rate)}</td>
        </tr>`;
      }
    }

    if (taxableIncome <= 18200) tax = 0;
    else if (taxableIncome <= 45000) tax = (taxableIncome - 18200) * 0.16;
    else if (taxableIncome <= 135000) tax = 4288 + (taxableIncome - 45000) * 0.30;
    else if (taxableIncome <= 190000) tax = 31288 + (taxableIncome - 135000) * 0.37;
    else tax = 51638 + (taxableIncome - 190000) * 0.45;

  } else if (residency === 'foreign') {
    // Foreign resident rates 2025-26
    if (taxableIncome <= 135000) tax = taxableIncome * 0.30;
    else if (taxableIncome <= 190000) tax = 40500 + (taxableIncome - 135000) * 0.37;
    else tax = 60850 + (taxableIncome - 190000) * 0.45;

    bracketRows = `
      <tr><td class="px-3 py-1">$0 – $135,000</td><td class="px-3 py-1 text-center">30%</td><td class="px-3 py-1 text-right">${formatCurrency(Math.min(taxableIncome, 135000) * 0.30)}</td></tr>
      ${taxableIncome > 135000 ? `<tr><td class="px-3 py-1">$135,001 – $190,000</td><td class="px-3 py-1 text-center">37%</td><td class="px-3 py-1 text-right">${formatCurrency((Math.min(taxableIncome, 190000) - 135000) * 0.37)}</td></tr>` : ''}
      ${taxableIncome > 190000 ? `<tr><td class="px-3 py-1">$190,001+</td><td class="px-3 py-1 text-center">45%</td><td class="px-3 py-1 text-right">${formatCurrency((taxableIncome - 190000) * 0.45)}</td></tr>` : ''}
    `;
  } else {
    // Working holiday maker rates
    if (taxableIncome <= 45000) tax = taxableIncome * 0.15;
    else if (taxableIncome <= 135000) tax = 6750 + (taxableIncome - 45000) * 0.30;
    else if (taxableIncome <= 190000) tax = 33750 + (taxableIncome - 135000) * 0.37;
    else tax = 54100 + (taxableIncome - 190000) * 0.45;

    bracketRows = `
      <tr><td class="px-3 py-1">$0 – $45,000</td><td class="px-3 py-1 text-center">15%</td><td class="px-3 py-1 text-right">${formatCurrency(Math.min(taxableIncome, 45000) * 0.15)}</td></tr>
      ${taxableIncome > 45000 ? `<tr><td class="px-3 py-1">$45,001 – $135,000</td><td class="px-3 py-1 text-center">30%</td><td class="px-3 py-1 text-right">${formatCurrency((Math.min(taxableIncome, 135000) - 45000) * 0.30)}</td></tr>` : ''}
      ${taxableIncome > 135000 ? `<tr><td class="px-3 py-1">$135,001 – $190,000</td><td class="px-3 py-1 text-center">37%</td><td class="px-3 py-1 text-right">${formatCurrency((Math.min(taxableIncome, 190000) - 135000) * 0.37)}</td></tr>` : ''}
      ${taxableIncome > 190000 ? `<tr><td class="px-3 py-1">$190,001+</td><td class="px-3 py-1 text-center">45%</td><td class="px-3 py-1 text-right">${formatCurrency((taxableIncome - 190000) * 0.45)}</td></tr>` : ''}
    `;
  }

  // Medicare levy 2025-26: exempt ≤$27,222, phase-in 10c/$ to $34,028, full 2% above
  let medicare = 0;
  if (residency === 'resident') {
    if (taxableIncome > 34028) medicare = taxableIncome * 0.02;
    else if (taxableIncome > 27222) medicare = (taxableIncome - 27222) * 0.10;
  }
  const afterTax = taxableIncome - tax - medicare;
  const effectiveRate = taxableIncome > 0 ? ((tax + medicare) / taxableIncome * 100).toFixed(1) : '0.0';

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Taxable Income</span><span class="result-value">${formatCurrency(taxableIncome)}</span></div>
    <div class="result-row"><span class="result-label">Income Tax</span><span class="result-value text-red-600">-${formatCurrency(tax)}</span></div>
    ${residency === 'resident' ? `<div class="result-row"><span class="result-label">Medicare Levy (2%)</span><span class="result-value text-red-600">-${formatCurrency(medicare)}</span></div>` : ''}
    <div class="result-row font-bold"><span class="result-label">After-Tax Income</span><span class="result-value">${formatCurrency(afterTax)}</span></div>
    <div class="result-row"><span class="result-label">Effective Tax Rate</span><span class="result-value">${effectiveRate}%</span></div>
    <hr class="my-3">
    <h4 class="font-semibold mb-2">Tax Bracket Breakdown</h4>
    <table class="w-full text-sm">
      <thead><tr class="border-b"><th class="px-3 py-1 text-left">Bracket</th><th class="px-3 py-1 text-center">Rate</th><th class="px-3 py-1 text-right">Tax</th></tr></thead>
      <tbody>${bracketRows}</tbody>
      <tfoot><tr class="border-t font-bold"><td class="px-3 py-1">Total</td><td></td><td class="px-3 py-1 text-right">${formatCurrency(tax)}</td></tr></tfoot>
    </table>
  `;
}

function getTLDR() {
  const taxableIncome = parseFloat(document.getElementById('input-taxableIncome').value) || 0;
  if (taxableIncome <= 0) return '';
  const residency = document.getElementById('input-residency').value || 'resident';
  let tax = 0;
  if (residency === 'resident') {
    if (taxableIncome <= 18200) tax = 0;
    else if (taxableIncome <= 45000) tax = (taxableIncome - 18200) * 0.16;
    else if (taxableIncome <= 135000) tax = 4288 + (taxableIncome - 45000) * 0.30;
    else if (taxableIncome <= 190000) tax = 31288 + (taxableIncome - 135000) * 0.37;
    else tax = 51638 + (taxableIncome - 190000) * 0.45;
  } else if (residency === 'foreign') {
    if (taxableIncome <= 135000) tax = taxableIncome * 0.30;
    else if (taxableIncome <= 190000) tax = 40500 + (taxableIncome - 135000) * 0.37;
    else tax = 60850 + (taxableIncome - 190000) * 0.45;
  } else {
    if (taxableIncome <= 45000) tax = taxableIncome * 0.15;
    else if (taxableIncome <= 135000) tax = 6750 + (taxableIncome - 45000) * 0.30;
    else if (taxableIncome <= 190000) tax = 33750 + (taxableIncome - 135000) * 0.37;
    else tax = 54100 + (taxableIncome - 190000) * 0.45;
  }
  let medicare = 0;
  if (residency === 'resident') {
    if (taxableIncome > 34028) medicare = taxableIncome * 0.02;
    else if (taxableIncome > 27222) medicare = (taxableIncome - 27222) * 0.10;
  }
  const afterTax = taxableIncome - tax - medicare;
  const effectiveRate = ((tax + medicare) / taxableIncome * 100).toFixed(1);
  return 'On a ' + formatCurrency(taxableIncome) + ' taxable income you\'ll pay ' + formatCurrency(tax + medicare) + ' in tax' + (medicare > 0 ? ' (including ' + formatCurrency(medicare) + ' Medicare levy)' : '') + ', leaving ' + formatCurrency(afterTax) + ' after tax — an effective rate of ' + effectiveRate + '%.';
}
