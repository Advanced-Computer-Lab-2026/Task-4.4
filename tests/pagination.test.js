import test from 'node:test';
import assert from 'node:assert/strict';
import {paginateReports} from '../src/pagination.js';

test('every report is reachable once across pages of three', () => {
  const reports = Array.from({length: 8}, (_, id) => ({id}));
  const pages = [1, 2, 3].map(page => paginateReports(reports, page));
  assert.deepEqual(pages.map(page => page.items.length), [3, 3, 2]);
  assert.deepEqual(pages.flatMap(page => page.items), reports);
  assert.deepEqual(pages.map(page => [page.first, page.last]), [[1, 3], [4, 6], [7, 8]]);
});

test('an exact multiple has no extra empty page', () => {
  const reports = ['a', 'b', 'c', 'd', 'e', 'f'];
  assert.equal(paginateReports(reports, 2).pageCount, 2);
  assert.deepEqual(paginateReports(reports, 2).items, ['d', 'e', 'f']);
});

test('a narrowed filter or status clamps a stale page to available results', () => {
  const result = paginateReports(['only match'], 3);
  assert.equal(result.page, 1);
  assert.equal(result.pageCount, 1);
  assert.deepEqual(result.items, ['only match']);
});

test('empty results have a stable first page and a zero result range', () => {
  assert.deepEqual(paginateReports([], 4), {items: [], page: 1, pageCount: 1, total: 0, first: 0, last: 0});
});
