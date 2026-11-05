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
const collectionPoints=['Campus Security Desk','Student Services Office','Library Reception'];
const clean={title:'',category:'',status:'',location:'',description:''};
// Form fields in the order they appear, so focus goes to the first invalid one.
const fieldOrder=['status','title','category','location'];
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

// Same rules and messages as before, but every failing field is reported
// (not only the first), and a duplicate points at the report it clashes with.
function validate(f,arr,id){
 const e={};
 if(!f.title.trim()||f.title.trim().length<2)e.title='Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category.';
 if(!statuses.includes(f.status))e.status='Choose lost, found or claimed.';
 if(!e.title){
  const dup=arr.find(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase());
  if(dup){e.title='An item with the same title has already been reported at this location.';e.location='Change the title or location if this is a different item.';e.dupId=dup.id;}
 }
 return e;
}

// Possible matches: reports of the opposite status (lost <-> found) in the same
// category that share at least two descriptive words. A hint only, never a confirmation.
const STOP=new Set(['the','and','with','near','found','lost','left','after','from','one','side','small','possibly','for','was','not','are','its','main','area']);
const words=s=>new Set((s||'').toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!STOP.has(w)));
function findMatches(item,all){
 if(item.status==='claimed')return [];
 const want=item.status==='lost'?'found':'lost';
 const mine=words(`${item.title} ${item.description} ${item.location}`);
 return all.filter(o=>o.id!==item.id&&o.status===want&&o.category===item.category)
  .map(o=>{const theirs=words(`${o.title} ${o.description} ${o.location}`);let score=0;mine.forEach(w=>{if(theirs.has(w))score++;});return {o,score};})
  .filter(m=>m.score>=2).sort((a,b)=>b.score-a.score).slice(0,2).map(m=>m.o);
}

// What the reader should do next, based on where the item physically is.
function nextStep(item){
 if(item.status==='lost')return null;
 if(item.handoverStatus==='released')return {tone:'done',text:'Collected by the owner after verification.'};
 if(item.handoverStatus==='received'&&item.collectionPoint)return {tone:'held',text:`Held at ${item.collectionPoint}. Bring proof of ownership to collect it.`};
 if(item.owner==='you')return {tone:'todo',text:'Not handed in yet. Please take it to a campus collection point so the owner can recover it.'};
 return {tone:'todo',text:'Reported found only — not yet confirmed at a collection point. Staff may not have it yet.'};
}

