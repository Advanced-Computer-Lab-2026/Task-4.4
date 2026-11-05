import React, { useEffect, useMemo, useRef, useState } from 'react';
import ItemIcon from './ItemIcon.jsx';

const STORE = 'acl-foundboard-v3';
const categories = ['electronics', 'clothing', 'documents', 'accessories', 'other'];
const statuses = ['lost', 'found', 'claimed'];
const clean = { title: '', category: '', status: '', location: '', description: '' };
const defaultFilters = { q: '', category: 'all', status: 'all' };
const cap = value => value.charAt(0).toUpperCase() + value.slice(1);
const columns = [
  { key: 'lost', title: 'Lost', sub: 'Help someone find their belongings', icon: '?' },
  { key: 'found', title: 'Found', sub: 'Waiting to be reunited', icon: '+' },
  { key: 'claimed', title: 'Claimed', sub: 'Back where they belong', icon: '✓' },
];

function readFilters() {
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get('q') || '',
    category: categories.includes(params.get('category')) ? params.get('category') : 'all',
    status: statuses.includes(params.get('status')) ? params.get('status') : 'all',
  };
}

// Keep filters in the URL so browser Back/Forward restores the previous view.
// Consecutive keystrokes form one search step in the history.
function useFilters() {
  const [filters, setFilters] = useState(readFilters);
  const [depth, setDepth] = useState(0);
  const lastChange = useRef(null);
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, filterDepth: 0 }, '');
    const onPop = event => {
      setFilters(readFilters());
      setDepth(event.state?.filterDepth || 0);
      lastChange.current = null;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function update(next, kind = 'filter') {
    if (Object.keys(defaultFilters).every(key => next[key] === filters[key])) return;
    const url = new URL(window.location.href);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === 'all') url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    });
    const replace = kind === 'search' && lastChange.current === 'search' && depth > 0;
    const nextDepth = replace ? depth : depth + 1;
    window.history[replace ? 'replaceState' : 'pushState']({ ...window.history.state, filterDepth: nextDepth }, '', url);
    setDepth(nextDepth);
    setFilters(next);
    lastChange.current = kind;
  }
  return { filters, update, canUndo: depth > 0 };
}

function validate(form, items, id) {
  if (form.title.trim().length < 2) return 'Title must be at least 2 characters.';
  if (!categories.includes(form.category)) return 'Choose a category.';
  if (!statuses.includes(form.status)) return 'Choose lost, found or claimed.';
  if (items.some(item => item.id !== id && item.title.toLowerCase() === form.title.trim().toLowerCase() && (item.location || '').toLowerCase() === form.location.trim().toLowerCase())) {
    return 'An item with the same title has already been reported at this location.';
  }
  return '';
}

