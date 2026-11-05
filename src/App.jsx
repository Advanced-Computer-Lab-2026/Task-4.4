import React,{useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {byNewest,cap,categories,custody,findMatches,matchesQuery,nextStep,similarReports,statuses,validate} from './reportLogic.js';

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
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}

// The designated points are the ones named in the example records. The demo has no
// separate list of them, and no opening hours or addresses are invented here.
const collectionPoints=[...new Set(seed.map(r=>r.collectionPoint).filter(Boolean))];
const pointsText=collectionPoints.join(', ').replace(/, ([^,]*)$/,' or $1');

const STATUS_META={
  lost:{label:'Lost',icon:'help'},
  found:{label:'Found',icon:'box'},
  claimed:{label:'Claimed',icon:'check'},
};

const FORM_COPY={
  '':{location:'Location',description:'Description',placeholder:'Colour, brand or anything distinctive',submit:'Post report'},
  lost:{location:'Where did you last have it?',description:'What does it look like?',placeholder:'Colour, brand, stickers, what was inside',submit:'Post lost report'},
  found:{location:'Where did you find it?',description:'What did you find?',placeholder:'Colour, type and where it was left',submit:'Post found report'},
  claimed:{location:'Location',description:'Description',placeholder:'What the item is and how it was claimed',submit:'Post claimed report'},
};

const STATUS_CHOICES=[
  {value:'lost',title:'I lost this item',hint:'Ask the campus to look out for it'},
  {value:'found',title:'I found this item',hint:'Help it get back to its owner'},
  {value:'claimed',title:'It has been claimed',hint:'It is already back with its owner'},
];

const ICONS={
  search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  pin:<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  help:<><circle cx="12" cy="12" r="9"/><path d="M9.2 9.2a3 3 0 0 1 5.7 1c0 2-2.9 2.8-2.9 2.8"/><path d="M12 17h.01"/></>,
  box:<><path d="m21 8-9-5-9 5v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/></>,
  check:<path d="M20 6 9 17l-5-5"/>,
  building:<><path d="M4 21V9l8-6 8 6v12"/><path d="M9 21v-6h6v6"/></>,
  alert:<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
  plus:<path d="M12 5v14M5 12h14"/>,
  edit:<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
  close:<path d="M18 6 6 18M6 6l12 12"/>,
  arrow:<path d="M19 12H5m7 7-7-7 7-7"/>,
  compare:<><path d="m8 3-4 4 4 4"/><path d="M4 7h16"/><path d="m16 13 4 4-4 4"/><path d="M20 17H4"/></>,
  calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4"/></>,
  user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
};

function Icon({name}){
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{ICONS[name]}</svg>;
}

function StatusPill({status}){
  const meta=STATUS_META[status]||{label:cap(status),icon:'help'};
  return <span className={`pill pill-${status}`}><Icon name={meta.icon}/>{meta.label}</span>;
}

function Custody({report}){
  const c=custody(report);
  if(!c)return null;
  return <div className={`custody custody-${c.tone}`}>
    <Icon name={c.icon}/>
    <div><strong>{c.label}</strong>{c.detail&&<span>{c.detail}</span>}</div>
  </div>;
}

function ReportDetails({report}){
  return <>
    <div className="report-heading">
      <span className="report-emoji" aria-hidden="true">{report.emoji}</span>
      <div>
        <h3>{report.title}</h3>
        <span className="report-category">{cap(report.category)}</span>
      </div>
    </div>
    <p className="report-description">{report.description||'No additional description.'}</p>
    <ul className="report-meta">
      <li><Icon name="pin"/>{report.location||'Location not provided'}</li>
      <li><Icon name="calendar"/>Reported {report.created}</li>
      {report.owner!=='you'&&<li><Icon name="user"/>Reported by another student</li>}
    </ul>
    <Custody report={report}/>
  </>;
}

