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
const collectionPoints=['Campus Security Desk','Student Services Office','Library Reception'];
const columns=[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}];
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

// Returns one message per invalid field, so the form can say exactly what to fix.
function validate(f,arr,id){
 const errors={};
 const title=f.title.trim().toLowerCase();
 const location=(f.location||'').trim().toLowerCase();
 if(!statuses.includes(f.status))errors.status='Choose lost, found or claimed.';
 if(title.length<2)errors.title='Title must be at least 2 characters.';
 else if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===title&&(r.location||'').toLowerCase()===location))errors.title='An item with the same title has already been reported at this location.';
 if(!categories.slice(1).includes(f.category))errors.category='Choose a category.';
 return errors;
}
// Matches every word typed, in any order, so "blue bottle" finds "Blue sports bottle".
function matchesSearch(item,query){
 const text=`${item.title} ${item.category} ${item.location} ${item.description}`.toLowerCase();
 return query.toLowerCase().split(/\s+/).filter(Boolean).every(word=>text.includes(word));
}
const commonWords=new Set(['the','and','with','near','found','lost','left','from','was','after','possibly','one','side','for','this','that','item','small','main','monday']);
function keywords(item){
 const words=`${item.title} ${item.location} ${item.description}`.toLowerCase().match(/[a-z0-9]+/g)||[];
 return new Set(words.filter(w=>w.length>2&&!commonWords.has(w)));
}
// A lost item suggests found reports in the same category that share at least two descriptive words.
function possibleMatches(lost,all){
 const wanted=keywords(lost);
 return all.filter(x=>x.status==='found'&&x.category===lost.category&&[...keywords(x)].filter(w=>wanted.has(w)).length>=2);
}
// Keeps "staff hold it" clearly separate from "someone said they found it".
function handover(item){
 if(item.status==='claimed')return {tone:'done',title:item.handoverStatus==='released'?'Collected by owner':'Marked as claimed'};
 if(item.handoverStatus==='received'&&item.collectionPoint)return {tone:'held',title:`Held at ${item.collectionPoint}`,detail:'Bring proof of ownership to collect it.'};
 return {tone:'pending',title:'Not yet at a collection point',detail:'Reported by the finder. Staff have not confirmed they hold it.'};
}
function Field({name,label,required,errors,children}){
 return <label>
  <span className="field-label">{label}{required&&<b aria-hidden="true"> *</b>}</span>
  {children}
  {errors[name]&&<span className="field-error" id={`error-${name}`}>{errors[name]}</span>}
 </label>;
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [startingForm,setStartingForm]=useState(clean);
 const [errors,setErrors]=useState({});
 const [message,setMessage]=useState('');
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 useEffect(()=>{window.scrollTo(0,0);},[page]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&matchesSearch(x,q)),[items,q,cat,filterStatus]);
 const hasFilters=q.trim()!==''||cat!=='all'||filterStatus!=='all';
 const shownColumns=filterStatus==='all'?columns:columns.filter(c=>c.key===filterStatus);
 const errorCount=Object.keys(errors).length;
 const editingItem=current?items.find(x=>x.id===current):null;
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 // Warns before leaving the form with unsaved typing.
 function canLeave(){return page!=='form'||JSON.stringify(form)===JSON.stringify(startingForm)||window.confirm('Discard your changes? What you typed will not be saved.');}
 function toBoard(){if(canLeave())setPage('board');}
 function showBoard(status){if(!canLeave())return;setFilterStatus(status);setPage('board');}
 function openForm(values){setForm(values);setStartingForm(values);setErrors({});setMessage('');setPage('form');}
 function create(){if(!canLeave())return;setCurrent(null);openForm({...clean});}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);openForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});}
 function change(name,value){const next={...form,[name]:value};setForm(next);if(errorCount)setErrors(validate(next,items,current));}
 function fieldProps(name){return {id:`field-${name}`,value:form[name],onChange:e=>change(name,e.target.value),'aria-invalid':errors[name]?true:undefined,'aria-describedby':errors[name]?`error-${name}`:undefined};}
 function submit(e){
  e.preventDefault();
  const v=validate(form,items,current);
  setErrors(v);
  const firstInvalid=['status','title','category'].find(k=>v[k]);
  if(firstInvalid){document.getElementById(`field-${firstInvalid}`)?.focus();return;}
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{created:'Today',collectionPoint:'',handoverStatus:'reported'})};
  if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}
  else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage(d.status==='found'?'Your report has been posted. Next step: hand the item in at a collection point.':'Your report has been posted.');}
  clearFilters();// So the report just saved is never hidden by an old filter.
  setPage('board');setCurrent(null);
 }
 function reset(){setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');}
 const navLink=(status,label)=><button onClick={()=>showBoard(status)} aria-current={page==='board'&&filterStatus===status?'page':undefined}>{label}</button>;
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={toBoard} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><div className="header-links">{navLink('all','Noticeboard')}{navLink('lost','Missing items')}{navLink('found','Recently found')}</div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace">
   <aside className="filters">
    <p className="kicker">YOUR NOTICEBOARD</p>
    <h1>Lost something?<br/><em>You're in the right place.</em></h1>
    <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
    <div className="filterbox">
     <h3>Browse reports</h3>
     <label>Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g., blue bottle"/></label>
     <label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
     <label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
     <div className="filterbuttons"><button onClick={clearFilters} disabled={!hasFilters}>Clear filters</button></div>
    </div>
    <div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div>
    <button className="reset" onClick={reset}>Reset demo data</button>
   </aside>
   <section className="board">
    <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note" role="status">Showing {filtered.length} of {items.length} reports</span></div>
    {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    {filtered.length===0?<div className="no-results">
     <h3>No reports match your search</h3>
     <p>Try fewer or different words, or clear your filters. If your item isn't listed, post a report so others can look out for it.</p>
     <div className="no-results-actions"><button onClick={clearFilters}>Clear filters</button><button className="report-button" onClick={create}>+ Post a report</button></div>
    </div>:<div className={'board-grid'+(shownColumns.length===1?' single':'')}>{shownColumns.map(col=>{
     const rows=filtered.filter(r=>r.status===col.key);
     return <div className="board-column" key={col.key}>
      <div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{rows.length}</span></div>
      <div className="sticky-list">
       {rows.map(item=>{
        const note=item.status==='lost'?null:handover(item);
        const matches=item.status==='lost'?possibleMatches(item,items):[];
        return <article className={'sticky '+item.status} key={item.id}>
         <div className="sticky-top"><span>{item.category}</span>{item.owner==='you'&&<span className="own-tag">Your report</span>}</div>
         <div className="sticky-emoji">{item.emoji}</div>
         <h3>{item.title}</h3>
         <p>{item.description||'No additional description.'}</p>
         {note&&<div className={'handover-note '+note.tone}><strong>{note.title}</strong>{note.detail&&<span>{note.detail}</span>}</div>}
         {matches.length>0&&<div className="match-note">
          <strong>{matches.length===1?'Possible match':`${matches.length} possible matches`} in Found</strong>
          <ul>{matches.map(m=>{const h=handover(m);return <li key={m.id}><b>{m.title}</b> · {m.location||'Location not provided'}<span>{h.title}. {h.detail}</span></li>;})}</ul>
         </div>}
         <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>
         {item.owner==='you'?<button className="edit-button" onClick={()=>edit(item)} aria-label={`Edit your report: ${item.title}`}>Edit report</button>:<div className="reported-by">Reported by another student</div>}
        </article>;
       })}
       {rows.length===0&&<div className="empty-column">{hasFilters?`No ${col.key} reports match your filters`:`No ${col.key} reports yet`}</div>}
      </div>
     </div>;
    })}</div>}
   </section>
  </main>:<main className="report-page">
   <div className="crumbs"><button onClick={toBoard}>← Noticeboard</button><span>/</span><span>{current?'Edit report':'Report an item'}</span></div>
   <div className="report-layout">
    <div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
    <section className="form-paper">
     <header><p>{current?'EDIT NOTICE':'NEW NOTICE / FORM 01'}</p><h2>{current?'Edit report':'Report an item'}</h2></header>
     <form onSubmit={submit} noValidate>
      <p className="required-note"><b>*</b> Required</p>
      <Field name="status" label="Status" required errors={errors}><select {...fieldProps('status')} required><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></Field>
      {form.status==='found'&&editingItem?.handoverStatus!=='received'&&<div className="found-guidance">
       <strong>Please hand the item in</strong>
       <p>Take it to a collection point: {collectionPoints.join(', ')}. Staff return items after verifying ownership.</p>
       <p>Your notice will show "Not yet at a collection point" until staff confirm they have it.</p>
      </div>}
      <Field name="title" label="Item title" required errors={errors}><input {...fieldProps('title')} required placeholder="e.g., Black backpack"/></Field>
      <Field name="category" label="Category" required errors={errors}><select {...fieldProps('category')} required><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></Field>
      <Field name="location" label={form.status==='found'?'Where you found it':form.status==='lost'?'Last known location':'Location'} errors={errors}><input {...fieldProps('location')} placeholder="Location (optional)"/></Field>
      <Field name="description" label="More details" errors={errors}><textarea rows="6" {...fieldProps('description')} placeholder="Describe your item (optional)"/></Field>
      {errorCount>0&&<div className="form-error" role="alert">Your report wasn't saved. Fix the {errorCount===1?'highlighted field':`${errorCount} highlighted fields`} and try again.</div>}
      <div className="form-actions"><button type="button" onClick={toBoard}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div>
     </form>
    </section>
   </div>
  </main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
