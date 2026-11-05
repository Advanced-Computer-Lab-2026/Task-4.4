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
const clean={title:'',category:'',status:'',location:'',description:'',collectionPoint:''};
const fieldOrder=['title','status','category'];
const columns=[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}];
const stop=new Set(['with','near','found','lost','left','from','that','this','have','into','after','small','their','been','were','some']);

// Only accept saved data that looks like report records; otherwise fall back to the examples.
const isRecord=r=>r&&typeof r==='object'&&typeof r.id==='string'&&typeof r.title==='string'&&statuses.includes(r.status);
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)&&s.every(isRecord)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const norm=s=>(s||'').trim().toLowerCase();

// Returns {field:message} so each problem can be shown next to the field that caused it.
function validate(f,arr,id){
 const errs={};
 if(f.title.trim().length<2)errs.title='Title must be at least 2 characters.';
 else if(arr.some(r=>r.id!==id&&norm(r.title)===norm(f.title)&&norm(r.location)===norm(f.location)))errs.title='An item with this title has already been reported at this location. Change the title or the location.';
 if(!statuses.includes(f.status))errs.status='Choose lost, found or claimed.';
 if(!categories.slice(1).includes(f.category))errs.category='Choose a category.';
 return errs;
}

const words=r=>new Set(`${r.title} ${r.description}`.toLowerCase().match(/[a-z]{4,}/g)?.filter(w=>!stop.has(w))||[]);
// A lost report and a found report in the same category that share at least two descriptive words are a possible match.
function matchesFor(item,all){
 if(item.status==='claimed')return [];
 const other=item.status==='lost'?'found':'lost';
 const mine=words(item);
 return all.filter(r=>r.status===other&&r.category===item.category&&[...words(r)].filter(w=>mine.has(w)).length>=2);
}
function handoverText(item){
 if(item.status==='claimed')return item.handoverStatus==='released'?'Collected by owner':'Marked as claimed by the reporter';
 if(item.handoverStatus==='received'&&item.collectionPoint)return `Received at ${item.collectionPoint}. Bring photo ID so staff can verify ownership.`;
 if(item.collectionPoint)return `Finder says it was handed to ${item.collectionPoint} - awaiting staff confirmation`;
 return 'Reported found - not confirmed at a collection point';
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [matchFor,setMatchFor]=useState(null);
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [errors,setErrors]=useState({});
 const [message,setMessage]=useState('');
 const [openMenu,setOpenMenu]=useState(null);
 const formRef=useRef(null);
 useEffect(()=>{localStorage.setItem(STORE,JSON.stringify(items));},[items]);
 // Close the card menu on Escape or any click outside it.
 useEffect(()=>{
  if(!openMenu)return;
  const onKey=e=>{if(e.key==='Escape')setOpenMenu(null);};
  const onClick=e=>{if(!e.target.closest('.menu-holder'))setOpenMenu(null);};
  document.addEventListener('keydown',onKey);document.addEventListener('click',onClick);
  return()=>{document.removeEventListener('keydown',onKey);document.removeEventListener('click',onClick);};
 },[openMenu]);
 const matchIds=useMemo(()=>{
  const src=items.find(x=>x.id===matchFor);
  return src?new Set([src.id,...matchesFor(src,items).map(m=>m.id)]):null;
 },[items,matchFor]);
 const matchSource=items.find(x=>x.id===matchFor);
 const filtered=useMemo(()=>items.filter(x=>(!matchIds||matchIds.has(x.id))&&(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.trim().toLowerCase())),[items,q,cat,filterStatus,matchIds]);
 const filtersActive=q.trim()!==''||cat!=='all'||filterStatus!=='all'||matchFor!==null;
 const activeFilters=[q.trim()&&`“${q.trim()}”`,cat!=='all'&&cap(cat),filterStatus!=='all'&&cap(filterStatus),matchSource&&`Matches for ${matchSource.title}`].filter(Boolean);
 function go(p){setPage(p);setMessage('');}
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');setMatchFor(null);}
 function showStatus(s){setFilterStatus(s);setMatchFor(null);go('board');}
 function create(){setCurrent(null);setForm({...clean});setErrors({});go('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location||'',description:row.description||'',collectionPoint:row.collectionPoint||''});setOpenMenu(null);setErrors({});go('form');}
 function focusField(name){formRef.current?.elements[name]?.focus();}
 function update(name,value){setForm(s=>({...s,[name]:value}));if(errors[name])setErrors(e=>{const n={...e};delete n[name];return n;});}
 function submit(e){e.preventDefault();
  const v=validate(form,items,current);
  if(Object.keys(v).length){setErrors(v);setTimeout(()=>focusField(fieldOrder.find(f=>v[f])),0);return;}
  const prev=items.find(x=>x.id===current);
  const point=form.status==='found'?form.collectionPoint:'';
  const d={title:form.title.trim(),category:form.category,status:form.status,location:form.location.trim(),description:form.description.trim(),owner:'you',collectionPoint:point};
  if(current){
   // Editing keeps the original date; staff-confirmed handover is only kept while the collection point is unchanged.
   const keep=prev.handoverStatus&&prev.collectionPoint===point&&form.status===prev.status;
   setItems(items.map(x=>x.id===current?{...x,...d,handoverStatus:keep?prev.handoverStatus:'reported'}:x));setMessage('Report updated.');
  }else{
   setItems([{id:`f-${Date.now()}`,...d,created:'Today',emoji:'📌',handoverStatus:'reported'},...items]);setMessage('Your report has been posted.');
  }
  setPage('board');setCurrent(null);}
 function reset(){setItems(seed);clearFilters();setPage('board');setMessage('Example reports restored.');}
 const errList=fieldOrder.filter(f=>errors[f]);
 const err=name=>errors[name]?<span className="field-error" id={`${name}-error`}>{errors[name]}</span>:null;
 const inv=name=>errors[name]?{'aria-invalid':true,'aria-describedby':`${name}-error`}:{};
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun" aria-hidden="true">✺</span><button onClick={()=>{clearFilters();go('board');}} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><nav className="header-links" aria-label="Main"><button aria-current={page==='board'&&filterStatus==='all'?'page':undefined} onClick={()=>{clearFilters();go('board');}}>Noticeboard</button><button aria-current={page==='board'&&filterStatus==='lost'?'page':undefined} onClick={()=>showStatus('lost')}>Missing items</button><button aria-current={page==='board'&&filterStatus==='found'?'page':undefined} onClick={()=>showStatus('found')}>Recently found</button></nav><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox" role="search"><h3>Browse reports</h3><label>Search items<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><div className="filterbuttons"><button onClick={clearFilters} disabled={!filtersActive}>Clear filters</button></div><p className="filter-hint">Results update as you type.</p></div><div className="side-message"><span aria-hidden="true">📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>
    <div className="results-bar" role="status" aria-live="polite">Showing {filtered.length} of {items.length} reports{activeFilters.length>0&&<> · filtered by {activeFilters.join(', ')}</>}{filtersActive&&<button onClick={clearFilters}>Clear filters</button>}</div>
    {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    {filtered.length===0&&<div className="no-results"><strong>No reports match your search.</strong><p>Try fewer words or a different category, or post a report so others can find it.</p><div><button onClick={clearFilters}>Clear filters</button><button className="report-button" onClick={create}>+ Post a report</button></div></div>}
    <div className="board-grid">{columns.map(col=>{const list=filtered.filter(r=>r.status===col.key);return <div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key} aria-hidden="true">{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{list.length}</span></div><div className="sticky-list">{list.map(item=>{const matches=matchesFor(item,items);return <article className="sticky" key={item.id}><div className="sticky-top"><span>{item.category}{item.owner==='you'&&<b className="yours">Yours</b>}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`} aria-expanded={openMenu===item.id}>···</button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?<button onClick={()=>edit(item)}>Edit your report</button>:<span>Reported by another student</span>}</div>}</div></div><div className="sticky-emoji" aria-hidden="true">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className="handover-note">{handoverText(item)}</div>}{matches.length>0&&<button className="match-link" onClick={()=>setMatchFor(item.id)}>{matches.length===1?'1 possible match':`${matches.length} possible matches`} · {item.status==='lost'?'see found item':'see lost report'} →</button>}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div></article>;})}{list.length===0&&<div className="empty-column">Nothing here{filtersActive?' with these filters':' yet'}</div>}</div></div>;})}</div>
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>go('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal" aria-hidden="true">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header><form ref={formRef} onSubmit={submit} noValidate>
    {errList.length>0&&<div className="form-error" role="alert"><strong>Please fix {errList.length===1?'1 problem':`${errList.length} problems`} before publishing:</strong><ul>{errList.map(f=><li key={f}><button type="button" onClick={()=>focusField(f)}>{errors[f]}</button></li>)}</ul></div>}
    <label><span>Item title <b aria-hidden="true">*</b></span><input name="title" value={form.title} onChange={e=>update('title',e.target.value)} placeholder="e.g., Black backpack" required {...inv('title')}/>{err('title')}</label>
    <label><span>Status <b aria-hidden="true">*</b></span><select name="status" value={form.status} onChange={e=>update('status',e.target.value)} required {...inv('status')}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{err('status')}</label>
    <label><span>Category <b aria-hidden="true">*</b></span><select name="category" value={form.category} onChange={e=>update('category',e.target.value)} required {...inv('category')}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{err('category')}</label>
    <label>{form.status==='found'?'Where did you find it?':'Last known location'}<input name="location" value={form.location} onChange={e=>update('location',e.target.value)} placeholder="Location (optional)"/></label>
    {form.status==='found'&&<label>Collection point<select name="collectionPoint" value={form.collectionPoint} onChange={e=>update('collectionPoint',e.target.value)}><option value="">I still have it / not handed in yet</option>{collectionPoints.map(p=><option key={p} value={p}>{p}</option>)}</select><span className="field-help">Hand found items to a campus collection point. Staff will verify ownership before releasing anything. Your report stays “awaiting confirmation” until staff receive it.</span></label>}
    <label>More details<textarea name="description" rows="6" value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Describe your item (colour, brand, marks)"/></label>
    <div className="form-actions"><button type="button" onClick={()=>go('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
