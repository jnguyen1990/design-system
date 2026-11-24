import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSharedCore } from './load-shared-core.mjs';

const FIELDS = {
    keyword: { type: 'text' },
    category: { type: 'enum', values: [ 'Groceries', 'Rent', 'Dining out' ] },
    type: { type: 'enum', values: [ 'running', 'indoor_running' ], exact: true },
    amount: { type: 'number' },
    imported: { type: 'date', aliases: [ 'imported', 'imported date' ] },
};

function parser(extra = {}) {
    const w = loadSharedCore();
    const el = w.document.createElement('div');
    w.document.body.append(el);
    const f = w.installFilterTags(el, { fields: FIELDS, today: '2026-11-24T12:00:00', ...extra });
    // jsdom objects come from another realm; compare as plain data.
    return { w, f, parse: s => JSON.parse(JSON.stringify(f.parse(s))) };
}

test('field:value and the long "field op value" form normalise to one tag', () => {
    const { parse } = parser();
    assert.deepEqual(parse('imported:today'), parse('imported date = today'));
    assert.deepEqual(parse('imported:today').date, { kind: 'day', value: '2026-11-24', word: 'today' });
});

test('relative date words resolve against today', () => {
    const { parse } = parser();
    assert.equal(parse('imported:yesterday').date.value, '2026-11-23');
    assert.deepEqual(parse('imported:this-month').date, { kind: 'month', value: '2026-11', word: 'this-month' });
    assert.equal(parse('imported:last month').date.value, '2026-10');
    assert.equal(parse('imported:this year').date.value, '2026');
});

test('ISO dates are matched before the word normalisation (2026-10-01 is not shredded)', () => {
    const { parse } = parser();
    assert.deepEqual(parse('imported:2026-10-01').date, { kind: 'day', value: '2026-10-01', word: '2026-10-01' });
    assert.equal(parse('imported:2026-10').date.kind, 'month');
});

test('amount:>90 lifts the operator out of the value', () => {
    const { parse } = parser();
    assert.deepEqual(parse('amount:>90'), { field: 'amount', op: '>', raw: '90', num: 90 });
    assert.deepEqual(parse('amount >= $1,200'), { field: 'amount', op: '>=', raw: '1200', num: 1200 });
});

test('enum values match case-insensitively and quoted values keep their spaces', () => {
    const { parse } = parser();
    assert.equal(parse('category:groceries').raw, 'groceries');
    assert.equal(parse('category:"Dining out"').raw, 'dining out');
});

test('invalid and incomplete terms are refused, not guessed', () => {
    const { parse } = parser();
    assert.deepEqual(parse('category:'), { incomplete: 'category' });
    assert.match(parse('category:pets').error, /No category called "pets"/);
    assert.match(parse('amount:lots').error, /isn't a number/);
    assert.match(parse('imported:someday').error, /isn't a date/);
    assert.match(parse('colour:red').error, /no "colour" to filter on/);
    assert.equal(parse('   '), null);
});

test('bare words commit to the free-text field', () => {
    const { parse } = parser();
    assert.deepEqual(parse('Costco'), { field: 'keyword', op: '=', raw: 'costco' });
});

test('set() rebuilds tags from a query string, keeping quoted phrases whole', () => {
    const { f } = parser();
    f.set('category:"Dining out" amount:>20 costco', false);
    assert.deepEqual(JSON.parse(JSON.stringify(f.tags.map(t => [ t.field, t.op, t.raw ]))), [ [ 'category', '=', 'dining out' ], [ 'amount', '>', '20' ], [ 'keyword', '=', 'costco' ] ]);
});

test('filterTagsMatch: substrings, exact fields, numbers, dates and !=', () => {
    const { w, parse } = parser();
    const rows = [
        { keyword: 'Costco Wholesale', category: 'Groceries', type: 'running', amount: 120, imported: '2026-11-24' },
        { keyword: 'Rent', category: 'Rent', type: 'indoor_running', amount: 1800, imported: '2026-10-01' },
    ];
    const get = (field, row) => row[field];
    const pick = (...terms) => rows.filter(r => w.filterTagsMatch(r, terms.map(parse), get)).map(r => r.keyword);
    assert.deepEqual(pick('costco'), [ 'Costco Wholesale' ]);
    assert.deepEqual(pick('type:running'), [ 'Costco Wholesale' ], 'exact field must not substring-match indoor_running');
    assert.deepEqual(pick('amount:>1000'), [ 'Rent' ]);
    assert.deepEqual(pick('imported:this-month'), [ 'Costco Wholesale' ]);
    assert.deepEqual(pick('imported:2026-10'), [ 'Rent' ]);
    assert.deepEqual(pick('category!=rent'), [ 'Costco Wholesale' ]);
    assert.deepEqual(pick('amount:>100', 'imported:today'), [ 'Costco Wholesale' ]);
});

// PLAT-05: keyboard and screen-reader access.
test('the remove control is a real button that Enter removes', () => {
    const { w, f } = parser();
    const el = w.document.querySelector('.filter-tags');
    f.add('category:Rent'); f.add('amount:>50');
    const x = el.querySelector('.filter-tag-x');
    assert.equal(x.tagName, 'BUTTON');
    assert.equal(x.getAttribute('type'), 'button');
    assert.match(x.getAttribute('aria-label'), /^Remove category:rent/i);
    x.click();                                   // keyboard activation dispatches click
    assert.deepEqual(JSON.parse(JSON.stringify(f.tags.map(t => t.field))), [ 'amount' ]);
    assert.equal(w.document.activeElement, el.querySelector('input'));
});

test('suggestions are a listbox the input points into with aria-activedescendant', () => {
    const { w } = parser();
    const el = w.document.querySelector('.filter-tags');
    const input = el.querySelector('input');
    const menu = el.querySelector('.filter-tags-menu');
    assert.equal(input.getAttribute('role'), 'combobox');
    assert.equal(menu.getAttribute('role'), 'listbox');
    assert.equal(input.getAttribute('aria-controls'), menu.id);
    assert.equal(input.getAttribute('aria-expanded'), 'false');
    input.dispatchEvent(new w.Event('focus'));
    assert.equal(input.getAttribute('aria-expanded'), 'true');
    const opts = [ ...menu.querySelectorAll('[role="option"]') ];
    assert.ok(opts.length > 1);
    assert.equal(input.getAttribute('aria-activedescendant'), opts[0].id);
    assert.equal(opts[0].getAttribute('aria-selected'), 'true');
    input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    assert.equal(input.getAttribute('aria-activedescendant'), opts[1].id);
    assert.equal(opts[0].getAttribute('aria-selected'), 'false');
    input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    assert.equal(input.getAttribute('aria-expanded'), 'false');
    assert.equal(input.hasAttribute('aria-activedescendant'), false);
});
