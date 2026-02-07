import { useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts';
import { COLORS } from './constants';
import { getEmbeddedFontCSS } from './svgExport';

export default function TopBottomChart({ allData, selectedRegion, selectedYear, variable, label, regionLabel }) {
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
    const bbox    = svg.getBBox();
    const pad     = 8;
    const legendH = 44;
    const vbX     = bbox.x  - pad;
    const vbY     = bbox.y  - pad;
    const vbW     = bbox.width  + pad * 2;
    const vbH     = bbox.height + pad * 2 + legendH;
    const clone   = svg.cloneNode(true);
    const ns      = 'http://www.w3.org/2000/svg';

    // Helper: create an SVG element with attributes
    const el = (tag, attrs) => {
      const e = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
      return e;
    };
    // Helper: create a text element with content
    const txt = (x, y, content) => {
      const t = el('text', { x, y, fill: COLORS.muted, 'font-size': 13, 'font-weight': 500, 'font-family': "'Inter Tight', sans-serif" });
      t.textContent = content;
      return t;
    };

    clone.setAttribute('width', vbW);
    clone.setAttribute('height', vbH);
    clone.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    clone.setAttribute('xmlns', ns);

    // Embed Inter Tight font so the SVG is self-contained
    const fontCSS = await getEmbeddedFontCSS();
    const styleEl = document.createElementNS(ns, 'style');
    styleEl.textContent = fontCSS;
    clone.insertBefore(styleEl, clone.firstChild);

    // Recharts doesn't set font-family on <text> nodes; force it so the
    // embedded @font-face actually gets used.
    clone.querySelectorAll('text').forEach(t => {
      t.setAttribute('font-family', "'Inter Tight', sans-serif");
      t.style.fontFamily = "'Inter Tight', sans-serif";
    });

    // White background covering chart + legend
    clone.insertBefore(el('rect', { x: vbX, y: vbY, width: vbW, height: vbH, fill: 'white' }), clone.firstChild);

    // Legend strip — positioned just below the content bbox
    const lx = vbX + 24;
    const ly = bbox.y + bbox.height + pad + 15;
    const ty = bbox.y + bbox.height + pad + 27;

    clone.appendChild(el('rect',  { x: lx,      y: ly, width: 14, height: 14, fill: COLORS.top5,    rx: 3 }));
    clone.appendChild(txt(lx + 18,  ty, 'Top 5'));

    clone.appendChild(el('rect',  { x: lx + 83, y: ly, width: 14, height: 14, fill: COLORS.bottom5, rx: 3 }));
    clone.appendChild(txt(lx + 101, ty, 'Bottom 5'));

    // Average dashed-line legend entry (mirrors the dashboard sidebar)
    if (average !== null) {
      const avgLx = lx + 195;
      clone.appendChild(el('line', { x1: avgLx, y1: ly + 7, x2: avgLx + 22, y2: ly + 7, stroke: COLORS.muted, 'stroke-width': 1.5, 'stroke-dasharray': '5 3' }));
      clone.appendChild(txt(avgLx + 28, ty, `${regionLabel} Avg: ${average.toFixed(2)}`));
    }

    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ROLI_${regionLabel}_${variable}_${selectedYear}.svg`.replace(/\s+/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="chart-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>Top and Bottom Performers in {label}</h2>
      <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0 0 20px' }}>{regionLabel}</p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px', width: '140px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', backgroundColor: COLORS.top5, borderRadius: '3px' }} />
            <span style={{ fontSize: '13px', color: COLORS.muted, fontWeight: '500' }}>Top {splitCount}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', backgroundColor: COLORS.bottom5, borderRadius: '3px' }} />
            <span style={{ fontSize: '13px', color: COLORS.muted, fontWeight: '500' }}>Bottom {splitCount}</span>
          </div>
          {average !== null && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '20px', height: '2px', flexShrink: 0, marginTop: '7px', backgroundImage: `repeating-linear-gradient(to right, ${COLORS.muted} 0, ${COLORS.muted} 4px, transparent 4px, transparent 8px)` }} />
              <span style={{ fontSize: '13px', color: COLORS.muted, fontWeight: '500' }}>{regionLabel}<br/>Avg: {average.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div ref={chartRef} style={{ flex: 1, aspectRatio: '1.4', maxHeight: 'calc(100vh - 440px)', maxWidth: 'calc((100vh - 440px) * 1.4)' }}>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button onClick={downloadSVG} style={{ background: 'none', border: '1.5px solid #e5e5e5', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: COLORS.muted, cursor: 'pointer' }}>↓ Export SVG</button>
      </div>
    </div>
  );
}
