/**
 * Script to generate custom presentation graphics comparing
 * OECD-DAC Donors vs Top ODA Recipients
 */

const fs = require('fs');
const path = require('path');

// ISO to country name mapping (matching ROLI dataset names)
const ISO_TO_COUNTRY = {
  // Donors
  DEU: 'Germany',
  USA: 'United States',
  GBR: 'United Kingdom',
  JPN: 'Japan',
  FRA: 'France',
  CAN: 'Canada',
  ITA: 'Italy',
  NLD: 'Netherlands',
  ESP: 'Spain',
  SWE: 'Sweden',
  NOR: 'Norway',
  CHE: 'Switzerland', // Not in ROLI
  KOR: 'Korea, Rep.',
  AUS: 'Australia',
  DNK: 'Denmark',
  BEL: 'Belgium',
  IRL: 'Ireland',
  AUT: 'Austria',
  FIN: 'Finland',
  POL: 'Poland',
  NZL: 'New Zealand',
  LUX: 'Luxembourg',
  PRT: 'Portugal',
  HUN: 'Hungary',
  CZE: 'Czechia',
  GRC: 'Greece',
  SVK: 'Slovak Republic',
  SVN: 'Slovenia',
  LTU: 'Lithuania',
  EST: 'Estonia',
  LVA: 'Latvia',
  ISL: 'Iceland', // Not in ROLI
  // Recipients
  UKR: 'Ukraine',
  ETH: 'Ethiopia',
  BGD: 'Bangladesh',
  IND: 'India',
  NGA: 'Nigeria',
  COD: 'Congo, Dem. Rep.',
  AFG: 'Afghanistan',
  SYR: 'Syria', // Not in ROLI
  YEM: 'Yemen', // Not in ROLI
  JOR: 'Jordan',
  KEN: 'Kenya',
  SOM: 'Somalia', // Not in ROLI
  TZA: 'Tanzania',
  MOZ: 'Mozambique',
  UGA: 'Uganda',
  EGY: 'Egypt, Arab Rep.',
  PAK: 'Pakistan',
  PSE: 'Palestine', // Not in ROLI
  IDN: 'Indonesia',
  PHL: 'Philippines',
  SSD: 'South Sudan', // Not in ROLI
  SDN: 'Sudan',
  IRQ: 'Iraq', // Not in ROLI
  LBN: 'Lebanon',
  TUR: 'Türkiye',
  MLI: 'Mali',
  BFA: 'Burkina Faso',
  NER: 'Niger',
  SEN: 'Senegal',
  GHA: 'Ghana',
  CMR: 'Cameroon',
  CIV: "Côte d'Ivoire",
  ZMB: 'Zambia',
  MWI: 'Malawi',
  RWA: 'Rwanda',
  MDG: 'Madagascar',
  TCD: 'Chad', // Not in ROLI
  GIN: 'Guinea',
  BEN: 'Benin',
  MMR: 'Myanmar',
  NPL: 'Nepal',
  KHM: 'Cambodia',
  VNM: 'Vietnam',
  MAR: 'Morocco',
  TUN: 'Tunisia',
  HTI: 'Haiti',
  ZWE: 'Zimbabwe',
  COL: 'Colombia',
  MDA: 'Moldova',
  GEO: 'Georgia'
};

const DONOR_CODES = [
  'DEU', 'USA', 'GBR', 'JPN', 'FRA', 'CAN', 'ITA', 'NLD', 'ESP', 'SWE',
  'NOR', 'CHE', 'KOR', 'AUS', 'DNK', 'BEL', 'IRL', 'AUT', 'FIN', 'POL',
  'NZL', 'LUX', 'PRT', 'HUN', 'CZE', 'GRC', 'SVK', 'SVN', 'LTU', 'EST',
  'LVA', 'ISL'
];

