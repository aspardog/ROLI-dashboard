import { useMemo } from 'react';
import { COLORS } from '../config';
import { getEmbeddedFontCSS } from '../utils/svgExport';

// Human rights sub-factors from Factor 4 (Fundamental Rights)
const HUMAN_RIGHTS_FACTORS = [
  { key: 'sf45', label: 'Freedom of Religion', shortLabel: '4.5' },
  { key: 'sf41', label: 'Equality & Non-discrimination', shortLabel: '4.1' },
  { key: 'sf44', label: 'Freedom of Opinion', shortLabel: '4.4' },
  { key: 'sf47', label: 'Freedom of Assembly', shortLabel: '4.7' },
  { key: 'sf42', label: 'Right to Life & Security', shortLabel: '4.2' },
  { key: 'sf46', label: 'Right to Privacy', shortLabel: '4.6' },
];

// Target countries from Asia & Pacific and Central Asia
const TARGET_COUNTRIES = [
  'Afghanistan', 'Australia', 'Bangladesh', 'Cambodia', 'China',
  'Hong Kong SAR, China', 'India', 'Indonesia', 'Japan', 'Kazakhstan',
  'Korea, Rep.', 'Kyrgyz Republic', 'Malaysia', 'Mongolia', 'Myanmar',
  'Nepal', 'New Zealand', 'Pakistan', 'Philippines', 'Singapore',
  'Sri Lanka', 'Thailand', 'Uzbekistan', 'Vietnam'
];

