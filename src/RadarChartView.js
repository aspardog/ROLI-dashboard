import { useMemo, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { COLORS } from './constants';
import { getEmbeddedFontCSS } from './svgExport';

const YEAR_COLORS = {
  '2019': '#95a3a6',
  '2020': '#7f8c8d',
  '2021': '#34495e',
  '2022': '#2980b9',
  '2023': '#8e44ad',
  '2024': '#27ae60',
  '2025': '#003B88'
};

export default function RadarChartView({
  allData,
  selectedRegion,
  selectedCountry,
  selectedFactors,
  selectedYears,
  countryLabel
}) {
  const chartRef = useRef(null);

  const radarData = useMemo(() => {
    if (!selectedCountry || selectedFactors.length === 0 || selectedYears.length === 0) {
      return [];
    }

    // Filter data for selected country/region
    const countryData = selectedCountry === '__regional_avg__'
      ? (selectedRegion === 'global' ? allData : allData.filter(d => d.region === selectedRegion))
      : allData.filter(d => d.country === selectedCountry);

    // Build radar data structure
    const radarPoints = selectedFactors.map(factor => {
      // Extract description only (remove the number prefix)
      const description = factor.label.includes(' - ')
        ? factor.label.split(' - ')[1]  // Get text after " - "
        : factor.label;  // If no " - ", use full label

      const point = {
        factor: description,
        fullLabel: factor.label  // Store full label for reference
      };

      selectedYears.forEach(year => {
        if (selectedCountry === '__regional_avg__') {
          // Calculate average for the region
          const yearData = countryData.filter(d => d.year === year && d[factor.value] != null);
          if (yearData.length > 0) {
            const avg = yearData.reduce((sum, d) => sum + d[factor.value], 0) / yearData.length;
            point[year] = Math.round(avg * 1000) / 1000;
          } else {
            point[year] = 0;
          }
        } else {
          // Get value for specific country
          const yearData = countryData.find(d => d.year === year);
          point[year] = yearData && yearData[factor.value] != null ? yearData[factor.value] : 0;
        }
      });

      return point;
    });

    return radarPoints;
  }, [allData, selectedRegion, selectedCountry, selectedFactors, selectedYears]);

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
    bg.setAttribute('x', vbX); bg.setAttribute('y', vbY);
    bg.setAttribute('width', vbW); bg.setAttribute('height', vbH);
    bg.setAttribute('fill', 'white');
    clone.insertBefore(bg, clone.firstChild);

    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ROLI_Radar_${countryLabel}_${selectedYears.join('_')}.svg`.replace(/\s+/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  }

  if (radarData.length === 0) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>Radar Chart</h2>
        <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0 0 20px' }}>Please select a country, factors, and years to display the chart.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>Comparative Radar Chart</h2>
      <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0 0 20px' }}>{countryLabel}</p>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {selectedYears.map(year => (
          <div key={year} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: YEAR_COLORS[year], borderRadius: '2px' }} />
            <span style={{ fontSize: '13px', color: COLORS.muted, fontWeight: '500' }}>{year}</span>
          </div>
        ))}
      </div>

      <div ref={chartRef} style={{ width: '100%', height: '800px', margin: '0 -40px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 60, right: 60, bottom: 60, left: 60 }}>
            <PolarGrid stroke="#d1cfd1" strokeDasharray="5 5" />
            <PolarAngleAxis
              dataKey="factor"
              tick={({ payload, x, y, textAnchor, index }) => {
                const dataPoint = radarData[index];
                if (!dataPoint) return null;

                // Calculate values text with colors
                const valuesText = selectedYears.map((year) => {
                  const value = dataPoint[year];
                  return { year, value, color: YEAR_COLORS[year] };
                });

                // Get the label text (already just the description)
                const labelText = payload.value || '';

                // Determine if we need to wrap label text
                const maxCharsPerLine = 22;
                const labelLines = [];
                if (labelText.length > maxCharsPerLine) {
                  const words = labelText.split(' ');
                  let currentLine = '';
                  words.forEach(word => {
                    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                      currentLine = currentLine ? currentLine + ' ' + word : word;
                    } else {
                      if (currentLine) labelLines.push(currentLine);
                      currentLine = word;
                    }
                  });
                  if (currentLine) labelLines.push(currentLine);
                } else {
                  labelLines.push(labelText);
                }

                // Calculate total height needed for label
                const labelHeight = labelLines.length * 14;

                return (
                  <g>
                    {/* Values line above the label */}
                    <text
                      x={x}
                      y={y - labelHeight - 8}
                      textAnchor={textAnchor}
                      fill={COLORS.text}
                      fontSize={12}
                      fontWeight={600}
                    >
                      {valuesText.map((item, i) => (
                        <tspan key={item.year} fill={item.color}>
                          {item.value != null ? item.value.toFixed(2) : '—'}
                          {i < valuesText.length - 1 && <tspan fill={COLORS.muted}> | </tspan>}
                        </tspan>
                      ))}
                    </text>
                    {/* Label lines */}
                    {labelLines.map((line, i) => (
                      <text
                        key={i}
                        x={x}
                        y={y - labelHeight + 14 + (i * 14)}
                        textAnchor={textAnchor}
                        fill={COLORS.text}
                        fontSize={12}
                        fontWeight={500}
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                );
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              tick={(props) => {
                const { x, y, payload, cx, cy } = props;
                // Move tick inside the radar by adjusting position
                const dx = x - cx;
                const dy = y - cy;
                const angle = Math.atan2(dy, dx);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const newDistance = distance - 12; // Move 12px inward
                const newX = cx + Math.cos(angle) * newDistance;
                const newY = cy + Math.sin(angle) * newDistance;

                return (
                  <text
                    x={newX}
                    y={newY + 4}
                    fill={COLORS.muted}
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {payload.value.toFixed(1)}
                  </text>
                );
              }}
              axisLine={false}
            />
            {selectedYears.map(year => (
              <Radar
                key={year}
                name={year}
                dataKey={year}
                stroke={YEAR_COLORS[year]}
                fill={YEAR_COLORS[year]}
                fillOpacity={0.1}
                strokeWidth={2.5}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button onClick={downloadSVG} style={{ background: 'none', border: '1.5px solid #e5e5e5', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: COLORS.muted, cursor: 'pointer' }}>↓ Export SVG</button>
      </div>
    </div>
  );
}
