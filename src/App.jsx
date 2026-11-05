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
// The fictional collection points used in the example data.
const COLLECTION_POINTS=['Campus Security Desk','Student Services Office','Library Reception'];
const STATUS_OPTIONS=[
 {value:'lost',label:'I lost something',hint:'Ask the community to look out for it'},
 {value:'found',label:'I found something',hint:'Help the owner get it back'},
 {value:'claimed',label:'Claimed',hint:'The item is back with its owner'},
];
const COLUMNS=[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}];

function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const plural=(n,w)=>`${n} ${w}${n===1?'':'es'}`;

function findDuplicate(f,arr,id){
 return arr.find(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase());
}
// Same rules as the original lab, but every problem is reported against the field it belongs to
// instead of being replaced by one generic "Please review your entries." message.
function validate(f,arr,id){
 const e={};
 if(!f.title.trim()||f.title.trim().length<2)e.title='Title must be at least 2 characters.';
 if(!statuses.includes(f.status))e.status='Choose lost, found or claimed.';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category.';
 if(!e.title){const dup=findDuplicate(f,arr,id);if(dup){e.title='An item with the same title has already been reported at this location.';e.location='Change the title or location if this is a different item.';e.duplicate=dup;}}
 return e;
}

// Lightweight "could this be my item?" matching between a lost report and found reports.
const STOP=new Set(['with','near','from','found','lost','left','small','possibly','after','that','this','your','have','item','the','and','for','was','were','one','side','some','very','its']);
const words=s=>new Set(((s||'').toLowerCase().match(/[a-z]+/g)||[]).filter(w=>w.length>=3&&!STOP.has(w)));
function matchScore(lost,found){
 if(lost.category&&lost.category!==found.category)return 0;
 const lt=words(lost.title),ft=words(found.title);
 const la=words(`${lost.title} ${lost.description}`),fa=words(`${found.title} ${found.description}`);
 const titleHits=[...lt].filter(w=>fa.has(w)).length+[...ft].filter(w=>la.has(w)).length;
 const allHits=[...la].filter(w=>fa.has(w)).length;
 return titleHits>0||allHits>=3?titleHits*2+allHits:0;
}
function possibleMatches(lost,arr){
 return arr.filter(x=>x.status==='found'&&x.id!==lost.id).map(x=>[x,matchScore(lost,x)]).filter(([,s])=>s>0).sort((a,b)=>b[1]-a[1]).map(([x])=>x);
}

function Handover({item}){
 if(item.status==='lost')return null;
 if(item.status==='claimed')return <div className="handover done"><strong>✓ Back with its owner</strong>{item.handoverStatus==='released'&&item.collectionPoint&&<span>Collected from {item.collectionPoint}</span>}</div>;
 if(item.handoverStatus==='received'&&item.collectionPoint)return <div className="handover held"><strong>● Held at {item.collectionPoint}</strong><span>Yours? Bring your student ID and describe the item to collect it.</span></div>;
 return <div className="handover pending"><strong>◌ Not yet at a collection point</strong><span>Reported by the finder only. Staff haven't confirmed receiving it.</span></div>;
}

