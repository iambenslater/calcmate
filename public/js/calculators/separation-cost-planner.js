function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function calculate() {
  var weeklyRent = parseFloat(document.getElementById('input-weekly-rent').value) || 0;
  var bondWeeks = parseInt(document.getElementById('input-bond-weeks').value) || 4;
  var furnitureLevel = document.querySelector('input[name="input-furniture-level"]:checked');
  var whiteGoods = document.querySelector('input[name="input-white-goods"]:checked');
  var movingMethod = document.querySelector('input[name="input-moving-method"]:checked');
  var legalApproach = document.querySelector('input[name="input-legal-approach"]:checked');
  var childrenSetup = parseInt(document.getElementById('input-children-setup').value) || 0;
  var courtFilings = document.querySelector('input[name="input-court-filings"]:checked');

  furnitureLevel = furnitureLevel ? furnitureLevel.value : 'minimal';
  whiteGoods = whiteGoods ? whiteGoods.value : 'none';
  movingMethod = movingMethod ? movingMethod.value : 'diy';
  legalApproach = legalApproach ? legalApproach.value : 'diy';
  courtFilings = courtFilings ? courtFilings.value : 'none';

  if (weeklyRent <= 0) {
    var resultsDiv = document.getElementById('calc-results');
    var contentDiv = document.getElementById('results-content');
    contentDiv.innerHTML = '<p class="text-red-600 font-semibold">Please enter your expected weekly rent to calculate separation costs.</p>';
    resultsDiv.classList.remove('hidden');
    return;
  }

  // Cost ranges: [low, high]
  var costs = {
    bond: [weeklyRent * bondWeeks, weeklyRent * bondWeeks],
    rentAdvance: [weeklyRent * 2, weeklyRent * 2],
    furniture: { full: [5000, 10000], basics: [2000, 4000], minimal: [500, 1500], none: [0, 0] },
    whiteGoods: { all: [2500, 4500], some: [1000, 2500], none: [0, 0] },
    moving: { professional: [800, 2500], truck: [150, 400], diy: [50, 150], none: [0, 0] },
    legal: { diy: [0, 500], mediation: [300, 1500], 'lawyer-mediation': [2000, 6000], solicitor: [5000, 15000], litigation: [20000, 100000] },
    childBedroom: [750, 2000],
    court: { none: [0, 0], consent: [195, 195], divorce: [1060, 1060], both: [1255, 1255] },
    utilities: [200, 500]
  };

  var items = [];
  function addItem(label, low, high) {
    items.push({ label: label, low: low, high: high, mid: Math.round((low + high) / 2) });
  }

  addItem('Bond (' + bondWeeks + ' weeks)', costs.bond[0], costs.bond[1]);
  addItem('Rent in advance (2 weeks)', costs.rentAdvance[0], costs.rentAdvance[1]);

  var furn = costs.furniture[furnitureLevel] || costs.furniture.none;
  if (furn[1] > 0) addItem('Furniture (' + furnitureLevel + ')', furn[0], furn[1]);

  var wg = costs.whiteGoods[whiteGoods] || costs.whiteGoods.none;
  if (wg[1] > 0) addItem('White goods (' + whiteGoods + ')', wg[0], wg[1]);

  var mv = costs.moving[movingMethod] || costs.moving.none;
  if (mv[1] > 0) addItem('Moving (' + movingMethod.replace('professional', 'removalists').replace('diy', 'DIY') + ')', mv[0], mv[1]);

  var lg = costs.legal[legalApproach] || costs.legal.diy;
  addItem('Legal (' + legalApproach.replace('lawyer-mediation', 'lawyer-assisted mediation').replace('diy', 'DIY') + ')', lg[0], lg[1]);

  for (var i = 0; i < childrenSetup; i++) {
    addItem('Child bedroom #' + (i + 1) + ' setup', costs.childBedroom[0], costs.childBedroom[1]);
  }

  var ct = costs.court[courtFilings] || costs.court.none;
  if (ct[1] > 0) addItem('Court filings (' + courtFilings + ')', ct[0], ct[1]);

  addItem('Utility connections', costs.utilities[0], costs.utilities[1]);

  // Totals
  var totalLow = 0, totalHigh = 0, totalMid = 0;
  for (var j = 0; j < items.length; j++) {
    totalLow += items[j].low;
    totalHigh += items[j].high;
    totalMid += items[j].mid;
  }

  // Emergency minimum: bond + rent advance + utilities low
  var emergencyMin = costs.bond[0] + costs.rentAdvance[0] + costs.utilities[0];

  // Build breakdown table
  var tableRows = '';
  for (var k = 0; k < items.length; k++) {
    var item = items[k];
    tableRows += '<tr class="border-b border-gray-100">' +
      '<td class="py-2 pr-3">' + item.label + '</td>' +
      '<td class="py-2 px-2 text-right text-gray-500">' + formatCurrency(item.low) + '</td>' +
      '<td class="py-2 px-2 text-right font-semibold">' + formatCurrency(item.mid) + '</td>' +
      '<td class="py-2 px-2 text-right text-gray-500">' + formatCurrency(item.high) + '</td>' +
      '</tr>';
  }

  var html = '' +
    '<div style="background: #00205B; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">' +
      '<div style="font-size: 14px; opacity: 0.8; margin-bottom: 4px;">Estimated Total Cost of Separation</div>' +
      '<div style="font-size: 36px; font-weight: 700; color: #FFB800;">' + formatCurrency(totalMid) + '</div>' +
      '<div style="font-size: 13px; opacity: 0.7; margin-top: 4px;">Range: ' + formatCurrency(totalLow) + ' – ' + formatCurrency(totalHigh) + '</div>' +
    '</div>' +

    '<div style="background: #FFF7E6; border-left: 4px solid #FFB800; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">' +
      '<div style="font-weight: 600; color: #00205B; margin-bottom: 2px;">Bare minimum to move out</div>' +
      '<div style="font-size: 22px; font-weight: 700; color: #00205B;">' + formatCurrency(emergencyMin) + '</div>' +
      '<div style="font-size: 13px; color: #666; margin-top: 2px;">Bond + 2 weeks rent + utility connections</div>' +
    '</div>' +

    '<h4 class="font-semibold mb-3" style="color: #00205B;">Itemised Breakdown</h4>' +
    '<div style="overflow-x: auto;">' +
    '<table class="w-full text-sm">' +
      '<thead><tr class="border-b-2" style="border-color: #00205B;">' +
        '<th class="py-2 pr-3 text-left">Category</th>' +
        '<th class="py-2 px-2 text-right">Low</th>' +
        '<th class="py-2 px-2 text-right">Mid</th>' +
        '<th class="py-2 px-2 text-right">High</th>' +
      '</tr></thead>' +
      '<tbody>' + tableRows +
        '<tr style="border-top: 2px solid #00205B; font-weight: 700;">' +
          '<td class="py-2 pr-3">Total</td>' +
          '<td class="py-2 px-2 text-right">' + formatCurrency(totalLow) + '</td>' +
          '<td class="py-2 px-2 text-right" style="color: #00205B;">' + formatCurrency(totalMid) + '</td>' +
          '<td class="py-2 px-2 text-right">' + formatCurrency(totalHigh) + '</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>' +
    '</div>' +

    '<div style="margin-top: 24px; background: #F0F4FF; padding: 16px; border-radius: 8px;">' +
      '<h4 class="font-semibold mb-2" style="color: #00205B;">Money-Saving Tips</h4>' +
      '<ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">' +
        '<li style="padding: 6px 0; border-bottom: 1px solid #E0E7FF;">Free family mediation is available through Family Relationship Centres — call <strong>1800 050 321</strong></li>' +
        '<li style="padding: 6px 0; border-bottom: 1px solid #E0E7FF;">Facebook Marketplace and Gumtree can cut furniture costs by 50–70%</li>' +
        '<li style="padding: 6px 0; border-bottom: 1px solid #E0E7FF;">Some energy retailers waive connection fees for hardship customers — ask before paying</li>' +
        '<li style="padding: 6px 0; border-bottom: 1px solid #E0E7FF;">DIY consent orders via the Federal Circuit Court save thousands vs solicitor-drafted ones</li>' +
        '<li style="padding: 6px 0; border-bottom: 1px solid #E0E7FF;">Community legal centres offer free advice on family law — find one at <strong>clcs.org.au</strong></li>' +
        '<li style="padding: 6px 0;">Ask your landlord about paying bond in instalments — many will agree if you have good references</li>' +
      '</ul>' +
    '</div>';

  var resultsDiv = document.getElementById('calc-results');
  var contentDiv = document.getElementById('results-content');
  contentDiv.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

function getTLDR() {
  var weeklyRent = parseFloat(document.getElementById('input-weekly-rent').value) || 0;
  var bondWeeks = parseInt(document.getElementById('input-bond-weeks').value) || 4;
  var furnitureLevel = document.querySelector('input[name="input-furniture-level"]:checked');
  var legalApproach = document.querySelector('input[name="input-legal-approach"]:checked');
  var childrenSetup = parseInt(document.getElementById('input-children-setup').value) || 0;

  furnitureLevel = furnitureLevel ? furnitureLevel.value : 'minimal';
  legalApproach = legalApproach ? legalApproach.value : 'diy';

  if (weeklyRent <= 0) return '';

  var costs = {
    bond: weeklyRent * bondWeeks,
    rentAdvance: weeklyRent * 2,
    furniture: { full: 7500, basics: 3000, minimal: 1000, none: 0 },
    legal: { diy: 250, mediation: 900, 'lawyer-mediation': 4000, solicitor: 10000, litigation: 60000 },
    childBedroom: 1375,
    utilities: 350
  };

  var total = costs.bond + costs.rentAdvance + (costs.furniture[furnitureLevel] || 0) + (costs.legal[legalApproach] || 0) + (costs.childBedroom * childrenSetup) + costs.utilities;

  var legalLabel = legalApproach.replace('lawyer-mediation', 'lawyer-assisted mediation').replace('diy', 'self-managed');

  return 'Separating at $' + weeklyRent + '/week rent with ' + furnitureLevel + ' furniture and ' + legalLabel + ' legal support' + (childrenSetup > 0 ? ' plus ' + childrenSetup + ' child bedroom' + (childrenSetup > 1 ? 's' : '') : '') + ' will cost roughly $' + total.toLocaleString('en-AU') + '. The bare minimum to move out is $' + (costs.bond + costs.rentAdvance + 200).toLocaleString('en-AU') + ' (bond + rent + connections).';
}
