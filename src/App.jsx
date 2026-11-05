import React,{useEffect,useMemo,useState,useRef} from 'react';

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
function readView(){
 const p=new URLSearchParams(location.search);
 return {q:p.get('q')||'',cat:categories.includes(p.get('category'))?p.get('category'):'all',status:statuses.includes(p.get('status'))?p.get('status'):'all',report:p.get('report')||''};
}
export default function App(){
 const [items,setItems]=useState(getSaved);
 const [view,setView]=useState(readView);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const dialog=useRef(null), titleInput=useRef(null), opener=useRef(null);
 const current=view.report && view.report!=='new'?items.find(x=>x.id===view.report&&x.owner==='you'):null;
 const modal=!!view.report;
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 useEffect(()=>{const pop=()=>setView(readView());window.addEventListener('popstate',pop);return ()=>window.removeEventListener('popstate',pop)},[]);
 function navigate(next,replace=false,modalEntry=false){
  const url=new URL(location.href);
  for(const [key,value] of Object.entries({q:next.q,category:next.cat,status:next.status,report:next.report})){
   if(value&&value!=='all')url.searchParams.set(key,value);else url.searchParams.delete(key);
  }
  history[replace?'replaceState':'pushState']({campusModal:modalEntry},'',url);
  setView(next);
 }
 function close(){
  if(history.state?.campusModal)history.back();else navigate({...view,report:''},true);
 }
 useEffect(()=>{
  if(!modal)return;
  if(view.report!=='new'&&!current){setMessage('This report is unavailable or cannot be edited by you.');navigate({...view,report:''},true);return;}
  setForm(current?{title:current.title,category:current.category,status:current.status,location:current.location||'',description:current.description||''}:{...clean});
  setError('');
  const el=dialog.current;
  el.showModal();
  titleInput.current?.focus();
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  return ()=>{el.close();document.body.style.overflow=overflow;const target=opener.current; if(target?.isConnected)target.focus();else document.querySelector('.header .report-button')?.focus();};
 },[view.report]);
 function open(row,event){opener.current=event.currentTarget;navigate({...view,report:row?.id||'new'},false,true);}
 const matches=(x,status=true)=>(view.cat==='all'||x.category===view.cat)&&(!status||view.status==='all'||x.status===view.status)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(view.q.toLowerCase());
 const filtered=useMemo(()=>items.filter(x=>matches(x)),[items,view]);
 const counts=Object.fromEntries(['all',...statuses].map(status=>[status,items.filter(x=>matches(x,false)&&(status==='all'||x.status===status)).length]));
 function resetFilters(){navigate({...view,q:'',cat:'all',status:'all'});}
 const errorField=error.startsWith('Title')||error.startsWith('An item')?'title':error.includes('category')?'category':'status';
 function submit(e){
  e.preventDefault();const v=validate(form,items,current?.id);
  if(v){setError(v);const field=v.startsWith('Title')||v.startsWith('An item')?'title':v.includes('category')?'category':'status';document.getElementById('report-'+field)?.focus();return;}
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?current.emoji:'\u{1F4CC}',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
  if(current)setItems(items.map(x=>x.id===current.id?{...x,...d}:x));else setItems([{id:`f-${Date.now()}`,...d},...items]);
  // Update the board entry as well as the modal entry so Back closes onto the visible report.
  const hidden=!matches(d);
  if(hidden){
   const url=new URL(location.href);['q','category','status'].forEach(k=>url.searchParams.delete(k));
   history.replaceState(history.state,'',url);
   const onClose=()=>{const next={...readView(),q:'',cat:'all',status:'all',report:''};navigate(next,true);};
   if(history.state?.campusModal)window.addEventListener('popstate',onClose,{once:true});
  }
  setMessage(`${current?'Report updated.':'Your report has been posted.'}${hidden?' Filters reset to show your report.':''}`);
  if(hidden&&!history.state?.campusModal)navigate({q:'',cat:'all',status:'all',report:''},true);else close();
 }
 function reset(){setItems(seed);navigate({q:'',cat:'all',status:'all',report:''});setMessage('Example reports restored.');}
 return <div className="notice-app">
  <header className="header"><button className="wordmark" onClick={()=>navigate({q:'',cat:'all',status:'all',report:''})}>&#10042; FOUND<span>on campus</span></button><nav aria-label="Main navigation"><button className="nav-link" onClick={()=>navigate({...view,report:''})} aria-current="page">Noticeboard</button></nav><button className="report-button" onClick={e=>open(null,e)}>+ Post a report</button></header>
  <main className="workspace"><div className="introduction"><h1>Campus lost &amp; found</h1><p>Find your belongings or help someone find theirs.</p></div>
   <section className="filterbox" aria-label="Filter reports"><label>Search items<input type="search" value={view.q} onChange={e=>navigate({...view,q:e.target.value},true)} placeholder="Search title, location or details"/></label><label>Item category<select value={view.cat} onChange={e=>navigate({...view,cat:e.target.value})}>{categories.map(c=><option key={c} value={c}>{c==='all'?'All categories':cap(c)}</option>)}</select></label><button className="secondary" onClick={resetFilters}>Reset filters</button></section>
   <section aria-labelledby="reports-heading"><div className="board-top"><h2 id="reports-heading">Latest reports</h2><p role="status">{filtered.length} matching {filtered.length===1?'report':'reports'} of {items.length}</p></div>
    <div className="status-filters" role="group" aria-label="Report status (counts match search and category)">{['all',...statuses].map(s=><button key={s} aria-pressed={view.status===s} onClick={()=>navigate({...view,status:s})}>{cap(s)} <span>{counts[s]}</span></button>)}</div>
    {message&&<div className="message" role="status"><span>{message}</span><button aria-label="Dismiss message" onClick={()=>setMessage('')}>&times;</button></div>}
    <div className="board-grid">{filtered.map(item=><article className="sticky" key={item.id}><div className="sticky-top"><span>{cap(item.category)}</span><span className={'badge '+item.status}>{cap(item.status)}</span></div><div className="sticky-emoji" aria-hidden="true">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className="handover-note">{item.handoverStatus==='received'&&item.collectionPoint?`Received at ${item.collectionPoint}`:item.handoverStatus==='released'?'Collected by owner':'Reported found - not confirmed at a collection point'}</div>}<div className="sticky-bottom"><span>{item.location||'Location not provided'}</span><small>{item.created}</small></div>{item.owner==='you'?<button className="edit-button" onClick={e=>open(item,e)}>Edit your report<span className="sr-only">: {item.title}</span></button>:<small className="ownership">Reported by another student</small>}</article>)}</div>
    {!filtered.length&&<div className="empty-state"><h3>No reports match your filters</h3><p>Try a different search, category or status, or reset your filters to browse all reports.</p><button className="secondary" onClick={resetFilters}>Reset filters</button></div>}
   </section><div className="demo-controls"><span>Demo noticeboard</span><button className="reset" onClick={reset}>Reset demo data</button></div>
  </main>
  <dialog ref={dialog} className="report-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description" onCancel={e=>{e.preventDefault();close();}}><div className="dialog-heading"><h2 id="dialog-title">{current?'Edit your report':'Post a report'}</h2><button className="secondary" onClick={close} aria-label="Close report dialog">Close &times;</button></div><p id="dialog-description">Share details on the public noticeboard. Fields marked * are required.</p><form onSubmit={submit} noValidate>
   {['title','status','category','location','description'].map(field=>{const required=['title','status','category'].includes(field);const props={id:'report-'+field,value:form[field],onChange:e=>{setForm(s=>({...s,[field]:e.target.value}));setError('');},'aria-invalid':!!error&&errorField===field,'aria-describedby':error&&errorField===field?'form-error':undefined,required};return <label key={field} htmlFor={props.id}>{({title:'Item title',status:'Status',category:'Category',location:'Last known location (optional)',description:'More details (optional)'})[field]}{required?' *':''}{field==='description'?<textarea {...props} rows="4"/>:field==='status'||field==='category'?<select {...props}><option value="">Choose {field}</option>{(field==='status'?statuses:categories.slice(1)).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>:<input {...props} ref={field==='title'?titleInput:undefined} placeholder={field==='title'?'e.g., Black backpack':'Location (optional)'}/>}</label>})}
   {error&&<div id="form-error" className="form-error" role="alert">{error}</div>}<div className="form-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="report-button" type="submit">{current?'Save report':'Publish report'}</button></div></form></dialog>
  <footer className="pagefooter">FOUND / Campus noticeboard &middot; Community demo</footer>
 </div>;
}