export default function BoardApp({ seed }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE));
      return Array.isArray(saved) ? saved : seed;
    } catch { return seed; }
  });
  const [page, setPage] = useState('board');
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const { filters, update, canUndo } = useFilters();
  const { q, category, status } = filters;
  const activeFilters = q !== '' || category !== 'all' || status !== 'all';
  const boardHeading = useRef(null);
  const formHeading = useRef(null);
  const previousPage = useRef(page);

  useEffect(() => localStorage.setItem(STORE, JSON.stringify(items)), [items]);
  useEffect(() => {
    if (previousPage.current !== page) {
      (page === 'board' ? boardHeading : formHeading).current?.focus();
      previousPage.current = page;
    }
  }, [page]);
  useEffect(() => setOpenMenu(null), [q, category, status, page]);

  const matches = useMemo(() => items.filter(item =>
    (category === 'all' || item.category === category) &&
    `${item.title} ${item.location} ${item.description}`.toLowerCase().includes(q.trim().toLowerCase())
  ), [items, q, category]);
  const filtered = matches.filter(item => status === 'all' || item.status === status);
  const visibleColumns = columns.filter(column => status === 'all' || column.key === status);

  function browseAll() {
    update(defaultFilters);
    setPage('board');
  }
  function create() {
    setCurrent(null);
    setForm({ ...clean });
    setError('');
    setPage('form');
  }
  function edit(item) {
    if (item.owner !== 'you') return;
    setCurrent(item.id);
    setForm({ title: item.title, category: item.category, status: item.status, location: item.location || '', description: item.description || '' });
    setError('');
    setPage('form');
  }
  function submit(event) {
    event.preventDefault();
    const issue = validate(form, items, current);
    if (issue) { setError(issue); return; }
    const report = {
      ...form, title: form.title.trim(), location: form.location.trim(), description: form.description.trim(),
      owner: 'you', ...(current ? {} : { created: 'Today', collectionPoint: '', handoverStatus: 'reported' }),
    };
    setItems(previous => current
      ? previous.map(item => item.id === current ? { ...item, ...report } : item)
      : [{ id: `f-${Date.now()}`, ...report }, ...previous]);
    setMessage(current ? 'Report updated.' : 'Your report has been posted.');
    // Show the saved report even if the previous filters would hide it.
    update(defaultFilters);
    setPage('board');
    setCurrent(null);
  }
  function reset() {
    setItems(seed);
    browseAll();
    setMessage('Example reports restored.');
  }

  return <div className="notice-app">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="header">
      <button onClick={browseAll} className="brand" aria-label="Found on campus — all reports">
        <span className="sun" aria-hidden="true">✺</span>
        <span className="wordmark">FOUND<span>on campus</span></span>
      </button>
      <span className="header-description">A little help. A happy reunion.</span>
      <button className="report-button" onClick={create}>+ Post a report</button>
    </header>
    <div className="ruleline"><span>SEARCH · DISCOVER · REUNITE</span><span>Helping lost things find their way back.</span></div>

    {page === 'board' ? <main id="main-content" className="workspace">
      <nav className="browse-tabs" aria-label="Browse reports">
        {[
          { value: 'all', label: 'Noticeboard', count: items.length, icon: '▦' },
          { value: 'lost', label: 'Missing items', count: items.filter(item => item.status === 'lost').length, icon: '?' },
          { value: 'found', label: 'Recently found', count: items.filter(item => item.status === 'found').length, icon: '+' },
        ].map(tab => <button key={tab.value} className={status === tab.value ? 'active' : ''} aria-current={status === tab.value ? 'page' : undefined}
          onClick={() => tab.value === 'all' ? browseAll() : update({ ...filters, status: tab.value })}>
          <span className="tab-icon" aria-hidden="true">{tab.icon}</span><span>{tab.label}</span><span className="tab-count">{tab.count}</span>
        </button>)}
      </nav>
      <aside className="filters" aria-label="Search and filter reports">
        <p className="kicker">YOUR CAMPUS, CONNECTED</p>
        <h1>Lost something?<br /><em>Let’s find it.</em></h1>
        <p className="intro">A familiar place for things that went missing. Browse reports or share a find.</p>
        <div className="filterbox">
          <h2>Find a report</h2>
          <p className="filter-hint">Results update as you choose.</p>
          <label>Search items<input aria-label="Search items" type="search" value={q} onChange={event => update({ ...filters, q: event.target.value }, 'search')} placeholder="Try “backpack” or “library”" /></label>
          <label>Item category<select aria-label="Item category" value={category} onChange={event => update({ ...filters, category: event.target.value })}>
            <option value="all">All categories</option>{categories.map(value => <option key={value} value={value}>{cap(value)}</option>)}
          </select></label>
          <label>Report status<select aria-label="Report status" value={status} onChange={event => update({ ...filters, status: event.target.value })}>
            <option value="all">All statuses</option>{statuses.map(value => <option key={value} value={value}>{cap(value)}</option>)}
          </select></label>
          <div className="filter-actions">
            <button className="text-button" disabled={!canUndo} onClick={() => window.history.back()}>↶ Undo filter change</button>
            <button className="text-button" disabled={!activeFilters} onClick={() => update(defaultFilters)}>Clear all</button>
          </div>
        </div>
        <div className="side-message"><span className="side-symbol" aria-hidden="true">↗</span><strong>A small post.<br />A big relief.</strong><p>Help someone’s belongings find their way home.</p><button onClick={create}>Share your report <span aria-hidden="true">→</span></button></div>
        <button className="reset" onClick={reset}>Reset demo data</button>
      </aside>

      <section className="board" aria-labelledby="board-heading">
        <div className="board-top"><div><p className="kicker">THE COMMUNITY NOTICEBOARD</p>
          <h2 id="board-heading" ref={boardHeading} tabIndex={-1}>{status === 'all' ? 'Latest notices' : `${cap(status === 'lost' ? 'missing' : status)} items`}</h2>
          <p className="results-summary" role="status" aria-live="polite" aria-atomic="true">{filtered.length} {filtered.length === 1 ? 'report' : 'reports'}{activeFilters ? ' matching your filters' : ' from around campus'}</p>
        </div><span className="board-caption">Every item has a story.</span></div>
        {message && <div className="message" role="status">{message}<button onClick={() => setMessage('')} aria-label="Dismiss notification">×</button></div>}
        {activeFilters && <div className="active-filters" aria-label="Active filters">
          <div className="filter-chips">
            {q && <button onClick={() => update({ ...filters, q: '' })} aria-label={`Remove search filter: ${q}`}>Search: {q}<span aria-hidden="true">×</span></button>}
            {category !== 'all' && <button onClick={() => update({ ...filters, category: 'all' })} aria-label={`Remove category filter: ${category}`}>{cap(category)}<span aria-hidden="true">×</span></button>}
            {status !== 'all' && <button onClick={() => update({ ...filters, status: 'all' })} aria-label={`Remove status filter: ${status}`}>{cap(status)}<span aria-hidden="true">×</span></button>}
          </div><button className="text-button back-all" onClick={browseAll}>← Back to all reports</button>
        </div>}

        {filtered.length === 0 ? <div className="empty-results"><span aria-hidden="true">⌕</span><h3>No reports match just yet</h3><p>Try another keyword or remove a filter to see more reports.</p><button className="report-button" onClick={browseAll}>Show all reports</button></div> :
          <div className={`board-grid ${status !== 'all' ? 'single-status' : ''}`}>
            {visibleColumns.map(column => <section className={`board-column ${column.key}`} key={column.key} aria-labelledby={`heading-${column.key}`}>
              <div className="column-head"><span className="col-icon" aria-hidden="true">{column.icon}</span><div><h3 id={`heading-${column.key}`}>{column.title}</h3><small>{column.sub}</small></div><span className="col-count">{filtered.filter(item => item.status === column.key).length}</span></div>
              <div className="sticky-list">{filtered.filter(item => item.status === column.key).map(item => <article className={`sticky status-${item.status}`} key={item.id}>
                <div className="sticky-top"><span className="category-label">{cap(item.category)}</span>
                  {item.owner === 'you' && <div className="menu-holder"><button className="menu" onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)} aria-label={`Actions for ${item.title}`} aria-expanded={openMenu === item.id}>•••</button>
                    {openMenu === item.id && <div className="menu-popup"><button onClick={() => edit(item)}>Edit your report</button></div>}
                  </div>}
                </div>
                <div className="card-identity"><div className="item-icon"><ItemIcon item={item} /></div><span className="status-badge">{item.status === 'lost' ? 'Missing' : cap(item.status)}</span></div>
                <h4>{item.title}</h4><p className="item-description">{item.description || 'No additional description.'}</p>
                {item.status !== 'lost' && <div className="handover-note">{item.handoverStatus === 'released' ? 'Collected by owner' : item.handoverStatus === 'received' && item.collectionPoint ? `Received at ${item.collectionPoint}` : 'Reported found · not yet confirmed at a collection point'}</div>}
                <div className="sticky-bottom"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></svg>{item.location || 'Location not provided'}</span><small>{item.created}</small></div>
                {item.owner === 'you' && <span className="your-report">Your report</span>}
              </article>)}
                {filtered.every(item => item.status !== column.key) && <div className="empty-column">No {column.key} reports match these filters.</div>}
              </div>
            </section>)}
          </div>}
        <div className="board-legend"><span><i className="legend-dot lost" /> Missing</span><span><i className="legend-dot found" /> Found</span><span><i className="legend-dot claimed" /> Claimed</span><p>A color for every step of the journey.</p></div>
      </section>
    </main> : <main id="main-content" className="report-page">
      <div className="crumbs"><button onClick={() => setPage('board')}>← Back to reports</button><span>/</span><span>{current ? 'Edit report' : 'New report'}</span></div>
      <div className="report-layout"><div className="report-intro"><span className="seal" aria-hidden="true">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current ? 'Update your report.' : 'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
        <section className="form-paper"><header><p>{current ? 'UPDATE YOUR NOTICE' : 'A NEW CHANCE TO REUNITE'}</p><h2 ref={formHeading} tabIndex={-1}>{current ? 'Edit report' : 'Report an item'}</h2><span className="required-hint">Fields marked * are required.</span></header>
          <form onSubmit={submit} noValidate>
            <label>Item title *<input required minLength={2} value={form.title} onChange={event => setForm(value => ({ ...value, title: event.target.value }))} placeholder="e.g., Black backpack" /></label>
            <label>Status *<select required value={form.status} onChange={event => setForm(value => ({ ...value, status: event.target.value }))}><option value="">Choose one</option>{statuses.map(value => <option key={value} value={value}>{cap(value)}</option>)}</select></label>
            <label>Category *<select required value={form.category} onChange={event => setForm(value => ({ ...value, category: event.target.value }))}><option value="">Select item category</option>{categories.map(value => <option key={value} value={value}>{cap(value)}</option>)}</select></label>
            <label>Last known location<input value={form.location} onChange={event => setForm(value => ({ ...value, location: event.target.value }))} placeholder="Location (optional)" /></label>
            <label>More details<textarea rows={5} value={form.description} onChange={event => setForm(value => ({ ...value, description: event.target.value }))} placeholder="Describe your item" /></label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <div className="form-actions"><button type="button" onClick={() => setPage('board')}>Go back</button><button className="report-button" type="submit">{current ? 'Save report' : 'Publish notice'}</button></div>
          </form>
        </section>
      </div>
    </main>}
    <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Made for the campus community · Demo only</span></footer>
  </div>;
}
