import React, { useEffect, useMemo, useState } from 'react';

const STORE = 'acl-foundboard-v3';

// A found report does not automatically mean staff hold the item.
const seed = [
  { id: 'f1', title: 'Black backpack', category: 'accessories', status: 'lost', location: 'Library - second floor', description: 'Black backpack with a small red keychain. Left near the study desks.', owner: 'you', created: 'Oct 23', emoji: '🎒' },
  { id: 'f2', title: 'Dark backpack', category: 'accessories', status: 'found', location: 'Library - main stairwell', description: 'Found a dark backpack with a small red keychain near the library stairs.', owner: 'other', created: 'Oct 24', emoji: '🎒', collectionPoint: 'Campus Security Desk', handoverStatus: 'received' },
  { id: 'f3', title: 'Student ID card', category: 'documents', status: 'found', location: 'Near Gate 3', description: 'A student card was turned in. No personal details are published.', owner: 'other', created: 'Oct 24', emoji: '🪪', collectionPoint: 'Student Services Office', handoverStatus: 'received' },
  { id: 'f4', title: 'Wireless earbuds', category: 'electronics', status: 'lost', location: 'Main cafeteria', description: 'White earbuds in a distinctive blue case. Lost on Monday.', owner: 'other', created: 'Oct 24', emoji: '🎧' },
  { id: 'f5', title: 'Earbuds in blue case', category: 'electronics', status: 'found', location: 'Cafeteria entrance', description: 'White earbuds in a blue charging case found near the coffee counter.', owner: 'other', created: 'Oct 25', emoji: '🎧', collectionPoint: '', handoverStatus: 'reported' },
  { id: 'f6', title: 'Blue sports bottle', category: 'other', status: 'lost', location: 'Sports Hall - lockers', description: 'Tall blue metal water bottle, possibly left after practice.', owner: 'other', created: 'Oct 25', emoji: '🥤' },
  { id: 'f7', title: 'Metal water bottle', category: 'other', status: 'found', location: 'Sports Hall - benches', description: 'Blue reusable metal bottle found after a basketball session.', owner: 'other', created: 'Oct 25', emoji: '🥤', collectionPoint: 'Campus Security Desk', handoverStatus: 'received' },
  { id: 'f8', title: 'Engineering lab coat', category: 'clothing', status: 'claimed', location: 'Building C', description: 'Owner verified the item and collected it from the reception desk.', owner: 'you', created: 'Oct 22', emoji: '🥼', collectionPoint: 'Library Reception', handoverStatus: 'released' },
  { id: 'f9', title: 'Small notebook', category: 'other', status: 'lost', location: 'C7 lecture room', description: 'Brown cover with handwritten engineering notes.', owner: 'other', created: 'Oct 25', emoji: '📒' },
  { id: 'f10', title: 'Scientific calculator', category: 'electronics', status: 'lost', location: 'B2 lecture hall', description: 'Black scientific calculator with a protective cover.', owner: 'other', created: 'Oct 26', emoji: '🧮' },
  { id: 'f11', title: 'Calculator', category: 'electronics', status: 'found', location: 'B2 study area', description: 'Scientific calculator with a black cover, found on a desk.', owner: 'you', created: 'Oct 26', emoji: '🧮', collectionPoint: 'Library Reception', handoverStatus: 'received' },
  { id: 'f12', title: 'Canvas tote bag', category: 'accessories', status: 'lost', location: 'Main campus bus stop', description: 'Beige tote with green writing on one side.', owner: 'other', created: 'Oct 26', emoji: '👜' },
  { id: 'f13', title: 'USB flash drive', category: 'electronics', status: 'found', location: 'Building A computer lab', description: 'A small black flash drive was found beside a workstation.', owner: 'other', created: 'Oct 27', emoji: '💾', collectionPoint: '', handoverStatus: 'reported' },
];

const categories = [
  'all',
  'electronics',
  'clothing',
  'documents',
  'accessories',
  'other',
];

const statuses = ['lost', 'found', 'claimed'];

const clean = {
  title: '',
  category: '',
  status: '',
  location: '',
  description: '',
};

const statusIcons = {
  lost: '↗',
  found: '✓',
  claimed: '✓',
};

const cap = value =>
  value.charAt(0).toUpperCase() + value.slice(1);

function getSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    return Array.isArray(saved) ? saved : seed;
  } catch {
    return seed;
  }
}

function validate(form, items, id) {
  if (!form.title.trim() || form.title.trim().length < 2) {
    return 'Title must be at least 2 characters.';
  }

  if (!categories.slice(1).includes(form.category)) {
    return 'Choose a category.';
  }

  if (!statuses.includes(form.status)) {
    return 'Choose lost, found or claimed.';
  }

  const duplicate = items.some(
    item =>
      item.id !== id &&
      item.title.toLowerCase() ===
        form.title.trim().toLowerCase() &&
      (item.location || '').toLowerCase() ===
        (form.location || '').trim().toLowerCase()
  );

  if (duplicate) {
    return 'An item with the same title has already been reported at this location.';
  }

  return '';
}

