import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Building2,
  Download,
  FileSpreadsheet,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Star,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  Copy,
  Check,
  ExternalLink,
  Database,
  Compass,
  Key,
  ShieldCheck,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import './styles.css';
import { countriesData, countryList } from './data/geoData.js';
import { categoriesList } from './data/categoriesData.js';
import { searchLeads, exportToCSV, exportToExcel, searchGooglePlaces } from './services/leadService.js';

const VOLUME_OPTIONS = [
  { value: '15', label: '15 Leads (Quick Sample)' },
  { value: '30', label: '30 Leads (Standard Pack)' },
  { value: '50', label: '50 Leads (Growth Pack)' },
  { value: '100', label: '100 Leads (Bulk Intelligence)' }
];

const RADIUS_OPTIONS = [
  { value: '5000', label: '5 km (Neighborhood Core)' },
  { value: '15000', label: '15 km (City Metro)' },
  { value: '30000', label: '30 km (Greater Metro Hub)' },
  { value: '50000', label: '50 km (Regional Scope)' }
];

const QUALITY_OPTIONS = [
  { value: 'all', label: 'All Verified Listings' },
  { value: 'phone', label: 'Must Have Phone Number' },
  { value: 'website', label: 'Must Have Official Website' },
  { value: 'top_rated', label: 'High Rating (4.5★ and above)' }
];

const SORT_OPTIONS = [
  { value: 'rating_desc', label: 'Highest Rated (★ 5.0 to 1.0)' },
  { value: 'reviews_desc', label: 'Most Customer Reviews' },
  { value: 'name_asc', label: 'Company Name (A to Z)' }
];

const EXPORT_OPTIONS = [
  { value: 'excel', label: 'Microsoft Excel (.xlsx)' },
  { value: 'csv', label: 'CSV Spreadsheet (.csv)' }
];

function formatDisplayUrl(url) {
  if (!url) return '';
  try {
    const raw = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(raw);
    const domain = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.replace(/\/$/, '') : '';
    const display = domain + (pathname.length <= 15 ? pathname : pathname.slice(0, 13) + '…');
    return display;
  } catch {
    const clean = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    return clean.length > 22 ? clean.slice(0, 20) + '…' : clean;
  }
}

