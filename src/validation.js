export function validateReport(form, items, currentId) {
  const errors = {};
  if (form.title.trim().length < 2) {
    errors.title = 'Enter an item title with at least 2 characters, such as “Black backpack”.';
  }
  if (!['lost', 'found', 'claimed'].includes(form.status)) {
    errors.status = 'Choose whether the item is lost, found, or claimed.';
  }
  if (!['electronics', 'clothing', 'documents', 'accessories', 'other'].includes(form.category)) {
    errors.category = 'Choose an item category. Select Other if none of the categories fit.';
  }
  if (!errors.title && items.some(item => item.id !== currentId &&
    item.title.trim().toLowerCase() === form.title.trim().toLowerCase() &&
    (item.location || '').trim().toLowerCase() === form.location.trim().toLowerCase())) {
    errors.title = 'A report with this title and location already exists. Edit your existing report, or add details to the title or location to distinguish this item.';
  }
  return errors;
}
