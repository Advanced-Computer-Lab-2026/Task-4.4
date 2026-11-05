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
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function validate(f,arr,id){
 if(!f.title.trim()||f.title.trim().length<2)return 'Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))return 'Choose a category.';
 if(!statuses.includes(f.status))return 'Choose lost, found or claimed.';
 if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))return 'An item with the same title has already been reported at this location.';
 return '';
}
// Which form field a validation message belongs to, so it can be marked and focused.
function fieldOf(msg){
 if(msg.startsWith('Choose a category'))return 'category';
 if(msg.startsWith('Choose lost'))return 'status';
 return 'title';
}

const Svg=({children,size=18,...p})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...p}>{children}</svg>;
const IconSun=p=><Svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></Svg>;
const IconLost=p=><Svg {...p}><circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></Svg>;
const IconFound=p=><Svg {...p}><path d="M20 7 9.5 17.5 4 12"/></Svg>;
const IconClaimed=p=><Svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Svg>;
const IconCheck=p=><Svg {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 9.5"/></Svg>;
const IconAlert=p=><Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></Svg>;
const IconPin=p=><Svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></Svg>;
const columns=[
 {key:'lost',title:'Lost',sub:'Searching for these things',Icon:IconLost},
 {key:'found',title:'Found',sub:'Looking for the owners',Icon:IconFound},
 {key:'claimed',title:'Claimed',sub:'Back where they belong',Icon:IconClaimed},
];

function Custody({item}){
 if(item.handoverStatus==='received'&&item.collectionPoint)return <div className="custody custody-received"><IconCheck size={16}/><span>Received at {item.collectionPoint}</span></div>;
 if(item.handoverStatus==='released')return <div className="custody custody-released"><IconCheck size={16}/><span>Collected by owner</span></div>;
 return <div className="custody custody-reported"><IconAlert size={16}/><span>Reported found - not confirmed at a collection point</span></div>;
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
 const [errorField,setErrorField]=useState('');
 const [message,setMessage]=useState('');
 const [openMenu,setOpenMenu]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())),[items,q,cat,filterStatus]);
 const filtersActive=q!==''||cat!=='all'||filterStatus!=='all';
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 function create(){setCurrent(null);setForm({...clean});setError('');setErrorField('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setOpenMenu(null);setError('');setErrorField('');setPage('form');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){const f=fieldOf(v);setError(v);setErrorField(f);setTimeout(()=>document.getElementById('field-'+f)?.focus(),0);return;}setError('');setErrorField('');const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage(form.status==='found'?'Your report has been posted. It stays "not confirmed" until staff receive the item, so please hand it in at the Campus Security Desk, Student Services Office or Library Reception.':'Your report has been posted.');}setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');}
 const goBoard=()=>{setFilterStatus('all');setPage('board');};
 const onBoard=page==='board';
 const fieldErr=f=>errorField===f?{'aria-invalid':true,'aria-describedby':'form-error'}:{};
 const fieldMsg=f=>errorField===f&&error?<p id="form-error" className="field-error" role="alert"><IconAlert size={16}/>{error}</p>:null;
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun"><IconSun size={30}/></span><button onClick={goBoard} className="wordmark">FOUND<span>on campus</span></button></div><nav className="header-links" aria-label="Primary"><button aria-current={onBoard&&filterStatus==='all'?'page':undefined} onClick={goBoard}>Noticeboard</button><button aria-current={onBoard&&filterStatus==='lost'?'page':undefined} onClick={()=>{setFilterStatus('lost');setPage('board')}}>Lost items</button><button aria-current={onBoard&&filterStatus==='found'?'page':undefined} onClick={()=>{setFilterStatus('found');setPage('board')}}>Found items</button></nav><button className="report-button" onClick={create}>+ Post a report</button></header>
  {onBoard?<main className="workspace"><aside className="filters"><h1>Lost something?<br/><em>Check what's been found.</em></h1><p className="intro">Browse what the campus community has shared, or post what you've lost or found.</p><div className="filterbox" role="search"><h2>Browse reports</h2><label className="f-search">Search items<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><div className="filterbuttons"><button onClick={()=>setMessage(`${filtered.length} reports shown.`)}>Apply</button><button onClick={clearFilters}>Clear</button></div></div><div className="side-message"><strong>Found something?</strong><p>Post a report so the owner can find it.</p><button onClick={create}>Post a report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board" aria-labelledby="board-title"><div className="board-top"><h2 id="board-title">Latest notices</h2><p className="results-line" aria-live="polite">Showing {filtered.length} of {items.length} reports{filtersActive&&<> · <button onClick={clearFilters}>Clear filters</button></>}</p></div>{message&&<div className="message" role="status"><span>{message}</span><button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    {filtered.length===0?<div className="empty-board"><h3>No reports match{q?<> “{q}”</>:null}</h3><p>Try fewer words or a different category, or post a report so others can find it.</p><div className="empty-actions"><button onClick={clearFilters}>Clear filters</button><button className="report-button" onClick={create}>+ Post a report</button></div></div>:
    <div className="board-grid">{columns.map(col=>{const rows=filtered.filter(r=>r.status===col.key);return <div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}><col.Icon size={16}/></span><div><h3>{col.title}</h3><small>{col.sub}</small></div><span className="col-count" aria-label={`${rows.length} ${col.key}`}>{rows.length}</span></div><div className="sticky-list">{rows.map(item=><article className={'sticky sticky-'+item.status} key={item.id} onKeyDown={e=>{if(e.key==='Escape')setOpenMenu(null)}}><div className="sticky-top"><span>{item.category}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`} aria-expanded={openMenu===item.id}>···</button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?<button onClick={()=>edit(item)}>Edit your report</button>:<span>Reported by another student</span>}</div>}</div></div><div className="sticky-emoji" aria-hidden="true">{item.emoji}</div><h4>{item.title}</h4><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<Custody item={item}/>}<div className="sticky-bottom"><span className="loc"><IconPin size={14}/>{item.location||'Location not provided'}</span><small>{item.created}</small></div></article>)}{rows.length===0&&<div className="empty-column">None here</div>}</div></div>})}</div>}
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span aria-hidden="true">/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal"><IconSun size={44}/></span><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide. Please leave out personal details.</div></div><section className="form-paper"><header><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit} noValidate><label>Item title <span className="req">(required)</span><input id="field-title" value={form.title} aria-required="true" {...fieldErr('title')} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/></label>{fieldMsg('title')}<label>Status <span className="req">(required)</span><select id="field-status" value={form.status} aria-required="true" {...fieldErr('status')} onChange={e=>setForm(s=>({...s,status:e.target.value}))}><option value="">Choose one</option><option value="lost">Lost - I'm looking for it</option><option value="found">Found - I have it or saw it</option><option value="claimed">Claimed - already returned to its owner</option></select></label>{fieldMsg('status')}{form.status==='found'&&<div className="handover-help"><strong>After you post, hand the item in at a collection point:</strong><ul>{collectionPoints.map(p=><li key={p}>{p}</li>)}</ul><p>Your report shows as "not confirmed" until staff receive it.</p></div>}<label>Category <span className="req">(required)</span><select id="field-category" value={form.category} aria-required="true" {...fieldErr('category')} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>{fieldMsg('category')}<label>Last known location <span className="req">(optional)</span><input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="e.g., Library - second floor"/></label><label>More details <span className="req">(optional)</span><textarea rows="6" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder="Describe your item"/></label><div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Post report'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
