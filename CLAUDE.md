# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive React dashboard for the World Justice Project Rule of Law Index (ROLI). Visualizes global rule of law data across 8 factors and 44 sub-factors from 2019-2025, with support for regional filtering and multiple chart types.

## Collaborator Roles

This project has multiple collaborators with different roles and permissions:

### Main User (aspardog) - Lead Developer & Maintainer
- **Permissions:** Full access to all branches, can merge to `main`
- **Responsibilities:** Core logic, data pipeline, architecture, code reviews, final approvals
- **Can modify:** Everything
- **Working branches:** `main` (via PR), `design`, feature branches

### Designer - Visual Design & UX
- **Permissions:** Write access to `design` branch only, cannot merge to `main` without approval
- **Responsibilities:** Visual design, color schemes, typography, spacing, responsive layouts, UX improvements
- **Can modify:** Styles (CSS, inline styles), colors in constants.js, component visual appearance
- **Cannot modify:** Core logic, data processing, configuration files, parsers
- **Working branch:** `design` (ALWAYS)
- **Important:** See `docs/designer/DESIGNER_README.md` for detailed designer-specific guidance

### How Claude Code Should Assist Based on User Role

**When assisting the Designer:**
- Focus ONLY on visual/styling changes
- Suggest modifications to CSS, inline styles, colors, spacing, typography
- NEVER modify component logic, data processing, or configuration
- ALWAYS verify they're working on `design` branch
- Recommend creating Pull Requests for review
- Reference `docs/designer/DESIGNER_README.md` for designer-specific guidelines
- Provide clear explanations of what each style property does
- Help with responsive design and mobile layouts

**When assisting Main User:**
- Full access to all architectural decisions
- Can modify core logic, data pipeline, configuration
- Can work on any branch
- Can approve and merge Pull Requests
- **IMPORTANT:** After any merge to `main` or commit to `main`, remind Main User to run `./sync-design.sh` to sync the designer's branch

**If user role is unclear:**
- Ask: "Are you the designer or the developer on this project?"
- Read context from their requests (design-focused vs logic-focused)
- Default to designer restrictions if uncertain (safer)

## Development Commands

**Prerequisites:** Node.js 16+

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

# Security audit (check for high-severity vulnerabilities)
npm run audit

# Automatically fix vulnerabilities
npm run audit:fix
```

## Architecture

### Data Pipeline

**Source → Parser → JSON → App**

1. Excel file: `data/2025_wjp_rule_of_law_index_HISTORICAL_DATA_FILE.xlsx`
2. Parser: `scripts/parse-roli-data.js` reads "Historical Data" sheet, normalizes country names, rounds scores
3. Writes to two locations:
   - `data/roli_data.json` (canonical, gitignored)
   - `public/roli_data.json` (served by app, tracked in git)
4. App fetches `/roli_data.json` at runtime

Run `npm run parse-data` after updating the Excel source file.

### Component Architecture

**Organized folder structure with barrel exports**

```
src/
├── App.js                    # Main dashboard component (state management)
├── index.js                  # React entry point
│
├── charts/                   # All chart components
│   ├── index.js              # Barrel export
│   ├── TimeSeriesChart.js    # Line chart showing 2019-2025 trends
│   ├── CountryProfileChart.js # Country performance breakdown
│   ├── TopBottomChart.js     # Horizontal bar chart (top/bottom performers)
│   ├── RadarChartView.js     # Multi-year radar with factor selection
│   └── FactorComparisonChart.js # Multi-country factor comparison
│
├── modals/                   # Modal components
│   ├── index.js              # Barrel export
│   ├── InfoModal.js          # Rule of Law Index explanation
│   └── HowToUseModal.js      # Dashboard usage guide
│
├── components/               # Reusable UI components
│   ├── index.js              # Barrel export
│   └── ChartCard.js          # Chart container with export button
│
├── config/                   # Configuration and constants
│   ├── index.js              # Barrel export
│   └── constants.js          # ACTIVE_YEAR, regions, variables, colors
│
├── utils/                    # Utility functions
│   ├── index.js              # Barrel export
│   ├── svgExport.js          # Font fetching for SVG export
│   └── svgExportHelpers.js   # SVG legend and element helpers
│
└── styles/                   # CSS files
    └── responsive.css        # Mobile-responsive styles

