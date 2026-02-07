# ROLI Dashboard — Project Documentation

## Project Overview

An interactive React dashboard for the **World Justice Project Rule of Law Index (ROLI)**. The app provides four visualization types:
1. **Top/Bottom Performers** — Horizontal bar chart showing top and bottom performers for any factor/sub-factor
2. **Time Series** — Line chart displaying 2019-2025 trends for countries or regional averages
3. **Radar Chart** — Multi-year, multi-factor comparison overlay
4. **Factor Comparison** — Multi-country comparison across all 8 factors

All charts support regional filtering (Global + 7 WJP regions) and SVG export with embedded fonts. Data is sourced from the official WJP Historical Data Excel file covering 8 factors and 44 sub-factors.

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
│   ├── index.js                  # React entry point
│   ├── parse-roli-data.js        # Excel → JSON parser
│   ├── constants.js              # Shared constants (ACTIVE_YEAR, regions, variables, colors)
│   ├── svgExport.js              # Font embedding helper for SVG exports
│   ├── TopBottomChart.js         # Top/Bottom performers chart component
│   ├── TimeSeriesChart.js        # Time series chart component
│   ├── RadarChartView.js         # Radar chart component (multi-year, multi-factor)
│   ├── SimpleRadarChart.js       # Base radar chart implementation
│   ├── FactorComparisonChart.js  # Multi-country factor comparison chart
│   └── responsive.css            # Mobile-responsive styles
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

- **`App.js`** — Main dashboard component (`ROLIDashboard`). Manages global state:
  - `allData` — Full dataset loaded from JSON
  - `selectedRegion` — Region filter or 'global'
  - `selectedVariable` — Current factor/sub-factor (e.g., 'roli', 'f1', 'sf11')
  - `selectedYear` — Year for Top/Bottom and Factor Comparison charts
  - `selectedCountry` — Country for Time Series chart ('__regional_avg__' for averages)
  - `chartType` — Active chart ('timeseries', 'topbottom', 'radar', 'factors')
  - `selectedFactors` — Factors/sub-factors for Radar chart
  - `selectedRadarYears` — Years for Radar chart

- **`src/constants.js`** — Exports all shared constants:
  - `ACTIVE_YEAR` — Default year filter (currently '2025'). Update when new data is released.
  - `REGION_OPTIONS`, `VARIABLE_OPTIONS`, `SUBFACTOR_GROUPS` — Dropdown options
  - `COLORS`, `TS_COLORS` — Color palettes for charts

- **`src/svgExport.js`** — Provides `getEmbeddedFontCSS()`, which fetches Inter Tight from Google Fonts and converts all font URLs to base64 data URIs. This ensures exported SVGs are fully self-contained with embedded fonts.

- **`src/TopBottomChart.js`** — Top/Bottom performers horizontal bar chart. Features:
  - Dynamic split count: shows min(5, floor(n/2)) performers to prevent overlap
  - Regional average reference line with label
  - Word-wrapped country names
  - SVG export with embedded legend

- **`src/TimeSeriesChart.js`** — Time series line chart (2019–2025). Features:
  - Regional/global average computation
  - Auto-scaled Y-axis (rounds to nearest 0.02 with 0.06 padding)
  - Aligned first/last year labels
  - SVG export

- **`src/RadarChartView.js`** — Multi-year, multi-factor radar visualization. Features:
  - Overlay multiple years (2019-2025) with different colors per year
  - Compare multiple factors and sub-factors simultaneously
  - Supports individual countries or regional/global averages
  - Strips number prefix from labels for cleaner display
  - SVG export

- **`src/FactorComparisonChart.js`** — Multi-country factor comparison. Features:
  - Compare up to 5 countries across all 8 factors
  - Year-specific snapshot
  - Grouped bar chart visualization
  - SVG export

- **`src/responsive.css`** — Mobile-responsive styles with breakpoints for controls and chart containers.

---

## Chart Types and Usage

The dashboard provides four distinct visualization modes, each optimized for different analytical needs:

### 1. Top/Bottom Performers (`chartType: 'topbottom'`)

**Purpose**: Identify highest and lowest scoring countries for a specific factor/sub-factor in a given year.

**Controls**:
- Region (Global or specific region)
- Variable (Overall Index, Factor, or Sub-factor)
- Year (2019-2025)

**Key Features**:
- Dynamic split count prevents overlap in regions with fewer countries
- Shows min(5, floor(n/2)) top and bottom performers
- Regional average reference line with inline label
- Horizontal bar layout with country names word-wrapped

**Use Case**: "Which countries scored highest/lowest on Civil Justice in 2025?"

### 2. Time Series (`chartType: 'timeseries'`)

**Purpose**: Track how a specific country or regional average has changed over time (2019-2025).

**Controls**:
- Region (filters available countries)
- Variable (Overall Index, Factor, or Sub-factor)
- Country (or Regional/Global Average)

**Key Features**:
- Auto-scaled Y-axis (nearest 0.02 increments)
- Supports individual countries or calculated averages
- First/last year labels aligned (not rotated)
- Shows 7-year trend line

**Use Case**: "How has Denmark's Regulatory Enforcement score changed from 2019 to 2025?"

### 3. Radar Chart (`chartType: 'radar'`)

**Purpose**: Multi-dimensional comparison showing multiple factors/sub-factors across different years.

