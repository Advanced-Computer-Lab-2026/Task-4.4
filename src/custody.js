// Custody = where a reported item physically is right now.
// The order of the checks below matches the original card text exactly:
// lost items show nothing, then "received" with a collection point, then
// "released", and everything else is only a report (never shown as held).

export const COLLECTION_POINTS = ['Campus Security Desk', 'Student Services Office', 'Library Reception'];

export const CUSTODY_FILTERS = {
  all: 'Any handover status',
  held: 'Held at a collection point',
  reported: 'Reported only – not with staff',
};

const NEXT_STEP_HELD =
  'Staff will release it after you verify ownership. Bring your student ID and a description of the item.';
const NEXT_STEP_REPORTED = 'Not yet handed to staff. Check again later or ask at a collection point.';

export function custody(item) {
  if (item.status === 'lost') return { kind: null, label: '', next: '' };
  if (item.handoverStatus === 'received' && item.collectionPoint) {
    return { kind: 'held', label: `Received at ${item.collectionPoint}`, next: NEXT_STEP_HELD };
  }
  if (item.handoverStatus === 'released') return { kind: 'released', label: 'Collected by owner', next: '' };
  return {
    kind: 'reported',
    label: 'Reported found - not confirmed at a collection point',
    next: NEXT_STEP_REPORTED,
  };
}
