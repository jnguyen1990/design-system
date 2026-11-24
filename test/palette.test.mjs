import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSharedCore, fakeFetch } from './load-shared-core.mjs';

const SIDEBAR = `<nav class="sidebar"><ul class="nav-menu">
  <li><a href="/" class="nav-link" data-nav-key="1"><span class="nav-ico" data-ico="grid"></span>dashboard <kbd class="kbd nav-kbd">⌘1</kbd></a></li>
  <li><a href="/transactions" class="nav-link" data-nav-key="2"><span class="nav-ico" data-ico="list"></span>all transactions <kbd class="kbd nav-kbd">⌘2</kbd></a></li>
  <li><a href="/settings" class="nav-link" data-nav-key=","><span class="nav-ico" data-ico="sliders"></span>settings</a></li>
</ul></nav>`;

const RESULTS = { results: [
    { kind: 'Transaction', title: 'Costco <Wholesale>', meta: 'Sat Nov 22 · −$212.48', url: '/transactions?payee=costco',
      preview: { heading: 'Costco Wholesale', subheading: 'Sat Nov 22 2026', amount: '−$212.48', amount_tone: 'negative',
                 fields: [ [ 'Category', 'Groceries' ] ], actions: [ { label: 'Open', url: '/transactions?payee=costco' } ] } },
    { kind: 'Rule', title: 'costco → Groceries', meta: 'matches 41', url: '/settings#rules' },
] };

function setup({ meta = '/api/search', fetchReply } = {}) {
    const fetch = fakeFetch(fetchReply || (() => ({ body: RESULTS })));
    const w = loadSharedCore({ html: meta === null ? '' : `<meta name="ds-palette" content="${meta}">`, fetch });
    w.document.body.innerHTML = SIDEBAR;
    const d = w.document;
    const key = (k, opts = {}) => d.activeElement.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts }));
    const type = (v) => { const i = d.querySelector('.palette-field'); i.value = v; i.dispatchEvent(new w.Event('input', { bubbles: true })); };
    const wait = (ms = 220) => new Promise(r => setTimeout(r, ms));
    return { w, d, fetch, key, type, wait };
}

test('pure helpers: matching, highlighting (escaped), kind titles', () => {
    const { w } = setup();
    const { paletteMatch, paletteHighlight, paletteKindTitle } = w.dsPaletteInternals;
    assert.ok(paletteMatch('All transactions', 'trans all'));
    assert.ok(!paletteMatch('Settings', 'trans'));
    assert.equal(paletteHighlight('Costco <b>', 'costco'), '<mark>Costco</mark> &lt;b&gt;');
    assert.equal(paletteKindTitle('Transaction'), 'Transactions');
    assert.equal(paletteKindTitle('Sale'), 'Sales');
    assert.equal(paletteKindTitle('Daily note'), 'Daily notes');
    assert.equal(paletteKindTitle('Category'), 'Categories');
    assert.equal(paletteKindTitle('Box'), 'Boxes');
});

test('opt-in: no <meta name="ds-palette"> means ⌘K does nothing', () => {
    const { w, d } = setup({ meta: null });
    d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true, cancelable: true }));
    assert.equal(d.getElementById('ds-palette'), null);
    assert.equal(w.dsPalette.open(), false);
});

test('⌘K opens the dialog with "Go to" from the sidebar and the shell actions; focus in the field', () => {
    const { w, d } = setup();
    d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true, cancelable: true }));
    const pal = d.getElementById('ds-palette');
    assert.ok(pal.classList.contains('modal-open'));
    assert.equal(d.activeElement.className, 'palette-field');
    const groups = [...pal.querySelectorAll('.palette-group')].map(g => g.textContent);
    assert.deepEqual(groups, [ 'Go to', 'Actions' ]);
    const titles = [...pal.querySelectorAll('.palette-title')].map(t => t.textContent);
    assert.deepEqual(titles, [ 'Dashboard', 'All transactions', 'Settings', 'Switch theme' ]);
    assert.equal(pal.querySelector('.palette-end .kbd').textContent, '⌘1');
    assert.equal(d.activeElement.getAttribute('aria-activedescendant'), 'ds-palette-o0');
});

test('typing searches this app after the debounce, groups by kind and escapes record text', async () => {
    const { w, d, fetch, type, wait } = setup();
    w.dsPalette.open();
    type('c'); await wait();
    assert.equal(fetch.calls.length, 0, 'one character never searches');
    type('costco'); await wait();
    assert.equal(fetch.calls.length, 1);
    assert.match(fetch.calls[0].url, /^\/api\/search\?q=costco&limit=6$/);
    const pal = d.getElementById('ds-palette');
    assert.deepEqual([...pal.querySelectorAll('.palette-group')].map(g => g.textContent), [ 'Transactions', 'Rules' ]);
    const first = pal.querySelector('.palette-title');
    assert.equal(first.innerHTML, '<mark>Costco</mark> &lt;Wholesale&gt;');
    // the first record is selected and previewed
    assert.equal(pal.querySelector('.palette-preview-heading').textContent, 'Costco Wholesale');
    assert.ok(pal.querySelector('.palette-preview-amount').classList.contains('text-amount-negative'));
    assert.equal(pal.querySelector('.palette-dl dd').textContent, 'Groceries');
});

test('rapid typing sends one request for the last query (debounced)', async () => {
    const { w, fetch, type, wait } = setup();
    w.dsPalette.open();
    type('co'); type('cos'); type('cost');
    await wait();
    assert.equal(fetch.calls.length, 1);
    assert.match(fetch.calls[0].url, /q=cost&/);
});

test('arrow keys move the selection; Enter on a page navigates', async () => {
    const { w, d, key } = setup();
    let went = null;
    w.dsNavigate = (u) => { went = u; };
    w.dsPalette.open();
    key('ArrowDown');
    assert.equal(d.activeElement.getAttribute('aria-activedescendant'), 'ds-palette-o1');
    assert.equal(d.getElementById('ds-palette-o1').getAttribute('aria-selected'), 'true');
    key('ArrowUp'); key('ArrowUp');
    assert.equal(d.activeElement.getAttribute('aria-activedescendant'), 'ds-palette-o3', 'wraps to the last');
    key('ArrowDown'); key('ArrowDown');
    key('Enter');
    assert.equal(went, '/transactions');
});

test('registered actions run on Enter and can be unregistered', () => {
    const { w, d, type, key } = setup();
    let ran = 0;
    const off = w.dsCommands.register({ label: 'Add transaction', icon: 'plus', shortcut: 'N', run: () => ran++ });
    w.dsPalette.open();
    type('add tr');
    key('Enter');
    assert.equal(ran, 1);
    assert.equal(w.dsPalette.isOpen(), false);
    off();
    assert.equal(w.dsCommands.list().some(c => c.label === 'Add transaction'), false);
});

test('a failed search says so instead of showing stale results', async () => {
    const { w, d, type, wait } = setup({ fetchReply: () => ({ status: 500, body: {} }) });
    w.dsPalette.open();
    type('costco'); await wait();
    assert.equal(d.querySelector('.palette-status').textContent, 'Search is unavailable right now');
});
