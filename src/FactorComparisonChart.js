import { useMemo, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts';
import { COLORS } from './constants';
import { getEmbeddedFontCSS } from './svgExport';

const FACTORS = [
  { key: 'f1', label: 'Constraints on Government Power' },
  { key: 'f2', label: 'Absence of Corruption' },
  { key: 'f3', label: 'Open Government' },
  { key: 'f4', label: 'Fundamental Rights' },
  { key: 'f5', label: 'Order and Security' },
  { key: 'f6', label: 'Regulatory Enforcement' },
  { key: 'f7', label: 'Civil Justice' },
  { key: 'f8', label: 'Criminal Justice' }
];

const COMPARISON_COLORS = [
  '#003B88', // Primary blue
  '#27ae60', // Green
  '#8e44ad', // Purple
  '#e67e22', // Orange
  '#c0392b', // Red
];

export default function FactorComparisonChart({ allData, selectedRegion, selectedYear, availableCountries }) {
  const chartRef = useRef(null);
  const [selectedCountries, setSelectedCountries] = useState(['__regional_avg__']);

  const chartData = useMemo(() => {
    if (selectedCountries.length === 0) return [];

    const data = FACTORS.map(factor => {
      const row = { label: factor.label, factor: factor.key };

      selectedCountries.forEach((country, index) => {
        if (country === '__regional_avg__') {
          // Calculate regional average
          const yearData = allData.filter(d => d.year === selectedYear);
          const regionData = selectedRegion === 'global'
            ? yearData
            : yearData.filter(d => d.region === selectedRegion);

          const validData = regionData.filter(d => d[factor.key] != null);
          const avg = validData.length > 0
            ? validData.reduce((sum, d) => sum + d[factor.key], 0) / validData.length
            : 0;
          row[country] = avg;
        } else {
          // Get data for specific country
          const countryData = allData.find(
            d => d.country === country && d.year === selectedYear
          );
          row[country] = countryData?.[factor.key] || 0;
        }
      });

      return row;
    });

    return data;
  }, [allData, selectedRegion, selectedCountries, selectedYear]);

  const getCountryLabel = (country) => {
    if (country === '__regional_avg__') {
      return selectedRegion === 'global' ? 'Global Average' : `${selectedRegion} Average`;
    }
    return country;
  };

  async function downloadSVG() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;
    const bbox = svg.getBBox();
    const pad = 8;
    const vbX = bbox.x - pad;
    const vbY = bbox.y - pad;
    const vbW = bbox.width + pad * 2;
    const vbH = bbox.height + pad * 2;
    const clone = svg.cloneNode(true);
    const ns = 'http://www.w3.org/2000/svg';

    clone.setAttribute('width', vbW);
    clone.setAttribute('height', vbH);
    clone.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    clone.setAttribute('xmlns', ns);

    const fontCSS = await getEmbeddedFontCSS();
    const styleEl = document.createElementNS(ns, 'style');
    styleEl.textContent = fontCSS;
    clone.insertBefore(styleEl, clone.firstChild);

    clone.querySelectorAll('text').forEach(t => {
      t.setAttribute('font-family', "'Inter Tight', sans-serif");
      t.style.fontFamily = "'Inter Tight', sans-serif";
    });

    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('x', vbX);
    bg.setAttribute('y', vbY);
    bg.setAttribute('width', vbW);
    bg.setAttribute('height', vbH);
    bg.setAttribute('fill', 'white');
    clone.insertBefore(bg, clone.firstChild);

    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = selectedCountries.length === 1
      ? `ROLI_Factors_${getCountryLabel(selectedCountries[0])}_${selectedYear}.svg`
      : `ROLI_Factors_Comparison_${selectedYear}.svg`;
    a.download = fileName.replace(/\s+/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  }

  if (chartData.length === 0) {
    return (
      <div className="chart-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>Factor Comparison</h2>
        <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0 0 20px' }}>Please select countries to compare</p>
      </div>
    );
  }

  const barSize = selectedCountries.length === 1 ? 32 : 24;

  return (
    <div className="chart-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>Factor Comparison</h2>
      <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0 0 20px' }}>{selectedYear}</p>

      {/* Legend */}
      <div className="legend-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {selectedCountries.map((country, index) => (
          <div key={country} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: COMPARISON_COLORS[index % COMPARISON_COLORS.length], borderRadius: '2px' }} />
            <span style={{ fontSize: '13px', color: COLORS.muted, fontWeight: '500' }}>{getCountryLabel(country)}</span>
          </div>
        ))}
      </div>

      <div ref={chartRef} className="bar-chart-container" style={{ width: '100%', height: '500px', maxWidth: '1100px', margin: '0 auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 100, left: 240, bottom: 20 }}
          >
            <XAxis
              type="number"
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              tick={{ fontSize: 14, fill: COLORS.text, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 15, fill: COLORS.text, fontWeight: 400 }}
              axisLine={false}
              tickLine={false}
              width={230}
            />

            {/* Grid lines - these render FIRST so bars appear on top */}
            <ReferenceLine x={0.25} stroke="#e5e5e5" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine x={0.5} stroke="#e5e5e5" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine x={0.75} stroke="#e5e5e5" strokeDasharray="3 3" strokeWidth={1} />

            {/* Bars for each selected country */}
            {selectedCountries.map((country, index) => (
              <Bar
                key={country}
                dataKey={country}
                fill={COMPARISON_COLORS[index % COMPARISON_COLORS.length]}
                radius={[0, 4, 4, 0]}
                barSize={barSize}
              >
                <LabelList
                  dataKey={country}
                  position="right"
                  formatter={(value) => value ? `${Math.round(value * 100)}%` : ''}
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    fill: COLORS.text
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Country Selection Controls */}
      <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8f7f4', borderRadius: '8px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Countries to Compare (select up to 5)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
          {/* Regional Average Option */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selectedCountries.includes('__regional_avg__')}
              onChange={(e) => {
                if (e.target.checked && selectedCountries.length < 5) {
                  setSelectedCountries([...selectedCountries, '__regional_avg__']);
                } else if (!e.target.checked) {
                  setSelectedCountries(selectedCountries.filter(c => c !== '__regional_avg__'));
                }
              }}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: COLORS.text }}>
              {selectedRegion === 'global' ? 'Global Average' : `${selectedRegion} Average`}
            </span>
          </label>

          {/* Country Options */}
          {availableCountries.map(country => (
            <label key={country} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedCountries.includes(country)}
                onChange={(e) => {
                  if (e.target.checked && selectedCountries.length < 5) {
                    setSelectedCountries([...selectedCountries, country]);
                  } else if (!e.target.checked) {
                    setSelectedCountries(selectedCountries.filter(c => c !== country));
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: COLORS.text }}>{country}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button onClick={downloadSVG} style={{ background: 'none', border: '1.5px solid #e5e5e5', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: COLORS.muted, cursor: 'pointer' }}>↓ Export SVG</button>
      </div>
    </div>
  );
}
