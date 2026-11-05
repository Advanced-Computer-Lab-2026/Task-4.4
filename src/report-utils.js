export const categories = ['electronics', 'clothing', 'documents', 'accessories', 'other'];
export const statuses = ['lost', 'found', 'claimed'];

export function matchesSearch(item, query) {
  const text = `${item.title} ${item.location || ''} ${item.description || ''}`.toLowerCase();
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean).every(word => text.includes(word));
}

export function validateReport(form, items, id) {
  const errors = {};
  if (form.title.trim().length < 2) errors.title = 'Enter an item title with at least 2 characters.';
  if (!statuses.includes(form.status)) errors.status = 'Choose lost, found or claimed.';
  if (!categories.includes(form.category)) errors.category = 'Choose an item category.';
  if (!errors.title && items.some(item => item.id !== id &&
    item.title.trim().toLowerCase() === form.title.trim().toLowerCase() &&
    (item.location || '').trim().toLowerCase() === form.location.trim().toLowerCase())) {
    errors.title = 'This title is already reported at this location. Change the title or location, or edit your existing report.';
  }
  return errors;
}

export function collectionInfo(item) {
  if (item.status === 'claimed') return {kind: 'claimed', label: 'Already claimed', detail: 'This item has been marked as claimed and is no longer awaiting collection.'};
  if (item.handoverStatus === 'received' && item.collectionPoint) {
    return {kind: 'received', label: 'Received by staff', detail: `Collection point: ${item.collectionPoint}`, guidance: 'If this may be yours, visit this collection point. Be ready to describe identifying details; staff must verify ownership before releasing the item.'};
  }
  return {kind: 'reported', label: 'Handover unconfirmed', detail: 'Reported found · no confirmed collection point', guidance: 'Do not travel to a collection point for this item yet. If you found it, hand it to a designated campus collection point. Posting a notice does not confirm that staff have received it.'};
}
