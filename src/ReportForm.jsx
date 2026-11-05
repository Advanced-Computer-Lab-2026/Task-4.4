import React from 'react';
import { cap } from './filters.js';

export const FIELD_IDS = {
  title: 'field-title',
  status: 'field-status',
  category: 'field-category',
  location: 'field-location',
  description: 'field-description',
};

// Errors in the order the fields appear in the form. A duplicate is fixed
// through the title (or location), so it points at the title field.
export function orderedErrors(errors) {
  const list = [];
  if (errors.title) list.push({ field: 'title', message: errors.title });
  if (errors.duplicate) list.push({ field: 'title', message: errors.duplicate });
  if (errors.status) list.push({ field: 'status', message: errors.status });
  if (errors.category) list.push({ field: 'category', message: errors.category });
  return list;
}

const LOCATION_LABELS = { lost: 'Where did you lose it?', found: 'Where did you find it?' };

const describedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p className="field-error" id={id}>
      <span aria-hidden="true">⚠ </span>
      <span className="visually-hidden">Error: </span>
      {message}
    </p>
  );
}

function focusField(field) {
  document.getElementById(FIELD_IDS[field])?.focus();
}

export default function ReportForm({ form, onChange, errors, isEditing, categories, statuses, onSubmit, onCancel }) {
  const summary = orderedErrors(errors);
  const titleError = errors.title || errors.duplicate;
  const locationError = errors.duplicate ? 'Change the title or location to continue.' : '';
  const set = field => e => onChange(field, e.target.value);

  return (
    <form onSubmit={onSubmit} noValidate>
      {summary.length > 0 && (
        <div className="form-error" role="alert" id="form-error-summary">
          <h3>Please fix the following:</h3>
          <ul>
            {summary.map(err => (
              <li key={err.message}>
                <button type="button" onClick={() => focusField(err.field)}>{err.message}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="required-note">Fields marked <b>*</b> are required.</p>

      <div className={'field' + (titleError ? ' has-error' : '')}>
        <label htmlFor={FIELD_IDS.title}>Item title <b aria-hidden="true">*</b></label>
        <p className="field-hint" id="title-hint">At least 2 characters, e.g. Black backpack.</p>
        <input
          id={FIELD_IDS.title}
          value={form.title}
          onChange={set('title')}
          placeholder="e.g., Black backpack"
          aria-required="true"
          aria-invalid={titleError ? 'true' : 'false'}
          aria-describedby={describedBy('title-hint', titleError && 'title-error')}
        />
        <FieldError id="title-error" message={titleError} />
      </div>

      <div className={'field' + (errors.status ? ' has-error' : '')}>
        <label htmlFor={FIELD_IDS.status}>Status <b aria-hidden="true">*</b></label>
        <p className="field-hint" id="status-hint">
          Lost: you are looking for it · Found: you have it or handed it in · Claimed: it is back with its owner.
        </p>
        <select
          id={FIELD_IDS.status}
          value={form.status}
          onChange={set('status')}
          aria-required="true"
          aria-invalid={errors.status ? 'true' : 'false'}
          aria-describedby={describedBy('status-hint', errors.status && 'status-error')}
        >
          <option value="">Choose one</option>
          {statuses.map(s => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
        <FieldError id="status-error" message={errors.status} />
        <div aria-live="polite">
          {form.status === 'found' && (
            <p className="found-hint">
              Please hand the item in at a campus collection point (Campus Security Desk, Student Services Office or
              Library Reception). Your notice will show as “Reported found - not confirmed at a collection point” until
              staff confirm they have received it.
            </p>
          )}
        </div>
      </div>

      <div className={'field' + (errors.category ? ' has-error' : '')}>
        <label htmlFor={FIELD_IDS.category}>Category <b aria-hidden="true">*</b></label>
        <select
          id={FIELD_IDS.category}
          value={form.category}
          onChange={set('category')}
          aria-required="true"
          aria-invalid={errors.category ? 'true' : 'false'}
          aria-describedby={describedBy(errors.category && 'category-error')}
        >
          <option value="">Select item category</option>
          {categories.slice(1).map(s => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
        <FieldError id="category-error" message={errors.category} />
      </div>

      <div className={'field' + (locationError ? ' has-error' : '')}>
        <label htmlFor={FIELD_IDS.location}>{LOCATION_LABELS[form.status] || 'Location'}</label>
        <p className="field-hint" id="location-hint">Optional – helps with matching.</p>
        <input
          id={FIELD_IDS.location}
          value={form.location}
          onChange={set('location')}
          placeholder="e.g. Library - second floor"
          aria-invalid={locationError ? 'true' : 'false'}
          aria-describedby={describedBy('location-hint', locationError && 'location-error')}
        />
        <FieldError id="location-error" message={locationError} />
      </div>

      <div className="field">
        <label htmlFor={FIELD_IDS.description}>More details</label>
        <textarea
          id={FIELD_IDS.description}
          rows="6"
          value={form.description}
          onChange={set('description')}
          placeholder="Describe your item"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Go back</button>
        <button className="report-button" type="submit">{isEditing ? 'Save report' : 'Publish notice'}</button>
      </div>
    </form>
  );
}
