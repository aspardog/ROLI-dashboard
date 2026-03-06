import { useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { TS_COLORS } from './constants';
import { prepareSVGClone, embedFonts, addWhiteBackground, downloadSVG as downloadSVGHelper, createLegendItem } from './svgExportHelpers';
import ChartCard from './components/ChartCard';

function TimeSeriesChart({ allData, country, variable, label, selectedRegion, regionLabel, showRegionalAvg = false, showGlobalAvg = false }) {
  const chartRef = useRef(null);

  // Calculate regional average series
  const regionalAvgSeries = useMemo(() => {
    if (!showRegionalAvg || selectedRegion === 'global') return {};
    const filtered = allData.filter(d => {
      if (d.region !== selectedRegion) return false;
      return d[variable] != null && parseInt(d.year) >= 2019;
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
  }, [allData, variable, selectedRegion, showRegionalAvg]);

  // Calculate global average series
  const globalAvgSeries = useMemo(() => {
    if (!showGlobalAvg) return {};
    const filtered = allData.filter(d => d[variable] != null && parseInt(d.year) >= 2019);
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
        return d[variable] != null && parseInt(d.year) >= 2019;
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
      .filter(d => d.country === country && d[variable] != null && parseInt(d.year) >= 2019)
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
  const hasReferences = (showRegionalAvg && selectedRegion !== 'global') || showGlobalAvg;

  if (series.length < 2) return null;

  // Fixed scale from 0 to 1
  const yMin = 0;
  const yMax = 1;
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  const title = country === '__regional_avg__' ? (selectedRegion === 'global' ? 'Global Average' : `${regionLabel} — Regional Average`) : country;

  async function downloadSVG() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;

    const legendHeight = hasReferences ? 40 : 0;
    const { clone, vbX, vbY, vbW, vbH, bbox } = prepareSVGClone(svg, legendHeight, 'top');
    await embedFonts(clone);
    addWhiteBackground(clone, vbX, vbY, vbW, vbH);

    // Add legend if showing reference lines
    if (hasReferences) {
      const legendY = bbox.y - legendHeight + 8;
      let xOffset = bbox.x + 10;

      // Country legend item
      const countryItems = createLegendItem(xOffset, legendY, TS_COLORS.line, country, 'line', {
        width: 24,
        height: 3,
        textOptions: { fontSize: 14, fontWeight: 600 }
      });
      countryItems.forEach(el => clone.appendChild(el));
      xOffset += 24 + 6 + country.length * 7 + 24;

      // Regional Average legend item
      if (showRegionalAvg && selectedRegion !== 'global') {
        const regionalItems = createLegendItem(xOffset, legendY, TS_COLORS.regionalAvg, 'Regional Average', 'line', {
          width: 24,
          height: 3,
          textOptions: { fontSize: 14, fontWeight: 500 }
        });
        regionalItems.forEach(el => clone.appendChild(el));
        xOffset += 24 + 6 + 120 + 24;
      }

      // Global Average legend item
      if (showGlobalAvg) {
        const globalItems = createLegendItem(xOffset, legendY, TS_COLORS.globalAvg, 'Global Average', 'line', {
          width: 24,
          height: 3,
          textOptions: { fontSize: 14, fontWeight: 500 }
        });
        globalItems.forEach(el => clone.appendChild(el));
      }
    }

    downloadSVGHelper(clone, `ROLI_${title}_${variable}.svg`);
  }

  return (
    <ChartCard
      title={`${title} — ${label}`}
      subtitle="2019–2025"
      onExport={downloadSVG}
    >
      {/* Legend for reference lines */}
      {hasReferences && (
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', paddingLeft: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '3px', backgroundColor: TS_COLORS.line, borderRadius: '2px' }} />
            <span style={{ fontSize: '13px', color: TS_COLORS.axis }}>{country}</span>
          </div>
          {showRegionalAvg && selectedRegion !== 'global' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '3px', backgroundColor: TS_COLORS.regionalAvg, borderRadius: '2px' }} />
              <span style={{ fontSize: '13px', color: TS_COLORS.axis }}>Regional Average</span>
            </div>
          )}
          {showGlobalAvg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '3px', backgroundColor: TS_COLORS.globalAvg, borderRadius: '2px' }} />
              <span style={{ fontSize: '13px', color: TS_COLORS.axis }}>Global Average</span>
            </div>
          )}
        </div>
      )}
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={500}>
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
                strokeWidth={2}
                dot={{ r: 3, fill: TS_COLORS.globalAvg, strokeWidth: 0 }}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="globalAvg"
                  content={({ x, y, value, index }) => {
                    if (value == null) return null;
                    const isFirst = index === 0;
                    const isLast = index === chartData.length - 1;
                    return (
                      <text
                        x={isFirst ? x + 6 : isLast ? x - 6 : x}
                        y={y + 20}
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
            {showRegionalAvg && selectedRegion !== 'global' && (
              <Line
                type="linear"
                dataKey="regionalAvg"
                stroke={TS_COLORS.regionalAvg}
                strokeWidth={2}
                dot={{ r: 3, fill: TS_COLORS.regionalAvg, strokeWidth: 0 }}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="regionalAvg"
                  content={({ x, y, value, index }) => {
                    if (value == null) return null;
                    const isFirst = index === 0;
                    const isLast = index === chartData.length - 1;
                    return (
                      <text
                        x={isFirst ? x + 6 : isLast ? x - 6 : x}
                        y={y + 20}
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
              strokeWidth={2.5}
              dot={{ r: 4, fill: TS_COLORS.line, strokeWidth: 0 }}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="value"
                content={({ x, y, value, index }) => {
                  const isFirst = index === 0;
                  const isLast  = index === chartData.length - 1;
                  return (
                    <text
                      x={isFirst ? x + 6 : isLast ? x - 6 : x}
                      y={y - 12}
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
  showGlobalAvg: PropTypes.bool
};

export default memo(TimeSeriesChart);
