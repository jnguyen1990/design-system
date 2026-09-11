/* Shared layout helpers for Joe's personal apps (base, fitness, mealplanner,
   budgeter). Loaded synchronously by each app layout right after
   design-system.css: <script src="…/shared-core.js"></script>

   Exposes globals (classic script — an app can override any of these by
   redeclaring the function in a later inline script):
     - apiRequest(url, options)         JSON fetch wrapper; throws on !response.ok
                                        (fitness overrides: parses error body)
     - formatDate(dateString)           "Monday, July 6, 2026"
                                        (fitness + budgeter override: short format)
     - shortDate(dateString)            "Jul 6"
     - toggleTheme()                    flips data-theme, persists to localStorage
     - updateThemeIcon(theme)           sets #theme-icon glyph ☀️/🌙
                                        (mealplanner + budgeter override: other glyphs)
     - showStatus(divId, message, type) status-message div; success auto-hides in 3s
                                        (budgeter overrides: defaults type to 'info')
     - dsConfirm(message, opts)         styled Promise<boolean> replacement for
                                        window.confirm(). opts: title, confirmLabel,
                                        cancelLabel, danger (default true — affirmative
                                        renders btn-danger; false → btn-primary).
                                        Handles data-turbo-confirm forms with or
                                        without Turbo (delegated submit fallback).
     - initSettingsPanes(opts)          wires a .settings-pane section list: shows one
                                        .pane at a time, syncs the #hash for deep links
                                        and reload, marks the active .settings-nav link,
                                        and fires a bubbling "settingspane:change" event
                                        ({detail:{pane}}) so a page can retitle its header.
                                        Returns {show(name), panes:[…]} or null.
     - installNavHotkeys(opts)          ⌘1..⌘9 sidebar nav; call once per page.
                                        opts.allowCtrl — also respond to Ctrl (default
                                        false: Mac-only Meta, so Ctrl+1..9 tab switching
                                        on Windows/Linux isn't hijacked).
                                        opts.allowComma — also handle "," (⌘, settings).

   Also runs on load:
     - applies the saved theme from localStorage immediately (before first paint)
     - syncs #theme-icon on DOMContentLoaded
     - wires the mobile menu toggle / overlay / nav-link close (delegated, Turbo-safe)
     - click-to-dismiss for any .status-message toast (delegated document listener)
     - renderNavIcons(): fills <span class="nav-ico" data-ico="name"> with the
       shared outline icon set on DOMContentLoaded + turbo:load (v4.2 nav)

   Idempotent — safe to load more than once. */