function ReportCard({report,matches,isNew,onCompare,onEdit}){
  const mine=report.owner==='you';
  const count=matches.length;
  return <article className={`report-card report-${report.status}${isNew?' is-new':''}`} id={`report-${report.id}`}>
    <div className="report-top">
      <StatusPill status={report.status}/>
      {isNew?<span className="tag tag-new">Just saved</span>:mine&&<span className="tag">Your report</span>}
    </div>
    <ReportDetails report={report}/>
    {(count>0||mine)&&<div className="report-actions">
      {count>0&&<button className="btn btn-soft btn-small" onClick={()=>onCompare(report)} aria-label={`Compare ${count} possible ${count===1?'match':'matches'} for ${report.title}`}><Icon name="compare"/>{count} possible {count===1?'match':'matches'}</button>}
      {mine&&<button className="btn btn-ghost btn-small" onClick={()=>onEdit(report)} aria-label={`Edit your report: ${report.title}`}><Icon name="edit"/>Edit</button>}
    </div>}
  </article>;
}

function CompareDialog({report,matches,onClose}){
  const ref=useRef(null);
  useLayoutEffect(()=>{
    const dialog=ref.current;
    dialog.showModal();
    return ()=>dialog.close();
  },[]);
  const word=matches.length===1?'match':'matches';
  return <dialog ref={ref} className="compare" aria-labelledby="compare-title" onClose={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}>
    <div className="compare-inner">
      <header className="compare-head">
        <div>
          <h2 id="compare-title">Possible {word} for {report.title}</h2>
          <p>Suggested from details the reports share. This is not confirmation that it is the same item.</p>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close comparison"><Icon name="close"/></button>
      </header>
      {matches.map(m=>{
        const found=report.status==='found'?report:m.report;
        return <section className="compare-match" key={m.report.id}>
          <div className="compare-grid">
            {[report,m.report].map(r=><div className={`compare-panel report-${r.status}`} key={r.id}>
              <div className="report-top"><StatusPill status={r.status}/>{r.owner==='you'&&<span className="tag">Your report</span>}</div>
              <ReportDetails report={r}/>
            </div>)}
          </div>
          <p className="shared"><strong>Shared details:</strong>{m.shared.map(w=><span className="chip" key={w}>{w}</span>)}</p>
          <div className="next-step"><strong>Next step</strong><p>{nextStep(found)}</p></div>
        </section>;
      })}
    </div>
  </dialog>;
}

function HowItWorks(){
  return <section className="how" aria-labelledby="how-title">
    <h2 id="how-title">How a found item gets back to its owner</h2>
    <ol className="how-steps">
      <li><span className="custody custody-reported"><Icon name="alert"/><strong>Reported</strong></span><p>A student posts a report. The item may still be with them.</p></li>
      <li><span className="custody custody-received"><Icon name="building"/><strong>Received</strong></span><p>It is handed in at a collection point, and the report shows which one.</p></li>
      <li><span className="custody custody-released"><Icon name="check"/><strong>Collected</strong></span><p>The owner verifies ownership at the collection point and takes it home.</p></li>
    </ol>
    <p className="how-points"><strong>Collection points:</strong> {collectionPoints.join(' · ')}</p>
  </section>;
}

function Field({id,label,required,optional,hint,error,action,children}){
  return <div className={`field${error?' has-error':''}`}>
    <label htmlFor={id}>{label}{required&&<span className="req" aria-hidden="true"> *</span>}{optional&&<span className="opt"> (optional)</span>}</label>
    {hint&&<p className="hint" id={`${id}-hint`}>{hint}</p>}
    {children}
    {error&&<p className="field-error" id={`${id}-error`}><Icon name="alert"/><span>{error}{action}</span></p>}
  </div>;
}

const describedBy=(id,hint,error)=>[hint&&`${id}-hint`,error&&`${id}-error`].filter(Boolean).join(' ')||undefined;

