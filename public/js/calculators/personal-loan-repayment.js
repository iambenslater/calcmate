function calculate() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const annualRate = (parseFloat(document.getElementById('input-interestRate').value) || 8.5) / 100;
  const termYears = parseInt(document.getElementById('input-loanTerm').value) || 3;
  const frequency = document.querySelector('input[name="input-repaymentFrequency"]:checked').value;

  if (loanAmount <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<div class="result-row"><span class="result-label" style="color:var(--error,#e53e3e)">Please enter a loan amount.</span></div>';
    return;
  }

  // Payments per year by frequency
  const freqMap = { weekly: 52, fortnightly: 26, monthly: 12 };
  const paymentsPerYear = freqMap[frequency] || 12;
  const totalPayments = termYears * paymentsPerYear;
  const ratePerPeriod = annualRate / paymentsPerYear;

  // Standard annuity formula: P = PV * r / (1 - (1+r)^-n)
  let repayment;
  if (ratePerPeriod === 0) {
    repayment = loanAmount / totalPayments;
  } else {
    repayment = loanAmount * ratePerPeriod / (1 - Math.pow(1 + ratePerPeriod, -totalPayments));
  }

  const totalRepaid = repayment * totalPayments;
  const totalInterest = totalRepaid - loanAmount;
  const effectiveMonthly = repayment * paymentsPerYear / 12;

  // Build amortisation schedule
  let balance = loanAmount;
  const schedule = [];
  for (let i = 1; i <= totalPayments; i++) {
    const interestComponent = balance * ratePerPeriod;
    const principalComponent = repayment - interestComponent;
    balance = Math.max(balance - principalComponent, 0);
    schedule.push({ period: i, interest: interestComponent, principal: principalComponent, balance });
  }

  // Summarise first 12 payments and last 12 payments (or full schedule if <= 24)
  const periodLabel = frequency === 'weekly' ? 'Week' : frequency === 'fortnightly' ? 'Fortnight' : 'Month';

  function scheduleRowsHTML(rows) {
    return rows.map(r => `
      <div class="result-row" style="font-size:0.88em">
        <span class="result-label">${periodLabel} ${r.period}</span>
        <span class="result-value">Interest ${fmtD(r.interest)} | Principal ${fmtD(r.principal)} | Balance ${fmtD(r.balance)}</span>
      </div>`).join('');
  }

  const first12 = schedule.slice(0, Math.min(12, schedule.length));
  const lastYear = schedule.slice(Math.max(0, schedule.length - 12));
  const showSplit = schedule.length > 24;

  const freqLabel = frequency.charAt(0).toUpperCase() + frequency.slice(1);

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <h4>Loan summary</h4>
    <div class="result-row"><span class="result-label">Loan amount</span><span class="result-value">${fmt(loanAmount)}</span></div>
    <div class="result-row"><span class="result-label">Interest rate</span><span class="result-value">${(annualRate * 100).toFixed(2)}% p.a.</span></div>
    <div class="result-row"><span class="result-label">Loan term</span><span class="result-value">${termYears} year${termYears !== 1 ? 's' : ''} (${totalPayments} payments)</span></div>
    <div class="result-row"><span class="result-label">Repayment frequency</span><span class="result-value">${freqLabel}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row font-bold"><span class="result-label">${freqLabel} repayment</span><span class="result-value">${fmtD(repayment)}</span></div>
    <div class="result-row"><span class="result-label">Effective monthly cost</span><span class="result-value">${fmtD(effectiveMonthly)}</span></div>
    <div class="result-row"><span class="result-label">Total interest paid</span><span class="result-value">${fmt(totalInterest)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Total amount repaid</span><span class="result-value">${fmt(totalRepaid)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <h4>Amortisation — first 12 ${periodLabel.toLowerCase()}s</h4>
    ${scheduleRowsHTML(first12)}
    ${showSplit ? `
    <hr style="border-color:var(--border);margin:12px 0">
    <h4>Amortisation — final 12 ${periodLabel.toLowerCase()}s</h4>
    ${scheduleRowsHTML(lastYear)}
    ` : ''}
  `;
}

function fmt(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function fmtD(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function getTLDR() {
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 0;
  const annualRate = (parseFloat(document.getElementById('input-interestRate').value) || 8.5) / 100;
  const termYears = parseInt(document.getElementById('input-loanTerm').value) || 3;
  const frequency = document.querySelector('input[name="input-repaymentFrequency"]:checked').value;

  if (loanAmount <= 0) return '';

  const freqMap = { weekly: 52, fortnightly: 26, monthly: 12 };
  const paymentsPerYear = freqMap[frequency] || 12;
  const totalPayments = termYears * paymentsPerYear;
  const ratePerPeriod = annualRate / paymentsPerYear;

  let repayment;
  if (ratePerPeriod === 0) {
    repayment = loanAmount / totalPayments;
  } else {
    repayment = loanAmount * ratePerPeriod / (1 - Math.pow(1 + ratePerPeriod, -totalPayments));
  }

  const totalRepaid = repayment * totalPayments;
  const totalInterest = totalRepaid - loanAmount;
  const freqLabel = frequency.charAt(0).toUpperCase() + frequency.slice(1);

  return 'A ' + fmt(loanAmount) + ' loan at ' + (annualRate * 100).toFixed(2) + '% over ' + termYears + ' year' + (termYears !== 1 ? 's' : '') + ' costs ' + fmtD(repayment) + ' ' + frequency + ', with ' + fmt(totalInterest) + ' in total interest paid (' + fmt(totalRepaid) + ' repaid overall).';
}
