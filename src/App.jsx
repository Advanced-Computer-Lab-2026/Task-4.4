import React,{useEffect,useMemo,useRef,useState} from 'react';
import ReportCard from './ReportCard.jsx';
import ReportForm,{FIELD_IDS,orderedErrors} from './ReportForm.jsx';
import {COLLECTION_POINTS,CUSTODY_FILTERS} from './custody.js';
import {cap,matchesFilters} from './filters.js';

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
function validate(f,arr,id){
 if(!f.title.trim()||f.title.trim().length<2)return 'Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))return 'Choose a category.';
 if(!statuses.includes(f.status))return 'Choose lost, found or claimed.';
 if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))return 'An item with the same title has already been reported at this location.';
 return '';
}
// Same rules and messages as validate(), but reports every problem at once so
// each one can be shown next to its field. The duplicate check only runs when
// the title itself is valid.
function validateFields(f,arr,id){
 const errors={};
 const title=f.title.trim();
 if(!title||title.length<2)errors.title='Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))errors.category='Choose a category.';
 if(!statuses.includes(f.status))errors.status='Choose lost, found or claimed.';
 if(!errors.title&&arr.some(r=>r.id!==id&&r.title.toLowerCase()===title.toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))errors.duplicate='An item with the same title has already been reported at this location.';
 return errors;
}

