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
const categories=['all','electronics','clothing','documents','accessories','other'];
const statuses=['lost','found','claimed'];
const collectionPoints=['Campus Security Desk','Student Services Office','Library Reception'];
const fieldOrder=['title','status','category'];
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
// Every search word must appear somewhere, so "blue earbuds" finds "Earbuds in blue case".
const matchesQuery=(x,q)=>{const hay=`${x.title} ${x.location} ${x.description} ${x.category}`.toLowerCase();return q.toLowerCase().split(/\s+/).filter(Boolean).every(w=>hay.includes(w));};
// Returns one message per invalid field; same rules as before, but specific enough to act on.
function validate(f,arr,id){
 const e={};
 if(!f.title.trim()||f.title.trim().length<2)e.title='Enter an item title of at least 2 characters, e.g. "Black backpack".';
 if(!statuses.includes(f.status))e.status='Choose lost, found or claimed.';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category.';
 const dup=!e.title&&arr.find(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase());
 if(dup){e.title=`"${dup.title}" has already been reported at ${dup.location||'an unspecified location'}. Change the title or location, or open the existing report.`;e.dup=dup;}
 return e;
}
// What a finder or owner can rely on: a report alone does not mean staff hold the item.
function handover(item){
 if(item.status==='lost')return null;
 if(item.handoverStatus==='released')return {tone:'done',head:'Returned to owner',body:'Ownership was verified and the item was collected.'};
 if(item.status==='found'&&item.handoverStatus==='received'&&item.collectionPoint)return {tone:'held',head:`Held at ${item.collectionPoint}`,body:'Bring proof of ownership to collect it.'};
 if(item.status==='claimed')return {tone:'pending',head:'Marked as claimed',body:'Not confirmed by a collection point.'};
 return {tone:'pending',head:'Not yet at a collection point',body:'Reported by a student. Staff have not confirmed they hold it.'};
}
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
 const fieldRefs=useRef({});
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&matchesQuery(x,q)),[items,q,cat,filterStatus]);
 const active=[q.trim()&&{key:'q',label:`"${q.trim()}"`,clear:()=>setQ('')},cat!=='all'&&{key:'cat',label:cap(cat),clear:()=>setCat('all')},filterStatus!=='all'&&{key:'status',label:cap(filterStatus),clear:()=>setFilterStatus('all')}].filter(Boolean);
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 function goBoard(){setPage('board');setErrors({});}
 function create(){setCurrent(null);setForm({...clean});setErrors({});setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setErrors({});setPage('form');}
 function setField(k,v){setForm(s=>({...s,[k]:v}));setErrors(e=>{const n={...e};delete n[k];if(e.dup&&(k==='title'||k==='location')){delete n.title;delete n.dup;}return n;});}
 function showMatches(item){setQ('');setCat(item.category);setFilterStatus('found');setMessage(`Found ${item.category} that may match "${item.title}". Compare the details, then visit the collection point with proof of ownership.`);window.scrollTo(0,0);}
 function showExisting(dup){setQ(dup.title);setCat('all');setFilterStatus('all');setMessage('');goBoard();}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(Object.keys(v).length){setErrors(v);fieldRefs.current[fieldOrder.find(k=>v[k])]?.focus();return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);clearFilters();setMessage(`Your report "${d.title}" has been posted in the ${cap(d.status)} column.`);}setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');}
 const err=k=>errors[k]?{'aria-invalid':true,'aria-describedby':`err-${k}`}:{};
 const found=form.status==='found';
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={goBoard} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><div className="header-links"><button onClick={()=>{clearFilters();goBoard()}}>Noticeboard</button><button onClick={()=>{setFilterStatus('lost');goBoard()}}>Missing items</button><button onClick={()=>{setFilterStatus('found');goBoard()}}>Recently found</button></div><div className="post-cta"><span>Lost or found something?<small>Post it so the owner or finder can see it.</small></span><button className="report-button" onClick={create}>+ Post a report</button></div></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox"><h3>Browse reports</h3><label>Search items<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. blue earbuds"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><p className="filter-hint">Results update as you type.</p></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>
    <div className="result-bar" aria-live="polite"><span className="result-count">Showing {filtered.length} of {items.length} reports</span>{active.map(f=><button key={f.key} className="chip" onClick={f.clear} aria-label={`Remove filter ${f.label}`}>{f.label} ×</button>)}{active.length>0&&<button className="link-button" onClick={clearFilters}>Clear all</button>}</div>
    {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    {filtered.length===0?<div className="empty-state"><h3>No reports match your search</h3><p>Try fewer or different words (for example "backpack" instead of "black backpack"), or remove a filter. If nobody has reported your item yet, post a lost notice so a finder can recognise it.</p><div className="empty-actions"><button className="report-button" onClick={create}>Post a report</button><button className="secondary-button" onClick={clearFilters}>Clear filters</button></div></div>:
    <div className="board-grid">{[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].map(col=><div className={'board-column '+col.key} key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div><div className="sticky-list">{filtered.filter(r=>r.status===col.key).map(item=>{const h=handover(item);const matchCount=item.status==='lost'&&item.owner==='you'?items.filter(r=>r.status==='found'&&r.category===item.category).length:0;return <article className="sticky" key={item.id}><div className="sticky-top"><span>{item.category}</span>{item.owner==='you'&&<span className="own-tag">Your report</span>}</div><div className="sticky-emoji">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{h&&<div className={'handover-note '+h.tone}><strong>{h.head}</strong><span>{h.body}</span></div>}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>{item.owner==='you'&&<div className="card-actions"><button onClick={()=>edit(item)} aria-label={`Edit ${item.title}`}>Edit report</button>{matchCount>0&&<button onClick={()=>showMatches(item)}>See possible matches ({matchCount})</button>}</div>}</article>;})}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">{active.length?`No ${col.key} reports match`:'Nothing here yet'}</div>}</div></div>)}</div>}
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={goBoard}>← Noticeboard</button><span>/</span><span>{current?'Edit report':'Report an item'}</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit} noValidate>
    <label htmlFor="f-title">Item title <b aria-hidden="true">*</b></label><input id="f-title" ref={el=>fieldRefs.current.title=el} {...err('title')} value={form.title} onChange={e=>setField('title',e.target.value)} placeholder="e.g., Black backpack"/>{errors.title&&<div className="field-error" id="err-title">{errors.title}{errors.dup&&<button type="button" className="link-button" onClick={()=>showExisting(errors.dup)}>Show the existing report</button>}</div>}
    <label htmlFor="f-status">Status <b aria-hidden="true">*</b></label><select id="f-status" ref={el=>fieldRefs.current.status=el} {...err('status')} value={form.status} onChange={e=>setField('status',e.target.value)}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{errors.status&&<div className="field-error" id="err-status">{errors.status}</div>}
    {found&&<div className="form-hint"><strong>Please hand the item to a collection point</strong>{collectionPoints.join(', ')}. Staff release items only after ownership is verified. Until they confirm receipt, your notice will say the item is not yet at a collection point.</div>}
    {form.status==='lost'&&!current&&<div className="form-hint">Someone may already have handed it in. <button type="button" className="link-button" onClick={()=>{clearFilters();setFilterStatus('found');goBoard()}}>Check found items first</button></div>}
    <label htmlFor="f-category">Category <b aria-hidden="true">*</b></label><select id="f-category" ref={el=>fieldRefs.current.category=el} {...err('category')} value={form.category} onChange={e=>setField('category',e.target.value)}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{errors.category&&<div className="field-error" id="err-category">{errors.category}</div>}
    <label htmlFor="f-location">{found?'Where you found it':'Last known location'} <small>(optional)</small></label><input id="f-location" value={form.location} onChange={e=>setField('location',e.target.value)} placeholder={found?'e.g., Library main stairwell':'e.g., Library - second floor'}/>
    <label htmlFor="f-description">More details <small>(optional)</small></label><textarea id="f-description" rows="6" value={form.description} onChange={e=>setField('description',e.target.value)} placeholder={found?'Describe it, but leave out details only the owner would know. They help staff verify ownership.':'Colour, brand, case, stickers or anything that makes it recognisable'}/>
    {Object.keys(errors).length>0&&<div className="form-error" role="alert">Fix the highlighted {fieldOrder.filter(k=>errors[k]).length>1?'fields':'field'} to publish your notice.</div>}<div className="form-actions"><button type="button" onClick={goBoard}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
