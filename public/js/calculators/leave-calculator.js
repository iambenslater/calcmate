function calculate() {
  const startStr = document.getElementById('input-startDate').value;
  const endStr = document.getElementById('input-endDate').value;
  const hoursPerWeek = parseFloat(document.getElementById('input-hoursPerWeek').value) || 38;
  const leaveLoading = parseFloat(document.getElementById('input-leaveLoading').value) || 17.5;

  if (!startStr || !endStr) { alert('Please select both dates.'); return; }

  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');

  if (end <= start) { alert('End date must be after start date.'); return; }

  const msPerDay = 86400000;
  const totalDays = (end - start) / msPerDay;
  const totalWeeks = totalDays / 7;
  const yearsOfService = totalWeeks / 52;

  // Annual leave: 4 weeks per year for full-time (38 hrs/week)
  // Pro-rata based on hours per week
  const ftRatio = hoursPerWeek / 38;
  const annualLeaveWeeks = 4 * yearsOfService * ftRatio;
  const annualLeaveHours = annualLeaveWeeks * hoursPerWeek;
  const annualLeaveDays = annualLeaveWeeks * 5; // 5 working days per week

  // Personal/carer's leave: 10 days per year for full-time
  const personalLeaveDays = 10 * yearsOfService * ftRatio;
  const personalLeaveHours = personalLeaveDays * (hoursPerWeek / 5);

  // Leave loading calculation (applied to annual leave)
  const leaveLoadingPercent = leaveLoading / 100;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Service Period</span><span class="result-value">${yearsOfService.toFixed(2)} years (${totalWeeks.toFixed(1)} weeks)</span></div>
    <div class="result-row"><span class="result-label">Hours per Week</span><span class="result-value">${hoursPerWeek} hrs (${(ftRatio * 100).toFixed(0)}% of full-time)</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>Annual Leave Accrued</strong>
    </div>
    <div class="result-row"><span class="result-label">Weeks</span><span class="result-value">${annualLeaveWeeks.toFixed(2)} weeks</span></div>
    <div class="result-row"><span class="result-label">Working Days</span><span class="result-value">${annualLeaveDays.toFixed(1)} days</span></div>
    <div class="result-row"><span class="result-label">Hours</span><span class="result-value">${annualLeaveHours.toFixed(1)} hours</span></div>
    <div class="result-row"><span class="result-label">Leave Loading Rate</span><span class="result-value">${leaveLoading}%</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>Personal/Carer's Leave Accrued</strong>
    </div>
    <div class="result-row"><span class="result-label">Days</span><span class="result-value">${personalLeaveDays.toFixed(1)} days</span></div>
    <div class="result-row"><span class="result-label">Hours</span><span class="result-value">${personalLeaveHours.toFixed(1)} hours</span></div>
    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>Accrual Rates (per year)</strong>
    </div>
    <div class="result-row"><span class="result-label">Annual Leave</span><span class="result-value">${(4 * ftRatio).toFixed(2)} weeks/year</span></div>
    <div class="result-row"><span class="result-label">Personal Leave</span><span class="result-value">${(10 * ftRatio).toFixed(1)} days/year</span></div>
    <p class="text-sm text-gray-500 mt-4">Under the National Employment Standards (NES), full-time employees accrue 4 weeks of paid annual leave per year. Part-time employees accrue pro-rata. Leave loading of 17.5% is common but depends on your award or agreement. Personal/carer's leave accrues at 10 days per year for full-time employees.</p>
  `;
}
