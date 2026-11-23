#!/usr/bin/env node
// Design-system pre-push check.
//
// Renders every ui_kits page from THIS working tree (requests for
// https://design-system.joenguyen.ca/* are answered from local files, so
// nothing on the CDN is fetched) in light and dark, at 1440px and 375px,
// and asserts the invariants that a global stylesheet + shared JS can break
// in six apps at once. Writes one screenshot per render for a visual look.
//
//   mise exec node@22 -- node scripts/check.mjs            # all kits
//   mise exec node@22 -- node scripts/check.mjs budgeter   # kits whose path matches
//   CHECK_OUT=/some/dir … (screenshots; default: $TMPDIR/ds-check)
//
// Needs playwright-core and Google Chrome. playwright-core is resolved from
// PLAYWRIGHT_CORE (a path to the package), then ./node_modules, then
// ~/Repos/mini/browser_sweep/node_modules — the repo has no package.json on
// purpose (the Worker publishes the repo root).
//
// Exit 0 = every invariant held; 1 = at least one failed (each is printed).

import { createRequire } from 'node:module';
import { readFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KITS = path.join(ROOT, 'claude-design-export', 'ui_kits');
const OUT = process.env.CHECK_OUT || path.join(os.tmpdir(), 'ds-check');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CDN = 'https://design-system.joenguyen.ca/';
const KIT_ORIGIN = 'https://ds-check.test/';

function loadPlaywright() {
    const candidates = [
        process.env.PLAYWRIGHT_CORE,
        path.join(ROOT, 'node_modules', 'playwright-core'),
        path.join(os.homedir(), 'Repos', 'mini', 'browser_sweep', 'node_modules', 'playwright-core'),
    ].filter(Boolean);
    const require = createRequire(import.meta.url);
    for (const c of candidates) {
        if (existsSync(c)) return require(c);
    }
    console.error('playwright-core not found. Set PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core');
    process.exit(2);
}

const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.html': 'text/html', '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };

async function serveLocal(route, rel) {
    const file = path.join(ROOT, decodeURIComponent(rel.split('?')[0]));
    if (!file.startsWith(ROOT) || !existsSync(file)) return route.fulfill({ status: 404, body: 'not found' });
    return route.fulfill({ status: 200, body: await readFile(file),
        headers: { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'access-control-allow-origin': '*' } });
}

// Fixtures injected into every kit, so each invariant has a subject even when
// a kit page does not happen to render that component.
const FIXTURE = `
<div id="ds-check-fixture" style="padding:16px">
  <a class="btn" href="#x" id="fx-a-btn">Anchor button</a>
  <a class="btn btn-secondary" href="#x" id="fx-a-btn2">Anchor secondary</a>
  <button class="btn btn-primary" id="fx-primary">Primary</button>
  <button class="btn btn-danger" id="fx-danger">Danger</button>
  <div class="form-group"><label>Fixture select</label>
    <select class="form-control" id="fx-select"><option>One</option></select></div>
  <div class="form-group"><label>Fixture text</label>
    <input type="text" class="form-control" id="fx-input"></div>
  <p class="text-faint" id="fx-faint">Faint text</p>
  <div class="card"><table class="table-stack" id="fx-stack">
    <thead><tr><th></th><th>Payee</th><th>Category</th><th>Amount</th><th>Imported</th><th></th></tr></thead>
    <tbody><tr>
      <td data-cell="select"><input type="checkbox" aria-label="Select"></td>
      <td data-cell="title">Costco Wholesale W549 with a long payee name that must wrap</td>
      <td data-label="Category"><span class="badge badge--green">Groceries</span></td>
      <td data-label="Amount" class="td-amount">−$720.03</td>
      <td data-cell="hide">Sep 22</td>
      <td data-cell="actions"><button class="btn btn-ghost btn-sm" aria-label="More">⋮</button></td>
    </tr></tbody></table></div>
  <div class="card"><table class="table-stack table-stack--days" id="fx-days">
    <thead><tr><th>Date</th><th>Payee</th><th>Category</th><th>Amount</th><th>Source</th></tr></thead>
    <tbody><tr class="stack-day"><td colspan="5"><span>Tue, Sep 22</span><span class="stack-day-total">−$755.92</span></td></tr>
      <tr><td>Sep 22</td><td data-cell="title">Costco Wholesale W549</td><td data-cell="meta"><span class="badge badge--green">Groceries</span></td>
        <td data-cell="amount" class="td-amount">−$720.03</td><td data-cell="aside">Rogers Bank</td></tr>
    </tbody></table></div>
</div>
<div class="modal" id="fx-modal"><div class="modal-box"><div class="modal-header">
  <h3 class="modal-title">Fixture modal</h3><button class="modal-close" data-modal-close aria-label="Close">&times;</button></div>
  <div class="modal-body"><input type="text" class="form-control" id="fx-modal-input"></div>
  <div class="modal-footer"><button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary">Save</button></div></div></div>`;

