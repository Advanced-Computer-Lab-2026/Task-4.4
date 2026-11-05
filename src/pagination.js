export const REPORTS_PER_PAGE = 3;

export function paginateReports(reports, requestedPage = 1) {
  const pageCount = Math.max(1, Math.ceil(reports.length / REPORTS_PER_PAGE));
  const page = Math.max(1, Math.min(requestedPage, pageCount));
  const offset = (page - 1) * REPORTS_PER_PAGE;
  return {
    items: reports.slice(offset, offset + REPORTS_PER_PAGE),
    page,
    pageCount,
    total: reports.length,
    first: reports.length ? offset + 1 : 0,
    last: Math.min(offset + REPORTS_PER_PAGE, reports.length),
  };
}