const RECIPIENT_CODES = [
  'UKR', 'ETH', 'BGD', 'IND', 'NGA', 'COD', 'AFG', 'SYR', 'YEM', 'JOR',
  'KEN', 'SOM', 'TZA', 'MOZ', 'UGA', 'EGY', 'PAK', 'PSE', 'IDN', 'PHL',
  'SSD', 'SDN', 'IRQ', 'LBN', 'TUR', 'MLI', 'BFA', 'NER', 'SEN', 'GHA',
  'CMR', 'CIV', 'ZMB', 'MWI', 'RWA', 'MDG', 'TCD', 'GIN', 'BEN', 'MMR',
  'NPL', 'KHM', 'VNM', 'MAR', 'TUN', 'HTI', 'ZWE', 'COL', 'MDA', 'GEO'
];

const FACTOR_LABELS = {
  roli: 'Rule of Law Index',
  f1: '1. Constraints on Government Powers',
  f2: '2. Absence of Corruption',
  f3: '3. Open Government',
  f4: '4. Fundamental Rights',
  f5: '5. Order and Security',
  f6: '6. Regulatory Enforcement',
  f7: '7. Civil Justice',
  f8: '8. Criminal Justice'
};

const COLORS = {
  donors: '#1e3a5f',      // Dark blue
  recipients: '#c44536',  // Red/coral
  background: '#ffffff',
  text: '#1a1a2e',
  muted: '#6b7280',
  gridLine: '#e5e7eb',
  tableBorder: '#d1d5db',
  headerBg: '#f3f4f6'
};

// Load data
const dataPath = path.join(__dirname, '..', 'public', 'roli_data.json');
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const entries = rawData.entries;

// Get unique countries in dataset
const countriesInData = new Set(entries.map(e => e.country));

// Map ISO codes to country names, filtering those in dataset
function getCountryNames(isoCodes) {
  return isoCodes
    .map(code => ISO_TO_COUNTRY[code])
    .filter(name => name && countriesInData.has(name));
}

const donorCountries = getCountryNames(DONOR_CODES);
const recipientCountries = getCountryNames(RECIPIENT_CODES);

console.log('=== Countries included ===');
console.log(`Donors (${donorCountries.length}):`, donorCountries.join(', '));
console.log(`\nRecipients (${recipientCountries.length}):`, recipientCountries.join(', '));

// Get available years
const years = [...new Set(entries.map(e => e.year))].sort();
console.log(`\nYears available: ${years.join(', ')}`);

