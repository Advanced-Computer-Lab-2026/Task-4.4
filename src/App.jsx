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
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

// FIX 1: return every problem, keyed by field, so each message can be shown next to its field.
// Same rules as before; the duplicate also returns the matching report so the user can open it.
function validate(f,arr,id){
 const e={};const t=f.title.trim();
 if(t.length<2)e.title='Title must be at least 2 characters.';
 if(!statuses.includes(f.status))e.status='Choose lost, found or claimed.';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category.';
 if(!e.title){const dup=arr.find(r=>r.id!==id&&r.title.toLowerCase()===t.toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase());if(dup){e.title='An item with this title has already been reported at this location. Change the title or location, or open the existing report.';e.dup=dup;}}
 return e;
}
const fieldKeys=e=>Object.keys(e).filter(k=>k!=='dup');

// FIX 2: tell the user what the report means for them and what to do next.
function nextStep(item){
 if(item.status==='lost')return null;
 if(item.handoverStatus==='received'&&item.collectionPoint)return {tone:'ready',title:`Collect at ${item.collectionPoint}`,text:'Ownership is verified before the item is handed over.'};
 if(item.handoverStatus==='released')return {tone:'done',title:'Collected by owner',text:'This item is back with its owner.'};
 return {tone:'pending',title:'Not at a collection point yet',text:'The finder reported it, but staff have not received it. Check back for updates.'};
}

// Horizontal row per section. Arrow buttons let mouse users scroll sideways; they only appear when there is more to see.
function ScrollRow({label,children}){
 const ref=useRef(null);const [can,setCan]=useState({l:false,r:false});
 const check=()=>{const el=ref.current;if(!el)return;const l=el.scrollLeft>2,r=el.scrollLeft+el.clientWidth<el.scrollWidth-2;setCan(p=>p.l===l&&p.r===r?p:{l,r});};
 useEffect(()=>{check();const ro=new ResizeObserver(check);ro.observe(ref.current);return()=>ro.disconnect();});
 const go=d=>ref.current.scrollBy({left:d*ref.current.clientWidth*0.8,behavior:'smooth'});
 return <div className="row-wrap">{can.l&&<button className="row-nav prev" onClick={()=>go(-1)} aria-label={`Scroll ${label} left`}>‹</button>}<div className="sticky-list" ref={ref} onScroll={check}>{children}</div>{can.r&&<button className="row-nav next" onClick={()=>go(1)} aria-label={`Scroll ${label} right`}>›</button>}</div>;
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
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())),[items,q,cat,filterStatus]);
 const filtersActive=q!==''||cat!=='all'||filterStatus!=='all';
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 function openForm(f,id=null){setCurrent(id);setForm(f);setErrors({});setPage('form');}
 function create(){openForm({...clean});}
 function reportFound(row){openForm({...clean,title:row.title,category:row.category,status:'found'});}
 function edit(row){if(row.owner!=='you')return;openForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description},row.id);}
 function seeFound(row){setQ('');setCat(row.category);setFilterStatus('found');setMessage(`Showing found ${row.category}. Compare them with your report.`);}
 function update(k,v){setForm(s=>({...s,[k]:v}));setErrors(e=>{const n={...e};delete n[k];if(e.dup&&(k==='title'||k==='location')){delete n.dup;delete n.title;}return n;});}
 function openExisting(dup){clearFilters();setQ(dup.title);setPage('board');setMessage('This is the existing report with the same title and location.');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);const keys=fieldKeys(v);if(keys.length){setErrors(v);document.getElementById(`field-${keys[0]}`)?.focus();return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.');}clearFilters();setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');}
 const err=k=>errors[k]?{'aria-invalid':true,'aria-describedby':`err-${k}`,className:'invalid'}:{};
 const errText=k=>errors[k]&&<span className="field-error" id={`err-${k}`}>{errors[k]}{k==='title'&&errors.dup&&<button type="button" onClick={()=>openExisting(errors.dup)}>Open existing report →</button>}</span>;
 const nErr=fieldKeys(errors).length;
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>setPage('board')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><div className="header-links"><button onClick={()=>setPage('board')}>Noticeboard</button><button onClick={()=>{setFilterStatus('lost');setPage('board')}}>Missing items</button><button onClick={()=>{setFilterStatus('found');setPage('board')}}>Recently found</button></div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><div className="intro-row"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something? <em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p></div>
   {/* FIX 3: search and filters as one toolbar above the results; filtering is live, so no Apply button. */}
   <div className="toolbar" role="search"><label className="tb-search">Search items<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. backpack, earbuds, ID card"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>{filtersActive&&<button className="clear-filters" onClick={clearFilters}>Clear filters</button>}</div>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss">✕</button></div>}
    <div className="board-grid">{[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].map(col=><div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div><ScrollRow label={col.title.toLowerCase()}>{filtered.filter(r=>r.status===col.key).map(item=>{const step=nextStep(item);const mine=item.owner==='you';return <article className={'sticky'+(mine?' mine':'')} key={item.id}><div className="sticky-top"><span>{item.category}</span>{mine&&<span className="mine-tag">Your report</span>}</div><div className="sticky-emoji">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{step&&<div className={'next-step '+step.tone}><strong>{step.title}</strong><span>{step.text}</span></div>}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div><div className="card-actions">{mine&&<button onClick={()=>edit(item)}>Edit report</button>}{mine&&item.status==='lost'&&<button onClick={()=>seeFound(item)}>See found {item.category} →</button>}{!mine&&item.status==='lost'&&<button onClick={()=>reportFound(item)}>I found this →</button>}</div></article>})}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">Nothing here yet</div>}</ScrollRow></div>)}</div>
    <button className="reset" onClick={reset}>Reset demo data</button>
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit} noValidate><label><span>Item title <b>*</b></span><input id="field-title" {...err('title')} value={form.title} onChange={e=>update('title',e.target.value)} placeholder="e.g., Black backpack"/>{errText('title')}</label><label><span>Status <b>*</b></span><select id="field-status" {...err('status')} value={form.status} onChange={e=>update('status',e.target.value)}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{errText('status')}</label><label><span>Category <b>*</b></span><select id="field-category" {...err('category')} value={form.category} onChange={e=>update('category',e.target.value)}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{errText('category')}</label><label>Last known location<input value={form.location} onChange={e=>update('location',e.target.value)} placeholder="Location (optional)"/></label><label>More details<textarea rows="6" value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Describe your item"/></label>{nErr>0&&<div className="form-error" role="alert">{nErr===1?'1 field needs attention.':`${nErr} fields need attention.`} See the highlighted {nErr===1?'field':'fields'} above.</div>}<div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
