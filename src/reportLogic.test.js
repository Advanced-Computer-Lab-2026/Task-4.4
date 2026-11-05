import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { byNewest, custody, findMatches, matchesQuery, nextStep, similarReports, validate } from './reportLogic.js';

// Read the real example records from App.jsx so these tests can't drift from them.
const source = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const seed = new Function(`return ${source.match(/const seed=(\[[\s\S]*?\n\]);/)[1]}`)();
const byId = id => seed.find(r => r.id === id);
const titles = list => list.map(r => r.title);
const search = q => seed.filter(r => matchesQuery(r, q));
const valid = { title: 'Red scarf', category: 'clothing', status: 'lost', location: '', description: '' };

test('seed data still has all 13 example records', () => {
  assert.equal(seed.length, 13);
});

test('title needs at least two characters after trimming', () => {
  assert.equal(validate({ ...valid, title: '' }, seed).title, 'Title must be at least 2 characters.');
  assert.equal(validate({ ...valid, title: ' a ' }, seed).title, 'Title must be at least 2 characters.');
  assert.deepEqual(validate({ ...valid, title: 'ab' }, seed), {});
});

test('category and status are required and every problem is reported at once', () => {
  const errors = validate({ ...valid, title: '', category: '', status: '' }, seed);
  assert.deepEqual(Object.keys(errors).sort(), ['category', 'status', 'title']);
});

test('same title at the same location is rejected, ignoring case and spaces', () => {
  const errors = validate({ ...valid, title: '  BLACK backpack ', location: ' library - SECOND floor ' }, seed);
  assert.match(errors.title, /already been reported/);
  assert.equal(errors.duplicateOf.id, 'f1');
});

test('same title at a different location is allowed', () => {
  assert.deepEqual(validate({ ...valid, title: 'Black backpack', location: 'Gym' }, seed), {});
});

test('a report does not count as a duplicate of itself when edited', () => {
  const r = byId('f1');
  assert.deepEqual(validate(r, seed, 'f1'), {});
});

test('search finds words in any order and across fields', () => {
  assert.deepEqual(titles(search('blue water bottle')).sort(), ['Blue sports bottle', 'Metal water bottle']);
  assert.deepEqual(titles(search('keychain backpack')).sort(), ['Black backpack', 'Dark backpack']);
});

test('search also covers category and collection point', () => {
  assert.equal(search('electronics').length, 5);
  assert.deepEqual(titles(search('security desk')).sort(), ['Dark backpack', 'Metal water bottle']);
});

test('search stays a superset of the old exact-phrase search', () => {
  for (const q of ['library', 'black backpack', 'near', 'b2', 'blue case', 'student']) {
    const old = seed.filter(x => `${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q));
    for (const r of old) assert.ok(matchesQuery(r, q), `${r.title} lost for "${q}"`);
  }
});

test('similar reports recover near misses without colour noise', () => {
  assert.deepEqual(titles(similarReports(seed, 'black backpack')), ['Dark backpack']);
  assert.deepEqual(titles(similarReports(seed, 'wireless earbuds')), ['Earbuds in blue case']);
  assert.deepEqual(titles(similarReports(seed, 'blue calculator')).sort(), ['Calculator', 'Scientific calculator']);
  assert.deepEqual(similarReports(seed, 'black blue'), []);
  assert.deepEqual(similarReports(seed, 'backpack'), []);
});

test('possible matches link exactly the four real pairs in the example data', () => {
  const pairs = seed.filter(r => r.status === 'lost').flatMap(r => findMatches(r, seed).map(m => `${r.id}-${m.report.id}`));
  assert.deepEqual(pairs.sort(), ['f10-f11', 'f1-f2', 'f4-f5', 'f6-f7'].sort());
});

test('matching works in both directions and never suggests claimed reports', () => {
  assert.deepEqual(findMatches(byId('f2'), seed).map(m => m.report.id), ['f1']);
  assert.deepEqual(findMatches(byId('f8'), seed), []);
  const twin = { ...byId('f8'), id: 'x', status: 'lost' };
  assert.deepEqual(findMatches(twin, seed), []);
});

test('a shared colour alone is not a match', () => {
  const lost = { id: 'a', title: 'Black wallet', category: 'accessories', status: 'lost' };
  const found = { id: 'b', title: 'Black backpack', category: 'accessories', status: 'found' };
  assert.deepEqual(findMatches(lost, [found]), []);
});

test('a shared noun in both titles is enough, even with no description', () => {
  const lost = { id: 'a', title: 'Umbrella', category: 'other', status: 'lost' };
  const found = { id: 'b', title: 'Grey umbrellas', category: 'other', status: 'found' };
  assert.equal(findMatches(lost, [found]).length, 1);
});

test('only received records with a named collection point claim to be at one', () => {
  assert.equal(custody(byId('f2')).label, 'Received at Campus Security Desk');
  assert.equal(custody(byId('f5')).label, 'Not confirmed at a collection point');
  assert.equal(custody({ ...byId('f2'), collectionPoint: '' }).label, 'Not confirmed at a collection point');
  assert.equal(custody({ status: 'found' }).tone, 'reported');
  assert.equal(custody(byId('f1')), null);
});

test('claimed items never imply a handover that is not on record', () => {
  assert.equal(custody(byId('f8')).label, 'Collected by owner');
  const c = custody({ status: 'claimed', handoverStatus: 'reported', collectionPoint: '' });
  assert.equal(c.label, 'Marked claimed by the reporter');
  assert.match(c.detail, /No collection point handover/);
});

test('next steps send people to a desk only when the item is on record there', () => {
  assert.match(nextStep(byId('f2')), /go to Campus Security Desk/);
  assert.match(nextStep(byId('f5')), /don't go to a desk/);
  assert.match(nextStep({ ...byId('f5'), owner: 'you' }), /Hand it in/);
});

test('new reports sort first, then newest date', () => {
  const sorted = [byId('f8'), { ...byId('f1'), created: 'Today' }, byId('f13')].sort(byNewest);
  assert.deepEqual(sorted.map(r => r.created), ['Today', 'Oct 27', 'Oct 22']);
});
