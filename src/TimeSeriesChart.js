import { useMemo, useRef, useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { TS_COLORS } from './constants';
import { prepareSVGClone, embedFonts, downloadSVG as downloadSVGHelper, createLegendItem } from './svgExportHelpers';
import ChartCard from './components/ChartCard';

// Chart dimension configurations
const CHART_SIZES = {
  full: { width: '100%', height: 500, maxWidth: undefined },
  bipanel: { width: '100%', height: 400, maxWidth: '600px' }
};

function TimeSeriesChart({ allData, country, variable, label, selectedRegion, regionLabel, showRegionalAvg = false, showGlobalAvg = false, countryRegion = null }) {
  const chartRef = useRef(null);
  const [exportMode, setExportMode] = useState(null);

  // Use countryRegion (detected from data) when available, otherwise use selectedRegion
  const effectiveRegion = countryRegion || (selectedRegion !== 'global' ? selectedRegion : null);

  // Calculate regional average series
  const regionalAvgSeries = useMemo(() => {
    if (!showRegionalAvg || !effectiveRegion) return {};
    const filtered = allData.filter(d => {
      if (d.region !== effectiveRegion) return false;
      return d[variable] != null && parseInt(d.year) >= 2020;
    });
    const byYear = {};
    for (const d of filtered) {
      if (!byYear[d.year]) byYear[d.year] = [];
      byYear[d.year].push(d[variable]);
    }
    const result = {};
    for (const [year, vals] of Object.entries(byYear)) {
      result[year] = Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 1000) / 1000;
    }
    return result;
  }, [allData, variable, effectiveRegion, showRegionalAvg]);

  // Calculate global average series
  const globalAvgSeries = useMemo(() => {
    if (!showGlobalAvg) return {};
    const filtered = allData.filter(d => d[variable] != null && parseInt(d.year) >= 2020);
    const byYear = {};
    for (const d of filtered) {
      if (!byYear[d.year]) byYear[d.year] = [];
      byYear[d.year].push(d[variable]);
    }
    const result = {};
    for (const [year, vals] of Object.entries(byYear)) {
      result[year] = Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 1000) / 1000;
    }
    return result;
  }, [allData, variable, showGlobalAvg]);

  const series = useMemo(() => {
    if (country === '__regional_avg__') {
      const filtered = allData.filter(d => {
        if (selectedRegion !== 'global' && d.region !== selectedRegion) return false;
        return d[variable] != null && parseInt(d.year) >= 2020;
      });
      const byYear = {};
      for (const d of filtered) {
        if (!byYear[d.year]) byYear[d.year] = [];
        byYear[d.year].push(d[variable]);
      }
      return Object.entries(byYear)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, vals]) => ({ year, value: Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 1000) / 1000 }));
    }
    return allData
      .filter(d => d.country === country && d[variable] != null && parseInt(d.year) >= 2020)
      .sort((a, b) => a.year.localeCompare(b.year))
      .map(d => ({ year: d.year, value: d[variable] }));
  }, [allData, country, variable, selectedRegion]);

  // Combined data for chart (merges country data with averages)
  const chartData = useMemo(() => {
    return series.map(d => ({
      year: d.year,
      value: d.value,
      regionalAvg: regionalAvgSeries[d.year],
      globalAvg: globalAvgSeries[d.year]
    }));
  }, [series, regionalAvgSeries, globalAvgSeries]);

  // Check if we're showing reference lines
  const hasReferences = (showRegionalAvg && effectiveRegion) || showGlobalAvg;

  // Title must be calculated before early return for use in useCallback
  const title = country === '__regional_avg__' ? (selectedRegion === 'global' ? 'Global Average' : `${regionLabel} — Regional Average`) : country;

  // Actual SVG capture and download logic (must be before early return)
  const captureAndDownload = useCallback(async (format) => {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;

    const isBipanel = format === 'bipanel';
    const legendHeight = hasReferences ? 40 : 0;
    const { clone, bbox } = prepareSVGClone(svg, legendHeight, 'top', {});
    await embedFonts(clone);

    // Add legend if showing reference lines
    if (hasReferences) {
      const legendY = bbox.y - legendHeight + 8;
      let xOffset = bbox.x + 10;

      // Country legend item
      const countryItems = createLegendItem(xOffset, legendY, TS_COLORS.line, country, 'line', {
        width: 28,
        height: 5,
        textOptions: { fontSize: 14, fontWeight: 600 }
      });
      countryItems.forEach(el => clone.appendChild(el));
      xOffset += 28 + 6 + country.length * 7 + 24;

      // Regional Average legend item
      if (showRegionalAvg) {
        const regionalItems = createLegendItem(xOffset, legendY, TS_COLORS.regionalAvg, 'Regional Average', 'line', {
          width: 28,
          height: 5,
          textOptions: { fontSize: 14, fontWeight: 500 }
        });
        regionalItems.forEach(el => clone.appendChild(el));
        xOffset += 28 + 6 + 120 + 24;
      }

      // Global Average legend item
      if (showGlobalAvg) {
        const globalItems = createLegendItem(xOffset, legendY, TS_COLORS.globalAvg, 'Global Average', 'line', {
          width: 28,
          height: 5,
          textOptions: { fontSize: 14, fontWeight: 500 }
        });
        globalItems.forEach(el => clone.appendChild(el));
      }
    }

    const suffix = isBipanel ? '_bipanel' : '';
    downloadSVGHelper(clone, `ROLI_${title}_${variable}${suffix}.svg`);
  }, [hasReferences, country, showRegionalAvg, showGlobalAvg, title, variable]);

  // Download handler - transforms chart for bipanel, then captures
  const downloadSVG = useCallback(async (format = 'full') => {
    if (format === 'bipanel') {
      // Set to bipanel mode, wait for re-render, then capture
      setExportMode('bipanel');
      // Wait for React to re-render with new dimensions
      await new Promise(resolve => setTimeout(resolve, 100));
      await captureAndDownload(format);
      // Restore to full size
      setExportMode(null);
    } else {
      // Full size - capture directly
      await captureAndDownload(format);
    }
  }, [captureAndDownload]);

  if (series.length < 2) return null;

  // Fixed scale from 0 to 1
  const yMin = 0;
  const yMax = 1;
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <ChartCard
      title={`${title} — ${label}`}
      subtitle="2020–2025"
      onExport={downloadSVG}
    >
      {/* Legend for reference lines */}
      {hasReferences && (
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', paddingLeft: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '5px', backgroundColor: TS_COLORS.line, borderRadius: '3px' }} />
            <span style={{ fontSize: '13px', color: TS_COLORS.axis }}>{country}</span>
          </div>
          {showRegionalAvg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '5px', backgroundColor: TS_COLORS.regionalAvg, borderRadius: '3px' }} />
              <span style={{ fontSize: '13px', color: TS_COLORS.axis }}>Regional Average</span>
            </div>
          )}
          {showGlobalAvg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '5px', backgroundColor: TS_COLORS.globalAvg, borderRadius: '3px' }} />
              <span style={{ fontSize: '13px', color: TS_COLORS.axis }}>Global Average</span>
            </div>
          )}
        </div>
      )}
      <div ref={chartRef} style={{ maxWidth: exportMode ? CHART_SIZES[exportMode].maxWidth : CHART_SIZES.full.maxWidth }}>
        <ResponsiveContainer width="100%" height={exportMode ? CHART_SIZES[exportMode].height : CHART_SIZES.full.height}>
          <LineChart data={chartData} margin={{ top: 24, right: 32, left: 16, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={TS_COLORS.grid} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 13, fill: TS_COLORS.axis, fontWeight: 500 }}
              axisLine={{ stroke: TS_COLORS.grid, strokeWidth: 1 }}
              tickLine={{ stroke: TS_COLORS.axis, strokeWidth: 1 }}
              interval={0}
              padding={{ left: 20, right: 0 }}
            />
            <YAxis
              domain={[yMin, yMax]}
              ticks={yTicks}
              tickFormatter={(v) => v.toFixed(2)}
              tick={{ fontSize: 13, fill: TS_COLORS.axis }}
              axisLine={{ stroke: TS_COLORS.grid, strokeWidth: 1 }}
              tickLine={false}
            />
            {/* Global Average line (behind) */}
            {showGlobalAvg && (
              <Line
                type="linear"
                dataKey="globalAvg"
                stroke={TS_COLORS.globalAvg}
                strokeWidth={3.5}
                dot={{ r: 5, fill: TS_COLORS.globalAvg, strokeWidth: 0 }}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="globalAvg"
                  content={({ x, y, value, index }) => {
                    if (value == null) return null;
                    const isFirst = index === 0;
                    const isLast = index === chartData.length - 1;
                    const dataPoint = chartData[index];
                    const mainValue = dataPoint.value;
                    const regionalValue = dataPoint.regionalAvg;

                    // Check proximity to main value and regional value
                    const closeToMain = Math.abs(value - mainValue) < 0.06;
                    const closeToRegional = showRegionalAvg && regionalValue != null && Math.abs(value - regionalValue) < 0.04;

                    // Position: if close to main, go further down; if regional is between, go even further
                    let yOffset = 22;
                    if (closeToMain) yOffset = 38;
                    if (closeToRegional && regionalValue > value) yOffset = 52;

                    return (
                      <text
                        x={isFirst ? x + 6 : isLast ? x - 6 : x}
                        y={y + yOffset}
                        textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                        fontSize={13}
                        fontWeight={500}
                        fill={TS_COLORS.globalAvg}
                      >{Number(value).toFixed(2)}</text>
                    );
                  }}
                />
              </Line>
            )}
            {/* Regional Average line (middle) */}
            {showRegionalAvg && (
              <Line
                type="linear"
                dataKey="regionalAvg"
                stroke={TS_COLORS.regionalAvg}
                strokeWidth={3.5}
                dot={{ r: 5, fill: TS_COLORS.regionalAvg, strokeWidth: 0 }}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="regionalAvg"
                  content={({ x, y, value, index }) => {
                    if (value == null) return null;
                    const isFirst = index === 0;
                    const isLast = index === chartData.length - 1;
                    const dataPoint = chartData[index];
                    const mainValue = dataPoint.value;
                    const globalValue = dataPoint.globalAvg;

                    // Check proximity to main value
                    const closeToMain = Math.abs(value - mainValue) < 0.06;
                    const closeToGlobal = showGlobalAvg && globalValue != null && Math.abs(value - globalValue) < 0.04;

                    // Position: if close to main, go further down
                    let yOffset = 22;
                    if (closeToMain) yOffset = 38;
                    // If also close to global and global is below, stack even further
                    if (closeToGlobal && globalValue < value) yOffset = 52;

                    return (
                      <text
                        x={isFirst ? x + 6 : isLast ? x - 6 : x}
                        y={y + yOffset}
                        textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                        fontSize={13}
                        fontWeight={500}
                        fill={TS_COLORS.regionalAvg}
                      >{Number(value).toFixed(2)}</text>
                    );
                  }}
                />
              </Line>
            )}
            {/* Main country line (front) */}
            <Line
              type="linear"
              dataKey="value"
              stroke={TS_COLORS.line}
              strokeWidth={4}
              dot={{ r: 6, fill: TS_COLORS.line, strokeWidth: 0 }}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="value"
                content={({ x, y, value, index }) => {
                  const isFirst = index === 0;
                  const isLast  = index === chartData.length - 1;
                  const dataPoint = chartData[index];
                  const globalValue = dataPoint.globalAvg;
                  const regionalValue = dataPoint.regionalAvg;

                  // Check if any reference line is very close and ABOVE the main value
                  const globalAboveAndClose = showGlobalAvg && globalValue != null && globalValue > value && Math.abs(value - globalValue) < 0.06;
                  const regionalAboveAndClose = showRegionalAvg && regionalValue != null && regionalValue > value && Math.abs(value - regionalValue) < 0.06;

                  // If reference line is above and close, move main label further up
                  let yOffset = -14;
                  if (globalAboveAndClose || regionalAboveAndClose) yOffset = -28;

                  return (
                    <text
                      x={isFirst ? x + 6 : isLast ? x - 6 : x}
                      y={y + yOffset}
                      textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                      fontSize={16}
                      fontWeight={700}
                      fill={TS_COLORS.line}
                    >{Number(value).toFixed(2)}</text>
                  );
                }}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

TimeSeriesChart.propTypes = {
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  country: PropTypes.string.isRequired,
  variable: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selectedRegion: PropTypes.string.isRequired,
  regionLabel: PropTypes.string.isRequired,
  showRegionalAvg: PropTypes.bool,
  showGlobalAvg: PropTypes.bool,
  countryRegion: PropTypes.string
};

export default memo(TimeSeriesChart);
