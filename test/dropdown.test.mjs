import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSharedCore } from './load-shared-core.mjs';

// The shape budgeter's pages render: a ghost trigger, a menu of <a onclick>
// items with no href, opened by the page toggling .open.
function setup() {
    const w = loadSharedCore();
    const d = w.document;
    d.body.innerHTML = `<button id="before">before</button>
      <div class="dropdown"><button class="btn btn-ghost btn-sm menu-btn" id="trig" aria-label="More">⋮</button>
        <div class="dropdown-menu" id="m"><a class="dropdown-item" id="i1">One</a><a class="dropdown-item disabled" id="i2">Two</a><a class="dropdown-item" id="i3">Three</a><button class="dropdown-item" id="i4">Four</button></div></div>
      <button id="after">after</button>`;
    w.dsPrepareDropdowns();
    const trig = d.getElementById('trig'), menu = d.getElementById('m');
    trig.addEventListener('click', () => menu.classList.toggle('open'));
    const key = (el, k) => el.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    const tick = () => new Promise(r => setTimeout(r, 60));   // focus lands a frame or two after .open
    return { w, d, trig, menu, key, tick };
}

test('triggers and menus carry the menu-button ARIA', () => {
    const { trig, menu, d } = setup();
    assert.equal(trig.getAttribute('aria-haspopup'), 'menu');
    assert.equal(trig.getAttribute('aria-controls'), 'm');
    assert.equal(trig.getAttribute('aria-expanded'), 'false');
    assert.equal(menu.getAttribute('role'), 'menu');
    assert.equal(d.getElementById('i1').getAttribute('role'), 'menuitem');
    assert.equal(d.getElementById('i1').getAttribute('tabindex'), '-1');
});

test('opening focuses the first item and sets aria-expanded', async () => {
    const { trig, d, tick } = setup();
    trig.click(); await tick();
    assert.equal(trig.getAttribute('aria-expanded'), 'true');
    assert.equal(d.activeElement.id, 'i1');
});

test('Up, Down, Home and End move focus and skip disabled items', async () => {
    const { trig, d, key, tick } = setup();
    trig.click(); await tick();
    key(d.activeElement, 'ArrowDown'); assert.equal(d.activeElement.id, 'i3');
    key(d.activeElement, 'ArrowDown'); assert.equal(d.activeElement.id, 'i4');
    key(d.activeElement, 'ArrowDown'); assert.equal(d.activeElement.id, 'i1', 'wraps');
    key(d.activeElement, 'ArrowUp'); assert.equal(d.activeElement.id, 'i4', 'wraps back');
    key(d.activeElement, 'Home'); assert.equal(d.activeElement.id, 'i1');
    key(d.activeElement, 'End'); assert.equal(d.activeElement.id, 'i4');
});

test('Enter activates an href-less item; Escape closes and returns focus to the trigger', async () => {
    const { trig, menu, d, key, tick } = setup();
    let clicked = 0; d.getElementById('i1').addEventListener('click', () => clicked++);
    trig.click(); await tick();
    key(d.activeElement, 'Enter'); assert.equal(clicked, 1);
    key(d.activeElement, 'Escape'); await tick();
    assert.equal(menu.classList.contains('open'), false);
    assert.equal(trig.getAttribute('aria-expanded'), 'false');
    assert.equal(d.activeElement.id, 'trig');
});

test('ArrowDown on the trigger opens the menu; Tab closes it', async () => {
    const { trig, menu, d, key, tick } = setup();
    trig.focus(); key(trig, 'ArrowDown'); await tick();
    assert.equal(menu.classList.contains('open'), true);
    assert.equal(d.activeElement.id, 'i1');
    key(d.activeElement, 'Tab'); await tick();
    assert.equal(menu.classList.contains('open'), false);
});

test('a menu rendered later is prepared when its trigger takes focus', () => {
    const { w, d } = setup();
    const row = d.createElement('div');
    row.innerHTML = '<div class="dropdown"><button id="t2">⋮</button><div class="dropdown-menu"><a class="dropdown-item">X</a></div></div>';
    d.body.append(row);
    d.getElementById('t2').focus();
    assert.equal(d.getElementById('t2').getAttribute('aria-haspopup'), 'menu');
    assert.match(d.getElementById('t2').getAttribute('aria-controls'), /^ds-menu-/);
});
