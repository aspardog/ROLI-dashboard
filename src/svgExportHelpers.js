import { COLORS } from './constants';
import { getEmbeddedFontCSS } from './svgExport';

/**
 * Creates an SVG element with specified attributes
 */
export function createSVGElement(tag, attrs) {
  const ns = 'http://www.w3.org/2000/svg';
  const element = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

/**
 * Creates a text element with content
 */
export function createTextElement(x, y, content, options = {}) {
  const {
    fill = COLORS.text,
    fontSize = 16,
    fontWeight = 500,
    fontFamily = "'Inter Tight', sans-serif",
    dominantBaseline = 'middle',
    ...otherAttrs
  } = options;

  const text = createSVGElement('text', {
    x,
    y,
    fill,
    'font-size': fontSize,
    'font-weight': fontWeight,
    'font-family': fontFamily,
    'dominant-baseline': dominantBaseline,
    ...otherAttrs
  });
  text.textContent = content;
  return text;
}

/**
 * Prepares SVG clone with proper dimensions and viewBox
 */
export function prepareSVGClone(svg, legendHeight = 60, legendPosition = 'top') {
  const bbox = svg.getBBox();
  const pad = 8;
  const ns = 'http://www.w3.org/2000/svg';

  const vbX = bbox.x - pad;
  const vbY = legendPosition === 'top' ? bbox.y - pad - legendHeight : bbox.y - pad;
  const vbW = bbox.width + pad * 2;
  const vbH = bbox.height + pad * 2 + legendHeight;

  const clone = svg.cloneNode(true);
  clone.setAttribute('width', vbW);
  clone.setAttribute('height', vbH);
  clone.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  clone.setAttribute('xmlns', ns);

  return { clone, vbX, vbY, vbW, vbH, bbox, ns };
}

/**
 * Cleans unnecessary attributes from SVG clone
 */
function cleanSVGClone(clone) {
  // Remove all data-* attributes
  clone.querySelectorAll('[data-name]').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // Remove unnecessary attributes from all elements
  clone.querySelectorAll('*').forEach(el => {
    el.removeAttribute('tabindex');
    el.removeAttribute('role');
    el.removeAttribute('focusable');
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('aria-')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // Remove empty style attributes
  clone.querySelectorAll('[style]').forEach(el => {
    if (el.getAttribute('style') === '' || el.getAttribute('style') === null) {
      el.removeAttribute('style');
    }
  });
}

/**
 * Embeds font CSS and applies to all text elements
 */
export async function embedFonts(clone) {
  const fontCSS = await getEmbeddedFontCSS();
  const ns = 'http://www.w3.org/2000/svg';
  const styleEl = document.createElementNS(ns, 'style');
  // Add font CSS plus global rule for all text elements
  styleEl.textContent = fontCSS + "\ntext { font-family: 'Inter Tight', sans-serif; }";
  clone.insertBefore(styleEl, clone.firstChild);

  // Remove inline font-family attributes to reduce file size
  clone.querySelectorAll('text').forEach(t => {
    t.removeAttribute('font-family');
    if (t.style.fontFamily) {
      t.style.fontFamily = '';
    }
  });

  // Clean unnecessary attributes
  cleanSVGClone(clone);
}

/**
 * Adds white background to SVG
 */
export function addWhiteBackground(clone, x, y, width, height) {
  const bg = createSVGElement('rect', { x, y, width, height, fill: 'white' });
  clone.insertBefore(bg, clone.firstChild);
}

/**
 * Creates a legend item with color indicator
 */
export function createLegendItem(x, y, color, label, type = 'box', options = {}) {
  const items = [];
  const centerY = y + (options.size || 18) / 2;

  if (type === 'box') {
    const size = options.size || 18;
    items.push(createSVGElement('rect', { x, y, width: size, height: size, fill: color, rx: 3 }));
    items.push(createTextElement(x + size + 6, centerY, label, options.textOptions));
  } else if (type === 'line') {
    const width = options.width || 30;
    const height = options.height || 4;
    items.push(createSVGElement('rect', { x, y: y + height / 2, width, height, fill: color, rx: 2 }));
    items.push(createTextElement(x + width + 6, centerY, label, options.textOptions));
  } else if (type === 'dashed-line') {
    const width = options.width || 30;
    items.push(createSVGElement('line', {
      x1: x,
      y1: centerY,
      x2: x + width,
      y2: centerY,
      stroke: color,
      'stroke-width': 2,
      'stroke-dasharray': '6 4'
    }));
    items.push(createTextElement(x + width + 6, centerY, label, options.textOptions));
  }

  return items;
}

/**
 * Optimizes SVG by reducing precision and cleaning unnecessary attributes
 */
function optimizeSVG(svgString) {
  // First, reduce decimal precision to 2 places for all numbers in attributes
  svgString = svgString.replace(/="(\d+\.\d{3,})"/g, (match, num) => {
    return '="' + parseFloat(num).toFixed(2) + '"';
  });

  // Compress hex colors from 6 to 3 digits when possible
  svgString = svgString.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');

  // Remove default attribute values - use more precise regex
  svgString = svgString.replace(/\s+opacity="1(?:\.0+)?"/g, '');
  svgString = svgString.replace(/\s+fill-opacity="1(?:\.0+)?"/g, '');
  svgString = svgString.replace(/\s+stroke-opacity="1(?:\.0+)?"/g, '');
  svgString = svgString.replace(/\s+stroke-width="1(?:\.0+)?"/g, '');
  svgString = svgString.replace(/\s+visibility="visible"/g, '');

  // Remove unnecessary whitespace between elements (before other optimizations)
  svgString = svgString.replace(/>\s+</g, '><');

  // Remove empty or default attributes
  svgString = svgString.replace(/\s+style=""/g, '');
  svgString = svgString.replace(/\s+class=""/g, '');
  svgString = svgString.replace(/\s+font-family=""/g, '');
  svgString = svgString.replace(/\s+transform=""/g, '');

  // Remove Recharts metadata and unnecessary attributes
  svgString = svgString.replace(/\s+data-[^=]*="[^"]*"/g, '');
  svgString = svgString.replace(/\s+tabindex="[^"]*"/g, '');
  svgString = svgString.replace(/\s+role="[^"]*"/g, '');
  svgString = svgString.replace(/\s+aria-[^=]*="[^"]*"/g, '');
  svgString = svgString.replace(/\s+focusable="[^"]*"/g, '');

  // Remove shape-rendering and text-rendering
  svgString = svgString.replace(/\s+shape-rendering="[^"]*"/g, '');
  svgString = svgString.replace(/\s+text-rendering="[^"]*"/g, '');

  // Remove identity transforms
  svgString = svgString.replace(/\s+transform="translate\(0(?:\.0+)?,?\s*0(?:\.0+)?\)"/g, '');
  svgString = svgString.replace(/\s+transform="scale\(1(?:\.0+)?,?\s*1(?:\.0+)?\)"/g, '');
  svgString = svgString.replace(/\s+transform="matrix\(1(?:\.0+)?,?\s*0(?:\.0+)?,?\s*0(?:\.0+)?,?\s*1(?:\.0+)?,?\s*0(?:\.0+)?,?\s*0(?:\.0+)?\)"/g, '');

  // Collapse multiple spaces
  svgString = svgString.replace(/\s{2,}/g, ' ');

  // Remove spaces before closing tags
  svgString = svgString.replace(/\s+>/g, '>');

  return svgString;
}

/**
 * Triggers SVG download
 */
export function downloadSVG(clone, filename) {
  let svgString = new XMLSerializer().serializeToString(clone);
  svgString = optimizeSVG(svgString);

  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/\s+/g, '_');
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Complete SVG export workflow
 */
export async function exportChartAsSVG(chartRef, filename, legendConfig) {
  const svg = chartRef.current?.querySelector('svg');
  if (!svg) return;

  const { clone, vbX, vbY, vbW, vbH } = prepareSVGClone(svg, legendConfig.height, legendConfig.position);

  await embedFonts(clone);
  addWhiteBackground(clone, vbX, vbY, vbW, vbH);

  // Add legend items
  if (legendConfig.items) {
    legendConfig.items.forEach(item => {
      const elements = createLegendItem(
        item.x,
        item.y,
        item.color,
        item.label,
        item.type,
        item.options
      );
      elements.forEach(el => clone.appendChild(el));
    });
  }

  downloadSVG(clone, filename);
}
