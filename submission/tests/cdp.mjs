// Minimal headless-Chrome driver (no dependencies) used for screenshots and behaviour checks.
// Uses a throwaway Chrome profile, so it never touches the user's real browser data.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173/';

export async function launch({ width = 1440, height = 1000, scratch }) {
  const profile = mkdtempSync(join(scratch, 'chrome-'));
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((res, rej) => {
    let buf = '';
    const t = setTimeout(() => rej(new Error('no devtools url')), 20000);
    proc.stderr.on('data', d => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]); } });
    proc.on('exit', c => rej(new Error('chrome exited ' + c)));
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const waiters = []; const consoleErrors = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); return; }
    if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) consoleErrors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
    waiters.filter(w => w.method === m.method).forEach(w => w.res(m.params));
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) })); });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s('Page.enable'); await s('Runtime.enable');
  const once = method => new Promise(res => { const w = { method, res: v => { waiters.splice(waiters.indexOf(w), 1); res(v); } }; waiters.push(w); });

  const evaluate = async expr => {
    const r = await s('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const settle = (ms = 120) => new Promise(r => setTimeout(r, ms));
  const page = {
    consoleErrors, evaluate, settle,
    async viewport(w, h) { await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false }); await settle(); },
    async goto(url = BASE) { const l = once('Page.loadEventFired'); await s('Page.navigate', { url }); await l; await evaluate('document.fonts.ready.then(()=>1)'); await settle(250); },
    async fresh() { await page.goto(); await evaluate(`localStorage.clear()`); await page.goto(); },
    async set(selector, value) {
      await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('no element '+${JSON.stringify(selector)});const P=el.tagName==='SELECT'?HTMLSelectElement:el.tagName==='TEXTAREA'?HTMLTextAreaElement:HTMLInputElement;Object.getOwnPropertyDescriptor(P.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
      await settle();
    },
    async click(scope, text) {
      await evaluate(`(()=>{const c=[...document.querySelectorAll(${JSON.stringify(scope)})].filter(e=>e.textContent.trim().includes(${JSON.stringify(text)}));if(!c.length)throw new Error('no match for '+${JSON.stringify(scope + ' / ' + text)});c[0].click();})()`);
      await settle();
    },
    text: sel => evaluate(`[...document.querySelectorAll(${JSON.stringify(sel)})].map(e=>e.innerText.trim())`),
    exists: sel => evaluate(`!!document.querySelector(${JSON.stringify(sel)})`),
    active: () => evaluate(`(document.activeElement&&(document.activeElement.id||document.activeElement.name||document.activeElement.tagName))`),
    // Titles of visible notices per column, in display order.
    board: () => evaluate(`Object.fromEntries([...document.querySelectorAll('.board-column')].map(c=>[c.querySelector('.column-head strong').innerText.toLowerCase(),[...c.querySelectorAll('.sticky h3')].map(h=>h.innerText)]))`),
    async shot(path, { full = true } = {}) {
      mkdirSync(dirname(path), { recursive: true });
      const metrics = await s('Page.getLayoutMetrics');
      const { width, height } = metrics.cssContentSize;
      const params = full ? { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } } : { format: 'png' };
      const { data } = await s('Page.captureScreenshot', params);
      writeFileSync(path, Buffer.from(data, 'base64'));
    },
    async close() { try { await send('Browser.close'); } catch {} proc.kill(); await settle(300); try { rmSync(profile, { recursive: true, force: true }); } catch {} ws.close(); },
  };
  return page;
}