// Runs in the page. Returns a list of failure strings.
async function invariants(page, { width, theme }) {
    return page.evaluate(async ({ width, theme }) => {
        const fails = [];
        const $ = s => document.querySelector(s);
        // Self-hosted webfonts actually load (and from fonts/, see below).
        await document.fonts.ready;
        for (const fam of ['Inter', 'Geist Mono']) {
            const face = [...document.fonts].find(f => f.family.replace(/"/g, '') === fam && f.status === 'loaded');
            if (!face) fails.push(`${fam} webfont did not load`);
        }
        const cs = el => getComputedStyle(el);
        const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
        // Any CSS colour (incl. color(display-p3 …)) → sRGB 0..255 via canvas.
        const rgb = c => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)); };
        const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const ratio = (a, b) => { const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
        const tok = n => cs(document.documentElement).getPropertyValue(n).trim();
        const card = tok('--card');

        // Theme boot + color-scheme
        if (document.documentElement.getAttribute('data-theme') !== theme) fails.push(`data-theme is ${document.documentElement.getAttribute('data-theme')}, expected ${theme}`);
        if (cs(document.documentElement).colorScheme !== theme) fails.push(`:root color-scheme is "${cs(document.documentElement).colorScheme}", expected ${theme}`);

        // One h1
        const h1s = document.querySelectorAll('h1').length;
        if (h1s !== 1) fails.push(`${h1s} <h1> elements`);

        // A2.1 select chevron
        const sel = cs($('#fx-select'));
        if (sel.backgroundImage === 'none' && sel.appearance === 'none') fails.push('select.form-control has appearance:none and no chevron');
        if (parseFloat(sel.paddingRight) < 24) fails.push(`select.form-control padding-right ${sel.paddingRight} (chevron needs room)`);

        // A2.3 modal entry animation + A4 dialog semantics, focus, trap, restore
        const trigger = $('#fx-primary');
        trigger.focus();
        window.openModal('fx-modal');
        await new Promise(r => setTimeout(r, 50));
        const box = $('#fx-modal .modal-box');
        if (cs(box).animationName === 'none') fails.push('modal-box has no entry animation');
        const m = $('#fx-modal');
        if (m.getAttribute('role') !== 'dialog' || m.getAttribute('aria-modal') !== 'true') fails.push('open modal lacks role=dialog aria-modal=true');
        if (!m.contains(document.activeElement)) fails.push('open modal did not take focus');
        window.closeModal('fx-modal');
        await new Promise(r => setTimeout(r, 50));
        if (document.activeElement !== trigger) fails.push('closing the modal did not restore focus to the trigger');

        // dsConfirm danger: Cancel takes focus
        const p = window.dsConfirm('Fixture?');
        await new Promise(r => setTimeout(r, 30));
        const ae = document.activeElement;
        if (!ae || ae.getAttribute('data-ds-confirm') !== 'cancel') fails.push('dsConfirm (danger) did not focus Cancel');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await p;

        // A4 contrast floor
        for (const id of ['#fx-primary', '#fx-danger']) {
            const s = cs($(id));
            const r = ratio(s.color, s.backgroundColor);
            if (r < 4.5) fails.push(`${id} text contrast ${r.toFixed(2)} < 4.5`);
        }
        const faint = ratio(tok('--text-faint'), card);
        if (faint < 4.5) fails.push(`--text-faint on card ${faint.toFixed(2)} < 4.5`);
        const ring = ratio(tok('--focus-ring'), card);
        if (ring < 3) fails.push(`--focus-ring on card ${ring.toFixed(2)} < 3`);
        const inp = $('#fx-input'); inp.focus();
        const io = cs(inp);
        if (io.outlineStyle === 'none' || ratio(io.outlineColor, card) < 3) fails.push(`focused input outline ${io.outlineColor} fails 3:1`);
        inp.blur();
        if (!document.querySelector('.sr-only') && !(() => { const t = document.createElement('span'); t.className = 'sr-only'; document.body.append(t); const ok = cs(t).position === 'absolute' && cs(t).width === '1px'; t.remove(); return ok; })()) fails.push('.sr-only is not defined');

        // Label association (shared-core enhancer)
        const lbl = $('#ds-check-fixture .form-group label');
        if (!lbl || !lbl.control) fails.push('form-group label not associated with its control');

        // aria-current on the active nav link
        const active = document.querySelector('.nav-link.active');
        if (active && active.getAttribute('aria-current') !== 'page') fails.push('.nav-link.active lacks aria-current="page"');

        // Stacked tables (M2): untouched on desktop, card rows on mobile.
        const stack = $('#fx-stack'), days = $('#fx-days');
        const dayRow = days.querySelector('tr.stack-day');
        if (width > 768) {
            if (cs(stack.querySelector('thead')).display === 'none') fails.push('.table-stack thead hidden on desktop');
            if (cs(dayRow).display !== 'none') fails.push('.stack-day row shows on desktop');
        } else {
            if (cs(stack.querySelector('thead')).display !== 'none') fails.push('.table-stack thead still shows at 375');
            if (cs(stack.querySelector('tbody tr')).display !== 'grid') fails.push('.table-stack rows are not cards at 375');
            const lbl = getComputedStyle(stack.querySelector('td[data-label="Amount"]'), '::before').content;
            if (!/Amount/.test(lbl)) fails.push(`.table-stack data-label not rendered (::before ${lbl})`);
            if (cs(stack.querySelector('td[data-cell="hide"]')).display !== 'none') fails.push('data-cell="hide" still shows at 375');
            if (cs(dayRow).display === 'none' || cs(dayRow).position !== 'sticky') fails.push('.stack-day header is not a sticky row at 375');
            if (cs(days.querySelector('tbody tr:not(.stack-day) td:first-child')).display !== 'none') fails.push('.table-stack--days shows a cell without a role');
            for (const t of [stack, days]) if (t.getBoundingClientRect().right > window.innerWidth + 1) fails.push(`#${t.id} overflows at 375`);
        }

        // Mobile navigation (M2): tab bar + More sheet where the shell renders
        // one; the hamburger + drawer wherever it does not (postings).
        const bar = document.querySelector('body > .tab-bar');
        const burger = $('#mobileMenuBtn');
        if (width > 768) {
            if (bar && cs(bar).display !== 'none') fails.push('.tab-bar shows on desktop');
        } else if (bar) {
            if (cs(bar).display === 'none') fails.push('.tab-bar hidden at 375');
            if (burger && cs(burger).display !== 'none') fails.push('hamburger still shows beside the tab bar');
            const br = bar.getBoundingClientRect();
            if (br.left < 0 || br.right > window.innerWidth) fails.push('.tab-bar runs past the viewport');
            bar.querySelectorAll('.tab-bar-item').forEach(t => { const r = t.getBoundingClientRect(); if (r.height < 44 || r.width < 44) fails.push(`tab ${t.textContent.trim()} is ${Math.round(r.width)}x${Math.round(r.height)} (< 44)`); });
            const act = bar.querySelector('.tab-bar-item.active');
            if (act && act.getAttribute('aria-current') !== 'page') fails.push('active tab lacks aria-current');
            const more = bar.querySelector('[data-sheet-toggle]');
            const sheet = more && document.getElementById(more.getAttribute('aria-controls'));
            if (!sheet) fails.push('tab bar has no More sheet');
            else {
                more.focus(); more.click();
                await new Promise(r => setTimeout(r, 50));
                if (sheet.hidden || cs(sheet).display === 'none') fails.push('More did not open the sheet');
                if (!sheet.contains(document.activeElement)) fails.push('focus did not move into the sheet');
                if (more.getAttribute('aria-expanded') !== 'true') fails.push('More aria-expanded not true when open');
                if (!sheet.querySelector('.sheet-dock .app-dock')) fails.push('sheet has no app dock');
                const shr = sheet.getBoundingClientRect();
                if (shr.right > window.innerWidth + 1) fails.push('sheet overflows');
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                await new Promise(r => setTimeout(r, 30));
                if (!sheet.hidden) fails.push('Esc did not close the sheet');
                if (document.activeElement !== more) fails.push('closing the sheet did not return focus to More');
            }
        } else if (burger) {
            if (cs(burger).display === 'none') fails.push('no tab bar and no hamburger at 375');
            burger.click();
            await new Promise(r => setTimeout(r, 30));
            if (!$('.sidebar').classList.contains('open')) fails.push('hamburger did not open the drawer');
            burger.click();
        }

        // Mobile floor
        if (width <= 768) {
            const fs = parseFloat(cs(inp).fontSize);
            if (fs < 16) fails.push(`input font-size ${fs}px under 768px (iOS zooms below 16)`);
            if (document.body.scrollWidth > window.innerWidth) fails.push(`body.scrollWidth ${document.body.scrollWidth} > ${window.innerWidth}`);
            const vw = window.innerWidth;
            const over = [];
            document.querySelectorAll('.main-content *').forEach(el => {
                if (el.closest('.table-responsive, .modal, .dropdown-menu, [hidden]')) return;
                const r = el.getBoundingClientRect();
                if (r.width && r.right > vw + 1 && cs(el).position !== 'fixed') over.push(el);
            });
            // Report the outermost offenders only.
            const top = over.filter(el => !over.some(o => o !== el && o.contains(el)));
            top.slice(0, 5).forEach(el => fails.push(`overflows viewport: <${el.tagName.toLowerCase()} class="${el.className}"> right=${Math.round(el.getBoundingClientRect().right)}`));
            if (!matchMedia('(pointer: coarse)').matches) fails.push('pointer:coarse is not emulated at mobile width');
            const b = $('#fx-primary').getBoundingClientRect();
            if (b.height < 44) fails.push(`.btn is ${b.height}px tall under pointer:coarse (< 44)`);
        }
        return fails;
    }, { width, theme });
}

