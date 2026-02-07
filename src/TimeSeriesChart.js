import { useMemo, useRef } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { COLORS, TS_COLORS } from './constants';
import { getEmbeddedFontCSS } from './svgExport';

export default function TimeSeriesChart({ allData, country, variable, label, selectedRegion, regionLabel }) {
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

  const values = series.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const yMin = Math.floor((min - 0.06) * 50) / 50;   // round down to nearest 0.02
  const yMax = Math.ceil((max + 0.06) * 50) / 50;     // round up to nearest 0.02
  const yTicks = [];
  for (let v = yMin; v <= yMax + 0.001; v += 0.02) {
    yTicks.push(Math.round(v * 100) / 100);
  }

  const title = country === '__regional_avg__' ? (selectedRegion === 'global' ? 'Global Average' : `${regionLabel} — Regional Average`) : country;

  async function downloadSVG() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;
    const bbox  = svg.getBBox();
    const pad   = 8;
    const vbX   = bbox.x  - pad;
    const vbY   = bbox.y  - pad;
    const vbW   = bbox.width  + pad * 2;
    const vbH   = bbox.height + pad * 2;
    const clone = svg.cloneNode(true);
    const ns    = 'http://www.w3.org/2000/svg';
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

    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('x', vbX); bg.setAttribute('y', vbY);
    bg.setAttribute('width', vbW); bg.setAttribute('height', vbH);
    bg.setAttribute('fill', 'white');
    clone.insertBefore(bg, clone.firstChild);

    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ROLI_${title}_${variable}.svg`.replace(/\s+/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="chart-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>{title} — {label}</h2>
      <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0 0 20px' }}>2019–2025</p>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button onClick={downloadSVG} style={{ background: 'none', border: '1.5px solid #e5e5e5', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: COLORS.muted, cursor: 'pointer' }}>↓ Export SVG</button>
      </div>
    </div>
  );
}
