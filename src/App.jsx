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
const clean={title:'',category:'',status:'',location:'',description:''};
const fieldOrder=['title','status','category','location'];
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

// Same rules as before, but each problem is returned against the field it belongs to.
function validate(f,arr,id){
 const e={};
 if(!f.title.trim()||f.title.trim().length<2)e.title='Enter an item title of at least 2 characters.';
 if(!statuses.includes(f.status))e.status='Choose lost, found or claimed.';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category.';
 if(!e.title){
  const dup=arr.find(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase());
  if(dup)e.location=`"${dup.title}" has already been reported at ${dup.location?`"${dup.location}"`:'an unspecified location'}. Change the title or location, or edit the existing report.`;
 }
 return e;
}

function handover(item){
 if(item.status==='lost')return null;
 if(item.handoverStatus==='released')return {tone:'done',text:'Returned to owner'};
 if(item.handoverStatus==='received'&&item.collectionPoint)return {tone:'ok',text:`At ${item.collectionPoint}`,sub:'Bring proof of ownership to collect'};
 return {tone:'warn',text:'Not yet handed in',sub:'Staff do not hold this item yet'};
}

// Filled silhouette icons per item category (replace emojis for a consistent, clean look).
const icons={
 electronics:<path fillRule="evenodd" d="M4.5 4h15A1.5 1.5 0 0121 5.5V16H3V5.5A1.5 1.5 0 014.5 4zM5 6v8h14V6H5zM1 17h22v.5A2.5 2.5 0 0120.5 20h-17A2.5 2.5 0 011 17.5V17z"/>,
 clothing:<path d="M8.5 3L3 6l2.2 4.4L7 9.5V21h10V9.5l1.8.9L21 6l-5.5-3c-.6 1.6-1.9 2.6-3.5 2.6S9.1 4.6 8.5 3z"/>,
 documents:<path fillRule="evenodd" d="M6 2h8l5 5v13.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 20.5v-17A1.5 1.5 0 016 2zm2 10v1.5h8V12H8zm0 4v1.5h6V16H8z"/>,
 accessories:<path d="M7 6.5h10a2 2 0 012 2V20a2 2 0 01-2 2H7a2 2 0 01-2-2V8.5a2 2 0 012-2zM9 6.5V5a3 3 0 016 0v1.5h-1.6V5a1.4 1.4 0 00-2.8 0v1.5z"/>,
 other:<path fillRule="evenodd" d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2zm0 2.2L5.6 7.4 12 10.6l6.4-3.2L12 4.2z"/>,
};
const ItemIcon=({category})=><svg className="item-icon" viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true">{icons[category]||icons.other}</svg>;
const PinIcon=()=><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.6a2.6 2.6 0 110-5.2 2.6 2.6 0 010 5.2z"/></svg>;
const SearchIcon=()=><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>;

