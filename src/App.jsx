import React,{useEffect,useMemo,useState} from 'react';

const STORE='acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed=[
 {id:'f1',title:'Black backpack',category:'accessories',status:'lost',location:'Library - second floor',description:'Black backpack with a small red keychain. Left near the study desks.',owner:'you',created:'Oct 23',emoji:'🎒'},
 {id:'f2',title:'Dark backpack',category:'accessories',status:'found',location:'Library - main stairwell',description:'Found a dark backpack with a small red keychain near the library stairs.',owner:'other',created:'Oct 24',emoji:'rucksack',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
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
const icons=[['backpack','Zip backpack'],['rucksack','Flap backpack'],['tote','Tote bag'],['id','ID card'],['earbuds','Stem earbuds'],['earbuds-round','Round earbuds'],['headphones','Headphones'],['bottle','Sports bottle'],['flask','Metal flask'],['coat','Lab coat'],['notebook','Notebook'],['calculator','Scientific calculator'],['calculator-wide','Wide calculator'],['usb','USB drive'],['phone','Phone'],['keys','Keys'],['clothing','Clothing'],['other','Other item']];
const colors=['cream','green','lavender','blue','rose'];
const categoryColors={electronics:'blue',clothing:'rose',documents:'lavender',accessories:'cream',other:'green'};
const clean={title:'',category:'',status:'',location:'',description:'',emoji:'other',color:'cream'};
function itemIcon(item){
 // Migrate legacy demo illustrations while preserving explicit user selections.
 if(!item.appearanceSelected&&item.id==='f2'&&['🎒','backpack'].includes(item.emoji))return 'rucksack';
 const variants={f5:{legacy:['🎧','earbuds'],type:'earbuds-round'},f7:{legacy:['🥤','🫙','bottle'],type:'flask'},f11:{legacy:['🧮','calculator'],type:'calculator-wide'}};
 const variant=variants[item.id];
 if(!item.appearanceSelected&&variant?.legacy.includes(item.emoji))return variant.type;
 if(icons.some(([key])=>key===item.emoji))return item.emoji;
 const title=item.title.toLowerCase();
 if(title.includes('earbud'))return 'earbuds';
 const legacy={'🎒':'backpack','👜':'tote','🪪':'id','🎧':'headphones','🥤':'bottle','🫙':'bottle','🥼':'coat','📒':'notebook','🧮':'calculator','💾':'usb','🔌':'usb','📱':'phone','🔑':'keys','👕':'clothing'};
 return legacy[item.emoji]||'other';
}
const iconLabel=key=>icons.find(([id])=>id===key)?.[1]||'Other item';
function ItemIcon({type}){
 const shapes={
 backpack:<><path d="M23 19v-5a9 9 0 0 1 18 0v5"/><rect x="14" y="17" width="36" height="41" rx="10" fill="currentColor" fillOpacity=".12"/><rect x="20" y="36" width="24" height="15" rx="4"/><path d="M22 27h20M32 36v5"/></>,
 rucksack:<><path d="M25 13V9a7 7 0 0 1 14 0v4"/><path d="M15 23h34l4 32a4 4 0 0 1-4 5H15a4 4 0 0 1-4-5z" fill="#728a78"/><path d="M14 16q18-10 36 0v14l-18 7-18-7z" fill="#c4d0b7"/><path d="M23 29v17m18-17v17"/><rect x="20" y="38" width="6" height="8" rx="1" fill="white"/><rect x="38" y="38" width="6" height="8" rx="1" fill="white"/><path d="M7 36h6v17H7zM51 36h6v17h-6"/></>,
 tote:<><path d="M22 22v-8a10 10 0 0 1 20 0v8"/><path d="M12 21h40l-4 36H16z" fill="currentColor" fillOpacity=".12"/><path d="M24 37h16M24 44h10"/></>,
 id:<><rect x="7" y="15" width="50" height="35" rx="5"/><circle cx="22" cy="29" r="5"/><path d="M14 43q8-13 16 0M37 27h12M37 35h12M37 42h7"/></>,
 earbuds:<><rect x="8" y="35" width="48" height="24" rx="10" fill="#b6d6f4"/><path d="M9 44h46"/><path d="M17 8a7 7 0 0 1 7 7v15h-6V21a7 7 0 0 1-1-13zM47 8a7 7 0 0 0-7 7v15h6V21a7 7 0 0 0 1-13z" fill="white"/></>,
 'earbuds-round':<><rect x="8" y="30" width="48" height="28" rx="14" fill="#d4dce0"/><path d="M9 41h46"/><ellipse cx="21" cy="16" rx="8" ry="10" fill="#36454f"/><ellipse cx="43" cy="16" rx="8" ry="10" fill="#36454f"/><path d="M19 12h4M41 12h4" stroke="white"/></>,
 headphones:<><path d="M11 37V27a21 21 0 0 1 42 0v10"/><rect x="8" y="30" width="12" height="23" rx="5"/><rect x="44" y="30" width="12" height="23" rx="5"/></>,
 bottle:<><rect x="25" y="4" width="14" height="9" rx="2"/><path d="M25 13v7l-8 9v26a5 5 0 0 0 5 5h20a5 5 0 0 0 5-5V29l-8-9v-7z" fill="#bad9ef"/><path d="M18 34h28M18 49h28"/></>,
 flask:<><rect x="24" y="3" width="16" height="10" rx="3" fill="#707e8b"/><rect x="19" y="13" width="26" height="47" rx="8" fill="#d4dce0"/><path d="M20 23h24M20 51h24M26 29v14"/></>,
 coat:<><path d="m23 8-12 8-7 25 10 3 6-18v33h24V26l6 18 10-3-7-25-12-8-9 12z" fill="white"/><path d="m23 8 2 17 7-5 7 5 2-17M32 20v39M38 34h6M20 43h8"/></>,
 notebook:<><rect x="15" y="6" width="37" height="52" rx="4" fill="#dfc5a5"/><path d="M23 6v52M10 16h10M10 28h10M10 40h10M10 52h10M30 21h15M30 29h15"/></>,
 calculator:<><rect x="14" y="4" width="36" height="56" rx="5" fill="#d4dce0"/><path d="M21 12h22v12H21zM21 33h3m7 0h3m7 0h2M21 42h3m7 0h3m7 0h2M21 51h3m7 0h3m7 0h2"/></>,
 'calculator-wide':<><rect x="6" y="12" width="52" height="44" rx="5" fill="#354855"/><rect x="13" y="18" width="38" height="11" rx="2" fill="#dceacb"/><path d="M14 36h5m7 0h5m7 0h5m7 0h1M14 44h5m7 0h5m7 0h5m7 0h1M14 50h5m7 0h5m7 0h5" stroke="white"/></>,
 usb:<><path d="M22 5h20v19H22zM28 10v5m8-5v5"/><rect x="17" y="24" width="30" height="35" rx="5" fill="#d4dce0"/><circle cx="32" cy="49" r="3"/></>,
 phone:<><rect x="17" y="4" width="30" height="56" rx="6"/><path d="M25 10h14M29 53h6M22 18h20v28H22z"/></>,
 keys:<><circle cx="22" cy="21" r="13"/><circle cx="22" cy="21" r="4"/><path d="m31 31 23 23-6 6-5-5 3-3-5-5-3 3-7-7"/></>,
 clothing:<path d="m21 9-17 15 10 11 7-6v28h22V29l7 6 10-11L43 9q-11 14-22 0z"/>,
 other:<><path d="m8 20 24-12 24 12v29L32 61 8 49zM8 20l24 12 24-12M32 32v29M20 14l24 12"/></>
 };
 return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[type]||shapes.other}</svg>;
}
function reportTime(item){
 if(item.createdAt)return new Date(item.createdAt).getTime();
 const idTime=Number(item.id?.replace('f-',''));
 if(item.created==='Today')return Number.isFinite(idTime)?idTime:Date.now();
 const parsed=Date.parse(`${item.created}, ${new Date().getFullYear()}`);
 return Number.isNaN(parsed)?0:parsed;
}
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function validate(f,arr,id){
 if(!f.title.trim()||f.title.trim().length<2)return 'Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))return 'Choose a category.';
 if(!icons.some(([icon])=>icon===f.emoji)||!colors.includes(f.color))return 'Choose an item icon and notice color.';
 if(!statuses.includes(f.status))return 'Choose lost, found or claimed.';
 if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))return 'An item with the same title has already been reported at this location.';
 return '';
}
export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [sort,setSort]=useState('newest');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>sort==='newest'?reportTime(b)-reportTime(a):reportTime(a)-reportTime(b)),[items,q,cat,filterStatus,sort]);
 function showBoard(status='all'){setSort('newest');setPage('board');setQ('');setCat('all');setFilterStatus(status);}
 function create(){setCurrent(null);setForm({...clean});setError('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description,emoji:itemIcon(row),color:colors.includes(row.color)?row.color:'cream'});setError('');setPage('form');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){setError(v);return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:current?items.find(x=>x.id===current).created:'Today',createdAt:current?items.find(x=>x.id===current).createdAt:new Date().toISOString(),emoji:form.emoji,color:categoryColors[form.category]||'cream',appearanceSelected:true,...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.');}showBoard();setCurrent(null);}
 function reset(){setItems(seed);setPage('board');setQ('');setCat('all');setFilterStatus('all');setMessage('Example reports restored.');}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>showBoard()} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><button className="report-button" onClick={create}>+ Post a report</button></header>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox"><h3>Browse reports</h3><label>Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><p className="filter-hint">Filters update automatically.</p><div className="filterbuttons"><button onClick={()=>showBoard()}>Clear filters</button></div></div><div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><label className="sort-control">Sort by date<select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div><nav className="board-nav" aria-label="Noticeboard views">{[['all','All notices'],['lost','Missing items'],['found','Recently found'],['claimed','Claimed items']].map(([status,label])=><button key={status} aria-current={filterStatus===status?'page':undefined} onClick={()=>{if(status==='all')showBoard();else{setFilterStatus(status);setOpenMenu(null)}}}>{label}</button>)}</nav>{message&&<div className="message" role="status">{message}<button aria-label="Dismiss notification" onClick={()=>setMessage('')}>✕</button></div>}
    <div className={`board-grid ${filterStatus!=='all'?'single-status':''}`}>{[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'＋'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].filter(col=>filterStatus==='all'||filterStatus===col.key).map(col=><div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div><div className="sticky-list">{filtered.filter(r=>r.status===col.key).map((item,i)=><article className={`sticky note-${categoryColors[item.category]||'cream'}`} key={item.id}><div className="sticky-top"><span>{item.category}</span>{item.owner==='you'&&<button className="edit-report" onClick={()=>edit(item)} aria-label={`Edit report: ${item.title}`}>Edit report</button>}</div><div className="item-heading"><div className="item-illustration"><ItemIcon type={itemIcon(item)}/></div><div><h3>{item.title}</h3></div></div><p className="item-description" tabIndex={0} aria-label={`Description of ${item.title}`}>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className="handover-note">{item.handoverStatus==='received'&&item.collectionPoint?`Received at ${item.collectionPoint}`:item.handoverStatus==='released'?'Collected by owner':'Reported found - not confirmed at a collection point'}</div>}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div></article>)}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column"><strong>No {col.key} reports found</strong><p>Try another search or category.</p><button onClick={()=>showBoard()}>Show all notices</button></div>}</div></div>)}</div>
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>showBoard()}>← Noticeboard</button><span>/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><h2>{current?'Edit report':'Report an item'}</h2><p>Choose the item details below. Fields marked * are required.</p></header><form onSubmit={submit}><div className="report-fields"><label>Item title <b>*</b><input value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/></label><label>Status <b>*</b><select value={form.status} onChange={e=>setForm(s=>({...s,status:e.target.value}))}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><label>Category <b>*</b><select value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s}>{s}</option>)}</select></label></div><fieldset className="appearance-picker"><legend>Choose an item illustration</legend><div className="icon-options">{icons.map(([icon,label])=><button key={icon} type="button" title={label} aria-label={label} aria-pressed={form.emoji===icon} onClick={()=>setForm(s=>({...s,emoji:icon}))}><ItemIcon type={icon}/><span>{label}</span></button>)}</div></fieldset><div className={`appearance-preview note-${categoryColors[form.category]||'cream'}`}><ItemIcon type={form.emoji}/><div><strong>{form.title.trim()||'Your notice preview'}</strong><span>{iconLabel(form.emoji)}</span></div></div><label>Last known location<input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="Location (optional)"/></label><label>More details<textarea rows="6" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder="Describe your item"/></label>{error&&<div className="form-error" role="alert">{error}</div>}<div className="form-actions"><button type="button" onClick={()=>showBoard()}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
