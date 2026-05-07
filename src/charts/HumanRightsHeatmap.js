import { useMemo } from 'react';
import { COLORS, VARIABLE_OPTIONS } from '../config';
import { getEmbeddedFontCSS } from '../utils/svgExport';

// Color scale from red (0) to yellow (0.5) to green (1)
function getHeatmapColor(value) {
  if (value === null || value === undefined) return '#e0e0e0';

  const v = Math.max(0, Math.min(1, value));

  if (v < 0.5) {
    const t = v / 0.5;
    const r = 220;
    const g = Math.round(80 + t * 140);
    const b = Math.round(80 - t * 30);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (v - 0.5) / 0.5;
    const r = Math.round(220 - t * 150);
    const g = Math.round(220 - t * 30);
    const b = Math.round(50 + t * 70);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export default function HumanRightsHeatmap({
  allData,
  selectedYear = '2025',
  selectedRegion = 'global',
  selectedFactors = ['roli', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']
}) {
  // Get region label
  const regionLabel = selectedRegion === 'global' ? 'Global' : selectedRegion;

  // Build factors list with labels
  const factorsList = useMemo(() => {
    return selectedFactors.map(key => {
      const option = VARIABLE_OPTIONS.find(v => v.value === key);
      return {
        key,
        label: option ? option.label.replace(/^[A-Z0-9.]+ - /, '').replace(/^\d+\.\d+ - /, '') : key,
        shortLabel: option ? option.label.split(' - ')[0] : key
      };
    });
  }, [selectedFactors]);

  // Process data for the heatmap
  const heatmapData = useMemo(() => {
    // Filter by year and region
    let yearData = allData.filter(d => d.year === selectedYear);
    if (selectedRegion !== 'global') {
      yearData = yearData.filter(d => d.region === selectedRegion);
    }

    const result = yearData.map(countryData => {
      const factors = {};
      selectedFactors.forEach(key => {
        factors[key] = countryData[key];
      });

      return {
        country: countryData.country,
        region: countryData.region,
        factors
      };
    });

    // Sort alphabetically by country name
    result.sort((a, b) => a.country.localeCompare(b.country));

    return result;
  }, [allData, selectedYear, selectedRegion, selectedFactors]);

  // Download SVG function
  const downloadSVG = async () => {
    const fontCSS = await getEmbeddedFontCSS();

    const cellWidth = 65;
    const cellHeight = 32;
    const cellGap = 4;
    const countryColWidth = 150;
    const headerHeight = 70;
    const padding = 20;
    const legendHeight = 50;

    const width = countryColWidth + (factorsList.length * (cellWidth + cellGap)) + padding * 2;
    const height = headerHeight + (heatmapData.length * cellHeight) + legendHeight + padding * 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <style>
        ${fontCSS}
        text { font-family: 'Inter Tight', sans-serif; }
      </style>
      <rect width="100%" height="100%" fill="white"/>

      <!-- Title -->
      <text x="${width/2}" y="28" text-anchor="middle" font-size="16" font-weight="700" fill="${COLORS.primary}">Score Heatmap - ${selectedYear}</text>
      <text x="${width/2}" y="46" text-anchor="middle" font-size="12" fill="${COLORS.muted}">${regionLabel}</text>
    `;

    // Header row
    const headerY = headerHeight;
    svg += `<text x="${padding + 10}" y="${headerY - 8}" font-size="10" font-weight="600" fill="${COLORS.text}">Country</text>`;

    factorsList.forEach((factor, i) => {
      const x = padding + countryColWidth + (i * (cellWidth + cellGap)) + cellWidth / 2;
      svg += `<text x="${x}" y="${headerY - 8}" text-anchor="middle" font-size="10" font-weight="600" fill="${COLORS.text}">${factor.shortLabel}</text>`;
    });

    // Data rows
    heatmapData.forEach((row, rowIndex) => {
      const y = headerHeight + (rowIndex * cellHeight);

      // Country name
      const displayName = row.country.length > 18 ? row.country.substring(0, 18) + '...' : row.country;
      svg += `<text x="${padding + 10}" y="${y + cellHeight / 2 + 4}" font-size="10" fill="${COLORS.text}">${displayName}</text>`;

      // Factor cells
      factorsList.forEach((factor, colIndex) => {
        const x = padding + countryColWidth + (colIndex * (cellWidth + cellGap));
        const value = row.factors[factor.key];
        const color = getHeatmapColor(value);
        const textColor = value > 0.5 ? '#1a1a1a' : 'white';

        svg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight - 2}" fill="${color}" rx="3"/>`;
        svg += `<text x="${x + cellWidth / 2}" y="${y + cellHeight / 2 + 4}" text-anchor="middle" font-size="13" font-weight="600" fill="${textColor}">${value !== null && value !== undefined ? value.toFixed(2) : '—'}</text>`;
      });
    });

    // Legend
    const legendY = headerHeight + (heatmapData.length * cellHeight) + 25;
    svg += `<text x="${padding}" y="${legendY}" font-size="10" font-weight="600" fill="${COLORS.muted}">Score:</text>`;

    const scaleX = padding + 50;
    const scaleWidth = 150;
    for (let i = 0; i <= 10; i++) {
      const v = i / 10;
      svg += `<rect x="${scaleX + (i * scaleWidth / 10)}" y="${legendY - 10}" width="${scaleWidth / 10 + 1}" height="14" fill="${getHeatmapColor(v)}"/>`;
    }
    svg += `<text x="${scaleX}" y="${legendY + 16}" font-size="9" fill="${COLORS.muted}">0.0 (Low)</text>`;
    svg += `<text x="${scaleX + scaleWidth}" y="${legendY + 16}" text-anchor="end" font-size="9" fill="${COLORS.muted}">1.0 (High)</text>`;

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heatmap-${selectedRegion}-${selectedYear}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: COLORS.primary }}>
            Score Heatmap
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: COLORS.muted }}>
            {regionLabel} — {selectedYear}
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
              {factorsList.map(factor => (
                <th key={factor.key} style={{
                  padding: '12px 6px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: COLORS.text,
                  borderBottom: '2px solid #e5e5e5',
                  minWidth: '60px'
                }}>
                  <div style={{ fontSize: '11px', color: COLORS.primary, fontWeight: '600' }}>{factor.shortLabel}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, rowIndex) => (
              <tr key={row.country} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{
                  padding: '8px 16px',
                  fontWeight: '500',
                  color: COLORS.text,
                  position: 'sticky',
                  left: 0,
                  backgroundColor: rowIndex % 2 === 0 ? 'white' : '#fafafa',
                  fontSize: '12px'
                }}>
                  {row.country}
                </td>
                {factorsList.map(factor => {
                  const value = row.factors[factor.key];
                  const bgColor = getHeatmapColor(value);
                  const textColor = value > 0.5 ? '#1a1a1a' : 'white';

                  return (
                    <td key={factor.key} style={{
                      padding: '10px 6px',
                      textAlign: 'center',
                      backgroundColor: bgColor,
                      borderLeft: '3px solid white',
                      borderRight: '3px solid white'
                    }}>
                      <span style={{ fontWeight: '700', color: textColor, fontSize: '14px' }}>
                        {value !== null && value !== undefined ? value.toFixed(2) : '—'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend - Only score scale, no change indicators */}
      <div style={{
        padding: '12px 24px',
        borderTop: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8f7f4'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: COLORS.muted }}>Score:</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: COLORS.muted, marginRight: '4px' }}>0.0</span>
            <div style={{ display: 'flex', borderRadius: '3px', overflow: 'hidden' }}>
              {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(v => (
                <div key={v} style={{ width: '16px', height: '14px', backgroundColor: getHeatmapColor(v) }} />
              ))}
            </div>
            <span style={{ fontSize: '10px', color: COLORS.muted, marginLeft: '4px' }}>1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
