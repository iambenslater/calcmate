function calculate() {
  const amount = parseFloat(document.getElementById('input-amount').value) || 0;
  const mode = document.querySelector('input[name="input-direction"]:checked')?.value ||
               document.getElementById('input-direction')?.value || 'add';

  if (amount <= 0) { alert('Please enter a valid amount.'); return; }

  let gstAmount, exGst, incGst, description;

  switch (mode) {
    case 'add':
      // Add GST to ex-GST price
      exGst = amount;
      gstAmount = amount * 0.10;
      incGst = amount + gstAmount;
      description = 'Adding 10% GST to ex-GST amount';
      break;
    case 'remove':
      // Remove GST from inc-GST price
      incGst = amount;
      gstAmount = amount / 11;
      exGst = amount - gstAmount;
      description = 'Removing GST from GST-inclusive amount';
      break;
    case 'find':
      // Find GST component of inc-GST price
      incGst = amount;
      gstAmount = amount / 11;
      exGst = amount - gstAmount;
      description = 'Finding GST component of inclusive amount';
      break;
    default:
      alert('Invalid mode.'); return;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">GST Amount</span><span class="result-value">${fmt(gstAmount)}</span></div>
    <div class="result-row"><span class="result-label">Price Excluding GST</span><span class="result-value">${fmt(exGst)}</span></div>
    <div class="result-row"><span class="result-label">Price Including GST</span><span class="result-value">${fmt(incGst)}</span></div>
    <div class="result-row"><span class="result-label">GST Rate</span><span class="result-value">10%</span></div>
    <div class="result-row"><span class="result-label">Calculation</span><span class="result-value">${description}</span></div>
    <p class="text-sm text-gray-500 mt-4">The Australian Goods and Services Tax (GST) is 10%. To add GST, multiply by 1.1. To find the GST component of a GST-inclusive price, divide by 11.</p>
  `;
}

function fmt(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
