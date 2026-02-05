import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList, ReferenceLine, LineChart, Line, CartesianGrid } from 'recharts';

const ACTIVE_YEAR = '2025';

const REGION_OPTIONS = [
  { value: 'global',                          label: 'Global' },
  { value: 'East Asia and Pacific',           label: 'East Asia and Pacific' },
  { value: 'Eastern Europe and Central Asia', label: 'Eastern Europe and Central Asia' },
  { value: 'EU, EFTA, and North America',     label: 'EU, EFTA, and North America' },
  { value: 'Latin America and Caribbean',     label: 'Latin America and Caribbean' },
  { value: 'Middle East and North Africa',    label: 'Middle East and North Africa' },
  { value: 'South Asia',                      label: 'South Asia' },
  { value: 'Sub-Saharan Africa',              label: 'Sub-Saharan Africa' },
];


const VARIABLE_OPTIONS = [
  { value: 'roli', label: 'ROLI - Overall Index', category: 'general' },

  { value: 'f1', label: 'F1 - Constraints on Government Power', category: 'factor' },
  { value: 'f2', label: 'F2 - Absence of Corruption',          category: 'factor' },
  { value: 'f3', label: 'F3 - Open Government',                category: 'factor' },
  { value: 'f4', label: 'F4 - Fundamental Rights',             category: 'factor' },
  { value: 'f5', label: 'F5 - Order and Security',             category: 'factor' },
  { value: 'f6', label: 'F6 - Regulatory Compliance',          category: 'factor' },
  { value: 'f7', label: 'F7 - Civil Justice',                  category: 'factor' },
  { value: 'f8', label: 'F8 - Criminal Justice',               category: 'factor' },

  { value: 'sf11', label: '1.1 - Limited by the legislature',                      category: 'sf1' },
  { value: 'sf12', label: '1.2 - Limited by the judiciary',                        category: 'sf1' },
  { value: 'sf13', label: '1.3 - Limited by independent auditing and review',      category: 'sf1' },
  { value: 'sf14', label: '1.4 - Officials sanctioned for misconduct',             category: 'sf1' },
  { value: 'sf15', label: '1.5 - Subject to non-governmental checks',              category: 'sf1' },
  { value: 'sf16', label: '1.6 - Transition of power subject to the law',          category: 'sf1' },

  { value: 'sf21', label: '2.1 - No private gain (Executive)',                     category: 'sf2' },
  { value: 'sf22', label: '2.2 - No private gain (Judicial)',                      category: 'sf2' },
  { value: 'sf23', label: '2.3 - No private gain (Police & Military)',             category: 'sf2' },
  { value: 'sf24', label: '2.4 - No private gain (Legislative)',                   category: 'sf2' },

  { value: 'sf31', label: '3.1 - Publicized laws and government data',             category: 'sf3' },
  { value: 'sf32', label: '3.2 - Right to information',                            category: 'sf3' },
  { value: 'sf33', label: '3.3 - Civic participation',                             category: 'sf3' },
  { value: 'sf34', label: '3.4 - Complaint mechanisms',                            category: 'sf3' },

  { value: 'sf41', label: '4.1 - Equal treatment and non-discrimination',          category: 'sf4' },
  { value: 'sf42', label: '4.2 - Right to life and security',                      category: 'sf4' },
  { value: 'sf43', label: '4.3 - Due process and rights of the accused',           category: 'sf4' },
  { value: 'sf44', label: '4.4 - Freedom of opinion and expression',               category: 'sf4' },
  { value: 'sf45', label: '4.5 - Freedom of belief and religion',                  category: 'sf4' },
  { value: 'sf46', label: '4.6 - Freedom from interference with privacy',          category: 'sf4' },
  { value: 'sf47', label: '4.7 - Freedom of assembly and association',             category: 'sf4' },
  { value: 'sf48', label: '4.8 - Fundamental labor rights',                        category: 'sf4' },

  { value: 'sf51', label: '5.1 - Crime is effectively controlled',                 category: 'sf5' },
  { value: 'sf52', label: '5.2 - Civil conflict is effectively limited',           category: 'sf5' },
  { value: 'sf53', label: '5.3 - No violence to redress personal grievances',      category: 'sf5' },

  { value: 'sf61', label: '6.1 - Regulations are effectively enforced',            category: 'sf6' },
  { value: 'sf62', label: '6.2 - Enforced without improper influence',             category: 'sf6' },
  { value: 'sf63', label: '6.3 - No unreasonable delay in proceedings',            category: 'sf6' },
  { value: 'sf64', label: '6.4 - Due process in administrative proceedings',       category: 'sf6' },
  { value: 'sf65', label: '6.5 - No expropriation without lawful process',         category: 'sf6' },

  { value: 'sf71', label: '7.1 - Access and affordability',                        category: 'sf7' },
  { value: 'sf72', label: '7.2 - Free of discrimination',                          category: 'sf7' },
  { value: 'sf73', label: '7.3 - Free of corruption',                              category: 'sf7' },
  { value: 'sf74', label: '7.4 - Free of improper government influence',           category: 'sf7' },
  { value: 'sf75', label: '7.5 - Not subject to unreasonable delay',               category: 'sf7' },
  { value: 'sf76', label: '7.6 - Effectively enforced',                            category: 'sf7' },
  { value: 'sf77', label: '7.7 - Accessible alternative dispute resolution',       category: 'sf7' },

  { value: 'sf81', label: '8.1 - Investigation system is effective',               category: 'sf8' },
  { value: 'sf82', label: '8.2 - Adjudication is timely and effective',            category: 'sf8' },
  { value: 'sf83', label: '8.3 - Correctional system reduces criminal behavior',   category: 'sf8' },
  { value: 'sf84', label: '8.4 - Criminal system is impartial',                    category: 'sf8' },
  { value: 'sf85', label: '8.5 - Free of corruption',                              category: 'sf8' },
  { value: 'sf86', label: '8.6 - Free of improper government influence',           category: 'sf8' },
  { value: 'sf87', label: '8.7 - Due process and rights of the accused',           category: 'sf8' },
];

