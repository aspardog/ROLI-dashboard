import { useMemo } from 'react';
import { COLORS, VARIABLE_OPTIONS } from '../config';
import { getEmbeddedFontCSS } from '../utils/svgExport';

// Target countries from Asia & Pacific and Central Asia
const TARGET_COUNTRIES = [
  'Afghanistan', 'Australia', 'Bangladesh', 'Cambodia', 'China',
  'Hong Kong SAR, China', 'India', 'Indonesia', 'Japan', 'Kazakhstan',
  'Korea, Rep.', 'Kyrgyz Republic', 'Malaysia', 'Mongolia', 'Myanmar',
  'Nepal', 'New Zealand', 'Pakistan', 'Philippines', 'Singapore',
  'Sri Lanka', 'Thailand', 'Uzbekistan', 'Vietnam'
];

// Get color based on change
function getChangeColor(change) {
  if (change === null || change === undefined || isNaN(change)) return COLORS.muted;
  if (change > 0.05) return '#2e7d32'; // Strong positive
  if (change > 0) return '#4caf50';     // Positive
  if (change > -0.05) return '#ff9800'; // Slight negative
  return '#c62828';                      // Strong negative
}

// Format change as percentage
function formatChange(change) {
  if (change === null || change === undefined || isNaN(change)) return '—';
  const pct = change * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

export default function LollipopChart({
  allData,
  selectedYear = '2025',
  baseYear = '2015',
  selectedVariable = 'f4'
}) {
  // Get variable label
  const variableLabel = useMemo(() => {
    const option = VARIABLE_OPTIONS.find(v => v.value === selectedVariable);
    return option ? option.label : selectedVariable;
  }, [selectedVariable]);

  // Process data for the lollipop chart
  const chartData = useMemo(() => {
    const result = [];

    TARGET_COUNTRIES.forEach(country => {
      const currentData = allData.find(d => d.country === country && d.year === selectedYear);
      const baseData = allData.find(d => d.country === country && d.year === baseYear);

      if (!currentData) return;

      const currentValue = currentData[selectedVariable];
      const baseValue = baseData ? baseData[selectedVariable] : null;
      const precomputedComparison = currentData.comparisons?.[baseYear]?.[selectedVariable];
      const change = Array.isArray(precomputedComparison)
        ? precomputedComparison[0]
        : currentValue !== null && baseValue !== null
          ? currentValue - baseValue
          : null;
      const changePercent = Array.isArray(precomputedComparison)
        ? (precomputedComparison[1] !== null ? precomputedComparison[1] * 100 : null)
        : baseValue && baseValue !== 0
          ? (change / baseValue) * 100
          : null;

      result.push({
        country,
        region: currentData.region,
        currentValue,
        baseValue,
        change,
        changePercent
      });
    });

    // Sort by current value descending
    result.sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));

    return result;
  }, [allData, selectedYear, baseYear, selectedVariable]);

  // Download SVG function
  const downloadSVG = async () => {
    const fontCSS = await getEmbeddedFontCSS();

    const rowHeight = 28;
    const labelWidth = 150;
    const chartWidth = 400;
    const changeWidth = 80;
    const padding = 30;
    const headerHeight = 80;
    const legendHeight = 50;

    const width = labelWidth + chartWidth + changeWidth + padding * 2;
    const height = headerHeight + (chartData.length * rowHeight) + legendHeight + padding;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <style>
        ${fontCSS}
        text { font-family: 'Inter Tight', sans-serif; }
      </style>
      <rect width="100%" height="100%" fill="white"/>

      <!-- Title -->
      <text x="${width/2}" y="28" text-anchor="middle" font-size="16" font-weight="700" fill="${COLORS.primary}">${variableLabel}</text>
      <text x="${width/2}" y="48" text-anchor="middle" font-size="12" fill="${COLORS.muted}">Asia & Pacific — Lollipop view for ${selectedYear} with ${baseYear} reference</text>

      <!-- Scale markers -->
      <text x="${padding + labelWidth}" y="${headerHeight - 8}" font-size="9" fill="${COLORS.muted}">0.0</text>
      <text x="${padding + labelWidth + chartWidth/2}" y="${headerHeight - 8}" text-anchor="middle" font-size="9" fill="${COLORS.muted}">0.5</text>
      <text x="${padding + labelWidth + chartWidth}" y="${headerHeight - 8}" text-anchor="end" font-size="9" fill="${COLORS.muted}">1.0</text>
      <text x="${padding + labelWidth + chartWidth + changeWidth/2 + 10}" y="${headerHeight - 8}" text-anchor="middle" font-size="9" fill="${COLORS.muted}">Change</text>

      <!-- Grid line at 0.5 -->
      <line x1="${padding + labelWidth + chartWidth/2}" y1="${headerHeight}" x2="${padding + labelWidth + chartWidth/2}" y2="${headerHeight + chartData.length * rowHeight}" stroke="#e0e0e0" stroke-dasharray="4,4"/>
    `;

    chartData.forEach((row, index) => {
      const y = headerHeight + (index * rowHeight) + rowHeight / 2;
      const barWidth = (row.currentValue || 0) * chartWidth;
      const changeColor = getChangeColor(row.change);

      // Country label
      const displayName = row.country.length > 20 ? row.country.substring(0, 20) + '...' : row.country;
      svg += `<text x="${padding + labelWidth - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="${COLORS.text}">${displayName}</text>`;

      // Lollipop line
      svg += `<line x1="${padding + labelWidth}" y1="${y}" x2="${padding + labelWidth + barWidth}" y2="${y}" stroke="${COLORS.primary}" stroke-width="2"/>`;

      // Lollipop circle
      svg += `<circle cx="${padding + labelWidth + barWidth}" cy="${y}" r="6" fill="${COLORS.primary}"/>`;

      // Value inside circle
      svg += `<text x="${padding + labelWidth + barWidth}" y="${y + 3}" text-anchor="middle" font-size="8" font-weight="600" fill="white">${row.currentValue !== null ? row.currentValue.toFixed(2) : '—'}</text>`;

      // Base year marker (small triangle)
      if (row.baseValue !== null) {
        const baseX = padding + labelWidth + (row.baseValue * chartWidth);
        svg += `<polygon points="${baseX},${y-5} ${baseX-4},${y+3} ${baseX+4},${y+3}" fill="${COLORS.muted}" opacity="0.7"/>`;
      }

      // Change percentage
      svg += `<text x="${padding + labelWidth + chartWidth + changeWidth/2 + 10}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="500" fill="${changeColor}">${formatChange(row.change)}</text>`;
    });

    // Legend
    const legendY = headerHeight + (chartData.length * rowHeight) + 30;
    svg += `<circle cx="${padding + 10}" cy="${legendY}" r="5" fill="${COLORS.primary}"/>`;
    svg += `<text x="${padding + 22}" y="${legendY + 4}" font-size="10" fill="${COLORS.text}">${selectedYear} Score</text>`;
    svg += `<polygon points="${padding + 110},${legendY - 4} ${padding + 106},${legendY + 4} ${padding + 114},${legendY + 4}" fill="${COLORS.muted}"/>`;
    svg += `<text x="${padding + 122}" y="${legendY + 4}" font-size="10" fill="${COLORS.text}">${baseYear} Score</text>`;

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lollipop-${selectedVariable}-${baseYear}-${selectedYear}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: COLORS.primary }}>
            {variableLabel}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: COLORS.muted }}>
            Asia & Pacific — Lollipop view for {selectedYear} with {baseYear} reference
          </p>
        </div>
        <button
          onClick={downloadSVG}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '500',
            color: COLORS.primary,
            backgroundColor: 'white',
            border: `1px solid ${COLORS.primary}`,
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Download SVG
        </button>
      </div>

      {/* Chart */}
      <div style={{ padding: '20px 24px' }}>
        {/* Scale header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', paddingLeft: '150px' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', maxWidth: '400px' }}>
            <span style={{ fontSize: '10px', color: COLORS.muted }}>0.0</span>
            <span style={{ fontSize: '10px', color: COLORS.muted }}>0.5</span>
            <span style={{ fontSize: '10px', color: COLORS.muted }}>1.0</span>
          </div>
          <div style={{ width: '80px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: COLORS.muted, fontWeight: '600' }}>Change</span>
          </div>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {chartData.map((row, index) => {
            const barWidth = (row.currentValue || 0) * 100;
            const basePosition = row.baseValue !== null ? row.baseValue * 100 : null;
            const changeColor = getChangeColor(row.change);

            return (
              <div
                key={row.country}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 0',
                  backgroundColor: index % 2 === 0 ? 'transparent' : '#fafafa',
                  borderRadius: '4px'
                }}
              >
                {/* Country name */}
                <div style={{
                  width: '150px',
                  paddingRight: '12px',
                  fontSize: '12px',
                  color: COLORS.text,
                  fontWeight: '500',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {row.country}
                </div>

                {/* Lollipop chart area */}
                <div style={{
                  flex: 1,
                  maxWidth: '400px',
                  height: '24px',
                  position: 'relative',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  {/* Grid line at 0.5 */}
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: '#e0e0e0'
                  }} />

                  {/* Base year marker (triangle) */}
                  {basePosition !== null && (
                    <div style={{
                      position: 'absolute',
                      left: `${basePosition}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderBottom: `8px solid ${COLORS.muted}`,
                      opacity: 0.6
                    }} />
                  )}

                  {/* Lollipop stick */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    width: `${barWidth}%`,
                    height: '3px',
                    backgroundColor: COLORS.primary,
                    transform: 'translateY(-50%)',
                    borderRadius: '2px'
                  }} />

                  {/* Lollipop head */}
                  <div style={{
                    position: 'absolute',
                    left: `${barWidth}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: COLORS.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {row.currentValue !== null ? row.currentValue.toFixed(2) : '—'}
                    </span>
                  </div>
                </div>

                {/* Change percentage */}
                <div style={{
                  width: '80px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: changeColor
                }}>
                  {formatChange(row.change)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '24px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e5e5',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: COLORS.primary
            }} />
            <span style={{ fontSize: '12px', color: COLORS.text }}>{selectedYear} Score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: `10px solid ${COLORS.muted}`
            }} />
            <span style={{ fontSize: '12px', color: COLORS.text }}>{baseYear} Score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#4caf50' }}>+%</span>
            <span style={{ fontSize: '12px', color: COLORS.text }}>Improved</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#c62828' }}>−%</span>
            <span style={{ fontSize: '12px', color: COLORS.text }}>Declined</span>
          </div>
        </div>
      </div>
    </div>
  );
}
