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
const requiredFields=['title','status','category'];
const stopWords=['a','an','and','at','by','found','in','it','lost','my','of','on','or','the','with'];
const relatedWords=[['bag','backpack','rucksack','tote','handbag'],['earbuds','earphones','headphones'],['bottle','flask'],['coat','jacket'],['notebook','notes']];
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function validate(f,arr,id){
 const e={};
 if(!f.title.trim()||f.title.trim().length<2)e.title='Title must be at least 2 characters.';
 else if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))e.title='An item with the same title has already been reported at this location. If this is a different item, change the title or location.';
 if(!statuses.includes(f.status))e.status='Choose lost, found or claimed.';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category.';
 return e;
}
function searchTerms(q){const words=q.toLowerCase().split(/\s+/).filter(Boolean),useful=words.filter(w=>!stopWords.includes(w));return useful.length?useful:words;}
function termForms(t){const forms=t.length>3?[t,t.replace(/s$/,'')]:[t];return relatedWords.find(g=>forms.some(f=>g.includes(f)))||forms;}
function matchCount(x,terms){const text=`${x.title} ${x.location} ${x.description}`.toLowerCase();return terms.filter(t=>termForms(t).some(w=>text.includes(w))).length;}
// Only received items are shown as held; a found report alone is never treated as confirmed by staff.
function handover(item){
 if(item.handoverStatus==='released')return {tone:'done',text:'Collected by owner'};
 if(item.handoverStatus==='received'&&item.collectionPoint)return item.status==='found'?{tone:'held',text:`Held at ${item.collectionPoint}`,hint:'Bring proof of ownership. Staff verify it before release.'}:{tone:'done',text:`Received at ${item.collectionPoint}`};
 if(item.status!=='found')return {tone:'pending',text:'Not confirmed at a collection point'};
 return {tone:'pending',text:'Not yet at a collection point',hint:item.owner==='you'?'Please hand it in at a collection point.':'Reported by a student, not confirmed as held by staff.'};
}
const FieldError=({text})=>text?<span className="field-error">{text}</span>:null;
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
 const [posted,setPosted]=useState(null);
 const [openMenu,setOpenMenu]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 // Land the saved card just below the sticky message so neither covers the other.
 useEffect(()=>{const card=posted&&document.getElementById(posted);if(card)window.scrollTo(0,card.getBoundingClientRect().top+window.scrollY-(document.querySelector('.message')?.offsetHeight||0)-32);},[posted]);
 const terms=useMemo(()=>searchTerms(q),[q]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&(!terms.length||matchCount(x,terms)>0)).sort((a,b)=>matchCount(b,terms)-matchCount(a,terms)),[items,terms,cat,filterStatus]);
 const partialMatch=terms.length>1&&filtered.length>0&&!filtered.some(x=>matchCount(x,terms)===terms.length);
 const filtersActive=q.trim()||cat!=='all'||filterStatus!=='all';
 const errors=attempted?validate(form,items,current):{};
 const postedItem=items.find(x=>x.id===posted);
 function setField(key,value){setForm(s=>({...s,[key]:value}));}
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 function clearNotice(){setMessage('');setPosted(null);}
 function showBoard(){setFilterStatus('all');setPage('board');}
 function create(){setCurrent(null);setForm({...clean});setAttempted(false);clearNotice();setPage('form');}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setOpenMenu(null);setAttempted(false);clearNotice();setPage('form');}
 function submit(e){e.preventDefault();const invalid=requiredFields.find(k=>validate(form,items,current)[k]);if(invalid){setAttempted(true);document.getElementById(`field-${invalid}`).focus();return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 const id=current||`f-${Date.now()}`;if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id,...d},...items]);setMessage('Your report has been posted.');}clearFilters();setPosted(id);setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');clearFilters();setPosted(null);setMessage('Example reports restored.');}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={showBoard} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><div className="header-links"><button onClick={showBoard}>Noticeboard</button><button onClick={()=>{setFilterStatus('lost');setPage('board')}}>Missing items</button><button onClick={()=>{setFilterStatus('found');setPage('board')}}>Recently found</button></div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox"><h3>Browse reports</h3><label>Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></label><div className="filterbuttons"><button onClick={()=>setMessage(`${filtered.length} reports shown.`)}>Apply</button><button onClick={clearFilters}>Clear</button></div></div><div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>{message&&<div className="message" role="status"><div>{message}{postedItem?.status==='found'&&handover(postedItem).tone==='pending'&&<div className="next-step"><strong>Next step: hand the item in at a collection point</strong><ul>{collectionPoints.map(p=><li key={p}>{p}</li>)}</ul><small>Until staff receive it, your notice will show "Not yet at a collection point".</small></div>}</div><button onClick={clearNotice} aria-label="Dismiss message">✕</button></div>}
    {partialMatch&&<p className="search-note">No report contains all your words, so these match some of them. Closest matches come first.</p>}
    {filtered.length===0?<div className="no-results"><h3>{q.trim()?`No reports match "${q.trim()}"`:'No reports match these filters'}</h3><p>Your item may still have been reported. Try a different word, such as the item's type or color, or remove a filter.</p><div className="filterbuttons"><button onClick={clearFilters}>Clear search and filters</button><button onClick={create}>Post a report</button></div></div>:<div className="board-grid">{[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].map(col=><div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div><div className="sticky-list">{filtered.filter(r=>r.status===col.key).map((item,i)=><article className={'sticky'+(posted===item.id?' just-saved':'')} id={item.id} key={item.id}>{posted===item.id&&<span className="saved-tag">Just saved</span>}<div className="sticky-top"><span>{item.category}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`}>···</button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?<button onClick={()=>edit(item)}>Edit your report</button>:<span>Reported by another student</span>}</div>}</div></div><div className="sticky-emoji">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className={'handover-note '+handover(item).tone}><strong>{handover(item).text}</strong>{handover(item).hint&&<span>{handover(item).hint}</span>}</div>}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div></article>)}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">{filtersActive?'No matches here':'Nothing here yet'}</div>}</div></div>)}</div>}
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit}><label><span>Item title <b>*</b></span><input id="field-title" aria-invalid={!!errors.title} value={form.title} onChange={e=>setField('title',e.target.value)} placeholder="e.g., Black backpack"/><FieldError text={errors.title}/></label><label><span>Status <b>*</b></span><select id="field-status" aria-invalid={!!errors.status} value={form.status} onChange={e=>setField('status',e.target.value)}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select><FieldError text={errors.status}/></label><label><span>Category <b>*</b></span><select id="field-category" aria-invalid={!!errors.category} value={form.category} onChange={e=>setField('category',e.target.value)}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s}>{s}</option>)}</select><FieldError text={errors.category}/></label><label>Last known location<input value={form.location} onChange={e=>setField('location',e.target.value)} placeholder="Location (optional)"/></label><label>More details<textarea rows="6" value={form.description} onChange={e=>setField('description',e.target.value)} placeholder="Describe your item"/></label><div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
