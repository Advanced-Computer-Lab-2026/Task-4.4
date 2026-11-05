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
const collectionPointList='Campus Security Desk, Student Services Office or Library Reception';
const columns=[
 {key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},
 {key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},
 {key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'},
];
const clean={title:'',category:'',status:'',location:'',description:''};
const locationLabels={lost:'Where did you last have it?',found:'Where did you find it?',claimed:'Where was it reported?'};
const fieldOrder=['status','title','category'];

function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

// --- Search and matching ---
const STOP=new Set('a an and after at by for found from i in is it its left lost my near of on one or possibly side the this that to was were with'.split(' '));
const words=s=>s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const keywords=s=>words(s).filter(w=>!STOP.has(w));
function queryTerms(q){const k=keywords(q);return k.length?k:words(q);}

// 2 = contains every search word. 1 = partial: at least half the words, one of them in the
// title, so "black backpack" still surfaces a notice titled "Dark backpack". 0 = no match.
function searchScore(item,terms){
 if(!terms.length)return 2;
 const title=item.title.toLowerCase();
 const text=`${title} ${item.location} ${item.description} ${item.category}`.toLowerCase();
 const hits=terms.filter(t=>text.includes(t)).length;
 if(hits===terms.length)return 2;
 return hits*2>=terms.length&&terms.some(t=>title.includes(t))?1:0;
}

// Reports with the wanted status in the same category that either share a word in the title
// or share at least two descriptive words. These are only ever presented as possible matches.
function similarReports(report,items,wantedStatus){
 const own=new Set(keywords(`${report.title} ${report.description}`));
 const ownTitle=new Set(keywords(report.title));
 return items
  .filter(r=>r.id!==report.id&&r.status===wantedStatus&&r.category===report.category)
  .map(r=>({r,shared:new Set(keywords(`${r.title} ${r.description}`).filter(w=>own.has(w))).size,titleHit:keywords(r.title).some(w=>ownTitle.has(w))}))
  .filter(x=>x.titleHit||x.shared>=2)
  .sort((a,b)=>b.shared-a.shared)
  .map(x=>x.r);
}

// What this notice means for someone trying to get the item back. Lost reports have no handover.
function handoverInfo(item){
 if(item.status==='found'){
  if(item.handoverStatus==='received'&&item.collectionPoint)return {tone:'held',icon:'✓',label:`At ${item.collectionPoint}`,detail:'Bring proof of ownership. Staff verify it before release.'};
  return {tone:'unconfirmed',icon:'!',label:'Not at a collection point yet',detail:"Staff can't confirm they hold it. Check back before making a trip."};
 }
 if(item.status==='claimed'){
  if(item.handoverStatus==='released')return {tone:'done',icon:'✓',label:'Collected by owner',detail:item.collectionPoint?`Released from ${item.collectionPoint}.`:''};
  return {tone:'done',icon:'✓',label:'Marked as claimed',detail:'Not confirmed by a collection point.'};
 }
 return null;
}
const whereIs=item=>{const info=handoverInfo(item);return info?info.label:'';};

function validate(f,arr,id){
 const errors={};
 const title=f.title.trim();
 if(!title||title.length<2)errors.title='Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))errors.category='Choose a category.';
 if(!statuses.includes(f.status))errors.status='Choose lost, found or claimed.';
 if(!errors.title){
  const duplicate=arr.find(r=>r.id!==id&&r.title.toLowerCase()===title.toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase());
  if(duplicate){errors.title='An item with the same title has already been reported at this location.';errors.duplicateId=duplicate.id;}
 }
 return errors;
}

function Field({name,label,required,hint,error,children}){
 return <div className="field">
  <label htmlFor={`field-${name}`}>{label}{required&&<b aria-hidden="true"> *</b>}</label>
  {children}
  {hint&&<small className="field-hint" id={`hint-${name}`}>{hint}</small>}
  {error&&<div className="field-error" id={`error-${name}`}>{error}</div>}
 </div>;
}

function ReportCard({item,matches,partial,highlighted,onEdit,onShow}){
 const info=handoverInfo(item);
 return <article className={`sticky ${item.status}${highlighted?' highlighted':''}`} id={`report-${item.id}`} tabIndex={-1}>
  <div className="sticky-top"><span>{item.category}</span>{partial&&<span className="partial-tag">Partial match</span>}</div>
  <div className="sticky-emoji" aria-hidden="true">{item.emoji}</div>
  <h3>{item.title}</h3>
  <p>{item.description||'No additional description.'}</p>
  {info&&<div className={`handover ${info.tone}`}><strong><span aria-hidden="true">{info.icon}</span> {info.label}</strong>{info.detail&&<span>{info.detail}</span>}</div>}
  {matches.length>0&&<div className="matches">
   <strong>{matches.length===1?'Possible match':`${matches.length} possible matches`}</strong>
   {matches.map(m=><button key={m.id} onClick={()=>onShow(m.id)}><span>{m.title}</span><small>{whereIs(m)}</small></button>)}
  </div>}
  <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>
  <div className="sticky-owner">{item.owner==='you'
   ?<><span className="own-tag">Your report</span><button onClick={()=>onEdit(item)} aria-label={`Edit your report: ${item.title}`}>Edit</button></>
   :<span>Reported by another student</span>}</div>
 </article>;
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [startForm,setStartForm]=useState(clean);
 const [attempted,setAttempted]=useState(false);
 const [message,setMessage]=useState('');
 const [highlight,setHighlight]=useState(null);

 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);

 // Bring a report into view after any navigation that targets it.
 useEffect(()=>{
  if(!highlight)return;
  const el=document.getElementById(`report-${highlight}`);
  el?.scrollIntoView({block:'center'});
  el?.focus({preventScroll:true});
  const timer=setTimeout(()=>setHighlight(null),3000);
  return ()=>clearTimeout(timer);
 },[highlight]);

 const terms=useMemo(()=>queryTerms(q),[q]);
 const passesFilters=x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&searchScore(x,terms)>0;
 const filtered=useMemo(()=>items.filter(passesFilters).sort((a,b)=>searchScore(b,terms)-searchScore(a,terms)),[items,terms,cat,filterStatus]);
 const hasFilters=q.trim()!==''||cat!=='all'||filterStatus!=='all';
 const shownColumns=filterStatus==='all'?columns:columns.filter(c=>c.key===filterStatus);

 const errors=attempted?validate(form,items,current):{};
 const errorCount=fieldOrder.filter(f=>errors[f]).length;
 const draftMatches=!current&&form.category&&(form.status==='lost'||form.status==='found')
  ?similarReports({...form,id:null},items,form.status==='lost'?'found':'lost'):[];
 const fieldProps=name=>({
  id:`field-${name}`,
  'aria-invalid':errors[name]?true:undefined,
  'aria-required':fieldOrder.includes(name)?true:undefined,
  'aria-describedby':[errors[name]&&`error-${name}`,(name==='title'||name==='description')&&`hint-${name}`].filter(Boolean).join(' ')||undefined,
  value:form[name],
  onChange:e=>setForm(s=>({...s,[name]:e.target.value})),
 });

 // Every way off the form goes through here, so typed details are never dropped silently.
 function canLeaveForm(){
  if(page!=='form'||JSON.stringify(form)===JSON.stringify(startForm))return true;
  return window.confirm('Leave this form? Your unsaved details will be lost.');
 }
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 function openForm(id,values){setCurrent(id);setForm(values);setStartForm(values);setAttempted(false);setPage('form');}
 function create(){if(canLeaveForm())openForm(null,{...clean});}
 function edit(row){
  if(row.owner!=='you'||!canLeaveForm())return;
  openForm(row.id,{title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});
 }
 function goBoard(status){
  if(!canLeaveForm())return;
  if(status)setFilterStatus(status);
  setPage('board');
 }
 function showReport(id){
  if(!canLeaveForm())return;
  const target=items.find(x=>x.id===id);
  if(target&&!passesFilters(target))clearFilters();
  setPage('board');
  setHighlight(id);
 }
 function submit(e){
  e.preventDefault();
  const found=validate(form,items,current);
  const firstInvalid=fieldOrder.find(f=>found[f]);
  if(firstInvalid){
   setAttempted(true);
   document.getElementById(`field-${firstInvalid}`)?.focus();
   return;
  }
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim()};
  let saved;
  if(current){
   saved={...items.find(x=>x.id===current),...d};
   setItems(items.map(x=>x.id===current?saved:x));
   setMessage('Report updated.');
  }else{
   saved={id:`f-${Date.now()}`,...d,owner:'you',created:'Today',emoji:'📌',collectionPoint:'',handoverStatus:'reported'};
   setItems([saved,...items]);
   const matchCount=d.status==='lost'?similarReports(saved,items,'found').length:0;
   setMessage('Your report has been posted.'
    +(d.status==='found'?` Please hand the item in at a collection point: ${collectionPointList}.`:'')
    +(matchCount?` We highlighted ${matchCount===1?'a possible match':`${matchCount} possible matches`} on your notice.`:''));
  }
  if(!passesFilters(saved))clearFilters();
  setPage('board');
  setCurrent(null);
  setHighlight(saved.id);
 }
 function reset(){
  if(!window.confirm('Reset the demo? Your reports and edits will be replaced by the example reports.'))return;
  setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');
 }

 const navItems=[{label:'Noticeboard',status:'all'},{label:'Lost items',status:'lost'},{label:'Found items',status:'found'}];
 return <div className="notice-app">
  <header className="header">
   <div className="headline"><span className="sun" aria-hidden="true">✺</span><button onClick={()=>goBoard()} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div>
   <nav className="header-links" aria-label="Noticeboard views">{navItems.map(n=><button key={n.status} aria-current={page==='board'&&filterStatus===n.status?'page':undefined} onClick={()=>goBoard(n.status)}>{n.label}</button>)}</nav>
   <button className="report-button" onClick={create}>+ Post a report</button>
  </header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>

  {page==='board'?<main className="workspace">
   <aside className="filters">
    <p className="kicker">YOUR NOTICEBOARD</p>
    <h1>Lost something?<br/><em>You're in the right place.</em></h1>
    <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
    <div className="filterbox">
     <h3>Browse reports</h3>
     <label>Search items<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g., black backpack"/></label>
     <label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
     <label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
     <div className="filterbuttons"><button onClick={clearFilters} disabled={!hasFilters}>Clear filters</button></div>
    </div>
    <button className="reset" onClick={reset}>Reset demo data</button>
   </aside>

   <section className="board">
    <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Notices</h2></div><span className="result-count" role="status">Showing {filtered.length} of {items.length} reports</span></div>
    {message&&<div className="message" role="status"><span>{message}</span><button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    <div className="side-message">
     <div>
      <strong>Getting your item back</strong>
      <ol>
       <li>Search for it and check the <b>Found</b> notices.</li>
       <li>Check the notice says it's <b>at a collection point</b>.</li>
       <li>Bring proof of ownership. Staff verify it before release.</li>
      </ol>
     </div>
     <div>
      <strong>Found something?</strong>
      <p>Hand it in at {collectionPointList}, then post a notice.</p>
      <button onClick={create}>Share your report →</button>
     </div>
    </div>
    {filtered.length===0
     ?<div className="empty-board">
       <h3>No reports match {q.trim()?`“${q.trim()}”`:'these filters'}</h3>
       <p>Try fewer words or a different category. If nothing fits, post a report so others can look out for it.</p>
       <div><button onClick={clearFilters}>Clear filters</button><button className="report-button" onClick={create}>+ Post a report</button></div>
      </div>
     :<div className={`board-grid${shownColumns.length===1?' single':''}`}>{shownColumns.map(col=>{
       const rows=filtered.filter(r=>r.status===col.key);
       return <div className="board-column" key={col.key}>
        <div className="column-head"><span className={'col-icon '+col.key} aria-hidden="true">{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{rows.length}</span></div>
        <div className="sticky-list">
         {rows.map(item=><ReportCard key={item.id} item={item} highlighted={highlight===item.id} partial={searchScore(item,terms)===1} matches={item.status==='lost'?similarReports(item,items,'found'):[]} onEdit={edit} onShow={showReport}/>)}
         {rows.length===0&&<div className="empty-column">{hasFilters?`No ${col.key} reports match your filters`:'Nothing here yet'}</div>}
        </div>
       </div>;
      })}</div>}
   </section>
  </main>

  :<main className="report-page">
   <div className="crumbs"><button onClick={()=>goBoard()}>← Noticeboard</button><span>/</span><span>{current?'Edit report':'Report an item'}</span></div>
   <div className="report-layout">
    <div className="report-intro">
     <span className="seal" aria-hidden="true">✺</span>
     <p className="kicker">HELP THE COMMUNITY</p>
     <h1>{current?'Update your report':'Tell us what happened.'}</h1>
     <p>Small details can help someone recognize their belongings.</p>
     <div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div>
    </div>
    <section className="form-paper">
     <header><p>{current?'YOUR NOTICE / EDIT':'NEW NOTICE / FORM 01'}</p><h2>{current?'Edit report':'Report an item'}</h2></header>
     <form onSubmit={submit} noValidate>
      <p className="required-note"><b>*</b> Required</p>
      <Field name="status" label="Status" required error={errors.status}>
       <select {...fieldProps('status')}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>
      </Field>
      {form.status==='found'&&<div className="form-guide">
       <strong>Found something? Thanks!</strong>
       <p>Hand it in at {collectionPointList}. Your notice will say it's not at a collection point until it's received there.</p>
       <p>Don't publish names or ID numbers, and leave out one identifying detail so the owner can prove it's theirs.</p>
      </div>}
      <Field name="title" label="Item title" required hint="At least 2 characters." error={errors.title&&<>{errors.title}{errors.duplicateId&&<> Change the title or location if this is a different item, or <button type="button" className="link-button" onClick={()=>showReport(errors.duplicateId)}>view the existing report</button>.</>}</>}>
       <input {...fieldProps('title')} placeholder="e.g., Black backpack"/>
      </Field>
      <Field name="category" label="Category" required error={errors.category}>
       <select {...fieldProps('category')}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>
      </Field>
      {draftMatches.length>0&&<div className="form-guide matches-guide">
       <strong>{form.status==='lost'?'This may already have been found':'Someone may be looking for this'}</strong>
       <ul>{draftMatches.slice(0,3).map(m=><li key={m.id}><button type="button" className="link-button" onClick={()=>showReport(m.id)}>{m.title}</button><small>{m.location||'Location not provided'}{whereIs(m)?` · ${whereIs(m)}`:''}</small></li>)}</ul>
      </div>}
      <Field name="location" label={`${locationLabels[form.status]||'Location'} (optional)`}>
       <input {...fieldProps('location')} placeholder="e.g., Library - second floor"/>
      </Field>
      <Field name="description" label="Description (optional)" hint={form.status==='lost'?'Colour, brand or markings help people recognize it.':'What it looks like, without details only the owner should know.'}>
       <textarea rows="6" {...fieldProps('description')} placeholder="Describe your item"/>
      </Field>
      {errorCount>0&&<div className="form-error" role="alert">{errorCount===1?'1 field needs':`${errorCount} fields need`} your attention. Nothing has been posted yet.</div>}
      <div className="form-actions"><button type="button" onClick={()=>goBoard()}>Cancel</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div>
     </form>
    </section>
   </div>
  </main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
