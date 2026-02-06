import { useState, useEffect, useMemo } from 'react';
import { ACTIVE_YEAR, REGION_OPTIONS, VARIABLE_OPTIONS, SUBFACTOR_GROUPS, COLORS } from './src/constants';
import TopBottomChart from './src/TopBottomChart';
import TimeSeriesChart from './src/TimeSeriesChart';

export default function ROLIDashboard() {
  const [allData, setAllData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [selectedVariable, setSelectedVariable] = useState('roli');
  const [selectedCountry, setSelectedCountry] = useState('__regional_avg__');
  const [chartType, setChartType] = useState('timeseries');
  const [selectedYear, setSelectedYear] = useState('2025');
  const selectedLabel = VARIABLE_OPTIONS.find(opt => opt.value === selectedVariable)?.label || selectedVariable;
  const regionLabel = REGION_OPTIONS.find(opt => opt.value === selectedRegion)?.label || selectedRegion;

  useEffect(() => {
    fetch('/roli_data.json')
      .then(res => res.json())
      .then(json => setAllData(json));
  }, []);

  const roliData = useMemo(() => {
    const byYear = allData.filter(d => d.year === ACTIVE_YEAR);
    return selectedRegion === 'global' ? byYear : byYear.filter(d => d.region === selectedRegion);
  }, [allData, selectedRegion]);

  const availableCountries = useMemo(() => {
    const set = new Set(roliData.map(d => d.country));
    return [...set].sort();
  }, [roliData]);

  useEffect(() => {
    if (selectedCountry !== '__regional_avg__' && !availableCountries.includes(selectedCountry)) {
      setSelectedCountry(availableCountries[0] || '');
    }
  }, [availableCountries, selectedCountry]);

  if (roliData.length === 0) {
    return <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: COLORS.muted, fontSize: '16px' }}>Loading data…</p>
    </div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, fontFamily: "'Inter Tight', sans-serif", padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div style={{ width: '6px', height: '48px', backgroundColor: COLORS.top5, borderRadius: '3px' }} />
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: COLORS.text, margin: 0, letterSpacing: '-0.5px' }}>Rule of Law Index – Data Visualization Tool</h1>
        </div>

      </div>

      {/* Controls */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 40px', backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Region</label>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
            {REGION_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Variable</label>
          <select value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
            <optgroup label="Overall Index">
              {VARIABLE_OPTIONS.filter(o => o.category === 'general').map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </optgroup>
            <optgroup label="Factors">
              {VARIABLE_OPTIONS.filter(o => o.category === 'factor').map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </optgroup>
            {SUBFACTOR_GROUPS.map(group => (
              <optgroup key={group.category} label={group.label}>
                {VARIABLE_OPTIONS.filter(o => o.category === group.category).map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
              </optgroup>
            ))}
          </select>
        </div>
        {chartType === 'topbottom' && (
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
            </select>
          </div>
        )}
        {chartType === 'timeseries' && (
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Country</label>
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
              <option value="__regional_avg__">{selectedRegion === 'global' ? 'Global Average' : 'Regional Average'}</option>
              {availableCountries.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        )}
      </div>

      {/* Chart type toggle */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 24px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setChartType('timeseries')}
          style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: chartType === 'timeseries' ? COLORS.top5 : 'white', color: chartType === 'timeseries' ? 'white' : COLORS.muted, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >Time Series</button>
        <button
          onClick={() => setChartType('topbottom')}
          style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: chartType === 'topbottom' ? COLORS.top5 : 'white', color: chartType === 'topbottom' ? 'white' : COLORS.muted, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >Top & Bottom Performers</button>
      </div>

      {/* Charts */}
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {chartType === 'topbottom' && <TopBottomChart allData={allData} selectedRegion={selectedRegion} selectedYear={selectedYear} variable={selectedVariable} label={selectedLabel} regionLabel={regionLabel} />}
        {chartType === 'timeseries' && selectedCountry && <TimeSeriesChart allData={allData} country={selectedCountry} variable={selectedVariable} label={selectedLabel} selectedRegion={selectedRegion} regionLabel={regionLabel} />}
      </div>

      {/* Footer */}
      <div style={{ maxWidth: '1100px', margin: '24px auto 0', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: COLORS.muted }}>Source: World Justice Project — Rule of Law Index {chartType === 'timeseries' ? '2019–2025' : selectedYear}</p>
      </div>
    </div>
  );
}
