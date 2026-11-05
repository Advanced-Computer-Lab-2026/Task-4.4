import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_FILE_BYTES, validatePhotoSelection} from '../src/photos.js';

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
