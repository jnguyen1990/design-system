import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSharedCore } from './load-shared-core.mjs';

test('showStatus marks its div as a live region: polite status, assertive alert for errors', () => {
    const w = loadSharedCore();
    const d = w.document;
    d.body.innerHTML = '<div id="msg" class="status-message" style="display:none"></div>';
    w.showStatus('msg', 'Saved', 'success');
    const el = d.getElementById('msg');
    assert.equal(el.getAttribute('role'), 'status');
    assert.equal(el.getAttribute('aria-live'), 'polite');
    assert.equal(el.textContent, 'Saved');
    w.showStatus('msg', 'Amount required', 'error');
    assert.equal(el.getAttribute('role'), 'alert');
    assert.equal(el.getAttribute('aria-live'), 'assertive');
});

test('dsToast errors are alerts', () => {
    const w = loadSharedCore();
    w.document.body.innerHTML = '';
    w.dsToast('Could not save', 'error');
    assert.equal(w.document.getElementById('ds-toast').getAttribute('role'), 'alert');
    w.dsToast('Saved');
    assert.equal(w.document.getElementById('ds-toast').getAttribute('role'), 'status');
});

test('a server-rendered flash is made live and its text re-inserted so it is announced', async () => {
    const w = loadSharedCore();
    const d = w.document;
    d.body.innerHTML = '<div class="status-message status-error">Name taken</div><div class="status-message status-success">Saved</div>';
    w.dsAnnounceServerToasts();
    const [err, ok] = d.querySelectorAll('.status-message');
    assert.equal(err.getAttribute('role'), 'alert');
    assert.equal(ok.getAttribute('role'), 'status');
    assert.equal(ok.textContent, '');
    await new Promise(r => setTimeout(r, 200));
    assert.equal(ok.textContent, 'Saved');
    assert.equal(err.textContent, 'Name taken');
    w.dsAnnounceServerToasts();                       // once per element
    assert.equal(ok.textContent, 'Saved');
});