const tabs=[{key:'all',label:'All',sub:'Every report from the campus community'},{key:'lost',label:'Lost',sub:'Searching for these things'},{key:'found',label:'Found',sub:'Looking for the owners'}];

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [errors,setErrors]=useState({});
 const [message,setMessage]=useState('');
 const [undo,setUndo]=useState(null); // last deleted report, so a delete can be reversed
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);

 // Search + category apply first so the tab counts reflect them.
 // Claimed items are back with their owners, so they are hidden from the noticeboard (kept in storage, not deleted).
 const base=useMemo(()=>items.filter(x=>x.status!=='claimed'&&(cat==='all'||x.category===cat)&&`${x.title} ${x.location} ${x.description} ${x.category}`.toLowerCase().includes(q.trim().toLowerCase())),[items,q,cat]);
 const filtered=useMemo(()=>base.filter(x=>filterStatus==='all'||x.status===filterStatus),[base,filterStatus]);
 const count=k=>k==='all'?base.length:base.filter(x=>x.status===k).length;
 const hasFilters=q||cat!=='all'||filterStatus!=='all';

 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 function goTab(k){clearFilters();setFilterStatus(k);setPage('board');}
 function create(){setCurrent(null);setForm({...clean});setErrors({});setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location||'',description:row.description||''});setErrors({});setPage('form');}
 function setField(k,v){setForm(s=>({...s,[k]:v}));setErrors(e=>{if(!e[k]&&!(k==='title'&&e.location))return e;const n={...e};delete n[k];if(k==='title')delete n.location;return n;});}
 function submit(e){
  e.preventDefault();
  const v=validate(form,items,current);
  if(Object.keys(v).length){setErrors(v);const first=fieldOrder.find(k=>v[k]);document.getElementById(`f-${first}`)?.focus();return;}
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
  const claimedNote=d.status==='claimed'?' It is marked as claimed, so it has been removed from the noticeboard.':'';
  if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.'+claimedNote);}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.'+claimedNote);}
  setUndo(null);setPage('board');setCurrent(null);
 }
 // Only your own reports can be deleted; an Undo is offered instead of a confirmation dialog.
 function remove(row){
  if(!row||row.owner!=='you')return;
  const idx=items.findIndex(x=>x.id===row.id);
  setItems(items.filter(x=>x.id!==row.id));
  setUndo({item:row,idx});setMessage(`"${row.title}" was deleted.`);
  setPage('board');setCurrent(null);
 }
 function undoDelete(){
  if(!undo)return;
  const n=[...items];n.splice(Math.min(undo.idx,n.length),0,undo.item);
  setItems(n);setMessage(`"${undo.item.title}" was restored.`);setUndo(null);
 }
 function reset(){setItems(seed);setPage('board');clearFilters();setUndo(null);setMessage('Example reports restored.');}

 const errCount=Object.keys(errors).length;
 // Inline validation when leaving a field the user has actually typed in (empty fields are only flagged on submit).
 function checkField(k){if(!form[k].trim())return;const v=validate(form,items,current);setErrors(e=>{const n={...e};for(const key of k==='title'?['title','location']:[k]){if(v[key])n[key]=v[key];else delete n[key];}return n;});}
 const fieldProps=k=>({onBlur:()=>checkField(k),id:`f-${k}`,'aria-invalid':!!errors[k],'aria-describedby':errors[k]?`e-${k}`:undefined,className:errors[k]?'invalid':undefined});
 const FieldError=({k})=>errors[k]?<span className="field-error" id={`e-${k}`}>{errors[k]}</span>:null;

 return <div className="app">
  <header className="header">
   <button onClick={()=>goTab('all')} className="wordmark"><span className="sun" aria-hidden="true">✺</span><span className="wm-text">FOUND<small>on campus</small></span></button>
   <nav className="nav" aria-label="Main">
    {[['all','Noticeboard'],['lost','Missing items'],['found','Recently found']].map(([k,l])=><button key={k} aria-current={page==='board'&&filterStatus===k&&!q&&cat==='all'?'page':undefined} onClick={()=>goTab(k)}>{l}</button>)}
   </nav>
   <button className="btn-primary" onClick={create}>+ Post a report</button>
  </header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>

  {page==='board'?<main className="container">
   <div className="page-head">
    <p className="kicker">YOUR NOTICEBOARD</p>
    <h1>Lost something? <em>You’re in the right place.</em></h1>
    <p>Browse what the campus community has shared or post what you’ve lost or found.</p>
   </div>

   <div className="board-top">
    <div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div>
    <span className="time-note">Updated today</span>
   </div>

   <div className="toolbar" role="search">
    <label className="search"><span className="sr-only">Search items</span><SearchIcon/><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label>
    <label><span className="sr-only">Category</span><select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
    {hasFilters&&<button className="btn-ghost" onClick={clearFilters}>Clear filters</button>}
   </div>

   <div className="tabs" role="group" aria-label="Filter by status">
    {tabs.map(t=><button key={t.key} className={'tab '+t.key} aria-pressed={filterStatus===t.key} onClick={()=>setFilterStatus(t.key)}>{t.label}<span className="tab-count">{count(t.key)}</span></button>)}
   </div>

   <p className="result-count" aria-live="polite">{filtered.length} {filtered.length===1?'report':'reports'} · {tabs.find(t=>t.key===filterStatus).sub}</p>
   {message&&<div className="message" role="status"><span>{message}</span><span className="message-actions">{undo&&<button className="undo" onClick={undoDelete}>Undo</button>}<button onClick={()=>{setMessage('');setUndo(null);}} aria-label="Dismiss">✕</button></span></div>}

   {filtered.length?<div className="grid">
    {filtered.map(item=>{const h=handover(item);return <article className={'card '+item.status} key={item.id}>
     <div className="card-tags"><span className={'pill status '+item.status}>{cap(item.status)}</span><span className="pill">{cap(item.category)}</span>{item.owner==='you'&&<span className="pill mine">Your report</span>}</div>
     <div className="card-title"><ItemIcon category={item.category}/><h3>{item.title}</h3></div>
     <p className="desc">{item.description||'No additional description.'}</p>
     {h&&<div className={'handover '+h.tone}><strong>{h.text}</strong>{h.sub&&<span>{h.sub}</span>}</div>}
     <div className="card-foot">
      <span className="meta"><PinIcon/> {item.location||'Location not provided'} · {item.created}</span>
      {item.owner==='you'&&<button className="btn-small" onClick={()=>edit(item)} aria-label={`Edit ${item.title}`}>Edit</button>}
     </div>
    </article>;})}
   </div>:<div className="empty"><strong>No reports match your filters.</strong><p>Try a different word or category.</p>{hasFilters&&<button className="btn-ghost" onClick={clearFilters}>Clear filters</button>}</div>}
  </main>

  :<main className="container">
   <div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>{current?'Edit report':'Report an item'}</span></div>
   <div className="report-layout">
   <div className="report-intro">
    <span className="seal" aria-hidden="true">✺</span>
    <p className="kicker">HELP THE COMMUNITY</p>
    <h1>{current?'Update your report':'Tell us what happened.'}</h1>
    <p>Small details can help someone recognize their belongings.</p>
    <div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div>
   </div>
   <section className="form-card">
    <p className="kicker">{current?'EDIT NOTICE':'NEW NOTICE'} / FORM 01</p>
    <h2>{current?'Edit report':'Report an item'}</h2>
    <p className="form-sub">Fields marked <b>*</b> are required.</p>
    <form onSubmit={submit} noValidate>
     {errCount>0&&<div className="form-error" role="alert">{errCount===1?'1 field needs attention.':`${errCount} fields need attention.`}</div>}
     <label>Item title <b>*</b><input {...fieldProps('title')} value={form.title} onChange={e=>setField('title',e.target.value)} placeholder="e.g., Black backpack"/><FieldError k="title"/></label>
     <div className="row">
      <label>Status <b>*</b><select {...fieldProps('status')} value={form.status} onChange={e=>setField('status',e.target.value)}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select><FieldError k="status"/></label>
      <label>Category <b>*</b><select {...fieldProps('category')} value={form.category} onChange={e=>setField('category',e.target.value)}><option value="">Choose one</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select><FieldError k="category"/></label>
     </div>
     {form.status==='found'&&!current&&<div className="hint">Please hand the item in at a designated campus collection point. Your report will show as <strong>Not yet handed in</strong> until staff confirm they have it.</div>}
     {form.status==='lost'&&!current&&<div className="hint">Tip: check the <strong>Found</strong> tab first. Someone may already have reported your item.</div>}
     <label>Last known location <span className="opt">(optional)</span><input {...fieldProps('location')} value={form.location} onChange={e=>setField('location',e.target.value)} placeholder="e.g., Library - second floor"/><FieldError k="location"/></label>
     <label>More details <span className="opt">(optional)</span><textarea rows="5" value={form.description} onChange={e=>setField('description',e.target.value)} placeholder="Describe your item"/></label>
     <div className="form-actions">{current&&<button type="button" className="btn-ghost danger" onClick={()=>remove(items.find(x=>x.id===current))}>Delete report</button>}<button type="button" className="btn-ghost" onClick={()=>setPage('board')}>Go back</button><button className="btn-primary" type="submit">{current?'Save report':'Publish notice'}</button></div>
    </form>
   </section>
   </div>
  </main>}

  <footer className="footer"><span><strong>FOUND / Campus noticeboard</strong></span><span className="footer-right"><button onClick={reset}>Reset demo data</button><span>Community project • Demo only</span></span></footer>
 </div>;
}
