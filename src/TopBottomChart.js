import { useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts';
import { COLORS } from './constants';
import { prepareSVGClone, embedFonts, addWhiteBackground, createLegendItem, downloadSVG as downloadSVGHelper } from './svgExportHelpers';
import ChartCard from './components/ChartCard';

function TopBottomChart({ allData, selectedRegion, selectedYear, variable, label, regionLabel }) {
  const data = useMemo(() => {
    const byYear = allData.filter(d => d.year === selectedYear);
    return selectedRegion === 'global' ? byYear : byYear.filter(d => d.region === selectedRegion);
  }, [allData, selectedRegion, selectedYear]);

  const { chartData, splitCount } = useMemo(() => {
    const validData = data.filter(item => item[variable] !== undefined && item[variable] !== null);
    const sorted = [...validData].sort((a, b) => b[variable] - a[variable]);
    const n = Math.min(5, Math.floor(validData.length / 2));
    const top = sorted.slice(0, n).map((item, i) => ({ ...item, group: 'top5', value: item[variable], displayCountry: item.country, id: `top_${i}` }));
    const bottom = n > 0 ? sorted.slice(-n).map((item, i) => ({ ...item, group: 'bottom5', value: item[variable], displayCountry: item.country, id: `bot_${i}` })) : [];
    return { chartData: [...top, { displayCountry: '__sep__', value: 0, isSeparator: true, id: '__sep__' }, ...bottom], splitCount: n };
  }, [data, variable]);

  const average = useMemo(() => {
    const valid = data.filter(d => d[variable] != null);
    if (valid.length === 0) return null;
    return valid.reduce((sum, d) => sum + d[variable], 0) / valid.length;
  }, [data, variable]);

  const chartRef = useRef(null);

  async function downloadSVG() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;

    const { clone, vbX, vbY, vbW, vbH } = prepareSVGClone(svg, 60, 'top');
    await embedFonts(clone);
    addWhiteBackground(clone, vbX, vbY, vbW, vbH);

    // Add legend items
    const lx = vbX + 24;
    const ly = vbY + 20;
    const boxSize = 18;

    const legendItems = createLegendItem(lx, ly, COLORS.top5, `Top ${splitCount}`, 'box', { size: boxSize });
    legendItems.forEach(el => clone.appendChild(el));

    const legendItems2 = createLegendItem(lx + 110, ly, COLORS.bottom5, `Bottom ${splitCount}`, 'box', { size: boxSize });
    legendItems2.forEach(el => clone.appendChild(el));

    if (average !== null) {
      const avgItems = createLegendItem(lx + 260, ly, COLORS.muted, `${regionLabel} Avg: ${average.toFixed(2)}`, 'dashed-line', { width: 30, size: boxSize });
      avgItems.forEach(el => clone.appendChild(el));
    }

    downloadSVGHelper(clone, `ROLI_${regionLabel}_${variable}_${selectedYear}.svg`);
  }

  return (
    <ChartCard
      title={`Top and Bottom Performers in ${label}`}
      subtitle={regionLabel}
      onExport={downloadSVG}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px', width: '140px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', backgroundColor: COLORS.top5, borderRadius: '3px' }} />
            <span style={{ fontSize: '15px', color: COLORS.muted, fontWeight: '500' }}>Top {splitCount}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', backgroundColor: COLORS.bottom5, borderRadius: '3px' }} />
            <span style={{ fontSize: '15px', color: COLORS.muted, fontWeight: '500' }}>Bottom {splitCount}</span>
          </div>
          {average !== null && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '20px', height: '2px', flexShrink: 0, marginTop: '7px', backgroundImage: `repeating-linear-gradient(to right, ${COLORS.muted} 0, ${COLORS.muted} 4px, transparent 4px, transparent 8px)` }} />
              <span style={{ fontSize: '15px', color: COLORS.muted, fontWeight: '500' }}>{regionLabel}<br/>Avg: {average.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div ref={chartRef} className="bar-chart-container" style={{ flex: 1, height: '600px', maxWidth: '840px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 60, left: 10, bottom: 10 }}
            customized={({ xAxisMap, yAxisMap }) => {
              if (average === null || !xAxisMap || !yAxisMap) return null;
              const xAxis = Object.values(xAxisMap)[0];
              const yAxis = Object.values(yAxisMap)[0];
              if (!xAxis?.scale || !yAxis?.scale) return null;
              const xPx = xAxis.scale(average);
              const sepY = yAxis.scale('__sep__');
              return <text x={xPx + 8} y={sepY - 8} fill={COLORS.muted} fontSize={12} fontWeight={600}>Avg: {average.toFixed(2)}</text>;
            }}>
            <XAxis type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v) => v.toFixed(2)} tick={{ fontSize: 12, fill: COLORS.muted }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
            <YAxis type="category" dataKey="id" tick={({ x, y, payload }) => {
              if (payload.value === '__sep__') return null;
              const item = chartData.find(d => d.id === payload.value);
              // Split long names at word boundaries so they don't crush the bars
              const words = (item?.displayCountry || '').split(' ');
              const lines = [];
              let current = '';
              for (const word of words) {
                if (current && (current + ' ' + word).length > 18) { lines.push(current); current = word; }
                else { current = current ? current + ' ' + word : word; }
              }
              if (current) lines.push(current);
              const lineH  = 16;
              const startDy = 4 - ((lines.length - 1) * lineH) / 2; // keep vertical centre on tick
              return (
                <text x={x} y={y} textAnchor="end" fill={COLORS.text} fontSize={13} fontWeight={700}>
                  {lines.map((line, i) => <tspan key={i} x={x} dy={i === 0 ? startDy : lineH}>{line}</tspan>)}
                </text>
              );
            }} axisLine={false} tickLine={false} width={200} />
            <ReferenceLine y="__sep__" stroke={COLORS.divider} strokeWidth={2} />
            {average !== null && <ReferenceLine x={average} stroke={COLORS.muted} strokeWidth={1.5} strokeDasharray="5 3" />}
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={36}>
              {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.isSeparator ? 'transparent' : (entry.group === 'top5' ? COLORS.top5 : COLORS.bottom5)} />))}
              <LabelList dataKey="value" content={({ x, y, width, height, value, index }) => {
                if (chartData[index]?.isSeparator) return null;
                const color = chartData[index]?.group === 'top5' ? COLORS.top5 : COLORS.bottom5;
                const labelX = x + width + 10;
                const labelY = y + height / 2;
                const avgLinePx = average !== null && value > 0 ? x + (width / value) * average : null;
                const needsBg = avgLinePx !== null && Math.abs(avgLinePx - labelX) < 30;
                return (
                  <g>
                    {needsBg && <rect x={labelX - 2} y={labelY - 8} width={34} height={16} fill="white" />}
                    <text x={labelX} y={labelY} dominantBaseline="middle" style={{ fontSize: '13px', fontWeight: '600', fill: color }}>{value.toFixed(2)}</text>
                  </g>
                );
              }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
}

TopBottomChart.propTypes = {
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedRegion: PropTypes.string.isRequired,
  selectedYear: PropTypes.string.isRequired,
  variable: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  regionLabel: PropTypes.string.isRequired
};

export default memo(TopBottomChart);
