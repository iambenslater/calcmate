function calculate() {
  const dobStr = document.getElementById('input-childDOB').value;
  const state = document.getElementById('input-state').value;

  if (!dobStr) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p>Please enter your child\'s date of birth.</p>';
    return;
  }

  const dob = new Date(dobStr + 'T00:00:00');

  // State cutoff dates for starting Prep/Kindergarten/Foundation
  // Child must turn 5 by this date in the year they start
  const cutoffs = {
    'qld':  { cutoff: '06-30', gradeLabel: 'Prep', note: 'Must turn 5 by 30 June' },
    'nsw':  { cutoff: '07-31', gradeLabel: 'Kindergarten', note: 'Must turn 5 by 31 July' },
    'vic':  { cutoff: '04-30', gradeLabel: 'Foundation', note: 'Must turn 5 by 30 April' },
    'sa':   { cutoff: '05-01', gradeLabel: 'Reception', note: 'Can start at beginning of term after turning 5' },
    'wa':   { cutoff: '06-30', gradeLabel: 'Pre-primary', note: 'Must turn 5 by 30 June' },
    'tas':  { cutoff: '01-01', gradeLabel: 'Prep', note: 'Must turn 5 by 1 January of that year' },
    'nt':   { cutoff: '06-30', gradeLabel: 'Transition', note: 'Must turn 5 by 30 June' },
    'act':  { cutoff: '04-30', gradeLabel: 'Kindergarten', note: 'Must turn 5 by 30 April' },
  };

  const stateInfo = cutoffs[state];
  if (!stateInfo) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p>Please select a state.</p>';
    return;
  }

  // Calculate which year they start
  const birthYear = dob.getFullYear();
  const birthMonth = dob.getMonth(); // 0-indexed
  const birthDay = dob.getDate();

  const [cutMonth, cutDay] = stateInfo.cutoff.split('-').map(Number);

  // They turn 5 in birthYear + 5
  const turnsFiveYear = birthYear + 5;
  const turnsFiveDate = new Date(turnsFiveYear, birthMonth, birthDay);
  const cutoffDate = new Date(turnsFiveYear, cutMonth - 1, cutDay);

  let startYear;
  if (turnsFiveDate <= cutoffDate) {
    startYear = turnsFiveYear;
  } else {
    startYear = turnsFiveYear + 1;
  }

  // School typically starts late January / early February
  const schoolStartDate = new Date(startYear, 0, 28); // approximate

  const ageAtStartMs = schoolStartDate - dob;
  const ageAtStartYears = Math.floor(ageAtStartMs / (365.25 * 24 * 60 * 60 * 1000));
  const ageAtStartMonths = Math.floor(ageAtStartMs / (30.44 * 24 * 60 * 60 * 1000)) % 12;

  const stateNames = {
    'qld': 'Queensland', 'nsw': 'New South Wales', 'vic': 'Victoria',
    'sa': 'South Australia', 'wa': 'Western Australia', 'tas': 'Tasmania',
    'nt': 'Northern Territory', 'act': 'ACT'
  };

  const formatDate = d => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row"><span class="result-label">Child's Date of Birth</span><span class="result-value">${formatDate(dob)}</span></div>
    <div class="result-row"><span class="result-label">State</span><span class="result-value">${stateNames[state]}</span></div>
    <div class="result-row"><span class="result-label">First Year of School</span><span class="result-value">${stateInfo.gradeLabel}</span></div>
    <div class="result-row"><span class="result-label">Cutoff Rule</span><span class="result-value">${stateInfo.note}</span></div>
    <hr style="border-color:var(--border);margin:12px 0">
    <div class="result-row highlight"><span class="result-label">Expected Start Year</span><span class="result-value">${startYear}</span></div>
    <div class="result-row"><span class="result-label">Age at School Start</span><span class="result-value">~${ageAtStartYears} years, ${ageAtStartMonths} months</span></div>
    <div class="result-row"><span class="result-label">Child Turns 5</span><span class="result-value">${formatDate(turnsFiveDate)}</span></div>
    <div class="result-row"><span class="result-label">Cutoff Date (${startYear})</span><span class="result-value">${formatDate(new Date(startYear, cutMonth - 1, cutDay))}</span></div>
    <p style="margin-top:12px;font-size:0.85rem;color:var(--text-muted)">Dates are indicative. Check with your state education department for exact enrolment dates and any exemption processes.</p>
  `;
}
