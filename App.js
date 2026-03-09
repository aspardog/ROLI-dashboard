import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { ACTIVE_YEAR, REGION_OPTIONS, VARIABLE_OPTIONS, SUBFACTOR_GROUPS, COLORS } from './src/constants';
import InfoModal from './src/InfoModal';
import HowToUseModal from './src/HowToUseModal';
import './src/responsive.css';


// Lazy load chart components for better initial bundle size
const TopBottomChart = lazy(() => import('./src/TopBottomChart'));
const TimeSeriesChart = lazy(() => import('./src/TimeSeriesChart'));
const RadarChartView = lazy(() => import('./src/RadarChartView'));
const FactorComparisonChart = lazy(() => import('./src/FactorComparisonChart'));
const CountryProfileChart = lazy(() => import('./src/CountryProfileChart'));

export default function ROLIDashboard() {
  const [allData, setAllData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [selectedVariable, setSelectedVariable] = useState('roli');
  const [selectedCountry, setSelectedCountry] = useState('__regional_avg__');
  const [showRegionalAvg, setShowRegionalAvg] = useState(false);
  const [showGlobalAvg, setShowGlobalAvg] = useState(false);
  const [chartType, setChartType] = useState('timeseries');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedRadarCountry, setSelectedRadarCountry] = useState('__regional_avg__');
  const [selectedProfileCountry, setSelectedProfileCountry] = useState('__regional_avg__');
  const [selectedProfileRegion, setSelectedProfileRegion] = useState('global');
  const [selectedFactors, setSelectedFactors] = useState([
    { value: 'f1', label: 'F1 - Constraints on Government Power' },
    { value: 'f2', label: 'F2 - Absence of Corruption' },
    { value: 'f3', label: 'F3 - Open Government' },
    { value: 'f4', label: 'F4 - Fundamental Rights' },
    { value: 'f5', label: 'F5 - Order and Security' },
    { value: 'f6', label: 'F6 - Regulatory Enforcement' },
    { value: 'f7', label: 'F7 - Civil Justice' },
    { value: 'f8', label: 'F8 - Criminal Justice' }
  ]);
  const [selectedRadarYears, setSelectedRadarYears] = useState(['2025', '2024', '2023']);
  const [expandedFactorGroups, setExpandedFactorGroups] = useState({ general: true, factor: true });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isHowToUseModalOpen, setIsHowToUseModalOpen] = useState(false);
  const selectedLabel = VARIABLE_OPTIONS.find(opt => opt.value === selectedVariable)?.label || selectedVariable;
  const regionLabel = REGION_OPTIONS.find(opt => opt.value === selectedRegion)?.label || selectedRegion;

  useEffect(() => {
    setIsLoadingData(true);
    fetch('/roli_data.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load data');
        return res.json();
      })
      .then(json => {
        setAllData(json);
        setIsLoadingData(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setDataError(err.message);
        setIsLoadingData(false);
      });
  }, []);

  const roliData = useMemo(() => {
    const byYear = allData.filter(d => d.year === ACTIVE_YEAR);
    return selectedRegion === 'global' ? byYear : byYear.filter(d => d.region === selectedRegion);
  }, [allData, selectedRegion]);

  const availableCountries = useMemo(() => {
    const set = new Set(roliData.map(d => d.country));
    return [...set].sort();
  }, [roliData]);

  // Detect the region of the selected country from the data
  const selectedCountryRegion = useMemo(() => {
    if (selectedCountry === '__regional_avg__') return null;
    const countryData = allData.find(d => d.country === selectedCountry);
    return countryData?.region || null;
  }, [allData, selectedCountry]);

  // Available countries for profile chart (based on profile region selection)
  const profileAvailableCountries = useMemo(() => {
    const byYear = allData.filter(d => d.year === ACTIVE_YEAR);
    const filtered = selectedProfileRegion === 'global' ? byYear : byYear.filter(d => d.region === selectedProfileRegion);
    const set = new Set(filtered.map(d => d.country));
    return [...set].sort();
  }, [allData, selectedProfileRegion]);

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

  // Show loading state
  if (isLoadingData) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, fontFamily: "'Inter Tight', sans-serif", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text, marginBottom: '12px' }}>Loading ROLI Data...</div>
          <div style={{ fontSize: '14px', color: COLORS.muted }}>Please wait while we load the data</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (dataError) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, fontFamily: "'Inter Tight', sans-serif", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '24px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#c0392b', marginBottom: '12px' }}>Error Loading Data</div>
          <div style={{ fontSize: '14px', color: COLORS.muted, marginBottom: '16px' }}>{dataError}</div>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600', color: 'white', backgroundColor: COLORS.top5, border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', backgroundColor: COLORS.background, fontFamily: "'Inter Tight', sans-serif" }}>
      {/* WJP Navigation Bar */}
      <div className="wjp-secondary-nav" style={{ backgroundColor: COLORS.secondary, padding: '12px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <span style={{ color: COLORS.white, fontSize: '15px', fontWeight: '500', opacity: 0.9 }}>WJP Rule of Law Index®</span>
            <nav style={{ display: 'flex', gap: '24px' }}>
              <button onClick={() => setIsInfoModalOpen(true)} style={{ background: 'none', border: 'none', color: COLORS.white, fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: 0 }}>About</button>
              <button onClick={() => setIsHowToUseModalOpen(true)} style={{ background: 'none', border: 'none', color: COLORS.white, fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: 0 }}>How to Use</button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 24px' }}>
        {/* Header Banner */}
        <div className="dashboard-header" style={{ maxWidth: '1100px', margin: '0 auto 32px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '400',
            color: COLORS.primary,
            margin: '0 0 16px 0',
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: '1.3'
          }}>
            Rule of Law Index
          </h1>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '400',
            color: COLORS.primary,
            margin: '0 0 20px 0',
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: 'italic'
          }}>
            Data Visualization Tool
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.7', color: COLORS.text, margin: '0 auto', maxWidth: '700px' }}>
            Interactive dashboard for the <em>WJP Rule of Law Index®</em>. Explore results and download publication-ready visuals for presentations and reports.
          </p>
        </div>

      {/* Info Modals */}
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
      <HowToUseModal isOpen={isHowToUseModalOpen} onClose={() => setIsHowToUseModalOpen(false)} />

      {/* Controls */}
      {chartType !== 'radar' && chartType !== 'factors' && chartType !== 'profile' && (
        <div className="controls-container" style={{ maxWidth: '1100px', margin: '0 auto 40px', backgroundColor: COLORS.backgroundAlt, borderRadius: '8px', padding: '24px', border: '1px solid #e5e5e5', display: 'flex', gap: '24px' }}>
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
            <>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Country</label>
                <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
                  <option value="__regional_avg__">{selectedRegion === 'global' ? 'Global Average' : 'Regional Average'}</option>
                  {availableCountries.map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              {selectedCountry !== '__regional_avg__' && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Reference Lines</label>
                  {selectedCountryRegion && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={showRegionalAvg}
                        onChange={(e) => setShowRegionalAvg(e.target.checked)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '14px', color: COLORS.text }}>Regional Average</span>
                    </label>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showGlobalAvg}
                      onChange={(e) => setShowGlobalAvg(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '14px', color: COLORS.text }}>Global Average</span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Factor Comparison Controls */}
      {chartType === 'factors' && (
        <div className="controls-container" style={{ maxWidth: '1100px', margin: '0 auto 40px', backgroundColor: COLORS.backgroundAlt, borderRadius: '8px', padding: '24px', border: '1px solid #e5e5e5', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '300px' }}>
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
        </div>
      )}

      {/* Chart type toggle */}
      <div className="chart-toggle-container" style={{ maxWidth: '1100px', margin: '0 auto 24px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => setChartType('timeseries')}
          style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', borderRadius: '6px', border: chartType === 'timeseries' ? 'none' : `2px solid ${COLORS.primary}`, cursor: 'pointer', backgroundColor: chartType === 'timeseries' ? COLORS.primary : 'white', color: chartType === 'timeseries' ? 'white' : COLORS.primary, transition: 'all 0.2s' }}
        >Time Series</button>
        <button
          onClick={() => setChartType('profile')}
          style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', borderRadius: '6px', border: chartType === 'profile' ? 'none' : `2px solid ${COLORS.primary}`, cursor: 'pointer', backgroundColor: chartType === 'profile' ? COLORS.primary : 'white', color: chartType === 'profile' ? 'white' : COLORS.primary, transition: 'all 0.2s' }}
        >Country Profile</button>
        <button
          onClick={() => setChartType('topbottom')}
          style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', borderRadius: '6px', border: chartType === 'topbottom' ? 'none' : `2px solid ${COLORS.primary}`, cursor: 'pointer', backgroundColor: chartType === 'topbottom' ? COLORS.primary : 'white', color: chartType === 'topbottom' ? 'white' : COLORS.primary, transition: 'all 0.2s' }}
        >Top & Bottom Performers</button>
        <button
          onClick={() => setChartType('radar')}
          style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', borderRadius: '6px', border: chartType === 'radar' ? 'none' : `2px solid ${COLORS.primary}`, cursor: 'pointer', backgroundColor: chartType === 'radar' ? COLORS.primary : 'white', color: chartType === 'radar' ? 'white' : COLORS.primary, transition: 'all 0.2s' }}
        >Radar Chart</button>
        <button
          onClick={() => setChartType('factors')}
          style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', borderRadius: '6px', border: chartType === 'factors' ? 'none' : `2px solid ${COLORS.primary}`, cursor: 'pointer', backgroundColor: chartType === 'factors' ? COLORS.primary : 'white', color: chartType === 'factors' ? 'white' : COLORS.primary, transition: 'all 0.2s' }}
        >Factor Comparison</button>
      </div>

      {/* Charts */}
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <p style={{ fontSize: '16px', color: COLORS.muted }}>Loading chart...</p>
          </div>
        }>
          {chartType === 'topbottom' && <TopBottomChart allData={allData} selectedRegion={selectedRegion} selectedYear={selectedYear} variable={selectedVariable} label={selectedLabel} regionLabel={regionLabel} />}
          {chartType === 'timeseries' && selectedCountry && <TimeSeriesChart allData={allData} country={selectedCountry} variable={selectedVariable} label={selectedLabel} selectedRegion={selectedRegion} regionLabel={regionLabel} showRegionalAvg={showRegionalAvg} showGlobalAvg={showGlobalAvg} countryRegion={selectedCountryRegion} />}
        {chartType === 'factors' && (
          <FactorComparisonChart
            allData={allData}
            selectedRegion={selectedRegion}
            selectedYear={selectedYear}
            availableCountries={availableCountries}
          />
        )}
        {chartType === 'radar' && (
          <>
            {/* Radar Controls - Region, Country, Years - ABOVE CHART */}
            <div className="radar-controls-top chart-card" style={{ backgroundColor: COLORS.backgroundAlt, borderRadius: '8px', padding: '24px', border: '1px solid #e5e5e5', marginBottom: '24px' }}>
              <div className="radar-controls-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Region</label>
                  <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
                    {REGION_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Country/Region</label>
                  <select value={selectedRadarCountry} onChange={(e) => setSelectedRadarCountry(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
                    <option value="__regional_avg__">{selectedRegion === 'global' ? 'Global Average' : 'Regional Average'}</option>
                    {availableCountries.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Years to Compare</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {['2019', '2020', '2021', '2022', '2023', '2024', '2025'].map(year => (
                    <label key={year} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedRadarYears.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRadarYears([...selectedRadarYears, year].sort().reverse());
                          } else {
                            setSelectedRadarYears(selectedRadarYears.filter(y => y !== year));
                          }
                        }}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '14px', color: COLORS.text }}>{year}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <RadarChartView
              allData={allData}
              selectedRegion={selectedRegion}
              selectedCountry={selectedRadarCountry}
              selectedFactors={selectedFactors}
              selectedYears={selectedRadarYears}
              countryLabel={selectedRadarCountry === '__regional_avg__' ?
                (selectedRegion === 'global' ? 'Global Average' : regionLabel + ' Average') :
                selectedRadarCountry}
            />

            {/* Factors & Subfactors - BELOW CHART */}
            <div className="radar-factors-panel chart-card" style={{ backgroundColor: COLORS.backgroundAlt, borderRadius: '8px', padding: '24px', border: '1px solid #e5e5e5', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Factors & Subfactors to Compare
                </label>
                <span style={{ fontSize: '13px', color: COLORS.muted, fontWeight: '500' }}>
                  {selectedFactors.length} selected
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Overall Index */}
                {(() => {
                  const groupKey = 'general';
                  const options = VARIABLE_OPTIONS.filter(o => o.category === groupKey);
                  const isExpanded = expandedFactorGroups[groupKey];
                  const selectedCount = options.filter(o => selectedFactors.some(f => f.value === o.value)).length;

                  return (
                    <div style={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: isExpanded ? '#fafafa' : 'white', cursor: 'pointer', userSelect: 'none' }} onClick={() => setExpandedFactorGroups({ ...expandedFactorGroups, [groupKey]: !isExpanded })}>
                        <span style={{ fontSize: '18px', marginRight: '8px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: COLORS.text }}>Overall Index</span>
                        <span style={{ fontSize: '12px', color: COLORS.muted }}>{selectedCount} / {options.length}</span>
                      </div>
                      {isExpanded && (
                        <div style={{ padding: '12px 16px 12px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px', borderTop: '1px solid #f0f0f0' }}>
                          {options.map(factor => (
                            <label key={factor.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0' }}>
                              <input type="checkbox" checked={selectedFactors.some(f => f.value === factor.value)} onChange={(e) => { if (e.target.checked) { setSelectedFactors([...selectedFactors, factor]); } else { setSelectedFactors(selectedFactors.filter(f => f.value !== factor.value)); } }} style={{ cursor: 'pointer', width: '14px', height: '14px' }} />
                              <span style={{ fontSize: '14px', color: COLORS.text }}>{factor.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Main Factors */}
                {(() => {
                  const groupKey = 'factor';
                  const options = VARIABLE_OPTIONS.filter(o => o.category === groupKey);
                  const isExpanded = expandedFactorGroups[groupKey];
                  const selectedCount = options.filter(o => selectedFactors.some(f => f.value === o.value)).length;

                  return (
                    <div style={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: isExpanded ? '#fafafa' : 'white', cursor: 'pointer', userSelect: 'none' }} onClick={() => setExpandedFactorGroups({ ...expandedFactorGroups, [groupKey]: !isExpanded })}>
                        <span style={{ fontSize: '18px', marginRight: '8px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: COLORS.text }}>Factors</span>
                        <span style={{ fontSize: '12px', color: COLORS.muted }}>{selectedCount} / {options.length}</span>
                      </div>
                      {isExpanded && (
                        <div style={{ padding: '12px 16px 12px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px', borderTop: '1px solid #f0f0f0' }}>
                          {options.map(factor => (
                            <label key={factor.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0' }}>
                              <input type="checkbox" checked={selectedFactors.some(f => f.value === factor.value)} onChange={(e) => { if (e.target.checked) { setSelectedFactors([...selectedFactors, factor]); } else { setSelectedFactors(selectedFactors.filter(f => f.value !== factor.value)); } }} style={{ cursor: 'pointer', width: '14px', height: '14px' }} />
                              <span style={{ fontSize: '14px', color: COLORS.text }}>{factor.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Subfactors by group */}
                {SUBFACTOR_GROUPS.map(group => {
                  const groupKey = group.category;
                  const options = VARIABLE_OPTIONS.filter(o => o.category === groupKey);
                  const isExpanded = expandedFactorGroups[groupKey];
                  const selectedCount = options.filter(o => selectedFactors.some(f => f.value === o.value)).length;

                  return (
                    <div key={groupKey} style={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: isExpanded ? '#fafafa' : 'white', cursor: 'pointer', userSelect: 'none' }} onClick={() => setExpandedFactorGroups({ ...expandedFactorGroups, [groupKey]: !isExpanded })}>
                        <span style={{ fontSize: '18px', marginRight: '8px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: COLORS.text }}>{group.label} — Subfactors</span>
                        <span style={{ fontSize: '12px', color: COLORS.muted }}>{selectedCount} / {options.length}</span>
                      </div>
                      {isExpanded && (
                        <div style={{ padding: '12px 16px 12px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px', borderTop: '1px solid #f0f0f0' }}>
                          {options.map(factor => (
                            <label key={factor.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0' }}>
                              <input type="checkbox" checked={selectedFactors.some(f => f.value === factor.value)} onChange={(e) => { if (e.target.checked) { setSelectedFactors([...selectedFactors, factor]); } else { setSelectedFactors(selectedFactors.filter(f => f.value !== factor.value)); } }} style={{ cursor: 'pointer', width: '14px', height: '14px' }} />
                              <span style={{ fontSize: '13px', color: COLORS.text }}>{factor.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        {chartType === 'profile' && (
          <>
            {/* Profile Controls */}
            <div className="profile-controls chart-card" style={{ backgroundColor: COLORS.backgroundAlt, borderRadius: '8px', padding: '24px', border: '1px solid #e5e5e5', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Region</label>
                  <select value={selectedProfileRegion} onChange={(e) => { setSelectedProfileRegion(e.target.value); setSelectedProfileCountry('__regional_avg__'); }} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
                    {REGION_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Country/Region</label>
                  <select value={selectedProfileCountry} onChange={(e) => setSelectedProfileCountry(e.target.value)} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', backgroundColor: 'white', color: COLORS.text, cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
                    <option value="__regional_avg__">{selectedProfileRegion === 'global' ? 'Global Average' : 'Regional Average'}</option>
                    {profileAvailableCountries.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Chart */}
            <CountryProfileChart
              allData={allData}
              selectedRegion={selectedProfileRegion}
              selectedCountry={selectedProfileCountry}
              selectedYear={ACTIVE_YEAR}
            />
          </>
        )}
        </Suspense>
      </div>

      {/* Footer */}
      <div className="dashboard-footer" style={{ maxWidth: '1100px', margin: '40px auto 0', textAlign: 'center', paddingBottom: '40px' }}>
        <p style={{ fontSize: '13px', color: COLORS.muted, marginBottom: '8px' }}>
          Source: World Justice Project — Rule of Law Index® {
            chartType === 'timeseries' ? '2019–2025' :
            chartType === 'radar' ? [...selectedRadarYears].sort().join(', ') :
            chartType === 'profile' ? ACTIVE_YEAR :
            chartType === 'factors' ? selectedYear :
            selectedYear
          }
        </p>
        <p style={{ fontSize: '12px', color: COLORS.muted }}>
          © {new Date().getFullYear()} World Justice Project. All rights reserved.
        </p>
      </div>
      </div>{/* Close main content padding div */}
    </div>
  );
}
