
import React, { useEffect, useMemo, useState } from 'react';

const STORE = 'acl-foundboard-v3';

// Fictional campus locations for this standalone teaching demo.
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

const categories = ['all', 'electronics', 'clothing', 'documents', 'accessories', 'other'];

// Claimed is deliberately excluded from the report creation form.
const statuses = ['lost', 'found'];

const clean = {
  title: '',
  category: '',
  status: '',
  location: '',
  description: ''
};

function getSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    return Array.isArray(saved) ? saved : seed;
  } catch {
    return seed;
  }
}

const cap = value => value.charAt(0).toUpperCase() + value.slice(1);

function validate(form, items, editingId) {
  if (!form.title.trim() || form.title.trim().length < 2) {
    return 'Enter an item title containing at least 2 characters.';
  }

  if (!categories.slice(1).includes(form.category)) {
    return 'Choose an item category before publishing.';
  }

  if (!statuses.includes(form.status)) {
    return 'Choose whether the item is lost or found.';
  }

  const duplicate = items.some(item =>
    item.id !== editingId &&
    item.title.trim().toLowerCase() === form.title.trim().toLowerCase() &&
    (item.location || '').trim().toLowerCase() === (form.location || '').trim().toLowerCase()
  );

  if (duplicate) {
    return 'A report with this title and location already exists. Check the existing notice or change the title or location.';
  }

  return '';
}

