/**
 * Script to generate PowerPoint presentation comparing
 * OECD-DAC Donors vs Top ODA Recipients
 */

const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// First, run the graphics generator to get the data
require('./generate-donors-recipients-graphics.js');

// Re-import the exported data
const {
  tableData,
  timeSeriesData,
  percentChangeData,
  donorCountries,
  recipientCountries,
  baseYear,
  COLORS,
  FACTOR_LABELS
} = require('./generate-donors-recipients-graphics.js');

// Load raw data to calculate percent change from 2015 for all factors
const dataPath = path.join(__dirname, '..', 'public', 'roli_data.json');
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const entries = rawData.entries;

// Calculate average for a group of countries for a specific variable and year
function calcGroupAverage(countries, variable, year) {
  const values = entries
    .filter(e => countries.includes(e.country) && e.year === year && e[variable] != null)
    .map(e => e[variable]);

  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Calculate percent change table data (2015 -> 2025)
const variables = ['roli', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
const baseYearForChange = '2015';
const targetYear = '2025';

const percentChangeTableData = variables.map(v => {
  const donorBase = calcGroupAverage(donorCountries, v, baseYearForChange);
  const donorTarget = calcGroupAverage(donorCountries, v, targetYear);
  const recipientBase = calcGroupAverage(recipientCountries, v, baseYearForChange);
  const recipientTarget = calcGroupAverage(recipientCountries, v, targetYear);

  const donorChange = donorBase ? ((donorTarget - donorBase) / donorBase) * 100 : null;
  const recipientChange = recipientBase ? ((recipientTarget - recipientBase) / recipientBase) * 100 : null;

  return {
    variable: v,
    label: FACTOR_LABELS[v],
    donorChange,
    recipientChange
  };
});

console.log('\n=== Percent Change Table Data (2015 -> 2025) ===');
percentChangeTableData.forEach(row => {
  console.log(`${row.label}: Donors=${row.donorChange?.toFixed(2)}%, Recipients=${row.recipientChange?.toFixed(2)}%`);
});

// Create presentation
const pptx = new pptxgen();

// Set presentation properties
pptx.author = 'WJP Rule of Law Index Dashboard';
pptx.title = 'Rule of Law: OECD-DAC Donors vs ODA Recipients';
pptx.subject = 'Comparison of Rule of Law Index scores';
pptx.layout = 'LAYOUT_16x9';

// Define colors
const BLUE = '1e3a5f';
const RED = 'c44536';
const GREEN = '16a34a';
const TEXT_COLOR = '1a1a2e';
const MUTED = '6b7280';

// ============================================
// SLIDE 1: Title Slide
// ============================================
let slide1 = pptx.addSlide();
slide1.addText('Rule of Law Index', {
  x: 0.5,
  y: 2.0,
  w: '90%',
  fontSize: 44,
  fontFace: 'Arial',
  color: TEXT_COLOR,
  bold: true
});
slide1.addText('OECD-DAC Donors vs. ODA Recipients', {
  x: 0.5,
  y: 2.8,
  w: '90%',
  fontSize: 28,
  fontFace: 'Arial',
  color: MUTED
});
slide1.addText(`Data: 2012-2025 | Donors: ${donorCountries.length} countries | Recipients: ${recipientCountries.length} countries`, {
  x: 0.5,
  y: 4.5,
  w: '90%',
  fontSize: 14,
  fontFace: 'Arial',
  color: MUTED
});
slide1.addText('Source: World Justice Project Rule of Law Index', {
  x: 0.5,
  y: 5.0,
  w: '90%',
  fontSize: 12,
  fontFace: 'Arial',
  color: MUTED
});

// ============================================
// SLIDE 2: Score Comparison Table (2025)
// ============================================
let slide2 = pptx.addSlide();
slide2.addText('Score Comparison: OECD-DAC Donors vs. ODA Recipients (2025)', {
  x: 0.5,
  y: 0.3,
  w: '90%',
  fontSize: 24,
  fontFace: 'Arial',
  color: TEXT_COLOR,
  bold: true
});

// Create table data
const tableRows = [
  // Header
  [
    { text: 'Indicator', options: { bold: true, color: TEXT_COLOR, fill: 'f3f4f6' } },
    { text: `Donors (n=${donorCountries.length})`, options: { bold: true, color: BLUE, fill: 'f3f4f6' } },
    { text: `Recipients (n=${recipientCountries.length})`, options: { bold: true, color: RED, fill: 'f3f4f6' } },
    { text: 'Gap', options: { bold: true, color: TEXT_COLOR, fill: 'f3f4f6' } }
  ]
];

// Data rows
tableData.forEach((row, idx) => {
  const isRoli = row.variable === 'roli';
  const gap = row.donorAvg - row.recipientAvg;
  const fillColor = isRoli ? 'e0e7ff' : (idx % 2 === 0 ? 'ffffff' : 'f9fafb');

  tableRows.push([
    { text: row.label, options: { bold: isRoli, color: TEXT_COLOR, fill: fillColor } },
    { text: row.donorAvg?.toFixed(2) || '—', options: { bold: isRoli, color: BLUE, fill: fillColor, align: 'center' } },
    { text: row.recipientAvg?.toFixed(2) || '—', options: { bold: isRoli, color: RED, fill: fillColor, align: 'center' } },
    { text: gap ? `+${gap.toFixed(2)}` : '—', options: { bold: isRoli, color: TEXT_COLOR, fill: fillColor, align: 'center' } }
  ]);
});

slide2.addTable(tableRows, {
  x: 0.5,
  y: 0.9,
  w: 9.0,
  fontFace: 'Arial',
  fontSize: 11,
  border: { pt: 0.5, color: 'd1d5db' },
  colW: [3.5, 1.8, 1.8, 1.2]
});

// ============================================
// SLIDE 3: Percent Change Table (2015 -> 2025)
// ============================================
let slide3 = pptx.addSlide();
slide3.addText('Percent Change: 2015 to 2025', {
  x: 0.5,
  y: 0.3,
  w: '90%',
  fontSize: 24,
  fontFace: 'Arial',
  color: TEXT_COLOR,
  bold: true
});
slide3.addText('OECD-DAC Donors vs. ODA Recipients', {
  x: 0.5,
  y: 0.7,
  w: '90%',
  fontSize: 14,
  fontFace: 'Arial',
  color: MUTED
});

// Create percent change table
const pctTableRows = [
  // Header
  [
    { text: 'Indicator', options: { bold: true, color: TEXT_COLOR, fill: 'f3f4f6' } },
    { text: `Donors (n=${donorCountries.length})`, options: { bold: true, color: BLUE, fill: 'f3f4f6' } },
    { text: `Recipients (n=${recipientCountries.length})`, options: { bold: true, color: RED, fill: 'f3f4f6' } }
  ]
];

// Data rows for percent change
percentChangeTableData.forEach((row, idx) => {
  const isRoli = row.variable === 'roli';
  const fillColor = isRoli ? 'e0e7ff' : (idx % 2 === 0 ? 'ffffff' : 'f9fafb');

  // Format percent change with sign and color
  const formatChange = (val) => {
    if (val == null) return '—';
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
  };

  // Determine color based on positive/negative
  const getChangeColor = (val) => {
    if (val == null) return TEXT_COLOR;
    return val >= 0 ? GREEN : RED;
  };

  pctTableRows.push([
    { text: row.label, options: { bold: isRoli, color: TEXT_COLOR, fill: fillColor } },
    { text: formatChange(row.donorChange), options: { bold: isRoli, color: getChangeColor(row.donorChange), fill: fillColor, align: 'center' } },
    { text: formatChange(row.recipientChange), options: { bold: isRoli, color: getChangeColor(row.recipientChange), fill: fillColor, align: 'center' } }
  ]);
});

slide3.addTable(pctTableRows, {
  x: 0.5,
  y: 1.1,
  w: 9.0,
  fontFace: 'Arial',
  fontSize: 11,
  border: { pt: 0.5, color: 'd1d5db' },
  colW: [4.0, 2.5, 2.5]
});

// ============================================
// SLIDE 4: Time Series Chart
// ============================================
let slide4 = pptx.addSlide();
slide4.addText('Rule of Law Index Evolution (2012-2025)', {
  x: 0.5,
  y: 0.3,
  w: '90%',
  fontSize: 24,
  fontFace: 'Arial',
  color: TEXT_COLOR,
  bold: true
});
slide4.addText('OECD-DAC Donors vs. ODA Recipients', {
  x: 0.5,
  y: 0.7,
  w: '90%',
  fontSize: 14,
  fontFace: 'Arial',
  color: MUTED
});

// Chart data for time series
const chartData = [
  {
    name: `Donors (n=${donorCountries.length})`,
    labels: timeSeriesData.map(d => d.year),
    values: timeSeriesData.map(d => d.donorAvg)
  },
  {
    name: `Recipients (n=${recipientCountries.length})`,
    labels: timeSeriesData.map(d => d.year),
    values: timeSeriesData.map(d => d.recipientAvg)
  }
];

slide4.addChart(pptx.ChartType.line, chartData, {
  x: 0.5,
  y: 1.1,
  w: 9.0,
  h: 4.0,
  chartColors: [BLUE, RED],
  lineSize: 2,
  lineSmooth: false,
  showValue: false,
  catAxisTitle: 'Year',
  valAxisTitle: 'Score',
  valAxisMinVal: 0,
  valAxisMaxVal: 1,
  showLegend: true,
  legendPos: 'b'
});

// ============================================
// SLIDE 5: Percent Change Chart
// ============================================
let slide5 = pptx.addSlide();
slide5.addText(`Percent Change in Rule of Law Index (Relative to ${baseYear})`, {
  x: 0.5,
  y: 0.3,
  w: '90%',
  fontSize: 24,
  fontFace: 'Arial',
  color: TEXT_COLOR,
  bold: true
});
slide5.addText('OECD-DAC Donors vs. ODA Recipients', {
  x: 0.5,
  y: 0.7,
  w: '90%',
  fontSize: 14,
  fontFace: 'Arial',
  color: MUTED
});

// Chart data for percent change
const pctChartData = [
  {
    name: `Donors (n=${donorCountries.length})`,
    labels: percentChangeData.map(d => d.year),
    values: percentChangeData.map(d => d.donorChange)
  },
  {
    name: `Recipients (n=${recipientCountries.length})`,
    labels: percentChangeData.map(d => d.year),
    values: percentChangeData.map(d => d.recipientChange)
  }
];

slide5.addChart(pptx.ChartType.line, pctChartData, {
  x: 0.5,
  y: 1.1,
  w: 9.0,
  h: 4.0,
  chartColors: [BLUE, RED],
  lineSize: 2,
  lineSmooth: false,
  showValue: false,
  catAxisTitle: 'Year',
  valAxisTitle: '% Change',
  showLegend: true,
  legendPos: 'b'
});

// ============================================
// Save presentation
// ============================================
const outputDir = path.join(__dirname, '..', 'custom-presentation-graphics');
const outputPath = path.join(outputDir, 'donors-recipients-presentation.pptx');

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log('\n✓ Generated PowerPoint: donors-recipients-presentation.pptx');
    console.log(`\nOutput: ${outputPath}`);
  })
  .catch(err => {
    console.error('Error generating PowerPoint:', err);
  });
