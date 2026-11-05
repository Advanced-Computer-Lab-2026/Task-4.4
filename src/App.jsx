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
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [openMenu,setOpenMenu]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())),[items,q,cat,filterStatus]);
 function create(){setCurrent(null);setForm({...clean});setError('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setOpenMenu(null);setError('');setPage('form');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){setError(v);return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.');}setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');setQ('');setCat('all');setFilterStatus('all');setMessage('Example reports restored.');}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>setPage('board')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><div className="header-links"><button onClick={()=>setPage('board')}>Noticeboard</button><button onClick={()=>{setFilterStatus('lost');setPage('board')}}>Missing items</button><button onClick={()=>{setFilterStatus('found');setPage('board')}}>Recently found</button></div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><header className="board-intro"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p></header>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><div className="notice-filters" aria-label="Filter notices"><input aria-label="Search items" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search items?"/><select aria-label="Item category" value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select><select aria-label="Report status" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{(q||cat!=='all'||filterStatus!=='all')&&<button type="button" onClick={()=>{setQ('');setCat('all');setFilterStatus('all')}}>Clear</button>}</div></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')}>✕</button></div>}
    <div className="board-grid">{[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].map(col=><div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div><div className="sticky-list">{filtered.filter(r=>r.status===col.key).map((item,i)=><article className="sticky" key={item.id}><div className="sticky-top"><span>{item.category}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`}>···</button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?<button onClick={()=>edit(item)}>Edit your report</button>:<span>Reported by another student</span>}</div>}</div></div><div className="sticky-emoji">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className="handover-note">{item.handoverStatus==='received'&&item.collectionPoint?`Received at ${item.collectionPoint}`:item.handoverStatus==='released'?'Collected by owner':'Reported found - not confirmed at a collection point'}</div>}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div></article>)}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">Nothing here yet</div>}</div></div>)}</div>
   </section></main>:<main className="report-page">
   <button className="report-back" onClick={()=>setPage('board')}>Back to noticeboard</button>
   <div className="report-layout">
   <div className="report-intro"><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
   <section className="form-paper">
    <header><h2>{current?'Edit report details':'Report details'}</h2><p className="form-guide">Fields marked * are required.</p></header>
    <form onSubmit={submit}>
     <label className="form-wide"><span>Item title <b>*</b></span><input required minLength={2} value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack with a red keychain"/></label>
     <label><span>Status <b>*</b></span><select required value={form.status} onChange={e=>setForm(s=>({...s,status:e.target.value}))}><option value="">Choose a status</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select><small>Lost: missing. Found: located. Claimed: returned to its owner.</small></label>
     <label><span>Category <b>*</b></span><select required value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Choose a category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
     <label className="form-wide"><span>Location <span className="optional">(optional)</span></span><input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="e.g., Library, second floor"/></label>
     <label className="form-wide"><span>Description <span className="optional">(optional)</span></span><textarea rows="3" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder="Mention the color, brand, or any distinctive details."/></label>
     {error&&<div className="form-error form-wide" role="alert">{error}</div>}
     <div className="form-actions form-wide"><p>Your report will be visible on the campus noticeboard.</p><div><button type="button" className="cancel-report" onClick={()=>setPage('board')}>Cancel</button><button className="report-button" type="submit">{current?'Save changes':'Publish report'}</button></div></div>
    </form>
   </section>
   </div>
  </main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