export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('home');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(items));
  }, [items]);

  const matchingItems = useMemo(() => items.filter(item =>
    (cat === 'all' || item.category === cat) &&
    `${item.title} ${item.location} ${item.description}`.toLowerCase().includes(q.toLowerCase())
  ), [items, q, cat]);

  const filtered = useMemo(() => matchingItems.filter(item =>
    filterStatus === 'all' || item.status === filterStatus
  ), [matchingItems, filterStatus]);

  function openBoard(status = 'all') {
    setFilterStatus(status);
    setPage('board');
    setMessage('');
    setOpenMenu(null);
  }

  function create(initialStatus = '') {
    setCurrent(null);
    setForm({ ...clean, status: initialStatus });
    setError('');
    setPage('form');
  }

  function edit(row) {
    if (row.owner !== 'you' || row.status === 'claimed') return;

    setCurrent(row.id);

    setForm({
      title: row.title,
      category: row.category,
      status: row.status,
      location: row.location,
      description: row.description,
    });

    setOpenMenu(null);
    setError('');
    setPage('form');
  }

  // Mark an existing Found report as Claimed.
  // This updates the existing report instead of creating a new one.
  function markClaimed(item) {
    if (item.owner !== 'you' || item.status !== 'found') return;

    setItems(previousItems => previousItems.map(row =>
      row.id === item.id
        ? {
            ...row,
            status: 'claimed',
            handoverStatus: 'released'
          }
        : row
    ));

    setFilterStatus('claimed');
    setMessage(`"${item.title}" has been marked as claimed.`);
    setOpenMenu(null);
  }

  function submit(event) {
    event.preventDefault();

    const validationMessage = validate(form, items, current);

    if (validationMessage) {
      setError(validationMessage);
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
      ...(current ? {} : {
        collectionPoint: '',
        handoverStatus: 'reported'
      }),
    };

    if (current) {
      setItems(items.map(item =>
        item.id === current ? { ...item, ...data } : item
      ));

      setMessage('Your report has been updated successfully.');
    } else {
      setItems([
        { id: `f-${Date.now()}`, ...data },
        ...items
      ]);

      setMessage('Your report has been posted successfully.');
    }

    setFilterStatus(data.status);
    setPage('board');
    setCurrent(null);
  }

  function reset() {
    setItems(seed);
    setPage('board');
    setQ('');
    setCat('all');
    setFilterStatus('all');
    setMessage('Example reports restored.');
    setOpenMenu(null);
  }

  const columns = [
    {
      key: 'lost',
      title: 'LOST',
      sub: 'Searching for these things',
      icon: '↗'
    },
    {
      key: 'found',
      title: 'FOUND',
      sub: 'Looking for the owners',
      icon: '⌁'
    },
    {
      key: 'claimed',
      title: 'CLAIMED',
      sub: 'Back where they belong',
      icon: '✓'
    },
  ];

  return (
    <div className="notice-app">
      <header className="header">
        <div className="headline">
          <span className="sun">✺</span>

          <button
            onClick={() => setPage('home')}
            className="wordmark"
          >
            FOUND<span>on campus</span>
          </button>

          <p>Community noticeboard</p>
        </div>

        <nav className="header-links" aria-label="Main navigation">
          <button onClick={() => setPage('home')}>Home</button>
          <button onClick={() => openBoard('all')}>Noticeboard</button>
          <button onClick={() => openBoard('lost')}>Missing items</button>
          <button onClick={() => openBoard('found')}>Recently found</button>
        </nav>

        <button
          className="report-button"
          onClick={() => create()}
        >
          + Post a report
        </button>
      </header>

      <div className="ruleline">
        <span>SEARCH • DISCOVER • REUNITE</span>
        <span>Helping lost things find their way back.</span>
      </div>

      {page === 'home' ? (
        <main className="home-page">
          <section className="home-heading">
            <p className="kicker">CAMPUS LOST & FOUND</p>

            <h1>
              Find what you've lost.<br />
              <em>Help return what you've found.</em>
            </h1>

            <p>Choose how you'd like to use the campus noticeboard.</p>
          </section>

          <section
            className="home-options"
            aria-label="Choose what you want to do"
          >
            <button
              className="home-option lost-option"
              onClick={() => openBoard('lost')}
            >
              <span className="home-icon" aria-hidden="true">⌕</span>
              <h2>I lost something</h2>
              <p>Search reports to find your missing item.</p>
              <span className="home-link">Find an item →</span>
            </button>

            <button
              className="home-option found-option"
              onClick={() => create('found')}
            >
              <span className="home-icon" aria-hidden="true">♡</span>
              <h2>I found something</h2>
              <p>Report an item to help its owner find it.</p>
              <span className="home-link">Report an item →</span>
            </button>
          </section>

          <div className="home-browse">
            <p>Just looking for something?</p>
            <button
              className="browse-all"
              onClick={() => openBoard('all')}
            >
              Browse all reports →
            </button>
          </div>
        </main>
      ) : page === 'board' ? (
        <main className="workspace">
          <aside className="filters">
            <p className="kicker">YOUR NOTICEBOARD</p>

            <h1>
              Find an item.<br />
              <em>Reconnect with its owner.</em>
            </h1>

            <p className="intro">
              Search the campus reports, narrow the results,
              and check the item's details.
            </p>

            <div className="filterbox">
              <h3>Find a report</h3>

              <label>
                Search items
                <input
                  value={q}
                  onChange={event => setQ(event.target.value)}
                  placeholder="e.g. black backpack"
                />
              </label>

              <label>
                Item category
                <select
                  value={cat}
                  onChange={event => setCat(event.target.value)}
                >
                  <option value="all">All categories</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {cap(category)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="filterbuttons">
                <button
                  onClick={() =>
                    setMessage(`${filtered.length} reports match your search.`)
                  }
                >
                  Apply
                </button>

                <button
                  onClick={() => {
                    setQ('');
                    setCat('all');
                    setMessage('Search and category filters cleared.');
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="side-message">
              <span>📍</span>
              <strong>Lost or found something?</strong>
              <p>Every report gets us a little closer.</p>
              <button onClick={() => create()}>
                Share your report →
              </button>
            </div>

            <button className="reset" onClick={reset}>
              Reset demo data
            </button>
          </aside>

          <section className="board">
            <div className="board-top">
              <div>
                <p className="kicker">CAMPUS COMMUNITY</p>
                <h2>
                  Campus noticeboard <span>({filtered.length})</span>
                </h2>
              </div>

              <span className="time-note">Updated today</span>
            </div>

            {message && (
              <div className="message" role="status">
                {message}
                <button
                  onClick={() => setMessage('')}
                  aria-label="Dismiss message"
                >
                  ✕
                </button>
              </div>
            )}

            <div
              className="status-tabs"
              role="tablist"
              aria-label="Report status"
            >
              <button
                role="tab"
                aria-selected={filterStatus === 'all'}
                className={filterStatus === 'all' ? 'active' : ''}
                onClick={() => setFilterStatus('all')}
              >
                All reports <span>{filtered.length}</span>
              </button>

              {columns.map(column => (
                <button
                  key={column.key}
                  role="tab"
                  aria-selected={filterStatus === column.key}
                  className={
                    filterStatus === column.key ? 'active' : ''
                  }
                  onClick={() => setFilterStatus(column.key)}
                >
                  {cap(column.key)}
                  <span>
                    {matchingItems.filter(
                      item => item.status === column.key
                    ).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="board-grid single-column">
              {columns
                .filter(column =>
                  filterStatus === 'all' ||
                  filterStatus === column.key
                )
                .map(column => {
                  const columnItems = filtered.filter(
                    item => item.status === column.key
                  );

                  return (
                    <section className="board-column" key={column.key}>
                      <div className="column-head">
                        <span className={`col-icon ${column.key}`}>
                          {column.icon}
                        </span>

                        <div>
                          <strong>{column.title}</strong>
                          <small>{column.sub}</small>
                        </div>

                        <span className="col-count">
                          {columnItems.length}
                        </span>
                      </div>

                      <div className="sticky-list">
                        {columnItems.map(item => (
                          <article className="sticky" key={item.id}>
                            <div className="sticky-top">
                              <span>{item.category}</span>

                              <div className="menu-holder">
                                <button
                                  className="menu"
                                  onClick={() =>
                                    setOpenMenu(
                                      openMenu === item.id ? null : item.id
                                    )
                                  }
                                  aria-label={`Actions for ${item.title}`}
                                >
                                  ···
                                </button>

                                {openMenu === item.id && (
                                  <div className="menu-popup">
                                    {item.owner === 'you' &&
                                    item.status !== 'claimed' ? (
                                      <button onClick={() => edit(item)}>
                                        Edit your report
                                      </button>
                                    ) : item.owner === 'you' ? (
                                      <span>Already claimed</span>
                                    ) : (
                                      <span>
                                        Reported by another student
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="sticky-emoji">
                              {item.emoji}
                            </div>

                            <h3>{item.title}</h3>

                            <p>
                              {item.description ||
                                'No additional description.'}
                            </p>

                            {/* Only the owner of a Found report can mark it claimed. */}
                            {item.owner === 'you' &&
                              item.status === 'found' && (
                                <button
                                  className="claim-button"
                                  onClick={() => markClaimed(item)}
                                >
                                  ✓ Mark as claimed
                                </button>
                              )}

                            {item.status !== 'lost' && (
                              <div className="handover-note">
                                {item.handoverStatus === 'received' &&
                                item.collectionPoint
                                  ? `Received at ${item.collectionPoint}`
                                  : item.handoverStatus === 'released'
                                    ? 'Collected by owner'
                                    : 'Reported found - not confirmed at a collection point'}
                              </div>
                            )}

                            <div className="sticky-bottom">
                              <span>
                                ⌖ {item.location || 'Location not provided'}
                              </span>
                              <small>{item.created}</small>
                            </div>
                          </article>
                        ))}

                        {columnItems.length === 0 && (
                          <div className="empty-column">
                            No {column.key} reports match your search.
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
            </div>
          </section>
        </main>
      ) : (
        <main className="report-page">
          <div className="crumbs">
            <button onClick={() => setPage('home')}>← Home</button>
            <span>/</span>
            <button onClick={() => openBoard('all')}>Noticeboard</button>
            <span>/</span>
            <span>{current ? 'Edit report' : 'Report an item'}</span>
          </div>

          <div className="report-layout">
            <div className="report-intro">
              <span className="seal">✺</span>
              <p className="kicker">HELP THE COMMUNITY</p>

              <h1>
                {current
                  ? 'Update your report.'
                  : 'Tell us what happened.'}
              </h1>

              <p>
                Small details can help someone recognize their belongings.
              </p>

              <div className="paper-note">
                Your report will appear on the public campus noticeboard
                with the details you provide.
              </div>
            </div>

            <section className="form-paper">
              <header>
                <p>NEW NOTICE / FORM 01</p>
                <h2>{current ? 'Edit report' : 'Report an item'}</h2>
              </header>

              <form onSubmit={submit}>
                <label>
                  Item title <b>*</b>
                  <input
                    value={form.title}
                    onChange={event =>
                      setForm(state => ({
                        ...state,
                        title: event.target.value
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
                      setForm(state => ({
                        ...state,
                        status: event.target.value
                      }))
                    }
                  >
                    <option value="">Choose one</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
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
                      setForm(state => ({
                        ...state,
                        category: event.target.value
                      }))
                    }
                  >
                    <option value="">Select item category</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>
                        {cap(category)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Last known location
                  <input
                    value={form.location}
                    onChange={event =>
                      setForm(state => ({
                        ...state,
                        location: event.target.value
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
                      setForm(state => ({
                        ...state,
                        description: event.target.value
                      }))
                    }
                    placeholder="Describe the item (optional)"
                  />
                </label>

                {error && (
                  <div className="form-error" role="alert">
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setPage('home')}
                  >
                    Cancel
                  </button>

                  <button className="report-button" type="submit">
                    {current ? 'Save report' : 'Publish notice'}
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
