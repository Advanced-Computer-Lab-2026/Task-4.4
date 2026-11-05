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
// The designated campus collection points (the same fictional names used by the example records).
const collectionPoints=['Campus Security Desk','Student Services Office','Library Reception'];
const columns=[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}];
const clean={title:'',category:'',status:'',location:'',description:'',collectionPoint:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

const DUPLICATE_ERROR='An item with the same title has already been reported at this location.';
const findDuplicate=(f,arr,id)=>arr.find(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase());
// Same rules as before, but every problem is reported against its own field.
function validate(f,arr,id){
 const e={};
 if(!f.title.trim()||f.title.trim().length<2)e.title='Title must be at least 2 characters.';
 else if(findDuplicate(f,arr,id))e.title=DUPLICATE_ERROR;
 if(!statuses.includes(f.status))e.status='Choose lost, found or claimed.';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category.';
 return e;
}

// A notice fully matches if it contains the exact phrase, or every meaningful word in any order.
// It partially matches if at least one meaningful word is in its title. Words found only in a
// description don't count as partial matches, because "black backpack" would then list every black item.
const stopWords=new Set(['a','an','and','at','by','for','from','in','is','it','my','near','of','on','or','the','to','with','lost','found']);
const words=s=>(s.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).map(w=>w.length>3&&w.endsWith('s')&&!w.endsWith('ss')?w.slice(0,-1):w);
function matchNotice(item,query){
 const phrase=query.trim().toLowerCase();
 if(!phrase)return {level:'all',words:[]};
 const text=`${item.title} ${item.location} ${item.description}`;
 if(text.toLowerCase().includes(phrase))return {level:'full',words:[]};
 const terms=[...new Set(words(phrase))].filter(w=>!stopWords.has(w));
 const hit=(term,list)=>list.some(w=>w.startsWith(term));
 const textWords=words(text),titleWords=words(item.title);
 if(terms.length&&terms.every(t=>hit(t,textWords)))return {level:'full',words:[]};
 const inTitle=terms.filter(t=>hit(t,titleWords));
 return inTitle.length?{level:'partial',words:inTitle}:null;
}

// A student's report never counts as staff confirmation: only staff-set states read as confirmed.
const isStaffConfirmed=r=>!!r&&(r.handoverStatus==='received'||r.handoverStatus==='released');
function handoverNote(item){
 if(item.handoverStatus==='released')return {tone:'done',icon:'✓',title:'Collected by owner',next:''};
 if(item.status==='claimed')return {tone:'pending',icon:'!',title:'Marked as claimed by the reporter',next:'Staff have not confirmed the handover.'};
 if(item.handoverStatus==='received'&&item.collectionPoint)return {tone:'confirmed',icon:'✓',title:`Received at ${item.collectionPoint}`,next:'Yours? Go there to collect it. Staff will verify that it belongs to you first.'};
 return {tone:'pending',icon:'!',title:'Reported only: not confirmed at a collection point',next:item.collectionPoint?`The finder plans to hand it in at ${item.collectionPoint}. Check with staff there before relying on it.`:'It may not be ready to collect yet. Check back later, or ask at a collection point.'};
}
function HandoverNote({item}){
 const n=handoverNote(item);
 return <div className={`handover-note ${n.tone}`}><strong><span aria-hidden="true">{n.icon}</span> {n.title}</strong>{n.next&&<span>{n.next}</span>}</div>;
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [attempted,setAttempted]=useState(false);
 const [message,setMessage]=useState('');
 const [openMenu,setOpenMenu]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 const filtered=useMemo(()=>items
  .filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus))
  .map(x=>({...x,match:matchNotice(x,q)}))
  .filter(x=>x.match)
  .sort((a,b)=>(a.match.level==='partial')-(b.match.level==='partial')),[items,q,cat,filterStatus]);
 const filtersActive=Boolean(q.trim())||cat!=='all'||filterStatus!=='all';
 const partialCount=filtered.filter(x=>x.match.level==='partial').length;
 const scope=[q.trim()&&`“${q.trim()}”`,cat!=='all'&&cap(cat),filterStatus!=='all'&&cap(filterStatus)].filter(Boolean).join(' · ');
 const summary=(filtersActive?`Showing ${filtered.length} of ${items.length} notices: ${scope}`:`Showing all ${items.length} notices`)+(partialCount?` (${partialCount} partial ${partialCount===1?'match':'matches'}, listed last)`:'');
 const visibleColumns=columns.filter(c=>filterStatus==='all'||c.key===filterStatus);
 // Errors appear after the first failed submit, then update as the user corrects each field.
 const errors=attempted?validate(form,items,current):{};
 const errorCount=Object.keys(errors).length;
 const editing=items.find(x=>x.id===current);
 const staffConfirmed=isStaffConfirmed(editing);
 const setField=k=>e=>setForm(s=>({...s,[k]:e.target.value}));
 const fieldProps=k=>({id:`field-${k}`,'aria-invalid':errors[k]?true:undefined,'aria-describedby':errors[k]?`error-${k}`:undefined});

 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 function goToBoard(status){setFilterStatus(status);setPage('board');}
 function create(prefill={}){setCurrent(null);setForm({...clean,...prefill});setAttempted(false);setMessage('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description,collectionPoint:row.collectionPoint||''});setOpenMenu(null);setAttempted(false);setMessage('');setPage('form');}
 function showExisting(){const d=findDuplicate(form,items,current);if(!d)return;clearFilters();setQ(d.title);setAttempted(false);setCurrent(null);setPage('board');}
 function submit(e){
  e.preventDefault();
  const problems=validate(form,items,current);
  const first=['title','status','category'].find(k=>problems[k]);
  if(first){setAttempted(true);document.getElementById(`field-${first}`)?.focus();return;}
  const d={title:form.title.trim(),category:form.category,status:form.status,location:form.location.trim(),description:form.description.trim(),owner:'you',
   // Handover details that staff have already confirmed are never changed from this form.
   ...(staffConfirmed?{}:{collectionPoint:form.status==='found'?form.collectionPoint:'',handoverStatus:'reported'})};
  if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}
  else{setItems([{id:`f-${Date.now()}`,...d,created:'Today',emoji:'📌'},...items]);setMessage(form.status==='found'?`Your report has been posted. Next step: hand the item in at ${form.collectionPoint||'a collection point'}.`:'Your report has been posted.');}
  // Clear filters so the report the user just saved is on screen.
  clearFilters();setPage('board');setCurrent(null);setAttempted(false);
 }
 function reset(){setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');}

 return <div className="notice-app">
  <header className="header">
   <div className="headline"><span className="sun">✺</span><button onClick={()=>goToBoard('all')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div>
   <div className="header-links">
    {[['all','Noticeboard'],['lost','Missing items'],['found','Recently found']].map(([key,label])=><button key={key} aria-current={page==='board'&&filterStatus===key?'page':undefined} onClick={()=>goToBoard(key)}>{label}</button>)}
   </div>
   <button className="report-button" onClick={()=>create()}>+ Post a report</button>
  </header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>

  {page==='board'?<main className="workspace">
   <aside className="filters">
    <p className="kicker">YOUR NOTICEBOARD</p>
    <h1>Lost something?<br/><em>You're in the right place.</em></h1>
    <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
    <div className="filterbox">
     <h3>Browse reports</h3>
     <label>Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label>
     <label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
     <label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
     <div className="filterbuttons"><button onClick={clearFilters}>Clear filters</button></div>
    </div>
    <div className="side-message">
     <span>📍</span>
     <strong>How handover works</strong>
     <ol>
      <li><b>Found something?</b> Post a notice, then hand it in at a collection point.</li>
      <li><b>Lost something?</b> Search, then check the Found notices.</li>
      <li><b>Getting it back:</b> staff release an item once they've verified it's yours.</li>
     </ol>
     <p className="side-points">Collection points: {collectionPoints.join(' · ')}</p>
     <button onClick={()=>create()}>Share your report →</button>
    </div>
    <button className="reset" onClick={reset}>Reset demo data</button>
   </aside>

   <section className="board">
    <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>
    <p className="results-bar" role="status">{summary}</p>
    {message&&<div className="message" role="status">{message}<button aria-label="Dismiss message" onClick={()=>setMessage('')}>✕</button></div>}
    {filtered.length===0?<div className="no-results">
     <strong>{q.trim()?`No notices match “${q.trim()}”`:'No notices match these filters'}</strong>
     <p>Try fewer or different words, or clear your filters. If it still isn't here, post a notice so whoever finds it can recognize it.</p>
     <div className="no-results-actions">
      <button className="secondary-button" onClick={clearFilters}>Clear filters</button>
      <button className="report-button" onClick={()=>create({status:'lost',title:q.trim()})}>Post a lost report</button>
     </div>
    </div>:
    <div className={`board-grid${visibleColumns.length===1?' one-column':''}`}>{visibleColumns.map(col=><div className="board-column" key={col.key}>
     <div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div>
     <div className="sticky-list">
      {filtered.filter(r=>r.status===col.key).map(item=><article className="sticky" key={item.id}>
       <div className="sticky-top"><span>{item.category}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`}>···</button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?<button onClick={()=>edit(item)}>Edit your report</button>:<span>Reported by another student</span>}</div>}</div></div>
       <div className="sticky-emoji">{item.emoji}</div>
       {item.match.level==='partial'&&<div className="match-chip">Partial match: {item.match.words.join(', ')}</div>}
       <h3>{item.title}</h3>
       <p>{item.description||'No additional description.'}</p>
       {item.status!=='lost'&&<HandoverNote item={item}/>}
       <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>
      </article>)}
      {filtered.every(x=>x.status!==col.key)&&<div className="empty-column">{filtersActive?'No matches here':'Nothing here yet'}</div>}
     </div>
    </div>)}</div>}
   </section>
  </main>:<main className="report-page">
   <div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>{current?'Edit your report':'Report an item'}</span></div>
   <div className="report-layout">
    <div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
    <section className="form-paper">
     <header><p>{current?'YOUR NOTICE / EDIT':'NEW NOTICE / FORM 01'}</p><h2>{current?'Edit report':'Report an item'}</h2></header>
     <form onSubmit={submit} noValidate>
      <p className="required-note"><b>*</b> Required</p>
      <div className="field">
       <label htmlFor="field-title">Item title <b>*</b></label>
       <input {...fieldProps('title')} aria-required="true" value={form.title} onChange={setField('title')} placeholder="e.g., Black backpack"/>
       {errors.title&&<p className="field-error" id="error-title">{errors.title}{errors.title===DUPLICATE_ERROR&&<> Change the title or location if this is a different item, or <button type="button" onClick={showExisting}>see the existing notice</button>.</>}</p>}
      </div>
      <div className="field">
       <label htmlFor="field-status">Status <b>*</b></label>
       <select {...fieldProps('status')} aria-required="true" value={form.status} onChange={setField('status')}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>
       {errors.status&&<p className="field-error" id="error-status">{errors.status}</p>}
      </div>
      <div className="field">
       <label htmlFor="field-category">Category <b>*</b></label>
       <select {...fieldProps('category')} aria-required="true" value={form.category} onChange={setField('category')}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>
       {errors.category&&<p className="field-error" id="error-category">{errors.category}</p>}
      </div>
      <div className="field">
       <label htmlFor="field-location">{form.status==='found'?'Where you found it':'Last known location'}</label>
       <input id="field-location" value={form.location} onChange={setField('location')} placeholder="Location (optional)"/>
      </div>
      <div className="field">
       <label htmlFor="field-description">More details</label>
       <textarea id="field-description" rows="6" value={form.description} onChange={setField('description')} placeholder="Describe your item"/>
      </div>
      {form.status==='found'&&<div className="handover-panel">
       {staffConfirmed?<>
        <h3>Handover</h3>
        <p>Staff have recorded this item{editing.collectionPoint?` at ${editing.collectionPoint}`:''}, so its collection point can't be changed here.</p>
       </>:<>
        <h3>Next step: hand it in</h3>
        <p>Take the item to a collection point. Staff release it to the owner once they've verified ownership.</p>
        <div className="field">
         <label htmlFor="field-collectionPoint">Collection point you'll use</label>
         <select id="field-collectionPoint" value={form.collectionPoint} onChange={setField('collectionPoint')}><option value="">Not decided yet</option>{collectionPoints.map(p=><option key={p} value={p}>{p}</option>)}</select>
        </div>
        <p className="handover-hint">Your notice will say “reported” until staff confirm they've received the item.</p>
       </>}
      </div>}
      {errorCount>0&&<div className="form-error" role="alert">Your notice wasn't published. Fix the {errorCount===1?'highlighted field':`${errorCount} highlighted fields`} above.</div>}
      <div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div>
     </form>
    </section>
   </div>
  </main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
