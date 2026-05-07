import { useMemo } from 'react';
import { COLORS, VARIABLE_OPTIONS } from '../config';
import { getEmbeddedFontCSS } from '../utils/svgExport';

// Get color based on change direction
function getChangeColor(change) {
  if (change === null || change === undefined || isNaN(change)) return COLORS.muted;
  if (change > 0) return '#4caf50';
  if (change < 0) return '#ef5350';
  return COLORS.muted;
}

const BASE_POINT_COLOR = '#7c6bb3';
const BASE_POINT_FILL = '#ebe5fb';
const POINT_DIAMETER = 24;
const OVERLAP_OFFSET = 14;

export default function DumbbellChart({
  allData,
  selectedYear = '2025',
  baseYear = '2020',
  selectedRegion = 'global',
  selectedVariable = 'roli'
}) {
  // Get variable label
  const variableLabel = useMemo(() => {
    const option = VARIABLE_OPTIONS.find(v => v.value === selectedVariable);
    return option ? option.label : selectedVariable;
  }, [selectedVariable]);

  // Get region label
  const regionLabel = selectedRegion === 'global' ? 'Global' : selectedRegion;

  // Process data for the dumbbell chart
  const chartData = useMemo(() => {
    // Filter by year and region
    let currentYearData = allData.filter(d => d.year === selectedYear);
    if (selectedRegion !== 'global') {
      currentYearData = currentYearData.filter(d => d.region === selectedRegion);
    }

    const result = [];

    currentYearData.forEach(current => {
      const baseData = allData.find(d => d.country === current.country && d.year === baseYear);

      const currentValue = current[selectedVariable];
      const baseValue = baseData ? baseData[selectedVariable] : null;
      const change = (currentValue !== null && baseValue !== null)
        ? currentValue - baseValue
        : null;

      result.push({
        country: current.country,
        region: current.region,
        currentValue,
        baseValue,
        change
      });
    });

    // Sort alphabetically by country name
    result.sort((a, b) => a.country.localeCompare(b.country));

    return result;
  }, [allData, selectedYear, baseYear, selectedRegion, selectedVariable]);

  // Download SVG function
  const downloadSVG = async () => {
    const fontCSS = await getEmbeddedFontCSS();

    const rowHeight = 32;
    const labelWidth = 150;
    const chartWidth = 450;
    const padding = 30;
    const headerHeight = 90;
    const legendHeight = 60;

    const width = labelWidth + chartWidth + padding * 2;
    const height = headerHeight + (chartData.length * rowHeight) + legendHeight + padding;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <style>
        ${fontCSS}
        text { font-family: 'Inter Tight', sans-serif; }
      </style>
      <rect width="100%" height="100%" fill="white"/>

      <!-- Title -->
      <text x="${width/2}" y="28" text-anchor="middle" font-size="16" font-weight="700" fill="${COLORS.primary}">${variableLabel}</text>
      <text x="${width/2}" y="48" text-anchor="middle" font-size="12" fill="${COLORS.muted}">${regionLabel} — Comparison from ${baseYear} to ${selectedYear}</text>

      <!-- Scale markers -->
      <text x="${padding + labelWidth}" y="${headerHeight - 8}" font-size="9" fill="${COLORS.muted}">0.0</text>
      <text x="${padding + labelWidth + chartWidth * 0.25}" y="${headerHeight - 8}" text-anchor="middle" font-size="9" fill="${COLORS.muted}">0.25</text>
      <text x="${padding + labelWidth + chartWidth * 0.5}" y="${headerHeight - 8}" text-anchor="middle" font-size="9" fill="${COLORS.muted}">0.50</text>
      <text x="${padding + labelWidth + chartWidth * 0.75}" y="${headerHeight - 8}" text-anchor="middle" font-size="9" fill="${COLORS.muted}">0.75</text>
      <text x="${padding + labelWidth + chartWidth}" y="${headerHeight - 8}" text-anchor="end" font-size="9" fill="${COLORS.muted}">1.0</text>

    `;

    chartData.forEach((row, index) => {
      const y = headerHeight + (index * rowHeight) + rowHeight / 2;
      const baseX = row.baseValue !== null ? padding + labelWidth + (row.baseValue * chartWidth) : null;
      const currentX = row.currentValue !== null ? padding + labelWidth + (row.currentValue * chartWidth) : null;
      const lineColor = getChangeColor(row.change);
      const pointsOverlap = baseX !== null && currentX !== null && Math.abs(currentX - baseX) < POINT_DIAMETER;
      const adjustedBaseX = pointsOverlap ? Math.max(padding + labelWidth, baseX - OVERLAP_OFFSET / 2) : baseX;
      const adjustedCurrentX = pointsOverlap ? Math.min(padding + labelWidth + chartWidth, currentX + OVERLAP_OFFSET / 2) : currentX;

      // Country label
      const displayName = row.country.length > 18 ? row.country.substring(0, 18) + '...' : row.country;
      svg += `<text x="${padding + labelWidth - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="${COLORS.text}">${displayName}</text>`;

      // Connecting line (dumbbell bar)
      if (adjustedBaseX !== null && adjustedCurrentX !== null) {
        svg += `<line x1="${adjustedBaseX}" y1="${y}" x2="${adjustedCurrentX}" y2="${y}" stroke="${lineColor}" stroke-width="3" stroke-linecap="round"/>`;
      }

      // Base year circle
      if (adjustedBaseX !== null) {
        svg += `<circle cx="${adjustedBaseX}" cy="${y}" r="8" fill="${BASE_POINT_FILL}" stroke="${BASE_POINT_COLOR}" stroke-width="3"/>`;
        svg += `<text x="${adjustedBaseX}" y="${y + 3}" text-anchor="middle" font-size="7" font-weight="700" fill="${BASE_POINT_COLOR}">${row.baseValue.toFixed(2)}</text>`;
      }

      // Current year circle (filled)
      if (adjustedCurrentX !== null) {
        svg += `<circle cx="${adjustedCurrentX}" cy="${y}" r="8" fill="${COLORS.primary}" stroke="${COLORS.primary}" stroke-width="2"/>`;
        svg += `<text x="${adjustedCurrentX}" y="${y + 3}" text-anchor="middle" font-size="7" font-weight="600" fill="white">${row.currentValue.toFixed(2)}</text>`;
      }
    });

    // Legend
    const legendY = headerHeight + (chartData.length * rowHeight) + 35;

    // Base year legend
    svg += `<circle cx="${padding + 20}" cy="${legendY}" r="7" fill="${BASE_POINT_FILL}" stroke="${BASE_POINT_COLOR}" stroke-width="3"/>`;
    svg += `<text x="${padding + 35}" y="${legendY + 4}" font-size="11" fill="${COLORS.text}">${baseYear}</text>`;

    // Current year legend
    svg += `<circle cx="${padding + 100}" cy="${legendY}" r="7" fill="${COLORS.primary}"/>`;
    svg += `<text x="${padding + 115}" y="${legendY + 4}" font-size="11" fill="${COLORS.text}">${selectedYear}</text>`;

    // Improved legend
    svg += `<line x1="${padding + 200}" y1="${legendY}" x2="${padding + 230}" y2="${legendY}" stroke="#4caf50" stroke-width="3"/>`;
    svg += `<text x="${padding + 240}" y="${legendY + 4}" font-size="11" fill="${COLORS.text}">Improved</text>`;

    // Declined legend
    svg += `<line x1="${padding + 320}" y1="${legendY}" x2="${padding + 350}" y2="${legendY}" stroke="#ef5350" stroke-width="3"/>`;
    svg += `<text x="${padding + 360}" y="${legendY + 4}" font-size="11" fill="${COLORS.text}">Declined</text>`;

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dumbbell-${selectedVariable}-${selectedRegion}-${baseYear}-to-${selectedYear}.svg`;
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
            {regionLabel} — Comparison from {baseYear} to {selectedYear}
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
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', maxWidth: '450px' }}>
            <span style={{ fontSize: '10px', color: COLORS.muted }}>0.0</span>
            <span style={{ fontSize: '10px', color: COLORS.muted }}>0.25</span>
            <span style={{ fontSize: '10px', color: COLORS.muted }}>0.50</span>
            <span style={{ fontSize: '10px', color: COLORS.muted }}>0.75</span>
            <span style={{ fontSize: '10px', color: COLORS.muted }}>1.0</span>
          </div>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {chartData.map((row, index) => {
            const basePosition = row.baseValue !== null ? row.baseValue * 100 : null;
            const currentPosition = row.currentValue !== null ? row.currentValue * 100 : null;
            const lineColor = getChangeColor(row.change);
            const overlapInPercent = basePosition !== null && currentPosition !== null
              ? Math.abs(currentPosition - basePosition)
              : null;
            const pointsOverlap = overlapInPercent !== null && overlapInPercent < 5;
            const adjustedBasePosition = pointsOverlap ? Math.max(0, basePosition - 1.5) : basePosition;
            const adjustedCurrentPosition = pointsOverlap ? Math.min(100, currentPosition + 1.5) : currentPosition;

            return (
              <div
                key={row.country}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 0',
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

                {/* Dumbbell chart area */}
                <div style={{
                  flex: 1,
                  maxWidth: '450px',
                  height: '28px',
                  position: 'relative',
                  backgroundColor: 'transparent',
                  borderRadius: '4px'
                }}>
                  {/* Connecting line */}
                  {adjustedBasePosition !== null && adjustedCurrentPosition !== null && (
                    <div style={{
                      position: 'absolute',
                      left: `${Math.min(adjustedBasePosition, adjustedCurrentPosition)}%`,
                      width: `${Math.abs(adjustedCurrentPosition - adjustedBasePosition)}%`,
                      top: '50%',
                      height: '4px',
                      backgroundColor: lineColor,
                      transform: 'translateY(-50%)',
                      borderRadius: '2px'
                    }} />
                  )}

                  {/* Base year point */}
                  {adjustedBasePosition !== null && (
                    <div style={{
                      position: 'absolute',
                      left: `${adjustedBasePosition}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${POINT_DIAMETER}px`,
                      height: `${POINT_DIAMETER}px`,
                      borderRadius: '50%',
                      backgroundColor: BASE_POINT_FILL,
                      border: `3px solid ${BASE_POINT_COLOR}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 2px white',
                      zIndex: 3
                    }}>
                      <span style={{ fontSize: '8px', fontWeight: '700', color: BASE_POINT_COLOR }}>
                        {row.baseValue.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Current year point (filled circle) */}
                  {adjustedCurrentPosition !== null && (
                    <div style={{
                      position: 'absolute',
                      left: `${adjustedCurrentPosition}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${POINT_DIAMETER}px`,
                      height: `${POINT_DIAMETER}px`,
                      borderRadius: '50%',
                      backgroundColor: COLORS.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `3px solid white`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      zIndex: 2
                    }}>
                      <span style={{ fontSize: '8px', fontWeight: '600', color: 'white' }}>
                        {row.currentValue.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '32px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e5e5',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: BASE_POINT_FILL,
              border: `3px solid ${BASE_POINT_COLOR}`
            }} />
            <span style={{ fontSize: '12px', color: COLORS.text }}>{baseYear}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: COLORS.primary
            }} />
            <span style={{ fontSize: '12px', color: COLORS.text }}>{selectedYear}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '4px', backgroundColor: '#4caf50', borderRadius: '2px' }} />
            <span style={{ fontSize: '12px', color: COLORS.text }}>Improved</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '4px', backgroundColor: '#ef5350', borderRadius: '2px' }} />
            <span style={{ fontSize: '12px', color: COLORS.text }}>Declined</span>
          </div>
        </div>
      </div>
    </div>
  );
}
