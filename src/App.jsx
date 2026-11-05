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

const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

function validate(f, arr, id) {
  const errors = {};
  const trimmedTitle = (f.title || '').trim();
  if (!trimmedTitle) {
    errors.title = 'Title is required (at least 2 characters).';
  } else if (trimmedTitle.length < 2) {
    errors.title = 'Title must be at least 2 characters.';
  }

  if (!f.status || !statuses.includes(f.status)) {
    errors.status = 'Please choose lost, found or claimed.';
  }

  if (!f.category || !categories.slice(1).includes(f.category)) {
    errors.category = 'Please choose a category.';
  }

  const trimmedLoc = (f.location || '').trim();
  if (
    trimmedTitle &&
    arr.some(
      r =>
        r.id !== id &&
        r.title.toLowerCase() === trimmedTitle.toLowerCase() &&
        (r.location || '').toLowerCase() === trimmedLoc.toLowerCase()
    )
  ) {
    const dupMsg = 'An item with the same title has already been reported at this location.';
    errors.title = dupMsg;
    errors.location = dupMsg;
  }

  return errors;
}

export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('board');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(items));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(
      x =>
        (cat === 'all' || x.category === cat) &&
        (filterStatus === 'all' || x.status === filterStatus) &&
        `${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [items, q, cat, filterStatus]);

  function create() {
    setCurrent(null);
    setForm({ ...clean });
    setFieldErrors({});
    setPage('form');
  }

  function edit(row) {
    if (row.owner !== 'you') return;
    setCurrent(row.id);
    setForm({
      title: row.title,
      category: row.category,
      status: row.status,
      location: row.location || '',
      description: row.description || ''
    });
    setFieldErrors({});
    setPage('form');
  }

  function handleFieldChange(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function submit(e) {
    e.preventDefault();
    const errors = validate(form, items, current);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const d = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      owner: 'you',
      created: current ? (items.find(x => x.id === current)?.created || 'Today') : 'Today',
      emoji: current ? items.find(x => x.id === current)?.emoji || '📌' : '📌',
      ...(current ? {} : { collectionPoint: '', handoverStatus: 'reported' })
    };

    if (current) {
      setItems(items.map(x => (x.id === current ? { ...x, ...d } : x)));
      setMessage('Report updated.');
    } else {
      setItems([{ id: `f-${Date.now()}`, ...d }, ...items]);
      setMessage('Your report has been posted.');
    }
    setPage('board');
    setCurrent(null);
    setFieldErrors({});
  }

  function reset() {
    setItems(seed);
    setPage('board');
    setQ('');
    setCat('all');
    setFilterStatus('all');
    setMessage('Example reports restored.');
  }

  return (
    <div className="notice-app">
      {/* 1. Yellow header banner showing logo only */}
      <header className="header">
        <div className="headline">
          <span className="sun">✺</span>
          <button onClick={() => setPage('board')} className="wordmark">
            FOUND<span>on campus</span>
          </button>
          <p>Community noticeboard</p>
        </div>
      </header>

      <div className="ruleline">
        <span>SEARCH • DISCOVER • REUNITE</span>
        <span>Helping lost things find their way back.</span>
      </div>

      {page === 'board' ? (
        <main className="workspace-container">
          {/* 2. Search & filter row: Search & filter card on left, report button outside the card on right */}
          <div className="search-filter-row">
            <section className="search-filter-card">
              <div className="search-box">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                  type="search"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search items by name, location, or details..."
                  aria-label="Search items"
                />
                {q && (
                  <button className="clear-search" onClick={() => setQ('')} aria-label="Clear search">
                    ✕
                  </button>
                )}
              </div>

              <div className="filter-controls">
                <label>
                  Category:
                  <select value={cat} onChange={e => setCat(e.target.value)}>
                    <option value="all">All categories</option>
                    {categories.slice(1).map(c => (
                      <option key={c} value={c}>{cap(c)}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Status:
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All statuses</option>
                    {statuses.map(s => (
                      <option key={s} value={s}>{cap(s)}</option>
                    ))}
                  </select>
                </label>

                {(q || cat !== 'all' || filterStatus !== 'all') && (
                  <button
                    className="clear-filters-btn"
                    onClick={() => { setQ(''); setCat('all'); setFilterStatus('all'); }}
                  >
                    Clear filters
                  </button>
                )}

                <button className="reset-btn" onClick={reset}>Reset demo data</button>
              </div>
            </section>

            <button className="report-button" onClick={create}>
              + Post a report
            </button>
          </div>

          <section className="board">
            <div className="board-top">
              <div>
                <p className="kicker">CAMPUS COMMUNITY</p>
                <h2>
                  Latest notices <span>({filtered.length})</span>
                </h2>
              </div>
              <span className="time-note">Updated today</span>
            </div>

            {message && (
              <div className="message" role="status">
                {message}
                <button onClick={() => setMessage('')} aria-label="Close message">✕</button>
              </div>
            )}

            <div className="board-grid">
              {[
                { key: 'lost', title: 'LOST', sub: 'Searching for these things', icon: '↗' },
                { key: 'found', title: 'FOUND', sub: 'Looking for the owners', icon: '⌁' },
                { key: 'claimed', title: 'CLAIMED', sub: 'Back where they belong', icon: '✓' }
              ].map(col => (
                <div className="board-column" key={col.key}>
                  <div className="column-head">
                    <span className={'col-icon ' + col.key}>{col.icon}</span>
                    <div>
                      <strong>{col.title}</strong>
                      <small>{col.sub}</small>
                    </div>
                    <span className="col-count">
                      {filtered.filter(r => r.status === col.key).length}
                    </span>
                  </div>

                  <div className="sticky-list">
                    {filtered
                      .filter(r => r.status === col.key)
                      .map(item => (
                        <article className="sticky" key={item.id}>
                          <div className="sticky-top">
                            <span>{item.category}</span>
                            {/* Visible Edit button ONLY (replaces 3 dots, preserving card design) */}
                            {item.owner === 'you' && (
                              <button
                                className="edit-btn"
                                onClick={() => edit(item)}
                                aria-label={`Edit ${item.title}`}
                              >
                                Edit
                              </button>
                            )}
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

              <form onSubmit={submit} noValidate>
                {/* Descriptive error reasons when missing mandatory fields */}
                {Object.keys(fieldErrors).length > 0 && (
                  <div className="form-error" role="alert">
                    <strong>Please fix the following:</strong>
                    <ul>
                      {Object.entries(fieldErrors).map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <label>
                  Item title <b>*</b>
                  <input
                    className={fieldErrors.title ? 'field-invalid' : ''}
                    value={form.title}
                    onChange={e => handleFieldChange('title', e.target.value)}
                    placeholder="e.g., Black backpack"
                  />
                  {fieldErrors.title && <span className="field-error-text">{fieldErrors.title}</span>}
                </label>

                <label>
                  Status <b>*</b>
                  <select
                    className={fieldErrors.status ? 'field-invalid' : ''}
                    value={form.status}
                    onChange={e => handleFieldChange('status', e.target.value)}
                  >
                    <option value="">Choose one</option>
                    {statuses.map(s => (
                      <option key={s} value={s}>{cap(s)}</option>
                    ))}
                  </select>
                  {fieldErrors.status && <span className="field-error-text">{fieldErrors.status}</span>}
                </label>

                <label>
                  Category <b>*</b>
                  <select
                    className={fieldErrors.category ? 'field-invalid' : ''}
                    value={form.category}
                    onChange={e => handleFieldChange('category', e.target.value)}
                  >
                    <option value="">Select item category</option>
                    {categories.slice(1).map(s => (
                      <option key={s} value={s}>{cap(s)}</option>
                    ))}
                  </select>
                  {fieldErrors.category && <span className="field-error-text">{fieldErrors.category}</span>}
                </label>

                <label>
                  Last known location
                  <input
                    className={fieldErrors.location ? 'field-invalid' : ''}
                    value={form.location}
                    onChange={e => handleFieldChange('location', e.target.value)}
                    placeholder="Location (optional)"
                  />
                  {fieldErrors.location && <span className="field-error-text">{fieldErrors.location}</span>}
                </label>

                <label>
                  More details
                  <textarea
                    rows="6"
                    value={form.description}
                    onChange={e => handleFieldChange('description', e.target.value)}
                    placeholder="Describe your item"
                  />
                </label>

                <div className="form-actions">
                  <button type="button" onClick={() => setPage('board')}>
                    Go back
                  </button>
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
        <span>FOUND / Campus noticeboard</span>
        <span>Community project • Demo only</span>
      </footer>
    </div>
  );
}
