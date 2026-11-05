import React,{useEffect,useMemo,useState,useRef} from 'react';

const STORE='acl-foundboard-v3';
const seed=[
 {id:'f1',title:'Black backpack',category:'accessories',status:'lost',location:'Library - second floor',description:'Black backpack with a small red keychain. Left near the study desks.',owner:'you',created:'Oct 23',emoji:'🎒',verified:false},
 {id:'f2',title:'Dark backpack',category:'accessories',status:'found',location:'Library - main stairwell',description:'Found a dark backpack with a small red keychain near the library stairs.',owner:'other',created:'Oct 24',emoji:'🎒',collectionPoint:'Campus Security Desk',handoverStatus:'received',verified:true},
 {id:'f3',title:'Student ID card',category:'documents',status:'found',location:'Near Gate 3',description:'A student card was turned in. No personal details are published.',owner:'other',created:'Oct 24',emoji:'🪪',collectionPoint:'Student Services Office',handoverStatus:'received',verified:true},
 {id:'f4',title:'Wireless earbuds',category:'electronics',status:'lost',location:'Main cafeteria',description:'White earbuds in a distinctive blue case. Lost on Monday.',owner:'other',created:'Oct 24',emoji:'🎧',verified:false},
 {id:'f5',title:'Earbuds in blue case',category:'electronics',status:'found',location:'Cafeteria entrance',description:'White earbuds in a blue charging case found near the coffee counter.',owner:'other',created:'Oct 25',emoji:'🎧',collectionPoint:'',handoverStatus:'reported',verified:false},
 {id:'f6',title:'Blue sports bottle',category:'other',status:'lost',location:'Sports Hall - lockers',description:'Tall blue metal water bottle, possibly left after practice.',owner:'other',created:'Oct 25',emoji:'🥤',verified:false},
 {id:'f7',title:'Metal water bottle',category:'other',status:'found',location:'Sports Hall - benches',description:'Blue reusable metal bottle found after a basketball session.',owner:'other',created:'Oct 25',emoji:'🥤',collectionPoint:'Campus Security Desk',handoverStatus:'received',verified:true},
 {id:'f8',title:'Engineering lab coat',category:'clothing',status:'claimed',location:'Building C',description:'Owner verified the item and collected it from the reception desk.',owner:'you',created:'Oct 22',emoji:'🥼',collectionPoint:'Library Reception',handoverStatus:'released',verified:true},
 {id:'f9',title:'Small notebook',category:'other',status:'lost',location:'C7 lecture room',description:'Brown cover with handwritten engineering notes.',owner:'other',created:'Oct 25',emoji:'📒',verified:false},
 {id:'f10',title:'Scientific calculator',category:'electronics',status:'lost',location:'B2 lecture hall',description:'Black scientific calculator with a protective cover.',owner:'other',created:'Oct 26',emoji:'🧮',verified:false},
 {id:'f11',title:'Calculator',category:'electronics',status:'found',location:'B2 study area',description:'Scientific calculator with a black cover, found on a desk.',owner:'you',created:'Oct 26',emoji:'🧮',collectionPoint:'Library Reception',handoverStatus:'received',verified:true},
 {id:'f12',title:'Canvas tote bag',category:'accessories',status:'lost',location:'Main campus bus stop',description:'Beige tote with green writing on one side.',owner:'other',created:'Oct 26',emoji:'👜',verified:false},
 {id:'f13',title:'USB flash drive',category:'electronics',status:'found',location:'Building A computer lab',description:'A small black flash drive was found beside a workstation.',owner:'other',created:'Oct 27',emoji:'💾',collectionPoint:'',handoverStatus:'reported',verified:false},
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

/* SVG icon components */
function IconGrid(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;}
function IconSearch(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;}
function IconBox(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;}
function IconCheck(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;}
function IconMenu(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;}
function IconX(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;}
function IconCamera(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;}
function IconPlus(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;}
function IconSearchLg(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;}

function StatusBadge({status}){
 return <span className={`status-badge status-${status}`}>{cap(status)}</span>;
}

function DeleteModal({item,onConfirm,onCancel}){
 const cancelRef=useRef(null);
 useEffect(()=>{cancelRef.current?.focus();},[]);
 return <div className="modal-overlay" onClick={onCancel}>
  <div className="modal-box" role="alertdialog" aria-label={`Delete ${item.title}`} onClick={e=>e.stopPropagation()}>
   <h3>Delete report?</h3>
   <p>Are you sure you want to delete "<strong>{item.title}</strong>"? This action cannot be undone.</p>
   <div className="modal-actions">
    <button ref={cancelRef} className="modal-cancel" onClick={onCancel}>No, keep it</button>
    <button className="modal-delete" onClick={onConfirm}>Delete</button>
   </div>
  </div>
 </div>;
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [sidebarTab,setSidebarTab]=useState('all');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [detail,setDetail]=useState(null);
 const [deleteTarget,setDeleteTarget]=useState(null);
 const [photoMap,setPhotoMap]=useState({});
 const [sidebarOpen,setSidebarOpen]=useState(true);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);

 const filtered=useMemo(()=>{
  let list=items;
  if(sidebarTab!=='all') list=list.filter(x=>x.status===sidebarTab);
  if(cat!=='all') list=list.filter(x=>x.category===cat);
  if(q) list=list.filter(x=>`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase()));
  return list;
 },[items,q,cat,sidebarTab]);

 function create(){setCurrent(null);setForm({...clean});setError('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setError('');setPage('form');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){setError(v);return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',verified:false,...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.');}setPage('board');setCurrent(null);}
 function confirmDelete(){if(!deleteTarget)return;setItems(items.filter(x=>x.id!==deleteTarget.id));setMessage(`"${deleteTarget.title}" has been deleted.`);setDeleteTarget(null);setDetail(null);}
 function reset(){setItems(seed);setPage('board');setQ('');setCat('all');setSidebarTab('all');setMessage('Example reports restored.');setDetail(null);setPhotoMap({});}

 function handlePhoto(itemId,e){
  const file=e.target.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>setPhotoMap(m=>({...m,[itemId]:reader.result}));
  reader.readAsDataURL(file);
 }

 function handoverText(item){
  if(!item.verified) return item.handoverStatus==='reported'?'Reported found — not yet confirmed at a collection point':'Reported found — awaiting verification';
  if(item.handoverStatus==='received'&&item.collectionPoint) return `Verified — held at ${item.collectionPoint}`;
  if(item.handoverStatus==='released') return 'Collected by owner (verified)';
  return 'Reported found';
 }

 const sidebarProps={tab:sidebarTab,open:sidebarOpen,onToggle:()=>setSidebarOpen(o=>!o)};

 // Detail page
 if(detail){
  const item=items.find(x=>x.id===detail);
  if(!item){setDetail(null);return null;}
  return <div className="notice-app">
   <div className={`app-layout${sidebarOpen?' sidebar-open':' sidebar-closed'}`}>
    <Sidebar {...sidebarProps} setTab={t=>{setSidebarTab(t);setDetail(null);setPage('board');}} onCreate={create} onReset={reset}/>
    <div className="main-area">
     <header className="topbar">
      <button className="hamburger" onClick={()=>setSidebarOpen(o=>!o)} aria-label={sidebarOpen?'Close sidebar':'Open sidebar'}>{sidebarOpen?<IconX/>:<IconMenu/>}</button>
      <span className="topbar-brand" onClick={()=>{setDetail(null);setPage('board');}}>FOUND<small>on campus</small></span>
     </header>
     <main className="detail-page">
      <button className="back-btn" onClick={()=>setDetail(null)}>← Back to reports</button>
      <div className="detail-card">
       <div className="detail-header">
        <span className="detail-emoji">{item.emoji}</span>
        <div>
         <h1>{item.title}</h1>
         <StatusBadge status={item.status}/>
        </div>
       </div>
       <div className="detail-grid">
        <div className="detail-field"><span className="detail-label">Category</span><span>{cap(item.category)}</span></div>
        <div className="detail-field"><span className="detail-label">Location</span><span>{item.location||'Not provided'}</span></div>
        <div className="detail-field"><span className="detail-label">Date reported</span><span>{item.created}</span></div>
        <div className="detail-field"><span className="detail-label">Reported by</span><span>{item.owner==='you'?'You':'Another student'}</span></div>
       </div>
       <div className="detail-section">
        <h3>Description</h3>
        <p>{item.description||'No additional description provided.'}</p>
       </div>
       {item.status!=='lost'&&<div className="detail-section">
        <h3>Collection status</h3>
        <p className={`handover-badge ${item.verified?'verified':'unverified'}`}>{handoverText(item)}</p>
       </div>}
       <div className="detail-section">
        <h3>Photo of location</h3>
        {photoMap[item.id]?<img className="detail-photo" src={photoMap[item.id]} alt="Location where item was found"/>:
        <p className="photo-placeholder">No photo added yet.</p>}
        <label className="photo-upload-btn">
         <IconCamera/> {photoMap[item.id]?'Change photo':'Add a photo'}
         <input type="file" accept="image/*" onChange={e=>handlePhoto(item.id,e)} hidden/>
        </label>
       </div>
       {item.owner==='you'&&<div className="detail-actions">
        <button className="btn-primary" onClick={()=>{setDetail(null);edit(item);}}>Edit report</button>
        <button className="btn-danger" onClick={()=>setDeleteTarget(item)}>Delete report</button>
       </div>}
      </div>
     </main>
    </div>
   </div>
   {deleteTarget&&<DeleteModal item={deleteTarget} onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)}/>}
  </div>;
 }

 // Form page
 if(page==='form'){
  return <div className="notice-app">
   <div className={`app-layout${sidebarOpen?' sidebar-open':' sidebar-closed'}`}>
    <Sidebar {...sidebarProps} setTab={t=>{setSidebarTab(t);setPage('board');}} onCreate={create} onReset={reset}/>
    <div className="main-area">
     <header className="topbar">
      <button className="hamburger" onClick={()=>setSidebarOpen(o=>!o)} aria-label={sidebarOpen?'Close sidebar':'Open sidebar'}>{sidebarOpen?<IconX/>:<IconMenu/>}</button>
      <span className="topbar-brand" onClick={()=>setPage('board')}>FOUND<small>on campus</small></span>
     </header>
     <main className="form-page">
      <button className="back-btn" onClick={()=>setPage('board')}>← Back to reports</button>
      <div className="form-wrapper">
       <div className="form-header-area">
        <h1>{current?'Update your report':'Report a lost or found item'}</h1>
        <p>Small details can help someone recognize their belongings.</p>
       </div>
       <section className="form-paper">
        <form onSubmit={submit}>
         <label>Item title <b>*</b><input value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/></label>
         <label>Status <b>*</b><select value={form.status} onChange={e=>setForm(s=>({...s,status:e.target.value}))}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
         <label>Category <b>*</b><select value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s}>{s}</option>)}</select></label>
         <label>Last known location<input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="Location (optional)"/></label>
         <label>More details<textarea rows="5" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder="Describe your item"/></label>
         {error&&<div className="form-error" role="alert">{error}</div>}
         <div className="form-actions">
          <button type="button" onClick={()=>setPage('board')}>Cancel</button>
          <button className="btn-primary" type="submit">{current?'Save changes':'Publish report'}</button>
         </div>
        </form>
       </section>
      </div>
     </main>
    </div>
   </div>
  </div>;
 }

 // Board page
 return <div className="notice-app">
  <div className={`app-layout${sidebarOpen?' sidebar-open':' sidebar-closed'}`}>
   <Sidebar {...sidebarProps} setTab={setSidebarTab} onCreate={create} onReset={reset}/>
   <div className="main-area">
    <header className="topbar">
     <button className="hamburger" onClick={()=>setSidebarOpen(o=>!o)} aria-label={sidebarOpen?'Close sidebar':'Open sidebar'}>{sidebarOpen?<IconX/>:<IconMenu/>}</button>
     <span className="topbar-brand" onClick={()=>{setSidebarTab('all');setQ('');setCat('all');}}>FOUND<small>on campus</small></span>
     <button className="report-button" onClick={create}><IconPlus/> Post a report</button>
    </header>
    <div className="search-bar">
     <div className="search-inner">
      <label className="search-field"><span className="search-icon"><IconSearchLg/></span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search items by title, location, or description…"/></label>
      <label className="filter-field"><select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
      <button className="search-clear" onClick={()=>{setQ('');setCat('all');}}>Clear</button>
     </div>
    </div>
    <main className="board-area">
     {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')}>✕</button></div>}
     <div className="board-top">
      <div><p className="kicker">{sidebarTab==='all'?'ALL REPORTS':sidebarTab.toUpperCase()+' ITEMS'}</p><h2>{sidebarTab==='all'?'Latest notices':'Showing '+sidebarTab} <span>({filtered.length})</span></h2></div>
     </div>
     {sidebarTab==='all'?
      <div className="board-grid">{[{key:'lost',title:'LOST',sub:'Searching for these items',icon:'↗'},{key:'found',title:'FOUND',sub:'Reported by the community',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].map(col=><div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div><div className="card-list">{filtered.filter(r=>r.status===col.key).map(item=><ItemCard key={item.id} item={item} onClick={()=>setDetail(item.id)} handoverText={handoverText}/>)}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">Nothing here yet</div>}</div></div>)}</div>
     :<div className="list-grid">{filtered.map(item=><ItemCard key={item.id} item={item} onClick={()=>setDetail(item.id)} handoverText={handoverText}/>)}{filtered.length===0&&<div className="empty-column">No {sidebarTab} items found</div>}</div>}
    </main>
   </div>
  </div>
  {deleteTarget&&<DeleteModal item={deleteTarget} onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)}/>}
 </div>;
}

function Sidebar({tab,setTab,onCreate,onReset,open,onToggle}){
 const tabs=[
  {key:'all',label:'All Reports',Icon:IconGrid},
  {key:'lost',label:'Lost Items',Icon:IconSearch},
  {key:'found',label:'Found Items',Icon:IconBox},
  {key:'claimed',label:'Claimed',Icon:IconCheck},
 ];
 return <nav className={`sidebar${open?'':' collapsed'}`} role="navigation" aria-label="Report categories">
  <div className="sidebar-brand">FOUND<small>on campus</small></div>
  <ul className="sidebar-nav">{tabs.map(t=><li key={t.key}><button className={tab===t.key?'active':''} onClick={()=>setTab(t.key)} title={t.label}><span className="nav-icon"><t.Icon/></span><span className="nav-label">{t.label}</span></button></li>)}</ul>
  <button className="sidebar-report" onClick={onCreate} title="Post a report"><span className="nav-icon"><IconPlus/></span><span className="nav-label">Post a report</span></button>
  <div className="sidebar-footer">
   <p className="nav-label">Community noticeboard</p>
   <button className="reset" onClick={onReset}>Reset demo</button>
  </div>
 </nav>;
}

function ItemCard({item,onClick,handoverText}){
 return <article className="card" tabIndex={0} role="button" aria-label={`View details for ${item.title}`} onClick={onClick} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onClick();}}}>
  <div className="card-top">
   <StatusBadge status={item.status}/>
   <span className="card-category">{cap(item.category)}</span>
  </div>
  <div className="card-emoji">{item.emoji}</div>
  <h3 className="card-title">{item.title}</h3>
  <p className="card-desc">{item.description||'No additional description.'}</p>
  {item.status!=='lost'&&<div className={`handover-note ${item.verified?'verified':'unverified'}`}>{handoverText(item)}</div>}
  <div className="card-footer">
   <span>⌖ {item.location||'Not provided'}</span>
   <small>{item.created}</small>
  </div>
 </article>;
}