scripts/
└── parse-roli-data.js        # Excel → JSON data pipeline

craco.config.js               # Webpack config for recharts transpilation
```

**Barrel exports** enable clean imports:
```js
import { RadarChartView, TimeSeriesChart } from './charts';
import { COLORS, REGION_OPTIONS } from './config';
import { InfoModal, HowToUseModal } from './modals';
```

### State Management

All state lives in `App.js`:
- `allData` - Full dataset loaded from JSON
- `selectedRegion` - Filters data to region or 'global' (used by Time Series, Top/Bottom)
- `selectedVariable` - Currently selected factor/sub-factor (e.g., 'roli', 'f1', 'sf11')
- `selectedYear` - Year for Top/Bottom and Factor Comparison charts
- `selectedCountry` - Country for Time Series chart ('__regional_avg__' for averages)
- `chartType` - Active chart ('timeseries', 'profile', 'topbottom', 'radar', 'factors')
- `yearRange` - Array [startYear, endYear] for Time Series chart range
- `showRegionalAvg` / `showGlobalAvg` - Reference line toggles for Time Series
- `selectedProfileCountry` / `selectedProfileRegion` - Country Profile chart selections
- `selectedRadarEntity` - Entity for Radar chart ('__region_global', '__region_[name]', or country name)
- `selectedRadarYears` - Years selected for Radar chart (array of year strings)
- `selectedRadarFactors` - Factors/subfactors selected for Radar chart (array of keys like 'roli', 'f1', 'sf11')
- `radarFactorsExpanded` - Boolean controlling Factors & Subfactors accordion visibility
- `expandedRadarFactorGroups` - Accordion state for individual factor groups (object with factor keys)
- `radarYearsExpanded` - Boolean controlling Years accordion visibility
- `factorCompareCountries` - Countries/regions selected for Factor Comparison chart
- `expandedFactorRegions` - Accordion state for Factor Comparison country selector
- `isInfoModalOpen` - Boolean controlling visibility of InfoModal
- `isHowToUseModalOpen` - Boolean controlling visibility of HowToUseModal

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
- Multi-year overlay (different colors per year: 2020-2025)
- Dynamic factor/subfactor selection via collapsible accordions in sidebar
- Minimum 3 factors/subfactors required for radar display
- Default selection: Overall Index + 8 main factors
- Supports all 44 subfactors organized by parent factor
- Strips number prefix from labels ("F1 - Constraints..." → "Constraints...")
- Supports regional averages and individual countries
- `selectedFactors` prop accepts array of keys (e.g., ['roli', 'f1', 'sf11', 'sf21'])
- `ALL_FACTORS_MAP` in component maps keys to labels and short labels
- Radial axis: 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 with 11px font
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

### Informational Modals

The dashboard includes two informational modals accessible from the header banner:

**InfoModal (`src/InfoModal.js`)**
- Triggered by "Learn about the Index →" link in banner
- Explains what the Rule of Law Index is and how it's structured
- Lists all 8 factors with descriptions
- Details all 44 sub-factors organized by parent factor
- Scrollable modal with close button (×) and click-outside-to-close
- Responsive styles for mobile devices

**HowToUseModal (`src/HowToUseModal.js`)**
- Triggered by "How to use this dashboard →" link in banner
- Provides usage guide for all 4 visualization types:
  1. Time Series - trends over time
  2. Top & Bottom Performers - rankings
  3. Radar Chart - performance profiles
  4. Factor Comparison - side-by-side comparisons
- Includes SVG export explanation
- Same modal structure and behavior as InfoModal

**Banner Implementation:**
- Two separate inline button links below main description
- Both styled consistently with underline and hover effects
- State managed in App.js via `isInfoModalOpen` and `isHowToUseModalOpen`

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

### Performance Optimizations

The dashboard implements several performance optimizations:

**Font Loading (`public/index.html`):**
- Preconnect to Google Fonts domains
- Async font loading with `preload` + `onload` pattern
- Fallback `<noscript>` for compatibility
- Eliminates Flash of Unstyled Text (FOUT)

**Data Prefetching:**
- `<link rel="prefetch">` for `roli_data.json` in HTML head
- Browser downloads data while parsing HTML

**localStorage Caching (`src/App.js`):**
```js
const CACHE_KEY = 'roli_data_cache';
const CACHE_VERSION_KEY = 'roli_data_version';
const CURRENT_VERSION = '2025.1'; // Update when data changes
```
- First visit: Fetches data → saves to localStorage
- Subsequent visits: Instant load from cache (~300ms vs ~1500ms)
- Version-controlled: Update `CURRENT_VERSION` to invalidate cache

**HTTP Caching (`vercel.json`):**
- `roli_data.json`: 1 day cache + 7 days stale-while-revalidate
- Static assets (`/static/*`): 1 year immutable cache

**Code Splitting:**
- Chart components lazy-loaded with `React.lazy()`
- Reduces initial bundle size

**Memoization:**
- Heavy use of `useMemo` for derived data
- `React.memo` on chart components

### Security

The dashboard implements comprehensive security measures. For full details, see `docs/security/SECURITY.md`.

**HTTP Security Headers (`vercel.json`):**

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer info |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables sensitive APIs |
| `Content-Security-Policy` | Strict CSP | Prevents XSS/code injection |

**Content Security Policy:**
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob:;
connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
```

**Dependency Security:**
- npm overrides in `package.json` force secure versions of transitive dependencies
- Regular security audits via `npm run audit`
- Automatic fixes via `npm run audit:fix`

**Code Security Practices:**
- No `dangerouslySetInnerHTML` usage
- No `eval()` or `new Function()` calls
- No hardcoded secrets or API keys
- All external resources use HTTPS
- `.gitignore` excludes `.env` files and `/data/` directory

**Known Limitations:**
- `xlsx` (devDependency) has unfixable vulnerabilities but is only used offline for data parsing, never in production
- Some `react-scripts` transitive dependencies have vulnerabilities; pinned to stable version

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
3. Update `ACTIVE_YEAR` in `src/config/constants.js`
4. Update `CURRENT_VERSION` in `src/App.js` to invalidate localStorage cache (e.g., '2025.1' → '2026.1')
5. Add new year option to year dropdowns in `App.js` if needed

### Modifying Colors

Edit `COLORS` or `TS_COLORS` in `src/constants.js`. Changes propagate to all components.

### Adding/Modifying Factors or Sub-factors

1. Update column mapping in `scripts/parse-roli-data.js` if Excel structure changed
2. Update `VARIABLE_OPTIONS` in `src/config/constants.js`
3. Update `SUBFACTOR_GROUPS` if adding new factor
4. Re-run parser

### Syncing Design Branch After Merge to Main (For Main User)

**CRITICAL:** After merging any PR to `main` or committing directly to `main`, you MUST sync the `design` branch so the designer works with your latest code.

**Quick command:**
```bash
./sync-design.sh
```

This script automatically:
1. Updates your local `main` branch
2. Switches to `design` branch
3. Merges `main` into `design`
4. Pushes updated `design` to GitHub
5. Returns you to your original branch

**When to sync:**
- ✅ Just merged a PR from designer → Run sync
- ✅ Just committed your own changes to `main` → Run sync
- ✅ Just pushed to `main` → Run sync

**Why this matters:**
- Prevents merge conflicts later
- Designer always works with current code
- Avoids duplicate work
- Ensures design changes apply to latest implementation

**For Claude Code:** When assisting Main User and you see commits/merges to `main`, remind them to run `./sync-design.sh` to keep the designer's branch updated.

See `docs/maintainer/SYNC_GUIDE.md` for detailed instructions and troubleshooting.

## Tech Stack

- **React 18** (Create React App foundation)
- **Recharts** - All chart rendering
- **craco** - Webpack configuration overrides
- **xlsx** - Excel parsing in data pipeline
- **Inter Tight font** (Google Fonts) - Typography