const COLUMNS=[
 {key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},
 {key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},
 {key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'},
];
const NAV_LINKS=[
 {label:'Noticeboard',status:'all'},
 {label:'Missing items',status:'lost'},
 {label:'Recently found',status:'found'},
];

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 // Filters
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [custodyFilter,setCustodyFilter]=useState('all');
 const [mine,setMine]=useState(false);
 // Form
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [initialForm,setInitialForm]=useState(clean);
 const [submitted,setSubmitted]=useState(false);
 const [formOpenCount,setFormOpenCount]=useState(0);
 // Feedback
 const [message,setMessage]=useState('');
 const [lastSavedId,setLastSavedId]=useState(null);
 const pendingFocusId=useRef(null);

 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);

 const filters={q,cat,status:filterStatus,custody:custodyFilter,mine};
 const filtered=useMemo(()=>items.filter(x=>matchesFilters(x,{q,cat,status:filterStatus,custody:custodyFilter,mine})),[items,q,cat,filterStatus,custodyFilter,mine]);
 // Errors are only shown after the first submit attempt, then re-checked live.
 const fieldErrors=useMemo(()=>submitted?validateFields(form,items,current):{},[submitted,form,items,current]);
 const isDirty=page==='form'&&JSON.stringify(form)!==JSON.stringify(initialForm);

 const chips=[
  q.trim()&&{key:'q',label:`Search: “${q.trim()}”`,remove:()=>setQ('')},
  filterStatus!=='all'&&{key:'status',label:`Status: ${cap(filterStatus)}`,remove:()=>setFilterStatus('all')},
  cat!=='all'&&{key:'cat',label:`Category: ${cap(cat)}`,remove:()=>setCat('all')},
  custodyFilter!=='all'&&{key:'custody',label:CUSTODY_FILTERS[custodyFilter],remove:()=>setCustodyFilter('all')},
  mine&&{key:'mine',label:'My reports',remove:()=>setMine(false)},
 ].filter(Boolean);
 const filtersActive=chips.length>0;

 // Move focus into the form whenever it is opened.
 useEffect(()=>{if(page==='form')document.getElementById(FIELD_IDS.title)?.focus();},[page,formOpenCount]);

 // After saving, bring the saved card into view and focus it.
 useEffect(()=>{
  if(page!=='board'||!pendingFocusId.current)return;
  const el=document.getElementById(`report-${pendingFocusId.current}`);
  pendingFocusId.current=null;
  if(!el)return;
  const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({block:'center',behavior:reduceMotion?'auto':'smooth'});
  el.focus({preventScroll:true});
 },[page,lastSavedId]);

 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');setCustodyFilter('all');setMine(false);}
 function removeChip(chip){chip.remove();document.getElementById('results-summary')?.focus();}
 function confirmLeave(){return !isDirty||window.confirm('Discard your unsaved changes?');}
 function goToBoard(status){if(!confirmLeave())return;if(status)setFilterStatus(status);setPage('board');}
 function openForm(id,values){setCurrent(id);setForm(values);setInitialForm(values);setSubmitted(false);setMessage('');setFormOpenCount(n=>n+1);setPage('form');}
 function setField(field,value){setForm(s=>({...s,[field]:value}));}

 function create(){if(!confirmLeave())return;openForm(null,{...clean});}
 function edit(row){if(row.owner!=='you')return;openForm(row.id,{title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});}
 function submit(e){
  e.preventDefault();
  const v=validate(form,items,current);
  if(v){
   setSubmitted(true);
   const first=orderedErrors(validateFields(form,items,current))[0];
   if(first)document.getElementById(FIELD_IDS[first.field])?.focus();
   return;
  }
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
  const id=current||`f-${Date.now()}`;
  let note;
  let saved;
  if(current){
   saved={...items.find(x=>x.id===current),...d};
   setItems(items.map(x=>x.id===current?{...x,...d}:x));
   note='Report updated.';
  }else{
   saved={id,...d};
   setItems([saved,...items]);
   note='Your report has been posted.';
   if(d.status==='found')note+=' It will be listed as reported only until staff receive it.';
  }
  if(!matchesFilters(saved,filters)){clearFilters();note+=' Filters were cleared so you can see it.';}
  setMessage(note);
  setLastSavedId(id);
  pendingFocusId.current=id;
  setSubmitted(false);
  setPage('board');
  setCurrent(null);
 }
 function reset(){setItems(seed);setPage('board');clearFilters();setLastSavedId(null);setMessage('Example reports restored.');}

 return <div className="notice-app">
  <header className="header">
   <div className="headline"><span className="sun" aria-hidden="true">✺</span><button onClick={()=>goToBoard()} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div>
   <nav className="header-links" aria-label="Main">
    {NAV_LINKS.map(link=>{
     const active=page==='board'&&filterStatus===link.status;
     return <button key={link.status} className={active?'active':undefined} aria-current={active?'true':undefined} onClick={()=>goToBoard(link.status)}>{link.label}</button>;
    })}
   </nav>
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
     <label>Search items<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. blue earbuds, backpack, ID card"/></label>
     <label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
     <label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
     <label>Handover status<select value={custodyFilter} onChange={e=>setCustodyFilter(e.target.value)}>{Object.entries(CUSTODY_FILTERS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
     <label className="checkbox-row"><input type="checkbox" checked={mine} onChange={e=>setMine(e.target.checked)}/>Show only my reports</label>
     <div className="filterbuttons"><button onClick={clearFilters}>Clear filters</button></div>
    </div>
    <section className="recovery" aria-labelledby="recovery-heading">
     <h3 id="recovery-heading">How recovery works</h3>
     <ol>
      <li>Find a matching <strong>FOUND</strong> notice.</li>
      <li>Check it says “Received at…” a collection point.</li>
      <li>Go there and verify ownership with staff.</li>
     </ol>
     <p className="recovery-points">Collection points</p>
     <ul>{COLLECTION_POINTS.map(p=><li key={p}>{p}</li>)}</ul>
    </section>
    <div className="side-message"><span aria-hidden="true">📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div>
    <button className="reset" onClick={reset}>Reset demo data</button>
   </aside>

   <section className="board">
    <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>
    <div className="results-bar">
     <p id="results-summary" className="results-summary" aria-live="polite" tabIndex={-1}>Showing {filtered.length} of {items.length} reports</p>
     {filtersActive&&<ul className="chips" aria-label="Active filters">
      {chips.map(chip=><li key={chip.key}><button className="chip" onClick={()=>removeChip(chip)} aria-label={`Remove filter ${chip.label}`}>{chip.label} <span aria-hidden="true">✕</span></button></li>)}
      <li><button className="chip-clear" onClick={clearFilters}>Clear all</button></li>
     </ul>}
    </div>
    {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    {filtersActive&&filtered.length===0&&<div className="empty-board">
     <p className="empty-board-title">No reports match your search.</p>
     <p>Try fewer or different words, or remove a filter.</p>
     <div className="empty-board-actions"><button onClick={clearFilters}>Clear filters</button><button className="report-button" onClick={create}>+ Post a report</button></div>
    </div>}
    <div className="board-grid">{COLUMNS.map(col=>{
     const colItems=filtered.filter(r=>r.status===col.key);
     return <div className="board-column" key={col.key}>
      <div className="column-head"><span className={'col-icon '+col.key} aria-hidden="true">{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{colItems.length}</span></div>
      <div className="sticky-list">
       {colItems.map(item=><ReportCard key={item.id} item={item} justSaved={item.id===lastSavedId} onEdit={edit}/>)}
       {colItems.length===0&&<div className="empty-column">{filtersActive?'No matching reports':'Nothing here yet'}</div>}
      </div>
     </div>;
    })}</div>
   </section>
  </main>:<main className="report-page">
   <div className="crumbs"><button onClick={()=>goToBoard()}>← Noticeboard</button><span aria-hidden="true">/</span><span>{current?'Edit report':'Report an item'}</span></div>
   <div className="report-layout">
    <div className="report-intro"><span className="seal" aria-hidden="true">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
    <section className="form-paper">
     <header><p>{current?'EDIT NOTICE':'NEW NOTICE / FORM 01'}</p><h2>{current?'Edit report':'Report an item'}</h2></header>
     <ReportForm form={form} onChange={setField} errors={fieldErrors} isEditing={!!current} categories={categories} statuses={statuses} onSubmit={submit} onCancel={()=>goToBoard()}/>
    </section>
   </div>
  </main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
