import React, {useEffect, useMemo, useState} from 'react';

const STORE = 'acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed = [
  {id: 'f1', title: 'Black backpack', category: 'accessories', status: 'lost', location: 'Library - second floor', description: 'Black backpack with a small red keychain. Left near the study desks.', owner: 'you', created: 'Oct 23', emoji: '🎒'},
  {id: 'f2', title: 'Dark backpack', category: 'accessories', status: 'found', location: 'Library - main stairwell', description: 'Found a dark backpack with a small red keychain near the library stairs.', owner: 'other', created: 'Oct 24', emoji: '🎒', collectionPoint: 'Campus Security Desk', handoverStatus: 'received'},
  {id: 'f3', title: 'Student ID card', category: 'documents', status: 'found', location: 'Near Gate 3', description: 'A student card was turned in. No personal details are published.', owner: 'other', created: 'Oct 24', emoji: '🪪', collectionPoint: 'Student Services Office', handoverStatus: 'received'},
  {id: 'f4', title: 'Wireless earbuds', category: 'electronics', status: 'lost', location: 'Main cafeteria', description: 'White earbuds in a distinctive blue case. Lost on Monday.', owner: 'other', created: 'Oct 24', emoji: '🎧'},
  {id: 'f5', title: 'Earbuds in blue case', category: 'electronics', status: 'found', location: 'Cafeteria entrance', description: 'White earbuds in a blue charging case found near the coffee counter.', owner: 'other', created: 'Oct 25', emoji: '🎧', collectionPoint: '', handoverStatus: 'reported'},
  {id: 'f6', title: 'Blue sports bottle', category: 'other', status: 'lost', location: 'Sports Hall - lockers', description: 'Tall blue metal water bottle, possibly left after practice.', owner: 'other', created: 'Oct 25', emoji: '🥤'},
  {id: 'f7', title: 'Metal water bottle', category: 'other', status: 'found', location: 'Sports Hall - benches', description: 'Blue reusable metal bottle found after a basketball session.', owner: 'other', created: 'Oct 25', emoji: '🥤', collectionPoint: 'Campus Security Desk', handoverStatus: 'received'},
  {id: 'f8', title: 'Engineering lab coat', category: 'clothing', status: 'claimed', location: 'Building C', description: 'Owner verified the item and collected it from the reception desk.', owner: 'you', created: 'Oct 22', emoji: '🥼', collectionPoint: 'Library Reception', handoverStatus: 'released'},
  {id: 'f9', title: 'Small notebook', category: 'other', status: 'lost', location: 'C7 lecture room', description: 'Brown cover with handwritten engineering notes.', owner: 'other', created: 'Oct 25', emoji: '📒'},
  {id: 'f10', title: 'Scientific calculator', category: 'electronics', status: 'lost', location: 'B2 lecture hall', description: 'Black scientific calculator with a protective cover.', owner: 'other', created: 'Oct 26', emoji: '🧮'},
  {id: 'f11', title: 'Calculator', category: 'electronics', status: 'found', location: 'B2 study area', description: 'Scientific calculator with a black cover, found on a desk.', owner: 'you', created: 'Oct 26', emoji: '🧮', collectionPoint: 'Library Reception', handoverStatus: 'received'},
  {id: 'f12', title: 'Canvas tote bag', category: 'accessories', status: 'lost', location: 'Main campus bus stop', description: 'Beige tote with green writing on one side.', owner: 'other', created: 'Oct 26', emoji: '👜'},
  {id: 'f13', title: 'USB flash drive', category: 'electronics', status: 'found', location: 'Building A computer lab', description: 'A small black flash drive was found beside a workstation.', owner: 'other', created: 'Oct 27', emoji: '💾', collectionPoint: '', handoverStatus: 'reported'},
];
const categories = ['all', 'electronics', 'clothing', 'documents', 'accessories', 'other'];
const statuses = ['lost', 'found', 'claimed'];
const clean = {title: '', category: '', status: '', location: '', description: ''};

function getSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    return Array.isArray(saved) ? saved : seed;
  } catch {
    return seed;
  }
}

const cap = value => value.charAt(0).toUpperCase() + value.slice(1);

