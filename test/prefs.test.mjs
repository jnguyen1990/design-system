import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CookieJar } from 'jsdom';
import { loadSharedCore } from './load-shared-core.mjs';

const theme = (w) => w.document.documentElement.getAttribute('data-theme');

test('on *.joenguyen.ca a toggle writes the shared cookie and another app boots with it (PLAT-10)', () => {
    const jar = new CookieJar();
    const budgeter = loadSharedCore({ url: 'https://budgeter.joenguyen.ca/', cookieJar: jar });
    assert.equal(theme(budgeter), 'dark', 'no saved choice: OS (none stated) → dark');
    budgeter.toggleTheme();
    assert.equal(theme(budgeter), 'light');
    assert.match(budgeter.document.cookie, /ds_theme=light/);
    const fitness = loadSharedCore({ url: 'https://fitness.joenguyen.ca/', cookieJar: jar });
    assert.equal(theme(fitness), 'light', 'the other app reads the cookie before its own (empty) localStorage');
});

test('the shared cookie wins over this address\'s localStorage', () => {
    const jar = new CookieJar();
    jar.setCookieSync('ds_theme=dark; Domain=.joenguyen.ca; Path=/', 'https://base.joenguyen.ca/');
    const w = loadSharedCore({ url: 'https://base.joenguyen.ca/', cookieJar: jar, before: (w) => w.localStorage.setItem('theme', 'light') });
    assert.equal(theme(w), 'dark');
});

test('localhost and tailnet hosts keep localStorage only: no cookie', () => {
    for (const url of [ 'http://localhost:3000/', 'https://mini.tail5ece07.ts.net/', 'http://100.64.0.1:3000/' ]) {
        const w = loadSharedCore({ url, before: (w) => w.localStorage.setItem('theme', 'light') });
        assert.equal(theme(w), 'light', url);
        assert.equal(w.dsPrefs.cookieDomain(), null, url);
        w.toggleTheme();
        assert.equal(w.localStorage.getItem('theme'), 'dark');
        assert.equal(w.document.cookie, '', url);
    }
});

test('a junk cookie value is ignored', () => {
    const jar = new CookieJar();
    jar.setCookieSync('ds_theme=purple; Domain=.joenguyen.ca; Path=/', 'https://upkeep.joenguyen.ca/');
    const w = loadSharedCore({ url: 'https://upkeep.joenguyen.ca/', cookieJar: jar, before: (w) => w.localStorage.setItem('theme', 'light') });
    assert.equal(theme(w), 'light');
});
