import React,{useEffect,useMemo,useState} from 'react';
import { validate } from './validation.js';

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
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function RecoveryNote({item}){
 if(item.status==='claimed')return <div className="handover-note">{item.handoverStatus==='released'?'Collected by owner':'Report marked claimed'}</div>;
 if(item.status!=='found')return null;
 const received=item.handoverStatus==='received'&&item.collectionPoint;
 return <div className={'handover-note '+(received?'received':'unconfirmed')}>
  <strong>{received?`Held at ${item.collectionPoint}`:'Staff receipt unconfirmed'}</strong>
  <p>{received?'Visit the desk and describe identifying details so staff can verify ownership before collection.':'This notice does not confirm that the item is available for collection.'}</p>
 </div>;
}
export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('found');
 const [appliedFilters,setAppliedFilters]=useState({q:'',cat:'all'});
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [attempted,setAttempted]=useState(false);
 const [message,setMessage]=useState('');
 const errors=attempted?validate(form,items,current):{};
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const matching=useMemo(()=>items.filter(x=>(appliedFilters.cat==='all'||x.category===appliedFilters.cat)&&`${x.title} ${x.location||''} ${x.description||''}`.toLowerCase().includes(appliedFilters.q.toLowerCase())),[items,appliedFilters]);
 const filtered=matching.filter(x=>filterStatus==='all'||x.status===filterStatus);
 const pendingFilters=q.trim()!==appliedFilters.q||cat!==appliedFilters.cat;
 const tabStatuses=['found','lost','claimed','all'];
 function tabKeyDown(e){
  const index=tabStatuses.indexOf(filterStatus);
  const next=e.key==='ArrowRight'?(index+1)%tabStatuses.length:e.key==='ArrowLeft'?(index+tabStatuses.length-1)%tabStatuses.length:e.key==='Home'?0:e.key==='End'?tabStatuses.length-1:null;
  if(next===null)return;
  e.preventDefault();setFilterStatus(tabStatuses[next]);
  e.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
 }
 function create(){setCurrent(null);setForm({...clean});setAttempted(false);setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location||'',description:row.description||''});setAttempted(false);setPage('form');}
 function submit(e){
  e.preventDefault();
  const previous=items.find(x=>x.id===current);
  if(current&&(!previous||previous.owner!=='you'))return;
  const validation=validate(form,items,current);
  setAttempted(true);
  if(Object.keys(validation).length){e.currentTarget.elements.namedItem(Object.keys(validation)[0])?.focus();return;}
  // Preserve staff receipt metadata only while an existing found report stays found.
  const receipt=form.status==='found'&&previous?.status==='found'
   ?{collectionPoint:previous.collectionPoint||'',handoverStatus:previous.handoverStatus||'reported'}
   :form.status==='claimed'&&previous?.status==='claimed'
    ?{collectionPoint:previous.collectionPoint||'',handoverStatus:previous.handoverStatus||'reported'}
    :{collectionPoint:'',handoverStatus:'reported'};
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:previous?.created||'Today',emoji:previous?.emoji||'📌',...receipt};
  const hiddenByFilters=(appliedFilters.cat!=='all'&&d.category!==appliedFilters.cat)||!`${d.title} ${d.location} ${d.description}`.toLowerCase().includes(appliedFilters.q.toLowerCase());
  if(hiddenByFilters){setQ('');setCat('all');setAppliedFilters({q:'',cat:'all'});}
  setFilterStatus(d.status);
  const confirmation=current?'Report updated.':'Your report has been posted.';
  if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));}else{setItems([{id:`f-${Date.now()}`,...d},...items]);}
  setMessage(confirmation+(hiddenByFilters?' Filters cleared to show your report.':''));
  setPage('board');setCurrent(null);setAttempted(false);
 }
 function reset(){setItems(seed);setPage('board');setQ('');setCat('all');setAppliedFilters({q:'',cat:'all'});setFilterStatus('found');setMessage('Example reports restored.');}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>setPage('board')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><div className="header-links"><button onClick={()=>setPage('board')}>Noticeboard</button><button onClick={()=>{setFilterStatus('lost');setPage('board')}}>Missing items</button><button onClick={()=>{setFilterStatus('found');setPage('board')}}>Recently found</button></div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox"><h3>Browse reports</h3><label>Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><div className="filterbuttons"><button onClick={()=>{setAppliedFilters({q:q.trim(),cat});setMessage('Filters applied.');}}>Apply</button><button onClick={()=>{setQ('');setCat('all');}}>Clear fields</button></div><p className="filter-hint">{pendingFilters?'Changes ready. Select Apply to update results.':'Search and category update when you select Apply.'}</p></div><div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Item reports</h2></div><span className="time-note" role="status">{filtered.length} {filtered.length===1?'report':'reports'} shown</span></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')}>✕</button></div>}
    <div className="status-tabs" role="tablist" aria-label="Report status">
     {tabStatuses.map(status=><button key={status} id={`tab-${status}`} role="tab" className={status==='all'?'all-tab':''} aria-selected={filterStatus===status} aria-controls="reports-panel" tabIndex={filterStatus===status?0:-1} onClick={()=>setFilterStatus(status)} onKeyDown={tabKeyDown}>
      {status==='all'?'All reports':cap(status)} <span>{status==='all'?matching.length:matching.filter(item=>item.status===status).length}</span>
     </button>)}
    </div>
    <div id="reports-panel" role="tabpanel" aria-labelledby={`tab-${filterStatus}`} tabIndex={0}>
     <div className="reports-grid">
      {filtered.map(item=><article className="report-card" key={item.id} aria-labelledby={`item-${item.id}`}>
       <div className="card-meta"><span>{cap(item.category)}</span>{item.owner==='you'&&<span className="ownership">Your report</span>}{filterStatus==='all'&&<span className="card-status">{cap(item.status)}</span>}</div>
       <h3 id={`item-${item.id}`}>{item.title}</h3>
       <p className="item-location">{item.location||'Location not provided'}</p>
       <p className="item-description">{item.description||'No additional description.'}</p>
       <RecoveryNote item={item}/>
       <div className="card-footer"><span>Reported {item.created}</span>{item.owner==='you'&&<button className="edit-report" aria-label={`Edit report: ${item.title}`} onClick={()=>edit(item)}>Edit report</button>}</div>
      </article>)}
     </div>
     {filtered.length===0&&<div className="empty-results"><h3>No {filterStatus==='all'?'':filterStatus+' '}reports match</h3><p>Try another status tab, or change your search or category and select Apply.</p></div>}
    </div>
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>{current?'EDIT NOTICE':'NEW NOTICE / FORM 01'}</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit} noValidate>
 <p className="form-help">Fields marked * are required.</p>
 {Object.keys(errors).length>0&&<div className="form-error" role="alert">Report not saved. Check the highlighted fields below.</div>}
 <label htmlFor="title">Item title *</label>
 <input id="title" name="title" required aria-invalid={!!errors.title} aria-describedby={errors.title?'title-error':'title-hint'} value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/>
 {errors.title?<p className="field-error" id="title-error">{errors.title}</p>:<p className="field-hint" id="title-hint">At least 2 characters.</p>}
 <label htmlFor="status">Status *</label>
 <select id="status" name="status" required aria-invalid={!!errors.status} aria-describedby={errors.status?'status-error':undefined} value={form.status} onChange={e=>setForm(s=>({...s,status:e.target.value}))}>
  <option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}
 </select>
 {errors.status&&<p className="field-error" id="status-error">{errors.status}</p>}
 {form.status==='found'&&<div className="handover-help">
  <strong>Handing over a found item</strong>
  <p>Take it to Campus Security Desk, Library Reception or Student Services Office. Staff verify ownership before returning property.</p>
  <p>Publishing a notice does not confirm staff receipt. Collection points in this demo are fictional.</p>
 </div>}
 <label htmlFor="category">Category *</label>
 <select id="category" name="category" required aria-invalid={!!errors.category} aria-describedby={errors.category?'category-error':undefined} value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}>
  <option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}
 </select>
 {errors.category&&<p className="field-error" id="category-error">{errors.category}</p>}
 <label htmlFor="location">Last known location (optional)</label>
 <input id="location" name="location" aria-invalid={!!errors.location} aria-describedby={errors.location?'location-error':undefined} value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="e.g., Library - second floor"/>
 {errors.location&&<p className="field-error" id="location-error">{errors.location}</p>}
 <label htmlFor="description">More details (optional)</label>
 <textarea id="description" name="description" rows="6" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder="Describe your item"/>
 <div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div>
</form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
