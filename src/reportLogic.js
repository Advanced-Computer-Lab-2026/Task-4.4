// Pure report rules: validation, search, match suggestions and custody wording.
// Nothing here touches React or localStorage, so `npm test` can exercise it directly.

export const categories = ['all', 'electronics', 'clothing', 'documents', 'accessories', 'other'];
export const statuses = ['lost', 'found', 'claimed'];
export const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Validation ---------- */

function findDuplicate(f, arr, id) {
  const title = f.title.trim().toLowerCase();
  const location = (f.location || '').trim().toLowerCase();
  return arr.find(r => r.id !== id && r.title.toLowerCase() === title && (r.location || '').toLowerCase() === location);
}

// Returns one message per invalid field, so the form can say exactly what to fix.
// An empty object means the report can be saved.
export function validate(f, arr, id) {
  const errors = {};
  if (f.title.trim().length < 2) errors.title = 'Title must be at least 2 characters.';
  if (!categories.slice(1).includes(f.category)) errors.category = 'Choose a category.';
  if (!statuses.includes(f.status)) errors.status = 'Choose lost, found or claimed.';
  const duplicate = findDuplicate(f, arr, id);
  if (duplicate && !errors.title) {
    errors.title = 'An item with the same title has already been reported at this location.';
    errors.duplicateOf = duplicate;
  }
  return errors;
}

/* ---------- Search ---------- */

const toWords = text => (text || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const searchText = r => [r.title, r.location, r.description, r.category, r.collectionPoint].filter(Boolean).join(' ').toLowerCase();

// Every word must appear somewhere in the report, in any order. Anything the old
// exact-phrase search found still matches, because each word of a phrase is present.
export function matchesQuery(report, q) {
  const text = searchText(report);
  return toWords(q).every(w => text.includes(w));
}

const COLOURS = new Set(['black', 'white', 'blue', 'red', 'green', 'grey', 'gray', 'brown', 'beige', 'dark', 'light', 'yellow', 'pink', 'purple', 'orange', 'silver', 'gold', 'navy']);
const STOP_WORDS = new Set(['a', 'an', 'and', 'after', 'at', 'beside', 'building', 'by', 'for', 'found', 'from', 'has', 'have', 'in', 'is', 'it', 'its', 'left', 'lost', 'main', 'my', 'near', 'no', 'of', 'on', 'one', 'or', 'possibly', 'side', 'small', 'the', 'this', 'to', 'turned', 'was', 'with']);
const singular = w => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const keywords = text => toWords(text).filter(w => w.length > 1 && !STOP_WORDS.has(w)).map(singular);

// Second tier for multi-word searches: reports that miss some words but share a
// describing word. Colours are excluded, otherwise "black backpack" pulls in every
// black item. People also describe colour differently ("black" vs "dark").
export function similarReports(list, q) {
  const wanted = [...new Set(keywords(q))].filter(w => !COLOURS.has(w));
  if (toWords(q).length < 2 || !wanted.length) return [];
  const hits = r => {
    const words = keywords(searchText(r));
    return wanted.filter(w => words.some(x => x.startsWith(w))).length;
  };
  return list
    .filter(r => !matchesQuery(r, q) && hits(r) > 0)
    .sort((a, b) => hits(b) - hits(a) || byNewest(a, b));
}

/* ---------- Possible matches between lost and found reports ---------- */

const MATCH_THRESHOLD = 2;

function compare(a, b) {
  if (a.category !== b.category) return { score: 0, shared: [] };
  const titleA = new Set(keywords(a.title));
  const titleB = new Set(keywords(b.title));
  const allA = new Set([...titleA, ...keywords(`${a.location || ''} ${a.description || ''}`)]);
  const allB = new Set([...titleB, ...keywords(`${b.location || ''} ${b.description || ''}`)]);
  const shared = [...allA].filter(w => allB.has(w));
  // A noun in both titles is strong evidence. A colour alone is not.
  const score = shared.reduce((sum, w) => sum + (titleA.has(w) && titleB.has(w) && !COLOURS.has(w) ? 2 : 1), 0);
  return { score, shared };
}

// A suggestion only: a lost report is compared with found reports and vice versa.
// Claimed reports are finished, so they are never suggested.
export function findMatches(report, items) {
  const opposite = { lost: 'found', found: 'lost' }[report.status];
  if (!opposite) return [];
  return items
    .filter(r => r.status === opposite && r.id !== report.id)
    .map(r => ({ report: r, ...compare(report, r) }))
    .filter(m => m.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}

/* ---------- Custody: where the item physically is, according to the data ---------- */

// Wording stays tied to handoverStatus and collectionPoint. Only `received` with a
// named collection point may say that an item reached one.
export function custody(report) {
  if (report.status === 'lost') return null;
  const point = report.collectionPoint;
  if (report.handoverStatus === 'released') {
    return { tone: 'released', icon: 'check', label: 'Collected by owner', detail: point ? `Released from ${point}.` : '' };
  }
  if (report.handoverStatus === 'received' && point) {
    return {
      tone: 'received',
      icon: 'building',
      label: `Received at ${point}`,
      detail: report.status === 'claimed' ? 'Marked claimed. No release is on record.' : 'Ownership is verified before release.',
    };
  }
  if (report.status === 'claimed') {
    return { tone: 'released', icon: 'check', label: 'Marked claimed by the reporter', detail: 'No collection point handover is on record.' };
  }
  return {
    tone: 'reported',
    icon: 'alert',
    label: 'Not confirmed at a collection point',
    detail: report.owner === 'you' ? 'Reported only. Please hand it in at a collection point.' : 'Reported only. The item may still be with the finder.',
  };
}

// What to do about a possible match, based on where the found item is on record.
export function nextStep(found) {
  const received = found.handoverStatus === 'received' && found.collectionPoint;
  if (found.owner === 'you') {
    return received
      ? `Your found report is recorded at ${found.collectionPoint}. Its owner can recover it there once ownership is verified.`
      : 'You reported this item, but no handover is on record. Hand it in at a collection point so its owner can recover it.';
  }
  return received
    ? `If this is yours, go to ${found.collectionPoint}. Ownership is verified there before anything is released.`
    : "This item isn't confirmed at a collection point, so don't go to a desk expecting it yet. Check back here: the report will show where it is once a handover is recorded.";
}

/* ---------- Ordering ---------- */

// `created` is display text such as "Oct 23" or "Today", so it is parsed for sorting only.
function createdRank(r) {
  if (r.created === 'Today') return Infinity;
  const t = Date.parse(`${r.created} 2000`);
  return Number.isNaN(t) ? 0 : t;
}

export function byNewest(a, b) {
  const x = createdRank(a);
  const y = createdRank(b);
  return x === y ? 0 : y - x;
}
