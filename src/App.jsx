import React,{useEffect,useMemo,useState} from 'react';
import {ArrowLeftIcon,BackpackIcon,BookOpenTextIcon,CalculatorIcon,CheckCircleIcon,CoatHangerIcon,CompassIcon,DeviceMobileIcon,DotsThreeIcon,DropIcon,EyeglassesIcon,FileTextIcon,HeadphonesIcon,HoodieIcon,IdentificationCardIcon,KeyIcon,LaptopIcon,MagnifyingGlassIcon,MapPinIcon,NotebookIcon,PackageIcon,ToteIcon,TShirtIcon,UmbrellaIcon,UsbIcon,WalletIcon,XIcon} from '@phosphor-icons/react';

const STORE='acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed=[
 {id:'f1',title:'Black backpack',category:'accessories',status:'lost',location:'Library - second floor',description:'Black backpack with a small red keychain. Left near the study desks.',owner:'you',created:'Oct 23'},
 {id:'f2',title:'Dark backpack',category:'accessories',status:'found',location:'Library - main stairwell',description:'Found a dark backpack with a small red keychain near the library stairs.',owner:'other',created:'Oct 24',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f3',title:'Student ID card',category:'documents',status:'found',location:'Near Gate 3',description:'A student card was turned in. No personal details are published.',owner:'other',created:'Oct 24',collectionPoint:'Student Services Office',handoverStatus:'received'},
 {id:'f4',title:'Wireless earbuds',category:'electronics',status:'lost',location:'Main cafeteria',description:'White earbuds in a distinctive blue case. Lost on Monday.',owner:'other',created:'Oct 24'},
 {id:'f5',title:'Earbuds in blue case',category:'electronics',status:'found',location:'Cafeteria entrance',description:'White earbuds in a blue charging case found near the coffee counter.',owner:'other',created:'Oct 25',collectionPoint:'',handoverStatus:'reported'},
 {id:'f6',title:'Blue sports bottle',category:'other',status:'lost',location:'Sports Hall - lockers',description:'Tall blue metal water bottle, possibly left after practice.',owner:'other',created:'Oct 25'},
 {id:'f7',title:'Metal water bottle',category:'other',status:'found',location:'Sports Hall - benches',description:'Blue reusable metal bottle found after a basketball session.',owner:'other',created:'Oct 25',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f8',title:'Engineering lab coat',category:'clothing',status:'claimed',location:'Building C',description:'Owner verified the item and collected it from the reception desk.',owner:'you',created:'Oct 22',collectionPoint:'Library Reception',handoverStatus:'released'},
 {id:'f9',title:'Small notebook',category:'other',status:'lost',location:'C7 lecture room',description:'Brown cover with handwritten engineering notes.',owner:'other',created:'Oct 25'},
 {id:'f10',title:'Scientific calculator',category:'electronics',status:'lost',location:'B2 lecture hall',description:'Black scientific calculator with a protective cover.',owner:'other',created:'Oct 26'},
 {id:'f11',title:'Calculator',category:'electronics',status:'found',location:'B2 study area',description:'Scientific calculator with a black cover, found on a desk.',owner:'you',created:'Oct 26',collectionPoint:'Library Reception',handoverStatus:'received'},
 {id:'f12',title:'Canvas tote bag',category:'accessories',status:'lost',location:'Main campus bus stop',description:'Beige tote with green writing on one side.',owner:'other',created:'Oct 26'},
 {id:'f13',title:'USB flash drive',category:'electronics',status:'found',location:'Building A computer lab',description:'A small black flash drive was found beside a workstation.',owner:'other',created:'Oct 27',collectionPoint:'',handoverStatus:'reported'},
];
const categories=['all','electronics','clothing','documents','accessories','other'];
const statuses=['lost','found','claimed'];
const clean={title:'',category:'',status:'',location:'',description:''};
const sections=[{key:'lost',title:'LOST',sub:'Searching for these things',icon:MagnifyingGlassIcon},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:PackageIcon},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:CheckCircleIcon}];
// Icons come from the report itself, so reports already saved in this browser get them too.
const titleIcons=[[/backpack|rucksack/i,BackpackIcon],[/\bid\b|\bcard\b/i,IdentificationCardIcon],[/earbud|headphone|airpod/i,HeadphonesIcon],[/bottle|flask/i,DropIcon],[/coat|jacket/i,CoatHangerIcon],[/hoodie|sweater/i,HoodieIcon],[/shirt/i,TShirtIcon],[/notebook/i,NotebookIcon],[/\bbook\b/i,BookOpenTextIcon],[/calculator/i,CalculatorIcon],[/\bbag\b|\btote\b|purse/i,ToteIcon],[/usb|flash drive/i,UsbIcon],[/\bkeys?\b/i,KeyIcon],[/\bphone\b|iphone/i,DeviceMobileIcon],[/laptop/i,LaptopIcon],[/wallet/i,WalletIcon],[/glasses/i,EyeglassesIcon],[/umbrella/i,UmbrellaIcon]];
const categoryIcons={electronics:DeviceMobileIcon,clothing:TShirtIcon,documents:FileTextIcon,accessories:ToteIcon,other:PackageIcon};
function ItemIcon({item}){const Icon=titleIcons.find(([pattern])=>pattern.test(item.title))?.[1]||categoryIcons[item.category]||PackageIcon;return <Icon size={32} weight="duotone"/>;}
const views={
 board:{name:'Noticeboard'},
 missing:{name:'Missing items',status:'lost'},
 found:{name:'Recently found',status:'found'},
};
// Report dates are stored as display text such as "Oct 24" or "Today".
const when=s=>s==='Today'?Infinity:Date.parse(`${s} 2000`);
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
 const [back,setBack]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [openMenu,setOpenMenu]=useState(null);
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 useEffect(()=>{window.scrollTo(0,0);},[page]);
 const pageStatus=views[page]?.status;
 const filtered=useMemo(()=>{const status=pageStatus||filterStatus;const rows=items.filter(x=>(cat==='all'||x.category===cat)&&(status==='all'||x.status===status)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase()));return pageStatus?[...rows].sort((a,b)=>when(b.created)-when(a.created)||0):rows;},[items,q,cat,filterStatus,pageStatus]);
 const filtering=Boolean(q)||cat!=='all'||filterStatus!=='all';
 const shownSections=sections.filter(s=>pageStatus?s.key===pageStatus:!filtering||filtered.some(r=>r.status===s.key));
 function go(next){setPage(next);setFilterStatus('all');setOpenMenu(null);setMessage('');}
 function create(){if(page!=='form')setBack(page);setCurrent(null);setForm({...clean});setError('');setPage('form');}
 function edit(row){if(row.owner!=='you')return;setBack(page);setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});setOpenMenu(null);setError('');setPage('form');}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){setError('Please review your entries.');return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.');}setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');setQ('');setCat('all');setFilterStatus('all');setMessage('Example reports restored.');window.scrollTo(0,0);}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun"><CompassIcon size={36} weight="duotone"/></span><button onClick={()=>go('board')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><div className="header-links">{Object.entries(views).map(([key,view])=><button key={key} aria-current={page===key?'page':undefined} onClick={()=>go(key)}>{view.name}</button>)}</div><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page!=='form'?<main className="workspace">{!pageStatus&&<section className="intro-banner"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something? <em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p></section>}
   <section className="board">{pageStatus?<h1 className="page-title">{views[page].name} <span>({filtered.length})</span></h1>:<div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>}<div className={'filterbox'+(pageStatus?' no-status':'')} role="search" aria-label="Browse reports"><label>Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>{!pageStatus&&<label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>}<div className="filterbuttons"><button onClick={()=>setMessage(`${filtered.length} reports shown.`)}>Apply</button><button onClick={()=>{setQ('');setCat('all');setFilterStatus('all')}}>Clear</button></div></div>{message&&<div className="message" role="status">{message}<button aria-label="Dismiss message" onClick={()=>setMessage('')}><XIcon size={14} weight="bold"/></button></div>}
    <div className="board-grid">{filtering&&!filtered.length?<div className="empty-column">No reports match your search.</div>:shownSections.map(col=><div className="board-column" key={col.key}>{!pageStatus&&<div className="column-head"><span className={'col-icon '+col.key}><col.icon size={17} weight="duotone"/></span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div>}<div className="sticky-list">{filtered.filter(r=>r.status===col.key).map((item,i)=><article className="sticky" key={item.id}><div className="sticky-top"><span>{item.category}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`}><DotsThreeIcon size={20} weight="bold"/></button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?<button onClick={()=>edit(item)}>Edit your report</button>:<span>Reported by another student</span>}</div>}</div></div><div className={'sticky-icon '+item.category}><ItemIcon item={item}/></div><div className="sticky-body"><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className="handover-note">{item.handoverStatus==='received'&&item.collectionPoint?`Received at ${item.collectionPoint}`:item.handoverStatus==='released'?'Collected by owner':'Reported found - not confirmed at a collection point'}</div>}</div><div className="sticky-bottom"><span><MapPinIcon size={12} weight="duotone"/>{item.location||'Location not provided'}</span><small>{item.created}</small></div></article>)}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">Nothing here yet</div>}</div></div>)}</div>
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>setPage(back)}><ArrowLeftIcon size={12} weight="bold"/>{views[back].name}</button><span>/</span><span>Report an item</span></div><div className="report-layout"><div className="report-intro"><span className="seal"><CompassIcon size={52} weight="duotone"/></span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>NEW NOTICE / FORM 01</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit}><label><span>Item title <b>*</b></span><input value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/></label><label><span>Status <b>*</b></span><select value={form.status} onChange={e=>setForm(s=>({...s,status:e.target.value}))}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><label><span>Category <b>*</b></span><select value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s}>{s}</option>)}</select></label><label>Last known location<input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="Location (optional)"/></label><label>More details<textarea rows="6" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder="Describe your item"/></label>{error&&<div className="form-error" role="alert">{error}</div>}<div className="form-actions"><button type="button" onClick={()=>setPage(back)}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only{page!=='form'&&<button className="reset" onClick={reset}>Reset demo data</button>}</span></footer>
 </div>;
}
