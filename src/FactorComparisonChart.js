import { useMemo, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts';
import { COLORS, REGION_OPTIONS } from './constants';
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

// Custom Y-axis tick component with line wrapping
const CustomYAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(' ');
  const lines = [];
  let currentLine = '';

  // Split into lines of maximum 3 words each
  words.forEach((word, i) => {
    if (currentLine && currentLine.split(' ').length >= 3) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  });
  if (currentLine) lines.push(currentLine);

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={-200}
          y={0}
          dy={i * 16 - (lines.length - 1) * 8}
          textAnchor="start"
          fill={COLORS.text}
          fontSize={15}
          fontWeight={400}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export default function FactorComparisonChart({ allData, selectedRegion, selectedYear, availableCountries }) {
  const chartRef = useRef(null);
  const [selectedCountries, setSelectedCountries] = useState(['__region_global']);
  const [expandedRegions, setExpandedRegions] = useState({});

  // Group countries by region
  const countriesByRegion = useMemo(() => {
    const yearData = allData.filter(d => d.year === selectedYear);
    const groups = {};

    // Initialize all regions
    REGION_OPTIONS.forEach(region => {
      if (region.value !== 'global') {
        groups[region.value] = [];
      }
    });

    // Group countries
    yearData.forEach(d => {
      if (d.region && groups[d.region] && !groups[d.region].includes(d.country)) {
        groups[d.region].push(d.country);
      }
    });

    // Sort countries within each region
    Object.keys(groups).forEach(region => {
      groups[region].sort();
    });

    return groups;
  }, [allData, selectedYear]);

  const chartData = useMemo(() => {
    if (selectedCountries.length === 0) return [];

    const data = FACTORS.map(factor => {
      const row = { label: factor.label, factor: factor.key };

      selectedCountries.forEach((country, index) => {
        if (country.startsWith('__region_')) {
          // Calculate average for a specific region
          const regionName = country.replace('__region_', '');
          const yearData = regionName === 'global'
            ? allData.filter(d => d.year === selectedYear)
            : allData.filter(d => d.year === selectedYear && d.region === regionName);
          const validData = yearData.filter(d => d[factor.key] != null);
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
  }, [allData, selectedCountries, selectedYear]);

  const getCountryLabel = (country) => {
    if (country.startsWith('__region_')) {
      const regionName = country.replace('__region_', '');
      if (regionName === 'global') return 'Global Average';
      return `${regionName} Average`;
    }
    return country;
  };

  const toggleRegion = (region) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  const selectAllInRegion = (region) => {
    const countries = countriesByRegion[region] || [];
    const newSelected = [...selectedCountries];
    let addedCount = 0;

    countries.forEach(country => {
      if (!newSelected.includes(country) && newSelected.length + addedCount < 5) {
        newSelected.push(country);
        addedCount++;
      }
    });

    setSelectedCountries(newSelected);
  };

  const deselectAllInRegion = (region) => {
    const countries = countriesByRegion[region] || [];
    setSelectedCountries(selectedCountries.filter(c => !countries.includes(c)));
  };

  const isRegionFullySelected = (region) => {
    const countries = countriesByRegion[region] || [];
    return countries.length > 0 && countries.every(c => selectedCountries.includes(c));
  };

  async function downloadSVG() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;
    const bbox = svg.getBBox();
    const pad = 8;
    const legendH = 60; // Space for legend at top
    const vbX = bbox.x - pad;
    const vbY = bbox.y - pad - legendH;
    const vbW = bbox.width + pad * 2;
    const vbH = bbox.height + pad * 2 + legendH;
    const clone = svg.cloneNode(true);
    const ns = 'http://www.w3.org/2000/svg';

    // Helper: create an SVG element with attributes
    const el = (tag, attrs) => {
      const e = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
      return e;
    };

    // Helper: create a text element with content - BIGGER font
    const txt = (x, y, content) => {
      const t = el('text', { x, y, fill: COLORS.text, 'font-size': 16, 'font-weight': 500, 'font-family': "'Inter Tight', sans-serif", 'dominant-baseline': 'middle' });
      t.textContent = content;
      return t;
    };

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

    // White background covering chart + legend
    clone.insertBefore(el('rect', { x: vbX, y: vbY, width: vbW, height: vbH, fill: 'white' }), clone.firstChild);

    // Legend entries — positioned at TOP (bigger bars and text, vertically centered)
    const lx = vbX + 24;
    const ly = vbY + 20;
    const barHeight = 5; // Thicker color bars
    const centerY = ly + barHeight / 2; // Center of the bar

    let currentX = lx;
    selectedCountries.forEach((country, index) => {
      const label = getCountryLabel(country);
      const color = COMPARISON_COLORS[index % COMPARISON_COLORS.length];

      // Color bar for this country (thicker)
      clone.appendChild(el('rect', { x: currentX, y: ly, width: 30, height: barHeight, fill: color, rx: 2 }));
      // Text centered vertically with the bar
      clone.appendChild(txt(currentX + 36, centerY, label));

      // Move to next position (approximate width based on label length)
      currentX += label.length * 9 + 50;
    });

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

  // Dynamic sizing based on number of selections
  const barSize = selectedCountries.length === 1 ? 32 :
                  selectedCountries.length === 2 ? 24 :
                  selectedCountries.length === 3 ? 20 :
                  selectedCountries.length === 4 ? 18 : 16;

  const chartHeight = selectedCountries.length === 1 ? 550 :
                      selectedCountries.length === 2 ? 600 :
                      selectedCountries.length === 3 ? 750 :
                      selectedCountries.length === 4 ? 900 : 1100;

  const categoryGap = selectedCountries.length <= 2 ? '35%' :
                      selectedCountries.length === 3 ? '50%' :
                      selectedCountries.length === 4 ? '70%' : '100%';

  return (
    <div className="chart-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>Factor Comparison</h2>
          <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0' }}>{selectedYear}</p>
        </div>
        <button onClick={downloadSVG} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', backgroundColor: COLORS.top5, border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', marginTop: '0' }}>
          <span style={{ fontSize: '16px' }}>↓</span> Export SVG
        </button>
      </div>

      {/* Legend */}
      <div className="legend-container" style={{ display: 'flex', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {selectedCountries.map((country, index) => (
          <div key={country} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: COMPARISON_COLORS[index % COMPARISON_COLORS.length], borderRadius: '2px' }} />
            <span style={{ fontSize: '15px', color: COLORS.muted, fontWeight: '500' }}>{getCountryLabel(country)}</span>
          </div>
        ))}
      </div>

      <div ref={chartRef} className="bar-chart-container" style={{ width: '100%', height: `${chartHeight}px`, maxWidth: '1200px', margin: '0 auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 100, left: 120, bottom: 20 }}
            barCategoryGap={categoryGap}
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
              tick={<CustomYAxisTick />}
              axisLine={false}
              tickLine={false}
              width={200}
            />

            {/* Bars for each selected country - rendered FIRST */}
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

            {/* Grid lines - rendered LAST so they appear behind bars */}
            <ReferenceLine x={0.25} stroke="#e5e5e5" strokeDasharray="3 3" strokeWidth={1} strokeOpacity={0.5} />
            <ReferenceLine x={0.5} stroke="#e5e5e5" strokeDasharray="3 3" strokeWidth={1} strokeOpacity={0.5} />
            <ReferenceLine x={0.75} stroke="#e5e5e5" strokeDasharray="3 3" strokeWidth={1} strokeOpacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Country Selection Controls */}
      <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8f7f4', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Countries to Compare (select up to 5)
          </label>
          <span style={{ fontSize: '13px', color: COLORS.muted, fontWeight: '500' }}>
            {selectedCountries.length} / 5 selected
          </span>
        </div>

        {/* Regional Averages Section */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text, marginBottom: '12px' }}>🌍 Regional Averages</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {/* Global Average */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'white', borderRadius: '6px', border: `2px solid ${selectedCountries.includes('__region_global') ? COLORS.top5 : '#e5e5e5'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              <input
                type="checkbox"
                checked={selectedCountries.includes('__region_global')}
                onChange={(e) => {
                  if (e.target.checked && selectedCountries.length < 5) {
                    setSelectedCountries([...selectedCountries, '__region_global']);
                  } else if (!e.target.checked) {
                    setSelectedCountries(selectedCountries.filter(c => c !== '__region_global'));
                  }
                }}
                style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: COLORS.top5 }}
              />
              <span style={{ fontSize: '14px', color: COLORS.text, fontWeight: '600' }}>Global Average</span>
            </label>

            {/* Individual Regions */}
            {REGION_OPTIONS.filter(r => r.value !== 'global').map(region => (
              <label key={region.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'white', borderRadius: '6px', border: `2px solid ${selectedCountries.includes(`__region_${region.value}`) ? COLORS.top5 : '#e5e5e5'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(`__region_${region.value}`)}
                  onChange={(e) => {
                    const regionKey = `__region_${region.value}`;
                    if (e.target.checked && selectedCountries.length < 5) {
                      setSelectedCountries([...selectedCountries, regionKey]);
                    } else if (!e.target.checked) {
                      setSelectedCountries(selectedCountries.filter(c => c !== regionKey));
                    }
                  }}
                  disabled={!selectedCountries.includes(`__region_${region.value}`) && selectedCountries.length >= 5}
                  style={{ cursor: selectedCountries.includes(`__region_${region.value}`) || selectedCountries.length < 5 ? 'pointer' : 'not-allowed', width: '18px', height: '18px', accentColor: COLORS.top5 }}
                />
                <span style={{ fontSize: '14px', color: selectedCountries.includes(`__region_${region.value}`) || selectedCountries.length < 5 ? COLORS.text : COLORS.muted, fontWeight: '500' }}>{region.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Individual Countries by Region */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text, marginBottom: '12px' }}>🏴 Individual Countries</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {REGION_OPTIONS.filter(r => r.value !== 'global').map(region => {
            const countries = countriesByRegion[region.value] || [];
            if (countries.length === 0) return null;

            const isExpanded = expandedRegions[region.value];
            const fullySelected = isRegionFullySelected(region.value);

            return (
              <div key={region.value} style={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
                {/* Region Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: isExpanded ? '#fafafa' : 'white', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleRegion(region.value)}>
                  <span style={{ fontSize: '18px', marginRight: '8px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: COLORS.text }}>{region.label}</span>
                  <span style={{ fontSize: '12px', color: COLORS.muted, marginRight: '12px' }}>
                    {countries.filter(c => selectedCountries.includes(c)).length} / {countries.length}
                  </span>
                  {fullySelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deselectAllInRegion(region.value);
                      }}
                      style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '600', color: COLORS.muted, backgroundColor: 'transparent', border: '1px solid #d0d0d0', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Deselect All
                    </button>
                  )}
                  {!fullySelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllInRegion(region.value);
                      }}
                      disabled={selectedCountries.length >= 5}
                      style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '600', color: selectedCountries.length >= 5 ? '#ccc' : COLORS.top5, backgroundColor: 'transparent', border: `1px solid ${selectedCountries.length >= 5 ? '#e5e5e5' : COLORS.top5}`, borderRadius: '4px', cursor: selectedCountries.length >= 5 ? 'not-allowed' : 'pointer' }}
                    >
                      Select All
                    </button>
                  )}
                </div>

                {/* Country List */}
                {isExpanded && (
                  <div style={{ padding: '12px 16px 12px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', borderTop: '1px solid #f0f0f0' }}>
                    {countries.map(country => (
                      <label key={country} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0' }}>
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
                          disabled={!selectedCountries.includes(country) && selectedCountries.length >= 5}
                          style={{ cursor: selectedCountries.includes(country) || selectedCountries.length < 5 ? 'pointer' : 'not-allowed', width: '14px', height: '14px' }}
                        />
                        <span style={{ fontSize: '14px', color: selectedCountries.includes(country) || selectedCountries.length < 5 ? COLORS.text : COLORS.muted }}>{country}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
