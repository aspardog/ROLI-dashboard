import { useMemo, useRef, useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { TS_COLORS } from '../config';
import { prepareSVGClone, embedFonts, downloadSVG as downloadSVGHelper, createLegendItem, getAverageProfile } from '../utils';
import { ChartCard } from '../components';

const CHART_SIZES = {
  full: { width: '100%', height: 500, maxWidth: undefined },
  bipanel: { width: '100%', height: 400, maxWidth: '600px' }
};

const SERIES_COLORS = [
  TS_COLORS.line,
  '#BF02AF',
  '#3366FF',
  '#FF4D6A',
  '#FFB52B',
  '#34C759',
  '#FF9500',
];

function getEntityLabel(entity) {
  if (entity === '__region_global') return 'Global Average';
  if (entity.startsWith('__region_')) return `${entity.replace('__region_', '')} Average`;
  return entity;
}

function TimeSeriesChart({ allData, averages, selectedEntities = [], variable, label, selectedRegion = 'global', regionLabel = 'Global', showRegionalAvg = false, showGlobalAvg = false, yearRange = [2015, 2025] }) {
  const chartRef = useRef(null);
  const [exportMode, setExportMode] = useState(null);

  const regionalAvgSeries = useMemo(() => {
    if (!showRegionalAvg || selectedRegion === 'global') return {};
    const [startYear, endYear] = yearRange;
    const result = {};

    for (let year = startYear; year <= endYear; year += 1) {
      const profile = getAverageProfile(averages, selectedRegion, String(year));
      if (profile?.[variable] != null) {
        result[String(year)] = profile[variable];
      }
    }

    return result;
  }, [averages, selectedRegion, showRegionalAvg, variable, yearRange]);

  const globalAvgSeries = useMemo(() => {
    if (!showGlobalAvg) return {};
    const [startYear, endYear] = yearRange;
    const result = {};

    for (let year = startYear; year <= endYear; year += 1) {
      const profile = getAverageProfile(averages, 'global', String(year));
      if (profile?.[variable] != null) {
        result[String(year)] = profile[variable];
      }
    }

    return result;
  }, [averages, showGlobalAvg, variable, yearRange]);

  const entitySeries = useMemo(() => {
    const [startYear, endYear] = yearRange;

    return selectedEntities.map(entity => {
      const points = [];

      for (let year = startYear; year <= endYear; year += 1) {
        const yearKey = String(year);
        let value = null;

        if (entity.startsWith('__region_')) {
          const regionName = entity.replace('__region_', '');
          value = getAverageProfile(averages, regionName, yearKey)?.[variable] ?? null;
        } else {
          const entry = allData.find(d => d.year === yearKey && d.country === entity);
          value = entry?.[variable] ?? null;
        }

        if (value != null) {
          points.push({ year: yearKey, value });
        }
      }

      return {
        key: entity,
        label: getEntityLabel(entity),
        points,
      };
    }).filter(series => series.points.length >= 2);
  }, [allData, averages, selectedEntities, variable, yearRange]);

  const chartData = useMemo(() => {
    const [startYear, endYear] = yearRange;
    const rows = [];

    for (let year = startYear; year <= endYear; year += 1) {
      const row = { year: String(year) };
      entitySeries.forEach(series => {
        const point = series.points.find(item => item.year === row.year);
        row[series.key] = point?.value ?? null;
      });
      row.regionalAvg = regionalAvgSeries[row.year] ?? null;
      row.globalAvg = globalAvgSeries[row.year] ?? null;
      rows.push(row);
    }

    return rows;
  }, [entitySeries, yearRange, regionalAvgSeries, globalAvgSeries]);

  const chartSubtitle = entitySeries.length === 1
    ? `${entitySeries[0].label} ${yearRange[0]}–${yearRange[1]}`
    : `Comparing ${entitySeries.length} categories, ${yearRange[0]}–${yearRange[1]}`;

  const captureAndDownload = useCallback(async (format) => {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;

    const isBipanel = format === 'bipanel';
    const legendHeight = entitySeries.length > 0 ? 80 : 0;
    const { clone, bbox } = prepareSVGClone(svg, legendHeight, 'top', {});
    await embedFonts(clone);

    if (entitySeries.length > 0) {
      const legendY = bbox.y - legendHeight + 10;
      let xOffset = bbox.x + 10;

      entitySeries.forEach((series, index) => {
        const labelText = series.label.length > 28 ? `${series.label.slice(0, 25)}...` : series.label;
        const items = createLegendItem(xOffset, legendY, SERIES_COLORS[index % SERIES_COLORS.length], labelText, 'line', {
          width: 28,
          height: 5,
          textOptions: { fontSize: 13, fontWeight: 500 }
        });
        items.forEach(el => clone.appendChild(el));
        xOffset += 28 + 6 + labelText.length * 7 + 24;
      });

      if (showRegionalAvg && selectedRegion !== 'global') {
        const items = createLegendItem(xOffset, legendY, TS_COLORS.regionalAvg, `${regionLabel} Average`, 'line', {
          width: 28,
          height: 5,
          textOptions: { fontSize: 13, fontWeight: 500 }
        });
        items.forEach(el => clone.appendChild(el));
        xOffset += 28 + 6 + `${regionLabel} Average`.length * 7 + 24;
      }

      if (showGlobalAvg) {
        const items = createLegendItem(xOffset, legendY, TS_COLORS.globalAvg, 'Global Average', 'line', {
          width: 28,
          height: 5,
          textOptions: { fontSize: 13, fontWeight: 500 }
        });
        items.forEach(el => clone.appendChild(el));
      }
    }

    const suffix = isBipanel ? '_bipanel' : '';
    const fileLabel = entitySeries.length === 1 ? entitySeries[0].label.replace(/\s+/g, '_') : `comparison_${entitySeries.length}_entities`;
    downloadSVGHelper(clone, `ROLI_${fileLabel}_${variable}${suffix}.svg`);
  }, [entitySeries, variable, regionLabel, selectedRegion, showGlobalAvg, showRegionalAvg]);

  const downloadSVG = useCallback(async (format = 'full') => {
    if (format === 'bipanel') {
      setExportMode('bipanel');
      await new Promise(resolve => setTimeout(resolve, 100));
      await captureAndDownload(format);
      setExportMode(null);
    } else {
      await captureAndDownload(format);
    }
  }, [captureAndDownload]);

  if (entitySeries.length === 0) return null;

  return (
    <ChartCard
      title={label}
      subtitle={chartSubtitle}
      onExport={downloadSVG}
    >
      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', paddingLeft: '16px', flexWrap: 'wrap' }}>
        {entitySeries.map((series, index) => (
          <div key={series.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '5px', backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length], borderRadius: '3px' }} />
            <span style={{ fontSize: '13px', color: TS_COLORS.axis }}>{series.label}</span>
          </div>
        ))}
        {showRegionalAvg && selectedRegion !== 'global' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '5px', backgroundColor: TS_COLORS.regionalAvg, borderRadius: '3px' }} />
            <span style={{ fontSize: '13px', color: TS_COLORS.axis }}>{regionLabel} Average</span>
          </div>
        )}
        {showGlobalAvg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '5px', backgroundColor: TS_COLORS.globalAvg, borderRadius: '3px' }} />
            <span style={{ fontSize: '13px', color: TS_COLORS.axis }}>Global Average</span>
          </div>
        )}
      </div>
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
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              tickFormatter={(v) => v.toFixed(2)}
              tick={{ fontSize: 13, fill: TS_COLORS.axis }}
              axisLine={{ stroke: TS_COLORS.grid, strokeWidth: 1 }}
              tickLine={false}
            />
            {showGlobalAvg && (
              <Line
                type="linear"
                dataKey="globalAvg"
                stroke={TS_COLORS.globalAvg}
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ r: 0 }}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}
            {showRegionalAvg && selectedRegion !== 'global' && (
              <Line
                type="linear"
                dataKey="regionalAvg"
                stroke={TS_COLORS.regionalAvg}
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ r: 0 }}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}
            {entitySeries.map((series, index) => (
              <Line
                key={series.key}
                type="linear"
                dataKey={series.key}
                stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeWidth={index === 0 ? 3.5 : 3}
                dot={{ r: 4, fill: SERIES_COLORS[index % SERIES_COLORS.length], strokeWidth: 0 }}
                isAnimationActive={false}
                connectNulls={false}
              >
                <LabelList
                  dataKey={series.key}
                  content={({ x, y, value, index: pointIndex }) => {
                    if (value == null || pointIndex !== chartData.length - 1) return null;
                    return (
                      <text
                        x={x + 8}
                        y={y}
                        textAnchor="start"
                        fontSize={12}
                        fontWeight={600}
                        fill={SERIES_COLORS[index % SERIES_COLORS.length]}
                      >
                        {Number(value).toFixed(2)}
                      </text>
                    );
                  }}
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

TimeSeriesChart.propTypes = {
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  averages: PropTypes.shape({
    global: PropTypes.object,
    regions: PropTypes.object,
  }),
  selectedEntities: PropTypes.arrayOf(PropTypes.string),
  variable: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selectedRegion: PropTypes.string,
  regionLabel: PropTypes.string,
  showRegionalAvg: PropTypes.bool,
  showGlobalAvg: PropTypes.bool,
  yearRange: PropTypes.arrayOf(PropTypes.number),
};

export default memo(TimeSeriesChart);
