import { useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { COLORS } from './constants';
import { prepareSVGClone, embedFonts, createLegendItem, downloadSVG as downloadSVGHelper } from './svgExportHelpers';
import ChartCard from './components/ChartCard';

// Overall Index + 8 Factors (clockwise order starting from top)
const RADAR_FACTORS = [
  { key: 'roli', label: 'Overall Index', shortLabel: 'Overall Index' },
  { key: 'f1', label: 'Constraints on Government Power', shortLabel: 'Constraints on\nGovernment Power' },
  { key: 'f2', label: 'Absence of Corruption', shortLabel: 'Absence of Corruption' },
  { key: 'f3', label: 'Open Government', shortLabel: 'Open Government' },
  { key: 'f4', label: 'Fundamental Rights', shortLabel: 'Fundamental Rights' },
  { key: 'f5', label: 'Order and Security', shortLabel: 'Order and Security' },
  { key: 'f6', label: 'Regulatory Enforcement', shortLabel: 'Regulatory Enforcement' },
  { key: 'f7', label: 'Civil Justice', shortLabel: 'Civil Justice' },
  { key: 'f8', label: 'Criminal Justice', shortLabel: 'Criminal Justice' },
];

// Colors for different years
const YEAR_COLORS = [
  '#5C2D91', // Purple (primary)
  '#BF02AF', // Magenta
  '#3366FF', // Blue
  '#FF4D6A', // Pink
  '#FFB52B', // Orange
  '#34C759', // Green
  '#FF9500', // Dark Orange
];

// Custom tick component to show values with year colors + label
const CustomAxisTick = ({ payload, x, y, cx, cy, combinedData, sortedYears }) => {
  const factor = RADAR_FACTORS.find(f => f.label === payload.value);
  if (!factor) return null;

  // Get the data point for this factor
  const dataPoint = combinedData.find(d => d.factor === factor.key);

  // Calculate position offset based on angle
  const angle = Math.atan2(y - cy, x - cx);
  const offsetDistance = 50;
  const labelX = x + Math.cos(angle) * offsetDistance;
  const labelY = y + Math.sin(angle) * offsetDistance;

  // Determine text anchor based on position
  let textAnchor = 'middle';
  if (x > cx + 10) textAnchor = 'start';
  else if (x < cx - 10) textAnchor = 'end';

  // Split label for multi-line labels
  const lines = factor.shortLabel.split('\n');

  // Build values with colors for each year
  const yearValues = sortedYears.map((year, index) => ({
    year,
    value: dataPoint?.[`year_${year}`],
    color: YEAR_COLORS[index % YEAR_COLORS.length]
  }));

  return (
    <g>
      {/* Values with year colors, separated by | */}
      <text
        x={labelX}
        y={labelY - (lines.length > 1 ? 12 : 8)}
        textAnchor={textAnchor}
        fontSize={14}
        fontWeight={600}
      >
        {yearValues.map((yv, idx) => (
          <tspan key={yv.year}>
            <tspan fill={yv.color}>
              {yv.value !== undefined ? yv.value.toFixed(2) : ''}
            </tspan>
            {idx < yearValues.length - 1 && (
              <tspan fill={COLORS.muted}> | </tspan>
            )}
          </tspan>
        ))}
      </text>
      {/* Label */}
      {lines.map((line, index) => (
        <text
          key={index}
          x={labelX}
          y={labelY + 8 + (index * 14)}
          textAnchor={textAnchor}
          fill={COLORS.muted}
          fontSize={12}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

function RadarChartView({
  allData,
  selectedEntity,
  selectedYears
}) {
  const chartRef = useRef(null);

  // Get label for an entity
  const getEntityLabel = (entity) => {
    if (entity === '__region_global') return 'Global Average';
    if (entity.startsWith('__region_')) {
      const regionName = entity.replace('__region_', '');
      return `${regionName} Average`;
    }
    return entity; // Country name
  };

  // Data for multiple years (for overlay)
  const multiYearData = useMemo(() => {
    if (!selectedEntity || selectedYears.length === 0) return [];

    const sortedYears = [...selectedYears].sort();

    return sortedYears.map(year => {
      const yearData = allData.filter(d => d.year === year);

      const factorData = RADAR_FACTORS.map(factor => {
        let value = 0;

        if (selectedEntity === '__region_global') {
          const validData = yearData.filter(d => d[factor.key] != null);
          value = validData.length > 0
            ? Math.round((validData.reduce((sum, d) => sum + d[factor.key], 0) / validData.length) * 100) / 100
            : 0;
        } else if (selectedEntity.startsWith('__region_')) {
          const regionName = selectedEntity.replace('__region_', '');
          const regionData = yearData.filter(d => d.region === regionName && d[factor.key] != null);
          value = regionData.length > 0
            ? Math.round((regionData.reduce((sum, d) => sum + d[factor.key], 0) / regionData.length) * 100) / 100
            : 0;
        } else {
          const countryData = yearData.find(d => d.country === selectedEntity);
          value = countryData?.[factor.key] ?? 0;
        }

        return { factor: factor.key, label: factor.label, [`year_${year}`]: value, fullMark: 1 };
      });

      return { year, data: factorData };
    });
  }, [allData, selectedEntity, selectedYears]);

  // Combined data for multi-year radar
  const combinedData = useMemo(() => {
    if (multiYearData.length === 0) return [];

    // Start with factor structure
    const combined = RADAR_FACTORS.map(factor => ({
      factor: factor.key,
      label: factor.label,
      fullMark: 1
    }));

    // Add each year's values
    multiYearData.forEach(({ year, data }) => {
      data.forEach((item, index) => {
        combined[index][`year_${year}`] = item[`year_${year}`];
      });
    });

    return combined;
  }, [multiYearData]);

  // Get the title based on selected entity
  const chartTitle = useMemo(() => {
    if (!selectedEntity) return 'Comparative Radar Chart';
    return getEntityLabel(selectedEntity);
  }, [selectedEntity]);

  const sortedYears = useMemo(() => [...selectedYears].sort(), [selectedYears]);

  async function downloadSVG() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;

    const legendHeight = 60;
    const { clone, vbX, vbY } = prepareSVGClone(svg, legendHeight, 'top', {});
    await embedFonts(clone);

    // Add legend items for years with | separator
    const lx = vbX + 24;
    const ly = vbY + 20;
    let currentX = lx;

    sortedYears.forEach((year, index) => {
      const color = YEAR_COLORS[index % YEAR_COLORS.length];
      const legendItems = createLegendItem(currentX, ly, color, year, 'line', { width: 24 });
      legendItems.forEach(el => clone.appendChild(el));
      currentX += 70;

      // Add separator if not last
      if (index < sortedYears.length - 1) {
        const sep = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        sep.setAttribute('x', currentX);
        sep.setAttribute('y', ly + 5);
        sep.setAttribute('fill', COLORS.muted);
        sep.setAttribute('font-size', '14');
        sep.textContent = '|';
        clone.appendChild(sep);
        currentX += 20;
      }
    });

    downloadSVGHelper(clone, `ROLI_Radar_${chartTitle.replace(/\s+/g, '_')}.svg`);
  }

  if (combinedData.length === 0 || !selectedEntity) {
    return (
      <ChartCard
        title="Comparative Radar Chart"
        isEmpty={true}
        emptyMessage="Please select a country or region."
      />
    );
  }

  return (
    <ChartCard
      title={chartTitle}
      subtitle="Comparative Radar Chart"
      onExport={downloadSVG}
      exportOptions={['full']}
    >
      {/* Legend for years with | separator */}
      <div className="legend-container" style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '16px', flexWrap: 'wrap' }}>
        {sortedYears.map((year, index) => (
          <div key={year} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px' }}>
              <div style={{
                width: '24px',
                height: '3px',
                backgroundColor: YEAR_COLORS[index % YEAR_COLORS.length],
                borderRadius: '2px'
              }} />
              <span style={{ fontSize: '14px', color: COLORS.text, fontWeight: '500' }}>{year}</span>
            </div>
            {index < sortedYears.length - 1 && (
              <span style={{ color: COLORS.muted, fontSize: '16px', fontWeight: '300' }}>|</span>
            )}
          </div>
        ))}
      </div>

      <div ref={chartRef} className="radar-chart-container" style={{ width: '100%', height: '620px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="70%"
            data={combinedData}
            margin={{ top: 80, right: 120, bottom: 80, left: 120 }}
          >
            <PolarGrid
              stroke={COLORS.divider}
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="label"
              tick={<CustomAxisTick combinedData={combinedData} sortedYears={sortedYears} />}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              ticks={[0.2, 0.4, 0.6, 0.8, 1.0]}
              tick={{ fontSize: 11, fill: COLORS.muted }}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(1)}
            />

            {sortedYears.map((year, index) => (
              <Radar
                key={year}
                name={year}
                dataKey={`year_${year}`}
                stroke={YEAR_COLORS[index % YEAR_COLORS.length]}
                fill={YEAR_COLORS[index % YEAR_COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ r: 4, fill: YEAR_COLORS[index % YEAR_COLORS.length] }}
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
  selectedEntity: PropTypes.string.isRequired,
  selectedYears: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default memo(RadarChartView);
