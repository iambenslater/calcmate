function calculate() {
  const advertisedRate = (parseFloat(document.getElementById('input-advertisedRate').value) || 6.0) / 100;
  const loanAmount = parseFloat(document.getElementById('input-loanAmount').value) || 500000;
  const loanTermYears = parseInt(document.getElementById('input-loanTerm').value) || 30;
  const applicationFee = parseFloat(document.getElementById('input-applicationFee').value) || 0;
  const annualFee = parseFloat(document.getElementById('input-annualFee').value) || 0;
  const monthlyFee = parseFloat(document.getElementById('input-monthlyFee').value) || 0;
  const valuationFee = parseFloat(document.getElementById('input-valuationFee').value) || 0;
  const otherUpfront = parseFloat(document.getElementById('input-otherUpfrontFees').value) || 0;

  if (loanAmount <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<div class="result-row"><span class="result-label" style="color:var(--error,#e53e3e)">Please enter a loan amount.</span></div>';
    return;
  }

  const n = loanTermYears * 12; // total months

  // Monthly repayment at advertised rate
  const monthlyAdv = advertisedRate / 12;
  const repayment = monthlyAdv > 0
    ? loanAmount * monthlyAdv / (1 - Math.pow(1 + monthlyAdv, -n))
    : loanAmount / n;

  const totalRepayments = repayment * n;
  const totalInterestAdv = totalRepayments - loanAmount;

  // Total fees
  const upfrontFees = applicationFee + valuationFee + otherUpfront;
  const totalFees = upfrontFees + (annualFee * loanTermYears) + (monthlyFee * n);

  // --- Solve for comparison rate (user's scenario) ---
  // Comparison rate is the rate r such that:
  // PV of (repayment + monthlyFee) cashflows, discounted at r, minus upfrontFees, minus (annualFee discounted at r) = loanAmount
  // We use bisection to find r (monthly) then annualise.

  function npv(monthlyRate) {
    let pv = 0;
    for (let t = 1; t <= n; t++) {
      const discount = Math.pow(1 + monthlyRate, -t);
      pv += (repayment + monthlyFee) * discount;
      // annual fee: paid at end of each year (month 12, 24 ... n)
      if (t % 12 === 0) {
        pv += annualFee * discount;
      }
    }
    return pv - upfrontFees - loanAmount;
  }

  // Bisection
  let lo = 0.00001;
  let hi = 0.10; // 10% monthly = unreasonable upper bound, but bisection is robust
  let compRateMonthly = monthlyAdv;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) {
      lo = mid;
    } else {
      hi = mid;
    }
    if (hi - lo < 1e-10) break;
  }
  compRateMonthly = (lo + hi) / 2;
  const compRateAnnual = compRateMonthly * 12;
  const rateDiff = compRateAnnual - advertisedRate;

  // --- Australian regulatory comparison rate: $150,000 over 25 years ---
  const regLoan = 150000;
  const regN = 25 * 12;
  const regRepayment = monthlyAdv > 0
    ? regLoan * monthlyAdv / (1 - Math.pow(1 + monthlyAdv, -regN))
    : regLoan / regN;

  // Regulatory fees scaled to the $150k/25yr loan
  const regUpfront = upfrontFees; // upfront fees don't scale — they're fixed
  const regMonthlyFee = monthlyFee;
  const regAnnualFee = annualFee;

  function npvReg(monthlyRate) {
    let pv = 0;
    for (let t = 1; t <= regN; t++) {
      const discount = Math.pow(1 + monthlyRate, -t);
      pv += (regRepayment + regMonthlyFee) * discount;
      if (t % 12 === 0) {
        pv += regAnnualFee * discount;
      }
    }
    return pv - regUpfront - regLoan;
  }

  let rLo = 0.00001;
  let rHi = 0.10;
  for (let i = 0; i < 200; i++) {
    const mid = (rLo + rHi) / 2;
    if (npvReg(mid) > 0) {
      rLo = mid;
    } else {
      rHi = mid;
    }
    if (rHi - rLo < 1e-10) break;
  }
  const regCompRateAnnual = ((rLo + rHi) / 2) * 12;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <h4>Your loan scenario</h4>
    <div class="result-row"><span class="result-label">Loan amount</span><span class="result-value">${fmt(loanAmount)}</span></div>
    <div class="result-row"><span class="result-label">Loan term</span><span class="result-value">${loanTermYears} years</span></div>
    <div class="result-row"><span class="result-label">Advertised rate</span><span class="result-value">${pct(advertisedRate)}</span></div>
    <div class="result-row"><span class="result-label">Monthly repayment</span><span class="result-value">${fmtD(repayment)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <h4>Fees</h4>
    <div class="result-row"><span class="result-label">Total upfront fees</span><span class="result-value">${fmt(upfrontFees)}</span></div>
    <div class="result-row"><span class="result-label">Total ongoing fees (life of loan)</span><span class="result-value">${fmt(totalFees - upfrontFees)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Total fees</span><span class="result-value">${fmt(totalFees)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <h4>True cost</h4>
    <div class="result-row"><span class="result-label">Total interest (advertised rate)</span><span class="result-value">${fmt(totalInterestAdv)}</span></div>
    <div class="result-row"><span class="result-label">Total repayments</span><span class="result-value">${fmt(totalRepayments)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Total cost (repayments + fees)</span><span class="result-value">${fmt(totalRepayments + totalFees)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <h4>Comparison rates</h4>
    <div class="result-row"><span class="result-label">Advertised rate</span><span class="result-value">${pct(advertisedRate)}</span></div>
    <div class="result-row font-bold"><span class="result-label">Your actual scenario comparison rate</span><span class="result-value">${pct(compRateAnnual)}</span></div>
    <div class="result-row"><span class="result-label">Rate difference (fees impact)</span><span class="result-value">+${pct(rateDiff)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Regulatory comparison rate</span><span class="result-value">${pct(regCompRateAnnual)}</span></div>
    <div class="result-row" style="font-size:0.82em;color:#718096"><span class="result-label">Australian law requires lenders to display a comparison rate calculated on a $150,000 loan over 25 years — regardless of actual loan size. Your scenario rate above is more meaningful for your actual borrowing.</span></div>
  `;
}

function fmt(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function fmtD(n) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function pct(r) {
  return (r * 100).toFixed(2) + '% p.a.';
}
