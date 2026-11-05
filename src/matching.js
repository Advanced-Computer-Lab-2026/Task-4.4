// Conservative, local suggestions. A suggestion never changes either report.
const commonWords = new Set('a an the and or with without in on at to of for from by my your was is it its has have this that near beside after before left lost found missing report reported item small large main'.split(' '));
const colors = new Set('black dark white blue red green yellow grey gray brown beige pink purple orange silver gold metal'.split(' '));

function words(text = '', ignoreColors = false) {
  return new Set(text.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)
    ?.map(word => word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word)
    .filter(word => word.length > 1 && !commonWords.has(word) && (!ignoreColors || !colors.has(word))) || []);
}

const shared = (a, b) => [...a].filter(word => b.has(word));

export function findPossibleMatches(report, reports) {
  if (!['lost', 'found'].includes(report.status)) return [];
  const titleWords = words(report.title, true);
  const details = words(`${report.title} ${report.description || ''}`);
  const location = words(report.location);

  return reports.flatMap(candidate => {
    if (candidate.id === report.id || candidate.category !== report.category ||
        candidate.status !== (report.status === 'lost' ? 'found' : 'lost')) return [];

    const names = shared(titleWords, words(candidate.title, true));
    if (!names.length) return [];
    const detailsInCommon = shared(details, words(`${candidate.title} ${candidate.description || ''}`));
    const locations = shared(location, words(candidate.location));
    // A generic item name alone is insufficient: require supporting wording.
    const supportingDetails = detailsInCommon.filter(word => !names.includes(word));
    if (!supportingDetails.length && !locations.length && names.length < 2) return [];

    const reasons = ['Similar item name'];
    if (supportingDetails.length) reasons.push(`Shared details: ${supportingDetails.slice(0, 3).join(', ')}`);
    if (locations.length) reasons.push(`Shared location wording: ${locations.slice(0, 2).join(', ')}`);
    return [{report: candidate, reasons, score: names.length * 4 + supportingDetails.length + locations.length * 2}];
  }).sort((a, b) => b.score - a.score || a.report.id.localeCompare(b.report.id));
}
