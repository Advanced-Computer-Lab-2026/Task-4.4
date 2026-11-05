import React, { useEffect, useMemo, useState } from 'react';

const STORE = 'acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed = [
  { id: 'f1', title: 'Black backpack', category: 'accessories', status: 'lost', location: 'Library - second floor', description: 'Black backpack with a small red keychain. Left near the study desks.', owner: 'you', created: 'Oct 23', emoji: '🎒' },
  { id: 'f2', title: 'Dark backpack', category: 'accessories', status: 'found', location: 'Library - main stairwell', description: 'Found a dark backpack with a small red keychain near the library stairs.', owner: 'other', created: 'Oct 24', emoji: '🎒', collectionPoint: 'Campus Security Desk', handoverStatus: 'received' },
  { id: 'f3', title: 'Student ID card', category: 'documents', status: 'found', location: 'Near Gate 3', description: 'A student card was turned in. No personal details are published.', owner: 'other', created: 'Oct 24', emoji: '🪪', collectionPoint: 'Student Services Office', handoverStatus: 'received' },
  { id: 'f4', title: 'Wireless earbuds', category: 'electronics', status: 'lost', location: 'Main cafeteria', description: 'White earbuds in a distinctive blue case. Lost on Monday.', owner: 'other', created: 'Oct 24', emoji: '🎧' },
  { id: 'f5', title: 'Earbuds in blue case', category: 'electronics', status: 'found', location: 'Cafeteria entrance', description: 'White earbuds in a blue charging case found near the coffee counter.', owner: 'other', created: 'Oct 25', emoji: '🎧', collectionPoint: '', handoverStatus: 'reported' },
  { id: 'f6', title: 'Blue sports bottle', category: 'other', status: 'lost', location: 'Sports Hall - lockers', description: 'Tall blue metal water bottle, possibly left after practice.', owner: 'other', created: 'Oct 25', emoji: '🥤' },
  { id: 'f7', title: 'Metal water bottle', category: 'other', status: 'found', location: 'Sports Hall - benches', description: 'Blue reusable metal bottle found after a basketball session.', owner: 'other', created: 'Oct 25', emoji: '🥤', collectionPoint: 'Campus Security Desk', handoverStatus: 'received' },
  { id: 'f8', title: 'Engineering lab coat', category: 'clothing', status: 'claimed', location: 'Building C', description: 'Owner verified the item and collected it from the reception desk.', owner: 'you', created: 'Oct 22', emoji: '🥼', collectionPoint: 'Library Reception', handoverStatus: 'released' },
  { id: 'f9', title: 'Small notebook', category: 'other', status: 'lost', location: 'C7 lecture room', description: 'Brown cover with handwritten engineering notes.', owner: 'other', created: 'Oct 25', emoji: '📒' },
  { id: 'f10', title: 'Scientific calculator', category: 'electronics', status: 'lost', location: 'B2 lecture hall', description: 'Black scientific calculator with a protective cover.', owner: 'other', created: 'Oct 26', emoji: '🧮' },
  { id: 'f11', title: 'Calculator', category: 'electronics', status: 'found', location: 'B2 study area', description: 'Scientific calculator with a black cover, found on a desk.', owner: 'you', created: 'Oct 26', emoji: '🧮', collectionPoint: 'Library Reception', handoverStatus: 'received' },
  { id: 'f12', title: 'Canvas tote bag', category: 'accessories', status: 'lost', location: 'Main campus bus stop', description: 'Beige tote with green writing on one side.', owner: 'other', created: 'Oct 26', emoji: '👜' },
  { id: 'f13', title: 'USB flash drive', category: 'electronics', status: 'found', location: 'Building A computer lab', description: 'A small black flash drive was found beside a workstation.', owner: 'other', created: 'Oct 27', emoji: '💾', collectionPoint: '', handoverStatus: 'reported' },
];

const categories = ['all', 'electronics', 'clothing', 'documents', 'accessories', 'other'];
const statuses = ['lost', 'found', 'claimed'];
const clean = { title: '', category: '', status: '', location: '', description: '' };

function getSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE));
    return Array.isArray(s) ? s : seed;
  } catch {
    return seed;
  }
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function validate(f, arr, id) {
  if (!f.title.trim() || f.title.trim().length < 2) return 'Title must be at least 2 characters.';
  if (!categories.slice(1).includes(f.category)) return 'Choose a category.';
  if (!statuses.includes(f.status)) return 'Choose lost, found or claimed.';
  if (arr.some(r => r.id !== id && r.title.toLowerCase() === f.title.trim().toLowerCase() && (r.location || '').toLowerCase() === (f.location || '').trim().toLowerCase())) {
    return 'An item with the same title has already been reported at this location.';
  }
  return '';
}

export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('board');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => localStorage.setItem(STORE, JSON.stringify(items)), [items]);

  const filtered = useMemo(() => items.filter(x =>
    (cat === 'all' || x.category === cat) &&
    (filterStatus === 'all' || x.status === filterStatus) &&
    `${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())
  ), [items, q, cat, filterStatus]);

  function create() {
    setCurrent(null);
    setForm({ ...clean });
    setError('');
    setPage('form');
  }

  function edit(row) {
    if (row.owner !== 'you') return;
    setCurrent(row.id);
    setForm({ title: row.title, category: row.category, status: row.status, location: row.location, description: row.description });
    setOpenMenu(null);
    setError('');
    setPage('form');
  }

  function submit(e) {
    e.preventDefault();
    const v = validate(form, items, current);
    if (v) {
      setError(v);
      return;
    }
    const d = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      owner: 'you',
      created: 'Today',
      emoji: current ? items.find(x => x.id === current)?.emoji : '📌',
      ...(current ? {} : { collectionPoint: '', handoverStatus: 'reported' })
    };

    if (current) {
      setItems(items.map(x => x.id === current ? { ...x, ...d } : x));
      setMessage('Report updated.');
    } else {
      setItems([{ id: `f-${Date.now()}`, ...d }, ...items]);
      setMessage('Your report has been posted.');
    }
    setPage('board');
    setCurrent(null);
  }

  function reset() {
    setItems(seed);
    setPage('board');
    setQ('');
    setCat('all');
    setFilterStatus('all');
    setMessage('Example reports restored.');
  }

  const columns = [
    {
      key: 'lost',
      title: 'LOST',
      sub: 'Searching for these things',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Lost item search icon">
          <circle cx="11" cy="11" r="7"/>
          <line x1="21" y1="21" x2="16.5" y2="16.5"/>
        </svg>
      )
    },
    {
      key: 'found',
      title: 'FOUND',
      sub: 'Looking for the owners',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="Found item box icon">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      )
    },
    {
      key: 'claimed',
      title: 'CLAIMED',
      sub: 'Back where they belong',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Claimed item check icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )
    }
  ];

  const hasActiveFilters = q !== '' || cat !== 'all' || filterStatus !== 'all';

  return (
    <div className="notice-app">
      <header className="header">
        <div className="headline">
          <span className="sun">✺</span>
          <button onClick={() => setPage('board')} className="wordmark">
            FOUND<span>on campus</span>
          </button>
          <span className="campus-badge">Community Noticeboard</span>
        </div>
      </header>

      {page === 'board' ? (
        <main className="workspace">
          <section className="board">
            <div className="board-top">
              <div>
                <p className="kicker">CAMPUS COMMUNITY</p>
                <h2>Latest notices <span>({filtered.length})</span></h2>
              </div>
              <span className="time-note">Updated today</span>
            </div>

            {/* User-friendly Search, Filter & Report Controls */}
            <div className="top-controls">
              <div className="top-filter-bar">
                <div className="filter-bar-header">
                  <div className="filter-header-title">
                    <div className="filter-badge-icon" aria-hidden="true">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                      </svg>
                    </div>
                    <div>
                      <p className="kicker">SEARCH &amp; FILTER</p>
                      <h3>Browse reports <span className="results-badge">{filtered.length} found</span></h3>
                    </div>
                  </div>
                  <button className="reset-link-btn" onClick={reset} title="Restore example records">
                    <span className="reset-glyph">↺</span> Reset demo data
                  </button>
                </div>

                <div className="filter-controls-row">
                  <div className="filter-field search-field">
                    <label htmlFor="search-input">Search items</label>
                    <div className="search-input-wrapper">
                      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7"/>
                        <line x1="21" y1="21" x2="16.5" y2="16.5"/>
                      </svg>
                      <input
                        id="search-input"
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Keyword, item name, or location..."
                      />
                      {q && (
                        <button
                          type="button"
                          className="search-clear-btn"
                          onClick={() => setQ('')}
                          aria-label="Clear search text"
                          title="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="filter-field">
                    <label htmlFor="category-select">Item category</label>
                    <div className="select-wrapper">
                      <select
                        id="category-select"
                        value={cat}
                        onChange={e => setCat(e.target.value)}
                      >
                        <option value="all">All categories</option>
                        {categories.slice(1).map(c => <option key={c} value={c}>{cap(c)}</option>)}
                      </select>
                      <span className="select-arrow" aria-hidden="true">▾</span>
                    </div>
                  </div>

                  <div className="filter-field">
                    <label htmlFor="status-select">Report status</label>
                    <div className="select-wrapper">
                      <select
                        id="status-select"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All statuses</option>
                        {statuses.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                      </select>
                      <span className="select-arrow" aria-hidden="true">▾</span>
                    </div>
                  </div>

                  <div className="filter-actions">
                    <button
                      className="filter-apply-btn"
                      onClick={() => setMessage(`${filtered.length} reports shown.`)}
                      title="Apply search and filter"
                    >
                      Apply
                    </button>
                    <button
                      className={`filter-clear-btn ${hasActiveFilters ? 'has-filters' : ''}`}
                      onClick={() => { setQ(''); setCat('all'); setFilterStatus('all'); setMessage(''); }}
                      title="Reset all filters"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Helpful active filter chips */}
                {hasActiveFilters && (
                  <div className="active-filters-row">
                    <span className="active-filters-label">Active filters:</span>
                    {q && (
                      <span className="filter-pill">
                        "{q}"
                        <button type="button" onClick={() => setQ('')} aria-label="Remove search filter">✕</button>
                      </span>
                    )}
                    {cat !== 'all' && (
                      <span className="filter-pill">
                        Category: {cap(cat)}
                        <button type="button" onClick={() => setCat('all')} aria-label="Remove category filter">✕</button>
                      </span>
                    )}
                    {filterStatus !== 'all' && (
                      <span className="filter-pill">
                        Status: {cap(filterStatus)}
                        <button type="button" onClick={() => setFilterStatus('all')} aria-label="Remove status filter">✕</button>
                      </span>
                    )}
                    <button
                      type="button"
                      className="clear-all-link"
                      onClick={() => { setQ(''); setCat('all'); setFilterStatus('all'); setMessage(''); }}
                    >
                      Reset all
                    </button>
                  </div>
                )}
              </div>

              {/* Prominent, friendly report card */}
              <div className="top-report-card">
                <div className="top-report-header">
                  <span className="top-report-pin">📍</span>
                  <div>
                    <strong>Lost or found something?</strong>
                    <p>Every report gets us a little closer.</p>
                  </div>
                </div>
                <button className="top-report-btn" onClick={create}>
                  Share your report →
                </button>
              </div>
            </div>

            {message && (
              <div className="message" role="status">
                {message}
                <button onClick={() => setMessage('')}>✕</button>
              </div>
            )}

            <div className="board-grid">
              {columns.map(col => (
                <div className="board-column" key={col.key}>
                  <div className="column-head">
                    <span className={'col-icon ' + col.key}>{col.icon}</span>
                    <div>
                      <strong>{col.title}</strong>
                      <small>{col.sub}</small>
                    </div>
                    <span className="col-count">{filtered.filter(r => r.status === col.key).length}</span>
                  </div>

                  <div className="sticky-list">
                    {filtered.filter(r => r.status === col.key).map((item) => (
                      <article className="sticky" key={item.id}>
                        <div className="sticky-top">
                          <span>{item.category}</span>
                          <div className="menu-holder">
                            <button
                              className="menu"
                              onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                              aria-label={`Actions for ${item.title}`}
                            >
                              ···
                            </button>
                            {openMenu === item.id && (
                              <div className="menu-popup">
                                {item.owner === 'you' ? (
                                  <button onClick={() => edit(item)}>Edit your report</button>
                                ) : (
                                  <span>Reported by another student</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="sticky-emoji">{item.emoji}</div>
                        <h3>{item.title}</h3>
                        <p>{item.description || 'No additional description.'}</p>

                        {item.status !== 'lost' && (
                          <div className="handover-note">
                            {item.handoverStatus === 'received' && item.collectionPoint
                              ? `Received at ${item.collectionPoint}`
                              : item.handoverStatus === 'released'
                              ? 'Collected by owner'
                              : 'Reported found - not confirmed at a collection point'}
                          </div>
                        )}

                        <div className="sticky-bottom">
                          <span>⌖ {item.location || 'Location not provided'}</span>
                          <small>{item.created}</small>
                        </div>
                      </article>
                    ))}

                    {filtered.every(x => x.status !== col.key) && (
                      <div className="empty-column">Nothing here yet</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        <main className="report-page">
          <div className="crumbs">
            <button onClick={() => setPage('board')}>← Noticeboard</button>
            <span>/</span>
            <span>Report an item</span>
          </div>

          <div className="report-layout">
            <div className="report-intro">
              <span className="seal">✺</span>
              <p className="kicker">HELP THE COMMUNITY</p>
              <h1>{current ? 'Update your report' : 'Tell us what happened.'}</h1>
              <p>Small details can help someone recognize their belongings.</p>
              <div className="paper-note">
                Your report will appear on the public campus noticeboard with the details you provide.
              </div>
            </div>

            <section className="form-paper">
              <header>
                <p>NEW NOTICE / FORM 01</p>
                <h2>{current ? 'Edit report' : 'Report an item'}</h2>
              </header>

              <form onSubmit={submit}>
                <label>
                  Item title <b>*</b>
                  <input
                    value={form.title}
                    onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
                    placeholder="e.g., Black backpack"
                  />
                </label>
                <label>
                  Status <b>*</b>
                  <select
                    value={form.status}
                    onChange={e => setForm(s => ({ ...s, status: e.target.value }))}
                  >
                    <option value="">Choose one</option>
                    {statuses.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                  </select>
                </label>
                <label>
                  Category <b>*</b>
                  <select
                    value={form.category}
                    onChange={e => setForm(s => ({ ...s, category: e.target.value }))}
                  >
                    <option value="">Select item category</option>
                    {categories.slice(1).map(s => <option key={s} value={s}>{cap(s)}</option>)}
                  </select>
                </label>
                <label>
                  Last known location
                  <input
                    value={form.location}
                    onChange={e => setForm(s => ({ ...s, location: e.target.value }))}
                    placeholder="Location (optional)"
                  />
                </label>
                <label>
                  More details
                  <textarea
                    rows="6"
                    value={form.description}
                    onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
                    placeholder="Describe your item"
                  />
                </label>

                {error && <div className="form-error" role="alert">{error}</div>}

                <div className="form-actions">
                  <button type="button" onClick={() => setPage('board')}>Go back</button>
                  <button className="report-button" type="submit">
                    {current ? 'Save report' : 'Publish notice'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </main>
      )}

      <footer className="pagefooter">
        <div className="footer-left">
          <span className="footer-brand">FOUND / Campus noticeboard</span>
          <span className="footer-rule">SEARCH • DISCOVER • REUNITE</span>
        </div>
        <div className="footer-right">
          <span>Helping lost things find their way back.</span>
          <span className="footer-bullet">•</span>
          <span>Community project • Demo only</span>
        </div>
      </footer>
    </div>
  );
}
