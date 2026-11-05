import React from 'react';
import { custody } from './custody.js';

const CUSTODY_ICONS = { held: '✓', released: '✓', reported: '!' };

function CustodyBadge({ item }) {
  const { kind, label, next } = custody(item);
  if (!kind) return null;
  return (
    <div className={`custody custody-${kind}`}>
      <span className="custody-icon" aria-hidden="true">{CUSTODY_ICONS[kind]}</span>
      <span>
        <strong className="custody-label">{label}</strong>
        {next && <span className="custody-next">{next}</span>}
      </span>
    </div>
  );
}

export default function ReportCard({ item, justSaved, onEdit }) {
  const isOwn = item.owner === 'you';
  const titleId = `report-${item.id}-title`;
  const classes = ['sticky', isOwn && 'own', justSaved && 'just-saved'].filter(Boolean).join(' ');

  return (
    <article className={classes} id={`report-${item.id}`} tabIndex={-1} aria-labelledby={titleId}>
      <div className="sticky-top">
        <span>{item.category}</span>
        {isOwn && <span className="own-tag">Your report</span>}
      </div>
      <div className="sticky-emoji" aria-hidden="true">{item.emoji}</div>
      <h3 id={titleId}>{item.title}</h3>
      <p>{item.description || 'No additional description.'}</p>
      <CustodyBadge item={item} />
      <div className="sticky-bottom">
        <span>⌖ {item.location || 'Location not provided'}</span>
        <small>{item.created}</small>
      </div>
      <div className="card-actions">
        {isOwn ? (
          <button type="button" className="edit-button" onClick={() => onEdit(item)} aria-label={`Edit your report: ${item.title}`}>
            Edit report
          </button>
        ) : (
          <span className="posted-by">Posted by another student</span>
        )}
      </div>
    </article>
  );
}