// Calculate average for a group of countries for a specific variable and year
function calcGroupAverage(countries, variable, year) {
  const values = entries
    .filter(e => countries.includes(e.country) && e.year === year && e[variable] != null)
    .map(e => e[variable]);

  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Calculate averages for latest year (2025) for the table
const latestYear = '2025';
const variables = ['roli', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];

const tableData = variables.map(v => ({
  variable: v,
  label: FACTOR_LABELS[v],
  donorAvg: calcGroupAverage(donorCountries, v, latestYear),
  recipientAvg: calcGroupAverage(recipientCountries, v, latestYear)
}));

console.log('\n=== Table Data (2025) ===');
tableData.forEach(row => {
  console.log(`${row.label}: Donors=${row.donorAvg?.toFixed(3)}, Recipients=${row.recipientAvg?.toFixed(3)}`);
});

// Calculate time series data for ROLI
const timeSeriesData = years.map(year => ({
  year,
  donorAvg: calcGroupAverage(donorCountries, 'roli', year),
  recipientAvg: calcGroupAverage(recipientCountries, 'roli', year)
})).filter(d => d.donorAvg != null && d.recipientAvg != null);

console.log('\n=== Time Series Data ===');
timeSeriesData.forEach(d => {
  console.log(`${d.year}: Donors=${d.donorAvg?.toFixed(3)}, Recipients=${d.recipientAvg?.toFixed(3)}`);
});

// Calculate % change from base year (first available year)
const baseYear = timeSeriesData[0]?.year;
const baseDonor = timeSeriesData[0]?.donorAvg;
const baseRecipient = timeSeriesData[0]?.recipientAvg;

const percentChangeData = timeSeriesData.map(d => ({
  year: d.year,
  donorChange: ((d.donorAvg - baseDonor) / baseDonor) * 100,
  recipientChange: ((d.recipientAvg - baseRecipient) / baseRecipient) * 100
}));

// === GENERATE SVGs ===

// Helper: create SVG element string
function el(tag, attrs, content = '') {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  if (content) {
    return `<${tag} ${attrStr}>${content}</${tag}>`;
  }
  return `<${tag} ${attrStr}/>`;
}

// 1. TABLE SVG
function generateTableSVG() {
  const width = 800;
  const rowHeight = 45;
  const headerHeight = 55;
  const padding = 20;
  const col1Width = 350; // Factor name
  const col2Width = 200; // Donors
  const col3Width = 200; // Recipients
  const height = padding + headerHeight + (tableData.length * rowHeight) + padding + 60; // Extra for title

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;

  // Embedded font
  svg += `<defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
      text { font-family: 'Inter', sans-serif; }
    </style>
  </defs>`;

  // Background
  svg += el('rect', { x: 0, y: 0, width, height, fill: COLORS.background });

  // Title
  svg += el('text', {
    x: width / 2,
    y: padding + 20,
    'font-size': 18,
    'font-weight': 700,
    fill: COLORS.text,
    'text-anchor': 'middle'
  }, 'Comparison: OECD-DAC Donors vs. ODA Recipients (2025)');

  const tableTop = padding + 50;
  const tableLeft = (width - col1Width - col2Width - col3Width) / 2;

  // Header row background
  svg += el('rect', {
    x: tableLeft,
    y: tableTop,
    width: col1Width + col2Width + col3Width,
    height: headerHeight,
    fill: COLORS.headerBg
  });

  // Header text
  svg += el('text', {
    x: tableLeft + col1Width / 2,
    y: tableTop + headerHeight / 2 + 6,
    'font-size': 14,
    'font-weight': 600,
    fill: COLORS.text,
    'text-anchor': 'middle'
  }, 'Indicator');

  svg += el('text', {
    x: tableLeft + col1Width + col2Width / 2,
    y: tableTop + headerHeight / 2 + 6,
    'font-size': 14,
    'font-weight': 600,
    fill: COLORS.donors,
    'text-anchor': 'middle'
  }, `Donors (n=${donorCountries.length})`);

  svg += el('text', {
    x: tableLeft + col1Width + col2Width + col3Width / 2,
    y: tableTop + headerHeight / 2 + 6,
    'font-size': 14,
    'font-weight': 600,
    fill: COLORS.recipients,
    'text-anchor': 'middle'
  }, `Recipients (n=${recipientCountries.length})`);

  // Header border
  svg += el('line', {
    x1: tableLeft,
    y1: tableTop + headerHeight,
    x2: tableLeft + col1Width + col2Width + col3Width,
    y2: tableTop + headerHeight,
    stroke: COLORS.tableBorder,
    'stroke-width': 2
  });

  // Data rows
  tableData.forEach((row, i) => {
    const y = tableTop + headerHeight + (i * rowHeight);
    const isRoli = row.variable === 'roli';

    // Alternating row background
    if (i % 2 === 0) {
      svg += el('rect', {
        x: tableLeft,
        y: y,
        width: col1Width + col2Width + col3Width,
        height: rowHeight,
        fill: '#f9fafb'
      });
    }

    // ROLI row highlight
    if (isRoli) {
      svg += el('rect', {
        x: tableLeft,
        y: y,
        width: col1Width + col2Width + col3Width,
        height: rowHeight,
        fill: '#e0e7ff'
      });
    }

    // Row text
    svg += el('text', {
      x: tableLeft + 15,
      y: y + rowHeight / 2 + 5,
      'font-size': isRoli ? 14 : 13,
      'font-weight': isRoli ? 700 : 400,
      fill: COLORS.text
    }, row.label);

    svg += el('text', {
      x: tableLeft + col1Width + col2Width / 2,
      y: y + rowHeight / 2 + 5,
      'font-size': isRoli ? 16 : 14,
      'font-weight': isRoli ? 700 : 500,
      fill: COLORS.donors,
      'text-anchor': 'middle'
    }, row.donorAvg != null ? row.donorAvg.toFixed(2) : '—');

    svg += el('text', {
      x: tableLeft + col1Width + col2Width + col3Width / 2,
      y: y + rowHeight / 2 + 5,
      'font-size': isRoli ? 16 : 14,
      'font-weight': isRoli ? 700 : 500,
      fill: COLORS.recipients,
      'text-anchor': 'middle'
    }, row.recipientAvg != null ? row.recipientAvg.toFixed(2) : '—');

    // Row border
    svg += el('line', {
      x1: tableLeft,
      y1: y + rowHeight,
      x2: tableLeft + col1Width + col2Width + col3Width,
      y2: y + rowHeight,
      stroke: COLORS.tableBorder,
      'stroke-width': 1
    });
  });

  // Outer border
  svg += el('rect', {
    x: tableLeft,
    y: tableTop,
    width: col1Width + col2Width + col3Width,
    height: headerHeight + (tableData.length * rowHeight),
    fill: 'none',
    stroke: COLORS.tableBorder,
    'stroke-width': 2
  });

  // Vertical dividers
  svg += el('line', {
    x1: tableLeft + col1Width,
    y1: tableTop,
    x2: tableLeft + col1Width,
    y2: tableTop + headerHeight + (tableData.length * rowHeight),
    stroke: COLORS.tableBorder,
    'stroke-width': 1
  });

  svg += el('line', {
    x1: tableLeft + col1Width + col2Width,
    y1: tableTop,
    x2: tableLeft + col1Width + col2Width,
    y2: tableTop + headerHeight + (tableData.length * rowHeight),
    stroke: COLORS.tableBorder,
    'stroke-width': 1
  });

  svg += '</svg>';
  return svg;
}

// 2. TIME SERIES (SCORES) SVG
function generateTimeSeriesSVG() {
  const width = 800;
  const height = 450;
  const padding = { top: 70, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Y-axis scale (0 to 1)
  const yMin = 0;
  const yMax = 1;
  const yScale = (val) => padding.top + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;

  // X-axis scale
  const xScale = (i) => padding.left + (i / (timeSeriesData.length - 1)) * chartWidth;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;

  // Font
  svg += `<defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
      text { font-family: 'Inter', sans-serif; }
    </style>
  </defs>`;

  // Background
  svg += el('rect', { x: 0, y: 0, width, height, fill: COLORS.background });

  // Title
  svg += el('text', {
    x: width / 2,
    y: 30,
    'font-size': 18,
    'font-weight': 700,
    fill: COLORS.text,
    'text-anchor': 'middle'
  }, 'Rule of Law Index Evolution');

  // Subtitle
  svg += el('text', {
    x: width / 2,
    y: 52,
    'font-size': 13,
    fill: COLORS.muted,
    'text-anchor': 'middle'
  }, 'OECD-DAC Donors vs. ODA Recipients');

  // Y-axis gridlines and labels
  for (let i = 0; i <= 10; i += 2) {
    const val = i / 10;
    const y = yScale(val);

    svg += el('line', {
      x1: padding.left,
      y1: y,
      x2: width - padding.right,
      y2: y,
      stroke: COLORS.gridLine,
      'stroke-width': 1,
      'stroke-dasharray': i === 0 ? 'none' : '4,4'
    });

    svg += el('text', {
      x: padding.left - 10,
      y: y + 4,
      'font-size': 12,
      fill: COLORS.muted,
      'text-anchor': 'end'
    }, val.toFixed(1));
  }

  // X-axis labels
  timeSeriesData.forEach((d, i) => {
    svg += el('text', {
      x: xScale(i),
      y: height - padding.bottom + 25,
      'font-size': 12,
      fill: COLORS.muted,
      'text-anchor': 'middle'
    }, d.year);
  });

  // Draw lines
  const donorPath = timeSeriesData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.donorAvg)}`
  ).join(' ');

  const recipientPath = timeSeriesData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.recipientAvg)}`
  ).join(' ');

  svg += el('path', {
    d: donorPath,
    fill: 'none',
    stroke: COLORS.donors,
    'stroke-width': 3,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });

  svg += el('path', {
    d: recipientPath,
    fill: 'none',
    stroke: COLORS.recipients,
    'stroke-width': 3,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });

  // Data points
  timeSeriesData.forEach((d, i) => {
    svg += el('circle', {
      cx: xScale(i),
      cy: yScale(d.donorAvg),
      r: 5,
      fill: COLORS.donors
    });
    svg += el('circle', {
      cx: xScale(i),
      cy: yScale(d.recipientAvg),
      r: 5,
      fill: COLORS.recipients
    });
  });

  // Legend
  const legendY = height - 20;
  const legendX = width / 2 - 150;

  svg += el('line', { x1: legendX, y1: legendY, x2: legendX + 30, y2: legendY, stroke: COLORS.donors, 'stroke-width': 3 });
  svg += el('circle', { cx: legendX + 15, cy: legendY, r: 4, fill: COLORS.donors });
  svg += el('text', { x: legendX + 40, y: legendY + 4, 'font-size': 13, fill: COLORS.text }, `Donors (n=${donorCountries.length})`);

  svg += el('line', { x1: legendX + 200, y1: legendY, x2: legendX + 230, y2: legendY, stroke: COLORS.recipients, 'stroke-width': 3 });
  svg += el('circle', { cx: legendX + 215, cy: legendY, r: 4, fill: COLORS.recipients });
  svg += el('text', { x: legendX + 240, y: legendY + 4, 'font-size': 13, fill: COLORS.text }, `Recipients (n=${recipientCountries.length})`);

  // Y-axis label
  svg += el('text', {
    x: 20,
    y: height / 2,
    'font-size': 13,
    fill: COLORS.muted,
    'text-anchor': 'middle',
    transform: `rotate(-90, 20, ${height / 2})`
  }, 'Score');

  svg += '</svg>';
  return svg;
}

