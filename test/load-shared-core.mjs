// Loads shared-core.js (a classic browser script) into a fresh jsdom window,
// the way an app layout does, so its globals can be tested under node --test.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const SRC = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'shared-core.js'), 'utf8');

export function loadSharedCore({ url = 'https://app.test/page', html = '', fetch, cookieJar, before } = {}) {
    const dom = new JSDOM(`<!doctype html><html><head>${html}</head><body></body></html>`, {
        url, runScripts: 'outside-only', pretendToBeVisual: true, ...(cookieJar ? { cookieJar } : {}),
    });
    const w = dom.window;
    w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    w.console.error = () => {};            // apiRequest logs every failure; keep test output clean
    if (fetch) w.fetch = fetch;
    if (before) before(w);
    w.eval(SRC);
    return w;
}

// A fetch stub that records each call and answers with `reply(url, init)`
// → { status, body } (body is JSON-encoded; a string is sent as-is).
export function fakeFetch(reply = () => ({ status: 200, body: {} })) {
    const calls = [];
    const fn = async (url, init = {}) => {
        calls.push({ url, init });
        const { status = 200, body = {} } = reply(url, init) || {};
        const text = typeof body === 'string' ? body : JSON.stringify(body);
        return { ok: status >= 200 && status < 300, status, json: async () => JSON.parse(text) };
    };
    fn.calls = calls;
    return fn;
}