// Anchor .btn hover must keep its rest colour (A2.2): needs a real hover.
async function hoverInvariant(page) {
    const fails = [];
    for (const id of ['#fx-a-btn', '#fx-a-btn2']) {
        const el = page.locator(id);
        await el.scrollIntoViewIfNeeded();
        const rest = await el.evaluate(e => getComputedStyle(e).color);
        await el.hover();
        await page.waitForTimeout(200);
        const hover = await el.evaluate(e => getComputedStyle(e).color);
        if (rest !== hover) fails.push(`<a ${id}> hover colour ${hover} differs from rest ${rest}`);
        await page.mouse.move(0, 0);
    }
    return fails;
}

async function listKits(filter) {
    const out = [];
    for (const app of await readdir(KITS)) {
        const dir = path.join(KITS, app);
        if (!existsSync(dir) || app.startsWith('.')) continue;
        for (const f of await readdir(dir)) if (f.endsWith('.html')) out.push(`${app}/${f}`);
    }
    return out.filter(k => !filter || k.includes(filter)).sort();
}

const { chromium } = loadPlaywright();
const kits = await listKits(process.argv[2]);
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
let failed = 0;
const combos = [];
for (const kit of kits) for (const theme of ['light', 'dark']) for (const width of [1440, 375]) combos.push({ kit, theme, width });

