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
// The form asks "what happened" first, then words the remaining fields for that situation.
// Claimed is the end of an existing report's journey, so it is only offered when editing.
const statusChoices=[{value:'lost',label:'I lost something',hint:'Ask others to look out for it'},{value:'found',label:'I found something',hint:'Help the owner get it back'},{value:'claimed',label:"It's back with its owner",hint:'Mark this report as resolved'}];
const formCopy={
 '':{where:'Location',wherePh:'e.g., Library - second floor',details:'Description',detailsPh:'Colour, brand, distinctive marks…'},
 lost:{where:'Where did you last have it?',wherePh:'e.g., Library - second floor',details:'Describe it so others can recognise it',detailsPh:'Colour, brand, stickers, case, keychain…'},
 found:{where:'Where did you find it?',wherePh:'e.g., Cafeteria entrance',details:'Describe what you found',detailsPh:'Colour, brand, condition…',hint:'Keep one identifying detail private (for example, what is inside) so staff can check the real owner.'},
 claimed:{where:'Where was it lost or found?',wherePh:'e.g., Building C',details:'How was it returned?',detailsPh:'e.g., Collected from Library Reception after verification.'},
};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function validate(f,arr,id){
 if(!f.title.trim()||f.title.trim().length<2)return 'Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))return 'Choose a category.';
 if(!statuses.includes(f.status))return 'Choose lost, found or claimed.';
 if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))return 'An item with the same title has already been reported at this location.';
 return '';
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
 const [initial,setInitial]=useState(clean);
 const [highlight,setHighlight]=useState(null);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [openMenu,setOpenMenu]=useState(null);
 const [showFilters,setShowFilters]=useState(false);
 const [limit,setLimit]=useState({});
 useEffect(()=>setLimit({}),[q,cat,filterStatus,mine]);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const matches=x=>(!mine||x.owner==='you')&&(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase());
 const filtered=useMemo(()=>items.filter(matches),[items,q,cat,filterStatus,mine]);
 const myCount=items.filter(x=>x.owner==='you').length;
 // Bring a just-saved notice into view so the user sees the result of their action.
 useEffect(()=>{if(page==='board'&&highlight)document.getElementById('card-'+highlight)?.scrollIntoView({behavior:'smooth',block:'center'});},[highlight,page]);
 const dirty=JSON.stringify(form)!==JSON.stringify(initial);
 function confirmLeave(){return page!=='form'||!dirty||window.confirm('Leave this page? Your report has not been saved.');}
 function create(){if(!confirmLeave())return;setCurrent(null);setForm({...clean});setInitial({...clean});setError('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;const f={title:row.title,category:row.category,status:row.status,location:row.location,description:row.description};setCurrent(row.id);setForm(f);setInitial(f);setOpenMenu(null);setError('');setPage('form');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){setError('Please review your entries.');return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 const id=current||`f-${Date.now()}`,saved={...items.find(x=>x.id===current),...d,id},shown=matches(saved);
 if(current){setItems(items.map(x=>x.id===current?saved:x));}else{setItems([saved,...items]);}
 if(!shown)clearFilters();setMessage((current?'Report updated.':'Your report has been posted.')+(shown?'':' Filters were cleared so you can see it.'));setHighlight(id);setInitial(form);setPage('board');setCurrent(null);}
 // Filters apply live; chips show what is narrowing the board and remove one filter at a time.
 const active=[mine&&{label:'My reports',clear:()=>setMine(false)},q.trim()&&{label:`"${q.trim()}"`,clear:()=>setQ('')},cat!=='all'&&{label:cap(cat),clear:()=>setCat('all')},filterStatus!=='all'&&{label:cap(filterStatus),clear:()=>setFilterStatus('all')}].filter(Boolean);
 const columns=[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].filter(c=>filterStatus==='all'||c.key===filterStatus);
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');setMine(false);}
 function showBoard(s,own=false){if(!confirmLeave())return;setFilterStatus(s);setMine(own);setOpenMenu(null);setPage('board');}
 const tab=(s,own=false)=>{const on=page==='board'&&mine===own&&filterStatus===s;return {className:on?'active':'','aria-current':on?'page':undefined,onClick:()=>showBoard(s,own)};};
 function reset(){setItems(seed);setPage('board');setQ('');setCat('all');setFilterStatus('all');setMine(false);setMessage('Example reports restored.');}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun" aria-hidden="true">✺</span><button onClick={()=>showBoard('all')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><nav className="header-links" aria-label="Noticeboard views"><button {...tab('all')}>Noticeboard</button><button {...tab('lost')}>Missing items</button><button {...tab('found')}>Recently found</button><button {...tab('all',true)}>My reports ({myCount})</button></nav><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox"><h3>Browse reports</h3><label>Search items<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g., backpack, calculator, Library"/></label><button className="filters-toggle" aria-expanded={showFilters} aria-controls="more-filters" onClick={()=>setShowFilters(v=>!v)}>Filters{cat!=='all'||filterStatus!=='all'?` (${(cat!=='all')+(filterStatus!=='all')})`:''}<span aria-hidden="true">{showFilters?'▴':'▾'}</span></button><div id="more-filters" className={'more-filters'+(showFilters?' open':'')}><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><div className="filterbuttons"><button onClick={clearFilters} disabled={!active.length}>Clear filters</button></div></div></div><div className="side-message"><span aria-hidden="true">📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    {active.length>0&&<div className="active-filters"><span className="kicker">ACTIVE FILTERS</span>{active.map(f=><button key={f.label} className="chip" onClick={f.clear} aria-label={`Remove filter ${f.label}`}>{f.label} <span aria-hidden="true">×</span></button>)}<button className="clear-link" onClick={clearFilters}>Clear all</button><strong className="result-count" aria-live="polite">{filtered.length} {filtered.length===1?'report':'reports'}</strong></div>}
    {filtered.length===0?<div className="empty-results"><h3>No reports match these filters</h3><p>Try a different word or remove a filter. If your item is not listed yet, post a report so others can recognise it.</p><div><button onClick={clearFilters}>Clear filters</button><button className="report-button" onClick={create}>Report an item</button></div></div>:
    <div className={'board-grid'+(columns.length===1?' single':'')}>{columns.map(col=>{const list=filtered.filter(r=>r.status===col.key),step=columns.length===1?6:3,n=Math.max(limit[col.key]||step,list.findIndex(x=>x.id===highlight)+1);return <div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key} aria-hidden="true">{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div><div className="sticky-list">{list.slice(0,n).map((item,i)=><article className={'sticky'+(highlight===item.id?' just-saved':'')} id={'card-'+item.id} key={item.id}><div className="sticky-top"><span>{item.category}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`} aria-expanded={openMenu===item.id}>···</button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?<button onClick={()=>edit(item)}>Edit your report</button>:<span>Reported by another student</span>}</div>}</div></div><div className="sticky-emoji" aria-hidden="true">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className="handover-note">{item.handoverStatus==='received'&&item.collectionPoint?`Received at ${item.collectionPoint}`:item.handoverStatus==='released'?'Collected by owner':'Reported found - not confirmed at a collection point'}</div>}<div className="sticky-bottom"><span title={item.location||undefined}><span aria-hidden="true">⌖ </span>{item.location||'Location not provided'}</span><small>{item.created}</small></div></article>)}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">{active.length?'No matches in this column':'Nothing here yet'}</div>}</div>{list.length>n&&<div className="show-more"><small>Showing {n} of {list.length}</small><button onClick={()=>setLimit(l=>({...l,[col.key]:n+step}))}>Show {Math.min(step,list.length-n)} more</button></div>}</div>})}</div>}
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>showBoard(filterStatus,mine)}>← Noticeboard</button><span>/</span><span>{current?'Edit your report':'Report an item'}</span></div><div className="report-layout"><div className="report-intro"><span className="seal" aria-hidden="true">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>{current?'EDIT NOTICE':'NEW NOTICE'}</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit}>
   <fieldset><legend>What happened? <b>*</b></legend><div className="choices">{statusChoices.filter(c=>current||c.value!=='claimed').map(c=><label key={c.value} className={'choice'+(form.status===c.value?' selected':'')}><input type="radio" name="status" value={c.value} checked={form.status===c.value} onChange={e=>setForm(s=>({...s,status:e.target.value}))}/><span><strong>{c.label}</strong><small>{c.hint}</small></span></label>)}</div>
    {form.status==='lost'&&!current&&<div className="form-tip"><strong>Check found items first</strong><p>Your item may already be at a collection point. <button type="button" onClick={()=>showBoard('found')}>See recently found items</button></p></div>}
    {form.status==='found'&&<div className="form-tip"><strong>Next step: hand it in</strong><p>Take the item to Campus Security Desk, Student Services Office or Library Reception. Staff return items only after the owner proves it is theirs.</p></div>}</fieldset>
   <fieldset><legend>The item</legend><label>Item title <b>*</b><input value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/></label><label>Category <b>*</b><select value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label></fieldset>
   <fieldset><legend>Where and details</legend><label>{formCopy[form.status].where} <span className="optional">(optional)</span><input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder={formCopy[form.status].wherePh}/></label><label>{formCopy[form.status].details} <span className="optional">(optional)</span><textarea rows="5" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder={formCopy[form.status].detailsPh}/>{formCopy[form.status].hint&&<span className="field-hint">{formCopy[form.status].hint}</span>}</label></fieldset>
   {error&&<div className="form-error" role="alert">{error}</div>}<div className="form-actions"><button type="button" onClick={()=>showBoard(filterStatus,mine)}>Cancel</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
