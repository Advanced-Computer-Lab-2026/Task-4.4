import React, { useEffect, useMemo, useState } from 'react';

const STORE = 'acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed = [
 {id:'f1',title:'Black backpack',category:'accessories',status:'lost',location:'Library - second floor',description:'Black backpack with a small red keychain. Left near the study desks.',owner:'you',created:'Oct 23',emoji:'🎒'},
 {id:'f2',title:'Dark backpack',category:'accessories',status:'found',location:'Library - main stairwell',description:'Found a dark backpack with a small red keychain near the library stairs.',owner:'other',created:'Oct 24',emoji:'🎒',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f3',title:'Student ID card',category:'documents',status:'found',location:'Near Gate 3',description:'A student card was turned in. No personal details are published.',owner:'other',created:'Oct 24',emoji:'🪪',collectionPoint:'Student Services Office',handoverStatus:'received'},
 {id:'f4',title:'Wireless earbuds',category:'electronics',status:'lost',location:'Main cafeteria',description:'White earbuds in a distinctive blue case. Lost on Monday.',owner:'other',created:'Oct 24',emoji:'🎧'},
 {id:'f5',title:'Earbuds in blue case',category:'electronics',status:'found',location:'Cafeteria entrance',description:'White earbuds in a blue charging case found near the coffee counter.',owner:'other',created:'Oct 25',emoji:'🎧',collectionPoint:'',handoverStatus:'reported'},
 {id:'f6',title:'Blue sports bottle',category:'other',status:'lost',location:'Sports Hall - lockers',description:'Tall blue metal water bottle, possibly left after practice.',owner:'other',created:'Oct 25',emoji:'🥤'},
 {id:'f7',title:'Metal water bottle',category:'other',status:'found',location:'Sports Hall - benches',description:'Blue reusable metal bottle found after a basketball session.',owner:'other',created:'Oct 25',emoji:'🥤',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f8',title:'Engineering lab coat',category:'clothing',status:'claimed',location:'Building C',description:'Owner verified the item and collected it from the reception desk.',owner:'you',created:'Oct 22',emoji:'🥼',collectionPoint:'Library Reception',handoverStatus:'released'},
 {id:'f9',title:'Small notebook',category:'other',status:'lost',location:'C7 lecture room',description:'Brown cover with handwritten engineering notes.',owner:'other',created:'Oct 25',emoji:'📒'},
 {id:'f10',title:'Scientific calculator',category:'electronics',status:'lost',location:'B2 lecture hall',description:'Black scientific calculator with a protective cover.',owner:'other',created:'Oct 26',emoji:'🧮'},
 {id:'f11',title:'Calculator',category:'electronics',status:'found',location:'B2 study area',description:'Scientific calculator with a black cover, found on a desk.',owner:'you',created:'Oct 26',emoji:'🧮',collectionPoint:'Library Reception',handoverStatus:'received'},
 {id:'f12',title:'Canvas tote bag',category:'accessories',status:'lost',location:'Main campus bus stop',description:'Beige tote with green writing on one side.',owner:'other',created:'Oct 26',emoji:'👜'},
 {id:'f13',title:'USB flash drive',category:'electronics',status:'found',location:'Building A computer lab',description:'A small black flash drive was found beside a workstation.',owner:'other',created:'Oct 27',emoji:'💾',collectionPoint:'',handoverStatus:'reported'},
];
const categories = ['all', 'electronics', 'clothing', 'documents', 'accessories', 'other'];
const statuses = ['lost', 'found', 'claimed'];
// The designated (fictional) collection points used in the example records.
const COLLECTION_POINTS = ['Campus Security Desk', 'Student Services Office', 'Library Reception'];
const clean = { title: '', category: '', status: '', location: '', description: '' };
// Order in which invalid fields receive focus after a failed submit (matches the form order).
const FOCUS_ORDER = ['title', 'status', 'category', 'duplicate'];

function getSaved() {
 try {
  const s = JSON.parse(localStorage.getItem(STORE));
  return Array.isArray(s) ? s : seed;
 } catch {
  return seed;
 }
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// Same rules as before; now returns one message per field instead of a single early-exit string.
function validate(f, arr, id) {
 const errors = {};
 if (!f.title.trim() || f.title.trim().length < 2) errors.title = 'Title must be at least 2 characters.';
 if (!categories.slice(1).includes(f.category)) errors.category = 'Choose a category.';
 if (!statuses.includes(f.status)) errors.status = 'Choose lost, found or claimed.';
 if (!errors.title && arr.some(r => r.id !== id && r.title.toLowerCase() === f.title.trim().toLowerCase() && (r.location || '').toLowerCase() === (f.location || '').trim().toLowerCase())) {
  errors.duplicate = 'An item with the same title has already been reported at this location. Change the title or the location to publish.';
 }
 return errors;
}

function Handover({ item }) {
 if (item.status === 'lost') return null;
 if (item.handoverStatus === 'received' && item.collectionPoint) {
  return <div className="handover-note received"><strong>Received at {item.collectionPoint}</strong><span>Staff verify ownership before the item is released.</span></div>;
 }
 if (item.handoverStatus === 'released') {
  return <div className="handover-note released"><strong>Collected by owner</strong></div>;
 }
 return (
  <div className="handover-note pending">
   <strong>Reported found - not confirmed at a collection point</strong>
   {item.status === 'found' && <span>Staff may not be holding it yet. Check with a collection point before making a trip.</span>}
  </div>
 );
}

export default function App() {
 const [items, setItems] = useState(getSaved);
 const [page, setPage] = useState('board');
 const [q, setQ] = useState('');
 const [cat, setCat] = useState('all');
 const [filterStatus, setFilterStatus] = useState('all');
 const [current, setCurrent] = useState(null);
 const [form, setForm] = useState(clean);
 const [errors, setErrors] = useState({});
 const [message, setMessage] = useState('');
 const [confirmReset, setConfirmReset] = useState(false);
 useEffect(() => localStorage.setItem(STORE, JSON.stringify(items)), [items]);

 // Every word the user types must appear somewhere in the title, location or description,
 // in any order ("blue earbuds" now finds "White earbuds in a blue charging case").
 const terms = useMemo(() => q.toLowerCase().split(/\s+/).filter(Boolean), [q]);
 const filtered = useMemo(() => items.filter(x => {
  if (cat !== 'all' && x.category !== cat) return false;
  if (filterStatus !== 'all' && x.status !== filterStatus) return false;
  const hay = `${x.title} ${x.location || ''} ${x.description || ''}`.toLowerCase();
  return terms.every(t => hay.includes(t));
 }), [items, terms, cat, filterStatus]);
 const hasFilters = terms.length > 0 || cat !== 'all' || filterStatus !== 'all';

 function clearFilters() { setQ(''); setCat('all'); setFilterStatus('all'); }
 function goHome() { clearFilters(); setPage('board'); }
 function create() { setCurrent(null); setForm({ ...clean }); setErrors({}); setPage('form'); }
 function edit(row) {
  if (row.owner !== 'you') return;
  setCurrent(row.id);
  setForm({ title: row.title, category: row.category, status: row.status, location: row.location, description: row.description });
  setErrors({});
  setPage('form');
 }
 function setField(name, value) {
  setForm(s => ({ ...s, [name]: value }));
  setErrors(er => {
   const touchesDuplicate = er.duplicate && (name === 'title' || name === 'location');
   if (!er[name] && !touchesDuplicate) return er;
   const next = { ...er };
   delete next[name];
   if (name === 'title' || name === 'location') delete next.duplicate;
   return next;
  });
 }
 function submit(e) {
  e.preventDefault();
  const errs = validate(form, items, current);
  if (Object.keys(errs).length) {
   setErrors(errs);
   const first = FOCUS_ORDER.find(k => errs[k]);
   document.getElementById(first === 'duplicate' ? 'field-title' : `field-${first}`)?.focus();
   return;
  }
  setErrors({});
  const d = { ...form, title: form.title.trim(), location: form.location.trim(), description: form.description.trim(), owner: 'you', created: 'Today', emoji: current ? items.find(x => x.id === current)?.emoji : '📌', ...(current ? {} : { collectionPoint: '', handoverStatus: 'reported' }) };
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
  clearFilters();
  setConfirmReset(false);
  setMessage('Example reports restored.');
 }

 const errorCount = Object.keys(errors).length;
 const fieldProps = (key, describedBy) => ({
  id: `field-${key}`,
  'aria-invalid': describedBy ? 'true' : undefined,
  'aria-describedby': describedBy || undefined,
 });
 const titleError = errors.title ? 'err-title' : errors.duplicate ? 'err-duplicate' : undefined;
 const columns = [
  { key: 'lost', title: 'LOST', sub: 'Searching for these things', icon: '↗' },
  { key: 'found', title: 'FOUND', sub: 'Looking for the owners', icon: '⌁' },
  { key: 'claimed', title: 'CLAIMED', sub: 'Back where they belong', icon: '✓' },
 ];

 return <div className="notice-app">
  <header className="header">
   <div className="headline"><span className="sun">✺</span><button onClick={goHome} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div>
   <nav className="header-links" aria-label="Noticeboard views">
    <button onClick={goHome} aria-current={page === 'board' && !hasFilters ? 'page' : undefined}>Noticeboard</button>
    <button onClick={() => { setFilterStatus('lost'); setPage('board'); }} aria-current={page === 'board' && filterStatus === 'lost' ? 'page' : undefined}>Missing items</button>
    <button onClick={() => { setFilterStatus('found'); setPage('board'); }} aria-current={page === 'board' && filterStatus === 'found' ? 'page' : undefined}>Recently found</button>
   </nav>
   <button className="report-button" onClick={create}>+ Post a report</button>
  </header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page === 'board' ? <main className="workspace">
   <aside className="filters">
    <p className="kicker">YOUR NOTICEBOARD</p>
    <h1>Lost something?<br /><em>You're in the right place.</em></h1>
    <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
    <div className="filterbox">
     <h3>Browse reports</h3>
     <label>Search items<input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. blue earbuds" /></label>
     <label>Item category<select value={cat} onChange={e => setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c => <option key={c} value={c}>{cap(c)}</option>)}</select></label>
     <label>Report status<select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s => <option key={s} value={s}>{cap(s)}</option>)}</select></label>
     <p className="live-note">Results update as you type.</p>
     <div className="filterbuttons"><button onClick={clearFilters} disabled={!hasFilters}>Clear filters</button></div>
    </div>
    <div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div>
    {confirmReset
     ? <div className="reset-confirm" role="group" aria-label="Confirm reset">
       <p>Replace all reports with the example set? Your new reports and edits will be lost.</p>
       <div><button onClick={reset}>Yes, reset</button><button onClick={() => setConfirmReset(false)}>Cancel</button></div>
      </div>
     : <button className="reset" onClick={() => setConfirmReset(true)}>Reset demo data</button>}
   </aside>
   <section className="board">
    <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>
    {message && <div className="message" role="status">{message}<button onClick={() => setMessage('')} aria-label="Dismiss message">✕</button></div>}
    <div className="results-bar">
     <p role="status" aria-live="polite">Showing {filtered.length} of {items.length} reports</p>
     {hasFilters && <ul className="chips" aria-label="Active filters">
      {terms.length > 0 && <li><button onClick={() => setQ('')} aria-label={`Remove search ${q.trim()}`}>Search: “{q.trim()}” ✕</button></li>}
      {cat !== 'all' && <li><button onClick={() => setCat('all')} aria-label={`Remove category ${cat}`}>Category: {cap(cat)} ✕</button></li>}
      {filterStatus !== 'all' && <li><button onClick={() => setFilterStatus('all')} aria-label={`Remove status ${filterStatus}`}>Status: {cap(filterStatus)} ✕</button></li>}
     </ul>}
    </div>
    {filtered.length === 0
     ? <div className="no-results">
       <strong>No reports match your search.</strong>
       <p>Try fewer or different words, or remove a filter. If it isn't listed yet, post a report so others can find it.</p>
       <div><button onClick={clearFilters}>Clear filters</button><button className="report-button" onClick={create}>+ Post a report</button></div>
      </div>
     : <div className="board-grid">{columns.map(col => {
      const colItems = filtered.filter(r => r.status === col.key);
      return <div className="board-column" key={col.key}>
       <div className="column-head"><span className={'col-icon ' + col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{colItems.length}</span></div>
       <div className="sticky-list">
        {colItems.map(item => <article className="sticky" key={item.id}>
         <div className="sticky-top"><span>{item.category}</span>{item.owner === 'you' && <span className="own-tag">Your report</span>}</div>
         <div className="sticky-emoji" aria-hidden="true">{item.emoji}</div>
         <h3>{item.title}</h3>
         <p>{item.description || 'No additional description.'}</p>
         <Handover item={item} />
         {item.owner === 'you' && <button className="edit-button" onClick={() => edit(item)} aria-label={`Edit your report: ${item.title}`}>Edit report</button>}
         <div className="sticky-bottom"><span>⌖ {item.location || 'Location not provided'}</span><small>{item.created}</small></div>
        </article>)}
        {colItems.length === 0 && <div className="empty-column">{hasFilters ? 'No matching reports' : 'Nothing here yet'}</div>}
       </div>
      </div>;
     })}</div>}
   </section>
  </main> : <main className="report-page">
   <div className="crumbs"><button onClick={() => setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div>
   <div className="report-layout">
    <div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current ? 'Update your report' : 'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
    <section className="form-paper">
     <header><p>NEW NOTICE / FORM 01</p><h2>{current ? 'Edit report' : 'Report an item'}</h2></header>
     <form onSubmit={submit} noValidate>
      {errorCount > 0 && <div className="form-error" role="alert">Your report was not saved. Please fix the {errorCount === 1 ? 'highlighted field' : `${errorCount} highlighted fields`} below.</div>}
      <label><span>Item title <b>*</b></span>
       <input {...fieldProps('title', titleError)} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g., Black backpack" />
       {errors.title && <span className="field-error" id="err-title">{errors.title}</span>}
      </label>
      <label><span>Status <b>*</b></span>
       <select {...fieldProps('status', errors.status && 'err-status')} value={form.status} onChange={e => setField('status', e.target.value)}><option value="">Choose one</option>{statuses.map(s => <option key={s} value={s}>{cap(s)}</option>)}</select>
       {errors.status && <span className="field-error" id="err-status">{errors.status}</span>}
      </label>
      {form.status === 'found' && <div className="status-help" role="note">
       <strong>Found something? Hand it in.</strong>
       <p>Take it to a campus collection point so the owner can recover it after ownership is verified:</p>
       <ul>{COLLECTION_POINTS.map(p => <li key={p}>{p}</li>)}</ul>
       <p>Your notice shows “not confirmed at a collection point” until staff confirm they have received it. Do not publish personal details such as ID numbers.</p>
      </div>}
      {form.status === 'lost' && <div className="status-help" role="note">
       <strong>Lost something?</strong>
       <p>Before posting, search the Found column for a match. If one fits, go to its collection point: staff verify ownership before releasing the item.</p>
      </div>}
      {form.status === 'claimed' && <div className="status-help" role="note">
       <p>Use Claimed once the owner has collected the item.</p>
      </div>}
      <label><span>Category <b>*</b></span>
       <select {...fieldProps('category', errors.category && 'err-category')} value={form.category} onChange={e => setField('category', e.target.value)}><option value="">Select item category</option>{categories.slice(1).map(s => <option key={s} value={s}>{cap(s)}</option>)}</select>
       {errors.category && <span className="field-error" id="err-category">{errors.category}</span>}
      </label>
      <label>Last known location
       <input id="field-location" aria-invalid={errors.duplicate ? 'true' : undefined} aria-describedby={errors.duplicate ? 'err-duplicate' : undefined} value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Location (optional)" />
       {errors.duplicate && <span className="field-error" id="err-duplicate">{errors.duplicate}</span>}
      </label>
      <label>More details<textarea rows="6" value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Describe your item" /></label>
      <div className="form-actions"><button type="button" onClick={() => setPage('board')}>Go back</button><button className="report-button" type="submit">{current ? 'Save report' : 'Publish notice'}</button></div>
     </form>
    </section>
   </div>
  </main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
