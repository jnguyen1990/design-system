import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSharedCore, fakeFetch } from './load-shared-core.mjs';

const CSRF = '<meta name="csrf-token" content="tok-123">';
const header = (init, name) => {
    const h = init.headers || {};
    if (typeof h.get === 'function') return h.get(name);
    const k = Object.keys(h).find(x => x.toLowerCase() === name.toLowerCase());
    return k ? h[k] : undefined;
};

test('resolves with the parsed JSON body and sends a JSON content type', async () => {
    const fetch = fakeFetch(() => ({ body: { ok: true, n: 3 } }));
    const w = loadSharedCore({ fetch });
    const data = await w.apiRequest('/api/things');
    assert.equal(data.n, 3);
    assert.equal(header(fetch.calls[0].init, 'Content-Type'), 'application/json');
});

test('sends X-CSRF-Token on same-origin writes only', async () => {
    const fetch = fakeFetch();
    const w = loadSharedCore({ html: CSRF, fetch });
    await w.apiRequest('/api/things', { method: 'POST', body: '{}' });
    await w.apiRequest('/api/things');
    await w.apiRequest('https://elsewhere.test/api', { method: 'POST', body: '{}' });
    await w.apiRequest('/api/things', { method: 'DELETE', csrf: false });
    assert.equal(header(fetch.calls[0].init, 'X-CSRF-Token'), 'tok-123');
    assert.equal(header(fetch.calls[1].init, 'X-CSRF-Token'), undefined, 'GET carries no token');
    assert.equal(header(fetch.calls[2].init, 'X-CSRF-Token'), undefined, 'cross-origin carries no token');
    assert.equal(header(fetch.calls[3].init, 'X-CSRF-Token'), undefined, 'csrf:false opts out');
});

test("never overwrites a header the caller set, and the caller's headers replace the default content type", async () => {
    const fetch = fakeFetch();
    const w = loadSharedCore({ html: CSRF, fetch });
    await w.apiRequest('/api/x', { method: 'PATCH', headers: { 'x-csrf-token': 'mine', Accept: 'text/plain' }, accept: 'json' });
    const init = fetch.calls[0].init;
    assert.equal(header(init, 'X-CSRF-Token'), 'mine');
    assert.equal(header(init, 'Accept'), 'text/plain');
    assert.equal(header(init, 'Content-Type'), undefined);
});

test('accept: "json" adds an Accept header', async () => {
    const fetch = fakeFetch();
    const w = loadSharedCore({ fetch });
    await w.apiRequest('/api/x', { accept: 'json' });
    assert.equal(header(fetch.calls[0].init, 'Accept'), 'application/json');
});

test('a FormData body goes out without a JSON content type', async () => {
    const fetch = fakeFetch();
    const w = loadSharedCore({ html: CSRF, fetch });
    const fd = new w.FormData();
    fd.append('file', 'x');
    await w.apiRequest('/api/upload', { method: 'POST', body: fd });
    const init = fetch.calls[0].init;
    assert.equal(header(init, 'Content-Type'), undefined);
    assert.equal(header(init, 'X-CSRF-Token'), 'tok-123');
});

test('a non-2xx rejects with status, data and serverMessage; message stays "HTTP error!" by default', async () => {
    const fetch = fakeFetch(() => ({ status: 422, body: { errors: [ 'Name is blank', 'Amount is zero' ] } }));
    const w = loadSharedCore({ fetch });
    await assert.rejects(w.apiRequest('/api/x', { method: 'POST' }), e => {
        assert.equal(e.message, 'HTTP error! status: 422');
        assert.equal(e.status, 422);
        assert.equal(e.serverMessage, 'Name is blank, Amount is zero');
        assert.deepEqual([ ...e.data.errors ], [ 'Name is blank', 'Amount is zero' ]);
        return true;
    });
});

test('serverErrorMessage (per call or app-wide default) makes message the server text', async () => {
    const fetch = fakeFetch(() => ({ status: 400, body: { error: 'Month is required' } }));
    const w = loadSharedCore({ fetch });
    await assert.rejects(w.apiRequest('/api/x', { serverErrorMessage: true }), { message: 'Month is required' });
    w.apiRequest.defaults.serverErrorMessage = true;
    await assert.rejects(w.apiRequest('/api/x'), { message: 'Month is required' });
    await assert.rejects(w.apiRequest('/api/x', { serverErrorMessage: false }), { message: 'HTTP error! status: 400' });
});

test('a non-JSON error body still rejects with the status', async () => {
    const fetch = fakeFetch(() => ({ status: 502, body: '<html>Bad gateway</html>' }));
    const w = loadSharedCore({ fetch });
    await assert.rejects(w.apiRequest('/api/x'), e => e.status === 502 && e.data === null && e.serverMessage === null);
});

test('busy: the element is aria-busy only while the request runs', async () => {
    let seen;
    const w = loadSharedCore({ fetch: async () => { seen = w.document.getElementById('list').getAttribute('aria-busy'); return { ok: true, status: 200, json: async () => ({}) }; } });
    w.document.body.innerHTML = '<div id="list"></div>';
    await w.apiRequest('/api/x', { busy: '#list' });
    assert.equal(seen, 'true');
    assert.equal(w.document.getElementById('list').hasAttribute('aria-busy'), false);
});