const SUBFACTOR_GROUPS = [
  { label: 'F1 - Constraints on Government Power', category: 'sf1' },
  { label: 'F2 - Absence of Corruption',           category: 'sf2' },
  { label: 'F3 - Open Government',                 category: 'sf3' },
  { label: 'F4 - Fundamental Rights',              category: 'sf4' },
  { label: 'F5 - Order and Security',              category: 'sf5' },
  { label: 'F6 - Regulatory Compliance',           category: 'sf6' },
  { label: 'F7 - Civil Justice',                   category: 'sf7' },
  { label: 'F8 - Criminal Justice',                category: 'sf8' },
];

const COLORS = {
  top5: '#003B88',
  bottom5: '#fa4d57',
  background: '#f8f7f4',
  text: '#1a1a1a',
  muted: '#6b6b6b',
  divider: '#333333',
};

// Top/Bottom 5 chart component
function TopBottomChart({ data, variable, label, regionLabel }) {
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
    const clone = svg.cloneNode(true);
    const { width, height } = svg.getBoundingClientRect();
    const legendH = 44;
    const ns = 'http://www.w3.org/2000/svg';

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

    clone.setAttribute('width', width);
    clone.setAttribute('height', height + legendH);
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
    clone.insertBefore(el('rect', { x: 0, y: 0, width, height: height + legendH, fill: 'white' }), clone.firstChild);

    // Legend strip
    const ly = height + 15; // top of swatches
    const ty = height + 27; // text baseline

    clone.appendChild(el('rect',  { x: 24,  y: ly, width: 14, height: 14, fill: COLORS.top5,    rx: 3 }));
    clone.appendChild(txt(42,  ty, 'Top 5'));

    clone.appendChild(el('rect',  { x: 107, y: ly, width: 14, height: 14, fill: COLORS.bottom5, rx: 3 }));
    clone.appendChild(txt(125, ty, 'Bottom 5'));

    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ROLI_${regionLabel}_${variable}.svg`.replace(/\s+/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
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
        <div ref={chartRef} style={{ flex: 1, height: '520px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 60, left: 10, bottom: 10 }}
            customized={({ xAxisMap, yAxisMap, height, top, bottom }) => {
              if (average === null || !xAxisMap || !yAxisMap) return null;
              const xAxis = Object.values(xAxisMap)[0];
              const yAxis = Object.values(yAxisMap)[0];
              if (!xAxis?.scale || !yAxis?.scale) return null;
              const xPx = xAxis.scale(average);
              const sepY = yAxis.scale('__sep__');
              return <text x={xPx + 8} y={sepY - 8} fill={COLORS.muted} fontSize={12} fontWeight={600}>Avg: {average.toFixed(2)}</text>;
            }}>
            <XAxis type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tick={{ fontSize: 12, fill: COLORS.muted }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
            <YAxis type="category" dataKey="id" tick={({ x, y, payload }) => {
              if (payload.value === '__sep__') return null;
              const item = chartData.find(d => d.id === payload.value);
              return <text x={x} y={y} dy={4} textAnchor="end" fill={item?.group === 'top5' ? COLORS.top5 : COLORS.bottom5} fontSize={13} fontWeight={600}>{item?.displayCountry}</text>;
            }} axisLine={false} tickLine={false} width={200} />
            <ReferenceLine y="__sep__" stroke={COLORS.divider} strokeWidth={2} />
            {average !== null && <ReferenceLine x={average} stroke={COLORS.muted} strokeWidth={1.5} strokeDasharray="5 3" />}
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={36}>
              {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.isSeparator ? 'transparent' : (entry.group === 'top5' ? COLORS.top5 : COLORS.bottom5)} />))}
              <LabelList dataKey="value" content={({ x, y, width, height, value, index }) => {
                if (chartData[index]?.isSeparator) return null;
                const labelX = x + width + 10;
                const labelY = y + height / 2;
                const avgLinePx = average !== null && value > 0 ? x + (width / value) * average : null;
                const needsBg = avgLinePx !== null && Math.abs(avgLinePx - labelX) < 30;
                return (
                  <g>
                    {needsBg && <rect x={labelX - 2} y={labelY - 8} width={34} height={16} fill="white" />}
                    <text x={labelX} y={labelY} dominantBaseline="middle" style={{ fontSize: '13px', fontWeight: '600', fill: COLORS.text }}>{value.toFixed(2)}</text>
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


const TS_COLORS = { line: '#181878', axis: '#514e4b', grid: '#BDBDBD' };

// Fetches Inter Tight from Google Fonts, converts every font URL to a
// base64 data URI, and caches the resulting @font-face CSS so that
// exported SVGs are fully self-contained.
let _fontCSSCache = null;
async function getEmbeddedFontCSS() {
  if (_fontCSSCache) return _fontCSSCache;
  const res  = await fetch('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&display=swap');
  let css    = await res.text();
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1]);
  for (const fontUrl of urls) {
    const fontRes  = await fetch(fontUrl);
    const blob     = await fontRes.blob();
    const dataUrl  = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    css = css.replace(fontUrl, dataUrl);
  }
  _fontCSSCache = css;
  return css;
}

function TimeSeriesChart({ allData, country, variable, label, selectedRegion, regionLabel }) {
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

  const chartRef = useRef(null);

  async function downloadSVG() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;
    const clone = svg.cloneNode(true);
    const { width, height } = svg.getBoundingClientRect();
    const ns = 'http://www.w3.org/2000/svg';
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);
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
    bg.setAttribute('x', 0); bg.setAttribute('y', 0);
    bg.setAttribute('width', width); bg.setAttribute('height', height);
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
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>{title} — {label}</h2>
      <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0 0 20px' }}>2019–2025</p>
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={340}>
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
                      fontSize={13}
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

export default function ROLIDashboard() {
  const [allData, setAllData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [selectedVariable, setSelectedVariable] = useState('roli');
  const [selectedCountry, setSelectedCountry] = useState('__regional_avg__');
  const [chartType, setChartType] = useState('timeseries');
  const selectedLabel = VARIABLE_OPTIONS.find(opt => opt.value === selectedVariable)?.label || selectedVariable;
  const regionLabel = REGION_OPTIONS.find(opt => opt.value === selectedRegion)?.label || selectedRegion;

  useEffect(() => {
    fetch('/roli_data.json')
      .then(res => res.json())
      .then(json => setAllData(json));
  }, []);

  const roliData = useMemo(() => {
    const byYear = allData.filter(d => d.year === ACTIVE_YEAR);
    return selectedRegion === 'global' ? byYear : byYear.filter(d => d.region === selectedRegion);
  }, [allData, selectedRegion]);

  const availableCountries = useMemo(() => {
    const set = new Set(roliData.map(d => d.country));
    return [...set].sort();
  }, [roliData]);

  useEffect(() => {
    if (selectedCountry !== '__regional_avg__' && !availableCountries.includes(selectedCountry)) {
      setSelectedCountry(availableCountries[0] || '');
    }
  }, [availableCountries, selectedCountry]);

  if (roliData.length === 0) {
    return <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: COLORS.muted, fontSize: '16px' }}>Loading data…</p>
    </div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, fontFamily: "'Inter Tight', sans-serif", padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ maxWidth: '900px', margin: '0 auto 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div style={{ width: '6px', height: '48px', backgroundColor: COLORS.top5, borderRadius: '3px' }} />
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: COLORS.text, margin: 0, letterSpacing: '-0.5px' }}>Rule of Law Index – Data Visualization Tool</h1>
        </div>

      </div>

      {/* Controls */}
      <div style={{ maxWidth: '900px', margin: '0 auto 40px', backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Region</label>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
            {REGION_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Variable</label>
          <select value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
            <optgroup label="Overall Index">
              {VARIABLE_OPTIONS.filter(o => o.category === 'general').map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </optgroup>
            <optgroup label="Factors">
              {VARIABLE_OPTIONS.filter(o => o.category === 'factor').map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </optgroup>
            {SUBFACTOR_GROUPS.map(group => (
              <optgroup key={group.category} label={group.label}>
                {VARIABLE_OPTIONS.filter(o => o.category === group.category).map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
              </optgroup>
            ))}
          </select>
        </div>
        {chartType === 'timeseries' && (
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Country</label>
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
              <option value="__regional_avg__">{selectedRegion === 'global' ? 'Global Average' : 'Regional Average'}</option>
              {availableCountries.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        )}
      </div>

      {/* Chart type toggle */}
      <div style={{ maxWidth: '900px', margin: '0 auto 24px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setChartType('timeseries')}
          style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: chartType === 'timeseries' ? COLORS.top5 : 'white', color: chartType === 'timeseries' ? 'white' : COLORS.muted, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >Time Series</button>
        <button
          onClick={() => setChartType('topbottom')}
          style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: chartType === 'topbottom' ? COLORS.top5 : 'white', color: chartType === 'topbottom' ? 'white' : COLORS.muted, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >Top & Bottom Performers</button>
      </div>

      {/* Charts */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {chartType === 'topbottom' && <TopBottomChart data={roliData} variable={selectedVariable} label={selectedLabel} regionLabel={regionLabel} />}
        {chartType === 'timeseries' && selectedCountry && <TimeSeriesChart allData={allData} country={selectedCountry} variable={selectedVariable} label={selectedLabel} selectedRegion={selectedRegion} regionLabel={regionLabel} />}
      </div>

      {/* Footer */}
      <div style={{ maxWidth: '900px', margin: '24px auto 0', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: COLORS.muted }}>Source: World Justice Project — Rule of Law Index 2025</p>
      </div>
    </div>
  );
}
