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

// Tab configuration for chart type switcher
const CHART_TABS = [
  { key: 'timeseries', label: 'TIME SERIES' },
  { key: 'profile', label: 'COUNTRY PROFILES' },
  { key: 'topbottom', label: 'TOP & BOTTOM PERFORMERS' },
  { key: 'radar', label: 'RADAR CHART' },
  { key: 'factors', label: 'FACTOR COMPARISON' }
];

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
  const [yearRange, setYearRange] = useState([2020, 2025]); // New: year range for time series
  const [selectedRadarCountry, setSelectedRadarCountry] = useState('__regional_avg__');
  const [selectedProfileCountry, setSelectedProfileCountry] = useState('__regional_avg__');
  const [selectedProfileRegion, setSelectedProfileRegion] = useState('global');
  const [radarYearsExpanded, setRadarYearsExpanded] = useState(true);
  const [selectedRadarYears, setSelectedRadarYears] = useState(['2025']); // Multiple years for comparison
  const [selectedRadarEntity, setSelectedRadarEntity] = useState('__region_global'); // Single entity for radar chart
  const [selectedRadarFactors, setSelectedRadarFactors] = useState(['roli', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']); // Factors/subfactors for radar
  const [radarFactorsExpanded, setRadarFactorsExpanded] = useState(true); // Accordion state for factors section
  const [expandedRadarFactorGroups, setExpandedRadarFactorGroups] = useState({}); // Accordion state for subfactor groups
  const [factorCompareCountries, setFactorCompareCountries] = useState(['__region_global']); // Countries/regions for Factor Comparison
  const [expandedFactorRegions, setExpandedFactorRegions] = useState({}); // Accordion state for Factor Comparison country selector
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
      {/* WJP Navigation Bar - Purple */}
      <div className="wjp-nav" style={{ backgroundColor: COLORS.primary, padding: '14px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: COLORS.white, fontSize: '18px', fontWeight: '600' }}>Rule of Law Index®</span>
          <nav style={{ display: 'flex', gap: '32px' }}>
            <button onClick={() => setIsInfoModalOpen(true)} style={{ background: 'none', border: 'none', color: COLORS.white, fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ABOUT</button>
            <button onClick={() => setIsHowToUseModalOpen(true)} style={{ background: 'none', border: 'none', color: COLORS.white, fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>HOW TO USE IT</button>
          </nav>
        </div>
      </div>

      {/* Info Modals */}
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
      <HowToUseModal isOpen={isHowToUseModalOpen} onClose={() => setIsHowToUseModalOpen(false)} />

      {/* Main Content */}
      <div style={{ padding: '32px 24px' }}>
        {/* Header Banner */}
        <div className="dashboard-header" style={{ maxWidth: '1100px', margin: '0 auto 32px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: COLORS.primary,
            margin: '0 0 12px 0',
            fontFamily: "'Inter Tight', sans-serif",
            lineHeight: '1.2'
          }}>
            WJP Rule of Law Index® dashboard
          </h1>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: COLORS.muted, margin: '0 auto', maxWidth: '600px' }}>
            Explore results and download publication-ready visuals for presentations and reports.
          </p>
        </div>

        {/* Chart Type Tabs */}
        <div className="chart-tabs" style={{ maxWidth: '1100px', margin: '0 auto 32px', display: 'flex', justifyContent: 'center', gap: '0' }}>
          {CHART_TABS.map((tab, index) => (
            <button
              key={tab.key}
              onClick={() => setChartType(tab.key)}
              style={{
                padding: '14px 24px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                border: '1px solid #e5e5e5',
                borderLeft: index === 0 ? '1px solid #e5e5e5' : 'none',
                backgroundColor: chartType === tab.key ? COLORS.primary : 'white',
                color: chartType === tab.key ? 'white' : COLORS.text,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

      {/* Two-Column Layout: Sidebar + Chart */}
      <div className="dashboard-main-layout" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '32px' }}>

        {/* Left Sidebar - Controls */}
        <div className="controls-sidebar" style={{ width: '280px', flexShrink: 0 }}>

          {/* Time Series Controls */}
          {chartType === 'timeseries' && (
            <>
              {/* Region Dropdown */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Region</label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
                    {REGION_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>

              {/* Country Dropdown */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Country</label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
                    <option value="__regional_avg__">{selectedRegion === 'global' ? 'Global Average' : 'Regional Average'}</option>
                    {availableCountries.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>

              {/* Factor and Subfactor Dropdown */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Factor and Subfactor</label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
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
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>

              {/* Time Period Range Slider - Start year movable, end year fixed at 2025 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Time Period</label>
                <div style={{ padding: '8px 0' }}>
                  {/* Slider Track */}
                  <div style={{ position: 'relative', height: '4px', background: '#e5e5e5', borderRadius: '2px', marginBottom: '8px' }}>
                    {/* Purple filled portion from start year to 2025 */}
                    <div style={{
                      position: 'absolute',
                      left: `${((yearRange[0] - 2020) / 5) * 100}%`,
                      right: '0%',
                      height: '100%',
                      background: COLORS.primary,
                      borderRadius: '2px'
                    }} />
                    {/* Single slider for start year */}
                    <input
                      type="range"
                      min="2020"
                      max="2024"
                      value={yearRange[0]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setYearRange([val, 2025]);
                      }}
                      style={{ position: 'absolute', width: '100%', height: '20px', top: '-8px', opacity: 0, cursor: 'pointer', zIndex: 2 }}
                    />
                    {/* Visual handle for start year */}
                    <div style={{ position: 'absolute', left: `calc(${((yearRange[0] - 2020) / 5) * 100}% - 8px)`, top: '-6px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.primary, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', cursor: 'pointer' }} />
                    {/* Fixed indicator for 2025 */}
                    <div style={{ position: 'absolute', right: '-8px', top: '-6px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.primary, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  {/* Year labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '13px', color: COLORS.text, fontWeight: '500' }}>{yearRange[0]}</span>
                    <span style={{ fontSize: '13px', color: COLORS.text, fontWeight: '500' }}>2025</span>
                  </div>
                </div>
              </div>

              {/* Reference Lines */}
              {selectedCountry !== '__regional_avg__' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Reference Lines</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={showGlobalAvg} onChange={(e) => setShowGlobalAvg(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: COLORS.primary }} />
                      <span style={{ fontSize: '14px', color: COLORS.text }}>Global</span>
                    </label>
                    {selectedCountryRegion && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={showRegionalAvg} onChange={(e) => setShowRegionalAvg(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: COLORS.primary }} />
                        <span style={{ fontSize: '14px', color: COLORS.text }}>{regionLabel}</span>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Top & Bottom Controls */}
          {chartType === 'topbottom' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Region</label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
                    {REGION_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Variable</label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
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
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Year</label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                  </select>
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Profile Controls */}
          {chartType === 'profile' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Region</label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedProfileRegion} onChange={(e) => { setSelectedProfileRegion(e.target.value); setSelectedProfileCountry('__regional_avg__'); }} style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
                    {REGION_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Country</label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedProfileCountry} onChange={(e) => setSelectedProfileCountry(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
                    <option value="__regional_avg__">{selectedProfileRegion === 'global' ? 'Global Average' : 'Regional Average'}</option>
                    {profileAvailableCountries.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Factor Comparison Controls */}
          {chartType === 'factors' && (
            <>
              {/* Year Dropdown */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Year</label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>

              {/* Categories to Compare */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Categories to Compare</label>

                {/* Global Average */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={factorCompareCountries.includes('__region_global')}
                    onChange={(e) => {
                      if (e.target.checked && factorCompareCountries.length < 5) {
                        setFactorCompareCountries([...factorCompareCountries, '__region_global']);
                      } else if (!e.target.checked) {
                        setFactorCompareCountries(factorCompareCountries.filter(c => c !== '__region_global'));
                      }
                    }}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: COLORS.primary }}
                  />
                  <span style={{ fontSize: '14px', color: COLORS.primary, fontWeight: '600' }}>Global Average</span>
                </label>

                {/* Regions with expandable countries */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {REGION_OPTIONS.filter(r => r.value !== 'global').map(region => {
                    const regionKey = `__region_${region.value}`;
                    const regionCountries = allData.filter(d => d.year === selectedYear && d.region === region.value).map(d => d.country).filter((v, i, a) => a.indexOf(v) === i).sort();
                    const isExpanded = expandedFactorRegions[region.value];
                    const isRegionSelected = factorCompareCountries.includes(regionKey);

                    return (
                      <div key={region.value}>
                        {/* Region Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isExpanded ? '8px' : '0' }}>
                          <input
                            type="checkbox"
                            checked={isRegionSelected}
                            onChange={(e) => {
                              if (e.target.checked && factorCompareCountries.length < 5) {
                                setFactorCompareCountries([...factorCompareCountries, regionKey]);
                              } else if (!e.target.checked) {
                                setFactorCompareCountries(factorCompareCountries.filter(c => c !== regionKey));
                              }
                            }}
                            disabled={!isRegionSelected && factorCompareCountries.length >= 5}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: COLORS.primary }}
                          />
                          <span
                            onClick={() => setExpandedFactorRegions({ ...expandedFactorRegions, [region.value]: !isExpanded })}
                            style={{ flex: 1, fontSize: '14px', color: COLORS.primary, fontWeight: '500', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {region.label}
                          </span>
                          <span
                            onClick={() => setExpandedFactorRegions({ ...expandedFactorRegions, [region.value]: !isExpanded })}
                            style={{ fontSize: '14px', color: COLORS.primary, cursor: 'pointer', fontWeight: '300' }}
                          >
                            {isExpanded ? '−' : '+'}
                          </span>
                        </div>

                        {/* Countries in Region */}
                        {isExpanded && (
                          <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                            {regionCountries.map(country => (
                              <label key={country} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: factorCompareCountries.length >= 5 && !factorCompareCountries.includes(country) ? 'not-allowed' : 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={factorCompareCountries.includes(country)}
                                  onChange={(e) => {
                                    if (e.target.checked && factorCompareCountries.length < 5) {
                                      setFactorCompareCountries([...factorCompareCountries, country]);
                                    } else if (!e.target.checked) {
                                      setFactorCompareCountries(factorCompareCountries.filter(c => c !== country));
                                    }
                                  }}
                                  disabled={!factorCompareCountries.includes(country) && factorCompareCountries.length >= 5}
                                  style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: COLORS.primary }}
                                />
                                <span style={{ fontSize: '13px', color: factorCompareCountries.length >= 5 && !factorCompareCountries.includes(country) ? COLORS.muted : COLORS.text }}>{country}</span>
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

          {/* Radar Controls */}
          {chartType === 'radar' && (
            <>
              {/* Region Dropdown */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Region</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedRadarEntity.startsWith('__region_') ? selectedRadarEntity.replace('__region_', '') : (() => {
                      // Find the region of the selected country
                      const countryData = allData.find(d => d.country === selectedRadarEntity);
                      return countryData?.region || 'global';
                    })()}
                    onChange={(e) => {
                      const region = e.target.value;
                      if (region === 'global') {
                        setSelectedRadarEntity('__region_global');
                      } else {
                        setSelectedRadarEntity(`__region_${region}`);
                      }
                    }}
                    style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}
                  >
                    {REGION_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>

              {/* Country Dropdown */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Country</label>
                <div style={{ position: 'relative' }}>
                  {(() => {
                    const currentRegion = selectedRadarEntity.startsWith('__region_')
                      ? selectedRadarEntity.replace('__region_', '')
                      : (() => {
                          const countryData = allData.find(d => d.country === selectedRadarEntity);
                          return countryData?.region || 'global';
                        })();
                    const radarCountries = currentRegion === 'global'
                      ? [...new Set(allData.filter(d => d.year === '2025').map(d => d.country))].sort()
                      : [...new Set(allData.filter(d => d.year === '2025' && d.region === currentRegion).map(d => d.country))].sort();

                    return (
                      <select
                        value={selectedRadarEntity}
                        onChange={(e) => setSelectedRadarEntity(e.target.value)}
                        style={{ width: '100%', padding: '12px 40px 12px 12px', fontSize: '15px', fontWeight: '500', color: COLORS.primary, border: '1px solid #e5e5e5', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', appearance: 'none', outline: 'none' }}
                      >
                        <option value={currentRegion === 'global' ? '__region_global' : `__region_${currentRegion}`}>
                          {currentRegion === 'global' ? 'Global Average' : `${REGION_OPTIONS.find(r => r.value === currentRegion)?.label || currentRegion} Average`}
                        </option>
                        {radarCountries.map(c => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    );
                  })()}
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>▼</span>
                  </div>
                </div>
              </div>

              {/* Years Section - Collapsible with two columns, multiple selection */}
              <div style={{ marginBottom: '20px' }}>
                <div
                  onClick={() => setRadarYearsExpanded(!radarYearsExpanded)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: radarYearsExpanded ? '12px' : '0' }}
                >
                  <label style={{ fontSize: '11px', fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>Years</label>
                  <span style={{ fontSize: '16px', color: COLORS.primary, fontWeight: '300' }}>{radarYearsExpanded ? '−' : '+'}</span>
                </div>
                {radarYearsExpanded && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                    {['2020', '2021', '2022', '2023', '2024', '2025'].map(year => (
                      <label key={year} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedRadarYears.includes(year)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRadarYears([...selectedRadarYears, year].sort());
                            } else if (selectedRadarYears.length > 1) {
                              setSelectedRadarYears(selectedRadarYears.filter(y => y !== year));
                            }
                          }}
                          style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: COLORS.primary }}
                        />
                        <span style={{ fontSize: '13px', color: COLORS.text }}>{year}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Factors & Subfactors Section - Collapsible */}
              <div style={{ marginBottom: '20px' }}>
                <div
                  onClick={() => setRadarFactorsExpanded(!radarFactorsExpanded)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: radarFactorsExpanded ? '12px' : '0' }}
                >
                  <label style={{ fontSize: '11px', fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>Factors & Subfactors</label>
                  <span style={{ fontSize: '16px', color: COLORS.primary, fontWeight: '300' }}>{radarFactorsExpanded ? '−' : '+'}</span>
                </div>
                {radarFactorsExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Overall Index */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '4px' }}>
                      <input
                        type="checkbox"
                        checked={selectedRadarFactors.includes('roli')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRadarFactors([...selectedRadarFactors, 'roli']);
                          } else if (selectedRadarFactors.length > 3) {
                            setSelectedRadarFactors(selectedRadarFactors.filter(f => f !== 'roli'));
                          }
                        }}
                        disabled={!selectedRadarFactors.includes('roli') && selectedRadarFactors.length < 3}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: COLORS.primary }}
                      />
                      <span style={{ fontSize: '14px', color: COLORS.primary, fontWeight: '600' }}>Overall Index</span>
                    </label>

                    {/* Factors with expandable subfactors */}
                    {SUBFACTOR_GROUPS.map((group, groupIndex) => {
                      const factorKey = `f${groupIndex + 1}`;
                      const factorLabel = VARIABLE_OPTIONS.find(v => v.value === factorKey)?.label || factorKey;
                      const subfactors = VARIABLE_OPTIONS.filter(v => v.category === group.category);
                      const isExpanded = expandedRadarFactorGroups[factorKey];
                      const isFactorSelected = selectedRadarFactors.includes(factorKey);

                      return (
                        <div key={factorKey}>
                          {/* Factor Header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isExpanded ? '8px' : '0' }}>
                            <input
                              type="checkbox"
                              checked={isFactorSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRadarFactors([...selectedRadarFactors, factorKey]);
                                } else if (selectedRadarFactors.length > 3) {
                                  setSelectedRadarFactors(selectedRadarFactors.filter(f => f !== factorKey));
                                }
                              }}
                              disabled={!isFactorSelected && selectedRadarFactors.length < 3}
                              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: COLORS.primary }}
                            />
                            <span
                              onClick={() => setExpandedRadarFactorGroups({ ...expandedRadarFactorGroups, [factorKey]: !isExpanded })}
                              style={{ flex: 1, fontSize: '14px', color: COLORS.primary, fontWeight: '500', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              {factorLabel.replace(/^F\d+ - /, '')}
                            </span>
                            <span
                              onClick={() => setExpandedRadarFactorGroups({ ...expandedRadarFactorGroups, [factorKey]: !isExpanded })}
                              style={{ fontSize: '14px', color: COLORS.primary, cursor: 'pointer', fontWeight: '300' }}
                            >
                              {isExpanded ? '−' : '+'}
                            </span>
                          </div>

                          {/* Subfactors */}
                          {isExpanded && (
                            <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                              {subfactors.map(sf => {
                                const isSelected = selectedRadarFactors.includes(sf.value);
                                return (
                                  <label key={sf.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedRadarFactors([...selectedRadarFactors, sf.value]);
                                        } else if (selectedRadarFactors.length > 3) {
                                          setSelectedRadarFactors(selectedRadarFactors.filter(f => f !== sf.value));
                                        }
                                      }}
                                      disabled={!isSelected && selectedRadarFactors.length < 3}
                                      style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: COLORS.primary }}
                                    />
                                    <span style={{ fontSize: '13px', color: COLORS.text }}>{sf.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Area - Chart */}
        <div className="chart-area" style={{ flex: 1, minWidth: 0 }}>
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <p style={{ fontSize: '16px', color: COLORS.muted }}>Loading chart...</p>
            </div>
          }>
            {chartType === 'topbottom' && <TopBottomChart allData={allData} selectedRegion={selectedRegion} selectedYear={selectedYear} variable={selectedVariable} label={selectedLabel} regionLabel={regionLabel} />}
            {chartType === 'timeseries' && selectedCountry && <TimeSeriesChart allData={allData} country={selectedCountry} variable={selectedVariable} label={selectedLabel} selectedRegion={selectedRegion} regionLabel={regionLabel} showRegionalAvg={showRegionalAvg} showGlobalAvg={showGlobalAvg} countryRegion={selectedCountryRegion} yearRange={yearRange} />}
            {chartType === 'factors' && (
              <FactorComparisonChart
                allData={allData}
                selectedRegion={selectedRegion}
                selectedYear={selectedYear}
                availableCountries={availableCountries}
                selectedCountries={factorCompareCountries}
              />
            )}
            {chartType === 'radar' && (
              <RadarChartView
                allData={allData}
                selectedEntity={selectedRadarEntity}
                selectedYears={selectedRadarYears}
                selectedFactors={selectedRadarFactors}
              />
            )}
            {chartType === 'profile' && (
              <CountryProfileChart
                allData={allData}
                selectedRegion={selectedProfileRegion}
                selectedCountry={selectedProfileCountry}
                selectedYear={ACTIVE_YEAR}
              />
            )}
          </Suspense>
        </div>
      </div>{/* Close dashboard-main-layout */}

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