function FormGuide({status,record}){
  const handover=record&&status!=='lost'&&custody({...record,status});
  if(handover&&['received','released'].includes(record.handoverStatus)&&handover.tone!=='reported'){
    return <div className="guide"><Icon name="building"/><div><strong>Handover on record: {handover.label}</strong><p>Editing this report doesn't change the handover record.</p></div></div>;
  }
  if(status==='found')return <div className="guide guide-warn"><Icon name="alert"/><div>
    <strong>Posting a report is not the same as handing the item in</strong>
    <p>Your report will show as “Not confirmed at a collection point”, because this form doesn't record a handover. Please take the item to {pointsText}, where ownership is verified before release.</p>
  </div></div>;
  if(status==='lost')return <div className="guide"><Icon name="search"/><div>
    <strong>After you post</strong>
    <p>If any found report looks similar, you'll see it as a possible match on the board.</p>
  </div></div>;
  if(status==='claimed')return <div className="guide"><Icon name="check"/><div>
    <strong>For items already back with their owner</strong>
    <p>This report won't show a collection point handover unless one is on record.</p>
  </div></div>;
  return null;
}

function ReportForm({form,setField,errors,record,editing,onSubmit,onCancel,onViewDuplicate,headingRef}){
  const copy=FORM_COPY[form.status]||FORM_COPY[''];
  const titleHint='At least 2 characters, for example “Black backpack”.';
  const privacyHint="Reports are public. Don't include names, ID numbers or contact details.";
  return <main className="form-page" id="main">
    <button className="back-link" onClick={onCancel}><Icon name="arrow"/>Back to reports</button>
    <section className="form-card">
      <h1 ref={headingRef} tabIndex={-1}>{editing?'Edit your report':'Report an item'}</h1>
      <p className="form-lead">{editing?'Update the details below. Your changes appear on the board straight away.':'Your report appears on the public campus board. Fields marked * are required.'}</p>
      <form onSubmit={onSubmit} noValidate>
        <fieldset className={`field status-field${errors.status?' has-error':''}`} aria-describedby={errors.status?'status-error':undefined}>
          <legend>What happened?<span className="req" aria-hidden="true"> *</span></legend>
          <div className="status-choices">
            {STATUS_CHOICES.map(c=><label className={`status-choice choice-${c.value}${form.status===c.value?' is-selected':''}`} key={c.value}>
              <input type="radio" name="status" id={`status-${c.value}`} value={c.value} checked={form.status===c.value} onChange={e=>setField('status',e.target.value)}/>
              <span className="choice-icon"><Icon name={STATUS_META[c.value].icon}/></span>
              <span className="choice-text"><strong>{c.title}</strong><small>{c.hint}</small></span>
            </label>)}
          </div>
          {errors.status&&<p className="field-error" id="status-error"><Icon name="alert"/><span>{errors.status}</span></p>}
        </fieldset>
        <FormGuide status={form.status} record={record}/>
        <Field id="title" label="Item title" required hint={titleHint} error={errors.title} action={errors.duplicateOf&&<> <button type="button" className="text-btn" onClick={()=>onViewDuplicate(errors.duplicateOf)}>View the existing report</button></>}>
          <input id="title" value={form.title} onChange={e=>setField('title',e.target.value)} aria-required="true" aria-invalid={!!errors.title} aria-describedby={describedBy('title',titleHint,errors.title)} autoComplete="off"/>
        </Field>
        <Field id="category" label="Category" required error={errors.category}>
          <select id="category" value={form.category} onChange={e=>setField('category',e.target.value)} aria-required="true" aria-invalid={!!errors.category} aria-describedby={describedBy('category',null,errors.category)}>
            <option value="">Select a category</option>
            {categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}
          </select>
        </Field>
        <Field id="location" label={copy.location} optional>
          <input id="location" value={form.location} onChange={e=>setField('location',e.target.value)} placeholder="For example, Library - second floor" autoComplete="off"/>
        </Field>
        <Field id="description" label={copy.description} optional hint={privacyHint}>
          <textarea id="description" rows="5" value={form.description} onChange={e=>setField('description',e.target.value)} placeholder={copy.placeholder} aria-describedby={describedBy('description',privacyHint)}/>
        </Field>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">{editing?'Save changes':copy.submit}</button>
        </div>
      </form>
    </section>
  </main>;
}

