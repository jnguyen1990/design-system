import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSharedCore } from './load-shared-core.mjs';

function form() {
    const w = loadSharedCore();
    const d = w.document;
    d.body.innerHTML = `<form id="f">
      <div class="form-group"><label for="t">Title</label><input id="t" name="recipe[title]" aria-describedby="hint"><p id="hint" class="form-hint">h</p></div>
      <div class="form-group"><label>Servings</label><input name="recipe[servings]"></div>
      <input id="loose" name="note"></form>`;
    return { w, d, f: d.getElementById('f') };
}

test('marks fields invalid, places a described message, focuses the first', () => {
    const { w, d, f } = form();
    const rest = w.dsFieldErrors(f, { title: 'Title required', 'recipe[servings]': [ 'must be a number', 'must be > 0' ], ghost: 'Base refused' });
    const t = d.getElementById('t');
    assert.equal(t.getAttribute('aria-invalid'), 'true');
    const ids = t.getAttribute('aria-describedby').split(' ');
    assert.equal(ids[0], 'hint', 'keeps the existing description');
    const msg = d.getElementById(ids[1]);
    assert.equal(msg.className, 'form-error');
    assert.equal(msg.textContent, 'Title required');
    assert.equal(msg.parentElement, t.closest('.form-group'));
    assert.equal(d.querySelector('[name="recipe[servings]"]').closest('.form-group').querySelector('.form-error').textContent, 'must be a number · must be > 0');
    assert.equal(d.activeElement, t);
    assert.deepEqual(Array.from(rest), [ 'Base refused' ]);
});

test('a field outside a .form-group gets its message right after it; ids also match', () => {
    const { w, d, f } = form();
    w.dsFieldErrors(f, { loose: 'Too long' });
    assert.equal(d.getElementById('loose').nextElementSibling.textContent, 'Too long');
});

test('the next round replaces the last; editing a field clears its error', () => {
    const { w, d, f } = form();
    w.dsFieldErrors(f, { title: 'Title required', servings: 'Required' });
    w.dsFieldErrors(f, { servings: 'must be > 0' });
    const t = d.getElementById('t');
    assert.equal(t.hasAttribute('aria-invalid'), false);
    assert.equal(t.getAttribute('aria-describedby'), 'hint');
    assert.equal(f.querySelectorAll('.form-error').length, 1);
    const s = d.querySelector('[name="recipe[servings]"]');
    s.dispatchEvent(new w.Event('input'));
    assert.equal(s.hasAttribute('aria-invalid'), false);
    assert.equal(f.querySelectorAll('.form-error').length, 0);
});
