import React, { useEffect, useMemo, useState } from 'react';

const STORE = 'acl-foundboard-v3';
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
const cap = value => value.charAt(0).toUpperCase() + value.slice(1);

function getSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    return Array.isArray(saved) ? saved : seed;
  } catch {
    return seed;
  }
}

function validate(form, items, editingId) {
  if (!form.title.trim() || form.title.trim().length < 2) {
    return { field: 'title', message: 'Enter an item title with at least 2 characters.' };
  }
  if (!categories.slice(1).includes(form.category)) {
    return { field: 'category', message: 'Choose a category for this item.' };
  }
  if (!statuses.includes(form.status)) {
    return { field: 'status', message: 'Choose whether the item is lost, found or claimed.' };
  }
  const duplicate = items.some(item =>
    item.id !== editingId &&
    item.title.toLowerCase() === form.title.trim().toLowerCase() &&
    (item.location || '').toLowerCase() === (form.location || '').trim().toLowerCase()
  );
  if (duplicate) {
    return { field: 'title', message: 'A report with this title already exists at this location. Check the noticeboard before posting another one.' };
  }
  return null;
}

export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('board');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => localStorage.setItem(STORE, JSON.stringify(items)), [items]);

  const filtered = useMemo(() => items.filter(item =>
    (cat === 'all' || item.category === cat) &&
    (filterStatus === 'all' || item.status === filterStatus) &&
    `${item.title} ${item.location} ${item.description}`.toLowerCase().includes(q.trim().toLowerCase())
  ), [items, q, cat, filterStatus]);
  const hasActiveFilters = Boolean(q.trim()) || cat !== 'all' || filterStatus !== 'all';

  function clearFilters() {
    setQ('');
    setCat('all');
    setFilterStatus('all');
  }

  function create() {
    setCurrent(null);
    setForm({ ...clean });
    setError(null);
    setPage('form');
  }

  function edit(row) {
    if (row.owner !== 'you') return;
    setCurrent(row.id);
    setForm({ title: row.title, category: row.category, status: row.status, location: row.location, description: row.description });
    setOpenMenu(null);
    setError(null);
    setPage('form');
  }

  function updateField(field, value) {
    setForm(previous => ({ ...previous, [field]: value }));
    if (error?.field === field) setError(null);
  }

  function submit(event) {
    event.preventDefault();
    const validationError = validate(form, items, current);
    if (validationError) {
      setError(validationError);
      return;
    }

    const data = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      owner: 'you',
      created: 'Today',
      emoji: current ? items.find(item => item.id === current)?.emoji : '📌',
      ...(current ? {} : { collectionPoint: '', handoverStatus: 'reported' }),
    };

    if (current) {
      setItems(items.map(item => item.id === current ? { ...item, ...data } : item));
      setMessage('Report updated.');
    } else {
      setItems([{ id: `f-${Date.now()}`, ...data }, ...items]);
      setMessage('Your report has been posted.');
    }
    setPage('board');
    setCurrent(null);
  }

  function reset() {
    setItems(seed);
    setPage('board');
    clearFilters();
    setMessage('Example reports restored.');
  }

  const columns = [
    { key: 'lost', title: 'LOST', sub: 'Searching for these things', icon: '↗' },
    { key: 'found', title: 'FOUND', sub: 'Looking for the owners', icon: '⌁' },
    { key: 'claimed', title: 'CLAIMED', sub: 'Back where they belong', icon: '✓' },
  ];

  return (
    <div className="notice-app">
      <header className="header">
        <div className="headline"><span className="sun">✺</span><button onClick={() => setPage('board')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div>
        <div className="header-links">
          <button onClick={() => setPage('board')}>Noticeboard</button>
          <button onClick={() => { setFilterStatus('lost'); setPage('board'); }}>Missing items</button>
          <button onClick={() => { setFilterStatus('found'); setPage('board'); }}>Recently found</button>
        </div>
        <button className="report-button" onClick={create}>+ Post a report</button>
      </header>
      <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>

      {page === 'board' ? (
        <main className="workspace">
          <aside className="filters">
            <p className="kicker">YOUR NOTICEBOARD</p>
            <h1>Lost something?<br /><em>You're in the right place.</em></h1>
            <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
            <div className="filterbox">
              <h3>Browse reports</h3>
              <label>Search items<input value={q} onChange={event => setQ(event.target.value)} placeholder="What are you looking for?" /></label>
              <label>Item category<select value={cat} onChange={event => setCat(event.target.value)}><option value="all">All categories</option>{categories.slice(1).map(category => <option key={category} value={category}>{cap(category)}</option>)}</select></label>
              <label>Report status<select value={filterStatus} onChange={event => setFilterStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map(status => <option key={status} value={status}>{cap(status)}</option>)}</select></label>
              <div className="filter-feedback" aria-live="polite">Showing <strong>{filtered.length}</strong> of {items.length} reports</div>
              <div className="filterbuttons"><button onClick={clearFilters} disabled={!hasActiveFilters}>Clear filters</button></div>
            </div>
            <div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div>
            <button className="reset" onClick={reset}>Reset demo data</button>
          </aside>

          <section className="board">
            <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>
            {message && <div className="message" role="status">{message}<button onClick={() => setMessage('')}>✕</button></div>}

            {filtered.length === 0 ? (
              <div className="no-results" role="status">
                <span className="no-results-icon">⌕</span>
                <h3>No matching reports</h3>
                <p>Try a different keyword or remove one of your filters to see more campus notices.</p>
                <button onClick={clearFilters}>Clear filters and show all reports</button>
              </div>
            ) : (
              <div className="board-grid">
                {columns.map(column => {
                  const columnItems = filtered.filter(item => item.status === column.key);
                  return (
                    <div className="board-column" key={column.key}>
                      <div className="column-head"><span className={`col-icon ${column.key}`}>{column.icon}</span><div><strong>{column.title}</strong><small>{column.sub}</small></div><span className="col-count">{columnItems.length}</span></div>
                      <div className="sticky-list">
                        {columnItems.map(item => (
                          <article className="sticky" key={item.id}>
                            <div className="sticky-top"><span>{item.category}</span><div className="menu-holder"><button className="menu" onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)} aria-label={`Actions for ${item.title}`}>···</button>{openMenu === item.id && <div className="menu-popup">{item.owner === 'you' ? <button onClick={() => edit(item)}>Edit your report</button> : <span>Reported by another student</span>}</div>}</div></div>
                            <div className="sticky-emoji">{item.emoji}</div>
                            <h3>{item.title}</h3>
                            <p>{item.description || 'No additional description.'}</p>
                            {item.status !== 'lost' && (
                              <div className={`handover-note ${item.handoverStatus || 'reported'}`}>
                                {item.handoverStatus === 'received' && item.collectionPoint
                                  ? <><strong>AVAILABLE FOR COLLECTION</strong><span>Held at {item.collectionPoint}</span></>
                                  : (item.handoverStatus === 'released' || item.status === 'claimed')
                    ? <><strong>RETURNED TO OWNER</strong><span>This item has been collected.</span></>
                    : <><strong>NOT YET HANDED IN</strong><span>Reported found, but campus staff have not confirmed receiving it.</span></>}
                              </div>
                            )}
                            <div className="sticky-bottom"><span>⌖ {item.location || 'Location not provided'}</span><small>{item.created}</small></div>
                          </article>
                        ))}
                        {columnItems.length === 0 && <div className="empty-column">No {column.title.toLowerCase()} reports match these filters</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="report-page">
          <div className="crumbs"><button onClick={() => setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div>
          <div className="report-layout">
            <div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current ? 'Update your report' : 'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
            <section className="form-paper">
              <header><p>NEW NOTICE / FORM 01</p><h2>{current ? 'Edit report' : 'Report an item'}</h2></header>
              <form onSubmit={submit} noValidate>
                <label>Item title <b>*</b><input value={form.title} onChange={event => updateField('title', event.target.value)} aria-invalid={error?.field === 'title'} placeholder="e.g., Black backpack" /></label>
                <label>Status <b>*</b><select value={form.status} onChange={event => updateField('status', event.target.value)} aria-invalid={error?.field === 'status'}><option value="">Choose one</option>{statuses.map(status => <option key={status} value={status}>{cap(status)}</option>)}</select></label>
                <label>Category <b>*</b><select value={form.category} onChange={event => updateField('category', event.target.value)} aria-invalid={error?.field === 'category'}><option value="">Select item category</option>{categories.slice(1).map(category => <option key={category} value={category}>{cap(category)}</option>)}</select></label>
                <label>
                  {form.status === 'lost' ? 'Where did you last see it?' : form.status === 'found' ? 'Where did you find it?' : form.status === 'claimed' ? 'Where was it collected?' : 'Item location'}
                  <input value={form.location} onChange={event => updateField('location', event.target.value)} placeholder={form.status === 'lost' ? 'e.g., Library, second floor' : form.status === 'found' ? 'e.g., Main cafeteria entrance' : form.status === 'claimed' ? 'e.g., Student Services Office' : 'Enter a campus location'} />
                  <span className="field-hint">{form.status === 'lost' ? 'Add the last place you remember having the item.' : form.status === 'found' ? 'Tell the owner where the item was found.' : form.status === 'claimed' ? 'Share where the item was handed back.' : 'Choose Lost, Found or Claimed to get a more specific location prompt.'}</span>
                </label>
                <label>More details<textarea rows="6" value={form.description} onChange={event => updateField('description', event.target.value)} placeholder="Describe your item" /></label>
                {error && <div className="form-error" role="alert">{error.message}</div>}
                <div className="form-actions"><button type="button" onClick={() => setPage('board')}>Go back</button><button className="report-button" type="submit">{current ? 'Save report' : 'Publish notice'}</button></div>
              </form>
            </section>
          </div>
        </main>
      )}
      <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
    </div>
  );
}
