function calculate() {
  const carValue = parseFloat(document.getElementById('input-carValue').value) || 0;
  const daysAvailable = parseInt(document.getElementById('input-daysAvailable').value) || 365;
  const employeeContribution = parseFloat(document.getElementById('input-employeeContribution').value) || 0;

  // Statutory method: flat 20% statutory fraction
  const statutoryFraction = 0.20;
  const taxableValue = (carValue * statutoryFraction * (daysAvailable / 365)) - employeeContribution;
  const adjustedTaxable = Math.max(0, taxableValue);

  // FBT rate is 47%
  const fbtRate = 0.47;
  // Gross-up rate (Type 1 - GST applies) = 2.0802
  const grossUpRate = 2.0802;
  const grossedUpValue = adjustedTaxable * grossUpRate;
  const fbtPayable = grossedUpValue * fbtRate;

  // Type 2 (no GST) gross-up = 1.8868
  const grossUpRate2 = 1.8868;
  const grossedUpValue2 = adjustedTaxable * grossUpRate2;
  const fbtPayable2 = grossedUpValue2 * fbtRate;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Car Base Value</span><span class="result-value">${fmt(carValue)}</span></div>
    <div class="result-row"><span class="result-label">Days Available</span><span class="result-value">${daysAvailable} days</span></div>
    <div class="result-row"><span class="result-label">Statutory Fraction</span><span class="result-value">20%</span></div>
    <div class="result-row"><span class="result-label">Employee Contribution</span><span class="result-value">${fmt(employeeContribution)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row"><span class="result-label">Taxable Value</span><span class="result-value">${fmt(adjustedTaxable)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Type 1 (GST Applies)</span><span class="result-value"></span></div>
    <div class="result-row"><span class="result-label">Grossed-up Value (x ${grossUpRate})</span><span class="result-value">${fmt(grossedUpValue)}</span></div>
    <div class="result-row highlight"><span class="result-label">FBT Payable (47%)</span><span class="result-value">${fmt(fbtPayable)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row" style="font-weight:600"><span class="result-label">Type 2 (No GST)</span><span class="result-value"></span></div>
    <div class="result-row"><span class="result-label">Grossed-up Value (x ${grossUpRate2})</span><span class="result-value">${fmt(grossedUpValue2)}</span></div>
    <div class="result-row"><span class="result-label">FBT Payable (47%)</span><span class="result-value">${fmt(fbtPayable2)}</span></div>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