(function (global) {
    if (global.__sharedCoreInstalled) return;
    global.__sharedCoreInstalled = true;

    // Apply saved theme immediately so there's no light/dark flash.
    (function () {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const h = document.documentElement;
        h.setAttribute('data-theme', savedTheme);
        h.classList.add(savedTheme);
    })();

    global.apiRequest = async function apiRequest(url, options = {}) {
        const defaults = { headers: { 'Content-Type': 'application/json' } };
        const config = { ...defaults, ...options };
        try {
            const response = await fetch(url, config);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    };

    global.formatDate = function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    global.shortDate = function shortDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    global.toggleTheme = function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        html.classList.remove(currentTheme);
        html.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        global.updateThemeIcon(newTheme);  // via global so app overrides win
    };

    global.updateThemeIcon = function updateThemeIcon(theme) {
        const icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    };

    global.showStatus = function showStatus(divId, message, type) {
        const div = document.getElementById(divId);
        if (!div) return;
        div.textContent = message;
        div.className = 'status-message status-' + type;
        div.style.display = 'block';
        if (type === 'success') setTimeout(() => { div.style.display = 'none'; }, 3000);
    };

    // Styled confirm dialog (brand-guide §13). Builds one reusable DS modal.
    // The affirmative sits rightmost; danger:true renders it btn-danger, which
    // also means modal-keys' Enter-to-primary deliberately does NOT fire it.
    global.dsConfirm = function dsConfirm(message, opts = {}) {
        const danger = opts.danger !== false;
        let modal = document.getElementById('ds-confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'ds-confirm-modal';
            modal.innerHTML =
                '<div class="modal-box" style="max-width:480px">' +
                '<div class="modal-header"><h3 id="ds-confirm-title"></h3>' +
                '<button class="modal-close btn-ghost" data-ds-confirm="cancel" aria-label="Close">&times;</button></div>' +
                '<div class="modal-body"><p id="ds-confirm-message" style="margin:0"></p></div>' +
                '<div class="modal-footer">' +
                '<button class="btn btn-secondary" data-ds-confirm="cancel"></button>' +
                '<button class="btn" data-ds-confirm="ok"></button></div></div>';
            document.body.appendChild(modal);
        }
        modal.querySelector('#ds-confirm-title').textContent = opts.title || 'Confirm';
        modal.querySelector('#ds-confirm-message').textContent = message;
        modal.querySelector('.modal-footer [data-ds-confirm="cancel"]').textContent = opts.cancelLabel || 'Cancel';
        const okBtn = modal.querySelector('[data-ds-confirm="ok"]');
        okBtn.textContent = opts.confirmLabel || 'Confirm';
        okBtn.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
        modal.classList.add('modal-open');
        okBtn.focus();
        return new Promise(resolve => {
            function done(ok) {
                modal.classList.remove('modal-open');
                modal.removeEventListener('click', onClick);
                document.removeEventListener('keydown', onKey, true);
                resolve(ok);
            }
            function onClick(e) {
                const act = e.target.closest('[data-ds-confirm]');
                if (act) return done(act.getAttribute('data-ds-confirm') === 'ok');
                if (e.target === modal) done(false);  // backdrop click
            }
            function onKey(e) {
                if (e.key === 'Escape') { e.preventDefault(); done(false); }
            }
            modal.addEventListener('click', onClick);
            document.addEventListener('keydown', onKey, true);
        });
    };

    // Route Rails/Turbo data-turbo-confirm through the styled dialog. Turbo
    // (an importmap module) is loaded by DOMContentLoaded when present.
    document.addEventListener('DOMContentLoaded', () => {
        const T = global.Turbo;
        if (!T) return;
        const method = (msg) => global.dsConfirm(msg);
        if (T.config && T.config.forms) T.config.forms.confirm = method;
        else if (T.setConfirmMethod) T.setConfirmMethod(method);
    });

    // The same attribute WITHOUT Turbo (the apps are all vanilla since
    // 2026-09-10): intercept the form submit and gate it on dsConfirm. The
    // attribute may sit on the form (button_to form: {data:}) or on the
    // submit button itself (button_to data:). Defers to Turbo if present.
    document.addEventListener('submit', function (e) {
        if (global.Turbo) return;
        const holder =
            (e.submitter && e.submitter.closest('[data-turbo-confirm]')) ||
            (e.target.matches && e.target.matches('[data-turbo-confirm]') ? e.target : null);
        if (!holder) return;
        e.preventDefault();
        global.dsConfirm(holder.getAttribute('data-turbo-confirm')).then(ok => {
            // Native submit() skips this listener, so no re-entry loop.
            if (ok) e.target.submit();
        });
    }, true);

    // ⌘1..⌘9 — jump to the matching sidebar link. Skip when the user is typing.
    global.installNavHotkeys = function installNavHotkeys(opts = {}) {
        document.addEventListener('keydown', e => {
            const mod = opts.allowCtrl ? (e.metaKey || e.ctrlKey) : (e.metaKey && !e.ctrlKey);
            if (!mod || e.altKey || e.shiftKey) return;
            const tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
            const isDigit = e.key >= '1' && e.key <= '9';
            if (!isDigit && !(opts.allowComma && e.key === ',')) return;
            const link = document.querySelector(`.nav-link[data-nav-key="${e.key}"]`);
            if (!link) return;
            e.preventDefault();
            window.location.href = link.getAttribute('href');
        });
    };

    // Sync the theme toggle icon with the active theme.
    document.addEventListener('DOMContentLoaded', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        global.updateThemeIcon(currentTheme);  // via global so app overrides win
    });

    // Toasts: click anywhere on a .status-message to dismiss. Delegated so it
    // covers server-rendered flash divs and app-level showStatus overrides.
    document.addEventListener('click', e => {
        const toast = e.target.closest && e.target.closest('.status-message');
        if (toast) toast.style.display = 'none';
    });

    // v4.2 nav icons — Feather-style 24×24 outline set. Layouts write
    // <span class="nav-ico" data-ico="name"></span>; the SVG is injected here
    // so the icon set has one home (like the dock logos in apps-launcher.js).
    const NAV_ICONS = {
        star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
        grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
        target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
        bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
        cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
        archive: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/>',
        activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
        sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
        'pie-chart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
        list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
        inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
        calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
        book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
        barbell: '<path d="M6.5 6.5v11"/><path d="M17.5 6.5v11"/><path d="M3 9v6"/><path d="M21 9v6"/><line x1="6.5" y1="12" x2="17.5" y2="12"/>',
        'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
        cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
        tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
        package: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
        wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
        clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
        users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'
    };

    global.renderNavIcons = function renderNavIcons(root) {
        (root || document).querySelectorAll('.nav-ico[data-ico]:empty').forEach(el => {
            const body = NAV_ICONS[el.getAttribute('data-ico')];
            if (body) el.innerHTML =
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
        });
    };
    document.addEventListener('DOMContentLoaded', () => global.renderNavIcons());
    document.addEventListener('turbo:load', () => global.renderNavIcons());

    // Settings panes — one section visible at a time (see .settings-pane in
    // design-system.css). Deep-linkable: /settings#connector opens that pane,
    // and switching panes rewrites the hash WITHOUT pushing history entries,
    // so Back leaves settings instead of walking the panes you clicked.
    global.initSettingsPanes = function initSettingsPanes(opts = {}) {
        const root = typeof opts.root === 'string'
            ? document.querySelector(opts.root)
            : (opts.root || document.querySelector('.settings-pane'));
        if (!root) return null;

        const links = Array.from(root.querySelectorAll('.settings-nav a[data-pane]'));
        const panes = Array.from(root.querySelectorAll('.pane[data-pane]'));
        if (!links.length || !panes.length) return null;
        const names = links.map(a => a.getAttribute('data-pane'));

        function show(name, o) {
            o = o || {};
            if (names.indexOf(name) === -1) name = names[0];
            panes.forEach(p => { p.hidden = p.getAttribute('data-pane') !== name; });
            links.forEach(a => {
                const on = a.getAttribute('data-pane') === name;
                a.classList.toggle('active', on);
                if (on) a.setAttribute('aria-current', 'page');
                else a.removeAttribute('aria-current');
            });
            if (o.hash !== false) {
                try { history.replaceState(null, '', '#' + name); } catch (e) { /* file:// */ }
            }
            root.dispatchEvent(new CustomEvent('settingspane:change', {
                detail: { pane: name }, bubbles: true
            }));
            return name;
        }

        links.forEach(a => a.addEventListener('click', e => {
            e.preventDefault();
            show(a.getAttribute('data-pane'));
        }));
        global.addEventListener('hashchange', () => show(location.hash.slice(1), { hash: false }));

        show(location.hash.slice(1) || names[0], { hash: false });
        return { show: show, panes: names };
    };

    // Mobile menu toggle / overlay / close-on-navigate. Delegated at the
    // document so Turbo body swaps (mealplanner, postings) don't orphan the
    // handlers with the old <body>.
    document.addEventListener('click', function (e) {
        if (!e.target.closest) return;
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        if (!sidebar) return;
        const set = open => { sidebar.classList.toggle('open', open); if (overlay) overlay.classList.toggle('show', open); };
        if (e.target.closest('#mobileMenuBtn')) { e.stopPropagation(); set(!sidebar.classList.contains('open')); }
        else if (e.target.closest('#mobileOverlay') || e.target.closest('.nav-link')) set(false);
    });
})(window);
