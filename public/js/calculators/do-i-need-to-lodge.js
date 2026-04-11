function calculate() {
  const totalIncome = parseFloat(document.getElementById('input-totalIncome').value) || 0;
  const incomeType = document.getElementById('input-incomeType').value;
  const residency = document.getElementById('input-residencyStatus').value;
  const age = document.getElementById('input-age').value;

  // 2024-25 thresholds
  const thresholds = {
    'resident': { 'under-65': 18200, '65-plus': 32279 },
    'foreign-resident': { 'under-65': 1, '65-plus': 1 }, // must lodge from $1
    'working-holiday': { 'under-65': 1, '65-plus': 1 }
  };

  const resKey = residency || 'resident';
  const ageKey = age || 'under-65';
  const threshold = (thresholds[resKey] && thresholds[resKey][ageKey]) || 18200;

  let mustLodge = false;
  let reasons = [];

  // Income threshold check
  if (totalIncome >= threshold) {
    mustLodge = true;
    reasons.push(`Your income of ${fmt(totalIncome)} exceeds the ${fmt(threshold)} tax-free threshold`);
  }

  // Business/investment income - always lodge if any
  if (incomeType === 'business') {
    mustLodge = true;
    reasons.push('You have business income and must lodge regardless of amount');
  }

  if (incomeType === 'foreign') {
    mustLodge = true;
    reasons.push('You have foreign income which must be declared');
  }

  if (incomeType === 'investments' && totalIncome > 0) {
    reasons.push('You have investment income - you may be able to claim deductions by lodging');
  }

  // Foreign residents must always lodge
  if (resKey === 'foreign-resident' && totalIncome > 0) {
    mustLodge = true;
    reasons.push('Foreign residents must lodge for any Australian-sourced income');
  }

  const needToLodge = mustLodge;
  const shouldConsider = !mustLodge && totalIncome > 0;

  const resLabels = {
    'resident': 'Australian Resident',
    'foreign-resident': 'Foreign Resident',
    'working-holiday': 'Working Holiday Maker'
  };

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Total Income</span><span class="result-value">${fmt(totalIncome)}</span></div>
    <div class="result-row"><span class="result-label">Income Type</span><span class="result-value">${incomeType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span></div>
    <div class="result-row"><span class="result-label">Residency Status</span><span class="result-value">${resLabels[resKey] || resKey}</span></div>
    <div class="result-row"><span class="result-label">Age Group</span><span class="result-value">${ageKey === '65-plus' ? '65 or older' : 'Under 65'}</span></div>
    <div class="result-row"><span class="result-label">Tax-free Threshold</span><span class="result-value">${fmt(threshold)}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row highlight" style="color:${needToLodge ? 'var(--error)' : 'var(--success)'}">
      <span class="result-label">Do you need to lodge?</span>
      <span class="result-value">${needToLodge ? 'Yes - you likely need to lodge' : 'Probably not required'}</span>
    </div>
    ${reasons.length > 0 ? `<div style="margin-top:8px">${reasons.map(r => `<div class="result-row"><span class="result-label">Reason</span><span class="result-value">${r}</span></div>`).join('')}</div>` : ''}
    ${shouldConsider ? '<p style="margin-top:12px;font-size:0.85rem;color:var(--text-muted)">Even if not required, lodging may entitle you to a refund of tax withheld or government payments.</p>' : ''}
    <p style="margin-top:8px;font-size:0.85rem;color:var(--text-muted)">This is a simplified guide. Check the ATO website or consult a tax professional for your specific situation.</p>
  `;
}

function fmt(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