for (const { kit, theme, width } of combos) {
    const mobile = width <= 768;
    const context = await browser.newContext({
        viewport: { width, height: mobile ? 812 : 900 }, deviceScaleFactor: 1,
        hasTouch: mobile, isMobile: mobile,
        // Boot under the OPPOSITE OS scheme, so the saved theme is what wins.
        colorScheme: theme === 'dark' ? 'light' : 'dark',
    });
    await context.addInitScript(t => { try { localStorage.setItem('theme', t); } catch (_) {} }, theme);
    await context.route('**/*', route => {
        const u = route.request().url();
        if (u.startsWith(CDN)) return serveLocal(route, u.slice(CDN.length));
        if (u.startsWith(KIT_ORIGIN)) return serveLocal(route, u.slice(KIT_ORIGIN.length));
        return route.continue();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('request', req => {
        const u = req.url();
        if (/fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr\.net/.test(u)) errors.push(`third-party request from the design system: ${u}`);
    });
    page.on('pageerror', e => errors.push(`page error: ${e.message}`));
    page.on('console', msg => { if (msg.type() === 'error' && !/Failed to load resource/.test(msg.text())) errors.push(`console error: ${msg.text()}`); });
    const label = `${kit} ${theme} ${width}`;
    try {
        await page.goto(KIT_ORIGIN + 'claude-design-export/ui_kits/' + kit, { waitUntil: 'networkidle', timeout: 30000 });
        await page.screenshot({ path: path.join(OUT, `${kit.replace(/[/.]/g, '-')}--${theme}-${width}.png`), fullPage: true });
        // A fullPage screenshot resets the device emulation, which drops
        // (pointer: coarse); put touch back before measuring tap targets.
        if (mobile) await (await context.newCDPSession(page)).send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
        await page.evaluate(html => {
            const host = document.querySelector('.content') || document.querySelector('.main-content') || document.body;
            host.insertAdjacentHTML('beforeend', html);
            // Re-run the label enhancer for the injected fixture, if present.
            if (window.dsEnhanceLabels) window.dsEnhanceLabels(host);
        }, FIXTURE);
        const fails = [...errors, ...await invariants(page, { width, theme }), ...await hoverInvariant(page)];
        if (fails.length) { failed++; console.log(`FAIL ${label}`); fails.forEach(f => console.log(`     - ${f}`)); }
        else console.log(`ok   ${label}`);
    } catch (e) {
        failed++; console.log(`FAIL ${label}\n     - ${e.message.split('\n')[0]}`);
    }
    await context.close();
}
await browser.close();
console.log(`\n${combos.length - failed}/${combos.length} renders passed · screenshots in ${OUT}`);
process.exit(failed ? 1 : 0);
