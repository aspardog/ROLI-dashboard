# ROLI Dashboard – Data Visualization Tool

An interactive dashboard for the **World Justice Project Rule of Law Index (ROLI)**. Explore Top and Bottom Performers across all regions, factors, and 44 sub-factors with dynamic charts and SVG export.

## Features

- **Four visualization types**:
  - **Top & Bottom Performers** — Dynamic bar chart that adapts when regions have fewer than 10 countries
  - **Time Series** — Line chart showing 2019-2025 trends with regional averages
  - **Radar Chart** — Multi-year, multi-factor overlay comparison
  - **Factor Comparison** — Multi-country comparison across all 8 factors
- **Built-in documentation**:
  - **"Learn about the Index"** — In-app modal explaining the Rule of Law Index structure, 8 factors, and 44 sub-factors
  - **"How to use this dashboard"** — Interactive guide to each visualization type
- **Region selector** — Global + 7 WJP regions
- **Variable selector** — Overall Index, 8 factors, and 44 sub-factors grouped by factor
- **Regional average** reference lines and calculations
- **SVG export** — All charts downloadable with embedded fonts and legends
- **Mobile responsive** — Optimized layouts for all screen sizes

## Getting Started

### Prerequisites

- Node.js 16+
- npm

### Install and run

```bash
npm install
npm start
# → http://localhost:3000
```

### Re-generate data from Excel

The dataset is parsed from the official WJP Historical Data Excel file. If you update the source file in `data/`, re-run the parser to regenerate the JSON:

```bash
npm run parse-data
```

This writes `roli_data.json` to both `data/` (canonical copy) and `public/` (served by the app).

## Collaboration Workflow

This project uses a two-branch workflow:
- **`main`** — Protected production branch, requires PR approval
- **`design`** — Designer's working branch for visual/UX changes

### For Santiago (Maintainer)

**After merging any PR to `main`:** Run the sync script to update the designer's branch:

```bash
./sync-design.sh
```

This ensures the designer always works with the latest code. See `SYNC_GUIDE.md` for details.

### For Designer

Always work on the `design` branch. See comprehensive guides:
- `START_HERE.md` — Quick setup guide
- `DESIGNER_README.md` — Designer role context for Claude Code
- `DESIGN_GUIDE.md` — Complete design workflow
- `DESIGN_FILES_REFERENCE.md` — File-by-file reference

## Tech Stack

| Technology | Role |
|---|---|
| React (Create React App) | UI framework |
| @craco/craco | Webpack overrides (root-level App.js) |
| Recharts | Bar chart and reference lines |
| xlsx | Excel → JSON parsing |

## Data Source

World Justice Project — [Rule of Law Index](https://worldjusticeproject.org/rule-law-index)

## Documentation

Full details on the directory layout, data pipeline, column mapping, and craco configuration are in [CLAUDE.md](CLAUDE.md).

The dashboard also includes **in-app documentation** accessible via two links in the header:
- **Learn about the Index** — Opens a modal with comprehensive information about the Rule of Law Index
- **How to use this dashboard** — Opens a guide explaining each of the four visualization types
