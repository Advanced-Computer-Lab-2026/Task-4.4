import { custody } from './custody.js';

export const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// Every word of the query must appear somewhere in the report, in any order.
export function matchesSearch(item, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = [item.title, item.location, item.description, item.category]
    .map(value => value || '')
    .join(' ')
    .toLowerCase();
  return words.every(word => haystack.includes(word));
}

// filters: { q, cat, status, custody, mine }
export function matchesFilters(item, filters) {
  return (
    (filters.cat === 'all' || item.category === filters.cat) &&
    (filters.status === 'all' || item.status === filters.status) &&
    (filters.custody === 'all' || custody(item).kind === filters.custody) &&
    (!filters.mine || item.owner === 'you') &&
    matchesSearch(item, filters.q)
  );
}
