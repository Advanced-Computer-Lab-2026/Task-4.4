// Minimal Chrome DevTools Protocol driver (Node built-ins only, no packages).
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const J = JSON.stringify;

export async function launch() {
  const profile = mkdtempSync(join(tmpdir(), 'lf-cdp-'));
  const port = 9300 + Math.floor(Math.random() * 400);
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = list.find(t => t.type === 'page');
    } catch {}
  }
  if (!target) throw new Error('chrome did not start');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const logs = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) rej(new Error(J(m.error))); else res(m.result);
    } else if (m.method === 'Runtime.exceptionThrown') {
      logs.push('EXCEPTION ' + m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || ''));
    } else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
      logs.push(m.params.type.toUpperCase() + ' ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, { res, rej });
    ws.send(J({ id: i, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');

  const page = {
    send, logs, sleep,
    async viewport(width, height, mobile = false) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
      await sleep(150);
    },
    async goto(url) { await send('Page.navigate', { url }); await sleep(1000); },
    async reload() { await send('Page.reload'); await sleep(1000); },
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async rect(sel) {
      const r = await page.eval(`(()=>{const e=document.querySelector(${J(sel)});if(!e)return null;e.scrollIntoView({block:'center',behavior:'instant'});const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
      if (!r) throw new Error('not found: ' + sel);
      return r;
    },
    async clickAt({ x, y }) {
      for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
        await send('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' ? 'none' : 'left', clickCount: type === 'mouseMoved' ? 0 : 1 });
      }
      await sleep(150);
    },
    async click(sel) { await page.clickAt(await page.rect(sel)); },
    async clickText(text, scope = 'button,a,label,summary') {
      const r = await page.eval(`(()=>{const t=${J(text)};const all=[...document.querySelectorAll(${J(scope)})].filter(n=>n.getClientRects().length);const e=all.find(n=>n.textContent.trim()===t||n.getAttribute('aria-label')===t)||all.find(n=>n.textContent.includes(t));if(!e)return null;e.scrollIntoView({block:'center',behavior:'instant'});const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
      if (!r) throw new Error('no element with text: ' + text);
      await page.clickAt(r);
    },
    async fill(sel, text) {
      await page.click(sel);
      await page.key('a', 'Control');
      await page.key('Delete');
      if (text) await send('Input.insertText', { text });
      await sleep(150);
    },
    async key(key, mod) {
      const modifiers = mod === 'Control' ? 2 : mod === 'Shift' ? 8 : 0;
      const map = { Enter: 13, Tab: 9, Escape: 27, Delete: 46, a: 65 };
      const code = key.length === 1 ? 'Key' + key.toUpperCase() : key;
      const base = { key, code, windowsVirtualKeyCode: map[key], modifiers, ...(mod === 'Control' && key === 'a' ? { commands: ['selectAll'] } : {}) };
      await send('Input.dispatchKeyEvent', { type: key === 'Enter' ? 'keyDown' : 'rawKeyDown', ...base, ...(key === 'Enter' ? { text: String.fromCharCode(13), unmodifiedText: String.fromCharCode(13) } : {}) });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
      await sleep(90);
    },
    async select(sel, value) {
      await page.eval(`(()=>{const e=document.querySelector(${J(sel)});const s=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;s.call(e,${J(value)});e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      await sleep(150);
    },
    async shot(path, full = false) {
      mkdirSync(dirname(path), { recursive: true });
      await page.eval('document.fonts.ready.then(()=>1)');
      const params = { format: 'png' };
      if (full) {
        const s = (await send('Page.getLayoutMetrics')).cssContentSize;
        params.clip = { x: 0, y: 0, width: s.width, height: s.height, scale: 1 };
        params.captureBeyondViewport = true;
      }
      const r = await send('Page.captureScreenshot', params);
      writeFileSync(path, Buffer.from(r.data, 'base64'));
    },
    async close() {
      try { await send('Browser.close'); } catch {}
      proc.kill();
      await sleep(400);
      try { rmSync(profile, { recursive: true, force: true }); } catch {}
    },
  };
  return page;
}
