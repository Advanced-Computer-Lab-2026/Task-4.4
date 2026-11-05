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
// Fictional collection points (same ones used in the example records).
const collectionPoints=['Campus Security Desk','Student Services Office','Library Reception'];
const columns=[
 {key:'lost',title:'LOST',sub:'Owners are searching for these',icon:'?'},
 {key:'found',title:'FOUND',sub:'Waiting for their owners',icon:'!'},
 {key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'},
];
const ownerOptions=[
 {key:'all',label:'All reports'},
 {key:'mine',label:'★ Your reports'},
 {key:'others',label:'Posted by others'},
];
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
function handoverText(item){
 if(item.handoverStatus==='released')return {cls:'done',text:'✓ Collected by the owner'};
 if(item.handoverStatus==='received'&&item.collectionPoint)return {cls:'held',text:`📍 Held at ${item.collectionPoint}. Bring ID and proof of ownership to collect.`};
 return {cls:'pending',text:'⚠ Not yet handed in to a collection point'};
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [ownerFilter,setOwnerFilter]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [confirmDelete,setConfirmDelete]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&(ownerFilter==='all'||(ownerFilter==='mine')===(x.owner==='you'))&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())),[items,q,cat,filterStatus,ownerFilter]);
 const visibleColumns=filterStatus==='all'?columns:columns.filter(c=>c.key===filterStatus);
 const filtersActive=q||cat!=='all'||filterStatus!=='all'||ownerFilter!=='all';

 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');setOwnerFilter('all');}
 function goToBoard(){clearFilters();setConfirmDelete(null);setPage('board');}
 function showStatus(s){setFilterStatus(s);setConfirmDelete(null);setPage('board');}
 function create(status=''){setCurrent(null);setForm({...clean,status});setError('');setMessage('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setConfirmDelete(null);setError('');setMessage('');setPage('form');}
 function remove(row){if(row.owner!=='you')return;setItems(items.filter(x=>x.id!==row.id));setConfirmDelete(null);setMessage(`Your report "${row.title}" was deleted.`);}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){setError('Please review your entries.');return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage(d.status==='found'?'Your report has been posted. Please hand the item in at a collection point.':'Your report has been posted.');}clearFilters();setPage('board');setCurrent(null);}
 function reset(){if(!window.confirm('Restore the example reports? Your own changes will be lost.'))return;setItems(seed);setPage('board');clearFilters();setConfirmDelete(null);setMessage('Example reports restored.');}

 const navItems=[{key:'all',label:'Noticeboard'},{key:'lost',label:'Lost items'},{key:'found',label:'Found items'},{key:'claimed',label:'Claimed'}];
 const locationLabel=form.status==='found'?'Where did you find it?':form.status==='lost'?'Where did you last have it?':'Location';
 const descPlaceholder=form.status==='found'?'Describe the item, but keep one detail private so the real owner can prove it is theirs':form.status==='lost'?'Colour, brand, marks, anything that helps people recognize it':'Describe the item';

 return <div className="notice-app">
  <header className="header">
   <div className="headline"><span className="sun">✺</span><button onClick={goToBoard} className="wordmark">FOUND<span>on campus</span></button></div>
   <nav className="header-links" aria-label="Filter reports by status">
    {navItems.map(n=><button key={n.key} className={page==='board'&&filterStatus===n.key?'active':''} aria-current={page==='board'&&filterStatus===n.key?'page':undefined} onClick={()=>n.key==='all'?goToBoard():showStatus(n.key)}>{n.label}</button>)}
   </nav>
   <div className="header-actions">
    <button className="report-button lost" onClick={()=>create('lost')}>+ I lost something</button>
    <button className="report-button found" onClick={()=>create('found')}>+ I found something</button>
   </div>
  </header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>

  {page==='board'?<main className="workspace">
   <aside className="filters">
    <p className="kicker">YOUR NOTICEBOARD</p>
    <h1>Lost something?<br/><em>You're in the right place.</em></h1>
    <details className="howto" open>
     <summary>How lost &amp; found works</summary>
     <div className="howto-block found">
      <strong>Found something?</strong>
      <ol>
       <li>Post a <b>found</b> report. Keep one identifying detail private.</li>
       <li>Hand the item in at a collection point:
        <ul>{collectionPoints.map(p=><li key={p}>📍 {p}</li>)}</ul>
       </li>
       <li>Staff verify ownership before releasing it. Don't hand it directly to someone who contacts you.</li>
      </ol>
      <button onClick={()=>create('found')}>Report a found item →</button>
     </div>
     <div className="howto-block lost">
      <strong>Lost something?</strong>
      <ol>
       <li>Search the <b>Found</b> column for a match.</li>
       <li>If a card says <b>"Held at…"</b>, go there with your ID and proof of ownership.</li>
       <li>No match yet? Post a <b>lost</b> report so finders can spot it.</li>
      </ol>
      <button onClick={()=>create('lost')}>Report a lost item →</button>
     </div>
    </details>
    <button className="reset" onClick={reset}>Reset demo data</button>
   </aside>

   <section className="board">
    <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>{filterStatus==='all'?'Latest notices':`${cap(filterStatus)} items`} <span>({filtered.length})</span></h2></div>
     <div className="owner-toggle" role="group" aria-label="Filter by who posted the report">
      {ownerOptions.map(o=><button key={o.key} className={`${o.key}${ownerFilter===o.key?' active':''}`} aria-pressed={ownerFilter===o.key} onClick={()=>setOwnerFilter(o.key)}>{o.label}</button>)}
     </div>
    </div>
    <div className="filterbox">
     <label className="grow">Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label>
     <label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
     <div className="filterbuttons">
      <p className="result-count" aria-live="polite">Showing <strong>{filtered.length}</strong> of {items.length}</p>
      <button onClick={clearFilters} disabled={!filtersActive}>Clear filters</button>
     </div>
    </div>
    {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    <div className={`board-grid cols-${visibleColumns.length}`}>{visibleColumns.map(col=>{
     const colItems=filtered.filter(r=>r.status===col.key);
     return <div className="board-column" key={col.key}>
      <div className={'column-head '+col.key}><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{colItems.length}</span></div>
      <div className="sticky-list">{colItems.map(item=>{
       const mine=item.owner==='you';
       const h=item.status!=='lost'?handoverText(item):null;
       return <article className={`sticky ${item.status}${mine?' mine':''}`} key={item.id}>
        <div className="sticky-top">
         <span className={'status-pill '+item.status}>{item.status}</span>
         <span className="cat">{item.category}</span>
        </div>
        {mine?<span className="badge-mine">★ Your report</span>:<span className="owner-other">Posted by another student</span>}
        <div className="sticky-emoji" aria-hidden="true">{item.emoji}</div>
        <h3>{item.title}</h3>
        <p>{item.description||'No additional description.'}</p>
        {h&&<div className={'handover-note '+h.cls}>{h.text}</div>}
        <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>
        {mine&&(confirmDelete===item.id
         ?<div className="card-actions confirm" role="alert"><span>Delete this report?</span><button className="danger" onClick={()=>remove(item)}>Yes, delete</button><button onClick={()=>setConfirmDelete(null)}>Cancel</button></div>
         :<div className="card-actions"><button onClick={()=>edit(item)} aria-label={`Edit ${item.title}`}>✎ Edit</button><button className="danger-link" onClick={()=>setConfirmDelete(item.id)} aria-label={`Delete ${item.title}`}>🗑 Delete</button></div>)}
       </article>;})}
       {colItems.length===0&&<div className="empty-column">{filtersActive?'No reports match your filters':'Nothing here yet'}</div>}
      </div>
     </div>;})}
    </div>
   </section>
  </main>

  :<main className="report-page">
   <div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>{current?'Edit your report':'Report an item'}</span></div>
   <div className="report-layout">
    <div className="report-intro">
     <span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p>
     <h1>{current?'Update your report':'Tell us what happened.'}</h1>
     <p>Small details can help someone recognize their belongings.</p>
     {form.status==='found'&&<div className="guide-box">
      <strong>After posting, hand the item in</strong>
      <p>Take the item to one of these collection points so the owner can collect it safely:</p>
      <ul>{collectionPoints.map(p=><li key={p}>📍 {p}</li>)}</ul>
      <p>Staff check ownership before releasing it. Your report will show <em>"Not yet handed in"</em> until staff confirm they have the item.</p>
      <p><b>Tip:</b> keep one detail (contents, serial number, a mark) out of your description so the real owner can prove it's theirs.</p>
     </div>}
     {form.status==='lost'&&<div className="guide-box lost">
      <strong>Check the Found column first</strong>
      <p>Someone may already have handed it in. Found cards marked <em>"Held at…"</em> tell you where to go. Bring your ID and proof of ownership.</p>
     </div>}
     <div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div>
    </div>
    <section className="form-paper">
     <header><p>{current?'EDIT NOTICE':'NEW NOTICE'}</p><h2>{current?'Edit report':form.status==='found'?'Report a found item':form.status==='lost'?'Report a lost item':'Report an item'}</h2></header>
     <form onSubmit={submit}>
      {(current||!form.status)&&<label>Status <b>*</b><select value={form.status} onChange={e=>setForm(s=>({...s,status:e.target.value}))}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>}
      <label>Item title <b>*</b><input value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/></label>
      <label>Category <b>*</b><select value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
      <label>{locationLabel}<input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="Location (optional)"/></label>
      <label>More details<textarea rows="6" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder={descPlaceholder}/></label>
      {error&&<div className="form-error" role="alert">{error}</div>}
      <div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div>
     </form>
    </section>
   </div>
  </main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