function validate(form, items, id) {
  if (!form.title.trim() || form.title.trim().length < 2) return 'Title must be at least 2 characters.';
  if (!categories.slice(1).includes(form.category)) return 'Choose a category.';
  if (!statuses.includes(form.status)) return 'Choose lost, found or claimed.';
  if (items.some(item => item.id !== id
    && item.title.toLowerCase() === form.title.trim().toLowerCase()
    && (item.location || '').toLowerCase() === (form.location || '').trim().toLowerCase())) {
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

  const filtered = useMemo(() => items.filter(item =>
    (cat === 'all' || item.category === cat)
    && (filterStatus === 'all' || item.status === filterStatus)
    && `${item.title} ${item.location} ${item.description}`.toLowerCase().includes(q.toLowerCase()),
  ), [items, q, cat, filterStatus]);

  function create() {
    setCurrent(null);
    setForm({...clean});
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
      location: row.location,
      description: row.description,
    });
    setOpenMenu(null);
    setError('');
    setPage('form');
  }

  function submit(event) {
    event.preventDefault();
    const validationError = validate(form, items, current);
    if (validationError) {
      setError('Please review your entries.');
      return;
    }

    const report = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      owner: 'you',
      created: 'Today',
      emoji: current ? items.find(item => item.id === current)?.emoji : '📌',
      ...(current ? {} : {collectionPoint: '', handoverStatus: 'reported'}),
    };

    if (current) {
      setItems(items.map(item => item.id === current ? {...item, ...report} : item));
      setMessage('Report updated.');
    } else {
      setItems([{id: `f-${Date.now()}`, ...report}, ...items]);
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

  return (
    <div className="notice-app">
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
        <main className="workspace">
          <button className="report-button workspace-report" onClick={create}>Report</button>
          <aside className="filters">
            <p className="kicker">YOUR NOTICEBOARD</p>
            <h1>Lost something?<br/><em>You're in the right place.</em></h1>
            <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
            <div className="filterbox">
              <h3>Browse reports</h3>
              <label>
                Search items or locations
                <input
                  value={q}
                  onChange={event => setQ(event.target.value)}
                  placeholder="Try “backpack” or “Library”"
                />
                <span className="search-hint">Matches item names, locations, and descriptions.</span>
              </label>
              <label>
                Item category
                <select value={cat} onChange={event => setCat(event.target.value)}>
                  <option value="all">All categories</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{cap(category)}</option>
                  ))}
                </select>
              </label>
              <div className="filterbuttons">
                <button onClick={() => {
                  setQ('');
                  setCat('all');
                  setFilterStatus('all');
                }}>
                  Clear filters
                </button>
              </div>
            </div>
            <button className="reset" onClick={reset}>Reset demo data</button>
          </aside>
          <section className="board">
            <div className="board-top">
              <div>
                <p className="kicker">CAMPUS COMMUNITY</p>
                <h2>Latest notices <span>({filtered.length})</span></h2>
              </div>
              <span className="time-note">Updated today</span>
            </div>
            <div className="status-filters" role="group" aria-label="Filter reports by status">
              <span>Show:</span>
              {['all', ...statuses].map(status => (
                <button
                  key={status}
                  className={filterStatus === status ? 'status-filter active' : 'status-filter'}
                  aria-pressed={filterStatus === status}
                  onClick={() => setFilterStatus(status)}
                >
                  {status === 'all' ? 'All reports' : cap(status)}
                </button>
              ))}
            </div>
            {message && (
              <div className="message" role="status">
                {message}
                <button onClick={() => setMessage('')}>✕</button>
              </div>
            )}
            <div className="board-grid">
              {[
                {key: 'lost', title: 'LOST', sub: 'Searching for these things', icon: '↗'},
                {key: 'found', title: 'FOUND', sub: 'Looking for the owners', icon: '⌁'},
                {key: 'claimed', title: 'CLAIMED', sub: 'Back where they belong', icon: '✓'},
              ].map(column => {
                const columnItems = filtered.filter(item => item.status === column.key);
                return (
                  <div className="board-column" key={column.key}>
                    <div className="column-head">
                      <span className={`col-icon ${column.key}`}>{column.icon}</span>
                      <div>
                        <strong>{column.title}</strong>
                        <small>{column.sub}</small>
                      </div>
                      <span className="col-count">{columnItems.length}</span>
                    </div>
                    <div className="sticky-list">
                      {columnItems.map(item => (
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
                                  {item.owner === 'you'
                                    ? <button onClick={() => edit(item)}>Edit your report</button>
                                    : <span>Reported by another student</span>}
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
                      {columnItems.length === 0 && <div className="empty-column">Nothing here yet</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      ) : (
        <main className="report-page">
          <button className="report-button form-back" onClick={() => setPage('board')}>Back</button>
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
                <h2>{current ? 'Edit report' : 'New notice'}</h2>
              </header>
              <form onSubmit={submit}>
                <label>
                  Item title <b>*</b>
                  <input
                    value={form.title}
                    onChange={event => setForm(value => ({...value, title: event.target.value}))}
                    placeholder="e.g., Black backpack"
                  />
                </label>
                <label>
                  Status <b>*</b>
                  <select
                    value={form.status}
                    onChange={event => setForm(value => ({...value, status: event.target.value}))}
                  >
                    <option value="">Choose one</option>
                    {statuses.map(status => <option key={status} value={status}>{cap(status)}</option>)}
                  </select>
                </label>
                <label>
                  Category <b>*</b>
                  <select
                    value={form.category}
                    onChange={event => setForm(value => ({...value, category: event.target.value}))}
                  >
                    <option value="">Select item category</option>
                    {categories.slice(1).map(category => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <label>
                  Last known location
                  <input
                    value={form.location}
                    onChange={event => setForm(value => ({...value, location: event.target.value}))}
                    placeholder="Location (optional)"
                  />
                </label>
                <label>
                  More details
                  <textarea
                    rows="6"
                    value={form.description}
                    onChange={event => setForm(value => ({...value, description: event.target.value}))}
                    placeholder="Describe your item"
                  />
                </label>
                {error && <div className="form-error" role="alert">{error}</div>}
                <div className="form-actions">
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