export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('board');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(items));
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter(
        item =>
          (cat === 'all' || item.category === cat) &&
          (filterStatus === 'all' ||
            item.status === filterStatus) &&
          `${item.title} ${item.location} ${item.description}`
            .toLowerCase()
            .includes(q.toLowerCase())
      ),
    [items, q, cat, filterStatus]
  );

  function clearFilters() {
    setQ('');
    setCat('all');
    setFilterStatus('all');
  }

  function create() {
    setCurrent(null);
    setForm({ ...clean });
    setError('');
    setPage('form');
  }

  function edit(row) {
    if (row.owner !== 'you') return;

    setCurrent(row.id);
    setForm({
      title: row.title,
      category: row.category,
      status: row.status,
      location: row.location,
      description: row.description,
    });

    setError('');
    setPage('form');
  }

  function submit(event) {
    event.preventDefault();

    const validationError = validate(form, items, current);

    if (validationError) {
      setError('Please review your entries.');
      return;
    }

    const data = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      owner: 'you',
      created: 'Today',
      emoji: current
        ? items.find(item => item.id === current)?.emoji
        : '📌',
      ...(current
        ? {}
        : {
            collectionPoint: '',
            handoverStatus: 'reported',
          }),
    };

    if (current) {
      setItems(
        items.map(item =>
          item.id === current
            ? { ...item, ...data }
            : item
        )
      );
      setMessage('Report updated.');
    } else {
      setItems([
        { id: `f-${Date.now()}`, ...data },
        ...items,
      ]);
      setMessage('Your report has been posted.');
    }

    setPage('board');
    setCurrent(null);
  }

  function reset() {
    setItems(seed);
    setPage('board');
    clearFilters();
    setMessage('Example reports restored.');
  }

  return (
    <div className="notice-app">
      <header className="header">
        <div className="headline">
          <span className="sun">✺</span>

          <button
            onClick={() => setPage('board')}
            className="wordmark"
          >
            FOUND
            <span>on campus</span>
          </button>

          <p>Community noticeboard</p>
        </div>

        <div className="header-links">
          <button onClick={() => setPage('board')}>
            Noticeboard
          </button>

          <button
            onClick={() => {
              setFilterStatus('lost');
              setPage('board');
            }}
          >
            Missing items
          </button>

          <button
            onClick={() => {
              setFilterStatus('found');
              setPage('board');
            }}
          >
            Recently found
          </button>
        </div>

        <button
          className="report-button"
          onClick={create}
        >
          + Post a report
        </button>
      </header>

      <div className="ruleline">
        <span>SEARCH • DISCOVER • REUNITE</span>
        <span>
          Helping lost things find their way back.
        </span>
      </div>

      {page === 'board' ? (
        <main className="workspace">
          <section
            className="search-panel"
            aria-labelledby="search-heading"
          >
            <div className="search-heading">
              <div>
                <p className="kicker">
                  CAMPUS LOST & FOUND
                </p>

                <h1 id="search-heading">
                  Find your missing item
                </h1>

                <p>
                  Search campus reports or post something
                  you’ve lost or found.
                </p>
              </div>

              <button
                className="reset"
                onClick={reset}
              >
                Reset demo data
              </button>
            </div>

            <div className="search-toolbar">
              <label className="search-field">
                Search items
                <input
                  type="search"
                  value={q}
                  onChange={event =>
                    setQ(event.target.value)
                  }
                  placeholder="Search by item, location or description"
                />
              </label>

              <label>
                Item category
                <select
                  value={cat}
                  onChange={event =>
                    setCat(event.target.value)
                  }
                >
                  <option value="all">
                    All categories
                  </option>

                  {categories.slice(1).map(category => (
                    <option
                      key={category}
                      value={category}
                    >
                      {cap(category)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Report status
                <select
                  value={filterStatus}
                  onChange={event =>
                    setFilterStatus(event.target.value)
                  }
                >
                  <option value="all">
                    All statuses
                  </option>

                  {statuses.map(status => (
                    <option
                      key={status}
                      value={status}
                    >
                      {cap(status)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>

            <p
              className="search-summary"
              role="status"
            >
              {filtered.length}{' '}
              {filtered.length === 1
                ? 'report'
                : 'reports'}{' '}
              found · Results update automatically
            </p>
          </section>

          <section
            className="board"
            aria-labelledby="reports-heading"
          >
            <div className="board-top">
              <div>
                <p className="kicker">
                  CAMPUS COMMUNITY
                </p>

                <h2 id="reports-heading">
                  Item reports{' '}
                  <span>({filtered.length})</span>
                </h2>
              </div>
            </div>

            {message && (
              <div
                className="message"
                role="status"
              >
                {message}

                <button
                  onClick={() => setMessage('')}
                  aria-label="Dismiss message"
                >
                  ✕
                </button>
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="reports-grid">
                {filtered.map(item => (
                  <article
                    className="report-card"
                    key={item.id}
                    aria-labelledby={`title-${item.id}`}
                  >
                    <div className="report-card-top">
                      <span
                        className={`status-badge status-${item.status}`}
                      >
                        <span aria-hidden="true">
                          {statusIcons[item.status]}
                        </span>
                        {cap(item.status)}
                      </span>

                      <span className="report-category">
                        {cap(item.category)}
                      </span>
                    </div>

                    <div className="report-card-heading">
                      <span
                        className="report-emoji"
                        aria-hidden="true"
                      >
                        {item.emoji}
                      </span>

                      <h3 id={`title-${item.id}`}>
                        {item.title}
                      </h3>
                    </div>

                    <p className="report-description">
                      {item.description ||
                        'No additional description.'}
                    </p>

                 {item.status !== 'lost' && (
  <div
    className={`collection-panel ${
      item.status === 'claimed'
        ? 'collection-claimed'
        : item.handoverStatus === 'received' &&
            item.collectionPoint
          ? 'collection-received'
          : 'collection-unconfirmed'
    }`}
  >
    {item.status === 'claimed' ? (
      <>
        <strong>Marked as claimed</strong>
        <p>
          {item.handoverStatus === 'released'
            ? 'Collected by the owner.'
            : 'This report is marked as claimed.'}
        </p>
      </>
    ) : item.handoverStatus === 'received' &&
      item.collectionPoint ? (
      <>
        <strong>Held by campus staff</strong>
        <p className="collection-place">
          {item.collectionPoint}
        </p>
        <p>
          If you think this is yours, visit this collection
          point. Staff must verify ownership before
          releasing the item.
        </p>
      </>
    ) : (
      <>
        <strong>Handover unconfirmed</strong>
        <p>
          Reported found by a student. Receipt at a campus
          collection point has not been confirmed.
        </p>
        <p>
          This notice does not confirm that the item is
          ready for collection.
        </p>
      </>
    )}
  </div>
)}

                    <div className="report-location">
                      <span aria-hidden="true">⌖</span>
                      <span>
                        {item.location ||
                          'Location not provided'}
                      </span>
                    </div>

                    <div className="report-card-footer">
                      <small>{item.created}</small>

                      {item.owner === 'you' ? (
                        <button
                          className="edit-report"
                          onClick={() => edit(item)}
                          aria-label={`Edit your report: ${item.title}`}
                        >
                          Edit your report
                        </button>
                      ) : (
                        <span className="report-author">
                          Another student
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="reports-empty">
                <h3>No matching reports</h3>
                <p>
                  Try another search term or clear your
                  filters to see all reports.
                </p>

                <button
                  className="clear-filters"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="report-page">
          <div className="crumbs">
            <button
              onClick={() => setPage('board')}
            >
              ← Noticeboard
            </button>

            <span>/</span>
            <span>Report an item</span>
          </div>

          <div className="report-layout">
            <div className="report-intro">
              <span className="seal">✺</span>

              <p className="kicker">
                HELP THE COMMUNITY
              </p>

              <h1>
                {current
                  ? 'Update your report'
                  : 'Tell us what happened.'}
              </h1>

              <p>
                Small details can help someone
                recognize their belongings.
              </p>

              <div className="paper-note">
                Your report will appear on the public
                campus noticeboard with the details
                you provide.
              </div>
            </div>

            <section className="form-paper">
              <header>
                <p>NEW NOTICE / FORM 01</p>

                <h2>
                  {current
                    ? 'Edit report'
                    : 'Report an item'}
                </h2>
              </header>

              <form onSubmit={submit}>
                <label>
                  Item title <b>*</b>
                  <input
                    value={form.title}
                    onChange={event =>
                      setForm(previous => ({
                        ...previous,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g., Black backpack"
                  />
                </label>

                <label>
                  Status <b>*</b>
                  <select
                    value={form.status}
                    onChange={event =>
                      setForm(previous => ({
                        ...previous,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="">
                      Choose one
                    </option>

                    {statuses.map(status => (
                      <option
                        key={status}
                        value={status}
                      >
                        {cap(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Category <b>*</b>
                  <select
                    value={form.category}
                    onChange={event =>
                      setForm(previous => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option value="">
                      Select item category
                    </option>

                    {categories
                      .slice(1)
                      .map(category => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                  </select>
                </label>

                <label>
                  Last known location
                  <input
                    value={form.location}
                    onChange={event =>
                      setForm(previous => ({
                        ...previous,
                        location: event.target.value,
                      }))
                    }
                    placeholder="Location (optional)"
                  />
                </label>

                <label>
                  More details
                  <textarea
                    rows="6"
                    value={form.description}
                    onChange={event =>
                      setForm(previous => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Describe your item"
                  />
                </label>

                {error && (
                  <div
                    className="form-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setPage('board')}
                  >
                    Go back
                  </button>

                  <button
                    className="report-button"
                    type="submit"
                  >
                    {current
                      ? 'Save report'
                      : 'Publish notice'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </main>
      )}

      <footer className="pagefooter">
        <span>FOUND / Campus noticeboard</span>
        <span>Community project • Demo only</span>
      </footer>
    </div>
  );
}