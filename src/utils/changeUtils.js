import { COLORS } from '../config';

/**
 * Get color scheme based on percentage change
 * @param {number|null} changePercent - The percentage change value
 * @returns {{ bg: string, accent: string, text: string }} Color scheme object
 */
export function getChangeColor(changePercent) {
  if (changePercent === null || changePercent === undefined || isNaN(changePercent)) {
    return { bg: '#f5f5f5', accent: '#9e9e9e', text: COLORS.muted };
  }

  if (Math.abs(changePercent) < 1) {
    // No significant change - neutral gray
    return { bg: '#f5f5f5', accent: '#9e9e9e', text: COLORS.muted };
  } else if (changePercent > 0) {
    // Positive change - green scale
    const intensity = Math.min(changePercent / 30, 1); // Max intensity at 30%
    return {
      bg: `rgba(76, 175, 80, ${0.08 + intensity * 0.12})`,
      accent: `rgb(${76 - intensity * 30}, ${175 - intensity * 30}, ${80 - intensity * 30})`,
      text: '#2e7d32'
    };
  } else {
    // Negative change - red scale
    const intensity = Math.min(Math.abs(changePercent) / 30, 1);
    return {
      bg: `rgba(244, 67, 54, ${0.08 + intensity * 0.12})`,
      accent: `rgb(${244 - intensity * 46}, ${67 - intensity * 27}, ${54 - intensity * 14})`,
      text: '#c62828'
    };
  }
}

/**
 * Get arrow symbol for change direction and magnitude
 * @param {number|null} changePercent - The percentage change value
 * @returns {string} Arrow symbol
 */
export function getChangeArrow(changePercent) {
  if (changePercent === null || changePercent === undefined || isNaN(changePercent)) {
    return '—';
  }
  if (Math.abs(changePercent) < 1) return '→';
  if (changePercent > 0) {
    return changePercent >= 10 ? '↑↑' : '↑';
  } else {
    return changePercent <= -10 ? '↓↓' : '↓';
  }
}

/**
 * Get sort bucket for change percentage (used for sorting cards)
 * @param {number|null} changePercent - The percentage change value
 * @returns {number} Sort bucket (0 = improved, 1 = neutral/null, 2 = declined)
 */
export function getChangeSortBucket(changePercent) {
  if (changePercent === null || changePercent === undefined || isNaN(changePercent)) return 1;
  if (changePercent > 1) return 0;
  if (changePercent < -1) return 2;
  return 1;
}
