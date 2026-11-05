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
const collectionPoints = [
  'Campus Security Desk',
  'Student Services Office',
  'Library Reception',
];
const categoryEmojis = {
  electronics: '🔌',
  clothing: '🧥',
  documents: '🪪',
  accessories: '🎒',
  other: '📌',
};

const clean = {
  title: '',
  category: '',
  status: '',
  location: '',
  description: '',
  collectionPoint: '',
  handoverStatus: 'reported',
};

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
  if (!f.title.trim() || f.title.trim().length < 2)
    return 'Title must be at least 2 characters.';
  if (!categories.slice(1).includes(f.category))
    return 'Choose a category.';
  if (!statuses.includes(f.status))
    return 'Choose lost, found or claimed.';
  if (
    arr.some(
      r =>
        r.id !== id &&
        r.title.toLowerCase() === f.title.trim().toLowerCase() &&
        (r.location || '').toLowerCase() === (f.location || '').trim().toLowerCase()
    )
  )
    return 'An item with the same title has already been reported at this location.';
  return '';
}

export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('board');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('lost');
  const [onlyMine, setOnlyMine] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => localStorage.setItem(STORE, JSON.stringify(items)), [items]);

  const filtered = useMemo(
    () =>
      items.filter(
        x =>
          (cat === 'all' || x.category === cat) &&
          (filterStatus === 'all' || x.status === filterStatus) &&
          (!onlyMine || x.owner === 'you') &&
          `${x.title} ${x.location} ${x.description} ${x.collectionPoint || ''}`
            .toLowerCase()
            .includes(q.toLowerCase())
      ),
    [items, q, cat, filterStatus, onlyMine]
  );

  const hasActiveFilters = q.trim() !== '' || cat !== 'all' || onlyMine;

  function clearFilters() {
    setQ('');
    setCat('all');
    setOnlyMine(false);
  }

  function create(defaultStatus = '') {
    setCurrent(null);
    setForm({ ...clean, status: defaultStatus });
    setError('');
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
      description: row.description || '',
      collectionPoint: row.collectionPoint || '',
      handoverStatus: row.handoverStatus || 'reported',
    });
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

    const existingItem = current ? items.find(x => x.id === current) : null;
    const isLost = form.status === 'lost';
    const isClaimed = form.status === 'claimed';

    let finalCollectionPoint = isLost ? '' : (form.collectionPoint || '').trim();
    let finalHandoverStatus = 'reported';
    if (!isLost) {
      if (isClaimed) {
        finalHandoverStatus = 'released';
      } else if (finalCollectionPoint) {
        finalHandoverStatus = 'received';
      } else {
        finalHandoverStatus = 'reported';
      }
    }

    const d = {
      title: form.title.trim(),
      category: form.category,
      status: form.status,
      location: form.location.trim(),
      description: form.description.trim(),
      owner: 'you',
      created: existingItem ? existingItem.created : 'Today',
      emoji: existingItem ? existingItem.emoji : (categoryEmojis[form.category] || '📌'),
      ...(isLost
        ? { collectionPoint: '', handoverStatus: '' }
        : { collectionPoint: finalCollectionPoint, handoverStatus: finalHandoverStatus }),
    };

    if (current) {
      setItems(items.map(x => (x.id === current ? { ...x, ...d } : x)));
      setMessage(`Report "${d.title}" updated.`);
    } else {
      setItems([{ id: `f-${Date.now()}`, ...d }, ...items]);
      setMessage(`Your ${d.status} report "${d.title}" has been posted.`);
    }
    setFilterStatus(d.status);
    setPage('board');
    setCurrent(null);
  }

  function reset() {
    setItems(seed);
    setPage('board');
    setFilterStatus('lost');
    clearFilters();
    setMessage('Example reports restored.');
  }

  const columnsToShow = [
    { key: 'lost', title: 'LOST', sub: 'Searching for these things', icon: '↗' },
    { key: 'found', title: 'FOUND', sub: 'Looking for the owners', icon: '⌁' },
    { key: 'claimed', title: 'CLAIMED', sub: 'Back where they belong', icon: '✓' },
  ].filter(col => filterStatus === 'all' || filterStatus === col.key);

  return (
    <div className="notice-app">
      <header className="header">
        <div className="headline">
          <span className="sun">✺</span>
          <button
            onClick={() => {
              setFilterStatus('lost');
              setPage('board');
            }}
            className="wordmark"
          >
            FOUND<span>on campus</span>
          </button>
          <p>Community noticeboard</p>
        </div>
        <div className="header-links">
          <button
            className={page === 'board' && filterStatus === 'lost' ? 'active-nav' : ''}
            onClick={() => {
              setFilterStatus('lost');
              setPage('board');
            }}
          >
            Missing items ({items.filter(x => x.status === 'lost').length})
          </button>
          <button
            className={page === 'board' && filterStatus === 'found' ? 'active-nav' : ''}
            onClick={() => {
              setFilterStatus('found');
              setPage('board');
            }}
          >
            Recently found ({items.filter(x => x.status === 'found').length})
          </button>
          <button
            className={page === 'board' && filterStatus === 'claimed' ? 'active-nav' : ''}
            onClick={() => {
              setFilterStatus('claimed');
              setPage('board');
            }}
          >
            Claimed ({items.filter(x => x.status === 'claimed').length})
          </button>
        </div>
        <button className="report-button" onClick={() => create()}>
          + Post a new notice
        </button>
      </header>

      <div className="ruleline">
        <span>SEARCH • DISCOVER • REUNITE</span>
        <span>Collection points: Campus Security Desk • Student Services Office • Library Reception</span>
      </div>

      {page === 'board' ? (
        <main className="workspace">
          <aside className="filters">
            <p className="kicker">YOUR NOTICEBOARD</p>
            <h1>
              Lost something?
              <br />
              <em>You're in the right place.</em>
            </h1>
            <p className="intro">
              Browse what the campus community has shared or post what you've lost or found.
            </p>

            <div className="filterbox">
              <div className="filterbox-head">
                <h3>Search notices</h3>
                <span className="live-badge">Live filter</span>
              </div>
              <label>
                Search items
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Title, location, or keyword..."
                />
              </label>
              <label>
                Item category
                <select value={cat} onChange={e => setCat(e.target.value)}>
                  <option value="all">All categories</option>
                  {categories.slice(1).map(c => (
                    <option key={c} value={c}>
                      {cap(c)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={onlyMine}
                  onChange={e => setOnlyMine(e.target.checked)}
                />
                <span>Show only my reports ({items.filter(x => x.owner === 'you').length})</span>
              </label>
              {hasActiveFilters && (
                <div className="filterbuttons">
                  <button type="button" className="clear-btn" onClick={clearFilters}>
                    Clear search & filters
                  </button>
                </div>
              )}
            </div>

            <button className="reset" onClick={reset}>
              Reset demo data
            </button>
          </aside>

          <section className="board">
            <div className="board-top">
              <div>
                <p className="kicker">CAMPUS COMMUNITY</p>
                <h2>
                  {filterStatus === 'lost'
                    ? 'Missing items'
                    : filterStatus === 'found'
                    ? 'Recently found'
                    : 'Claimed items'}{' '}
                  <span>({filtered.length} shown)</span>
                </h2>
              </div>
              <div className="board-top-right">
                {hasActiveFilters && (
                  <div className="active-filters">
                    {q && (
                      <span className="filter-pill">
                        Search: "{q}" <button onClick={() => setQ('')}>✕</button>
                      </span>
                    )}
                    {cat !== 'all' && (
                      <span className="filter-pill">
                        Category: {cap(cat)} <button onClick={() => setCat('all')}>✕</button>
                      </span>
                    )}
                    {onlyMine && (
                      <span className="filter-pill">
                        My reports only <button onClick={() => setOnlyMine(false)}>✕</button>
                      </span>
                    )}
                  </div>
                )}
                <span className="time-note">Updated today</span>
              </div>
            </div>

            {message && (
              <div className="message" role="status">
                <span>{message}</span>
                <button onClick={() => setMessage('')} aria-label="Dismiss message">
                  ✕
                </button>
              </div>
            )}

            <div className={`board-grid ${columnsToShow.length === 1 ? 'single-col' : ''}`}>
              {columnsToShow.map(col => {
                const colItems = filtered.filter(r => r.status === col.key);
                return (
                  <div className="board-column" key={col.key}>
                    <div className="sticky-list">
                      {colItems.map(item => {
                        const isReceived =
                          item.handoverStatus === 'received' && item.collectionPoint;
                        const isReleased = item.handoverStatus === 'released';
                        return (
                          <article className="sticky" key={item.id}>
                            <div className="sticky-top">
                              <span className="category-tag">{cap(item.category)}</span>
                              <div className="owner-actions">
                                {item.owner === 'you' ? (
                                  <>
                                    <span className="owner-badge yours">Your report</span>
                                    <button
                                      className="edit-btn"
                                      onClick={() => edit(item)}
                                      aria-label={`Edit your report for ${item.title}`}
                                    >
                                      ✎ Edit
                                    </button>
                                  </>
                                ) : (
                                  <span className="owner-badge">Community post</span>
                                )}
                              </div>
                            </div>
                            <div className="sticky-emoji">{item.emoji}</div>
                            <h3>{item.title}</h3>
                            <p>{item.description || 'No additional description.'}</p>

                            {item.status !== 'lost' && (
                              <div
                                className={`handover-note ${
                                  isReceived
                                    ? 'status-received'
                                    : isReleased
                                    ? 'status-released'
                                    : 'status-reported'
                                }`}
                              >
                                {isReceived ? (
                                  <>
                                    <strong>✓ Held at {item.collectionPoint}</strong>
                                    <span>Verify ownership with staff to claim</span>
                                  </>
                                ) : isReleased ? (
                                  <>
                                    <strong>✓ Collected by owner</strong>
                                    {item.collectionPoint && (
                                      <span>Released from {item.collectionPoint}</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <strong>⚠ Reported only (not at a desk yet)</strong>
                                    <span>Not yet confirmed at a campus collection point</span>
                                  </>
                                )}
                              </div>
                            )}

                            <div className="sticky-bottom">
                              <span>⌖ {item.location || 'Location not provided'}</span>
                              <small>{item.created}</small>
                            </div>
                          </article>
                        );
                      })}
                      {colItems.length === 0 && (
                        <div className="empty-column">
                          <p>No {col.key} items match your current filters.</p>
                          {hasActiveFilters && (
                            <button type="button" onClick={clearFilters}>
                              Reset filters
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      ) : (
        <main className="report-page">
          <div className="crumbs">
            <button onClick={() => setPage('board')}>← Noticeboard</button>
            <span>/</span>
            <span>{current ? 'Edit your report' : 'Report an item'}</span>
          </div>
          <div className="report-layout">
            <div className="report-intro">
              <span className="seal">✺</span>
              <p className="kicker">HELP THE COMMUNITY</p>
              <h1>{current ? 'Update your report' : 'Tell us what happened.'}</h1>
              <p>Small details can help someone recognize their belongings and recover them quickly.</p>
              <div className="paper-note">
                <strong>Validation & Duplicate Rules:</strong>
                <ul>
                  <li>Item title must be at least 2 characters.</li>
                  <li>Status and Category are required.</li>
                  <li>The same item title at the exact same location cannot be reported twice.</li>
                </ul>
              </div>
            </div>
            <section className="form-paper">
              <header>
                <p>{current ? 'UPDATE NOTICE / FORM 01' : 'NEW NOTICE / FORM 01'}</p>
                <h2>{current ? 'Edit report' : 'Report an item'}</h2>
              </header>
              <form onSubmit={submit} noValidate>
                <label>
                  <span>
                    Item title <b>*</b> <small className="field-hint">(min. 2 characters)</small>
                  </span>
                  <input
                    value={form.title}
                    onChange={e => {
                      setForm(s => ({ ...s, title: e.target.value }));
                      if (error) setError('');
                    }}
                    placeholder="e.g., Black backpack"
                  />
                </label>

                <div className="form-row">
                  <label>
                    <span>
                      Status <b>*</b>
                    </span>
                    <select
                      value={form.status}
                      onChange={e => {
                        setForm(s => ({ ...s, status: e.target.value }));
                        if (error) setError('');
                      }}
                    >
                      <option value="">Choose one</option>
                      {statuses.map(s => (
                        <option key={s} value={s}>
                          {cap(s)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>
                      Category <b>*</b>
                    </span>
                    <select
                      value={form.category}
                      onChange={e => {
                        setForm(s => ({ ...s, category: e.target.value }));
                        if (error) setError('');
                      }}
                    >
                      <option value="">Select item category</option>
                      {categories.slice(1).map(s => (
                        <option key={s} value={s}>
                          {cap(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  <span>
                    {form.status === 'found' ? 'Where was it found?' : 'Last known location'}{' '}
                    <small className="field-hint">(optional)</small>
                  </span>
                  <input
                    value={form.location}
                    onChange={e => {
                      setForm(s => ({ ...s, location: e.target.value }));
                      if (error) setError('');
                    }}
                    placeholder="e.g., Library - second floor, Main cafeteria"
                  />
                </label>

                {(form.status === 'found' || form.status === 'claimed') && (
                  <div className="collection-point-fieldset">
                    <label>
                      <span>
                        Campus Collection Point{' '}
                        <small className="field-hint">(if handed over to staff)</small>
                      </span>
                      <select
                        value={form.collectionPoint}
                        onChange={e =>
                          setForm(s => ({
                            ...s,
                            collectionPoint: e.target.value,
                            handoverStatus: e.target.value ? 'received' : 'reported',
                          }))
                        }
                      >
                        <option value="">
                          Not handed to a collection point yet (Reported only)
                        </option>
                        {collectionPoints.map(cp => (
                          <option key={cp} value={cp}>
                            Handed over to: {cp}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="collection-helper">
                      {form.collectionPoint
                        ? `✓ Marked as received at ${form.collectionPoint}. Students can verify ownership there.`
                        : 'ℹ A reported item is not automatically confirmed as held by staff until turned in at a collection point.'}
                    </p>
                  </div>
                )}

                <label>
                  <span>
                    More details <small className="field-hint">(optional)</small>
                  </span>
                  <textarea
                    rows="5"
                    value={form.description}
                    onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
                    placeholder="Describe distinguishing features (color, brand, stickers, keychain)..."
                  />
                </label>

                {error && (
                  <div className="form-error" role="alert">
                    <strong>Cannot submit report:</strong> {error}
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" onClick={() => setPage('board')}>
                    Cancel & Go back
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
        <span>Signed in as: You • Community project • Demo only</span>
      </footer>
    </div>
  );
}
