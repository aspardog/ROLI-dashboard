# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive React dashboard for the World Justice Project Rule of Law Index (ROLI). Visualizes global rule of law data across 8 factors and 44 sub-factors from 2019-2025, with support for regional filtering and multiple chart types.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm start

# Build for production
npm run build

# Run tests
npm test

# Re-generate JSON data from Excel source
npm run parse-data
```

## Architecture

### Data Pipeline

**Source → Parser → JSON → App**

1. Excel file: `data/2025_wjp_rule_of_law_index_HISTORICAL_DATA_FILE.xlsx`
2. Parser: `src/parse-roli-data.js` reads "Historical Data" sheet, normalizes country names, rounds scores
3. Writes to two locations:
   - `data/roli_data.json` (canonical, gitignored)
   - `public/roli_data.json` (served by app, tracked in git)
4. App fetches `/roli_data.json` at runtime

Run `npm run parse-data` after updating the Excel source file.

### Component Architecture

**Root-level App with craco configuration**

- `App.js` (project root) - Main dashboard component that manages global state (region, variable, country, chart type)
- `src/constants.js` - All shared constants (ACTIVE_YEAR, regions, variables, colors)
- `src/TopBottomChart.js` - Horizontal bar chart showing top/bottom performers
- `src/TimeSeriesChart.js` - Line chart showing 2019-2025 trends
- `src/RadarChartView.js` - Multi-year, multi-factor radar visualization
- `src/FactorComparisonChart.js` - Multi-country factor comparison
- `src/svgExport.js` - Font embedding helper for SVG exports (base64 data URIs)
- `src/responsive.css` - Mobile-responsive styles
- `craco.config.js` - Webpack overrides to allow root-level App.js and transpile recharts

### Why App.js is at Project Root

App.js lives outside `src/` to maintain a flatter structure. This requires craco configuration:

1. Remove ModuleScopePlugin to allow imports outside `src/`
2. Extend babel-loader to transpile JSX in root-level files
3. Exclude node_modules except lodash-es and recharts

### State Management

All state lives in `App.js`:
- `allData` - Full dataset loaded from JSON
- `selectedRegion` - Filters data to region or 'global' (used by Time Series, Top/Bottom, Radar)
- `selectedVariable` - Currently selected factor/sub-factor (e.g., 'roli', 'f1', 'sf11')
- `selectedYear` - Year for Top/Bottom and Factor Comparison charts
- `selectedCountry` - Country for Time Series chart ('__regional_avg__' for averages)
- `selectedRadarCountry` - Country for Radar chart ('__regional_avg__' for averages)
- `chartType` - Active chart ('timeseries', 'topbottom', 'radar', 'factors')
- `selectedFactors` - Factors/sub-factors selected for Radar chart (array of objects with value/label)
- `selectedRadarYears` - Years selected for Radar chart (array of year strings)
- `expandedFactorGroups` - Accordion state for Radar chart factor groups (object with group keys)

**Component-level state:**
- `FactorComparisonChart.js`:
  - `selectedCountries` - Array of country/region keys for comparison (default: `['__region_global']`)
  - `expandedRegions` - Accordion state for region groups in country selector

Data filtering happens in `useMemo` hooks to prevent unnecessary re-renders.

### Constants Configuration

**`src/constants.js`** exports:
- `ACTIVE_YEAR` - Default year filter (currently '2025'). Update when new data is released
- `REGION_OPTIONS` - 8 regions including 'global'
- `VARIABLE_OPTIONS` - Overall Index (1), Factors (8), Sub-factors (44)
  - Each has `value`, `label`, and `category` for grouping
- `SUBFACTOR_GROUPS` - Groups sub-factors by parent factor for UI organization
- `COLORS` - Color palette (top5, bottom5, background, text, muted, divider)
- `TS_COLORS` - Time series specific colors

### Chart-Specific Logic

**TopBottomChart**
- Dynamic split: Shows min(5, floor(n/2)) top and bottom performers
- Prevents overlap in small regions (automatically adjusts split count)
- Regional average reference line with label
- SVG export: Legend at top with 18px boxes, 16px text, vertically centered

**TimeSeriesChart**
- 2019-2025 data only (filtered with parseInt(d.year) >= 2019)
- Supports individual countries or regional/global averages
- Fixed Y-axis scale: 0 to 1 with ticks at 0.00, 0.20, 0.40, 0.60, 0.80, 1.00
- First/last year labels aligned (not rotated)
- SVG export includes embedded fonts

**RadarChartView**
- Multi-year overlay (different colors per year: 2019-2025)
- Multi-factor/sub-factor comparison (up to 8 factors)
- Strips number prefix from labels ("F1 - Constraints..." → "Constraints...")
- Supports regional averages
- Chart displayed BEFORE controls (user sees visualization immediately)
- Collapsible accordions organize factor selection by category
- No "Select All" buttons (cleaner interface)
- Radial axis: 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 with 16px font
- SVG export: Year legend at top with color bars, 16px text, vertically centered

**FactorComparisonChart**
- Multi-country/region comparison across all 8 factors (up to 5 selections)
- Year-specific snapshot (filter at top, centered)
- Direct region selection via checkboxes:
  - "Regional Averages" section: Global + 7 regions (uses `__region_global`, `__region_[name]` keys)
  - "Individual Countries" section: Countries grouped by region in collapsible accordions
- Dynamic spacing based on selections:
  - 1-2 selections: 35% gap, 550-600px height
  - 3 selections: 50% gap, 750px height
  - 4 selections: 70% gap, 900px height
  - 5 selections: 100% gap, 1100px height (prevents overcrowding)
- Bar sizes scale down: 32px → 24px → 20px → 18px → 16px
- Factor labels left-aligned for consistency
- SVG export: Legend at top with 5px×30px bars, 16px text, vertically centered

### SVG Export

All charts support SVG download with embedded fonts and professional legends:

**Font Embedding:**
1. `getEmbeddedFontCSS()` fetches Inter Tight from Google Fonts
2. Converts font URLs to base64 data URIs
3. Injects into `<style>` element in exported SVG
4. Ensures self-contained, portable SVG files

**Legend Positioning (as of 2025):**
- All legends positioned at TOP of exported SVG (not bottom)
- Larger, more visible elements:
  - Text: 16px font (was 13px), uses COLORS.text for visibility
  - TopBottomChart: 18px boxes
  - RadarChartView: 4px height color bars (30px width)
  - FactorComparisonChart: 5px height bars (30px width)
- Vertical alignment: Color elements centered with text using `dominant-baseline='middle'`
- White background covers entire SVG (chart + legend area)

Charts manually construct legends in `downloadSVG()` functions using helper methods `el()` and `txt()`.

### Column Mapping (Excel → JSON)

Parser uses fixed column indices from "Historical Data" sheet:
- Col 0: Country name (normalized via lookup map)
- Col 1: Year
- Col 4: Region
- Col 5: `roli` (Overall Index)
- Col 6-12: `f1` + `sf11`-`sf16` (Factor 1 + sub-factors)
- Col 13-17: `f2` + `sf21`-`sf24` (Factor 2 + sub-factors)
- ...continues through Factor 8 (col 50-57: `f8` + `sf81`-`sf87`)

All scores rounded to 3 decimal places.

### Mobile Responsiveness

`src/responsive.css` provides breakpoints:
- Controls stack vertically on mobile
- Chart containers adjust padding
- Font sizes scale down appropriately

### Key Patterns

**Regional averages**:
- Time Series & Radar: Special value `'__regional_avg__'` triggers average calculations across filtered data
- Factor Comparison: Uses `__region_global` and `__region_[regionName]` keys for direct region selection
  - Example: `__region_East Asia and Pacific` calculates average for that region
  - `__region_global` calculates average across all countries

**Data filtering**: Two-stage filter - first by year, then by region (if not global)

**Memoization**: Heavy use of `useMemo` for derived data (chartData, averages, available countries)

**Country normalization**: Parser maps Excel country names to display names (e.g., "Venezuela, RB" → "Venezuela")

**Dynamic scaling**: Charts adjust height, spacing, and element sizes based on number of selections to prevent overcrowding

## Recent Improvements (2025)

### Factor Comparison Chart Enhancements
- **Direct Region Selection**: Users can now select regions directly via checkboxes instead of changing global region filter
  - "Regional Averages" section with Global + 7 regions
  - "Individual Countries" section with collapsible region groups
  - Supports comparing any mix of regions/countries (up to 5 total)
- **Dynamic Spacing**: Chart height and spacing automatically adjust based on number of selections to prevent overcrowding
- **Left-Aligned Labels**: All factor labels aligned to left for visual consistency
- **Simplified Controls**: Removed redundant REGION filter, kept only YEAR selector (centered, 300px wide)

### SVG Export Improvements
- **Unified Legend Position**: All charts now show legends at TOP of exported SVG (previously at bottom)
- **Larger, More Visible Elements**:
  - Text increased from 13px to 16px
  - Color boxes/bars made larger (18px boxes, 4-5px height bars)
  - Changed text color from COLORS.muted to COLORS.text for better visibility
- **Perfect Vertical Alignment**: Color elements centered with text using `dominant-baseline='middle'`

### Radar Chart Improvements
- **Chart-First Layout**: Radar visualization shown BEFORE controls for immediate visual feedback
- **Cleaner Interface**: Removed "Select All"/"Deselect All" buttons for minimal UI
- **Better Readability**: Increased radial axis values to 16px font
- **More Granular Scale**: Added intermediate tick labels (0.0, 0.2, 0.4, 0.6, 0.8, 1.0)
- **Legend in SVG Export**: Year legend now included in exported SVG files

### Time Series Chart Improvements
- **Fixed Y-Axis Scale**: Changed from dynamic to fixed 0-1 scale for consistency across comparisons
- **Standardized Ticks**: Always shows 0.00, 0.20, 0.40, 0.60, 0.80, 1.00

### Top/Bottom Chart Improvements
- **Increased Legend Size**: Larger boxes (18px) and text (16px) in SVG exports
- **Top Position**: Legend moved to top of exported SVG

## Common Tasks

### Adding a New Chart Type

1. Create new chart component in `src/`
2. Add chart type to `chartType` state in `App.js`
3. Add toggle button in chart-toggle-container
4. Render conditionally in charts section
5. Add any new controls needed

### Updating to New Year Data

1. Replace Excel file in `data/`
2. Run `npm run parse-data`
3. Update `ACTIVE_YEAR` in `src/constants.js`
4. Add new year option to year dropdowns in `App.js` if needed

### Modifying Colors

Edit `COLORS` or `TS_COLORS` in `src/constants.js`. Changes propagate to all components.

### Adding/Modifying Factors or Sub-factors

1. Update column mapping in `src/parse-roli-data.js` if Excel structure changed
2. Update `VARIABLE_OPTIONS` in `src/constants.js`
3. Update `SUBFACTOR_GROUPS` if adding new factor
4. Re-run parser

## Tech Stack

- **React 18** (Create React App foundation)
- **Recharts** - All chart rendering
- **craco** - Webpack configuration overrides
- **xlsx** - Excel parsing in data pipeline
- **Inter Tight font** (Google Fonts) - Typography
