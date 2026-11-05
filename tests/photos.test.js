import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_FILE_BYTES, validatePhotoSelection} from '../src/photos.js';
import {withExamplePhotos} from '../src/examplePhotos.js';

const image = {name: 'backpack.jpg', type: 'image/jpeg', size: 10000};

test('allows multiple supported images, including adding to an existing selection', () => {
  assert.equal(validatePhotoSelection([image, {...image, type:'image/png'}, {...image, type:'image/webp'}], 2), '');
});
test('rejects selections exceeding the report limit', () => {
  assert.match(validatePhotoSelection([image, image], 4), /up to 5 photos/);
});
test('rejects unsupported file types and identifies the file', () => {
  assert.match(validatePhotoSelection([{...image, name:'notes.txt', type:'text/plain'}]), /notes\.txt: choose a JPG, PNG or WebP/);
});
test('rejects oversized images while allowing the size boundary', () => {
  assert.equal(validatePhotoSelection([{...image, size:MAX_FILE_BYTES}]), '');
  assert.match(validatePhotoSelection([{...image, size:MAX_FILE_BYTES+1}]), /10 MB or smaller/);
});

test('legacy demo reports receive a mix of sample galleries and no photos', () => {
  const [backpack, earbuds, custom] = withExamplePhotos([{id:'f1'}, {id:'f4'}, {id:'my-report'}]);
  assert.equal(backpack.photos.length, 2);
  assert.deepEqual(earbuds.photos, []);
  assert.deepEqual(custom.photos, []);
});

test('sample migration preserves uploaded photos and deliberate removals', () => {
  const removed = {id:'f1', photos:[]};
  const uploaded = {id:'f2', photos:[{id:'my-photo', dataUrl:'data:image/jpeg;base64,test'}]};
  const result = withExamplePhotos([removed, uploaded]);
  assert.equal(result[0], removed);
  assert.equal(result[1], uploaded);
});

test('adding sample images does not mutate saved legacy objects', () => {
  const legacy = Object.freeze({id:'f1', title:'My edited title'});
  const result = withExamplePhotos([legacy]);
  assert.equal(result[0].title, 'My edited title');
  assert.equal(result[0].photos.length, 2);
  assert.equal(legacy.photos, undefined);
});
