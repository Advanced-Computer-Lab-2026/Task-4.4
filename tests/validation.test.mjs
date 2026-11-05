import test from 'node:test';
import assert from 'node:assert/strict';
import { validate, categories, statuses } from '../src/validation.js';

const valid = { title: 'Keys', category: 'accessories', status: 'found', location: '', description: '' };
const existing = [{ id: 'one', ...valid, location: 'Library' }];

test('all original categories and statuses accept optional blank fields', () => {
  for (const category of categories.slice(1)) {
    for (const status of statuses) assert.deepEqual(validate({ ...valid, category, status }, []), {});
  }
});
test('title is trimmed and requires two characters; category and status are required', () => {
  assert.deepEqual(Object.keys(validate({ ...valid, title: ' x ', category: '', status: '' }, [])), ['title', 'status', 'category']);
  assert.deepEqual(validate({ ...valid, title: ' OK ' }, []), {});
});
test('duplicate title and location are blocked regardless of case, spacing or status', () => {
  const errors = validate({ ...valid, title: ' KEYS ', location: ' library ', status: 'lost' }, existing);
  assert.ok(errors.title);
  assert.ok(errors.location);
  assert.deepEqual(validate({ ...valid, location: 'Cafeteria' }, existing), {});
});
test('editing itself is allowed, editing into another report is blocked', () => {
  assert.deepEqual(validate({ ...valid, location: 'Library' }, existing, 'one'), {});
  assert.ok(validate({ ...valid, location: 'Library' }, existing, 'two').title);
});
test('duplicate reports without a location are also blocked', () => {
  assert.ok(validate(valid, [{ id: 'one', ...valid }]).title);
});
