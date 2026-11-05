import React, {useEffect, useMemo, useRef, useState} from 'react';
import {categories, statuses, matchesSearch, validateReport, collectionInfo} from './report-utils.js';

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
const clean = {title:'', category:'', status:'', location:'', description:''};
const columns = [
  {key:'lost', title:'LOST', sub:'Searching for these things', icon:'↗'},
  {key:'found', title:'FOUND', sub:'Looking for the owners', icon:'⌁'},
  {key:'claimed', title:'CLAIMED', sub:'Back where they belong', icon:'✓'},
];
const cap = value => value.charAt(0).toUpperCase() + value.slice(1);
function getSaved() {
  try { const saved=JSON.parse(localStorage.getItem(STORE)); return Array.isArray(saved)?saved:seed; }
  catch { return seed; }
}
function CollectionDetails({item}) {
  const info=collectionInfo(item);
  return <div className={`collection-info ${info.kind}`}>
    <strong className="receipt-label">{info.label}</strong><span>{info.detail}</span>
    {info.guidance && <details><summary>{info.kind==='received'?'How to collect this item':'What happens next?'}</summary><p>{info.guidance}</p></details>}
  </div>;
}
export default function App() {
  const [items,setItems]=useState(getSaved);
  const [page,setPage]=useState('board');
  const [q,setQ]=useState('');
  const [cat,setCat]=useState('all');
  const [filterStatus,setFilterStatus]=useState('all');
  const [current,setCurrent]=useState(null);
  const [form,setForm]=useState(clean);
  const [errors,setErrors]=useState({});
  const [message,setMessage]=useState('');
  const [openMenu,setOpenMenu]=useState(null);
  const titleRef=useRef(null);
  const boardRef=useRef(null);
  const returnFocus=useRef(false);
  useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
  useEffect(()=>{
    if(page==='form') titleRef.current?.focus();
    else if(returnFocus.current) { boardRef.current?.focus(); returnFocus.current=false; }
  },[page]);
  const filtered=useMemo(()=>items.filter(item=>
    (cat==='all'||item.category===cat) && (filterStatus==='all'||item.status===filterStatus) && matchesSearch(item,q)),
  [items,q,cat,filterStatus]);
  const activeFilters=Boolean(q.trim()||cat!=='all'||filterStatus!=='all');
  function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
  function goBoard(status){
    if(status){clearFilters();setFilterStatus(status);}
    setOpenMenu(null);returnFocus.current=true;setPage('board');
  }
  function create(){setCurrent(null);setForm({...clean});setErrors({});setOpenMenu(null);setPage('form');}
  function edit(row){
    if(row.owner!=='you')return;
    setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location||'',description:row.description||''});
    setOpenMenu(null);setErrors({});setPage('form');
  }
  function change(field,value){
    setForm(previous=>({...previous,[field]:value}));
    // A location correction can resolve a duplicate-title error.
    setErrors(previous=>({...previous,[field]:undefined,...(field==='location'?{title:undefined}:{})}));
  }
  function submit(event){
    event.preventDefault();
    if(current&&!items.some(item=>item.id===current&&item.owner==='you'))return;
    const nextErrors=validateReport(form,items,current);setErrors(nextErrors);
    if(Object.keys(nextErrors).length){event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus();return;}
    const data={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),
      owner:'you',created:'Today',emoji:current?items.find(item=>item.id===current)?.emoji:'📌',
      ...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
    if(current){setItems(previous=>previous.map(item=>item.id===current?{...item,...data}:item));setMessage('Report updated.');}
    else{setItems(previous=>[{id:`f-${Date.now()}`,...data},...previous]);setMessage('Your report has been posted.');}
    clearFilters();goBoard();setCurrent(null);
  }
  function reset(){setItems(seed);clearFilters();goBoard();setMessage('Example reports restored.');}
  function fieldProps(name){return {id:name,name,value:form[name],onChange:event=>change(name,event.target.value),
    'aria-invalid':Boolean(errors[name]),'aria-describedby':errors[name]?`${name}-error`:undefined};}
  const errorCount=Object.values(errors).filter(Boolean).length;
  return <div className="notice-app">
    <header className="header">
      <div className="headline"><span className="sun" aria-hidden="true">✺</span><button onClick={()=>goBoard('all')} className="wordmark">FOUND<span>on campus</span></button></div>
      <nav className="header-links" aria-label="Noticeboard navigation">
        <button aria-current={page==='board'&&filterStatus==='all'?'page':undefined} onClick={()=>goBoard('all')}>Noticeboard</button>
        <button aria-current={page==='board'&&filterStatus==='lost'?'page':undefined} onClick={()=>goBoard('lost')}>Missing items</button>
        <button aria-current={page==='board'&&filterStatus==='found'?'page':undefined} onClick={()=>goBoard('found')}>Recently found</button>
      </nav><button className="report-button" onClick={create}>+ Post a report</button>
    </header>
    <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
    {page==='board'?<main className="workspace">
      <aside className="filters">
        <p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1>
        <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
        <div className="filterbox"><h3>Browse reports</h3>
          <label>Search items<input type="search" value={q} onChange={event=>setQ(event.target.value)} placeholder="e.g., library backpack" aria-describedby="search-hint"/></label>
          <p id="search-hint" className="filter-hint">Use item details or a location, in any order. Results update as you type.</p>
          <label>Item category<select value={cat} onChange={event=>setCat(event.target.value)}><option value="all">All categories</option>{categories.map(category=><option key={category} value={category}>{cap(category)}</option>)}</select></label>
          <label>Report status<select value={filterStatus} onChange={event=>setFilterStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map(status=><option key={status} value={status}>{cap(status)}</option>)}</select></label>
          <div className="filterbuttons"><button onClick={clearFilters} disabled={!activeFilters}>Clear filters</button></div>
        </div>
        <div className="side-message"><span aria-hidden="true">📍</span><strong>Found an item?</strong><p>Post a report, then hand the item to a designated campus collection point. A notice alone does not confirm staff receipt.</p><button onClick={create}>Share your report →</button></div>
        <button className="reset" onClick={reset}>Reset demo data</button>
      </aside>
      <section className="board" aria-labelledby="board-heading">
        <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2 id="board-heading" ref={boardRef} tabIndex={-1}>Latest notices <span>({filtered.length})</span></h2></div></div>
        <p className="results-summary" role="status">{filtered.length} {filtered.length===1?'report':'reports'}{q.trim()?` matching “${q.trim()}”`:''} · {cat==='all'?'All categories':cap(cat)} · {filterStatus==='all'?'All statuses':cap(filterStatus)}</p>
        {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss notification">✕</button></div>}
        {!filtered.length?<div className="empty-results"><h3>No matching reports</h3><p>Try fewer words or clear your filters to browse all reports.</p><button className="report-button" onClick={clearFilters}>Clear filters and show all reports</button></div>:
          <div className="board-grid">{columns.filter(column=>filterStatus==='all'||column.key===filterStatus).map(column=><section className="board-column" key={column.key} aria-label={`${cap(column.key)} reports`}>
            <div className="column-head"><span className={`col-icon ${column.key}`} aria-hidden="true">{column.icon}</span><div><strong>{column.title}</strong><small>{column.sub}</small></div><span className="col-count">{filtered.filter(item=>item.status===column.key).length}</span></div>
            <div className="sticky-list">{filtered.filter(item=>item.status===column.key).map(item=><article className="sticky" key={item.id}>
              <div className="sticky-top"><span>{item.category}</span><div className="menu-holder"><button className="menu" onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} aria-label={`Actions for ${item.title}`} aria-expanded={openMenu===item.id}>···</button>{openMenu===item.id&&<div className="menu-popup">{item.owner==='you'?<button onClick={()=>edit(item)}>Edit your report</button>:<span>Reported by another student</span>}</div>}</div></div>
              <div className="sticky-emoji" aria-hidden="true">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>
              {item.status!=='lost'&&<CollectionDetails item={item}/>}
              <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>
            </article>)}{filtered.every(item=>item.status!==column.key)&&<div className="empty-column">No {column.key} reports match these filters.</div>}</div>
          </section>)}</div>}
      </section>
    </main>:<main className="report-page">
      <div className="crumbs"><button onClick={()=>goBoard()}>← Noticeboard</button><span>/</span><span>{current?'Edit report':'Report an item'}</span></div>
      <div className="report-layout">
        <div className="report-intro"><span className="seal" aria-hidden="true">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
        <section className="form-paper">
          <header><p>{current?'UPDATE YOUR NOTICE':'NEW NOTICE / FORM 01'}</p><h2>{current?'Edit report':'Report an item'}</h2><p className="required-hint">Fields marked * are required.</p></header>
          <form noValidate onSubmit={submit}>
            {errorCount>0&&<div className="form-error" role="alert">Your report was not saved. Fix {errorCount===1?'the highlighted field':`the ${errorCount} highlighted fields`} below.</div>}
            <div className="form-field"><label htmlFor="title">Item title <b>*</b></label><input {...fieldProps('title')} ref={titleRef} required minLength={2} placeholder="e.g., Black backpack"/>{errors.title&&<p className="field-error" id="title-error">{errors.title}</p>}</div>
            <div className="form-field"><label htmlFor="status">Status <b>*</b></label><select {...fieldProps('status')} required><option value="">Choose one</option>{statuses.map(status=><option key={status} value={status}>{cap(status)}</option>)}</select>{errors.status&&<p className="field-error" id="status-error">{errors.status}</p>}</div>
            {form.status==='found'&&<div className="found-guidance"><strong>Found it? Hand it in after posting.</strong><p>Take the item to a designated campus collection point, such as the Campus Security Desk, Student Services Office or Library Reception. This report alone does not confirm staff receipt.</p></div>}
            <div className="form-field"><label htmlFor="category">Category <b>*</b></label><select {...fieldProps('category')} required><option value="">Select item category</option>{categories.map(category=><option key={category} value={category}>{cap(category)}</option>)}</select>{errors.category&&<p className="field-error" id="category-error">{errors.category}</p>}</div>
            <div className="form-field"><label htmlFor="location">Last known location <span>(optional)</span></label><input {...fieldProps('location')} placeholder="e.g., Library - second floor"/></div>
            <div className="form-field"><label htmlFor="description">More details <span>(optional)</span></label><textarea {...fieldProps('description')} rows={4} placeholder="Describe identifying details without sharing private information"/></div>
            <div className="form-actions"><button type="button" onClick={()=>goBoard()}>Go back</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div>
          </form>
        </section>
      </div>
    </main>}
    <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
  </div>;
}
