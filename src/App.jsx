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
const tabs=[{key:'lost',title:'Lost',sub:'Searching for these things',icon:'↗'},{key:'found',title:'Found',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'Claimed',sub:'Back where they belong',icon:'✓'}];
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function validate(f,arr,id){
 const e={};
 const t=f.title.trim();
 if(!t)e.title='Item title is required.';
 else if(t.length<2)e.title='Item title must be at least 2 characters.';
 else if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===t.toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))e.title='An item with the same title has already been reported at this location.';
 if(!statuses.includes(f.status))e.status='Choose whether the item is lost, found or claimed.';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category for the item.';
 return e;
}
const fieldLabels={title:'Item title',status:'Status',category:'Category'};
export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [tab,setTab]=useState('lost');
 const [mine,setMine]=useState(false);
 const [searchOpen,setSearchOpen]=useState(false);
 const [filterOpen,setFilterOpen]=useState(false);
 const searchRef=useRef(null);
 const searchInput=useRef(null);
 const filterRef=useRef(null);
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [errors,setErrors]=useState({});
 const setField=(k,v)=>{setForm(s=>({...s,[k]:v}));if(errors[k])setErrors(er=>{const n={...er};delete n[k];return n;});};
 const [message,setMessage]=useState('');
 const [openMenu,setOpenMenu]=useState(null);
 const [confirmDel,setConfirmDel]=useState(null);
 useEffect(()=>{if(openMenu===null)setConfirmDel(null);},[openMenu]);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 useEffect(()=>{
  if(openMenu===null)return;
  const onDown=e=>{if(!e.target.closest('.menu-holder'))setOpenMenu(null);};
  const onKey=e=>{if(e.key==='Escape')setOpenMenu(null);};
  document.addEventListener('mousedown',onDown);
  document.addEventListener('keydown',onKey);
  return()=>{document.removeEventListener('mousedown',onDown);document.removeEventListener('keydown',onKey);};
 },[openMenu]);
 useEffect(()=>{if(searchOpen)searchInput.current?.focus();},[searchOpen]);
 useEffect(()=>{
  if(!searchOpen&&!filterOpen)return;
  const onDown=e=>{
   if(filterOpen&&!filterRef.current?.contains(e.target))setFilterOpen(false);
   if(searchOpen&&!q&&!searchRef.current?.contains(e.target))setSearchOpen(false);
  };
  const onKey=e=>{if(e.key==='Escape'){setFilterOpen(false);if(!q)setSearchOpen(false);}};
  document.addEventListener('mousedown',onDown);
  document.addEventListener('keydown',onKey);
  return()=>{document.removeEventListener('mousedown',onDown);document.removeEventListener('keydown',onKey);};
 },[searchOpen,filterOpen,q]);
 const activeFilters=(cat!=='all'?1:0)+(mine?1:0);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(!mine||x.owner==='you')&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())),[items,q,cat,mine]);
 const shown=filtered.filter(r=>r.status===tab);
 const activeTab=tabs.find(t=>t.key===tab);
 function remove(row){if(row.owner!=='you')return;setItems(list=>list.filter(x=>x.id!==row.id));setOpenMenu(null);setMessage(`"${row.title}" was deleted.`);}
 function create(){setCurrent(null);setForm({...clean});setErrors({});setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setOpenMenu(null);setErrors({});setPage('form');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(Object.keys(v).length){setErrors(v);const first=Object.keys(fieldLabels).find(k=>v[k]);document.getElementById('field-'+first)?.focus();return;}setErrors({});const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.');}setTab(d.status);setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');setQ('');setSearchOpen(false);setCat('all');setTab('lost');setMine(false);setMessage('Example reports restored.');}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>setPage('board')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>{mine?'My items':'Latest notices'} <span>({filtered.length})</span></h2></div><div className="board-tools"><div ref={searchRef} className={'search'+(searchOpen?' open':'')}><button className="tool-btn icon" aria-label={searchOpen?'Search items':'Open search'} aria-expanded={searchOpen} onClick={()=>{if(searchOpen&&!q)setSearchOpen(false);else{setSearchOpen(true);searchInput.current?.focus();}}}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.2"/><path d="M20 20l-4.2-4.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg></button><input ref={searchInput} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search items…" aria-label="Search items" tabIndex={searchOpen?0:-1}/>{searchOpen&&q&&<button className="search-clear" aria-label="Clear search" onClick={()=>{setQ('');searchInput.current?.focus();}}>✕</button>}</div><div ref={filterRef} className="filter-drop"><button className={'tool-btn'+(activeFilters?' has-filters':'')} aria-haspopup="true" aria-expanded={filterOpen} onClick={()=>setFilterOpen(o=>!o)}><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>Filter{activeFilters>0&&<span className="filter-badge">{activeFilters}</span>}<svg className="caret" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>{filterOpen&&<div className="filter-panel" role="dialog" aria-label="Filter options"><label className="fp-field">Category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label className="mine-toggle"><input type="checkbox" checked={mine} onChange={e=>setMine(e.target.checked)}/><span><strong>My items only</strong><small>Check the status of reports you posted</small></span></label><div className="fp-actions"><button onClick={()=>{setCat('all');setMine(false);}} disabled={!activeFilters}>Clear filters</button><button className="fp-done" onClick={()=>setFilterOpen(false)}>Done</button></div></div>}</div></div></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')}>✕</button></div>}
    <div className="tabbar" role="tablist" aria-label="Report status">{tabs.map(t=><button key={t.key} role="tab" id={'tab-'+t.key} aria-selected={tab===t.key} aria-controls="tab-panel" className={'tab'+(tab===t.key?' active':'')} onClick={()=>setTab(t.key)}><span className={'col-icon '+t.key}>{t.icon}</span><span className="tab-label"><strong>{t.title}</strong><small>{t.sub}</small></span><span className="col-count">{filtered.filter(r=>r.status===t.key).length}</span></button>)}</div>
    <div id="tab-panel" role="tabpanel" aria-labelledby={'tab-'+tab} className="sticky-grid">{shown.map(item=><article className="sticky" key={item.id}><div className="sticky-top"><span>{item.category}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`}>···</button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?(confirmDel===item.id?<div className="menu-confirm"><span>Delete this report?</span><div><button onClick={()=>setConfirmDel(null)}>Cancel</button><button className="danger solid" onClick={()=>remove(item)}>Delete</button></div></div>:<><button onClick={()=>edit(item)}>Edit your report</button><button className="danger" onClick={()=>setConfirmDel(item.id)}>Delete report</button></>):<span>Reported by another student</span>}</div>}</div></div><div className="sticky-emoji">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className="handover-note">{item.handoverStatus==='received'&&item.collectionPoint?`Received at ${item.collectionPoint}`:item.handoverStatus==='released'?'Collected by owner':'Reported found - not confirmed at a collection point'}</div>}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div></article>)}{shown.length===0&&<div className="empty-column">{mine?`You have no ${activeTab.title.toLowerCase()} reports.`:'Nothing here yet'}</div>}</div>
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit} noValidate>{Object.keys(errors).length>0&&<div className="form-error" role="alert"><strong>Please fix {Object.keys(errors).length===1?'this field':`these ${Object.keys(errors).length} fields`} before submitting:</strong><ul>{Object.keys(fieldLabels).filter(k=>errors[k]).map(k=><li key={k}><a href={'#field-'+k} onClick={e=>{e.preventDefault();document.getElementById('field-'+k)?.focus();}}>{fieldLabels[k]}</a> – {errors[k]}</li>)}</ul></div>}<label className={errors.title?'invalid':''}>Item title <b>*</b><input id="field-title" aria-invalid={!!errors.title} aria-describedby={errors.title?'err-title':undefined} value={form.title} onChange={e=>setField('title',e.target.value)} placeholder="e.g., Black backpack"/>{errors.title&&<span className="field-error" id="err-title">{errors.title}</span>}</label><label className={errors.status?'invalid':''}>Status <b>*</b><select id="field-status" aria-invalid={!!errors.status} aria-describedby={errors.status?'err-status':undefined} value={form.status} onChange={e=>setField('status',e.target.value)}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{errors.status&&<span className="field-error" id="err-status">{errors.status}</span>}</label><label className={errors.category?'invalid':''}>Category <b>*</b><select id="field-category" aria-invalid={!!errors.category} aria-describedby={errors.category?'err-category':undefined} value={form.category} onChange={e=>setField('category',e.target.value)}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{errors.category&&<span className="field-error" id="err-category">{errors.category}</span>}</label><label>Last known location<input value={form.location} onChange={e=>setField('location',e.target.value)} placeholder="Location (optional)"/></label><label>More details<textarea rows="6" value={form.description} onChange={e=>setField('description',e.target.value)} placeholder="Describe your item"/></label><div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
