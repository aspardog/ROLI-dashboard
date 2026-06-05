import { EU_COUNTRIES, EU_ENLARGEMENT_COUNTRIES } from '../config';

/**
 * Filter data by region, handling special cases like European Union and EU Enlargement
 * @param {Array} data - Array of data objects with 'region' and 'country' properties
 * @param {string} selectedRegion - The selected region value
 * @returns {Array} Filtered data
 */
export function filterByRegion(data, selectedRegion) {
  if (selectedRegion === 'global') {
    return data;
  }

  if (selectedRegion === 'European Union') {
    return data.filter(d => EU_COUNTRIES.includes(d.country));
  }

  if (selectedRegion === 'EU enlargement') {
    return data.filter(d => EU_ENLARGEMENT_COUNTRIES.includes(d.country));
  }

  return data.filter(d => d.region === selectedRegion);
}
