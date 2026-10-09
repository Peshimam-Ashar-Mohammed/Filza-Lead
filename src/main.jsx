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
  Compass
} from 'lucide-react';
import './styles.css';
import { countriesData, countryList } from './data/geoData.js';
import { categoriesList } from './data/categoriesData.js';
import { searchLeads, exportToCSV, exportToExcel } from './services/leadService.js';

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

function App() {
  // Dropdown-only state (Zero text inputs)
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVolume, setSelectedVolume] = useState('30');
  const [selectedRadius, setSelectedRadius] = useState('15000');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [selectedSort, setSelectedSort] = useState('rating_desc');
  const [selectedExportFormat, setSelectedExportFormat] = useState('excel');
  const [viewFilter, setViewFilter] = useState('all');

  // Application data & UI states
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [copiedId, setCopiedId] = useState(null);
  const [allCopied, setAllCopied] = useState(false);

  // Available regions for current country
  const currentCountryObj = countriesData[selectedCountry] || {};
  const regionNames = useMemo(() => {
    if (!currentCountryObj.regions) return ['All Regions'];
    return ['All Regions', ...Object.keys(currentCountryObj.regions)];
  }, [currentCountryObj]);

  // Available cities for current country + region
  const cityNames = useMemo(() => {
    if (!currentCountryObj.regions) return ['All Cities'];
    if (selectedRegion === 'All Regions') {
      // Collect top cities across regions
      const allCities = new Set();
      Object.values(currentCountryObj.regions).forEach(reg => {
        if (Array.isArray(reg.cities)) {
          reg.cities.forEach(c => allCities.add(c));
        }
      });
      return ['All Cities', ...Array.from(allCities).slice(0, 15)];
    }
    const reg = currentCountryObj.regions[selectedRegion];
    if (reg && Array.isArray(reg.cities)) {
      return ['All Cities', ...reg.cities];
    }
    return ['All Cities', 'Central District', 'Metro Downtown', 'Commercial Area'];
  }, [currentCountryObj, selectedRegion]);

  // Handle country switch: update region & city dropdowns cleanly
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setSelectedRegion('All Regions');
    setSelectedCity('All Cities');
  };

  // Handle region switch: reset city dropdown cleanly
  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    setSelectedRegion(newRegion);
    setSelectedCity('All Cities');
  };

  // Execute Lead Discovery
  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setStatusMessage(`Scanning business registries in ${selectedCity !== 'All Cities' ? selectedCity : selectedRegion !== 'All Regions' ? selectedRegion : selectedCountry}...`);
    setStatusType('info');

    try {
      const results = await searchLeads({
        country: selectedCountry,
        region: selectedRegion,
        city: selectedCity,
        category: selectedCategory,
        targetCount: parseInt(selectedVolume, 10),
        radius: parseInt(selectedRadius, 10),
        filterType: selectedQuality
      });

      setLeads(results);
      setStatusType('success');
      setStatusMessage(`Found ${results.length} verified business leads in ${selectedCountry} (${selectedCity !== 'All Cities' ? selectedCity : selectedRegion}).`);
    } catch (err) {
      console.error(err);
      setStatusType('error');
      setStatusMessage('Error retrieving leads. Please select another filter.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run once on mount for immediate out-of-the-box leads!
  useEffect(() => {
    handleSearch();
  }, []);

  // Filtered & Sorted leads for the table
  const displayedLeads = useMemo(() => {
    let list = [...leads];

    if (viewFilter === 'phone') {
      list = list.filter(l => l.phone && l.phone.trim().length > 5);
    } else if (viewFilter === 'website') {
      list = list.filter(l => l.website && l.website.startsWith('http'));
    } else if (viewFilter === 'email') {
      list = list.filter(l => l.email && l.email.includes('@'));
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
    const withPhone = leads.filter(l => l.phone).length;
    const withWeb = leads.filter(l => l.website).length;
    const avg = leads.reduce((sum, l) => sum + l.rating, 0) / leads.length;
    return {
      total: leads.length,
      withPhone: Math.round((withPhone / leads.length) * 100),
      withWeb: Math.round((withWeb / leads.length) * 100),
      avgRating: avg.toFixed(1)
    };
  }, [leads]);

  // Export handlers
  const handleExport = () => {
    if (!leads.length) return;
    const cleanLocation = `${selectedCountry}-${selectedRegion !== 'All Regions' ? selectedRegion : 'Nationwide'}`.replace(/\s+/g, '_');
    const filename = `FilzaLead_${cleanLocation}_${Date.now()}`;

    if (selectedExportFormat === 'excel') {
      exportToExcel(leads, filename);
      setStatusType('success');
      setStatusMessage(`Exported ${leads.length} leads to Excel (.xlsx) file!`);
    } else {
      exportToCSV(leads, filename);
      setStatusType('success');
      setStatusMessage(`Exported ${leads.length} leads to CSV spreadsheet!`);
    }
  };

  // Copy single lead
  const handleCopyLead = (lead) => {
    const text = `${lead.name} | ${lead.category}\nPhone: ${lead.phone}\nEmail: ${lead.email}\nWebsite: ${lead.website}\nAddress: ${lead.address}`;
    navigator.clipboard.writeText(text);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all leads as TSV for instant spreadsheet pasting
  const handleCopyAll = () => {
    if (!leads.length) return;
    const headers = ['Company', 'Category', 'Phone', 'Email', 'Website', 'Address', 'Rating'];
    const rows = leads.map(l => [l.name, l.category, l.phone, l.email, l.website, l.address, l.rating].join('\t'));
    const tsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsv);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2200);
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
              <p className="brand-subtitle">Worldwide B2B Lead Intelligence & Discovery</p>
            </div>
          </div>

          <div className="header-meta">
            <div className="pill-badge">
              <Globe size={14} className="accent-icon" />
              <span>190+ Countries Enabled</span>
            </div>
            <div className="pill-badge">
              <SlidersHorizontal size={14} className="accent-icon" />
              <span>100% Dropdown Driven</span>
            </div>
            <div className="pill-badge success-pill">
              <CheckCircle2 size={14} />
              <span>Zero Manual Typing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-eyebrow">
            <Database size={14} />
            <span>GLOBAL BUSINESS DIRECTORY</span>
          </div>
          <h1>Discover Verified Business Leads Worldwide</h1>
          <p>
            Select your country, region, city, and business sector using the dropdown windows below.
            FilzaLead automatically resolves coordinates, indexes local commercial entities, and exports high-accuracy contact records.
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
                >
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
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
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
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spinner" />
                    <span>Indexing Global Registries…</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Find Leads ({selectedCountry})</span>
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
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        {/* Live Results Section */}
        <section className="results-container">
          {/* Metrics & Analytics Bar */}
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Total Leads Found</span>
              <div className="metric-value">
                <strong>{stats.total}</strong>
                <span className="metric-badge">Ready</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-label">Phone Coverage</span>
              <div className="metric-value">
                <strong>{stats.withPhone}%</strong>
                <span className="metric-tag">Direct Lines</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-label">Web / Domain Ratio</span>
              <div className="metric-value">
                <strong>{stats.withWeb}%</strong>
                <span className="metric-tag">Websites</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-label">Average Satisfaction</span>
              <div className="metric-value">
                <strong>{stats.avgRating} <Star size={14} className="star-filled inline" /></strong>
                <span className="metric-tag">Reviews</span>
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
                  <option value="all">All Generated Leads ({leads.length})</option>
                  <option value="phone">With Phone Numbers Only</option>
                  <option value="website">With Official Websites Only</option>
                  <option value="email">With Contact Email Only</option>
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
              <thead>
                <tr>
                  <th>Business Entity</th>
                  <th>Industry / Category</th>
                  <th>Direct Phone</th>
                  <th>Online Presence</th>
                  <th>Physical Address</th>
                  <th>Rating</th>
                  <th className="text-right">Actions</th>
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
                      <span className="category-badge">{lead.category}</span>
                    </td>
                    <td>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="contact-link phone">
                          <Phone size={13} />
                          <span>{lead.phone}</span>
                        </a>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>
                    <td>
                      <div className="web-links-cell">
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-link web"
                          >
                            <Globe size={13} />
                            <span>{lead.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                            <ExternalLink size={11} className="ext-icon" />
                          </a>
                        )}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="contact-link mail">
                            <Mail size={13} />
                            <span>{lead.email}</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="address-cell">
                      <div className="address-content">
                        <MapPin size={13} className="pin-icon" />
                        <span title={lead.address}>{lead.address}</span>
                      </div>
                    </td>
                    <td>
                      <div className="rating-cell">
                        <span className="rating-number">{lead.rating}</span>
                        <div className="star-wrapper">
                          <Star size={13} className="star-icon" />
                        </div>
                        <span className="review-count">({lead.reviews})</span>
                      </div>
                    </td>
                    <td className="text-right">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {displayedLeads.length === 0 && (
              <div className="empty-state">
                <Search size={36} className="empty-icon" />
                <h3>No leads match this view filter</h3>
                <p>Switch the display filter above to "All Generated Leads" or select another region.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          FilzaLead Pro Enterprise Lead Intelligence Platform • Live Geocoding & Open Business Data • 190+ Countries Enabled
        </p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