// 3. PERCENT CHANGE SVG
function generatePercentChangeSVG() {
  const width = 800;
  const height = 450;
  const padding = { top: 70, right: 40, bottom: 60, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find Y range
  const allChanges = percentChangeData.flatMap(d => [d.donorChange, d.recipientChange]);
  const maxAbs = Math.max(Math.abs(Math.min(...allChanges)), Math.abs(Math.max(...allChanges)));
  const yRange = Math.ceil(maxAbs / 2) * 2 + 2; // Round up to nearest 2, add buffer
  const yMin = -yRange;
  const yMax = yRange;

  const yScale = (val) => padding.top + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;
  const xScale = (i) => padding.left + (i / (percentChangeData.length - 1)) * chartWidth;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;

  // Font
  svg += `<defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
      text { font-family: 'Inter', sans-serif; }
    </style>
  </defs>`;

  // Background
  svg += el('rect', { x: 0, y: 0, width, height, fill: COLORS.background });

  // Title
  svg += el('text', {
    x: width / 2,
    y: 30,
    'font-size': 18,
    'font-weight': 700,
    fill: COLORS.text,
    'text-anchor': 'middle'
  }, 'Percent Change in Rule of Law Index');

  // Subtitle
  svg += el('text', {
    x: width / 2,
    y: 52,
    'font-size': 13,
    fill: COLORS.muted,
    'text-anchor': 'middle'
  }, `Relative to ${baseYear} | OECD-DAC Donors vs. ODA Recipients`);

  // Y-axis gridlines and labels
  for (let val = yMin; val <= yMax; val += 2) {
    const y = yScale(val);

    svg += el('line', {
      x1: padding.left,
      y1: y,
      x2: width - padding.right,
      y2: y,
      stroke: val === 0 ? COLORS.text : COLORS.gridLine,
      'stroke-width': val === 0 ? 1.5 : 1,
      'stroke-dasharray': val === 0 ? 'none' : '4,4'
    });

    svg += el('text', {
      x: padding.left - 10,
      y: y + 4,
      'font-size': 12,
      fill: COLORS.muted,
      'text-anchor': 'end'
    }, `${val > 0 ? '+' : ''}${val.toFixed(0)}%`);
  }

  // X-axis labels
  percentChangeData.forEach((d, i) => {
    svg += el('text', {
      x: xScale(i),
      y: height - padding.bottom + 25,
      'font-size': 12,
      fill: COLORS.muted,
      'text-anchor': 'middle'
    }, d.year);
  });

  // Draw lines
  const donorPath = percentChangeData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.donorChange)}`
  ).join(' ');

  const recipientPath = percentChangeData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.recipientChange)}`
  ).join(' ');

  svg += el('path', {
    d: donorPath,
    fill: 'none',
    stroke: COLORS.donors,
    'stroke-width': 3,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });

  svg += el('path', {
    d: recipientPath,
    fill: 'none',
    stroke: COLORS.recipients,
    'stroke-width': 3,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });

  // Data points
  percentChangeData.forEach((d, i) => {
    svg += el('circle', {
      cx: xScale(i),
      cy: yScale(d.donorChange),
      r: 5,
      fill: COLORS.donors
    });
    svg += el('circle', {
      cx: xScale(i),
      cy: yScale(d.recipientChange),
      r: 5,
      fill: COLORS.recipients
    });
  });

  // Legend
  const legendY = height - 20;
  const legendX = width / 2 - 150;

  svg += el('line', { x1: legendX, y1: legendY, x2: legendX + 30, y2: legendY, stroke: COLORS.donors, 'stroke-width': 3 });
  svg += el('circle', { cx: legendX + 15, cy: legendY, r: 4, fill: COLORS.donors });
  svg += el('text', { x: legendX + 40, y: legendY + 4, 'font-size': 13, fill: COLORS.text }, `Donors (n=${donorCountries.length})`);

  svg += el('line', { x1: legendX + 200, y1: legendY, x2: legendX + 230, y2: legendY, stroke: COLORS.recipients, 'stroke-width': 3 });
  svg += el('circle', { cx: legendX + 215, cy: legendY, r: 4, fill: COLORS.recipients });
  svg += el('text', { x: legendX + 240, y: legendY + 4, 'font-size': 13, fill: COLORS.text }, `Recipients (n=${recipientCountries.length})`);

  // Y-axis label
  svg += el('text', {
    x: 20,
    y: height / 2,
    'font-size': 13,
    fill: COLORS.muted,
    'text-anchor': 'middle',
    transform: `rotate(-90, 20, ${height / 2})`
  }, '% Change');

  svg += '</svg>';
  return svg;
}

// Ensure output directory exists
const outputDir = path.join(__dirname, '..', 'custom-presentation-graphics');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate and save SVGs
fs.writeFileSync(path.join(outputDir, 'donors-recipients-table.svg'), generateTableSVG());
console.log('\n✓ Generated: donors-recipients-table.svg');

fs.writeFileSync(path.join(outputDir, 'donors-recipients-timeseries.svg'), generateTimeSeriesSVG());
console.log('✓ Generated: donors-recipients-timeseries.svg');

fs.writeFileSync(path.join(outputDir, 'donors-recipients-percent-change.svg'), generatePercentChangeSVG());
console.log('✓ Generated: donors-recipients-percent-change.svg');

console.log(`\nOutput directory: ${outputDir}`);

// Export data for PowerPoint generation
module.exports = {
  tableData,
  timeSeriesData,
  percentChangeData,
  donorCountries,
  recipientCountries,
  baseYear,
  COLORS,
  FACTOR_LABELS
};
