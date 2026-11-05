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
// UI/UX P1: every card gets a recognisable visual. Seeded reports keep their specific emoji;
// new reports (previously a generic 📌) fall back to an icon for their category.
const categoryIcons={electronics:'💻',clothing:'👕',documents:'📄',accessories:'👜',other:'📦'};
const iconFor=x=>x.emoji&&x.emoji!=='📌'?x.emoji:categoryIcons[x.category]||'📦';
// Handover wording is unchanged: a found report is NOT the same as an item received at a collection point.
function handover(x){
 if(x.handoverStatus==='received'&&x.collectionPoint)return {kind:'received',icon:'✓',text:`Received at ${x.collectionPoint}`};
 if(x.handoverStatus==='released')return {kind:'released',icon:'✓',text:'Collected by owner'};
 return {kind:'reported',icon:'!',text:'Reported found - not confirmed at a collection point'};
}
// UI/UX P2: sortable dates. New reports store createdAt; seeded "Oct 23"-style dates are parsed.
const timeOf=x=>{if(x.createdAt)return x.createdAt;const t=Date.parse(`${x.created} 2026`);return isNaN(t)?Date.now():t;};
const shownDate=x=>{if(!x.createdAt)return x.created;const d=new Date(x.createdAt);return d.toDateString()===new Date().toDateString()?'Today':d.toLocaleDateString('en-US',{month:'short',day:'numeric'});};
const sorts={newest:{label:'Newest first',fn:(a,b)=>timeOf(b)-timeOf(a)},oldest:{label:'Oldest first',fn:(a,b)=>timeOf(a)-timeOf(b)},title:{label:'Title A–Z',fn:(a,b)=>a.title.localeCompare(b.title)}};
const columns=[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}];
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
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [openMenu,setOpenMenu]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const [sortBy,setSortBy]=useState('newest');
 const [flash,setFlash]=useState(false);
 const resultsRef=useRef(null);
 // Search + category first, so the status tabs can show how many matches each status has.
 const scoped=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())),[items,q,cat]);
 const filtered=useMemo(()=>scoped.filter(x=>filterStatus==='all'||x.status===filterStatus).sort(sorts[sortBy].fn),[scoped,filterStatus,sortBy]);
 const countFor=s=>s==='all'?scoped.length:scoped.filter(x=>x.status===s).length;
 // UI/UX P3: active filters are listed as removable chips.
 const chips=[q.trim()&&{key:'q',label:`Search: “${q.trim()}”`,clear:()=>setQ('')},cat!=='all'&&{key:'cat',label:`Category: ${cap(cat)}`,clear:()=>setCat('all')},filterStatus!=='all'&&{key:'status',label:`Status: ${cap(filterStatus)}`,clear:()=>setFilterStatus('all')}].filter(Boolean);
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');setMessage('');}
 // Filtering is live; Apply (or Enter in the search box) takes the user to the results and highlights the summary.
 function apply(e){e?.preventDefault();resultsRef.current?.scrollIntoView({behavior:'smooth',block:'start'});setFlash(true);setTimeout(()=>setFlash(false),900);}
 function emptyText(){const parts=[q.trim()&&`“${q.trim()}”`,cat!=='all'&&`in ${cap(cat)}`,filterStatus!=='all'&&`with status ${cap(filterStatus)}`].filter(Boolean);return `No reports match ${parts.join(' ')}.`;}
 function create(){setCurrent(null);setForm({...clean});setError('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setOpenMenu(null);setError('');setPage('form');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){setError(v);return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',createdAt:Date.now(),emoji:current?items.find(x=>x.id===current)?.emoji:'',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.');}setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');setQ('');setCat('all');setFilterStatus('all');setSortBy('newest');setMessage('Example reports restored.');}
 const card=item=>{const h=item.status!=='lost'&&handover(item);return <article className={'sticky '+item.status} key={item.id}>
  <div className="sticky-top"><span className={'status-badge '+item.status}>{cap(item.status)}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`}>···</button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?<button onClick={()=>edit(item)}>Edit your report</button>:<span>Reported by another student</span>}</div>}</div></div>
  <div className={'sticky-media cat-'+item.category}><span className="sticky-emoji" aria-hidden="true">{iconFor(item)}</span><span className="media-label">{item.category}</span></div>
  <h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>
  {h&&<div className={'handover-note '+h.kind}><span aria-hidden="true">{h.icon}</span>{h.text}</div>}
  <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{shownDate(item)}</small></div></article>;};
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>setPage('board')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><div className="header-links"><button onClick={()=>setPage('board')}>Noticeboard</button><button onClick={()=>{setFilterStatus('lost');setPage('board')}}>Missing items</button><button onClick={()=>{setFilterStatus('found');setPage('board')}}>Recently found</button></div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><form className="filterbox" onSubmit={apply}><h3>Browse reports</h3><label>Search items<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><div className="filterbuttons"><button type="submit">Apply</button><button type="button" onClick={clearFilters} disabled={!chips.length}>Clear</button></div><p className="filter-hint">Results update as you type.</p></form><div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board" ref={resultsRef}><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')}>✕</button></div>}
    <div className="board-toolbar"><div className="status-tabs" role="group" aria-label="Show reports by status">{['all',...statuses].map(s=><button key={s} className={'status-tab '+s} aria-pressed={filterStatus===s} onClick={()=>setFilterStatus(s)}>{s==='all'?'All':cap(s)}<span>{countFor(s)}</span></button>)}</div><label className="sort-control">Sort<select value={sortBy} onChange={e=>setSortBy(e.target.value)}>{Object.entries(sorts).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label></div>
    <div className={'results-bar'+(flash?' flash':'')} aria-live="polite"><p>Showing <strong>{filtered.length}</strong> of {items.length} reports</p>{chips.length>0&&<div className="chips">{chips.map(c=><button key={c.key} className="chip" onClick={c.clear} aria-label={`Remove filter ${c.label}`}>{c.label}<span aria-hidden="true">✕</span></button>)}<button className="clear-all" onClick={clearFilters}>Clear all</button></div>}</div>
    {filtered.length===0?<div className="empty-results"><span aria-hidden="true">🔍</span><strong>No matching reports</strong><p>{emptyText()} Try a different word or remove a filter — or post a report so others can help.</p><div><button onClick={clearFilters}>Clear all filters</button><button className="report-button" onClick={create}>+ Post a report</button></div></div>
    :filterStatus==='all'?<div className="board-grid">{columns.map(col=>{const list=filtered.filter(r=>r.status===col.key);return <div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{list.length}</span></div><div className="sticky-list">{list.map(card)}{!list.length&&<div className="empty-column">{chips.length?`No matching ${col.key} reports`:'Nothing here yet'}</div>}</div></div>;})}</div>
    :<div className="status-view"><div className="column-head">{(c=><><span className={'col-icon '+c.key}>{c.icon}</span><div><strong>{c.title}</strong><small>{c.sub}</small></div></>)(columns.find(c=>c.key===filterStatus))}<span className="col-count">{filtered.length}</span></div><div className="status-grid">{filtered.map(card)}</div></div>}
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit}><label>Item title <b>*</b><input value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/></label><label>Status <b>*</b><select value={form.status} onChange={e=>setForm(s=>({...s,status:e.target.value}))}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><label>Category <b>*</b><select value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s}>{s}</option>)}</select></label><label>Last known location<input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="Location (optional)"/></label><label>More details<textarea rows="6" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder="Describe your item"/></label>{error&&<div className="form-error" role="alert">{error}</div>}<div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
