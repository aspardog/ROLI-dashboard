# ROLI Dashboard – Data Visualization Tool

An interactive dashboard for the **World Justice Project Rule of Law Index (ROLI)**. Explore Top and Bottom Performers across all regions, factors, and 44 sub-factors with dynamic charts and SVG export.

## Features

- **Top & Bottom Performers** bar chart — adapts automatically when a region has fewer than 10 countries (no overlap)
- **Region selector** — Global + 7 WJP regions
- **Variable selector** — Overall Index, 8 factors, and 44 sub-factors grouped by factor
- **Regional average** reference line with in-chart label and legend
- **SVG export** — downloads the chart with legend included

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

Full details on the directory layout, data pipeline, column mapping, and craco configuration are in [Documentation.md](Documentation.md).