**Controls**:
- Region (filters available countries)
- Country/Region (or Regional/Global Average)
- Factors/Sub-factors to compare (checkboxes)
- Years to compare (multiple selection, 2019-2025)

**Key Features**:
- Overlay multiple years with color-coded polygons
- Compare any combination of factors and sub-factors
- Strips number prefix from labels (e.g., "F1 - " removed)
- Each year gets distinct color from YEAR_COLORS palette

**Use Case**: "How did Chile's performance across all 8 factors change between 2023, 2024, and 2025?"

### 4. Factor Comparison (`chartType: 'factors'`)

**Purpose**: Compare multiple countries across all 8 factors simultaneously for a specific year.

**Controls**:
- Region (filters available countries)
- Year (2019-2025)
- Countries to compare (selected within chart UI)

**Key Features**:
- Side-by-side grouped bar chart
- Compare up to 5 countries at once
- All 8 factors displayed in single view
- Year-specific snapshot

**Use Case**: "How do Norway, Sweden, and Finland compare across all 8 factors in 2025?"

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

## Common Development Tasks

### Updating to New Year Data

When a new WJP ROLI edition is released:

1. Replace the Excel file in `data/` with the new Historical Data file
2. Run `npm run parse-data` to regenerate both JSON files
3. Update `ACTIVE_YEAR` in `src/constants.js` to the new year (e.g., '2026')
4. Add the new year to dropdown options in `App.js` (around lines 99-106, 133-140, 289)
5. Test all four chart types with the new data

### Adding a New Chart Type

1. Create a new chart component in `src/` (e.g., `src/MyNewChart.js`)
2. Import the component in `App.js`
3. Add a new value to the `chartType` state (e.g., 'mynewchart')
4. Add a toggle button in the chart-toggle-container section (around line 146)
5. Add conditional rendering in the charts section (around line 166)
6. Add any new controls needed in a controls section
7. Ensure the component follows the SVG export pattern if download is needed

### Modifying Chart Colors

All color constants are centralized in `src/constants.js`:

- `COLORS` — Used by Top/Bottom and general UI (top5, bottom5, background, text, muted, divider)
- `TS_COLORS` — Time series specific (line, axis, grid)
- `YEAR_COLORS` — Radar chart year colors (defined in `RadarChartView.js`)

Changes to these objects propagate automatically to all components.

### Adding or Modifying Factors/Sub-factors

If the WJP changes the factor structure or adds new sub-factors:

1. Update column mapping in `src/parse-roli-data.js` (around lines with column indices)
2. Update `VARIABLE_OPTIONS` in `src/constants.js` with new entries
3. Update `SUBFACTOR_GROUPS` if a new factor was added
4. Re-run `npm run parse-data` to regenerate JSON with new structure
5. Test all chart types, especially Radar and Factor Comparison

### Customizing Regional Average Calculations

Regional averages are computed on-the-fly in each chart component:

- **TopBottomChart**: Lines 21-25 (average for reference line)
- **TimeSeriesChart**: Lines 10-22 (average per year when `country === '__regional_avg__'`)
- **RadarChartView**: Lines 49-59 (average per factor per year)

The special value `'__regional_avg__'` triggers average calculations across filtered data.

### Debugging Data Issues

If charts show unexpected data:

1. Check `public/roli_data.json` — this is the file served to the browser
2. Verify the Excel source has data for all years/regions
3. Check browser console for fetch errors
4. Confirm `ACTIVE_YEAR` matches data in the JSON
5. Look for `null` or `undefined` values in the variable column being displayed

---

## Why craco?

Create React App restricts imports to files inside `src/` and only runs its babel-loader (which handles JSX) on that same directory. `App.js` lives at the project root, so two overrides are needed:

1. **ModuleScopePlugin removed** — allows `src/index.js` to `import '../App'`.
2. **babel-loader `include` extended** — ensures JSX in root-level `.js` files is transformed.

Both overrides live in `craco.config.js`. The `npm` scripts (`start`, `build`, `test`) run through `craco` instead of `react-scripts` directly; everything else (dev server, hot reload, production build) behaves identically.

---

## Mobile Responsive Design

The dashboard is optimized for mobile devices through `src/responsive.css`, which provides breakpoints for different screen sizes:

### Breakpoints

- **Mobile**: `max-width: 768px`
  - Controls stack vertically instead of horizontal flex
  - Reduced padding on containers (16px → 12px)
  - Smaller font sizes for headers
  - Chart toggle buttons wrap to multiple rows
  - Radar controls grid reduces to single column

- **Small Mobile**: `max-width: 480px`
  - Further reduced padding (12px → 8px)
  - Smaller header bar (6px → 4px width, 48px → 36px height)
  - More compact radar control checkboxes

### Key Responsive Classes

- `.dashboard-container` — Main wrapper with responsive padding
- `.dashboard-header` — Header with accent bar and title
- `.controls-container` — Dropdown controls that stack on mobile
- `.chart-toggle-container` — Chart type buttons that wrap
- `.radar-controls` — Radar chart control panel
- `.radar-controls-row` — Stacks vertically on mobile
- `.radar-controls-grid` — Factor/subfactor checkboxes grid

All charts use Recharts' `ResponsiveContainer`, which automatically adapts chart dimensions to the viewport.

