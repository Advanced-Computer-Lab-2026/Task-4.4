import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

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
const statusOptions = [
  { value: 'lost', label: 'I lost something', hint: 'Ask the community to look out for it' },
  { value: 'found', label: 'I found something', hint: 'Help the owner get it back' },
  { value: 'claimed', label: 'Claimed', hint: 'The item is back with its owner' },
];
const columns = [
  { key: 'lost', title: 'LOST', sub: 'Searching for these things', icon: '↗' },
  { key: 'found', title: 'FOUND', sub: 'Looking for the owners', icon: '⌁' },
  { key: 'claimed', title: 'CLAIMED', sub: 'Back where they belong', icon: '✓' },
];
const clean = { title: '', category: '', status: '', location: '', description: '' };
const fieldOrder = ['status', 'title', 'category', 'location'];

function getSaved() { try { const s = JSON.parse(localStorage.getItem(STORE)); return Array.isArray(s) ? s : seed; } catch { return seed; } }
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// Same rules as before; now returns one specific message per field so the form can show it in place.
function validate(f, arr, id) {
  const errors = {};
  if (!f.title.trim() || f.title.trim().length < 2) errors.title = 'Title must be at least 2 characters.';
  if (!categories.slice(1).includes(f.category)) errors.category = 'Choose a category.';
  if (!statuses.includes(f.status)) errors.status = 'Choose lost, found or claimed.';
  if (!errors.title) {
    const dup = arr.find(r => r.id !== id && r.title.toLowerCase() === f.title.trim().toLowerCase() && (r.location || '').toLowerCase() === (f.location || '').trim().toLowerCase());
    if (dup) errors.location = `An item with the same title has already been reported at this location ("${dup.title}", ${dup.location || 'no location'}, ${cap(dup.status)}). Check the existing notice, or change the title or location.`;
  }
  return errors;
}

// What a person looking for their item needs to know next.
function handover(item) {
  if (item.status === 'lost') return null;
  if (item.handoverStatus === 'released') return { tone: 'done', title: 'Collected by owner', text: item.collectionPoint ? `Released from ${item.collectionPoint} after ownership was verified.` : 'Ownership was verified.' };
  if (item.status === 'claimed') return { tone: 'done', title: 'Marked as claimed', text: 'The reporter says this item is back with its owner.' };
  if (item.handoverStatus === 'received' && item.collectionPoint) return { tone: 'held', title: `Held at ${item.collectionPoint}`, text: 'Think it is yours? Bring your student ID and describe the item to collect it.' };
  return { tone: 'pending', title: 'Not yet at a collection point', text: 'Reported by the finder only. Staff have not confirmed they have it.' };
}

// Accessible dialog (slide 24: a modal suits short, focused tasks).
// Traps Tab focus, closes on Escape or backdrop click, returns focus to where it came from.
function Modal({ title, onClose, children, size = 'small' }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const box = ref.current;
    (box.querySelector('[data-autofocus]') || box).focus();
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); }
      if (e.key === 'Tab') {
        const f = [...box.querySelectorAll('button, [href], input, select, textarea')].filter(el => !el.disabled);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; previous?.focus?.(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close.current(); }}>
    <div className={'modal ' + size} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={ref} tabIndex={-1}>
      <div className="modal-head"><h2 id="modal-title">{title}</h2><button className="modal-close" onClick={() => close.current()} aria-label="Close">✕</button></div>
      {children}
    </div>
  </div>;
}

