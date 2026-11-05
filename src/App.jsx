import React,{useEffect,useMemo,useRef,useState} from 'react';

const STORE='acl-foundboard-v4';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed=[
 {id:'f1',title:'Black backpack',category:'accessories',status:'lost',location:'Library - second floor',description:'Black backpack with a small red keychain. Left near the study desks.',owner:'other',created:'Oct 23',emoji:'🎒'},
 {id:'f2',title:'Dark backpack',category:'accessories',status:'found',location:'Library - main stairwell',description:'Found a dark backpack with a small red keychain near the library stairs.',owner:'other',created:'Oct 24',emoji:'🎒',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f3',title:'Student ID card',category:'documents',status:'found',location:'Near Gate 3',description:'A student card was turned in. No personal details are published.',owner:'other',created:'Oct 24',emoji:'🪪',collectionPoint:'Student Services Office',handoverStatus:'received'},
 {id:'f4',title:'Wireless earbuds',category:'electronics',status:'lost',location:'Main cafeteria',description:'White earbuds in a distinctive blue case. Lost on Monday.',owner:'other',created:'Oct 24',emoji:'🎧'},
 {id:'f5',title:'Earbuds in blue case',category:'electronics',status:'found',location:'Cafeteria entrance',description:'White earbuds in a blue charging case found near the coffee counter.',owner:'other',created:'Oct 25',emoji:'🎧',collectionPoint:'',handoverStatus:'reported'},
 {id:'f6',title:'Blue sports bottle',category:'other',status:'lost',location:'Sports Hall - lockers',description:'Tall blue metal water bottle, possibly left after practice.',owner:'other',created:'Oct 25',emoji:'🥤'},
 {id:'f7',title:'Metal water bottle',category:'other',status:'found',location:'Sports Hall - benches',description:'Blue reusable metal bottle found after a basketball session.',owner:'other',created:'Oct 25',emoji:'🥤',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f8',title:'Engineering lab coat',category:'clothing',status:'claimed',location:'Building C',description:'Owner verified the item and collected it from the reception desk.',owner:'other',created:'Oct 22',emoji:'🥼',collectionPoint:'Library Reception',handoverStatus:'released'},
 {id:'f9',title:'Small notebook',category:'other',status:'lost',location:'C7 lecture room',description:'Brown cover with handwritten engineering notes.',owner:'other',created:'Oct 25',emoji:'📒'},
 {id:'f10',title:'Scientific calculator',category:'electronics',status:'lost',location:'B2 lecture hall',description:'Black scientific calculator with a protective cover.',owner:'other',created:'Oct 26',emoji:'🧮'},
 {id:'f11',title:'Calculator',category:'electronics',status:'found',location:'B2 study area',description:'Scientific calculator with a black cover, found on a desk.',owner:'other',created:'Oct 26',emoji:'🧮',collectionPoint:'Library Reception',handoverStatus:'received'},
 {id:'f12',title:'Canvas tote bag',category:'accessories',status:'lost',location:'Main campus bus stop',description:'Beige tote with green writing on one side.',owner:'other',created:'Oct 26',emoji:'👜'},
 {id:'f13',title:'USB flash drive',category:'electronics',status:'found',location:'Building A computer lab',description:'A small black flash drive was found beside a workstation.',owner:'other',created:'Oct 27',emoji:'💾',collectionPoint:'',handoverStatus:'reported'},
];
const categories=['all','electronics','clothing','documents','accessories','other'];
const statuses=['lost','found','claimed'];
const clean={title:'',category:'',status:'',location:'',description:''};
const TABS=[
 {key:'lost',label:'Lost',title:'Lost items',sub:'SEARCHING FOR THESE THINGS'},
 {key:'found',label:'Found',title:'Found items',sub:'LOOKING FOR THE OWNERS'},
 {key:'mine',label:'My items',title:'My items',sub:'REPORTS YOU HAVE POSTED'},
];
// Claimed reports do not record whether they began as lost or found, so the toggle reveals them on both public tabs.
const inTab=(item,tab,showClaimed)=>tab==='mine'?item.owner==='you':item.status===tab||(showClaimed&&item.status==='claimed');
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function validate(f,arr,id){
 if(!f.title.trim()||f.title.trim().length<2)return 'Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))return 'Choose a category.';
 if(!statuses.includes(f.status))return 'Choose lost, found or claimed.';
 if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))return 'An item with the same title has already been reported at this location.';
 return '';
}
function EditIcon(){
 return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;
}
function SuccessModal({success,onView,onClose}){
 const ref=useRef(null);
 // showModal() gives us the focus trap, inert background and Escape handling.
 useEffect(()=>{if(!ref.current.open)ref.current.showModal();},[]);
 const tabLabel=TABS.find(t=>t.key===success.landing).label;
 return <dialog ref={ref} className="success-modal" aria-labelledby="success-title" aria-describedby="success-body" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current)onClose();}}>
  <div className="success-body">
   <span className="success-check"><svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></span>
   <h2 id="success-title">{success.edited?'Changes saved':'Report submitted'}</h2>
   <p id="success-body">{success.edited?`Your changes to "${success.title}" have been saved.`:`"${success.title}" has been submitted and is now listed under ${tabLabel}.`}</p>
   <div className="success-actions"><button className="report-button" onClick={onView}>View my report</button><button className="secondary-button" onClick={onClose}>Close</button></div>
  </div>
 </dialog>;
}
export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [tab,setTab]=useState('lost');
 const [showClaimed,setShowClaimed]=useState(false);
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [success,setSuccess]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const matches=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())),[items,q,cat]);
 const visible=useMemo(()=>matches.filter(x=>inTab(x,tab,showClaimed)).sort((a,b)=>(a.status==='claimed')-(b.status==='claimed')),[matches,tab,showClaimed]);
 const activeTab=TABS.find(t=>t.key===tab);
 const hasOwnReports=items.some(x=>x.owner==='you');
 const hasFilters=q!==''||cat!=='all';
 function create(){setCurrent(null);setForm({...clean});setError('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setError('');setPage('form');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){setError('Please review your entries.');return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 const landing=d.status==='claimed'?'mine':d.status;
 if(current)setItems(items.map(x=>x.id===current?{...x,...d}:x));else setItems([{id:`f-${Date.now()}`,...d},...items]);
 // Clear search filters so the report the user just saved cannot be hidden behind them.
 setQ('');setCat('all');setMessage('');setTab(landing);setSuccess({edited:Boolean(current),title:d.title,landing});setPage('board');setCurrent(null);}
 function closeSuccess(target){setTab(target);setSuccess(null);requestAnimationFrame(()=>document.getElementById(`tab-${target}`)?.focus());}
 function clearFilters(){setQ('');setCat('all');setShowClaimed(false);}
 function onTabKey(e,i){const step={ArrowRight:1,ArrowLeft:-1}[e.key];if(!step)return;e.preventDefault();const next=TABS[(i+step+TABS.length)%TABS.length].key;setTab(next);document.getElementById(`tab-${next}`)?.focus();}
 function reset(){setItems(seed);setPage('board');clearFilters();setTab('lost');setMessage('Example reports restored.');}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>setPage('board')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><div className="tabs" role="tablist" aria-label="Browse reports">{TABS.map((t,i)=><button key={t.key} id={`tab-${t.key}`} className="tab" role="tab" aria-selected={tab===t.key} aria-controls="tab-panel" tabIndex={tab===t.key?0:-1} onClick={()=>setTab(t.key)} onKeyDown={e=>onTabKey(e,i)}>{t.label}<span className="tab-count">{matches.filter(x=>inTab(x,t.key,showClaimed)).length}</span></button>)}</div><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox"><h3>Browse reports</h3><label>Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>{tab!=='mine'&&<label className="check-row"><input type="checkbox" checked={showClaimed} onChange={e=>setShowClaimed(e.target.checked)}/>Show claimed items</label>}<div className="filterbuttons"><button onClick={()=>setMessage(`${visible.length} reports shown.`)}>Apply</button><button onClick={clearFilters}>Clear</button></div></div><div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board" id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}><div className="board-top"><div><p className="kicker">{activeTab.sub}</p><h2>{activeTab.title} <span>({visible.length})</span></h2></div><span className="time-note">Updated today</span></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')}>✕</button></div>}
    {tab==='mine'&&!hasOwnReports?<div className="empty-card"><span aria-hidden="true">📌</span><h3>You have no reports yet</h3><p>Lost or found something? Create a report and it will appear here, where you can keep track of it and edit it.</p><button className="report-button" onClick={create}>+ Create a report</button></div>:visible.length===0?<div className="empty-column">{hasFilters?<>No reports match your search.<button onClick={clearFilters}>Clear filters</button></>:'Nothing here yet'}</div>:<div className="board-grid">{visible.map(item=><article className="sticky" key={item.id}><div className="sticky-top"><div className="sticky-tags"><span>{item.category}</span>{(tab==='mine'||item.status==='claimed')&&<span className={'status-badge '+item.status}>{item.status}</span>}</div>{item.owner==='you'&&<button className="edit-button" onClick={()=>edit(item)} aria-label={`Edit your report: ${item.title}`} title="Edit your report"><EditIcon/></button>}</div><div className="sticky-emoji">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className="handover-note">{item.handoverStatus==='received'&&item.collectionPoint?`Received at ${item.collectionPoint}`:item.handoverStatus==='released'?'Collected by owner':'Reported found - not confirmed at a collection point'}</div>}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div></article>)}</div>}
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit}><label>Item title <b>*</b><input value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/></label><label>Status <b>*</b><select value={form.status} onChange={e=>setForm(s=>({...s,status:e.target.value}))}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><label>Category <b>*</b><select value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s}>{s}</option>)}</select></label><label>Last known location<input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="Location (optional)"/></label><label>More details<textarea rows="6" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder="Describe your item"/></label>{error&&<div className="form-error" role="alert">{error}</div>}<div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  {success&&<SuccessModal success={success} onView={()=>closeSuccess('mine')} onClose={()=>closeSuccess(success.landing)}/>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
