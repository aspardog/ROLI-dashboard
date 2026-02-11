import { useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { COLORS } from './constants';
import { prepareSVGClone, embedFonts, addWhiteBackground, createLegendItem, downloadSVG as downloadSVGHelper } from './svgExportHelpers';
import ChartCard from './components/ChartCard';

const YEAR_COLORS = {
  '2019': '#95a3a6',
  '2020': '#7f8c8d',
  '2021': '#34495e',
  '2022': '#2980b9',
  '2023': '#8e44ad',
  '2024': '#27ae60',
  '2025': '#003B88'
};

function RadarChartView({
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

    const { clone, vbX, vbY, vbW, vbH } = prepareSVGClone(svg, 60, 'top');
    await embedFonts(clone);
    addWhiteBackground(clone, vbX, vbY, vbW, vbH);

    // Add legend items for each year
    const lx = vbX + 24;
    const ly = vbY + 20;
    let currentX = lx;

    selectedYears.forEach(year => {
      const color = YEAR_COLORS[year];
      const legendItems = createLegendItem(currentX, ly, color, year, 'line', { width: 30, height: 4 });
      legendItems.forEach(el => clone.appendChild(el));
      currentX += year.length * 10 + 70;
    });

    downloadSVGHelper(clone, `ROLI_Radar_${countryLabel}_${selectedYears.join('_')}.svg`);
  }

  if (radarData.length === 0) {
    return (
      <ChartCard
        title="Radar Chart"
        isEmpty={true}
        emptyMessage="Please select a country, factors, and years to display the chart."
      />
    );
  }

  return (
    <ChartCard
      title="Comparative Radar Chart"
      subtitle={countryLabel}
      onExport={downloadSVG}
    >
      {/* Legend */}
      <div className="legend-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {selectedYears.map(year => (
          <div key={year} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: YEAR_COLORS[year], borderRadius: '2px' }} />
            <span style={{ fontSize: '15px', color: COLORS.muted, fontWeight: '500' }}>{year}</span>
          </div>
        ))}
      </div>

      <div ref={chartRef} className="radar-chart-container" style={{ width: '100%', height: '800px', margin: '0 -40px' }}>
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
                const labelHeight = labelLines.length * 16;

                return (
                  <g>
                    {/* Values line above the label */}
                    <text
                      x={x}
                      y={y - labelHeight - 8}
                      textAnchor={textAnchor}
                      fill={COLORS.text}
                      fontSize={16}
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
                        y={y - labelHeight + 16 + (i * 16)}
                        textAnchor={textAnchor}
                        fill={COLORS.text}
                        fontSize={16}
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
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
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
                    fontSize={16}
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
    </ChartCard>
  );
}

RadarChartView.propTypes = {
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedRegion: PropTypes.string.isRequired,
  selectedCountry: PropTypes.string.isRequired,
  selectedFactors: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  selectedYears: PropTypes.arrayOf(PropTypes.string).isRequired,
  countryLabel: PropTypes.string.isRequired
};

export default memo(RadarChartView);