export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('board');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [mine, setMine] = useState(false);
  const [heldOnly, setHeldOnly] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [initialForm, setInitialForm] = useState(clean);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [dialog, setDialog] = useState(null); // { title, text, confirm, cancel, onConfirm }
  const detail = items.find(x => x.id === detailId);
  const boardRef = useRef(null);

  // Equal-size notices across ALL columns: measure the tallest card and give every card that height.
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const fit = () => {
      el.style.setProperty('--card-h', 'auto');
      let max = 0;
      el.querySelectorAll('.sticky').forEach(c => { max = Math.max(max, c.offsetHeight); });
      el.style.setProperty('--card-h', max ? `${max}px` : 'auto');
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [items, q, cat, filterStatus, mine, heldOnly, page]);

  useEffect(() => localStorage.setItem(STORE, JSON.stringify(items)), [items]);

  const filtered = useMemo(() => items.filter(x =>
    (cat === 'all' || x.category === cat) &&
    (filterStatus === 'all' || x.status === filterStatus) &&
    (!mine || x.owner === 'you') &&
    (!heldOnly || (x.status === 'found' && x.handoverStatus === 'received' && x.collectionPoint)) &&
    `${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())
  ), [items, q, cat, filterStatus, mine, heldOnly]);

  const activeFilters = [
    q && { label: `"${q}"`, clear: () => setQ('') },
    cat !== 'all' && { label: cap(cat), clear: () => setCat('all') },
    filterStatus !== 'all' && { label: cap(filterStatus), clear: () => setFilterStatus('all') },
    mine && { label: 'My reports', clear: () => setMine(false) },
    heldOnly && { label: 'At a collection point', clear: () => setHeldOnly(false) },
  ].filter(Boolean);
  const clearFilters = () => { setQ(''); setCat('all'); setFilterStatus('all'); setMine(false); setHeldOnly(false); };
  const visibleColumns = filterStatus === 'all' ? columns : columns.filter(c => c.key === filterStatus);
  const nav = (status, onlyMine = false) => { setFilterStatus(status); setMine(onlyMine); setPage('board'); };
  // Found items reported by others in the same category: a starting point for someone who lost something.
  const matchesFor = item => items.filter(x => x.status === 'found' && x.owner !== 'you' && x.category === item.category);
  const showMatches = item => { setQ(''); setMine(false); setHeldOnly(false); setCat(item.category); setFilterStatus('found'); window.scrollTo(0, 0); };
  const navActive = (status, onlyMine = false) => page === 'board' && filterStatus === status && mine === onlyMine;

  function openForm(id, values) { setCurrent(id); setForm(values); setInitialForm(values); setErrors({}); setPage('form'); window.scrollTo(0, 0); }
  function create() { openForm(null, { ...clean }); }
  function edit(row) {
    if (row.owner !== 'you') return;
    openForm(row.id, { title: row.title, category: row.category, status: row.status, location: row.location || '', description: row.description || '' });
  }
  function cancel() {
    const leave = () => { setPage('board'); setCurrent(null); };
    const dirty = JSON.stringify(form) !== JSON.stringify(initialForm);
    if (!dirty) return leave();
    setDialog({
      title: current ? 'Discard your changes?' : 'Discard this report?',
      text: current ? "Your edits to this report haven't been saved. The published notice will stay as it was." : "You haven't published this report yet. What you've entered will be lost.",
      confirm: 'Discard', cancel: 'Keep editing', onConfirm: leave,
    });
  }
  function update(field, value) {
    setForm(s => ({ ...s, [field]: value }));
    if (errors[field] || (field === 'title' && errors.location)) setErrors(e => { const n = { ...e }; delete n[field]; if (field === 'title') delete n.location; return n; });
  }
  function submit(e) {
    e.preventDefault();
    const v = validate(form, items, current);
    if (Object.keys(v).length) {
      setErrors(v);
      const first = fieldOrder.find(f => v[f]);
      document.getElementById(`field-${first}`)?.focus();
      return;
    }
    const d = { ...form, title: form.title.trim(), location: form.location.trim(), description: form.description.trim(), owner: 'you', created: 'Today', emoji: current ? items.find(x => x.id === current)?.emoji : '📌', ...(current ? {} : { collectionPoint: '', handoverStatus: 'reported' }) };
    const next = d.status === 'found' && !current ? ' Next step: hand the item in at a campus collection point so the owner can recover it after verification.' : '';
    if (current) { setItems(items.map(x => x.id === current ? { ...x, ...d } : x)); setMessage(`"${d.title}" updated.`); }
    else { setItems([{ id: `f-${Date.now()}`, ...d }, ...items]); setMessage(`Your report "${d.title}" has been posted.${next}`); }
    setPage('board'); setCurrent(null);
  }
  function reset() {
    setDialog({
      title: 'Restore the example reports?',
      text: 'Reports you created or edited in this browser will be removed. This cannot be undone.',
      confirm: 'Restore examples', cancel: 'Keep my reports',
      onConfirm: () => { setItems(seed); setPage('board'); clearFilters(); setMessage('Example reports restored.'); },
    });
  }

  const locationLabel = form.status === 'found' ? 'Where did you find it?' : form.status === 'lost' ? 'Where did you last have it?' : 'Location';
  const err = f => errors[f] && <span className="field-error" id={`err-${f}`}>{errors[f]}</span>;
  const errCount = Object.keys(errors).length;

  return <div className="notice-app">
    <header className="header">
      <div className="headline"><span className="sun">✺</span><button onClick={() => nav('all')} className="wordmark">FOUND<span>on campus</span></button></div>
      <nav className="header-links" aria-label="Main">
        <button className={navActive('all') ? 'active' : ''} aria-current={navActive('all') ? 'page' : undefined} onClick={() => nav('all')}>Noticeboard</button>
        <button className={navActive('lost') ? 'active' : ''} aria-current={navActive('lost') ? 'page' : undefined} onClick={() => nav('lost')}>Missing items</button>
        <button className={navActive('found') ? 'active' : ''} aria-current={navActive('found') ? 'page' : undefined} onClick={() => nav('found')}>Recently found</button>
        <button className={navActive('all', true) ? 'active' : ''} aria-current={navActive('all', true) ? 'page' : undefined} onClick={() => nav('all', true)}>My reports</button>
      </nav>
      <button className="report-button" onClick={create}>+ Post a report</button>
    </header>

    {page === 'board' ? <main className="workspace">
      <aside className={'filters' + (showFilters ? ' open' : '')} id="filter-panel">
        <div className="intro-block">
          <p className="kicker">Campus lost &amp; found</p>
          <h1>Lost or found something?</h1>
          <p className="intro">Search the notices. Found items held at a collection point can be picked up once you prove they're yours.</p>
        </div>
        <div className="filterbox">
          <h3>Find a notice</h3>
          <label>Search<input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g., backpack, calculator, library" /></label>
          <label>Category<select value={cat} onChange={e => setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c => <option key={c} value={c}>{cap(c)}</option>)}</select></label>
          <label>Status<select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s => <option key={s} value={s}>{cap(s)}</option>)}</select></label>
          <label className="check"><input type="checkbox" checked={heldOnly} onChange={e => setHeldOnly(e.target.checked)} />Only found items at a collection point</label>
          <label className="check"><input type="checkbox" checked={mine} onChange={e => setMine(e.target.checked)} />Only my reports</label>
          <p className="filter-hint">Results update as you type.</p>
          <button className="report-button filters-done" onClick={() => setShowFilters(false)}>Show {filtered.length} {filtered.length === 1 ? 'result' : 'results'}</button>
        </div>
        <button className="reset" onClick={reset}>Reset demo data</button>
      </aside>

      <section className="board">
        <div className="board-top">
          <h2>Notices <span>{filtered.length}</span></h2>
          <button className="filter-toggle" aria-expanded={showFilters} aria-controls="filter-panel" onClick={() => setShowFilters(s => !s)}>
            {showFilters ? 'Hide filters' : `Search & filters${activeFilters.length ? ` (${activeFilters.length})` : ''}`}
          </button>
        </div>
        {activeFilters.length > 0 && <div className="active-filters" aria-label="Active filters">
          <span className="kicker">Active filters</span>
          {activeFilters.map(f => <button key={f.label} className="chip" onClick={f.clear} aria-label={`Remove filter ${f.label}`}>{f.label} ×</button>)}
          <button className="link" onClick={clearFilters}>Clear all</button>
        </div>}
        {message && <div className="message" role="status"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Dismiss message">✕</button></div>}

        {filtered.length === 0 ? <div className="empty-state">
          <h3>No notices match your search</h3>
          <p>Try fewer words or remove a filter. If you can't find your item, post a lost report so finders can recognise it.</p>
          <div className="empty-actions"><button className="report-button" onClick={create}>Report a lost item</button><button className="link" onClick={clearFilters}>Clear all filters</button></div>
        </div> :
        <div className={`board-grid cols-${visibleColumns.length}`} ref={boardRef}>{visibleColumns.map(col => {
          const list = filtered.filter(r => r.status === col.key);
          return <div className="board-column" key={col.key}>
            <div className="column-head"><span className={'col-icon ' + col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{list.length}</span></div>
            <div className="sticky-list">{list.map(item => {
              const h = handover(item);
              const yours = item.owner === 'you';
              const matches = yours && item.status === 'lost' ? matchesFor(item) : [];
              return <article className={'sticky' + (yours ? ' yours' : '')} key={item.id}>
                <div className="sticky-top"><span>{cap(item.category)}</span>{yours && <span className="your-badge">Your report</span>}</div>
                <div className="sticky-emoji" aria-hidden="true">{item.emoji}</div>
                <h3><button className="title-button" onClick={() => setDetailId(item.id)}>{item.title}</button></h3>
                <p>{item.description || 'No additional description.'}</p>
                {h && <div className={'handover ' + h.tone}><strong>{h.title}</strong><span>{h.text}</span></div>}
                <div className="sticky-bottom"><span>⌖ {item.location || 'Location not provided'}</span><small>{item.created}</small></div>
                <div className="card-actions">
                  <button className="link" onClick={() => setDetailId(item.id)} aria-label={`View details: ${item.title}`}>View details →</button>
                  {matches.length > 0 && <button className="link" onClick={() => showMatches(item)}>See {matches.length} found {cap(item.category).toLowerCase()} {matches.length === 1 ? 'item' : 'items'} →</button>}
                  {yours && <button className="edit-button" onClick={() => edit(item)} aria-label={`Edit your report: ${item.title}`}>Edit report</button>}
                </div>
              </article>;
            })}{list.length === 0 && <div className="empty-column">No {col.key} notices match</div>}</div>
          </div>;
        })}</div>}
      </section>
    </main> :

    <main className="report-page">
      <div className="crumbs"><button onClick={cancel}>← Noticeboard</button><span>/</span><span>{current ? 'Edit report' : 'Report an item'}</span></div>
      <div className="report-layout">
        <div className="report-intro">
          <p className="kicker">{current ? 'EDIT YOUR NOTICE' : 'NEW NOTICE'}</p>
          <h1>{current ? 'Update your report' : 'Report an item'}</h1>
          <p>Specific details (colour, brand, marks) help the owner or finder recognise it. Don't include private information such as ID numbers.</p>
          <div className="paper-note">Your report appears on the public campus noticeboard. Found items are returned through designated collection points after ownership is verified.</div>
        </div>
        <section className="form-paper">
          <form onSubmit={submit} noValidate>
            {errCount > 0 && <div className="form-error" role="alert">{errCount === 1 ? 'One field needs attention' : `${errCount} fields need attention`} before this notice can be published.</div>}

            <fieldset className={'status-group' + (errors.status ? ' invalid' : '')} aria-describedby={errors.status ? 'err-status' : undefined}>
              <legend>What happened? <b>*</b></legend>
              <div className="status-options">{statusOptions.map((o, i) => <label key={o.value} className={'status-option' + (form.status === o.value ? ' selected' : '')}>
                <input type="radio" name="status" value={o.value} id={i === 0 ? 'field-status' : undefined} checked={form.status === o.value} onChange={e => update('status', e.target.value)} />
                <span><strong>{o.label}</strong><small>{o.hint}</small></span>
              </label>)}</div>
              {err('status')}
            </fieldset>

            {form.status === 'found' && <div className="info-note">After posting, please hand the item in at a campus collection point (e.g., Campus Security Desk). Until staff receive it, your notice will show as "Not yet at a collection point".</div>}

            <label>Item title <b>*</b>
              <input id="field-title" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g., Black backpack" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'err-title' : 'hint-title'} />
              {errors.title ? err('title') : <span className="hint" id="hint-title">At least 2 characters.</span>}
            </label>
            <label>Category <b>*</b>
              <select id="field-category" value={form.category} onChange={e => update('category', e.target.value)} aria-invalid={!!errors.category} aria-describedby={errors.category ? 'err-category' : undefined}>
                <option value="">Select a category</option>{categories.slice(1).map(s => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
              {err('category')}
            </label>
            <label>{locationLabel} <span className="optional">(optional)</span>
              <input id="field-location" value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g., Library - second floor" aria-invalid={!!errors.location} aria-describedby={errors.location ? 'err-location' : undefined} />
              {err('location')}
            </label>
            <label>Description <span className="optional">(optional)</span>
              <textarea rows="5" value={form.description} onChange={e => update('description', e.target.value)} placeholder="e.g., Black backpack with a small red keychain" />
            </label>
            <div className="form-actions"><button type="button" onClick={cancel}>Cancel</button><button className="report-button" type="submit">{current ? 'Save changes' : 'Publish notice'}</button></div>
          </form>
        </section>
      </div>
    </main>}
    {detail && (() => {
      const h = handover(detail);
      const yours = detail.owner === 'you';
      const matches = yours && detail.status === 'lost' ? matchesFor(detail) : [];
      const closeThen = fn => () => { setDetailId(null); fn(); };
      return <Modal title={detail.title} onClose={() => setDetailId(null)} size="medium">
        <div className="detail">
          <div className="detail-meta">
            <span className={'status-chip ' + detail.status}>{cap(detail.status)}</span>
            <span>{cap(detail.category)}</span>
            <span>Posted {detail.created}</span>
            {yours && <span className="your-badge">Your report</span>}
          </div>
          <p className="detail-desc">{detail.description || 'No additional description.'}</p>
          <dl className="detail-facts">
            <div><dt>{detail.status === 'lost' ? 'Last seen' : 'Found at'}</dt><dd>{detail.location || 'Location not provided'}</dd></div>
            {detail.status !== 'lost' && <div><dt>Collection point</dt><dd>{detail.collectionPoint || 'Not handed in yet'}</dd></div>}
          </dl>
          {h && <div className={'handover ' + h.tone}><strong>{h.title}</strong><span>{h.text}</span></div>}

          {h?.tone === 'held' && !yours && <div className="detail-section">
            <h3>Is this yours? How to collect it</h3>
            <ol className="steps">
              <li>Go to <strong>{detail.collectionPoint}</strong>.</li>
              <li>Bring your student ID.</li>
              <li>Describe the item (colour, marks, contents) so staff can verify it's yours.</li>
            </ol>
          </div>}
          {h?.tone === 'pending' && !yours && <div className="detail-section">
            <h3>Is this yours?</h3>
            <p>Staff haven't received this item yet, so it can't be collected. Check back later, or ask at a campus collection point.</p>
          </div>}
          {detail.status === 'lost' && !yours && <div className="detail-section">
            <h3>Found this item?</h3>
            <p>Hand it in at a campus collection point, then post a found report so the owner knows where it is.</p>
          </div>}
        </div>
        <div className="modal-actions">
          {matches.length > 0 && <button className="link" onClick={closeThen(() => showMatches(detail))}>See {matches.length} possible {matches.length === 1 ? 'match' : 'matches'} →</button>}
          <span className="spacer" />
          <button className="edit-button" onClick={() => setDetailId(null)}>Close</button>
          {yours && <button className="report-button" data-autofocus onClick={closeThen(() => edit(detail))}>Edit report</button>}
          {detail.status === 'lost' && !yours && <button className="report-button" data-autofocus onClick={closeThen(() => openForm(null, { ...clean, status: 'found', category: detail.category }))}>Report it as found</button>}
        </div>
      </Modal>;
    })()}

    {dialog && <Modal title={dialog.title} onClose={() => setDialog(null)}>
      <p className="dialog-text">{dialog.text}</p>
      <div className="modal-actions">
        <span className="spacer" />
        <button className="edit-button" data-autofocus onClick={() => setDialog(null)}>{dialog.cancel}</button>
        <button className="report-button danger" onClick={() => { const fn = dialog.onConfirm; setDialog(null); fn(); }}>{dialog.confirm}</button>
      </div>
    </Modal>}

    <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
  </div>;
}
