import { useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { FACTOR_COLORS, FACTOR_SHORT_LABELS, SUBFACTOR_SHORT_LABELS, COLORS } from '../config';
import { embedFonts, downloadSVG as downloadSVGHelper, createSVGElement, createTextElement, matchesRegion } from '../utils';
import { ChartCard } from '../components';

// Factor structure with their subfactors
const FACTOR_STRUCTURE = [
  { factor: 'f1', subfactors: ['sf11', 'sf12', 'sf13', 'sf14', 'sf15', 'sf16'] },
  { factor: 'f2', subfactors: ['sf21', 'sf22', 'sf23', 'sf24'] },
  { factor: 'f3', subfactors: ['sf31', 'sf32', 'sf33', 'sf34'] },
  { factor: 'f4', subfactors: ['sf41', 'sf42', 'sf43', 'sf44', 'sf45', 'sf46', 'sf47', 'sf48'] },
  { factor: 'f5', subfactors: ['sf51', 'sf52', 'sf53'] },
  { factor: 'f6', subfactors: ['sf61', 'sf62', 'sf63', 'sf64', 'sf65'] },
  { factor: 'f7', subfactors: ['sf71', 'sf72', 'sf73', 'sf74', 'sf75', 'sf76', 'sf77'] },
  { factor: 'f8', subfactors: ['sf81', 'sf82', 'sf83', 'sf84', 'sf85', 'sf86', 'sf87'] },
];

function CountryProfileChart({ allData, selectedRegion, selectedCountry, selectedYear }) {
  const chartRef = useRef(null);

  // Get data for the selected entity (country or regional average)
  const profileData = useMemo(() => {
    if (selectedCountry === '__regional_avg__') {
      // Calculate regional or global average
      const filtered = allData.filter(d => {
        if (d.year !== selectedYear) return false;
        if (!matchesRegion(d, selectedRegion)) return false;
        return true;
      });

      if (filtered.length === 0) return null;

      const result = {};
      const allKeys = [...FACTOR_STRUCTURE.flatMap(f => [f.factor, ...f.subfactors])];

      for (const key of allKeys) {
        const values = filtered.map(d => d[key]).filter(v => v != null);
        if (values.length > 0) {
          result[key] = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100;
        }
      }

      return result;
    } else {
      // Get specific country data
      const countryData = allData.find(d => d.country === selectedCountry && d.year === selectedYear);
      return countryData || null;
    }
  }, [allData, selectedRegion, selectedCountry, selectedYear]);

  const title = useMemo(() => {
    if (selectedCountry === '__regional_avg__') {
      return selectedRegion === 'global' ? 'Global Average' : `${selectedRegion} — Regional Average`;
    }
    return selectedCountry;
  }, [selectedCountry, selectedRegion]);

  if (!profileData) {
    return (
      <ChartCard title="Country Profile" subtitle={selectedYear}>
        <div style={{ padding: '40px', textAlign: 'center', color: COLORS.muted }}>
          No data available for this selection.
        </div>
      </ChartCard>
    );
  }

  // Bar rendering component
  const SubfactorBar = ({ label, value, color }) => {
    const barWidth = value != null ? `${value * 100}%` : '0%';
    const displayValue = value != null ? value.toFixed(2) : '—';

    return (
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontSize: '12px', color: COLORS.text, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '12px', backgroundColor: '#e8e8e8', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: barWidth, height: '100%', backgroundColor: color, borderRadius: '2px' }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.text, minWidth: '32px', textAlign: 'right' }}>
            {displayValue}
          </span>
        </div>
      </div>
    );
  };

  // Factor section component
  const FactorSection = ({ factor, subfactors, data }) => {
    const color = FACTOR_COLORS[factor];
    const factorLabel = FACTOR_SHORT_LABELS[factor];

    return (
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '700',
          color: color,
          marginBottom: '12px',
          borderBottom: `2px solid ${color}`,
          paddingBottom: '4px'
        }}>
          {factorLabel}
        </div>
        {subfactors.map(sf => (
          <SubfactorBar
            key={sf}
            label={SUBFACTOR_SHORT_LABELS[sf]}
            value={data[sf]}
            color={color}
          />
        ))}
      </div>
    );
  };

  async function downloadSVG(format = 'full') {
    // Create SVG manually for better control
    const ns = 'http://www.w3.org/2000/svg';

    // Scale factor for bipanel (smaller output)
    const scale = format === 'bipanel' ? 0.55 : 1;

    // Layout constants (larger for better export quality)
    const colWidth = 290 * scale;
    const rowGap = 45 * scale;
    const colGap = 45 * scale;
    const margin = 35 * scale;
    const titleHeight = 55 * scale;
    const barHeight = 16 * scale;
    const labelHeight = 20 * scale;
    const itemHeight = barHeight + labelHeight + 8 * scale;

    // Font sizes scale
    const titleFontSize = Math.round(22 * scale);
    const headerFontSize = Math.round(15 * scale);
    const labelFontSize = Math.round(13 * scale);
    const valueFontSize = Math.round(13 * scale);

    // Calculate heights for each factor column
    const factorHeights = FACTOR_STRUCTURE.map(f => {
      const headerHeight = 30 * scale;
      const contentHeight = f.subfactors.length * itemHeight;
      return headerHeight + contentHeight;
    });

    // Row 1: Factors 1-4, Row 2: Factors 5-8
    const row1Height = Math.max(...factorHeights.slice(0, 4));
    const row2Height = Math.max(...factorHeights.slice(4, 8));

    const svgWidth = margin * 2 + colWidth * 4 + colGap * 3;
    const svgHeight = margin * 2 + titleHeight + row1Height + rowGap + row2Height;

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('xmlns', ns);

    // Title
    const titleText = createTextElement(svgWidth / 2, margin + 20 * scale, `${title} — ${selectedYear}`, {
      fontSize: titleFontSize,
      fontWeight: 700,
      fill: COLORS.text,
      'text-anchor': 'middle'
    });
    svg.appendChild(titleText);

    // Render each factor
    FACTOR_STRUCTURE.forEach((factorDef, index) => {
      const { factor, subfactors } = factorDef;
      const color = FACTOR_COLORS[factor];
      const factorLabel = FACTOR_SHORT_LABELS[factor];

      const row = index < 4 ? 0 : 1;
      const col = index % 4;

      const x = margin + col * (colWidth + colGap);
      const y = margin + titleHeight + (row === 0 ? 0 : row1Height + rowGap);

      // Factor header
      const headerText = createTextElement(x, y + 14 * scale, factorLabel, {
        fontSize: headerFontSize,
        fontWeight: 700,
        fill: color,
        dominantBaseline: 'middle'
      });
      svg.appendChild(headerText);

      // Header underline
      const underline = createSVGElement('line', {
        x1: x,
        y1: y + 28 * scale,
        x2: x + colWidth - 50 * scale,
        y2: y + 28 * scale,
        stroke: color,
        'stroke-width': 2.5 * scale
      });
      svg.appendChild(underline);

      // Subfactors
      subfactors.forEach((sf, sfIndex) => {
        const sfY = y + 38 * scale + sfIndex * itemHeight;
        const value = profileData[sf];
        const barWidth = value != null ? (colWidth - 55 * scale) * value : 0;

        // Label
        const label = createTextElement(x, sfY + 12 * scale, SUBFACTOR_SHORT_LABELS[sf], {
          fontSize: labelFontSize,
          fontWeight: 400,
          fill: COLORS.text,
          dominantBaseline: 'middle'
        });
        svg.appendChild(label);

        // Background bar
        const bgBar = createSVGElement('rect', {
          x: x,
          y: sfY + labelHeight,
          width: colWidth - 55 * scale,
          height: barHeight,
          fill: '#e8e8e8',
          rx: 3 * scale
        });
        svg.appendChild(bgBar);

        // Value bar
        if (value != null) {
          const valueBar = createSVGElement('rect', {
            x: x,
            y: sfY + labelHeight,
            width: barWidth,
            height: barHeight,
            fill: color,
            rx: 3 * scale
          });
          svg.appendChild(valueBar);
        }

        // Value text
        const valueText = createTextElement(x + colWidth - 45 * scale, sfY + labelHeight + barHeight / 2,
          value != null ? value.toFixed(2) : '—', {
          fontSize: valueFontSize,
          fontWeight: 600,
          fill: COLORS.text,
          dominantBaseline: 'middle'
        });
        svg.appendChild(valueText);
      });
    });

    // Embed fonts
    await embedFonts(svg);

    const suffix = format === 'bipanel' ? '_bipanel' : '';
    downloadSVGHelper(svg, `ROLI_Profile_${title.replace(/\s+/g, '_')}_${selectedYear}${suffix}.svg`);
  }

  return (
    <ChartCard
      title={title}
      subtitle={selectedYear}
      onExport={downloadSVG}
    >
      <div ref={chartRef} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        padding: '16px'
      }}>
        {FACTOR_STRUCTURE.map(({ factor, subfactors }) => (
          <FactorSection
            key={factor}
            factor={factor}
            subfactors={subfactors}
            data={profileData}
          />
        ))}
      </div>
    </ChartCard>
  );
}

CountryProfileChart.propTypes = {
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedRegion: PropTypes.string.isRequired,
  selectedCountry: PropTypes.string.isRequired,
  selectedYear: PropTypes.string.isRequired,
};

export default memo(CountryProfileChart);