function MatchList({items}){
 return <ul className="match-list">{items.map(m=><li key={m.id}><span className="match-emoji">{m.emoji}</span><div><strong>{m.title}</strong><small>{m.location||'Location not provided'} · {m.created}</small><Handover item={m}/></div></li>)}</ul>;
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [mine,setMine]=useState(false);
 const [matchFor,setMatchFor]=useState(null);
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [errors,setErrors]=useState({});
 const [attempted,setAttempted]=useState(false);
 const [message,setMessage]=useState('');
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);

 const matchesById=useMemo(()=>Object.fromEntries(items.filter(x=>x.status==='lost').map(x=>[x.id,possibleMatches(x,items)])),[items]);
 const matchSource=matchFor&&items.find(x=>x.id===matchFor);
 const filtered=useMemo(()=>{
  if(matchSource)return [matchSource,...(matchesById[matchSource.id]||[])];
  return items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&(!mine||x.owner==='you')&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase()));
 },[items,q,cat,filterStatus,mine,matchSource,matchesById]);
 const filtersActive=q!==''||cat!=='all'||filterStatus!=='all'||mine;
 const columns=matchSource||filterStatus==='all'?COLUMNS:COLUMNS.filter(c=>c.key===filterStatus);

 // Live re-validation once the user has tried to submit, so errors disappear as soon as they are fixed.
 const formMatches=useMemo(()=>form.status==='lost'&&form.title.trim().length>=2?possibleMatches({...form,id:current},items).slice(0,3):[],[form,items,current]);
 function updateForm(field,value){
  const next={...form,[field]:value};
  setForm(next);
  if(attempted)setErrors(validate(next,items,current));
 }
 function showBoard(opts={}){
  setPage('board');setMatchFor(null);
  if(opts.status!==undefined)setFilterStatus(opts.status);
  if(opts.mine!==undefined)setMine(opts.mine);
 }
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');setMine(false);setMatchFor(null);}
 function startForm(){setErrors({});setAttempted(false);setPage('form');window.scrollTo(0,0);}
 function create(){setCurrent(null);setForm({...clean});startForm();}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});startForm();}
 function submit(e){
  e.preventDefault();
  const v=validate(form,items,current);
  setAttempted(true);setErrors(v);
  if(Object.keys(v).length){
   const first=['status','title','category','location'].find(k=>v[k]);
   if(first)setTimeout(()=>document.getElementById(`f-${first}`)?.focus(),0);
   return;
  }
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
  if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}
  else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage(d.status==='found'?'Your report has been posted. Next step: hand the item in at a collection point so the owner can collect it.':'Your report has been posted.');}
  setPage('board');setCurrent(null);setMatchFor(null);
 }
 function viewExisting(dup){clearFilters();setQ(dup.title);setPage('board');}
 function reset(){setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');}

 const navActive=k=>page==='board'&&!matchSource&&(k==='all'?filterStatus==='all'&&!mine:k==='mine'?mine:filterStatus===k&&!mine);
 const fieldProps=k=>({id:`f-${k}`,'aria-invalid':errors[k]?true:undefined,'aria-describedby':errors[k]?`e-${k}`:undefined});
 const FieldError=({k})=>errors[k]?<span className="field-error" id={`e-${k}`}>{errors[k]}</span>:null;
 const errorCount=['status','title','category'].filter(k=>errors[k]).length;
 const dup=errors.duplicate;
 const locationLabel=form.status==='lost'?'Where did you last have it?':form.status==='found'?'Where did you find it?':'Location';

 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>showBoard()} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div>
  <nav className="header-links" aria-label="Board views">
   <button aria-current={navActive('all')?'page':undefined} onClick={()=>showBoard({status:'all',mine:false})}>Noticeboard</button>
   <button aria-current={navActive('lost')?'page':undefined} onClick={()=>showBoard({status:'lost',mine:false})}>Missing items</button>
   <button aria-current={navActive('found')?'page':undefined} onClick={()=>showBoard({status:'found',mine:false})}>Recently found</button>
   <button aria-current={navActive('mine')?'page':undefined} onClick={()=>showBoard({status:'all',mine:true})}>My reports</button>
  </nav><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
   <div className="filterbox"><h3>Browse reports</h3>
    <label>Search items<input type="search" value={q} onChange={e=>{setQ(e.target.value);setMatchFor(null);}} placeholder="e.g. backpack, calculator"/></label>
    <label>Item category<select value={cat} onChange={e=>{setCat(e.target.value);setMatchFor(null);}}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
    <label>Report status<select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setMatchFor(null);}}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
    <label className="check"><input type="checkbox" checked={mine} onChange={e=>{setMine(e.target.checked);setMatchFor(null);}}/>Only my reports</label>
    <div className="filterbuttons"><p className="result-count" aria-live="polite">Showing <b>{filtered.length}</b> of {items.length} reports</p><button onClick={clearFilters} disabled={!filtersActive&&!matchSource}>Clear filters</button></div>
   </div>
   <div className="side-message"><span>📍</span><strong>How getting items back works</strong>
    <ol><li><b>Lost it?</b> Search the Found column, or open “possible matches” on your lost report.</li><li><b>Marked “Held at…”?</b> Go to that collection point with your student ID. Staff release it once you prove it's yours.</li><li><b>Found something?</b> Post it, then hand it in at a collection point.</li></ol>
    <p className="points">Collection points: {COLLECTION_POINTS.join(' · ')}</p>
    <button onClick={create}>Report an item →</button></div>
   <button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>{matchSource?'Possible matches':mine?'My reports':'Latest notices'} <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>
    {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    {matchSource&&<div className="match-banner" role="status"><div><strong>Found reports that might be your “{matchSource.title}”</strong><p>Compare the descriptions. If one is yours and it's held at a collection point, go there with your student ID to collect it.</p></div><button onClick={()=>setMatchFor(null)}>Back to all notices</button></div>}
    <div className={'board-grid'+(columns.length===1?' single':'')}>{columns.map(col=>{const list=filtered.filter(r=>r.status===col.key);return <div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{list.length}</span></div><div className="sticky-list">{list.map(item=>{const own=item.owner==='you';const m=item.status==='lost'?matchesById[item.id]||[]:[];return <article className={'sticky s-'+item.status+(own?' mine':'')} key={item.id}>
      <div className="sticky-top"><span>{item.category}</span>{own&&<span className="mine-tag">Your report</span>}</div>
      <div className="sticky-emoji">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>
      <Handover item={item}/>
      {m.length>0&&!matchSource&&<button className="match-link" onClick={()=>{setMatchFor(item.id);window.scrollTo(0,0);}}>🔎 {plural(m.length,'possible match')} in Found</button>}
      <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>
      {own&&<button className="edit-button" onClick={()=>edit(item)} aria-label={`Edit your report: ${item.title}`}>✎ Edit report</button>}
     </article>;})}{list.length===0&&<div className="empty-column">{filtersActive?<>No {col.key} reports match these filters.<button onClick={clearFilters}>Clear filters</button></>:'Nothing here yet'}</div>}</div></div>;})}</div>
   </section></main>
  :<main className="report-page"><div className="crumbs"><button onClick={()=>showBoard()}>← Noticeboard</button><span>/</span><span>{current?'Edit your report':'Report an item'}</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide. Don't include ID numbers or other personal details; owners prove ownership in person at the collection point.</div></div>
   <section className="form-paper"><header><p>{current?'EDIT NOTICE':'NEW NOTICE'} / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header>
    <form onSubmit={submit} noValidate>
     {errorCount>0&&<div className="form-error" role="alert"><strong>{errorCount===1?'1 field needs attention':`${errorCount} fields need attention`} before you can publish:</strong><ul>{['status','title','category'].filter(k=>errors[k]).map(k=><li key={k}><a href={`#f-${k}`} onClick={e=>{e.preventDefault();document.getElementById(`f-${k}`)?.focus();}}>{errors[k]}</a></li>)}</ul></div>}
     <fieldset className={'status-group'+(errors.status?' invalid':'')} aria-describedby={errors.status?'e-status':undefined}><legend>What happened? <b>*</b></legend>
      <div className="status-options">{STATUS_OPTIONS.map((o,i)=><label key={o.value} className={'status-option'+(form.status===o.value?' selected':'')}><input type="radio" name="status" value={o.value} id={i===0?'f-status':undefined} checked={form.status===o.value} onChange={e=>updateForm('status',e.target.value)}/><span><strong>{o.label}</strong><small>{o.hint}</small></span></label>)}</div>
      <FieldError k="status"/></fieldset>
     <label><span className="label-text">Item title <b>*</b></span><input {...fieldProps('title')} value={form.title} onChange={e=>updateForm('title',e.target.value)} placeholder="e.g., Black backpack"/><FieldError k="title"/></label>
     {dup&&<div className="dup-help">Already on the board: <strong>{dup.title}</strong> ({dup.status}) at {dup.location||'no location'}.{' '}{dup.owner==='you'?<button type="button" onClick={()=>edit(dup)}>Edit that report instead</button>:<button type="button" onClick={()=>viewExisting(dup)}>View the existing report</button>}</div>}
     <label><span className="label-text">Category <b>*</b></span><select {...fieldProps('category')} value={form.category} onChange={e=>updateForm('category',e.target.value)}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select><FieldError k="category"/></label>
     <label><span className="label-text">{locationLabel} <small className="optional">optional</small></span><input {...fieldProps('location')} value={form.location} onChange={e=>updateForm('location',e.target.value)} placeholder="e.g., Library - second floor"/><FieldError k="location"/></label>
     <label><span className="label-text">More details <small className="optional">optional</small></span><textarea rows="5" value={form.description} onChange={e=>updateForm('description',e.target.value)} placeholder={form.status==='found'?'Describe it so the owner can recognise it, but keep one detail back for verification':'Colour, brand, stickers, what was inside…'}/></label>
     {form.status==='found'&&!current&&<div className="guide found-guide"><strong>After you post: hand the item in</strong><p>Take it to a collection point: {COLLECTION_POINTS.join(', ')}. Until staff confirm they have it, your notice shows as “Not yet at a collection point”.</p></div>}
     {formMatches.length>0&&<div className="guide match-guide"><strong>Before you post: these found items might be yours</strong><MatchList items={formMatches}/><p>You can still publish your lost report so finders can contact you.</p></div>}
     <div className="form-actions"><button type="button" onClick={()=>showBoard()}>Cancel</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div>
    </form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
