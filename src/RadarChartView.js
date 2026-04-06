import { useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { COLORS } from './constants';
import { prepareSVGClone, embedFonts, createLegendItem, downloadSVG as downloadSVGHelper } from './svgExportHelpers';
import ChartCard from './components/ChartCard';

// 8 Factors
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

// Colors for different entities
const ENTITY_COLORS = [
  '#5C2D91', // Purple
  '#BF02AF', // Magenta
  '#3366FF', // Blue
  '#FF4D6A', // Pink
  '#FFB52B', // Orange
  '#34C759', // Green
  '#FF9500', // Dark Orange
  '#5856D6', // Indigo
];

function RadarChartView({
  allData,
  selectedEntities,
  selectedYears
}) {
  const chartRef = useRef(null);

  // Get label for an entity
  const getEntityLabel = (entity) => {
    if (entity === '__region_global') return 'Global Average';
    if (entity.startsWith('__region_')) {
      const regionName = entity.replace('__region_', '');
      return regionName;
    }
    return entity; // Country name
  };

  // Calculate chart data
  const chartData = useMemo(() => {
    if (selectedEntities.length === 0 || selectedYears.length === 0) return [];

    // Use the most recent selected year for the comparison
    const year = selectedYears.sort().reverse()[0];
    const yearData = allData.filter(d => d.year === year);

    // Build data for each factor
    return FACTORS.map(factor => {
      const row = { label: factor.label, factor: factor.key };

      selectedEntities.forEach((entity) => {
        if (entity === '__region_global') {
          // Global average
          const validData = yearData.filter(d => d[factor.key] != null);
          row[entity] = validData.length > 0
            ? Math.round((validData.reduce((sum, d) => sum + d[factor.key], 0) / validData.length) * 100) / 100
            : 0;
        } else if (entity.startsWith('__region_')) {
          // Regional average
          const regionName = entity.replace('__region_', '');
          const regionData = yearData.filter(d => d.region === regionName && d[factor.key] != null);
          row[entity] = regionData.length > 0
            ? Math.round((regionData.reduce((sum, d) => sum + d[factor.key], 0) / regionData.length) * 100) / 100
            : 0;
        } else {
          // Individual country
          const countryData = yearData.find(d => d.country === entity);
          row[entity] = countryData?.[factor.key] ?? 0;
        }
      });

      return row;
    });
  }, [allData, selectedEntities, selectedYears]);

  // Get the title based on selected entities
  const chartTitle = useMemo(() => {
    if (selectedEntities.length === 0) return 'Comparative Chart';
    if (selectedEntities.length === 1) {
      return getEntityLabel(selectedEntities[0]);
    }
    return `Comparing ${selectedEntities.length} Categories`;
  }, [selectedEntities]);

  async function downloadSVG() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;

    const legendHeight = 60;
    const { clone, vbX, vbY } = prepareSVGClone(svg, legendHeight, 'top', {});
    await embedFonts(clone);

    // Add legend items
    const lx = vbX + 24;
    const ly = vbY + 20;
    let currentX = lx;

    selectedEntities.forEach((entity, index) => {
      const label = getEntityLabel(entity);
      const color = ENTITY_COLORS[index % ENTITY_COLORS.length];
      const legendItems = createLegendItem(currentX, ly, color, label, 'rect', { width: 16, height: 16 });
      legendItems.forEach(el => clone.appendChild(el));
      currentX += label.length * 8 + 50;
    });

    const year = selectedYears.sort().reverse()[0];
    downloadSVGHelper(clone, `ROLI_Comparison_${year}.svg`);
  }

  if (chartData.length === 0 || selectedEntities.length === 0) {
    return (
      <ChartCard
        title="Comparative Chart"
        isEmpty={true}
        emptyMessage="Please select categories to compare."
      />
    );
  }

  // Dynamic sizing based on number of entities
  const barSize = selectedEntities.length === 1 ? 28 :
                  selectedEntities.length === 2 ? 22 :
                  selectedEntities.length === 3 ? 18 :
                  selectedEntities.length === 4 ? 16 : 14;

  const chartHeight = selectedEntities.length <= 2 ? 500 :
                      selectedEntities.length === 3 ? 600 :
                      selectedEntities.length === 4 ? 700 : 800;

  const categoryGap = selectedEntities.length <= 2 ? '30%' :
                      selectedEntities.length === 3 ? '40%' :
                      selectedEntities.length === 4 ? '50%' : '60%';

  return (
    <ChartCard
      title={chartTitle}
      subtitle={`Comparative Radar Chart`}
      onExport={downloadSVG}
      exportOptions={['full']}
    >
      {/* Legend */}
      <div className="legend-container" style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {selectedEntities.map((entity, index) => (
          <div key={entity} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: ENTITY_COLORS[index % ENTITY_COLORS.length], borderRadius: '2px' }} />
            <span style={{ fontSize: '14px', color: COLORS.text, fontWeight: '500' }}>{getEntityLabel(entity)}</span>
          </div>
        ))}
      </div>

      <div ref={chartRef} className="bar-chart-container" style={{ width: '100%', height: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 80, left: 10, bottom: 20 }}
            barCategoryGap={categoryGap}
          >
            <XAxis
              type="number"
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tickFormatter={(v) => v.toFixed(2)}
              tick={{ fontSize: 13, fill: COLORS.text }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 14, fill: COLORS.text, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={180}
            />

            {selectedEntities.map((entity, index) => (
              <Bar
                key={entity}
                dataKey={entity}
                fill={ENTITY_COLORS[index % ENTITY_COLORS.length]}
                radius={[0, 4, 4, 0]}
                barSize={barSize}
              >
                <LabelList
                  dataKey={entity}
                  position="right"
                  formatter={(value) => value ? value.toFixed(2) : ''}
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    fill: COLORS.text
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

RadarChartView.propTypes = {
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedEntities: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedYears: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default memo(RadarChartView);