// Color scale from red (0) to yellow (0.5) to green (1)
function getHeatmapColor(value) {
  if (value === null || value === undefined) return '#e0e0e0';

  // Clamp value between 0 and 1
  const v = Math.max(0, Math.min(1, value));

  if (v < 0.5) {
    // Red to Yellow (0 to 0.5)
    const t = v / 0.5;
    const r = 220;
    const g = Math.round(80 + t * 140);
    const b = Math.round(80 - t * 30);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Green (0.5 to 1)
    const t = (v - 0.5) / 0.5;
    const r = Math.round(220 - t * 150);
    const g = Math.round(220 - t * 30);
    const b = Math.round(50 + t * 70);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Get change indicator arrow and color
function getChangeIndicator(change) {
  if (change === null || change === undefined || isNaN(change)) {
    return { symbol: '—', color: COLORS.muted };
  }

  const absChange = Math.abs(change * 100);

  if (absChange < 1) {
    return { symbol: '→', color: COLORS.muted };
  } else if (change > 0) {
    if (absChange >= 10) return { symbol: '↑↑', color: '#2e7d32' };
    return { symbol: '↑', color: '#4caf50' };
  } else {
    if (absChange >= 10) return { symbol: '↓↓', color: '#c62828' };
    return { symbol: '↓', color: '#ef5350' };
  }
}

export default function HumanRightsHeatmap({ allData, selectedYear = '2025', baseYear = '2015' }) {
  // Process data for the heatmap
  const heatmapData = useMemo(() => {
    const result = [];

    TARGET_COUNTRIES.forEach(country => {
      // Find data for current year and base year
      const currentData = allData.find(d => d.country === country && d.year === selectedYear);
      const baseData = allData.find(d => d.country === country && d.year === baseYear);

      if (!currentData) return;

      const countryRow = {
        country,
        region: currentData.region,
        factors: {}
      };

      HUMAN_RIGHTS_FACTORS.forEach(factor => {
        const currentValue = currentData[factor.key];
        const baseValue = baseData ? baseData[factor.key] : null;
        const change = (currentValue !== null && baseValue !== null)
          ? currentValue - baseValue
          : null;

        countryRow.factors[factor.key] = {
          value: currentValue,
          change,
          changePercent: baseValue ? ((currentValue - baseValue) / baseValue) * 100 : null
        };
      });

      result.push(countryRow);
    });

    // Sort by average score descending
    result.sort((a, b) => {
      const avgA = Object.values(a.factors).reduce((sum, f) => sum + (f.value || 0), 0) / HUMAN_RIGHTS_FACTORS.length;
      const avgB = Object.values(b.factors).reduce((sum, f) => sum + (f.value || 0), 0) / HUMAN_RIGHTS_FACTORS.length;
      return avgB - avgA;
    });

    return result;
  }, [allData, selectedYear, baseYear]);

  // Download SVG function
  const downloadSVG = async () => {
    const fontCSS = await getEmbeddedFontCSS();

    const cellWidth = 100;
    const cellHeight = 32;
    const countryColWidth = 140;
    const headerHeight = 80;
    const padding = 20;
    const legendHeight = 60;

    const width = countryColWidth + (HUMAN_RIGHTS_FACTORS.length * cellWidth) + padding * 2;
    const height = headerHeight + (heatmapData.length * cellHeight) + legendHeight + padding * 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <style>
        ${fontCSS}
        text { font-family: 'Inter Tight', sans-serif; }
      </style>
      <rect width="100%" height="100%" fill="white"/>

      <!-- Title -->
      <text x="${width/2}" y="30" text-anchor="middle" font-size="16" font-weight="700" fill="${COLORS.primary}">Human Rights in Asia & Pacific - ${selectedYear}</text>
      <text x="${width/2}" y="50" text-anchor="middle" font-size="12" fill="${COLORS.muted}">Civil & Political Rights Sub-factors (Change from ${baseYear})</text>
    `;

    // Header row
    const headerY = headerHeight;
    svg += `<text x="${padding + 10}" y="${headerY - 10}" font-size="11" font-weight="600" fill="${COLORS.text}">Country</text>`;

    HUMAN_RIGHTS_FACTORS.forEach((factor, i) => {
      const x = padding + countryColWidth + (i * cellWidth) + cellWidth / 2;
      svg += `<text x="${x}" y="${headerY - 25}" text-anchor="middle" font-size="10" font-weight="600" fill="${COLORS.text}">${factor.shortLabel}</text>`;
      svg += `<text x="${x}" y="${headerY - 10}" text-anchor="middle" font-size="9" fill="${COLORS.muted}">${factor.label.length > 15 ? factor.label.substring(0, 15) + '...' : factor.label}</text>`;
    });

    // Data rows
    heatmapData.forEach((row, rowIndex) => {
      const y = headerHeight + (rowIndex * cellHeight);

      // Country name
      svg += `<text x="${padding + 10}" y="${y + cellHeight / 2 + 4}" font-size="11" fill="${COLORS.text}">${row.country.length > 18 ? row.country.substring(0, 18) + '...' : row.country}</text>`;

      // Factor cells
      HUMAN_RIGHTS_FACTORS.forEach((factor, colIndex) => {
        const x = padding + countryColWidth + (colIndex * cellWidth);
        const data = row.factors[factor.key];
        const color = getHeatmapColor(data.value);
        const indicator = getChangeIndicator(data.change);

        // Cell background
        svg += `<rect x="${x}" y="${y}" width="${cellWidth - 2}" height="${cellHeight - 2}" fill="${color}" rx="2"/>`;

        // Value
        svg += `<text x="${x + cellWidth / 2 - 12}" y="${y + cellHeight / 2 + 4}" text-anchor="middle" font-size="12" font-weight="500" fill="${data.value > 0.5 ? '#1a1a1a' : 'white'}">${data.value !== null ? data.value.toFixed(2) : '—'}</text>`;

        // Change indicator
        svg += `<text x="${x + cellWidth / 2 + 18}" y="${y + cellHeight / 2 + 4}" text-anchor="middle" font-size="11" fill="${indicator.color}">${indicator.symbol}</text>`;
      });
    });

    // Legend
    const legendY = headerHeight + (heatmapData.length * cellHeight) + 20;
    svg += `<text x="${padding}" y="${legendY}" font-size="10" font-weight="600" fill="${COLORS.muted}">Score: </text>`;

    // Color scale
    const scaleX = padding + 45;
    const scaleWidth = 150;
    for (let i = 0; i <= 10; i++) {
      const v = i / 10;
      svg += `<rect x="${scaleX + (i * scaleWidth / 10)}" y="${legendY - 10}" width="${scaleWidth / 10}" height="12" fill="${getHeatmapColor(v)}"/>`;
    }
    svg += `<text x="${scaleX}" y="${legendY + 15}" font-size="9" fill="${COLORS.muted}">0.0</text>`;
    svg += `<text x="${scaleX + scaleWidth}" y="${legendY + 15}" text-anchor="end" font-size="9" fill="${COLORS.muted}">1.0</text>`;

    // Change legend
    svg += `<text x="${scaleX + scaleWidth + 40}" y="${legendY}" font-size="10" font-weight="600" fill="${COLORS.muted}">Change:</text>`;
    svg += `<text x="${scaleX + scaleWidth + 100}" y="${legendY}" font-size="10" fill="#4caf50">↑ Improved</text>`;
    svg += `<text x="${scaleX + scaleWidth + 175}" y="${legendY}" font-size="10" fill="#ef5350">↓ Declined</text>`;
    svg += `<text x="${scaleX + scaleWidth + 250}" y="${legendY}" font-size="10" fill="${COLORS.muted}">→ No change</text>`;

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `human-rights-heatmap-${selectedYear}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: COLORS.primary }}>
            Human Rights in Asia & Pacific
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: COLORS.muted }}>
            Civil & Political Rights Sub-factors — {selectedYear} scores with change from {baseYear}
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

      {/* Heatmap Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f7f4' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                color: COLORS.text,
                borderBottom: '2px solid #e5e5e5',
                position: 'sticky',
                left: 0,
                backgroundColor: '#f8f7f4',
                minWidth: '140px'
              }}>
                Country
              </th>
              {HUMAN_RIGHTS_FACTORS.map(factor => (
                <th key={factor.key} style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: COLORS.text,
                  borderBottom: '2px solid #e5e5e5',
                  minWidth: '100px'
                }}>
                  <div style={{ fontSize: '11px', color: COLORS.primary }}>{factor.shortLabel}</div>
                  <div style={{ fontSize: '10px', fontWeight: '400', color: COLORS.muted, marginTop: '2px' }}>
                    {factor.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, rowIndex) => (
              <tr key={row.country} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{
                  padding: '10px 16px',
                  fontWeight: '500',
                  color: COLORS.text,
                  position: 'sticky',
                  left: 0,
                  backgroundColor: rowIndex % 2 === 0 ? 'white' : '#fafafa'
                }}>
                  {row.country}
                </td>
                {HUMAN_RIGHTS_FACTORS.map(factor => {
                  const data = row.factors[factor.key];
                  const bgColor = getHeatmapColor(data.value);
                  const indicator = getChangeIndicator(data.change);
                  const textColor = data.value > 0.5 ? '#1a1a1a' : 'white';

                  return (
                    <td key={factor.key} style={{
                      padding: '8px',
                      textAlign: 'center',
                      backgroundColor: bgColor
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '600', color: textColor, fontSize: '13px' }}>
                          {data.value !== null ? data.value.toFixed(2) : '—'}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: indicator.color,
                          textShadow: data.value > 0.4 && data.value < 0.6 ? 'none' : '0 0 2px rgba(255,255,255,0.5)'
                        }}>
                          {indicator.symbol}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #e5e5e5',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center',
        backgroundColor: '#f8f7f4'
      }}>
        {/* Color scale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: COLORS.muted }}>Score:</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: COLORS.muted, marginRight: '4px' }}>0.0</span>
            <div style={{ display: 'flex' }}>
              {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(v => (
                <div key={v} style={{ width: '14px', height: '14px', backgroundColor: getHeatmapColor(v) }} />
              ))}
            </div>
            <span style={{ fontSize: '10px', color: COLORS.muted, marginLeft: '4px' }}>1.0</span>
          </div>
        </div>

        {/* Change indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: COLORS.muted }}>Change ({baseYear}→{selectedYear}):</span>
          <span style={{ fontSize: '12px', color: '#2e7d32' }}>↑↑ +10%+</span>
          <span style={{ fontSize: '12px', color: '#4caf50' }}>↑ Improved</span>
          <span style={{ fontSize: '12px', color: COLORS.muted }}>→ No change</span>
          <span style={{ fontSize: '12px', color: '#ef5350' }}>↓ Declined</span>
          <span style={{ fontSize: '12px', color: '#c62828' }}>↓↓ -10%+</span>
        </div>
      </div>
    </div>
  );
}
