# ROLI Dashboard — Project Documentation

## Project Overview

An interactive React dashboard for the **World Justice Project Rule of Law Index (ROLI)**. The app displays a Top / Bottom Performers horizontal bar chart for any ROLI factor or sub-factor (44 sub-factors total), filterable by region (Global + 7 WJP regions). The split count adapts automatically — regions with fewer than 10 countries split evenly to avoid overlap. Data is sourced from the official WJP Historical Data Excel file.

---

## Directory Layout

```
/
├── data/                     # Gitignored — not tracked in the repo
│   ├── 2025_wjp_rule_of_law_index_HISTORICAL_DATA_FILE.xlsx   # Source data (WJP)
│   └── roli_data.json        # Canonical parsed dataset (generated)
├── public/
│   ├── roli_data.json        # Copy served by the dev/build server (generated)
│   └── ...                   # Standard CRA public assets (index.html, favicon, etc.)
├── src/
│   ├── index.js              # React entry point
│   ├── parse-roli-data.js    # Excel → JSON parser
│   ├── constants.js          # Shared constants (ACTIVE_YEAR, regions, variables, colors)
│   ├── svgExport.js          # Font embedding helper for SVG exports
│   ├── TopBottomChart.js     # Top/Bottom performers chart component
│   └── TimeSeriesChart.js    # Time series chart component
├── App.js                    # Main dashboard component (root level)
├── craco.config.js           # Webpack overrides (see below)
├── package.json
├── README.md                 # Project overview and quick-start
└── Documentation.md          # This file
```

---

## Data Pipeline

```
Excel file (data/)  →  parse-roli-data.js  →  roli_data.json (data/ + public/)  →  fetch() in App.js
```

### 1. Source file

`data/2025_wjp_rule_of_law_index_HISTORICAL_DATA_FILE.xlsx`

The official WJP export. The parser reads the sheet named **Historical Data**. When a new edition is released, replace this file and re-run the parser.

### 2. Parser (`npm run parse-data`)

Defined in `src/parse-roli-data.js`. It:

- Reads every row of the "Historical Data" sheet.
- Maps fixed column indices to named keys (`roli`, `f1`–`f8`, `sf11`–`sf87`).
- Normalises country names where the Excel differs from the dashboard (e.g. "Venezuela, RB" → "Venezuela") via a lookup map.
- Rounds all scores to three decimal places.
- Writes the full dataset to **two locations**:
  - `data/roli_data.json` — the canonical local copy (gitignored, not tracked in the repo).
  - `public/roli_data.json` — the copy that CRA's dev server (and production build) serves as a static asset. This file **is** tracked in git.

Run it any time the source Excel changes:

```bash
npm run parse-data
```

### 3. App data loading

`App.js` (at the project root) fetches `/roli_data.json` at runtime via `fetch()` inside a `useEffect`.

After fetching, the full dataset is filtered in-memory:

- **Year** — fixed by the constant `ACTIVE_YEAR` in `src/constants.js` (currently `'2025'`). Change this value when a new edition is released.
- **Region** — selected at runtime via the Region dropdown. Options include Global (all countries) and the 7 WJP regions. The filter runs on every selection change.

---

## Component Architecture

The dashboard uses a modular structure for maintainability and extensibility:

- **`App.js`** — Main dashboard component (`ROLIDashboard`). Manages state (region, variable, country, chart type), fetches data, and renders controls and the active chart.
- **`src/constants.js`** — Exports all shared constants:
  - `ACTIVE_YEAR` — Current year filter for the Top/Bottom chart
  - `REGION_OPTIONS`, `VARIABLE_OPTIONS`, `SUBFACTOR_GROUPS` — Dropdown options
  - `COLORS`, `TS_COLORS` — Color palettes for both chart types
- **`src/svgExport.js`** — Provides `getEmbeddedFontCSS()`, which fetches Inter Tight from Google Fonts and converts all font URLs to base64 data URIs. This ensures exported SVGs are fully self-contained with embedded fonts.
- **`src/TopBottomChart.js`** — Top/Bottom performers horizontal bar chart. Features: dynamic split count, regional average line, word-wrapped country names, SVG export with legend.
- **`src/TimeSeriesChart.js`** — Time series line chart (2019–2025). Features: regional/global average computation, auto-scaled Y-axis, aligned first/last labels, SVG export.

---

## Column Mapping

The Excel "Historical Data" sheet uses a fixed column layout. The parser maps columns by index:

| Column | Key    | Meaning                          |
|--------|--------|----------------------------------|
| 0      | —      | Country name                     |
| 1      | —      | Year                             |
| 4      | —      | Region                           |
| 5      | roli   | Overall ROLI score               |
| 6      | f1     | F1 – Constraints on Gov. Power   |
| 7–12   | sf11–sf16 | Sub-factors of F1             |
| 13     | f2     | F2 – Absence of Corruption       |
| 14–17  | sf21–sf24 | Sub-factors of F2             |
| 18     | f3     | F3 – Open Government             |
| 19–22  | sf31–sf34 | Sub-factors of F3             |
| 23     | f4     | F4 – Fundamental Rights          |
| 24–31  | sf41–sf48 | Sub-factors of F4             |
| 32     | f5     | F5 – Order and Security          |
| 33–35  | sf51–sf53 | Sub-factors of F5             |
| 36     | f6     | F6 – Regulatory Enforcement       |
| 37–41  | sf61–sf65 | Sub-factors of F6             |
| 42     | f7     | F7 – Civil Justice               |
| 43–49  | sf71–sf77 | Sub-factors of F7             |
| 50     | f8     | F8 – Criminal Justice            |
| 51–57  | sf81–sf87 | Sub-factors of F8             |

---

## Running Locally

```bash
# Install dependencies
npm install

# (Re-)generate the JSON dataset from the Excel source
npm run parse-data

# Start the development server
npm start
# → http://localhost:3000
```

---

## Why craco?

Create React App restricts imports to files inside `src/` and only runs its babel-loader (which handles JSX) on that same directory. `App.js` lives at the project root, so two overrides are needed:

1. **ModuleScopePlugin removed** — allows `src/index.js` to `import '../App'`.
2. **babel-loader `include` extended** — ensures JSX in root-level `.js` files is transformed.

Both overrides live in `craco.config.js`. The `npm` scripts (`start`, `build`, `test`) run through `craco` instead of `react-scripts` directly; everything else (dev server, hot reload, production build) behaves identically.

