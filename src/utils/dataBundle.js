export function normalizeDataBundle(json) {
  if (Array.isArray(json)) {
    return {
      entries: json,
      averages: { global: {}, regions: {} },
      metadata: {
        years: [...new Set(json.map(entry => entry.year))].sort(),
        regions: [...new Set(json.map(entry => entry.region))].sort(),
        countriesByYear: {},
        regionCountriesByYear: {},
        countryRegionMap: Object.fromEntries(
          [...new Map(json.map(entry => [entry.country, entry.region])).entries()]
        ),
      },
    };
  }

  return {
    entries: json.entries || [],
    averages: json.averages || { global: {}, regions: {} },
    metadata: json.metadata || {
      years: [],
      regions: [],
      countriesByYear: {},
      regionCountriesByYear: {},
      countryRegionMap: {},
    },
  };
}

export function getAverageProfile(averages, region, year) {
  if (!averages) return null;
  if (region === 'global') return averages.global?.[year] || null;
  return averages.regions?.[region]?.[year] || null;
}

export function getCountriesForRegionYear(metadata, region, year) {
  if (!metadata) return [];
  return metadata.regionCountriesByYear?.[region]?.[year] || [];
}

export function getCountryRegion(metadata, country) {
  return metadata?.countryRegionMap?.[country] || null;
}
