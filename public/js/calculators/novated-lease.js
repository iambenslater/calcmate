function calculate() {
  const carPrice = parseFloat(document.getElementById('input-carPrice').value);
  const annualSalary = parseFloat(document.getElementById('input-annualSalary').value);
  const leaseTerm = parseInt(document.getElementById('input-leaseTerm').value);
  const annualKm = parseInt(document.getElementById('input-annualKm').value);
  const fuelType = document.querySelector('input[name="input-fuelType"]:checked').value;

  if (isNaN(carPrice) || carPrice <= 0) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Please enter a valid car price.</p>';
    document.getElementById('calc-results').classList.remove('hidden');
    return;
  }
  if (isNaN(annualSalary) || annualSalary <= 0) {
    document.getElementById('results-content').innerHTML =
      '<p class="text-red-600">Please enter a valid annual salary.</p>';
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

  // Australian tax brackets 2024-25
  function calcTax(income) {
    if (income <= 18200) return 0;
    if (income <= 45000) return (income - 18200) * 0.19;
    if (income <= 120000) return 5092 + (income - 45000) * 0.325;
    if (income <= 180000) return 29467 + (income - 120000) * 0.37;
    return 51667 + (income - 180000) * 0.45;
  }

  function marginalRate(income) {
    if (income <= 18200) return 0;
    if (income <= 45000) return 0.19;
    if (income <= 120000) return 0.325;
    if (income <= 180000) return 0.37;
    return 0.45;
  }

  // Running costs (annual)
  let fuelCostPerL, fuelConsumption;
  switch (fuelType) {
    case 'electric':
      // Electricity: ~2kWh/10km, $0.30/kWh
      fuelCostPerL = null;
      break;
    case 'diesel':
      fuelCostPerL = 2.05;
      fuelConsumption = 7.5; // L/100km
      break;
    case 'hybrid':
      fuelCostPerL = 1.95;
      fuelConsumption = 4.5;
      break;
    default: // petrol
      fuelCostPerL = 1.95;
      fuelConsumption = 9.5;
  }

  let annualFuelCost;
  if (fuelType === 'electric') {
    annualFuelCost = (annualKm / 10) * 2 * 0.30; // 2kWh per 10km at $0.30/kWh
  } else {
    annualFuelCost = (annualKm / 100) * fuelConsumption * fuelCostPerL;
  }

  const annualInsurance = 1500;
  const annualRego = 800;
  const annualMaintenance = fuelType === 'electric' ? 600 : 1000;
  const annualTyres = 500;

  const annualRunningCosts = annualFuelCost + annualInsurance + annualRego + annualMaintenance + annualTyres;

  // Lease payment: simple depreciation + interest
  // Residual value (ATO guidelines): varies by term
  const residualRates = { 1: 0.65, 2: 0.56, 3: 0.46, 4: 0.37, 5: 0.28 };
  const residualRate = residualRates[leaseTerm] || 0.46;
  const residualValue = carPrice * residualRate;
  const depreciation = carPrice - residualValue;

  const annualInterestRate = 0.07;
  // Average outstanding balance approximation
  const avgBalance = (carPrice + residualValue) / 2;
  const totalInterest = avgBalance * annualInterestRate * leaseTerm;
  const totalLeasePayments = depreciation + totalInterest;
  const monthlyLeasePayment = totalLeasePayments / (leaseTerm * 12);

  // Pre-tax deduction = lease + running costs (bundled)
  const monthlyRunning = annualRunningCosts / 12;
  const monthlyPreTaxDeduction = monthlyLeasePayment + monthlyRunning;
  const annualPreTaxDeduction = monthlyPreTaxDeduction * 12;

  // Tax saving
  const taxOnFullSalary = calcTax(annualSalary);
  const taxOnReducedSalary = calcTax(annualSalary - annualPreTaxDeduction);
  const annualTaxSaving = taxOnFullSalary - taxOnReducedSalary;

  // Medicare levy (2%)
  const medicareOnFull = annualSalary * 0.02;
  const medicareOnReduced = Math.max(0, (annualSalary - annualPreTaxDeduction)) * 0.02;
  const medicareSaving = medicareOnFull - medicareOnReduced;
  const totalAnnualSaving = annualTaxSaving + medicareSaving;

  // Net cost of novated lease per year (after tax saving)
  const netAnnualCostNovated = annualPreTaxDeduction - totalAnnualSaving;
  const netFortnightNovated = netAnnualCostNovated / 26;

  // Buying outright comparison (loan at 7% over same term)
  const buyMonthlyRepayment = (() => {
    const r = 0.07 / 12;
    const n = leaseTerm * 12;
    return carPrice * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  })();
  const buyTotalCost = (buyMonthlyRepayment * leaseTerm * 12) + annualRunningCosts * leaseTerm;
  const buyAnnualCost = buyTotalCost / leaseTerm;
  const buyFortnightCost = buyAnnualCost / 26;
  // After-tax cost of buying (no pre-tax benefit)
  const afterTaxBuyAnnual = buyAnnualCost; // no tax saving available

  const fortnightSaving = buyFortnightCost - netFortnightNovated;

  const html = `
    <h4>Running Costs (Annual)</h4>
    <div class="result-row">
      <span class="result-label">${fuelType === 'electric' ? 'Electricity' : 'Fuel'} (${annualKm.toLocaleString()} km/year)</span>
      <span class="result-value">${fmt(annualFuelCost)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Insurance</span>
      <span class="result-value">${fmt(annualInsurance)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Registration</span>
      <span class="result-value">${fmt(annualRego)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Maintenance</span>
      <span class="result-value">${fmt(annualMaintenance)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Tyres</span>
      <span class="result-value">${fmt(annualTyres)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Total annual running costs</span>
      <span class="result-value">${fmt(annualRunningCosts)}</span>
    </div>
    <hr>
    <h4>Lease Payment</h4>
    <div class="result-row">
      <span class="result-label">Vehicle price</span>
      <span class="result-value">${fmt(carPrice)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Residual value (${(residualRate * 100).toFixed(0)}% after ${leaseTerm} year${leaseTerm > 1 ? 's' : ''})</span>
      <span class="result-value">${fmt(residualValue)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Total depreciation</span>
      <span class="result-value">${fmt(depreciation)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Total interest (~7% p.a.)</span>
      <span class="result-value">${fmt(totalInterest)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Monthly lease payment</span>
      <span class="result-value">${fmt2(monthlyLeasePayment)}</span>
    </div>
    <hr>
    <h4>Pre-Tax Deduction &amp; Tax Saving</h4>
    <div class="result-row">
      <span class="result-label">Monthly pre-tax deduction (lease + running)</span>
      <span class="result-value">${fmt2(monthlyPreTaxDeduction)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Annual pre-tax deduction</span>
      <span class="result-value">${fmt(annualPreTaxDeduction)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Marginal tax rate</span>
      <span class="result-value">${(marginalRate(annualSalary) * 100).toFixed(0)}%</span>
    </div>
    <div class="result-row">
      <span class="result-label">Income tax saving</span>
      <span class="result-value">${fmt(annualTaxSaving)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Medicare levy saving</span>
      <span class="result-value">${fmt(medicareSaving)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Total annual tax saving</span>
      <span class="result-value">${fmt(totalAnnualSaving)}</span>
    </div>
    <hr>
    <h4>Novated Lease vs. Buying Outright</h4>
    <div class="result-row">
      <span class="result-label">Novated lease — net annual cost (after tax saving)</span>
      <span class="result-value">${fmt(netAnnualCostNovated)}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Buying outright — estimated annual cost (loan + running)</span>
      <span class="result-value">${fmt(buyAnnualCost)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Novated lease — net cost per fortnight</span>
      <span class="result-value">${fmt2(netFortnightNovated)}</span>
    </div>
    <div class="result-row font-bold">
      <span class="result-label">Buying outright — cost per fortnight</span>
      <span class="result-value">${fmt2(buyFortnightCost)}</span>
    </div>
    <div class="result-row font-bold" style="color: ${fortnightSaving >= 0 ? 'green' : 'red'}">
      <span class="result-label">Fortnightly saving with novated lease</span>
      <span class="result-value">${fortnightSaving >= 0 ? fmt2(fortnightSaving) : '-' + fmt2(Math.abs(fortnightSaving))}</span>
    </div>
    <p class="text-sm text-gray-500 mt-3">Estimates use 2024–25 tax brackets including Medicare levy. Residual values follow ATO guidelines. Running costs are estimates and will vary. This is not financial advice — consult a salary packaging provider for your specific situation. FBT may apply depending on your employer's arrangements.</p>
  `;

  document.getElementById('results-content').innerHTML = html;
  document.getElementById('calc-results').classList.remove('hidden');
}
