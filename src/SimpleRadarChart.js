import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { COLORS, VARIABLE_OPTIONS } from './constants';

export default function BasicRadarChart({ allData, selectedRegion, selectedYear }) {
  const radarData = useMemo(() => {
    // Get data for the selected year and region
    const yearData = selectedRegion === 'global'
      ? allData.filter(d => d.year === selectedYear)
      : allData.filter(d => d.year === selectedYear && d.region === selectedRegion);

    if (yearData.length === 0) return [];

    // Get all factor variables (F1-F8)
    const factors = VARIABLE_OPTIONS.filter(v => v.category === 'factor');

    // Calculate average for each factor
    const data = factors.map(factor => {
      const values = yearData.map(d => d[factor.value]).filter(v => v != null);
      const avg = values.length > 0
        ? values.reduce((sum, v) => sum + v, 0) / values.length
        : 0;

      return {
        factor: factor.label.split(' - ')[0], // Use "F1", "F2", etc.
        value: Math.round(avg * 1000) / 1000
      };
    });

    return data;
  }, [allData, selectedRegion, selectedYear]);

  if (radarData.length === 0) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>Radar Chart</h2>
        <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0 0 20px' }}>No data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 4px' }}>Radar Chart - Factors Overview</h2>
      <p style={{ fontSize: '14px', color: COLORS.muted, margin: '0 0 20px' }}>
        {selectedRegion === 'global' ? 'Global' : selectedRegion} - {selectedYear}
      </p>

      <div style={{ width: '100%', height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#d1cfd1" />
            <PolarAngleAxis
              dataKey="factor"
              tick={{ fill: COLORS.text, fontSize: 13, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              tick={{ fill: COLORS.muted, fontSize: 12 }}
            />
            <Radar
              name="Value"
              dataKey="value"
              stroke="#003B88"
              fill="#003B88"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
