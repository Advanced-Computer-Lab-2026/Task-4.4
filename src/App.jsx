import React,{useEffect,useMemo,useState} from 'react';

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
const categories=['all','electronics','clothing','documents','accessories','other'];
const statuses=['lost','found','claimed'];
const fieldOrder=['title','status','category','location','description'];
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

// Returns one message per invalid field, e.g. {title:'...'}; empty object means valid.
function validate(f,arr,id){
 const errors={};
 const title=f.title.trim();
 const location=(f.location||'').trim();
 if(title.length<2)errors.title='Enter an item title of at least 2 characters.';
 else if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===title.toLowerCase()&&(r.location||'').toLowerCase()===location.toLowerCase()))
  errors.title=`"${title}" has already been reported${location?` at ${location}`:' with no location'}. Check the noticeboard for it, or change the title or location.`;
 if(!statuses.includes(f.status))errors.status='Choose whether the item is lost, found or claimed.';
 if(!categories.slice(1).includes(f.category))errors.category='Choose a category for the item.';
 return errors;
}

const EditIcon=()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>;
const BinIcon=()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>;
const columns=[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}];

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [mineOnly,setMineOnly]=useState(false);
 // True when the status came from a header tab rather than the status dropdown.
 const [statusFromTab,setStatusFromTab]=useState(false);
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [errors,setErrors]=useState({});
 const [message,setMessage]=useState('');
 const [toDelete,setToDelete]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 // Confirmation dialog: focus the safe choice first and let Escape close it.
 useEffect(()=>{
  if(!toDelete)return;
  document.getElementById('keep-report')?.focus();
  const onKey=e=>{if(e.key==='Escape')setToDelete(null);};
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[toDelete]);
 function confirmDelete(){
  if(toDelete?.owner!=='you')return;
  setItems(list=>list.filter(x=>x.id!==toDelete.id));
  setMessage(`"${toDelete.title}" was deleted.`);
  setToDelete(null);
 }
 // Search + category only; the status filter is applied on top so each column can still show its own count.
 const matching=useMemo(()=>items.filter(x=>(!mineOnly||x.owner==='you')&&(cat==='all'||x.category===cat)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.trim().toLowerCase())),[items,q,cat,mineOnly]);
 const filtered=useMemo(()=>matching.filter(x=>filterStatus==='all'||x.status===filterStatus),[matching,filterStatus]);
 const statusCount=s=>matching.filter(r=>r.status===s).length;

 const hasFilters=q.trim()!==''||cat!=='all'||filterStatus!=='all'||mineOnly;
 const activeNav=page!=='board'?null:mineOnly?'mine':filterStatus!=='all'?filterStatus:!hasFilters?'board':null;
 const viewTitle=mineOnly?'My items':filterStatus!=='all'?cap(filterStatus):'Latest notices';
 const isFilteredView=mineOnly||filterStatus!=='all';

 // Filters the user set in the toolbar (shown as chips); tab choices are not chips.
 const statusChip=filterStatus!=='all'&&!statusFromTab;
 const hasActiveFilters=q.trim()!==''||cat!=='all'||statusChip;
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');setMineOnly(false);setStatusFromTab(false);}
 function clearToolbarFilters(){setQ('');setCat('all');if(statusChip)setFilterStatus('all');}
 function pickStatus(s){setFilterStatus(s);setStatusFromTab(false);}
 function showBoard(){clearFilters();setPage('board');}
 function showStatus(s){setMineOnly(false);setFilterStatus(s);setStatusFromTab(true);setPage('board');}
 function showMine(){setMineOnly(true);setFilterStatus('all');setStatusFromTab(false);setPage('board');}
 const navTabs=[{key:'board',label:'Noticeboard',go:showBoard},{key:'lost',label:'Lost',go:()=>showStatus('lost')},{key:'found',label:'Found',go:()=>showStatus('found')},{key:'claimed',label:'Claimed',go:()=>showStatus('claimed')},{key:'mine',label:'My items',go:showMine}];
 function create(){setCurrent(null);setForm({...clean});setErrors({});setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setErrors({});setPage('form');}
 // Update a field and drop its error once the user starts fixing it.
 // A duplicate-title error depends on location too, so editing location clears it.
 function setField(key,value){
  setForm(s=>({...s,[key]:value}));
  setErrors(e=>{const n={...e};delete n[key];if(key==='location')delete n.title;return n;});
 }
 function submit(e){
  e.preventDefault();
  const v=validate(form,items,current);
  if(Object.keys(v).length){
   setErrors(v);
   const first=fieldOrder.find(k=>v[k]);
   document.getElementById(`field-${first}`)?.focus();
   return;
  }
  setErrors({});
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
  if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.');}
  setPage('board');setCurrent(null);
 }
 function reset(){setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');}
 const fieldProps=key=>({id:`field-${key}`,className:errors[key]?'invalid':undefined,'aria-invalid':errors[key]?true:undefined,'aria-describedby':errors[key]?`error-${key}`:undefined});
 const FieldError=({name})=>errors[name]?<span className="field-error" id={`error-${name}`}>{errors[name]}</span>:null;
 const errorCount=Object.keys(errors).length;

 return <div className="notice-app">
  <header className="header">
   <div className="headline"><span className="sun">✺</span><button onClick={showBoard} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div>
   <nav className="header-links" aria-label="Main">
    {navTabs.map(t=><button key={t.key} className={activeNav===t.key?'active':''} aria-current={activeNav===t.key?'page':undefined} onClick={t.go}>{t.label}</button>)}
   </nav>
  </header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>

  {page==='board'?<main className="workspace">
   <div className="page-intro">
    <div><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something? <em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared, or post what you've lost or found.</p></div>
    <button className="report-button" onClick={create}>+ Report an item</button>
   </div>

   <div className="toolbar" role="search">
    <label className="search"><span className="sr-only">Search items</span><span className="search-icon" aria-hidden="true">⌕</span><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by item, location or description"/></label>
    <label><span className="sr-only">Item category</span><select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
    <label><span className="sr-only">Report status</span><select value={filterStatus} onChange={e=>pickStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
   </div>
   {hasActiveFilters&&<div className="active-filters"><span className="kicker">ACTIVE FILTERS</span>
    {q.trim()&&<button className="chip" onClick={()=>setQ('')} aria-label={`Remove search "${q.trim()}"`}>"{q.trim()}" ×</button>}
    {cat!=='all'&&<button className="chip" onClick={()=>setCat('all')} aria-label={`Remove category ${cap(cat)}`}>{cap(cat)} ×</button>}
    {statusChip&&<button className="chip" onClick={()=>setFilterStatus('all')} aria-label={`Remove status ${cap(filterStatus)}`}>{cap(filterStatus)} ×</button>}
    <button className="link-button" onClick={clearToolbarFilters}>Clear all</button>
   </div>}

   <section className="board">
    <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>{viewTitle} <span>({filtered.length})</span></h2></div>{isFilteredView?<button className="show-all" onClick={clearFilters}>Show all notices</button>:<span className="time-note">Updated today</span>}</div>
    {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    <div className={'board-grid'+(filterStatus!=='all'?' single':'')}>{columns.filter(col=>filterStatus==='all'||filterStatus===col.key).map(col=><div className="board-column" key={col.key}>
     {/* With one status selected the page heading already names it, so skip the column header. */}
     {filterStatus==='all'&&<div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div className="col-text"><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{statusCount(col.key)}</span></div>}
     <div className="sticky-list">{filtered.filter(r=>r.status===col.key).map(item=><article className={'sticky cat-'+item.category} key={item.id}>
      <div className="sticky-top"><span className="cat-tag">{item.category}</span>{item.owner==='you'&&<div className="card-actions"><button className="edit-button" onClick={()=>edit(item)} aria-label={`Edit your report: ${item.title}`} title="Edit your report"><EditIcon/></button><button className="edit-button delete-button" onClick={()=>setToDelete(item)} aria-label={`Delete your report: ${item.title}`} title="Delete your report"><BinIcon/></button></div>}</div>
      <div className="sticky-title"><span className="sticky-emoji" aria-hidden="true">{item.emoji}</span><h3>{item.title}</h3></div><p>{item.description||'No additional description.'}</p>
      {item.status!=='lost'&&<div className="handover-note">{item.handoverStatus==='received'&&item.collectionPoint?`Received at ${item.collectionPoint}`:item.handoverStatus==='released'?'Collected by owner':'Reported found - not confirmed at a collection point'}</div>}
      <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>
      <div className="reported-by">Reported by {item.owner==='you'?'you':'another student'}</div>
     </article>)}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">Nothing here yet</div>}</div>
    </div>)}</div>
   </section>
  </main>

  :<main className="report-page">
   <div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div>
   <div className="report-layout">
    <div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
    <section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header>
     <form onSubmit={submit} noValidate>
      {errorCount>0&&<div className="form-error" role="alert">{errorCount===1?'1 field needs your attention':`${errorCount} fields need your attention`} before you can publish. See the highlighted {errorCount===1?'field':'fields'} below.</div>}
      <label><span>Item title <b>*</b></span><input {...fieldProps('title')} value={form.title} onChange={e=>setField('title',e.target.value)} placeholder="e.g., Black backpack"/><FieldError name="title"/></label>
      <label><span>Status <b>*</b></span><select {...fieldProps('status')} value={form.status} onChange={e=>setField('status',e.target.value)}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select><FieldError name="status"/></label>
      <label><span>Category <b>*</b></span><select {...fieldProps('category')} value={form.category} onChange={e=>setField('category',e.target.value)}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select><FieldError name="category"/></label>
      <label>Last known location<input {...fieldProps('location')} value={form.location} onChange={e=>setField('location',e.target.value)} placeholder="e.g., Library - second floor (optional)"/></label>
      <label>More details<textarea {...fieldProps('description')} rows="6" value={form.description} onChange={e=>setField('description',e.target.value)} placeholder="Colour, brand, marks or anything that makes it recognizable"/></label>
      <div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div>
     </form>
    </section>
   </div>
  </main>}
  {toDelete&&<div className="dialog-backdrop" onClick={e=>{if(e.target===e.currentTarget)setToDelete(null);}}>
   <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-desc">
    <h2 id="delete-title">Delete this report?</h2>
    <p id="delete-desc">"{toDelete.title}" will be removed from the noticeboard. This cannot be undone.</p>
    <div className="dialog-actions"><button id="keep-report" className="secondary-button" onClick={()=>setToDelete(null)}>Keep report</button><button className="danger-button" onClick={confirmDelete}>Delete report</button></div>
   </div>
  </div>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><button className="link-button" onClick={reset}>Reset demo data</button><span>Community project • Demo only</span></footer>
 </div>;
}
