// Retests the new behaviour and everything the brief says must keep working, then saves "after" screenshots.
// Needs Google Chrome and a running dev server. Run: npm run dev, then in a second terminal: node submission/tests/check-app.mjs
// If the server isn't on http://127.0.0.1:5173/, set BASE_URL.
import { launch } from './cdp.mjs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const scratch = tmpdir();
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../screenshots');
const SEARCH = '.filterbox input', CAT = '.filterbox label:nth-of-type(2) select', STATUS = '.filterbox label:nth-of-type(3) select';
const p = await launch({ scratch });
await p.viewport(1440, 1000);
let pass = 0; const failures = [];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const check = (name, ok, got) => { if (ok) pass++; else failures.push(name); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  -> ' + JSON.stringify(got)}`); };
const card = title => `[...document.querySelectorAll('.sticky')].find(s=>s.querySelector('h3').innerText===${JSON.stringify(title)})`;
const note = title => p.evaluate(`(${card(title)}).querySelector('.handover-note')?.innerText`);
const dateOf = title => p.evaluate(`(${card(title)}).querySelector('.sticky-bottom small').innerText`);
const openEdit = async title => { await p.evaluate(`document.querySelector('[aria-label="Actions for ${title}"]').click()`); await p.settle(); };
const openForm = () => p.click('.header .report-button', 'Post a report');
const fill = async f => { for (const [k, v] of Object.entries(f)) await p.set(`#field-${k}`, v); };
const publish = () => p.click('.form-paper button[type=submit]', '');

try {
  // ---------- Fix 1: finding a matching notice ----------
  await p.fresh();
  let b = await p.board();
  check('default board shows all 13 notices in the original order', b.lost.length === 6 && b.found.length === 6 && b.claimed.length === 1 && b.lost[0] === 'Black backpack' && b.found[5] === 'USB flash drive', b);
  await p.shot(`${OUT}/after-1-board.png`);

  await p.set(SEARCH, 'black backpack'); b = await p.board();
  check('"black backpack" now surfaces the found "Dark backpack"', same(b.lost, ['Black backpack']) && same(b.found, ['Dark backpack']), b);
  check('...and labels it as a partial match', (await p.text('.match-chip'))[0] === 'Partial match: backpack', await p.text('.match-chip'));
  check('...and does not flood results with black calculators/drives', b.found.length + b.lost.length + b.claimed.length === 2, b);
  const plainAnyWord = await p.evaluate(`JSON.parse(localStorage.getItem('acl-foundboard-v3')).filter(x=>['black','backpack'].some(w=>(x.title+' '+x.location+' '+x.description).toLowerCase().includes(w))).length`);
  console.log(`      (for comparison, plain any-word matching would return ${plainAnyWord} notices for this query)`);
  check('summary reports the result count and partial count', (await p.text('.results-bar'))[0].includes('Showing 2 of 13') && (await p.text('.results-bar'))[0].includes('1 partial match'), await p.text('.results-bar'));
  await p.shot(`${OUT}/after-2-search-black-backpack.png`);

  await p.set(SEARCH, 'blue bottle'); b = await p.board();
  check('"blue bottle" finds both bottles (was 0 results)', same(b.lost, ['Blue sports bottle']) && b.found[0] === 'Metal water bottle', b);
  check('partial matches rank after full matches', b.found[0] === 'Metal water bottle' && b.found[1] === 'Earbuds in blue case', b);
  await p.shot(`${OUT}/after-3-search-blue-bottle.png`);
  await p.set(SEARCH, 'bottle blue'); b = await p.board();
  check('word order no longer matters', same(b.lost, ['Blue sports bottle']), b);
  await p.set(SEARCH, 'backpacks'); b = await p.board();
  check('plural query finds singular text', b.lost.includes('Black backpack') && b.found.includes('Dark backpack'), b);
  await p.set(SEARCH, 'ACKPA'); b = await p.board();
  check('REGRESSION: mid-word, case-insensitive text search still works', b.lost.includes('Black backpack'), b);
  await p.set(SEARCH, 'second floor'); b = await p.board();
  check('REGRESSION: search still covers location', same(b.lost, ['Black backpack']) && b.found.length === 0, b);
  await p.set(SEARCH, 'keychain'); b = await p.board();
  check('REGRESSION: search still covers description', b.lost.includes('Black backpack') && b.found.includes('Dark backpack'), b);
  await p.set(SEARCH, 'the'); b = await p.board();
  check('a stop-word-only query stays a plain text search (no crash)', Array.isArray(b.lost), b);

  await p.set(SEARCH, 'wallet');
  check('no-results panel names the query', (await p.text('.no-results strong'))[0].includes('wallet'), await p.text('.no-results strong'));
  await p.shot(`${OUT}/after-4-no-results.png`);
  await p.click('.no-results .report-button', 'Post a lost report');
  check('"Post a lost report" prefills title and status', (await p.evaluate(`document.getElementById('field-title').value`)) === 'wallet' && (await p.evaluate(`document.getElementById('field-status').value`)) === 'lost');
  await p.click('.form-actions button', 'Go back');
  await p.click('.no-results .secondary-button', 'Clear filters');
  b = await p.board();
  check('Clear filters restores all notices', b.lost.length === 6 && b.found.length === 6, b);

  // Filters and navigation
  await p.set(CAT, 'electronics'); b = await p.board();
  check('REGRESSION: category filter works', same(b.lost, ['Wireless earbuds', 'Scientific calculator']), b);
  await p.set(STATUS, 'found'); b = await p.board();
  check('REGRESSION: status + category filters combine', same(Object.keys(b), ['found']) && same(b.found, ['Earbuds in blue case', 'Calculator', 'USB flash drive']), b);
  check('column hidden by a filter no longer claims "Nothing here yet"', !(await p.text('.empty-column')).includes('Nothing here yet'), await p.text('.empty-column'));
  await p.click('.filterbuttons button', 'Clear');
  check('REGRESSION: Clear resets every filter', (await p.evaluate(`[${JSON.stringify(SEARCH)},${JSON.stringify(CAT)},${JSON.stringify(STATUS)}].map(s=>document.querySelector(s).value).join('|')`)) === '|all|all');
  check('Apply button is gone (filters are live)', !(await p.text('.filterbuttons button')).includes('Apply'), await p.text('.filterbuttons button'));
  await p.click('.header-links button', 'Recently found'); b = await p.board();
  check('nav "Recently found" shows found only', same(Object.keys(b), ['found']), b);
  check('active nav item is marked', (await p.text('.header-links button[aria-current]'))[0] === 'Recently found', await p.text('.header-links button[aria-current]'));
  await p.shot(`${OUT}/after-5-recently-found-view.png`);
  await p.click('.header-links button', 'Missing items'); b = await p.board();
  check('REGRESSION: nav "Missing items" shows lost only', same(Object.keys(b), ['lost']) && b.lost.length === 6, b);
  await p.click('.header-links button', 'Noticeboard'); b = await p.board();
  check('nav "Noticeboard" now really shows everything', b.lost.length === 6 && b.found.length === 6 && b.claimed.length === 1, b);

  // ---------- Fix 2: the collection-point journey ----------
  check('received item says where it is and that ownership is verified', /Received at Campus Security Desk/.test(await note('Dark backpack')) && /verify/.test(await note('Dark backpack')), await note('Dark backpack'));
  check('reported-only item stays explicitly unconfirmed', /not confirmed at a collection point/.test(await note('Earbuds in blue case')), await note('Earbuds in blue case'));
  check('claimed + released still reads "Collected by owner"', /Collected by owner/.test(await note('Engineering lab coat')), await note('Engineering lab coat'));
  check('lost cards have no handover note', (await note('Black backpack')) == null);
  check('sidebar lists the collection points', (await p.text('.side-points'))[0].includes('Student Services Office'));

  await openForm();
  check('handover panel hidden until status is Found', !(await p.exists('.handover-panel')));
  await fill({ status: 'found' });
  check('choosing Found reveals the handover step', await p.exists('.handover-panel'));
  check('location label adapts for a finder', (await p.text('label[for=field-location]'))[0] === 'Where you found it', await p.text('label[for=field-location]'));
  await fill({ title: 'Grey umbrella', category: 'other', location: 'Bus stop', collectionPoint: 'Library Reception' });
  await p.shot(`${OUT}/after-6-report-found-form.png`);
  await publish();
  check('success message gives the finder the next step', (await p.text('.message'))[0].includes('hand the item in at Library Reception'), await p.text('.message'));
  const umbrella = await note('Grey umbrella');
  check('a finder choosing a point is NOT shown as received by staff', !/Received at/.test(umbrella) && /not confirmed/.test(umbrella) && /plans to hand it in at Library Reception/.test(umbrella), umbrella);
  const stored = await p.evaluate(`JSON.parse(localStorage.getItem('acl-foundboard-v3')).find(x=>x.title==='Grey umbrella')`);
  check('stored record stays handoverStatus "reported"', stored.handoverStatus === 'reported' && stored.collectionPoint === 'Library Reception' && stored.owner === 'you', stored);
  await p.shot(`${OUT}/after-7-posted-found-report.png`);
  await p.goto();
  check('REGRESSION: new report survives a reload (localStorage)', (await p.board()).found.includes('Grey umbrella'));

  await openForm();
  await fill({ title: 'Red scarf', status: 'found', category: 'clothing' });
  await publish();
  check('no collection point chosen is still valid and stays optional', /may not be ready to collect/.test(await note('Red scarf')), await note('Red scarf'));
  check('...and the message points to "a collection point"', (await p.text('.message'))[0].includes('at a collection point'), await p.text('.message'));
  await openEdit('Grey umbrella'); await p.click('.menu-popup button', 'Edit');
  check('editing keeps the chosen collection point', (await p.evaluate(`document.getElementById('field-collectionPoint').value`)) === 'Library Reception');
  await fill({ status: 'lost' }); await publish();
  const afterLost = await p.evaluate(`JSON.parse(localStorage.getItem('acl-foundboard-v3')).find(x=>x.title==='Grey umbrella')`);
  check('changing found -> lost drops the planned collection point', afterLost.collectionPoint === '', afterLost);

  // Staff-confirmed details can't be overwritten by the reporter
  await openEdit('Calculator'); await p.click('.menu-popup button', 'Edit');
  check('staff-confirmed report shows the point read-only', !(await p.exists('#field-collectionPoint')) && (await p.text('.handover-panel p'))[0].includes('Library Reception'), await p.text('.handover-panel p'));
  await fill({ description: 'Edited description.' }); await publish();
  const calc = await p.evaluate(`JSON.parse(localStorage.getItem('acl-foundboard-v3')).find(x=>x.id==='f11')`);
  check('editing it keeps "received" and the collection point', calc.handoverStatus === 'received' && calc.collectionPoint === 'Library Reception' && calc.description === 'Edited description.', calc);
  check('editing does not reset the report date', calc.created === 'Oct 26', calc.created);

  // Claimed no longer contradicts itself
  await p.fresh();
  await openEdit('Black backpack'); await p.click('.menu-popup button', 'Edit');
  check('REGRESSION: edit form loads existing values', (await p.evaluate(`document.getElementById('field-title').value`)) === 'Black backpack' && (await p.evaluate(`document.getElementById('field-status').value`)) === 'lost');
  await fill({ status: 'claimed' });
  await publish();
  check('REGRESSION: saved edit moves the card to the claimed column', (await p.board()).claimed.includes('Black backpack'));
  check('REGRESSION: "Report updated." confirmation', (await p.text('.message'))[0].includes('Report updated.'));
  const claimedNote = await note('Black backpack');
  check('claimed note no longer says "Reported found"', !/Reported found|Reported only/.test(claimedNote) && /claimed by the reporter/.test(claimedNote), claimedNote);
  check('edit keeps the original date', (await dateOf('Black backpack')) === 'Oct 23', await dateOf('Black backpack'));

  // ---------- Ownership rule ----------
  await p.fresh();
  await openEdit('Dark backpack');
  check('REGRESSION: other students\' reports offer no edit', !(await p.exists('.menu-popup button')) && /another student/i.test((await p.text('.menu-popup'))[0]), await p.text('.menu-popup'));
  await p.evaluate(`document.querySelector('[aria-label="Actions for Dark backpack"]').click()`); await p.settle();
  await openEdit('Calculator');
  check('REGRESSION: your own reports offer edit', await p.exists('.menu-popup button'));
  await p.evaluate(`document.querySelector('[aria-label="Actions for Calculator"]').click()`); await p.settle();

  // ---------- Fix 3: failed submissions explain themselves ----------
  await openForm();
  await publish();
  check('empty submit shows the title error at the field', (await p.text('#error-title'))[0] === 'Title must be at least 2 characters.', await p.text('#error-title'));
  check('...and the status error', (await p.text('#error-status'))[0] === 'Choose lost, found or claimed.', await p.text('#error-status'));
  check('...and the category error', (await p.text('#error-category'))[0] === 'Choose a category.', await p.text('#error-category'));
  check('...all problems are reported at once', (await p.text('.form-error'))[0].includes('3 highlighted fields'), await p.text('.form-error'));
  check('focus moves to the first invalid field', (await p.active()) === 'field-title', await p.active());
  check('invalid field is exposed to assistive tech', (await p.evaluate(`document.getElementById('field-title').getAttribute('aria-invalid')+'|'+document.getElementById('field-title').getAttribute('aria-describedby')`)) === 'true|error-title');
  check('REGRESSION: nothing is published on a failed submit', (await p.evaluate(`JSON.parse(localStorage.getItem('acl-foundboard-v3')).length`)) === 13);
  await p.shot(`${OUT}/after-8-empty-submit-errors.png`);
  await fill({ title: 'x' });
  check('REGRESSION: 1-character title still rejected', (await p.text('#error-title'))[0] === 'Title must be at least 2 characters.');
  await fill({ title: '   ' });
  check('REGRESSION: whitespace-only title still rejected', (await p.text('#error-title'))[0] === 'Title must be at least 2 characters.');
  await fill({ title: 'ab' });
  check('error clears as soon as the field is fixed', (await p.text('#error-title')).length === 0, await p.text('#error-title'));
  check('summary count updates too', (await p.text('.form-error'))[0].includes('2 highlighted fields'), await p.text('.form-error'));

  await fill({ title: ' black BACKPACK ', status: 'lost', category: 'accessories', location: 'library - SECOND floor' });
  await publish();
  check('REGRESSION: duplicate rule still blocks (case/space-insensitive)', (await p.text('#error-title'))[0].includes('An item with the same title has already been reported at this location.'), await p.text('#error-title'));
  check('entered values are kept after a failure', (await p.evaluate(`document.getElementById('field-location').value`)) === 'library - SECOND floor');
  await p.shot(`${OUT}/after-9-duplicate-error.png`);
  await p.click('.field-error button', 'see the existing notice'); b = await p.board();
  check('"see the existing notice" opens that notice on the board', b.lost[0] === 'Black backpack' && (await p.evaluate(`document.querySelector(${JSON.stringify(SEARCH)}).value`)) === 'Black backpack', b);

  await p.fresh();
  await openForm();
  await fill({ title: 'Black backpack', status: 'lost', category: 'accessories', location: 'Different place' });
  await publish();
  check('REGRESSION: same title at a different location is allowed', (await p.board()).lost.filter(t => t === 'Black backpack').length === 2);
  await openEdit('Calculator'); await p.click('.menu-popup button', 'Edit');
  await publish();
  check('REGRESSION: saving unchanged does not flag itself as a duplicate', (await p.text('.message'))[0].includes('Report updated.'), await p.text('.message'));

  // A new report is visible even when filters would have hidden it
  await p.fresh();
  await p.click('.header-links button', 'Missing items');
  await p.set(SEARCH, 'notebook');
  await openForm();
  await fill({ title: 'Green jacket', status: 'found', category: 'clothing' }); await publish();
  check('a saved report is on screen even if filters would have hidden it', (await p.board()).found.includes('Green jacket'));

  // Reset
  await p.click('.reset', 'Reset demo data'); b = await p.board();
  check('REGRESSION: Reset restores the 13 example records', b.lost.length === 6 && b.found.length === 6 && !b.found.includes('Green jacket'), b);
  check('REGRESSION: Reset confirmation shown', (await p.text('.message'))[0].includes('Example reports restored.'));

  // Saved data from before this change still loads
  await p.fresh();
  await p.evaluate(`(()=>{const a=JSON.parse(localStorage.getItem('acl-foundboard-v3'));a.unshift({id:'old1',title:'Old found report',category:'other',status:'found',location:'',description:'',owner:'you',created:'Oct 1',emoji:'📌'});localStorage.setItem('acl-foundboard-v3',JSON.stringify(a));})()`);
  await p.goto();
  check('older saved records without handover fields still render', /not confirmed/.test(await note('Old found report')), await note('Old found report'));

  // ---------- Responsive ----------
  await p.fresh();
  for (const [w, h] of [[1024, 768], [768, 1024], [390, 844], [320, 640]]) {
    await p.viewport(w, h);
    check(`no horizontal overflow at ${w}px (board)`, !(await p.evaluate(`document.documentElement.scrollWidth>innerWidth`)));
  }
  await p.viewport(390, 844);
  await p.shot(`${OUT}/after-10-mobile-board.png`);
  await p.set(SEARCH, 'a-very-long-search-term-with-no-spaces-that-could-overflow-the-panel-on-a-phone');
  check('no overflow with a long unbroken query on a phone', !(await p.evaluate(`document.documentElement.scrollWidth>innerWidth`)));
  await p.set(SEARCH, '');
  await openForm();
  await fill({ status: 'found' }); await publish();
  check('no horizontal overflow at 390px (form with errors and handover)', !(await p.evaluate(`document.documentElement.scrollWidth>innerWidth`)));
  await p.shot(`${OUT}/after-11-mobile-form.png`);

  check('no console errors or warnings during the whole run', p.consoleErrors.length === 0, p.consoleErrors);
} catch (e) { failures.push('script error: ' + e.message); console.log('SCRIPT ERROR', e.message); }
finally { await p.close(); }
console.log(`\n${pass} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.map(f => ' - ' + f).join('\n')); process.exit(1); }
