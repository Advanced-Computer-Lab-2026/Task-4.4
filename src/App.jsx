import React,{useEffect,useMemo,useRef,useState} from 'react';

const STORE='acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed=[
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
const categories=['electronics','clothing','documents','accessories','other'];
const statuses=['lost','found','claimed'];
const clean={title:'',category:'',status:'',location:'',description:''};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const normalize=s=>(s||'').trim().toLowerCase();
function getSaved(){try{const saved=JSON.parse(localStorage.getItem(STORE));return Array.isArray(saved)?saved:seed;}catch{return seed;}}
function validate(form,items,id){
 const errors={};
 if(form.title.trim().length<2)errors.title='Enter an item title with at least 2 characters.';
 if(!statuses.includes(form.status))errors.status='Choose Lost, Found or Claimed.';
 if(!categories.includes(form.category))errors.category='Choose an item category.';
 if(!errors.title&&items.some(item=>item.id!==id&&normalize(item.title)===normalize(form.title)&&normalize(item.location)===normalize(form.location)))errors.title='This title is already reported at this location. Check the existing notice before posting another report.';
 return errors;
}

function Recovery({item}){
 if(item.status==='lost')return null;
 if(item.status==='claimed')return <div className="receipt closed">✓ Marked claimed · Report closed</div>;
 const received=item.handoverStatus==='received'&&Boolean(item.collectionPoint);
 return <div className="recovery">
  <div className={'receipt '+(received?'received':'reported')}><strong>{received?'✓ Received by campus staff':'◷ Reported found only'}</strong><span>{received?item.collectionPoint:'Staff receipt is not confirmed'}</span></div>
  <details><summary>How to recover this item</summary><p>{received?`Ask ${item.collectionPoint} about this notice. Describe identifying details and bring proof of ownership. Staff must verify ownership before collection.`:'Ask campus staff to confirm whether this item has been handed in before travelling to collect it. This notice alone does not mean staff has the item.'}</p><p>Keep private ID numbers and sensitive details off the public noticeboard.</p></details>
 </div>;
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [mine,setMine]=useState(false);
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [errors,setErrors]=useState({});
 const [message,setMessage]=useState('');
 const [storageError,setStorageError]=useState(false);
 const [compact,setCompact]=useState(()=>window.matchMedia('(max-width: 750px)').matches);
 const [filtersOpen,setFiltersOpen]=useState(false);
 const formRef=useRef(null);
 const headingRef=useRef(null);
 const resetDialogRef=useRef(null);
 const previousPage=useRef(page);
 function persist(records){try{localStorage.setItem(STORE,JSON.stringify(records));setStorageError(false);}catch{setStorageError(true);}}
 useEffect(()=>{persist(items);},[items]);
 useEffect(()=>{const media=window.matchMedia('(max-width: 750px)');const update=event=>setCompact(event.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{if(previousPage.current===page)return;previousPage.current=page;if(page==='form')formRef.current?.elements.namedItem('title')?.focus();else headingRef.current?.focus();},[page]);
 const filtered=useMemo(()=>items.filter(item=>(cat==='all'||item.category===cat)&&(filterStatus==='all'||item.status===filterStatus)&&(!mine||item.owner==='you')&&normalize(`${item.title} ${item.location||''} ${item.description||''}`).includes(normalize(q))),[items,q,cat,filterStatus,mine]);
 const active=Boolean(normalize(q)||cat!=='all'||filterStatus!=='all'||mine);
 const secondaryCount=Number(cat!=='all')+Number(filterStatus!=='all')+Number(mine);
 const receivedItem=items.find(item=>item.id===current&&item.handoverStatus==='received'&&item.collectionPoint);
 const visibleStatuses=filterStatus==='all'?statuses:[filterStatus];
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');setMine(false);}
 function browse(status='all'){clearFilters();setFilterStatus(status);setPage('board');setMessage('');}
 function create(){setCurrent(null);setForm({...clean});setErrors({});setMessage('');setPage('form');}
 function edit(item){if(item.owner!=='you')return;setCurrent(item.id);setForm({title:item.title,category:item.category,status:item.status,location:item.location||'',description:item.description||''});setErrors({});setMessage('');setPage('form');}
 function change(field,value){setForm(previous=>({...previous,[field]:value}));setErrors(previous=>{const next={...previous};delete next[field];return next;});}
 function submit(event){
  event.preventDefault();
  const invalid=validate(form,items,current);
  setErrors(invalid);
  if(Object.keys(invalid).length){formRef.current?.elements.namedItem(Object.keys(invalid)[0])?.focus();return;}
  const existing=items.find(item=>item.id===current);
  if(current&&existing?.owner!=='you')return;
  const data={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim()};
  if(current){setItems(items.map(item=>item.id===current?{...item,...data}:item));setMessage('Your report has been updated.');}
  else{setItems([{id:`f-${Date.now()}`,...data,owner:'you',created:'Today',emoji:'📌',collectionPoint:'',handoverStatus:'reported'},...items]);setMessage(`Your ${form.status} report has been posted.${form.status==='found'?' Staff receipt is not confirmed; hand the item to a campus collection point.':''}`);}
  clearFilters();setPage('board');setCurrent(null);
 }
 function reset(){resetDialogRef.current?.close();setItems(seed);clearFilters();setPage('board');setMessage('Example reports restored.');}
 function fieldProps(field){return {id:`report-${field}`,name:field,value:form[field],onChange:event=>change(field,event.target.value),'aria-invalid':Boolean(errors[field]),'aria-describedby':errors[field]?`${field}-error`:undefined};}
 const fieldError=field=>errors[field]&&<span className="field-error" id={`${field}-error`}>{errors[field]}</span>;
 return <div className="notice-app">
  <a href="#main" className="skip-link">Skip to main content</a>
  <header className="header"><div className="headline"><span className="sun" aria-hidden="true">✺</span><button onClick={()=>browse()} className="wordmark" aria-label="Found on campus home">FOUND<span>on campus</span></button></div><nav className="header-links" aria-label="Browse notices"><button onClick={()=>browse()} aria-current={page==='board'&&filterStatus==='all'?'page':undefined}>Noticeboard</button><button onClick={()=>browse('lost')} aria-current={page==='board'&&filterStatus==='lost'?'page':undefined}>Missing items</button><button onClick={()=>browse('found')} aria-current={page==='board'&&filterStatus==='found'?'page':undefined}>Recently found</button></nav>{page==='board'&&<button className="report-button" onClick={create}>+ Post a report</button>}</header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {storageError&&<div className="storage-warning" role="alert"><div><strong>Changes could not be saved in this browser.</strong><p>Your reports are available for this session. Retry saving before closing or reloading this page.</p></div><button className="clear-button" onClick={()=>persist(items)}>Retry saving</button></div>}
  {page==='board'?<main id="main" className="workspace">
   <aside className="filters" aria-label="Find reports"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Look for a matching found notice, or share what you lost or found.</p>
    <div className="filterbox"><h3>Find an item</h3><label htmlFor="search">Search items</label><input id="search" type="search" value={q} onChange={event=>setQ(event.target.value)} placeholder="Item, location or description"/><button className="filter-toggle clear-button" aria-expanded={!compact||filtersOpen} aria-controls="additional-filters" onClick={()=>setFiltersOpen(value=>!value)}>Filters{secondaryCount?` (${secondaryCount} active)`:''} <span aria-hidden="true">{filtersOpen?'−':'+'}</span></button><div id="additional-filters" hidden={compact&&!filtersOpen}><label htmlFor="category">Item category</label><select id="category" value={cat} onChange={event=>setCat(event.target.value)}><option value="all">All categories</option>{categories.map(category=><option key={category} value={category}>{cap(category)}</option>)}</select><label htmlFor="status">Report status</label><select id="status" value={filterStatus} onChange={event=>setFilterStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map(status=><option key={status} value={status}>{cap(status)}</option>)}</select><label className="checkbox-label"><input type="checkbox" checked={mine} onChange={event=>setMine(event.target.checked)}/> My reports only</label></div><p className="filter-hint">Results update as you type.</p>{active&&<div className="active-filters" role="group" aria-label="Active filters">{normalize(q)&&<button onClick={()=>setQ('')} aria-label="Remove search filter">Search: {q.trim()} <span aria-hidden="true">×</span></button>}{cat!=='all'&&<button onClick={()=>setCat('all')} aria-label="Remove category filter">{cap(cat)} <span aria-hidden="true">×</span></button>}{filterStatus!=='all'&&<button onClick={()=>setFilterStatus('all')} aria-label="Remove status filter">{cap(filterStatus)} <span aria-hidden="true">×</span></button>}{mine&&<button onClick={()=>setMine(false)} aria-label="Remove my reports filter">My reports <span aria-hidden="true">×</span></button>}</div>}<button className="clear-button" disabled={!active} onClick={clearFilters}>Clear filters</button></div>
    <div className="side-message"><strong>Found an item?</strong><p>Post a notice, then hand it to Campus Security Desk, Student Services Office or Library Reception. Ownership is verified before collection.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={()=>resetDialogRef.current?.showModal()}>Reset demo data</button>
   </aside>
   <section className="board" aria-labelledby="results-heading"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2 id="results-heading" tabIndex="-1" ref={headingRef}>{mine?'Your reports':filterStatus==='all'?'Latest notices':`${cap(filterStatus)} notices`}</h2><p className="result-count" role="status" aria-live="polite">{filtered.length} {filtered.length===1?'report':'reports'}{active?` match your filters · ${items.length} total`: ' on the noticeboard'}</p></div><span className="time-note">Local demo</span></div>
    {message&&<div className="message" role="status">{message}<button aria-label="Dismiss message" onClick={()=>setMessage('')}>×</button></div>}
    {!filtered.length?<div className="empty-results"><span aria-hidden="true">⌕</span><h3>No matching reports</h3><p>Try a shorter search, another category or a different status.</p><button className="report-button" onClick={clearFilters}>Clear filters</button><button className="text-button" onClick={create}>Post a report instead →</button></div>:<div className={'board-grid '+(filterStatus!=='all'?'single-status':'')}>
     {visibleStatuses.map(status=><div className="board-column" data-status={status} key={status}><div className="column-head"><span className={'col-icon '+status} aria-hidden="true">{status==='lost'?'↗':status==='found'?'⌁':'✓'}</span><div><strong>{status.toUpperCase()}</strong><small>{status==='lost'?'Searching for these things':status==='found'?'Looking for the owners':'Closed reports'}</small></div><span className="col-count">{filtered.filter(item=>item.status===status).length}</span></div><div className="sticky-list">
      {filtered.filter(item=>item.status===status).map(item=><article className="sticky" key={item.id}><div className="sticky-top"><span>{item.category}</span><span className="ownership">{item.owner==='you'?'Your report':'Community report'}</span></div><div className="sticky-emoji" aria-hidden="true">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p><Recovery item={item}/><div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>{item.owner==='you'&&<button className="edit-button" onClick={()=>edit(item)} aria-label={`Edit report: ${item.title}`}>Edit your report →</button>}</article>)}
      {filtered.every(item=>item.status!==status)&&<div className="empty-column">No {status} reports match these filters.</div>}
     </div></div>)}
    </div>}
   </section>
  </main>:<main id="main" className="report-page"><div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>{current?'Edit report':'Report an item'}</span></div><div className="report-layout"><div className="report-intro"><span className="seal" aria-hidden="true">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Describe the item and where it was lost or found. Required fields are marked *.</p><div className="paper-note"><strong>Found property needs a safe handover.</strong><p>Posting a notice does not confirm that campus staff has the item. Staff verifies ownership before collection.</p></div></div>
   <section className="form-paper" aria-labelledby="form-heading"><header><p>{current?'YOUR NOTICE / EDIT':'NEW NOTICE / FORM 01'}</p><h2 id="form-heading">{current?'Edit report':'Report an item'}</h2></header><p className="public-guidance">Your notice is public. Keep private ID numbers and contact details out of reports.</p><form ref={formRef} onSubmit={submit} noValidate>
    {Object.keys(errors).length>0&&<div className="form-error" role="alert"><strong>Check the highlighted fields.</strong> Your entries have been kept.</div>}
    <fieldset className="form-group"><legend>Item details</legend><div className="form-field"><label htmlFor="report-title">Item title <b aria-hidden="true">*</b></label><input {...fieldProps('title')} aria-required="true" placeholder="e.g., Black backpack"/>{fieldError('title')}</div>
    <div className="form-row"><div className="form-field"><label htmlFor="report-status">Status <b aria-hidden="true">*</b></label><select {...fieldProps('status')} aria-required="true"><option value="">Choose one</option>{statuses.map(status=><option key={status} value={status}>{cap(status)}</option>)}</select>{fieldError('status')}</div><div className="form-field"><label htmlFor="report-category">Category <b aria-hidden="true">*</b></label><select {...fieldProps('category')} aria-required="true"><option value="">Select category</option>{categories.map(category=><option key={category} value={category}>{cap(category)}</option>)}</select>{fieldError('category')}</div></div>
    {form.status==='found'&&<p className="context-note">{receivedItem?`Staff receipt is recorded at ${receivedItem.collectionPoint}. Editing this notice keeps that handover record.`:'This will be shown as “Reported found only”. Hand found property to Campus Security Desk, Student Services Office or Library Reception; posting alone does not confirm staff receipt.'}</p>}{form.status==='claimed'&&<p className="context-note">Mark claimed after the owner has recovered the item. This closes the report; it does not verify ownership.</p>}</fieldset>
    <fieldset className="form-group"><legend>Location and identifying details</legend><div className="form-field"><label htmlFor="report-location">{form.status==='found'?'Where you found it':'Last known location'} <span className="optional">(optional)</span></label><input {...fieldProps('location')} placeholder="e.g., Library — second floor"/></div>
    <div className="form-field"><label htmlFor="report-description">More details <span className="optional">(optional)</span></label><textarea {...fieldProps('description')} rows="4" placeholder="Colour, identifying features and when you saw it"/></div></fieldset>
    <div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Cancel</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div>
   </form></section>
  </div></main>}
  <dialog ref={resetDialogRef} className="confirm-dialog" aria-labelledby="reset-heading" aria-describedby="reset-description"><h2 id="reset-heading">Reset demo reports?</h2><p id="reset-description">This restores the {seed.length} example reports and removes all reports and edits saved in this browser. This cannot be undone.</p><div className="dialog-actions"><button className="clear-button" autoFocus onClick={()=>resetDialogRef.current?.close()}>Keep reports</button><button className="danger-button" onClick={reset}>Reset demo</button></div></dialog>
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
