import React, {useEffect, useRef} from 'react';

function ReportDetails({report}) {
  const custody = report.handoverStatus === 'received' && report.collectionPoint
    ? `Received at ${report.collectionPoint}`
    : report.handoverStatus === 'released' ? 'Collected by owner'
    : 'Reported found — not confirmed at a collection point';
  return <article className="comparison-report">
    <span className={`status-tag ${report.status}`}>{report.status}</span>
    <h3><span aria-hidden="true">{report.emoji}</span> {report.title}</h3>
    <dl><dt>Category</dt><dd>{report.category}</dd>
      <dt>Location</dt><dd>{report.location || 'Location not provided'}</dd>
      <dt>Description</dt><dd>{report.description || 'No additional description.'}</dd>
      <dt>Reported</dt><dd>{report.created} · {report.owner === 'you' ? 'You' : 'Another student'}</dd>
      {report.status !== 'lost' && <><dt>Collection status</dt><dd className="comparison-custody">{custody}</dd></>}
    </dl>
  </article>;
}

export default function MatchComparison({report, matches, onClose}) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {element.close(); document.body.style.overflow = previousOverflow;};
  }, []);

  return <dialog ref={dialog} className="match-dialog" aria-labelledby="match-title"
    aria-describedby="match-disclaimer" onCancel={onClose} onClose={onClose}>
    <div className="match-dialog-header"><div><p className="kicker">COMPARE NOTICES</p>
      <h2 id="match-title">Possible matches</h2></div>
      <button autoFocus className="comparison-close" onClick={onClose} aria-label="Close comparison">✕</button>
    </div>
    <p id="match-disclaimer" className="match-disclaimer">Similar wording suggests these reports may be related. Matches are unverified and do not confirm ownership or staff receipt.</p>
    <div className="comparison-grid"><section><h3 className="comparison-label">Selected report</h3>
      <ReportDetails report={report} /></section>
      <section><h3 className="comparison-label">Possible {report.status === 'lost' ? 'found' : 'lost'} matches ({matches.length})</h3>
        {matches.map(match => <div key={match.report.id} className="comparison-candidate">
          <ReportDetails report={match.report} />
          <p className="match-reasons"><strong>Why suggested</strong>{match.reasons.join(' · ')}</p>
        </div>)}
      </section></div>
    <p className="comparison-next-step">For items received at a collection point, staff must verify ownership before collection. A found report alone does not mean staff hold the item.</p>
  </dialog>;
}
