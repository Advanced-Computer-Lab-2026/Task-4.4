import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesSearch, validateReport, collectionInfo} from './report-utils.js';

const report = {id:'one', title:'Black backpack', location:'Library - second floor', description:'Red keychain', category:'accessories', status:'lost'};
test('search finds words across fields regardless of order, spacing or case', () => {
  assert.equal(matchesSearch(report, '  LIBRARY   backpack '), true);
  assert.equal(matchesSearch(report, 'keychain library'), true);
  assert.equal(matchesSearch(report, 'library earbuds'), false);
  assert.equal(matchesSearch(report, '  '), true);
});
test('all required fields have specific errors and optional fields remain optional', () => {
  assert.deepEqual(Object.keys(validateReport({title:' ',status:'',category:'',location:''},[],null)), ['title','status','category']);
  assert.deepEqual(validateReport({...report,location:'',description:''},[],null), {});
  assert.ok(validateReport({...report,title:'a'},[],null).title);
  assert.ok(validateReport({...report,status:'invalid'},[],null).status);
  assert.ok(validateReport({...report,category:'invalid'},[],null).category);
});
test('duplicates ignore case and surrounding whitespace, allow other locations and self-edits', () => {
  assert.ok(validateReport({...report,title:' BLACK BACKPACK ',location:' library - second floor '},[report],null).title);
  assert.deepEqual(validateReport({...report,location:'Cafeteria'},[report],null), {});
  assert.deepEqual(validateReport(report,[report],'one'), {});
});
test('collection guidance never implies unconfirmed items are held by staff', () => {
  assert.equal(collectionInfo({...report,status:'found',collectionPoint:'Security',handoverStatus:'reported'}).kind,'reported');
  assert.equal(collectionInfo({...report,status:'found',handoverStatus:'received'}).kind,'reported');
  const received=collectionInfo({...report,status:'found',collectionPoint:'Library Reception',handoverStatus:'received'});
  assert.equal(received.kind,'received');
  assert.match(received.guidance,/verify ownership/);
  assert.equal(collectionInfo({...report,status:'claimed',collectionPoint:'Security',handoverStatus:'received'}).kind,'claimed');
});
