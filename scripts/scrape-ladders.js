#!/usr/bin/env node
/**
 * Scrape NRL and AFL ladder data from public APIs.
 * Saves to data/sports-ladders.json for the "How Shit Is Your Team?" calculator.
 *
 * Data sources (free, no auth):
 *   NRL: https://www.nrl.com/ladder/data?competition=111&season=YYYY
 *   AFL: https://api.squiggle.com.au/?q=standings
 *
 * Usage: node scripts/scrape-ladders.js
 * Scheduled: daily via Mac Mini task
 */

const fs = require('fs');
const path = require('path');

const OUTPUT = path.resolve(__dirname, '../data/sports-ladders.json');
const YEAR = new Date().getFullYear();

async function fetchNRL() {
  console.log('Fetching NRL ladder...');
  try {
    const res = await fetch(`https://www.nrl.com/ladder/data?competition=111&season=${YEAR}`);
    if (!res.ok) throw new Error(`NRL API returned ${res.status}`);
    const data = await res.json();

    // NRL wraps teams in data.positions array
    const positions = data.positions || data;
    const teams = (Array.isArray(positions) ? positions : []).map((t, idx) => {
      const s = t.stats || {};
      return {
        name: t.teamNickname || 'Unknown',
        position: idx + 1,
        played: s.played || 0,
        wins: s.wins || 0,
        losses: s.lost || 0,
        draws: s.drawn || 0,
        pointsFor: s['points for'] || 0,
        pointsAgainst: s['points against'] || 0,
        pointsDiff: s['points difference'] || 0,
        streak: s.streak || '',
        form: s.form || '',
        avgWinMargin: s['average winning margin'] || 0,
        avgLossMargin: s['average losing margin'] || 0,
        odds: s.odds || '',
        movement: t.movement || 'none'
      };
    });

    console.log(`  NRL: ${teams.length} teams fetched`);
    return teams;
  } catch (err) {
    console.error('  NRL fetch failed:', err.message);
    return [];
  }
}

async function fetchAFL() {
  console.log('Fetching AFL ladder...');
  try {
    const res = await fetch(`https://api.squiggle.com.au/?q=standings;year=${YEAR}`, {
      headers: { 'User-Agent': 'CalculatorMate/1.0 (calculatormate.com.au)' }
    });
    if (!res.ok) throw new Error(`Squiggle API returned ${res.status}`);
    const data = await res.json();

    const standings = data.standings || [];
    const teams = standings
      .sort((a, b) => a.rank - b.rank)
      .map(t => ({
        name: t.name || 'Unknown',
        position: t.rank,
        played: t.played || 0,
        wins: t.wins || 0,
        losses: t.losses || 0,
        draws: t.draws || 0,
        pointsFor: t.for || 0,
        pointsAgainst: t.against || 0,
        pointsDiff: (t.for || 0) - (t.against || 0),
        percentage: t.percentage || 0,
        streak: '',
        form: '',
        avgWinMargin: 0,
        avgLossMargin: 0,
        odds: '',
        movement: 'none'
      }));

    console.log(`  AFL: ${teams.length} teams fetched`);
    return teams;
  } catch (err) {
    console.error('  AFL fetch failed:', err.message);
    return [];
  }
}

async function main() {
  const [nrl, afl] = await Promise.all([fetchNRL(), fetchAFL()]);

  const ladders = {
    updated: new Date().toISOString(),
    season: YEAR,
    nrl: nrl,
    afl: afl
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(ladders, null, 2));
  console.log(`\nSaved to ${OUTPUT}`);
  console.log(`  NRL: ${nrl.length} teams | AFL: ${afl.length} teams`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
