function calculate() {
  const caravanPrice = parseFloat(document.getElementById('input-caravanPrice').value);
  const deposit = parseFloat(document.getElementById('input-deposit').value) || 0;
  const interestRate = parseFloat(document.getElementById('input-interestRate').value);
  const loanTermYears = parseInt(document.getElementById('input-loanTerm').value);
  const includeInsurance = document.getElementById('input-includeInsurance').checked;

  if (isNaN(caravanPrice) || caravanPrice <= 0) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Please enter a valid caravan price.</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }
  if (isNaN(interestRate) || interestRate <= 0) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Please enter a valid interest rate.</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }
  if (deposit >= caravanPrice) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Deposit cannot exceed the caravan price.</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }

  const fmt = v => new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: 'AUD',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(v);

  const fmt2 = v => new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: 'AUD',
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(v);

  const annualInsuranceCost = 1200;
  const loanAmount = caravanPrice - deposit;
  const monthlyRate = (interestRate / 100) / 12;

  function monthlyRepayment(principal, months, mRate) {
    if (mRate === 0) return principal / months;
    return principal * (mRate * Math.pow(1 + mRate, months)) / (Math.pow(1 + mRate, months) - 1);
  }

  const months = loanTermYears * 12;
  const baseMonthlyRepayment = monthlyRepayment(loanAmount, months, monthlyRate);
  const totalLoanRepayments = baseMonthlyRepayment * months;
  const totalInterest = totalLoanRepayments - loanAmount;

  const insuranceTotal = includeInsurance ? annualInsuranceCost * loanTermYears : 0;
  const insuranceMonthly = includeInsurance ? annualInsuranceCost / 12 : 0;

  const totalMonthly = baseMonthlyRepayment + insuranceMonthly;
  const totalCost = caravanPrice + totalInterest + insuranceTotal;

  // Term comparison table
  const terms = [3, 5, 7, 10];
  let comparisonRows = '';
  for (const t of terms) {
    const tMonths = t * 12;
    const tRepayment = monthlyRepayment(loanAmount, tMonths, monthlyRate);
    const tTotal = tRepayment * tMonths + (includeInsurance ? annualInsuranceCost * t : 0);
    const tInterest = (tRepayment * tMonths) - loanAmount;
    const isSelected = t === loanTermYears;
    comparisonRows += `
      <div class="result-row${isSelected ? ' font-bold' : ''}">
        <span class="result-label">${t}-year term${isSelected ? ' (selected)' : ''}</span>
        <span class="result-value">${fmt2(tRepayment + (includeInsurance ? insuranceMonthly : 0))}/mo · ${fmt(tInterest)} interest · ${fmt(tTotal)} total</span>
      </div>
    `;
  }

  const html = `
    <h4>Loan Summary</h4>
    <div class="result-row">
      <span class="result-label">Caravan price</span>
      <span class="result-value">${fmt(caravanPrice)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Deposit</span>
      <span class="result-value">${fmt(deposit)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Loan amount</span>
      <span class="result-value">${fmt(loanAmount)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Interest rate</span>
      <span class="result-value">${interestRate}% p.a.</span>
    </div>
    <div class="result-row">
      <span class="result-label">Loan term</span>
      <span class="result-value">${loanTermYears} years (${months} months)</span>
    </div>
    <hr>
    <h4>Monthly Repayments</h4>
    <div class="result-row">
      <span class="result-label">Principal &amp; interest repayment</span>
      <span class="result-value">${fmt2(baseMonthlyRepayment)}/month</span>
    </div>
    ${includeInsurance ? `
    <div class="result-row">
      <span class="result-label">Caravan insurance (~$1,200/year)</span>
      <span class="result-value">${fmt2(insuranceMonthly)}/month</span>
    </div>` : ''}
    <div class="result-row font-bold">
      <span class="result-label">Total monthly payment</span>
      <span class="result-value">${fmt2(totalMonthly)}/month</span>
    </div>
    <hr>
    <h4>Total Cost Over ${loanTermYears} Years</h4>
    <div class="result-row">
      <span class="result-label">Total loan repayments</span>
      <span class="result-value">${fmt(totalLoanRepayments)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Total interest payable</span>
      <span class="result-value">${fmt(totalInterest)}</span>
    </div>
    ${includeInsurance ? `
    <div class="result-row">
      <span class="result-label">Total insurance (${loanTermYears} years)</span>
      <span class="result-value">${fmt(insuranceTotal)}</span>
    </div>` : ''}
    <div class="result-row font-bold">
      <span class="result-label">Total cost of ownership</span>
      <span class="result-value">${fmt(totalCost)}</span>
    </div>
    <hr>
    <h4>Term Comparison</h4>
    ${comparisonRows}
    <hr>
    <h4>Balloon Payment Option</h4>
    <div class="result-row">
      <span class="result-label">What is a balloon payment?</span>
      <span class="result-value"></span>
    </div>
    <p class="text-sm text-gray-600 mt-1 mb-2">A balloon payment defers a lump sum (typically 20–40% of the loan) to the end of the term, lowering your monthly repayments during the loan. It suits buyers who expect a lump sum at loan end (e.g., from savings, sale, or refinancing). Ask your lender about a residual or balloon option.</p>
    ${(() => {
      const balloonPct = 0.25;
      const balloon = loanAmount * balloonPct;
      const reducedPrincipal = loanAmount - balloon;
      const balloonMonthly = monthlyRepayment(reducedPrincipal, months, monthlyRate);
      const balloonSaving = baseMonthlyRepayment - balloonMonthly;
      return `
      <div class="result-row">
        <span class="result-label">Example: 25% balloon (${fmt(balloon)})</span>
        <span class="result-value">~${fmt2(balloonMonthly)}/mo (saves ~${fmt2(balloonSaving)}/mo)</span>
      </div>`;
    })()}
    <p class="text-sm text-gray-500 mt-3">Calculations are estimates only. Actual repayments may vary based on lender fees and terms. Caravan loans in Australia are typically personal loans or secured asset finance — rates and terms vary between lenders.</p>
  `;

  document.getElementById('results-content').innerHTML = html;
  document.getElementById('calc-results').classList.remove('hidden');
}

function getTLDR() {
  var caravanPrice = parseFloat(document.getElementById('input-caravanPrice').value);
  var deposit = parseFloat(document.getElementById('input-deposit').value) || 0;
  var interestRate = parseFloat(document.getElementById('input-interestRate').value);
  var loanTermYears = parseInt(document.getElementById('input-loanTerm').value);
  var includeInsurance = document.getElementById('input-includeInsurance').checked;
  if (isNaN(caravanPrice) || caravanPrice <= 0 || isNaN(interestRate) || interestRate <= 0) return '';
  var loanAmount = caravanPrice - deposit;
  var months = loanTermYears * 12;
  var monthlyRate = (interestRate / 100) / 12;
  var baseMonthly = monthlyRate === 0 ? loanAmount / months : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  var totalInterest = baseMonthly * months - loanAmount;
  var insuranceMonthly = includeInsurance ? 1200 / 12 : 0;
  var totalMonthly = baseMonthly + insuranceMonthly;
  var fmt2 = function(v) { return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v); };
  return 'A ' + fmt2(caravanPrice) + ' caravan with a ' + fmt2(deposit) + ' deposit means ' + fmt2(loanAmount) + ' financed over ' + loanTermYears + ' years at ' + interestRate + '% p.a. — your monthly repayments are ' + fmt2(totalMonthly) + (includeInsurance ? ' (including insurance)' : '') + ', with ' + fmt2(totalInterest) + ' in total interest.';
}