const formHints={
 lost:'Tip: check the Found column first — your item may already have been handed in.',
 found:`After posting, hand the item to a collection point (${collectionPoints.join(', ')}). Until staff receive it, your notice will show it as not yet confirmed.`,
 claimed:'Use Claimed only once the owner has collected the item.',
};
const locationLabel={lost:'Where did you last have it?',found:'Where did you find it?',claimed:'Location'};
const detailsPlaceholder={
 found:'Describe it, but keep one identifying detail back so staff can verify the real owner.',
 lost:'Colour, brand, stickers, contents — anything that helps someone recognize it.',
};

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
 const [highlight,setHighlight]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 // Confirmation messages disappear on their own instead of staying forever.
 useEffect(()=>{if(!message)return;const t=setTimeout(()=>setMessage(''),5000);return()=>clearTimeout(t);},[message]);
 // Bring a card into view when the user jumps to it from a match or a duplicate error.
 useEffect(()=>{
  if(!highlight||page!=='board')return;
  const el=document.getElementById('card-'+highlight);
  if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.focus({preventScroll:true});}
  const t=setTimeout(()=>setHighlight(null),4000);return()=>clearTimeout(t);
 },[highlight,page]);

 // Search matches every typed word in any order, across title, location, description and category.
 const terms=q.toLowerCase().split(/\s+/).filter(Boolean);
 const filtered=useMemo(()=>items.filter(x=>{
  if(cat!=='all'&&x.category!==cat)return false;
  if(filterStatus!=='all'&&x.status!==filterStatus)return false;
  const hay=`${x.title} ${x.location} ${x.description} ${x.category}`.toLowerCase();
  return terms.every(t=>hay.includes(t));
 }),[items,q,cat,filterStatus]);
 const filtersActive=q.trim()!==''||cat!=='all'||filterStatus!=='all';

 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 function showBoard(status){setQ('');setCat('all');setFilterStatus(status);setPage('board');}
 function jumpTo(id){clearFilters();setPage('board');setHighlight(id);}
 function create(){setCurrent(null);setForm({...clean});setErrors({});setMessage('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setErrors({});setMessage('');setPage('form');}
 function updateField(k,v){
  setForm(s=>({...s,[k]:v}));
  setErrors(e=>{
   if(!e[k]&&!(e.dupId&&(k==='title'||k==='location')))return e;
   const n={...e};delete n[k];
   if(e.dupId&&(k==='title'||k==='location')){delete n.title;delete n.location;delete n.dupId;}
   return n;
  });
 }
 function submit(e){
  e.preventDefault();
  const v=validate(form,items,current);
  const bad=fieldOrder.filter(k=>v[k]);
  if(bad.length){setErrors(v);document.getElementById('field-'+bad[0])?.focus();return;}
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
  const savedId=current||`f-${Date.now()}`;
  if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:savedId,...d},...items]);setMessage(d.status==='found'?'Your report has been posted. Remember to hand the item to a collection point.':'Your report has been posted.');}
  // Show the report the user just saved, even if an earlier filter would hide it.
  setErrors({});clearFilters();setPage('board');setCurrent(null);setHighlight(savedId);
 }
 function reset(){setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');}

 const errorCount=fieldOrder.filter(k=>errors[k]).length;
 const fieldProps=k=>({id:'field-'+k,'aria-invalid':errors[k]?'true':undefined,'aria-describedby':errors[k]?'err-'+k:undefined});
 const fieldError=k=>errors[k]&&<span className="field-error" id={'err-'+k}>{errors[k]}</span>;
 const navActive=s=>page==='board'&&filterStatus===s;

 function renderCard(item){
  const step=nextStep(item);
  const matches=findMatches(item,items);
  return <article className={'sticky'+(highlight===item.id?' highlight':'')} key={item.id} id={'card-'+item.id} tabIndex={-1}>
   <div className="sticky-top"><span>{item.category}</span>{item.owner==='you'?<span className="you-tag">Your report</span>:null}</div>
   <div className="sticky-emoji">{item.emoji}</div>
   <h3>{item.title}</h3>
   <p>{item.description||'No additional description.'}</p>
   {step&&<div className={'handover-note '+step.tone}>{step.text}</div>}
   {matches.length>0&&<div className="matches"><strong>{item.status==='lost'?'Possibly found':'Possible owner report'}</strong>
    {matches.map(m=><button type="button" key={m.id} onClick={()=>jumpTo(m.id)}>{m.emoji} {m.title} <span>· {cap(m.status)}{m.status==='found'&&m.handoverStatus==='received'&&m.collectionPoint?`, at ${m.collectionPoint}`:''}</span></button>)}
    <small>Similar description only — ownership is verified at the collection point.</small></div>}
   <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>
   {item.owner==='you'&&<button type="button" className="edit-btn" onClick={()=>edit(item)} aria-label={`Edit your report: ${item.title}`}>Edit report</button>}
  </article>;
 }

 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>showBoard('all')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><div className="header-links"><button className={navActive('all')&&!filtersActive?'active':''} aria-pressed={navActive('all')&&!filtersActive} onClick={()=>showBoard('all')}>Noticeboard</button><button className={navActive('lost')?'active':''} aria-pressed={navActive('lost')} onClick={()=>showBoard('lost')}>Missing items</button><button className={navActive('found')?'active':''} aria-pressed={navActive('found')} onClick={()=>showBoard('found')}>Recently found</button></div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox"><h3>Browse reports</h3><label>Search items<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. blue earbuds, library"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><p className="live-count" aria-live="polite">Showing <strong>{filtered.length}</strong> of {items.length} reports{filtersActive?' — filters update as you type':''}</p>{filtersActive&&<div className="filterbuttons"><button onClick={clearFilters}>Clear filters</button></div>}</div><div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    <div className="board-grid">{[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].map(col=>{
     const hidden=filterStatus!=='all'&&filterStatus!==col.key;
     const list=filtered.filter(r=>r.status===col.key);
     return <div className={'board-column'+(hidden?' is-hidden':'')} key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{hidden?'–':list.length}</span></div><div className="sticky-list">
      {hidden?<div className="empty-column">Hidden by the status filter.<button onClick={()=>setFilterStatus('all')}>Show all statuses</button></div>
      :list.length?list.map(renderCard)
      :filtersActive?<div className="empty-column">No {col.key} reports match your search.<button onClick={clearFilters}>Clear filters</button></div>
      :<div className="empty-column">Nothing here yet</div>}
     </div></div>;})}</div>
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>{current?'Edit your report':'Report an item'}</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit} noValidate>
    {errorCount>0&&<div className="form-error" role="alert">{errorCount===1?'1 field needs attention':`${errorCount} fields need attention`} — see the messages below.{errors.dupId&&<> <button type="button" className="link-btn" onClick={()=>jumpTo(errors.dupId)}>View the existing report</button></>}</div>}
    <label><span className="label-text">Status <b>*</b></span><select {...fieldProps('status')} value={form.status} onChange={e=>updateField('status',e.target.value)}><option value="">Did you lose or find it?</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{fieldError('status')}</label>
    {formHints[form.status]&&<p className={'form-hint '+form.status}>{formHints[form.status]}</p>}
    <label><span className="label-text">Item title <b>*</b></span><input {...fieldProps('title')} value={form.title} onChange={e=>updateField('title',e.target.value)} placeholder="e.g., Black backpack"/>{fieldError('title')}</label>
    <label><span className="label-text">Category <b>*</b></span><select {...fieldProps('category')} value={form.category} onChange={e=>updateField('category',e.target.value)}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{fieldError('category')}</label>
    <label><span className="label-text">{locationLabel[form.status]||'Location'} <small className="optional">(optional)</small></span><input {...fieldProps('location')} value={form.location} onChange={e=>updateField('location',e.target.value)} placeholder="e.g., Library - second floor"/>{fieldError('location')}</label>
    <label><span className="label-text">More details <small className="optional">(optional)</small></span><textarea rows="6" value={form.description} onChange={e=>updateField('description',e.target.value)} placeholder={detailsPlaceholder[form.status]||'Describe your item'}/></label>
    <div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