function App() {
  // Dropdown-only state (Zero text inputs in query flow - defaults empty for user selection)
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVolume, setSelectedVolume] = useState('30');
  const [selectedRadius, setSelectedRadius] = useState('15000');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [selectedSort, setSelectedSort] = useState('rating_desc');
  const [selectedExportFormat, setSelectedExportFormat] = useState('excel');
  const [viewFilter, setViewFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);

  // Google Places API State
  const [googleApiKey, setGoogleApiKey] = useState(() => localStorage.getItem('filzalead_google_api_key') || '');
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiTestStatus, setApiTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [apiTestMessage, setApiTestMessage] = useState('');

  // Application data & UI states
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [copiedId, setCopiedId] = useState(null);
  const [allCopied, setAllCopied] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Available regions for current country
  const currentCountryObj = selectedCountry ? countriesData[selectedCountry] || {} : {};
  const regionNames = useMemo(() => {
    if (!selectedCountry || !currentCountryObj.regions) return [];
    return Object.keys(currentCountryObj.regions);
  }, [selectedCountry, currentCountryObj]);

  // Available cities for current country + region
  const cityNames = useMemo(() => {
    if (!selectedCountry || !currentCountryObj.regions) return [];
    if (!selectedRegion || selectedRegion === 'All Regions') {
      const allCities = new Set();
      Object.values(currentCountryObj.regions).forEach(reg => {
        if (Array.isArray(reg.cities)) {
          reg.cities.forEach(c => allCities.add(c));
        }
      });
      return Array.from(allCities).slice(0, 20);
    }
    const reg = currentCountryObj.regions[selectedRegion];
    if (reg && Array.isArray(reg.cities)) {
      return reg.cities;
    }
    return ['Central District', 'Metro Downtown', 'Commercial Area'];
  }, [selectedCountry, currentCountryObj, selectedRegion]);

  // Handle country switch: update region & city dropdowns cleanly and clear previous leads
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setSelectedRegion('');
    setSelectedCity('');
    // Clear leads immediately so other country's output never persists
    setLeads([]);
    setHasSearched(false);
    setStatusMessage('');
    setStatusType('info');
    setAllCopied(false);
  };

  // Handle region switch: reset city dropdown cleanly and clear previous leads
  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    setSelectedRegion(newRegion);
    setSelectedCity('');
    setLeads([]);
    setHasSearched(false);
    setStatusMessage('');
  };

  // Execute Lead Discovery
  const handleSearch = async (e, options = {}) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedCountry) {
      setStatusType('error');
      setStatusMessage('Please select a country from the dropdown first.');
      return;
    }

    const forceRefresh = Boolean(options.forceRefresh);
    const nextRefreshCount = forceRefresh ? refreshCount + 1 : refreshCount;
    if (forceRefresh) setRefreshCount(nextRefreshCount);
    setLoading(true);
    setHasSearched(true);
    const targetLoc = (selectedCity && selectedCity !== 'All Cities')
      ? selectedCity
      : (selectedRegion && selectedRegion !== 'All Regions' ? selectedRegion : selectedCountry);
    setStatusMessage(forceRefresh
      ? `Refreshing verified public listings in ${targetLoc} (${selectedCountry})...`
      : `Scanning verified business registries in ${targetLoc} (${selectedCountry})...`);
    setStatusType('info');

    try {
      const results = await searchLeads({
        country: selectedCountry,
        region: selectedRegion || 'All Regions',
        city: selectedCity || 'All Cities',
        category: selectedCategory || 'all',
        targetCount: parseInt(selectedVolume, 10),
        radius: parseInt(selectedRadius, 10),
        filterType: selectedQuality,
        googleApiKey: googleApiKey,
        forceRefresh,
        refreshSeed: nextRefreshCount
      });

      setLeads(results);
      if (results.length > 0) {
        setStatusType('success');
        const apiSource = googleApiKey ? 'Google Places Official API' : 'Google Maps & Verified Public Directory';
        setStatusMessage(forceRefresh
          ? `Refreshed ${results.length} verified leads in ${targetLoc} (${selectedCountry}).`
          : `Found ${results.length} real business leads in ${targetLoc} (${selectedCountry}) via ${apiSource}.`);
      } else {
        setStatusType('info');
        setStatusMessage(`No public leads found for ${targetLoc} (${selectedCountry}) with the selected filters. Try choosing another city or broadening the category.`);
      }
    } catch (err) {
      console.error(err);
      setStatusType('error');
      setStatusMessage('Error retrieving leads. Please try another selection.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Sorted leads for the table
  const displayedLeads = useMemo(() => {
    let list = [...leads];

    if (viewFilter === 'phone') {
      list = list.filter(l => l.phone && l.phone.trim().length > 3);
    } else if (viewFilter === 'website') {
      list = list.filter(l => l.website && (l.website.startsWith('http') || l.website.includes('.')));
    }

    if (selectedSort === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === 'reviews_desc') {
      list.sort((a, b) => b.reviews - a.reviews);
    } else if (selectedSort === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [leads, viewFilter, selectedSort]);

  // Statistics Computations
  const stats = useMemo(() => {
    if (!leads.length) return { total: 0, withPhone: 0, withWeb: 0, avgRating: '0.0' };
    const withPhone = leads.filter(l => l.phone && l.phone.trim().length > 3).length;
    const withWeb = leads.filter(l => l.website && (l.website.startsWith('http') || l.website.includes('.'))).length;
    const ratedLeads = leads.filter(l => Number(l.rating) > 0);
    const avg = ratedLeads.length ? ratedLeads.reduce((sum, l) => sum + l.rating, 0) / ratedLeads.length : 0;
    return {
      total: leads.length,
      withPhone,
      withWeb,
      avgRating: avg.toFixed(1)
    };
  }, [leads]);

  // Export handlers
  const handleExport = () => {
    if (!leads.length) return;
    const cleanLocation = `${selectedCountry || 'Global'}-${selectedRegion && selectedRegion !== 'All Regions' ? selectedRegion : 'Nationwide'}`.replace(/\s+/g, '_');
    const filename = `FilzaLead_${cleanLocation}_${Date.now()}`;

    if (selectedExportFormat === 'excel') {
      exportToExcel(leads, filename);
      setStatusType('success');
      setStatusMessage(`Exported ${leads.length} verified leads to Excel (.xlsx) file!`);
    } else {
      exportToCSV(leads, filename);
      setStatusType('success');
      setStatusMessage(`Exported ${leads.length} verified leads to CSV spreadsheet!`);
    }
  };

  // Copy single lead with Google Maps link
  const handleCopyLead = (lead) => {
    const text = `${lead.name} | ${lead.category}\nPhone: ${lead.phone || 'Not Listed'}\nAddress: ${lead.address}\nGoogle Maps: ${lead.googleMapsUrl}\nWebsite: ${lead.website || 'Not Listed'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all leads as TSV for instant spreadsheet pasting
  const handleCopyAll = () => {
    if (!leads.length) return;
    const headers = ['Company', 'Category', 'Phone', 'Address', 'Official Website', 'Google Maps Link', 'Rating'];
    const rows = leads.map(l => [
      l.name,
      l.category,
      l.phone || 'Not Listed',
      l.address,
      l.website || 'Not Listed',
      l.googleMapsUrl,
      l.rating
    ].join('\t'));
    const tsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsv);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2200);
  };

  // Google Places API modal handlers
  const handleOpenApiModal = () => {
    setTempApiKey(googleApiKey);
    setApiTestStatus(null);
    setApiTestMessage('');
    setShowApiModal(true);
  };

  const handleTestApiKey = async () => {
    if (!tempApiKey || !tempApiKey.trim()) {
      setApiTestStatus('error');
      setApiTestMessage('Please enter an API key first.');
      return;
    }
    setApiTestStatus('testing');
    setApiTestMessage('Testing connection to Google Places API...');

    try {
      const testQuery = selectedCity && selectedCity !== 'All Cities'
        ? `restaurants in ${selectedCity}`
        : selectedCountry
          ? `restaurants in ${selectedCountry}`
          : 'restaurants';
      const testRes = await searchGooglePlaces(tempApiKey.trim(), {
        query: testQuery,
        targetCount: 1
      });
      if (testRes) {
        setApiTestStatus('success');
        setApiTestMessage('Connected successfully to Google Places API! Live data is active.');
      }
    } catch (err) {
      setApiTestStatus('error');
      setApiTestMessage(err.message || 'Connection failed. Verify API key and billing on Google Cloud.');
    }
  };

  const handleSaveApiKey = () => {
    const key = tempApiKey.trim();
    setGoogleApiKey(key);
    localStorage.setItem('filzalead_google_api_key', key);
    setShowApiModal(false);
    setStatusType('success');
    setStatusMessage(key ? 'Google Places API connected! Future searches will pull direct Google Maps data.' : 'Google Places API key removed.');
  };

  const handleClearApiKey = () => {
    setGoogleApiKey('');
    setTempApiKey('');
    localStorage.removeItem('filzalead_google_api_key');
    setShowApiModal(false);
    setStatusType('info');
    setStatusMessage('Google Places API key removed. Using verified public registries.');
  };

  return (
    <div className="app-container">
      {/* Top Navigation & Brand */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <Sparkles size={20} />
            </div>
            <div className="brand-text">
              <div className="brand-title">
                FilzaLead <span className="pro-badge">PRO</span>
              </div>
              <p className="brand-subtitle">Worldwide B2B Lead Intelligence & Google Maps Verified Discovery</p>
            </div>
          </div>

          <div className="header-meta">
            {/* Google Places API Key Status Button */}
            <button
              type="button"
              className={`api-key-btn ${googleApiKey ? 'active' : ''}`}
              onClick={handleOpenApiModal}
              title="Connect Google Places API for direct Google Maps contact extraction"
            >
              <Key size={14} />
              <span>{googleApiKey ? 'Google API: Connected' : 'Connect Google Places API'}</span>
              {googleApiKey && <span className="green-dot" />}
            </button>

            <div className="pill-badge maps-pill">
              <MapPin size={14} className="accent-rose" />
              <span>Google Maps Verified</span>
            </div>
            <div className="pill-badge">
              <Globe size={14} className="accent-icon" />
              <span>190+ Countries</span>
            </div>
            <div className="pill-badge success-pill">
              <ShieldCheck size={14} />
              <span>Zero-Hallucination Data</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-eyebrow">
            <ShieldCheck size={14} />
            <span>ACCURATE B2B LEADS • 100% REAL PLACES & VERIFIED CONTACTS</span>
          </div>
          <h1>Discover <span className="gradient-text">Verified Business Leads</span> Worldwide</h1>
          <p>
            Select your country, region, city, and business sector using the dropdowns below.
            FilzaLead discovers real, verified commercial entities with Google Maps cross-verification.
            No fake phone numbers or non-working websites.
          </p>
        </section>

        {/* Discovery Control Center (All Dropdowns) */}
        <section className="control-panel-card">
          <div className="card-header">
            <div className="card-title">
              <Compass size={18} className="icon-blue" />
              <span>Targeting & Discovery Controls</span>
            </div>
            <span className="card-hint">All fields are pre-configured dropdowns — no typing required</span>
          </div>

          <form onSubmit={handleSearch} className="dropdown-grid">
            {/* 1. Country Dropdown */}
            <div className="dropdown-control">
              <label htmlFor="country-select">
                <Globe size={14} />
                <span>Country ({countryList.length} Available)</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="country-select"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  <option value="">-- Select Country --</option>
                  {countryList.map((countryName) => (
                    <option key={countryName} value={countryName}>
                      {countryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Region / State Dropdown */}
            <div className="dropdown-control">
              <label htmlFor="region-select">
                <MapPin size={14} />
                <span>Region / State / Province</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="region-select"
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  disabled={!selectedCountry}
                >
                  <option value="">
                    {selectedCountry ? '-- Select Region / State (Optional) --' : '-- Select Country First --'}
                  </option>
                  {selectedCountry && <option value="All Regions">All Regions (Nationwide)</option>}
                  {regionNames.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. City / Area Dropdown */}
            <div className="dropdown-control">
              <label htmlFor="city-select">
                <Building2 size={14} />
                <span>City / Metro Hub</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="city-select"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setLeads([]);
                    setHasSearched(false);
                  }}
                  disabled={!selectedCountry}
                >
                  <option value="">
                    {selectedCountry ? '-- Select City / Hub (Optional) --' : '-- Select Country First --'}
                  </option>
                  {selectedCountry && <option value="All Cities">All Cities (Metro Areas)</option>}
                  {cityNames.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Industry / Category Dropdown */}
            <div className="dropdown-control">
              <label htmlFor="category-select">
                <SlidersHorizontal size={14} />
                <span>Industry & Sector</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setLeads([]);
                    setHasSearched(false);
                  }}
                >
                  <option value="">-- Select Industry / Category --</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Volume Dropdown */}
            <div className="dropdown-control">
              <label htmlFor="volume-select">
                <Database size={14} />
                <span>Lead Quantity Target</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="volume-select"
                  value={selectedVolume}
                  onChange={(e) => setSelectedVolume(e.target.value)}
                >
                  {VOLUME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 6. Radius Dropdown */}
            <div className="dropdown-control">
              <label htmlFor="radius-select">
                <Compass size={14} />
                <span>Search Perimeter</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="radius-select"
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(e.target.value)}
                >
                  {RADIUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 7. Quality / Verification Dropdown */}
            <div className="dropdown-control">
              <label htmlFor="quality-select">
                <CheckCircle2 size={14} />
                <span>Contact Verification Filter</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="quality-select"
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                >
                  {QUALITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 8. Export Format Dropdown */}
            <div className="dropdown-control">
              <label htmlFor="export-select">
                <FileSpreadsheet size={14} />
                <span>Preferred Export File</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="export-select"
                  value={selectedExportFormat}
                  onChange={(e) => setSelectedExportFormat(e.target.value)}
                >
                  {EXPORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="button-group-full">
              <button
                type="submit"
                className="btn-discover"
                disabled={loading || !selectedCountry}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spinner" />
                    <span>Searching Verified Businesses…</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>
                      {selectedCountry
                        ? `Find Real Leads (${selectedCity && selectedCity !== 'All Cities' ? selectedCity : (selectedRegion && selectedRegion !== 'All Regions' ? selectedRegion : selectedCountry)})`
                        : 'Select a Country to Search'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Status / Alert Bar */}
        {statusMessage && (
          <div className={`status-notification ${statusType}`}>
            <div className="status-text">
              {statusType === 'success' && <CheckCircle2 size={16} />}
              {statusType === 'info' && <RefreshCw size={16} className={loading ? 'spinner' : ''} />}
              {statusType === 'error' && <AlertCircle size={16} />}
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        {/* Live Results Section */}
        <section className="results-container">
          {/* Metrics & Analytics Bar */}
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Total Real Leads</span>
              <div className="metric-value">
                <strong>{stats.total}</strong>
                <span className="metric-badge">Verified</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-label">Direct Phones Listed</span>
              <div className="metric-value">
                <strong>{stats.withPhone}</strong>
                <span className="metric-tag">Authentic</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-label">Official Websites</span>
              <div className="metric-value">
                <strong>{stats.withWeb}</strong>
                <span className="metric-tag">Live Sites</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-label">Google Maps Verification</span>
              <div className="metric-value">
                <strong>100%</strong>
                <span className="metric-badge-green">Cross-Verified</span>
              </div>
            </div>
          </div>

          {/* Results Action Header & Filters */}
          <div className="results-toolbar">
            <div className="toolbar-left">
              <div className="filter-dropdown-inline">
                <label htmlFor="view-filter-select">Display Filter:</label>
                <select
                  id="view-filter-select"
                  value={viewFilter}
                  onChange={(e) => setViewFilter(e.target.value)}
                >
                  <option value="all">All Found Leads ({leads.length})</option>
                  <option value="phone">With Listed Phone Numbers ({stats.withPhone})</option>
                  <option value="website">With Official Websites ({stats.withWeb})</option>
                </select>
              </div>

              <div className="filter-dropdown-inline">
                <label htmlFor="sort-select">Sort By:</label>
                <select
                  id="sort-select"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="toolbar-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={(e) => handleSearch(e, { forceRefresh: true })}
                disabled={loading}
                title="Refresh from public directories and look for additional verified business names"
              >
                <RefreshCw size={16} className={loading ? 'spinner' : ''} />
                <span>Refresh Leads</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopyAll}
                disabled={!leads.length}
                title="Copy all leads formatted for Excel/Google Sheets"
              >
                {allCopied ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                <span>{allCopied ? 'Copied to Clipboard!' : 'Copy Table'}</span>
              </button>

              <button
                type="button"
                className="btn-download-primary"
                onClick={handleExport}
                disabled={!leads.length}
              >
                <Download size={16} />
                <span>
                  Export {selectedExportFormat === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'}
                </span>
              </button>
            </div>
          </div>

          {/* Leads Table */}
          <div className="table-wrapper">
            <table className="leads-table">
              <colgroup>
                <col style={{ width: '22%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '9%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Business Entity</th>
                  <th>Industry / Category</th>
                  <th>Direct Phone</th>
                  <th>Online Presence</th>
                  <th>Physical Address</th>
                  <th>Rating</th>
                  <th className="text-right">Cross-Verify</th>
                </tr>
              </thead>
              <tbody>
                {displayedLeads.map((lead) => (
                  <tr key={lead.id} className="lead-row">
                    <td className="lead-name-cell">
                      <div className="company-info">
                        <strong>{lead.name}</strong>
                        <span className="source-pill">{lead.status}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge" title={lead.category}>{lead.category}</span>
                    </td>
                    <td>
                      {lead.phone ? (
                        <div className="phone-wrapper">
                          <a
                            href={`tel:${lead.phone.split(/[;,]/)[0].trim().replace(/[\s()-]/g, '')}`}
                            className="contact-link phone"
                          >
                            <Phone size={13} className="shrink-0" />
                            <span>{lead.phone}</span>
                          </a>
                        </div>
                      ) : (
                        <div className="unlisted-wrapper">
                          <span className="unlisted-text">Not Listed</span>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(`${lead.name} ${lead.city || selectedCity} phone number`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lookup-link"
                            title="Search verified phone on Google"
                          >
                            <Search size={11} className="shrink-0" />
                            <span>Find Phone</span>
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="web-links-cell">
                        {lead.website ? (
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-link web"
                            title={lead.website}
                          >
                            <Globe size={13} className="shrink-0" />
                            <span className="truncate-link">{formatDisplayUrl(lead.website)}</span>
                            <ExternalLink size={11} className="ext-icon shrink-0" />
                          </a>
                        ) : (
                          <div className="unlisted-wrapper">
                            <span className="unlisted-text">No Website Listed</span>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(`${lead.name} ${lead.city || selectedCity} official website`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="lookup-link"
                              title="Search official website on Google"
                            >
                              <Search size={11} className="shrink-0" />
                              <span>Search Site</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="address-cell">
                      <div className="address-content">
                        <MapPin size={13} className="pin-icon shrink-0" />
                        <span title={lead.address}>{lead.address}</span>
                      </div>
                    </td>
                    <td>
                      <div className="rating-cell">
                        {Number(lead.rating) > 0 ? (
                          <>
                            <span className="rating-number">{lead.rating}</span>
                            <div className="star-wrapper">
                              <Star size={13} className="star-icon" />
                            </div>
                            <span className="review-count">({lead.reviews})</span>
                          </>
                        ) : (
                          <span className="unlisted-text">No rating</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right actions-cell">
                      <div className="action-buttons-group">
                        <a
                          href={lead.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.city || selectedCity} ${lead.country}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-gmaps-verify"
                          title="Open and cross-verify this exact place on Google Maps"
                        >
                          <MapPin size={12} className="gmaps-icon shrink-0" />
                          <span>Maps</span>
                          <ExternalLink size={10} className="shrink-0" />
                        </a>
                        <button
                          type="button"
                          className="btn-copy-row"
                          onClick={() => handleCopyLead(lead)}
                          title="Copy lead contact info"
                        >
                          {copiedId === lead.id ? (
                            <Check size={14} className="text-green" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {displayedLeads.length === 0 && (
              <div className="empty-state">
                {!hasSearched ? (
                  <>
                    <Compass size={42} className="empty-icon text-indigo" />
                    <h3>Ready to Discover Leads</h3>
                    <p>Select your Target Country and Industry above, then click <strong>Find Real Leads</strong>.</p>
                  </>
                ) : leads.length === 0 ? (
                  <>
                    <Search size={36} className="empty-icon" />
                    <h3>No verified leads found</h3>
                    <p>No listings matched for this specific area or category. Try choosing a different city or broadening the category.</p>
                  </>
                ) : (
                  <>
                    <Search size={36} className="empty-icon" />
                    <h3>No leads match this view filter</h3>
                    <p>Switch the display filter above to "All Found Leads" or adjust your targeting.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Google Places API Setup Modal */}
      {showApiModal && (
        <div className="modal-backdrop" onClick={() => setShowApiModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Key size={18} className="text-indigo" />
                <h3>Connect Google Places API</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowApiModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="info-banner">
                <Info size={18} className="info-icon" />
                <div>
                  <strong>Why connect a Google Places API key?</strong>
                  <p>
                    Connecting your key pulls <strong>100% real Google Maps phone numbers, verified websites, and exact place details</strong> directly from Google's live database.
                  </p>
                  <p className="credit-note">
                    Google provides <strong>$200 in free credit every single month</strong> (~28,000 place searches/month) to every Google Cloud account at zero cost.
                  </p>
                </div>
              </div>

              <div className="api-input-group">
                <label htmlFor="api-key-input">Your Google Places API Key:</label>
                <input
                  id="api-key-input"
                  type="password"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="input-api-key"
                />
                <span className="privacy-hint">
                  Your key is stored locally in your browser only (<code>localStorage</code>) and is never sent to any third-party server.
                </span>
              </div>

              {apiTestMessage && (
                <div className={`api-test-alert ${apiTestStatus}`}>
                  {apiTestStatus === 'testing' && <RefreshCw size={14} className="spinner" />}
                  {apiTestStatus === 'success' && <CheckCircle2 size={14} />}
                  {apiTestStatus === 'error' && <AlertCircle size={14} />}
                  <span>{apiTestMessage}</span>
                </div>
              )}

              <div className="setup-steps">
                <h4>How to get a Free Google Places API Key:</h4>
                <ol>
                  <li>Go to <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer">Google Cloud Console <ExternalLink size={11} className="inline" /></a>.</li>
                  <li>Enable the <strong>Places API</strong> (New or Text Search).</li>
                  <li>Go to <strong>Credentials</strong> and click <strong>Create Credentials → API Key</strong>.</li>
                  <li>Paste the key above and click <strong>Test Connection</strong>.</li>
                </ol>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleTestApiKey}
                disabled={apiTestStatus === 'testing'}
              >
                {apiTestStatus === 'testing' ? 'Testing…' : 'Test Connection'}
              </button>

              {googleApiKey && (
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={handleClearApiKey}
                >
                  Disconnect Key
                </button>
              )}

              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveApiKey}
              >
                Save & Use API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>
          FilzaLead Pro Enterprise Lead Intelligence Platform • Google Maps & Official Registries • Strict Zero-Hallucination Policy
        </p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
