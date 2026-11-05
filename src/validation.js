export const categories = ['all', 'electronics', 'clothing', 'documents', 'accessories', 'other'];
export const statuses = ['lost', 'found', 'claimed'];

const normalize = value => (value || '').trim().toLowerCase();

export function validate(form, items, currentId) {
  const errors = {};
  if ((form.title || '').trim().length < 2) errors.title = 'Enter at least 2 characters.';
  if (!statuses.includes(form.status)) errors.status = 'Choose Lost, Found or Claimed.';
  if (!categories.slice(1).includes(form.category)) errors.category = 'Choose an item category.';
  if (items.some(item => item.id !== currentId && normalize(item.title) === normalize(form.title) && normalize(item.location) === normalize(form.location))) {
    const duplicate = 'This title is already reported at this location. Check the existing notice or correct the title or location.';
    errors.title = errors.title || duplicate;
    errors.location = 'Check the location or edit the existing report instead.';
  }
  return errors;
}
