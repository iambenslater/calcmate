// CalcMate — Missed Call Cost Calculator
// Calculates approximate annual revenue lost to missed calls.
// Result page links to BusyBack (sister venture, AI answering for tradies).

function calculate() {
  const callsPerWeek    = parseFloat(document.getElementById('input-callsPerWeek').value) || 0;
  const missRatePct     = parseFloat(document.getElementById('input-missRate').value) || 0;
  const noCallbackPct   = parseFloat(document.getElementById('input-noCallbackRate').value) || 0;
  const winRatePct      = parseFloat(document.getElementById('input-winRate').value) || 0;
  const jobValue        = parseFloat(document.getElementById('input-jobValue').value) || 0;

  if (callsPerWeek <= 0 || jobValue <= 0) {
    document.getElementById('calc-results').classList.remove('hidden');
    document.getElementById('results-content').innerHTML = '<p class="text-red-600">Please enter calls per week and an average job value greater than zero.</p>';
    return;
  }

  const missRate    = missRatePct   / 100;
  const noCallback  = noCallbackPct / 100;
  const winRate     = winRatePct    / 100;

  // Lost jobs per year = calls × miss rate × no-callback rate × win rate × 52
  const lostJobsPerYear = callsPerWeek * missRate * noCallback * winRate * 52;
  const annualLoss      = Math.max(0, lostJobsPerYear * jobValue);
  const annualLossPerWeek = annualLoss / 52;

  // BusyBack comparison: $5/mo subscription + $0.95 per call answered
  const busybackAnswered = callsPerWeek * missRate * 52;
  const busybackCost     = 60 + (busybackAnswered * 0.95);
  const netSaving        = annualLoss - busybackCost;
  const paybackJobs      = busybackCost > 0 && jobValue > 0 ? Math.ceil(busybackCost / jobValue) : 0;

  // Reference rows showing what a 10/20/30/40% miss rate looks like at the user's other inputs
  const refMissRates = [10, 20, 30, 40, 50].filter(r => Math.abs(r - missRatePct) > 5).slice(0, 4);
  let refRows = '';
  for (const r of refMissRates) {
    const refLoss = callsPerWeek * (r / 100) * noCallback * winRate * 52 * jobValue;
    refRows += `<div class="result-row"><span class="result-label">If you missed ${r}%</span><span class="result-value">${fmt(refLoss)}/yr</span></div>`;
  }

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('results-content').innerHTML = `
    <div class="result-row" style="font-size: 1.25em; font-weight: bold;">
      <span class="result-label">Estimated annual loss</span>
      <span class="result-value" style="color:#b91c1c">${fmt(annualLoss)}</span>
    </div>
    <div class="result-row"><span class="result-label">That's roughly per week</span><span class="result-value">${fmt(annualLossPerWeek)}</span></div>
    <div class="result-row"><span class="result-label">Lost jobs per year</span><span class="result-value">${lostJobsPerYear.toFixed(1)}</span></div>

    <div style="margin-top: 1rem; border-top: 2px solid #e5e7eb; padding-top: 0.5rem;">
      <strong>What it would cost to plug the leak with BusyBack</strong>
    </div>
    <div class="result-row"><span class="result-label">BusyBack cost / year</span><span class="result-value">${fmt(busybackCost)}</span></div>
    <div class="result-row"><span class="result-label">Net you'd be ahead</span><span class="result-value" style="color:#15803d">${fmt(netSaving)}</span></div>
    ${paybackJobs > 0 ? `<div class="result-row"><span class="result-label">Jobs to pay for the year</span><span class="result-value">${paybackJobs} ${paybackJobs === 1 ? 'job' : 'jobs'}</span></div>` : ''}

    <div style="margin-top:1.25rem;padding:14px 16px;background:linear-gradient(135deg,#0a0a0a 0%,#1a1f1a 100%);border-radius:12px;border:1px solid rgba(34,197,94,0.25);text-align:center;">
      <div style="font-size:0.78rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#22c55e;margin-bottom:8px;">Plug the leak</div>
      <div style="color:#fff;font-size:0.95rem;line-height:1.5;margin-bottom:12px;">BusyBack answers your missed calls with a real AI voice and texts you the details — from <strong style="color:#22c55e;">$5/month + 95¢ per call</strong>.</div>
      <a href="https://busyback.com.au?utm_source=calcmate&utm_medium=calc-cta&utm_campaign=missed-call-cost" rel="related" target="_blank" style="display:inline-block;background:#22c55e;color:#000;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:800;font-size:0.95rem;">Get BusyBack — $5 to start →</a>
      <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);margin-top:8px;">Cancel anytime. No contracts. Refunds on unused messages.</div>
    </div>

    ${refRows ? `<div style="margin-top:1rem;border-top: 2px solid #e5e7eb;padding-top:0.5rem;"><strong>If your miss rate were different</strong></div>${refRows}` : ''}

    <div style="margin-top:1rem;font-size:0.78rem;color:#6b7280;line-height:1.5;">
      Estimate uses your inputs × 52 weeks. Real losses skew higher because emergency callouts (most likely to be missed) usually pay more than average.
    </div>
  `;
}

function fmt(n) {
  return '$' + Math.round(n).toLocaleString('en-AU');
}

function getTLDR() {
  const callsPerWeek    = parseFloat(document.getElementById('input-callsPerWeek').value) || 0;
  const missRatePct     = parseFloat(document.getElementById('input-missRate').value) || 0;
  const noCallbackPct   = parseFloat(document.getElementById('input-noCallbackRate').value) || 0;
  const winRatePct      = parseFloat(document.getElementById('input-winRate').value) || 0;
  const jobValue        = parseFloat(document.getElementById('input-jobValue').value) || 0;
  if (callsPerWeek <= 0 || jobValue <= 0) return '';
  const annualLoss = callsPerWeek * (missRatePct / 100) * (noCallbackPct / 100) * (winRatePct / 100) * 52 * jobValue;
  return `At ${callsPerWeek} calls a week and a ${missRatePct}% miss rate, you're losing roughly ${fmt(annualLoss)} a year to missed calls — about ${fmt(annualLoss / 52)} per week walking out the door.`;
}
