import { useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { TS_COLORS } from './constants';
import { prepareSVGClone, embedFonts, addWhiteBackground, downloadSVG as downloadSVGHelper } from './svgExportHelpers';
import ChartCard from './components/ChartCard';

function TimeSeriesChart({ allData, country, variable, label, selectedRegion, regionLabel }) {
  const chartRef = useRef(null);

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

  if (series.length < 2) return null;

  // Fixed scale from 0 to 1
  const yMin = 0;
  const yMax = 1;
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  const title = country === '__regional_avg__' ? (selectedRegion === 'global' ? 'Global Average' : `${regionLabel} — Regional Average`) : country;

  async function downloadSVG() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;

    const { clone, vbX, vbY, vbW, vbH } = prepareSVGClone(svg, 0, 'top');
    await embedFonts(clone);
    addWhiteBackground(clone, vbX, vbY, vbW, vbH);

    downloadSVGHelper(clone, `ROLI_${title}_${variable}.svg`);
  }

  return (
    <ChartCard
      title={`${title} — ${label}`}
      subtitle="2019–2025"
      onExport={downloadSVG}
    >
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={series} margin={{ top: 24, right: 32, left: 16, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={TS_COLORS.grid} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 13, fill: TS_COLORS.axis, fontWeight: 500 }}
              axisLine={{ stroke: TS_COLORS.grid, strokeWidth: 1 }}
              tickLine={{ stroke: TS_COLORS.axis, strokeWidth: 1 }}
              interval={0}
            />
            <YAxis
              domain={[yMin, yMax]}
              ticks={yTicks}
              tickFormatter={(v) => v.toFixed(2)}
              tick={{ fontSize: 13, fill: TS_COLORS.axis }}
              axisLine={{ stroke: TS_COLORS.grid, strokeWidth: 1 }}
              tickLine={false}
            />
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
                  const isLast  = index === series.length - 1;
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
  regionLabel: PropTypes.string.isRequired
};

export default memo(TimeSeriesChart);
