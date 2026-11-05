import test from 'node:test';
import assert from 'node:assert/strict';
import {findPossibleMatches} from '../src/matching.js';

const lost = {id: 'lost', status: 'lost', category: 'accessories', title: 'Black backpack',
  description: 'Black backpack with a small red keychain.', location: 'Library - second floor'};
const found = {id: 'found', status: 'found', category: 'accessories', title: 'Dark backpack',
  description: 'Found a dark backpack with a small red keychain.', location: 'Library - main stairwell'};

test('suggests a related lost/found pair in either direction with explainable evidence', () => {
  const matches = findPossibleMatches(lost, [lost, found]);
  assert.deepEqual(matches.map(match => match.report.id), ['found']);
  assert.ok(matches[0].reasons.some(reason => reason.includes('keychain')));
  assert.ok(matches[0].reasons.some(reason => reason.includes('library')));
  assert.equal(findPossibleMatches(found, [lost, found])[0].report.id, 'lost');
});

test('does not suggest claimed, same-status, other-category or unrelated items', () => {
  const candidates = [
    {...found, id: 'claimed', status: 'claimed'},
    {...found, id: 'same-status', status: 'lost'},
    {...found, id: 'other-category', category: 'electronics'},
    {...found, id: 'unrelated', title: 'Red keychain', description: 'A keychain.', location: 'Library'},
  ];
  assert.deepEqual(findPossibleMatches(lost, candidates), []);
  assert.deepEqual(findPossibleMatches({...lost, status: 'claimed'}, [found]), []);
});

test('shared category, color or a generic item name alone is insufficient', () => {
  assert.deepEqual(findPossibleMatches({...lost, title: 'Blue bag', description: '', location: ''},
    [{...found, title: 'Blue scarf', description: '', location: ''}]), []);
  assert.deepEqual(findPossibleMatches({...lost, description: '', location: ''},
    [{...found, description: '', location: ''}]), []);
});

test('handles optional fields, case and plural titles without modifying reports', () => {
  const reports = [Object.freeze({...lost, title: 'BACKPACKS', description: undefined}),
    Object.freeze({...found, description: undefined})];
  assert.equal(findPossibleMatches(reports[0], reports)[0].report.id, 'found');
  assert.equal(reports[0].status, 'lost');
  assert.equal(reports[1].status, 'found');
});

test('suggestions are recalculated from edited records and do not retain stale matches', () => {
  assert.equal(findPossibleMatches(lost, [found]).length, 1);
  assert.deepEqual(findPossibleMatches(lost, [{...found, title: 'Canvas tote bag', description: 'Beige tote', location: ''}]), []);
});