export default function App(){
  const [items,setItems]=useState(getSaved);
  const [page,setPage]=useState('board');
  const [q,setQ]=useState('');
  const [cat,setCat]=useState('all');
  const [filterStatus,setFilterStatus]=useState('all');
  const [mineOnly,setMineOnly]=useState(false);
  const [current,setCurrent]=useState(null);
  const [form,setForm]=useState(clean);
  const [attempted,setAttempted]=useState(false);
  const [notice,setNotice]=useState(null);
  const [highlight,setHighlight]=useState(null);
  const [compareId,setCompareId]=useState(null);
  const [confirmReset,setConfirmReset]=useState(false);
  const searchRef=useRef(null);
  const noticeRef=useRef(null);
  const headingRef=useRef(null);
  const resetRef=useRef(null);
  const restoreY=useRef(null);

  useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
  useLayoutEffect(()=>{
    if(page==='form'){
      window.scrollTo(0,0);
      headingRef.current?.focus({preventScroll:true});
    }else if(restoreY.current!==null){
      window.scrollTo(0,restoreY.current);
      restoreY.current=null;
    }
  },[page]);
  useEffect(()=>{if(notice)noticeRef.current?.focus();},[notice]);
  useEffect(()=>{if(confirmReset)resetRef.current?.focus();},[confirmReset]);

  const scoped=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(!mineOnly||x.owner==='you')),[items,cat,mineOnly]);
  const searched=useMemo(()=>scoped.filter(x=>matchesQuery(x,q)),[scoped,q]);
  const statusFilter=x=>filterStatus==='all'||x.status===filterStatus;
  const filtered=useMemo(()=>searched.filter(statusFilter).sort(byNewest),[searched,filterStatus]);
  const similar=useMemo(()=>similarReports(scoped.filter(statusFilter),q),[scoped,filterStatus,q]);
  const matchesById=useMemo(()=>Object.fromEntries(items.map(r=>[r.id,findMatches(r,items)])),[items]);
  const myAlerts=items.filter(r=>r.owner==='you'&&r.status==='lost'&&matchesById[r.id]?.length);
  const compareReport=items.find(r=>r.id===compareId);
  const hasFilters=q.trim()||cat!=='all'||filterStatus!=='all'||mineOnly;
  const errors=attempted?validate(form,items,current):{};

  function setField(name,value){setForm(s=>({...s,[name]:value}));}
  function clearFilters(){setQ('');setCat('all');setFilterStatus('all');setMineOnly(false);}
  function openForm(){restoreY.current=null;setAttempted(false);setNotice(null);setHighlight(null);setPage('form');}
  function create(status=''){setCurrent(null);setForm({...clean,status});openForm();}
  function edit(row){
    if(row.owner!=='you')return;
    setCurrent(row.id);
    setForm({title:row.title,category:row.category,status:row.status,location:row.location||'',description:row.description||''});
    const y=window.scrollY;
    openForm();
    restoreY.current=y;
  }
  function cancel(){setCurrent(null);setPage('board');}
  function searchFound(){
    setFilterStatus('found');
    searchRef.current?.focus({preventScroll:true});
    searchRef.current?.scrollIntoView({block:'center'});
  }
  function submit(e){
    e.preventDefault();
    const v=validate(form,items,current);
    setAttempted(true);
    if(Object.keys(v).length){
      const first=v.status?`status-${statuses[0]}`:v.title?'title':'category';
      document.getElementById(first)?.focus();
      return;
    }
    const existing=items.find(x=>x.id===current);
    const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:existing?.created??'Today',emoji:existing?existing.emoji:'📌',...(existing?{}:{collectionPoint:'',handoverStatus:'reported'})};
    const id=existing?existing.id:`f-${Date.now()}`;
    const next=existing?items.map(x=>x.id===id?{...x,...d}:x):[{id,...d},...items];
    setItems(next);
    setNotice(savedNotice(next.find(x=>x.id===id),next,!!existing));
    setHighlight(id);
    clearFilters();
    restoreY.current=0;
    setCurrent(null);
    setPage('board');
  }
  function savedNotice(report,all,updated){
    const title=updated?'Report updated.':'Your report has been posted.';
    const count=findMatches(report,all).length;
    if(custody(report)?.tone==='reported'){
      return {title,body:`Next step: hand the item in at ${pointsText}. Until a handover is on record, your report shows as “Not confirmed at a collection point”.`};
    }
    if(report.status==='lost'){
      return {title,body:count?`${count} found ${count===1?'report looks':'reports look'} similar. Compare ${count===1?'it':'them'} on your report below.`:'No found report looks similar yet. Check back here, as new reports are added.'};
    }
    return {title};
  }
  function viewDuplicate(record){
    clearFilters();
    setQ(record.title);
    setCurrent(null);
    setHighlight(null);
    restoreY.current=0;
    setPage('board');
  }
  function reset(){
    setItems(seed);
    setPage('board');
    clearFilters();
    setConfirmReset(false);
    setHighlight(null);
    setNotice({title:'Example reports restored.'});
  }

  const statusWord=filterStatus==='all'?'':`${filterStatus} `;
  const summary=`${filtered.length} ${mineOnly?'of your ':''}${statusWord}report${filtered.length===1?'':'s'}${q.trim()?` for “${q.trim()}”`:''}${cat!=='all'?` in ${cap(cat)}`:''}`;
  const cardProps={onCompare:r=>setCompareId(r.id),onEdit:edit};
  const counts={all:searched.length,...Object.fromEntries(statuses.map(s=>[s,searched.filter(r=>r.status===s).length]))};

  return <div className="app">
    <a className="skip-link" href="#main">Skip to main content</a>
    <header className="site-header">
      <div className="site-header-inner">
        <button className="brand" onClick={cancel}>
          <span className="brand-mark"><Icon name="pin"/></span>
          <span className="brand-name">Campus Lost &amp; Found</span>
        </button>
        <button className="btn btn-gold" onClick={()=>create()}><Icon name="plus"/>Report an item</button>
      </div>
    </header>

    {page==='board'?<>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1>Lost or found something on campus?</h1>
            <p>Search what students have reported, or add a report of your own.</p>
          </div>
          <div className="paths">
            <div className="path">
              <h2>I lost something</h2>
              <p>Start with found reports. If nothing matches, post a lost report.</p>
              <div className="path-actions">
                <button className="btn btn-primary btn-small" onClick={searchFound}>Search found reports</button>
                <button className="btn btn-ghost btn-small" onClick={()=>create('lost')}>Report a lost item</button>
              </div>
            </div>
            <div className="path">
              <h2>I found something</h2>
              <p>Post a report, then hand the item in at a collection point.</p>
              <div className="path-actions">
                <button className="btn btn-primary btn-small" onClick={()=>create('found')}>Report a found item</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="board" id="main">
        {myAlerts.length>0&&<section className="alerts" aria-label="Possible matches for your lost reports">
          {myAlerts.map(r=>{
            const n=matchesById[r.id].length;
            return <div className="alert-row" key={r.id}>
              <span className="alert-icon"><Icon name="compare"/></span>
              <p><strong>{r.title}:</strong> {n} found {n===1?'report may be':'reports may be'} your item.</p>
              <button className="btn btn-soft btn-small" onClick={()=>setCompareId(r.id)} aria-label={`Compare found reports for ${r.title}`}>Compare</button>
            </div>;
          })}
        </section>}

        <section className="toolbar" aria-label="Search and filter reports">
          <div className="toolbar-row">
            <div className="control control-search">
              <label htmlFor="search">Search reports</label>
              <div className="search-box">
                <Icon name="search"/>
                <input ref={searchRef} id="search" type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Try “blue bottle” or “library”" autoComplete="off"/>
              </div>
            </div>
            <div className="control">
              <label htmlFor="filter-category">Category</label>
              <select id="filter-category" value={cat} onChange={e=>setCat(e.target.value)}>
                <option value="all">All categories</option>
                {categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}
              </select>
            </div>
          </div>
          <div className="toolbar-row toolbar-row-filters">
            <div className="status-tabs" role="group" aria-label="Filter by status">
              {['all',...statuses].map(s=><button key={s} className={`status-tab tab-${s}`} aria-pressed={filterStatus===s} onClick={()=>setFilterStatus(s)}>
                {s==='all'?'All':STATUS_META[s].label}<span className="tab-count">{counts[s]}</span>
              </button>)}
            </div>
            <label className="toggle"><input type="checkbox" checked={mineOnly} onChange={e=>setMineOnly(e.target.checked)}/>Your reports only</label>
          </div>
        </section>

        <div role="status" aria-live="polite">
          {notice&&<div className="notice" ref={noticeRef} tabIndex={-1}>
            <Icon name="check"/>
            <div><strong>{notice.title}</strong>{notice.body&&<p>{notice.body}</p>}</div>
            <button className="icon-btn" onClick={()=>{setNotice(null);setHighlight(null);}} aria-label="Dismiss message"><Icon name="close"/></button>
          </div>}
        </div>

        <div className="results-head">
          <h2 aria-live="polite">{summary}</h2>
          <div className="results-side">
            {filtered.length>1&&<span className="sort-note">Newest first</span>}
            {hasFilters&&<button className="text-btn" onClick={clearFilters}>Clear search and filters</button>}
          </div>
        </div>

        {filtered.length>0
          ?<div className="report-grid">{filtered.map(r=><ReportCard key={r.id} report={r} matches={matchesById[r.id]||[]} isNew={highlight===r.id} {...cardProps}/>)}</div>
          :<div className="empty">
            <span className="empty-icon"><Icon name="search"/></span>
            <h3>{similar.length?'No report matches every word':'No reports match'}</h3>
            <p>{counts.all>0?`${counts.all} ${counts.all===1?'report matches':'reports match'} under a different status. Try another status above.`:mineOnly?"You don't have a report that fits these filters.":'Try fewer words or a different category. If your item is not here yet, add a report so others can look out for it.'}</p>
            <div className="empty-actions">
              {hasFilters&&<button className="btn btn-ghost btn-small" onClick={clearFilters}>Clear search and filters</button>}
              <button className="btn btn-primary btn-small" onClick={()=>create('lost')}>Report a lost item</button>
              <button className="btn btn-primary btn-small" onClick={()=>create('found')}>Report a found item</button>
            </div>
          </div>}

        {similar.length>0&&<section className="similar" aria-labelledby="similar-title">
          <h2 id="similar-title">Similar reports</h2>
          <p>These share some of your search words, not all of them. People describe the same item differently.</p>
          <div className="report-grid">{similar.map(r=><ReportCard key={r.id} report={r} matches={matchesById[r.id]||[]} isNew={false} {...cardProps}/>)}</div>
        </section>}

        <HowItWorks/>
      </main>
    </>:<ReportForm form={form} setField={setField} errors={errors} record={items.find(x=>x.id===current)} editing={!!current} onSubmit={submit} onCancel={cancel} onViewDuplicate={viewDuplicate} headingRef={headingRef}/>}

    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>Campus Lost &amp; Found. Demo only: reports are stored in this browser.</span>
        {confirmReset
          ?<span className="reset-confirm" role="group" aria-label="Confirm reset">
            <span>Remove your changes and restore the example reports?</span>
            <button ref={resetRef} className="btn btn-danger btn-small" onClick={reset}>Yes, reset</button>
            <button className="btn btn-ghost btn-small" onClick={()=>setConfirmReset(false)}>Keep my data</button>
          </span>
          :<button className="text-btn" onClick={()=>setConfirmReset(true)}>Reset demo data</button>}
      </div>
    </footer>

    {compareReport&&<CompareDialog report={compareReport} matches={matchesById[compareReport.id]||[]} onClose={()=>setCompareId(null)}/>}
  </div>;
}
