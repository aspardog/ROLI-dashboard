/**
 * parse-roli-data.js
 * Reads the WJP Historical Data Excel file and outputs a JSON dataset
 * containing all countries, regions, and years.
 *
 * Usage: npm run parse-data
 * Output: data/roli_data.json  (also copied to public/roli_data.json for dev-server)
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_PATH = path.resolve(__dirname, '..', 'data', '2025_wjp_rule_of_law_index_HISTORICAL_DATA_FILE.xlsx');
const OUTPUT_PATH  = path.resolve(__dirname, '..', 'data',   'roli_data.json');
const PUBLIC_PATH  = path.resolve(__dirname, '..', 'public', 'roli_data.json');

// Maps Excel column indices to output keys.
// Derived from the "Historical Data" sheet structure:
//   Col 5  = Overall Score | Col 6  = F1 | Col 7-12  = SF 1.1-1.6
//   Col 13 = F2            | Col 14-17 = SF 2.1-2.4
//   Col 18 = F3            | Col 19-22 = SF 3.1-3.4
//   Col 23 = F4            | Col 24-31 = SF 4.1-4.8
//   Col 32 = F5            | Col 33-35 = SF 5.1-5.3
//   Col 36 = F6            | Col 37-41 = SF 6.1-6.5
//   Col 42 = F7            | Col 43-49 = SF 7.1-7.7
//   Col 50 = F8            | Col 51-57 = SF 8.1-8.7
const SCORE_COLUMNS = [
  [5,  'roli'],
  [6,  'f1'],  [7,  'sf11'], [8,  'sf12'], [9,  'sf13'], [10, 'sf14'], [11, 'sf15'], [12, 'sf16'],
  [13, 'f2'],  [14, 'sf21'], [15, 'sf22'], [16, 'sf23'], [17, 'sf24'],
  [18, 'f3'],  [19, 'sf31'], [20, 'sf32'], [21, 'sf33'], [22, 'sf34'],
  [23, 'f4'],  [24, 'sf41'], [25, 'sf42'], [26, 'sf43'], [27, 'sf44'], [28, 'sf45'], [29, 'sf46'], [30, 'sf47'], [31, 'sf48'],
  [32, 'f5'],  [33, 'sf51'], [34, 'sf52'], [35, 'sf53'],
  [36, 'f6'],  [37, 'sf61'], [38, 'sf62'], [39, 'sf63'], [40, 'sf64'], [41, 'sf65'],
  [42, 'f7'],  [43, 'sf71'], [44, 'sf72'], [45, 'sf73'], [46, 'sf74'], [47, 'sf75'], [48, 'sf76'], [49, 'sf77'],
  [50, 'f8'],  [51, 'sf81'], [52, 'sf82'], [53, 'sf83'], [54, 'sf84'], [55, 'sf85'], [56, 'sf86'], [57, 'sf87'],
];

// Normalise country names that differ between the Excel and the dashboard.
const COUNTRY_NAME_MAP = {
  'Venezuela, RB': 'Venezuela',
};

function round3(value) {
  return typeof value === 'number' ? Math.round(value * 1000) / 1000 : null;
}

function parseData() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('Excel file not found:', EXCEL_PATH);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets['Historical Data'];

  if (!sheet) {
    console.error('Sheet "Historical Data" not found in workbook.');
    process.exit(1);
  }

  // header: 1 → each row is a plain array of cell values
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const dataRows = rows.slice(1); // skip header row

  const results = [];

  for (const row of dataRows) {
    const rawCountry = row[0];
    const year        = String(row[1]);
    const region      = row[4];

    if (!rawCountry || !region || !year) continue;

    const country = COUNTRY_NAME_MAP[rawCountry] || rawCountry;

    const entry = { country, year, region };

    for (const [colIdx, key] of SCORE_COLUMNS) {
      entry[key] = round3(row[colIdx]);
    }

    results.push(entry);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

  // public/ only needs the latest year — keeps the served file small
  const years      = [...new Set(results.map(r => r.year))].sort();
  const latestYear = years[years.length - 1];
  const publicData = results.filter(r => r.year === latestYear);
  fs.writeFileSync(PUBLIC_PATH, JSON.stringify(publicData));

  // --- Summary ---
  const regions  = [...new Set(results.map(r => r.region))];
  const countries = [...new Set(results.map(r => r.country))];

  console.log(`✓ Parsed ${results.length} entries → ${OUTPUT_PATH}`);
  console.log(`  Countries: ${countries.length} | Regions: ${regions.length} | Years: ${years.length}`);
  console.log(`  Years: ${years.join(', ')}`);
  console.log(`  Regions: ${regions.join(', ')}`);
  console.log(`✓ Public copy filtered to ${latestYear}: ${publicData.length} entries → ${PUBLIC_PATH}`);
}

parseData();
