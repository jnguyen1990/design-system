/* Shared layout helpers for Joe's personal apps (base, budgeter, fitness,
   mealplanner, upkeep, postings). Loaded synchronously by each app layout
   right after design-system.css: <script src="…/shared-core.js"></script>

   Exposes globals (classic script — an app can override any of these by
   redeclaring the function in a later inline script):
     - apiRequest(url, options)         JSON fetch wrapper; resolves with the parsed
                                        body, throws Error("HTTP error! status: N")
                                        on !response.ok. Sends X-CSRF-Token (from the
                                        csrf-token meta) on same-origin non-GET
                                        requests; a FormData body goes out without a
                                        JSON Content-Type. The thrown error carries
                                        .status, .data and .serverMessage. options:
                                        accept ('json'), csrf (false to skip),
                                        serverErrorMessage (true → error.message is
                                        the server's message). Per-app default:
                                        apiRequest.defaults.serverErrorMessage.
                                        (fitness + upkeep still override in their
                                        layouts until they adopt this.)
     - formatDate(dateString, opts)     "Monday, July 6, 2026"; opts {short:true} or
                                        'short' → "Jul 6, 2026". Per-app default:
                                        formatDate.defaults.short.
                                        (fitness + budgeter still override: short)
     - shortDate(dateString)            "Jul 6"
     - escapeHtml(value)                &<>"' escaped; null/undefined → ''. Defined
                                        only if nothing else has claimed the name.
     - todayKey()                       today as "YYYY-MM-DD" in the LOCAL zone —
                                        never build this from toISOString() (UTC).
     - dateKey(date) / monthKey(date)   "YYYY-MM-DD" / "YYYY-MM" for a Date, local.
     - localDateTimeValue(date)         "YYYY-MM-DDTHH:MM" for datetime-local inputs.
     - cssToken(name, fallback)         a :root custom property as a trimmed string
                                        (Chart.js colours); fallback when empty.
                                        cssToken('green-9') or cssToken('--green-9').
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
     - dsPrompt(message, opts)          styled Promise<string|null> replacement for
                                        window.prompt(): the text on OK, null on
                                        cancel. opts: title, value, placeholder,
                                        confirmLabel, cancelLabel, danger (default
                                        false), multiline.
     - dsToast(message, type, ms)       a toast that needs no pre-placed div. type:
                                        success (default) | error | info | warning;
                                        all but error clear after ms (default 3000).
     - dsCopy(text)                     copy to the clipboard → Promise<boolean>.
     - initSettingsPanes(opts)          wires a .settings-pane section list: shows one
                                        .pane at a time, syncs the #hash for deep links
                                        and reload, marks the active .settings-nav link,
                                        and fires a bubbling "settingspane:change" event
                                        ({detail:{pane}}) so a page can retitle its header.
                                        Returns {show(name), panes:[…]} or null.
     - enhanceFileInputs(root)          wraps every input[type="file"] in a
                                        .drop-zone (click browses, drag-drop
                                        assigns + fires change). Auto-runs on
                                        DOMContentLoaded/turbo:load; call again
                                        for dynamically inserted inputs. Opt out
                                        per input with data-dz-skip.
     - installFilterTags(el, opts)      list-page filter bar: a committed term becomes
                                        a tag and the box clears. opts: fields (the
                                        per-page spec — the menu, builder and parser
                                        are all generated from it), value, onChange,
                                        errorEl, builderButton, textField. Returns
                                        {tags, query, set, add, clear, focus, parse}.
                                        opts.navigate {path, map, keep, tagsParam,
                                        textParam} wires a server-rendered page: tags
                                        become the params its controller already
                                        accepts and the page navigates.
     - filterTagsMatch(row, tags, get)  client-side matcher for pages that already
                                        hold their rows; `get(field, row)` returns the
                                        value to test. Server-backed pages translate
                                        tags into query params instead.
     - placeDropdownMenu(menu)          anchors an open .dropdown-menu to its
                                        .dropdown trigger as position: fixed, so a
                                        card's overflow context cannot clip it;
                                        flips above when short of room below.
                                        Applied automatically whenever the `open`
                                        class lands on a .dropdown-menu — pages keep
                                        their own toggle functions and call nothing.
     - installNavHotkeys(opts)          ⌘1..⌘9 sidebar nav; call once per page.
                                        opts.allowCtrl — also respond to Ctrl (default
                                        false: Mac-only Meta, so Ctrl+1..9 tab switching
                                        on Windows/Linux isn't hijacked).
                                        opts.allowComma — also handle "," (⌘, settings).

   Also runs on load:
     - applies the saved theme from localStorage immediately (before first paint)
     - syncs #theme-icon on DOMContentLoaded
     - wires the mobile menu toggle / overlay / nav-link close (delegated, Turbo-safe)
     - row-select tables: clicking a row toggles its checkbox when that
       checkbox opts in with data-row-select (delegated; clicks on the row's
       own links/buttons/inputs are left alone)
     - click-to-dismiss for any .status-message toast (delegated document listener)
     - flash auto-dismiss: a .status-message.status-success that is visible when
       the page loads hides itself after 3s (errors stay)
     - copy buttons: clicking [data-copy-text="…"] or [data-copy-target="<selector>"]
       copies and confirms with a toast (data-copy-label overrides "Copied")
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

    // ── Small pure helpers ─────────────────────────────────────────────────
    // escapeHtml was written privately 15 times across base, budgeter and
    // fitness in two null-handling variants. Defined only when nothing has
    // claimed the name, and a page's own `function escapeHtml` declaration in
    // a later script still replaces it, so pages keep their copy until cleaned.
    if (typeof global.escapeHtml !== 'function') {
        global.escapeHtml = function escapeHtml(value) {
            if (value === null || value === undefined) return '';
            return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        };
    }

    // Local-date keys. NEVER derive "today" from toISOString(): it converts to
    // UTC, so any evening west of Greenwich reads as tomorrow (and the last
    // evening of a month as next month). Lifted from budgeter's layout.
    const pad2 = n => String(n).padStart(2, '0');
    const asDate = d => (d instanceof Date ? d : (d === undefined || d === null ? new Date() : new Date(d)));
    global.monthKey = function monthKey(date) {
        date = asDate(date);
        return date.getFullYear() + '-' + pad2(date.getMonth() + 1);
    };
    global.dateKey = function dateKey(date) {
        date = asDate(date);
        return global.monthKey(date) + '-' + pad2(date.getDate());
    };
    global.todayKey = function todayKey() {
        return global.dateKey(new Date());
    };
    // Value for <input type="datetime-local">: local wall time, to the minute.
    global.localDateTimeValue = function localDateTimeValue(date) {
        date = asDate(date);
        return global.dateKey(date) + 'T' + pad2(date.getHours()) + ':' + pad2(date.getMinutes());
    };

    // Read a design token off :root for code that needs a colour STRING
    // (Chart.js, Leaflet). The stylesheet can lose a load race against the
    // first chart, so an empty read falls back. `name` takes or omits the
    // leading "--": cssToken('green-9', '#30A46C').
    global.cssToken = function cssToken(name, fallback) {
        const prop = String(name).indexOf('--') === 0 ? String(name) : '--' + name;
        const v = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
        return v || (fallback === undefined ? '' : fallback);
    };

    // JSON fetch wrapper. What every caller has always seen is unchanged:
    // resolves with the parsed JSON body, rejects with
    // Error("HTTP error! status: <code>") on a non-2xx, and a caller's own
    // `headers` REPLACE the default Content-Type rather than merging with it.
    //
    // Added 2026-11-05 (none of it alters an existing call):
    //   - X-CSRF-Token from <meta name="csrf-token"> on same-origin non-GET
    //     requests, unless the caller set one or passes csrf:false.
    //   - a FormData body goes out with no Content-Type, so the browser can
    //     write the multipart boundary (when the caller supplied no headers).
    //   - the thrown error carries .status, .data (parsed JSON error body, or
    //     null) and .serverMessage (data.error | data.message | data.errors).
    //   - options.accept: 'json' (or a MIME string) adds an Accept header, for
    //     endpoints that pick their response with respond_to.
    //   - options.serverErrorMessage: true makes error.message the server's
    //     message when there is one. Off by default because existing callers
    //     show or compare the "HTTP error!" text; an app that wants it on
    //     everywhere sets apiRequest.defaults.serverErrorMessage = true once
    //     in its layout (this is what fitness's override does today).
    const apiDefaults = { serverErrorMessage: false };
    global.apiRequest = async function apiRequest(url, options = {}) {
        const { serverErrorMessage, accept, csrf, ...fetchOptions } = options || {};
        const isForm = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
        const defaults = { headers: isForm ? {} : { 'Content-Type': 'application/json' } };
        const config = { ...defaults, ...fetchOptions };

        const extra = {};
        if (accept) extra['Accept'] = accept === true || accept === 'json' ? 'application/json' : accept;
        const method = String(config.method || 'GET').toUpperCase();
        if (csrf !== false && method !== 'GET' && method !== 'HEAD') {
            const meta = document.querySelector('meta[name="csrf-token"]');
            const token = meta && meta.getAttribute('content');
            let sameOrigin = false;
            try { sameOrigin = new URL(url, global.location.href).origin === global.location.origin; } catch (_) { /* opaque URL */ }
            if (token && sameOrigin) extra['X-CSRF-Token'] = token;
        }
        const extraKeys = Object.keys(extra);
        if (extraKeys.length) {
            // Never overwrite a header the caller set themselves.
            const h = config.headers;
            if (typeof Headers !== 'undefined' && (h instanceof Headers || Array.isArray(h))) {
                const merged = new Headers(h);
                extraKeys.forEach(k => { if (!merged.has(k)) merged.set(k, extra[k]); });
                config.headers = merged;
            } else {
                const merged = { ...(h || {}) };
                const have = Object.keys(merged).map(k => k.toLowerCase());
                extraKeys.forEach(k => { if (have.indexOf(k.toLowerCase()) === -1) merged[k] = extra[k]; });
                config.headers = merged;
            }
        }

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const error = new Error(`HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = null;
                error.serverMessage = null;
                try {
                    const body = await response.json();
                    error.data = body;
                    if (body && typeof body === 'object') {
                        const m = body.error || body.message ||
                            (Array.isArray(body.errors) ? body.errors.join(', ') : body.errors);
                        if (m && typeof m === 'string') error.serverMessage = m;
                    }
                } catch (_) { /* not JSON — status is all we have */ }
                const useServer = serverErrorMessage === undefined
                    ? apiDefaults.serverErrorMessage
                    : serverErrorMessage;
                if (useServer && error.serverMessage) error.message = error.serverMessage;
                throw error;
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    };
    global.apiRequest.defaults = apiDefaults;

    // formatDate('2026-07-06')                  "Monday, July 6, 2026"
    // formatDate('2026-07-06', { short: true }) "Jul 6, 2026"  (also 'short')
    // An app whose every date is short sets formatDate.defaults.short = true
    // once in its layout — the override budgeter and fitness each carry.
    const formatDateDefaults = { short: false };
    global.formatDate = function formatDate(dateString, opts) {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        // opts is only honoured as an object or the string 'short', so
        // list.map(formatDate) — which passes an index — keeps the default.
        const asked = opts === 'short' ? true
            : (opts && typeof opts === 'object' && typeof opts.short === 'boolean') ? opts.short
            : undefined;
        const short = asked === undefined ? formatDateDefaults.short : asked;
        return short
            ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };
    global.formatDate.defaults = formatDateDefaults;

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

    // Styled prompt — dsConfirm's sibling for the one-line "why?" question.
    // Resolves with the typed string ('' if left blank) on OK and null on
    // cancel / Esc / backdrop, the same contract as window.prompt().
    // opts: title, value (initial text), placeholder, confirmLabel,
    // cancelLabel, danger (default false — a prompt is rarely destructive),
    // multiline (textarea; Enter then inserts a newline instead of submitting).
    global.dsPrompt = function dsPrompt(message, opts = {}) {
        let modal = document.getElementById('ds-prompt-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'ds-prompt-modal';
            modal.innerHTML =
                '<div class="modal-box" style="max-width:480px">' +
                '<div class="modal-header"><h3 id="ds-prompt-title"></h3>' +
                '<button class="modal-close btn-ghost" data-ds-prompt="cancel" aria-label="Close">&times;</button></div>' +
                '<div class="modal-body"><label id="ds-prompt-message" for="ds-prompt-input" style="display:block;margin:0 0 8px"></label>' +
                '<span id="ds-prompt-field"></span></div>' +
                '<div class="modal-footer">' +
                '<button class="btn btn-secondary" data-ds-prompt="cancel"></button>' +
                '<button class="btn" data-ds-prompt="ok"></button></div></div>';
            document.body.appendChild(modal);
        }
        // Rebuilt per call so single-line and multiline prompts can alternate.
        const field = modal.querySelector('#ds-prompt-field');
        field.innerHTML = '';
        const input = document.createElement(opts.multiline ? 'textarea' : 'input');
        if (opts.multiline) input.rows = 3; else input.type = 'text';
        input.id = 'ds-prompt-input';
        input.className = 'form-control';
        input.style.width = '100%';
        input.value = opts.value === undefined || opts.value === null ? '' : String(opts.value);
        input.placeholder = opts.placeholder || '';
        field.appendChild(input);

        modal.querySelector('#ds-prompt-title').textContent = opts.title || 'Enter a value';
        modal.querySelector('#ds-prompt-message').textContent = message === undefined || message === null ? '' : message;
        modal.querySelector('.modal-footer [data-ds-prompt="cancel"]').textContent = opts.cancelLabel || 'Cancel';
        const okBtn = modal.querySelector('[data-ds-prompt="ok"]');
        okBtn.textContent = opts.confirmLabel || 'OK';
        okBtn.className = 'btn ' + (opts.danger ? 'btn-danger' : 'btn-primary');
        modal.classList.add('modal-open');
        input.focus();
        input.select();
        return new Promise(resolve => {
            let settled = false;
            function done(ok) {
                // modal-keys' Enter-to-primary and the input's own Enter can
                // both land here for one keypress; only the first counts.
                if (settled) return;
                settled = true;
                modal.classList.remove('modal-open');
                modal.removeEventListener('click', onClick);
                document.removeEventListener('keydown', onKey, true);
                resolve(ok ? input.value : null);
            }
            function onClick(e) {
                const act = e.target.closest('[data-ds-prompt]');
                if (act) return done(act.getAttribute('data-ds-prompt') === 'ok');
                if (e.target === modal) done(false);  // backdrop click
            }
            function onKey(e) {
                if (e.key === 'Escape') { e.preventDefault(); done(false); }
                else if (e.key === 'Enter' && e.target === input && !opts.multiline &&
                         !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
                    e.preventDefault();
                    done(true);
                }
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

    // A toast with no markup to pre-place: showStatus() needs a div the page
    // already rendered, this one makes its own (#ds-toast, reused). type is
    // success | error | info | warning; everything but error clears itself
    // after `ms` (default 3000), error waits for a click.
    let toastTimer = null;
    global.dsToast = function dsToast(message, type, ms) {
        if (!document.body) return null;
        let el = document.getElementById('ds-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ds-toast';
            el.setAttribute('role', 'status');
            el.setAttribute('aria-live', 'polite');
            document.body.appendChild(el);
        }
        type = type || 'success';
        el.textContent = message;
        el.className = 'status-message status-' + type;
        el.style.display = 'block';
        clearTimeout(toastTimer);
        if (type !== 'error') toastTimer = setTimeout(() => { el.style.display = 'none'; }, ms || 3000);
        return el;
    };

    // Server-rendered flash: a success toast present when the page loads
    // clears itself after 3s; errors stay until clicked or the next
    // navigation. mealplanner, postings and upkeep each carried this as a
    // layout one-liner — running both is harmless, each just hides the same
    // element at the same moment.
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.status-message.status-success').forEach(el => {
            // Only a toast that is actually showing. A hidden one is a page's
            // own showStatus()/copy-status target and keeps its own timer.
            if (el.id === 'ds-toast' || getComputedStyle(el).display === 'none') return;
            setTimeout(() => { el.style.display = 'none'; }, 3000);
        });
    });

    // ── Copy to clipboard ──────────────────────────────────────────────────
    //   <button data-copy-text="the literal text">Copy</button>
    //   <button data-copy-target="#mcp-url">Copy</button>
    // data-copy-target takes a selector: a form field copies its value,
    // anything else its trimmed text. Confirms with a toast ("Copied", or
    // data-copy-label). The attribute is data-copy-text, not data-copy —
    // mealplanner's settings page already uses data-copy="<element id>" with
    // its own handler, and answering to that name would copy the id string.
    function dsCopy(text) {
        text = text === undefined || text === null ? '' : String(text);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
        }
        return Promise.resolve(legacyCopy(text));
    }
    // dsCopy(text) → Promise<boolean>, for pages that copy from script.
    global.dsCopy = dsCopy;
    // navigator.clipboard needs a secure context; fall back so a copy button
    // on plain http (local dev, LAN) is never a dead end.
    function legacyCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
        ta.remove();
        return ok;
    }
    document.addEventListener('click', e => {
        const el = e.target.closest && e.target.closest('[data-copy-text], [data-copy-target]');
        if (!el) return;
        let text;
        if (el.hasAttribute('data-copy-text')) {
            text = el.getAttribute('data-copy-text');
        } else {
            let src = null;
            try { src = document.querySelector(el.getAttribute('data-copy-target')); } catch (_) { /* bad selector */ }
            if (!src) return;
            text = 'value' in src && typeof src.value === 'string' ? src.value : (src.textContent || '').trim();
        }
        dsCopy(text).then(ok => {
            global.dsToast(ok ? (el.getAttribute('data-copy-label') || 'Copied') : 'Copy failed', ok ? 'success' : 'error');
        });
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

    // ── Sticky-header height ──────────────────────────────────────────
    // `.page-header` is sticky at top:0, so anything else that sticks has to
    // start below it. Its height is NOT a constant: 63px with a title alone,
    // 87px with a subtitle, 113px with a crumb as well, and ~15px less below
    // 1024px. The design system hardcoded 84px for `.settings-nav`, which put
    // 3px of the rail under the header in four apps and 29px in upkeep and
    // postings (both render a crumb). Measuring is the only thing that holds
    // across compositions, so publish it as a custom property and let CSS do
    // the arithmetic: `top: calc(var(--header-h) + var(--space-3))`.
    function syncHeaderHeight() {
        const h = document.querySelector('.page-header');
        if (!h) return;
        const px = Math.round(h.getBoundingClientRect().height);
        if (px > 0) document.documentElement.style.setProperty('--header-h', px + 'px');
    }
    global.syncHeaderHeight = syncHeaderHeight;

    document.addEventListener('DOMContentLoaded', () => {
        syncHeaderHeight();
        // The header also changes height on its own — a subtitle wrapping at a
        // narrow width, or header-actions reflowing — so watch it rather than
        // only sampling on resize.
        const h = document.querySelector('.page-header');
        if (h && global.ResizeObserver) new ResizeObserver(syncHeaderHeight).observe(h);
    });
    document.addEventListener('turbo:load', syncHeaderHeight);

    // ── Drop zones ─────────────────────────────────────────────────────────
    // Every input[type="file"] gets wrapped in a .drop-zone: click browses,
    // drag-and-drop assigns the files to the hidden input and fires its
    // change event, so existing per-app JS reading input.files keeps working
    // untouched. Opt out per input with data-dz-skip. Re-runnable for
    // dynamically inserted inputs via enhanceFileInputs(root).
    global.enhanceFileInputs = function enhanceFileInputs(root) {
        (root || document).querySelectorAll('input[type="file"]:not([data-dz-skip]):not([data-dz-enhanced])').forEach(input => {
            // Inputs already hidden behind their own trigger button (the
            // style="display:none" + button.click() pattern several apps use)
            // keep their existing flow — injecting a visible zone there would
            // break the layout around the trigger.
            if (input.hidden || input.style.display === 'none' || getComputedStyle(input).display === 'none') return;
            input.setAttribute('data-dz-enhanced', '1');

            const zone = document.createElement('div');
            zone.className = 'drop-zone';
            zone.setAttribute('tabindex', '0');
            zone.setAttribute('role', 'button');
            zone.setAttribute('aria-label', 'Choose or drop ' + (input.multiple ? 'files' : 'a file'));

            const label = document.createElement('div');
            const hint = document.createElement('div');
            hint.className = 'drop-zone-hint';
            const files = document.createElement('div');
            files.className = 'drop-zone-files';
            zone.append(label, hint, files);

            const accept = (input.getAttribute('accept') || '').trim();
            const idle = () => {
                label.textContent = input.multiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse';
                hint.textContent = accept ? accept.split(',').map(s => s.trim()).join(' · ') : '';
            };
            const update = () => {
                idle();
                const names = Array.from(input.files || []).map(f => f.name);
                if (!names.length) { files.textContent = ''; return; }
                const shown = names.slice(0, 3).join(', ');
                files.textContent = names.length > 3 ? shown + ' +' + (names.length - 3) + ' more' : shown;
            };

            input.classList.add('drop-zone-input');
            input.insertAdjacentElement('afterend', zone);
            update();

            zone.addEventListener('click', () => input.click());
            zone.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
            });
            ['dragenter', 'dragover'].forEach(ev => zone.addEventListener(ev, e => {
                e.preventDefault();
                zone.classList.add('dragover');
            }));
            zone.addEventListener('dragleave', e => {
                if (!zone.contains(e.relatedTarget)) zone.classList.remove('dragover');
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('dragover');
                const dropped = Array.from((e.dataTransfer && e.dataTransfer.files) || []);
                if (!dropped.length) return;
                const dt = new DataTransfer();
                (input.multiple ? dropped : dropped.slice(0, 1)).forEach(f => dt.items.add(f));
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
            input.addEventListener('change', update);
        });
    };
    document.addEventListener('DOMContentLoaded', () => global.enhanceFileInputs());
    document.addEventListener('turbo:load', () => global.enhanceFileInputs());

    // ── Filter tags ────────────────────────────────────────────────────────
    // A list page's filter bar: one field where a committed term becomes a tag.
    // Type `imported:today` or `imported date = today`, press Enter, it becomes
    // the tag `imported:today` and the box clears for the next one. The TAGS are
    // the filter state; the query string exists only to carry that state in the
    // URL. Free text is not a special case — it is the `keyword` field.
    //
    //   const f = installFilterTags(el, {
    //     fields: { keyword:{type:'text'}, category:{type:'enum', values:[…]} },
    //     value: 'imported:today',
    //     onChange(tags, q) { … }
    //   });
    //
    // Pages declare fields; the suggestion menu, the builder and the parser are
    // all generated from that one spec.
    const FT_DATE_WORDS = [ 'today', 'yesterday', 'this month', 'last month', 'this year' ];

    function ftResolveDate(raw, today) {
        const t = String(raw).trim().toLowerCase();
        // ISO first: the word normalisation below turns hyphens into spaces so
        // "this-month" reads as "this month", which would shred 2026-10-01.
        if (/^\d{4}$/.test(t))             return { kind: 'year',  value: t, word: t };
        if (/^\d{4}-\d{2}$/.test(t))       return { kind: 'month', value: t, word: t };
        if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return { kind: 'day',   value: t, word: t };
        const v = t.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
        const d = new Date(today);
        if (v === 'today')      return { kind: 'day',   value: ftDay(d), word: 'today' };
        if (v === 'yesterday')  { d.setDate(d.getDate() - 1); return { kind: 'day', value: ftDay(d), word: 'yesterday' }; }
        if (v === 'this month') return { kind: 'month', value: ftDay(d).slice(0, 7), word: 'this-month' };
        if (v === 'last month') { d.setMonth(d.getMonth() - 1); return { kind: 'month', value: ftDay(d).slice(0, 7), word: 'last-month' }; }
        if (v === 'this year')  return { kind: 'year',  value: String(d.getFullYear()), word: 'this-year' };
        return null;
    }
    function ftDay(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // Client-side matcher for pages that already hold their rows in memory.
    // `get` maps a field name to that row's value; dates must come back as
    // YYYY-MM-DD and numbers as numbers. Server-backed pages ignore this and
    // translate tags into query params instead.
    function filterTagsMatch(row, tags, get) {
        return (tags || []).every(t => {
            const got = get(t.field, row);
            if (got === undefined || got === null) return t.op === '!=';
            if (t.date) {
                const cmp = t.date.kind === 'month' ? String(got).slice(0, 7)
                          : t.date.kind === 'year'  ? String(got).slice(0, 4) : String(got);
                switch (t.op) {
                    case '=':  return cmp === t.date.value;
                    case '!=': return cmp !== t.date.value;
                    case '>':  return cmp >  t.date.value;
                    case '<':  return cmp <  t.date.value;
                    case '>=': return cmp >= t.date.value;
                    case '<=': return cmp <= t.date.value;
                }
            }
            if (t.num !== undefined) {
                const n = Number(got);
                switch (t.op) {
                    case '=':  return n === t.num;
                    case '!=': return n !== t.num;
                    case '>':  return n >  t.num;
                    case '<':  return n <  t.num;
                    case '>=': return n >= t.num;
                    case '<=': return n <= t.num;
                }
            }
            // Text and enum. An array value (tags on a record) matches if any
            // element does; a string matches as a substring for free text and
            // exactly for everything else.
            const hay = Array.isArray(got) ? got.map(v => String(v).toLowerCase()) : String(got).toLowerCase();
            const want = String(t.raw).toLowerCase();
            const hit = Array.isArray(hay) ? hay.includes(want)
                      : t.loose === false ? hay === want
                      : hay.includes(want);
            return t.op === '!=' ? !hit : hit;
        });
    }
    global.filterTagsMatch = filterTagsMatch;

    function installFilterTags(root, opts) {
        if (!root) return null;
        const fields = opts.fields || {};
        const today = opts.today ? new Date(opts.today) : new Date();
        // Longest alias first so "imported date" beats "imported".
        const aliases = Object.entries(fields)
            .flatMap(([key, f]) => (f.aliases || [key]).map(a => [ a.toLowerCase(), key ]))
            .sort((a, b) => b[0].length - a[0].length);

        let tags = [];
        let focused = -1;

        root.classList.add('filter-tags');
        root.innerHTML = '<input type="text" autocomplete="off" spellcheck="false">'
            + '<div class="filter-tags-menu"></div>';
        const input = root.querySelector('input');
        const menu = root.querySelector('.filter-tags-menu');
        input.placeholder = opts.placeholder || 'Filter or search…';

        // ── Parse exactly one term; precision here is what lets Enter refuse ──
        function parseTerm(text) {
            const s = String(text).trim();
            if (!s) return null;
            const phrase = FT_DATE_WORDS.map(w => w.replace(/ /g, '\\s+')).join('|');
            const value = '("[^"]*"|\'[^\']*\'|' + phrase + '|.+)';

            for (const [ alias, key ] of aliases) {
                const m = s.match(new RegExp('^' + alias.replace(/ /g, '\\s+') + '\\s*(>=|<=|!=|=|>|<|:)\\s*' + value + '$', 'i'));
                if (!m) continue;
                const spec = fields[key];
                let op = m[1] === ':' ? '=' : m[1];
                let raw = m[2].replace(/^["']|["']$/g, '').trim();
                // `amount:>90` — the colon only names the field, so lift the real
                // operator out of the value. The suggestion menu proposes this shape.
                if (op === '=' && spec.type !== 'text') {
                    const lifted = raw.match(/^(>=|<=|!=|>|<)\s*(.+)$/);
                    if (lifted) { op = lifted[1]; raw = lifted[2].trim(); }
                }
                if (spec.type === 'date') {
                    const d = ftResolveDate(raw, today);
                    if (!d) return { error: '"' + raw + '" isn\'t a date. Try today, yesterday, this month, or ' + ftDay(today) + '.' };
                    return { field: key, op, raw: d.word, date: d };
                }
                if (spec.type === 'number') {
                    const n = parseFloat(raw.replace(/[$,\s]/g, ''));
                    if (isNaN(n)) return { error: '"' + raw + '" isn\'t a number.' };
                    return { field: key, op, raw: String(n), num: n };
                }
                if (spec.type === 'enum') {
                    const vals = ftValues(key);
                    const hit = vals.find(v => String(v).toLowerCase() === raw.toLowerCase());
                    if (!hit) return { error: 'No ' + (spec.label || key).toLowerCase() + ' called "' + raw + '".'
                        + (vals.length ? ' Try: ' + vals.slice(0, 6).join(', ') + (vals.length > 6 ? '…' : '') + '.' : '') };
                    return { field: key, op, raw: String(hit).toLowerCase() };
                }
                return { field: key, op, raw: raw.toLowerCase() };
            }
            // A trailing operator is incomplete, not wrong.
            for (const [ alias, key ] of aliases) {
                if (new RegExp('^' + alias.replace(/ /g, '\\s+') + '\\s*(>=|<=|!=|=|>|<|:)\\s*$', 'i').test(s)) return { incomplete: key };
            }
            const named = s.match(/^([a-z][a-z ]*?)\s*(>=|<=|!=|=|>|<|:)\s*(.+)$/i);
            if (named) return { error: 'There\'s no "' + named[1].trim() + '" to filter on. Fields: ' + Object.keys(fields).join(', ') + '.' };
            // Bare words are sugar for the free-text field.
            const free = opts.textField || 'keyword';
            return fields[free] ? { field: free, op: '=', raw: s.toLowerCase() } : { error: 'Type a filter like ' + Object.keys(fields)[0] + ':…' };
        }

        function ftValues(key) {
            const v = fields[key].values;
            return (typeof v === 'function' ? v() : v) || [];
        }
        function label(t) {
            const v = /\s/.test(t.raw) ? '"' + t.raw + '"' : t.raw;
            return t.field + (t.op === '=' ? ':' : t.op) + v;
        }
        const query = () => tags.map(label).join(' ');

        // ── Render ────────────────────────────────────────────────────────────
        function render(fire) {
            [ ...root.querySelectorAll('.filter-tag') ].forEach(n => n.remove());
            tags.forEach((t, i) => {
                const el = document.createElement('span');
                el.className = 'filter-tag' + (t.field === (opts.textField || 'keyword') ? ' filter-tag--text' : '')
                    + (i === focused ? ' is-focused' : '');
                el.innerHTML = escapeForTag(label(t)) + ' <span class="filter-tag-x" data-i="' + i + '" aria-label="Remove">&times;</span>';
                root.insertBefore(el, input);
            });
            root.classList.toggle('has-tags', tags.length > 0);
            if (fire !== false && opts.onChange) opts.onChange(tags.slice(), query());
        }
        function escapeForTag(s) {
            return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        }
        function setError(msg) {
            root.classList.toggle('is-invalid', !!msg);
            if (opts.errorEl) opts.errorEl.textContent = msg || '';
        }
        function commit(term) { tags.push(term); focused = -1; input.value = ''; setError(''); render(); }

        // ── Suggestions ───────────────────────────────────────────────────────
        function suggest() {
            const v = input.value;
            if (!v.trim()) return { head: 'Filter by', items: Object.keys(fields).map(k => ftFieldItem(k)) };
            const m = v.match(/^(.*?)(:|=)\s*(.*)$/);
            if (m) {
                const key = (aliases.find(a => a[0] === m[1].trim().toLowerCase()) || [])[1];
                if (key) {
                    const spec = fields[key];
                    if (spec.type === 'text')
                        return { head: (spec.label || key) + ' contains…', items: [ { k: m[3] || '…', d: spec.hint || 'type a value, then Enter', insert: null } ] };
                    const pool = spec.type === 'date' ? [ 'today', 'yesterday', 'this month', 'last month' ]
                        : spec.type === 'number' ? [ '>50', '>100', '<20' ] : ftValues(key).map(String);
                    const typed = m[3].replace(/\s+/g, '').toLowerCase();
                    const hits = pool.filter(x => x.replace(/\s+/g, '').toLowerCase().startsWith(typed));
                    return hits.length ? { head: (spec.label || key) + ' is…',
                        items: hits.slice(0, 40).map(x => ({ k: x, d: '', insert: /^[<>]/.test(x) ? key + x : key + ':' + x })) } : null;
                }
            }
            const hits = Object.keys(fields).filter(k =>
                k.startsWith(v.toLowerCase()) || (fields[k].label || '').toLowerCase().startsWith(v.toLowerCase()));
            return hits.length ? { head: 'Filter by', items: hits.map(k => ftFieldItem(k)) } : null;
        }
        function ftFieldItem(k) { return { k: k + ':', d: fields[k].type || 'text', insert: k + ':' }; }

        function openMenu() {
            const s = suggest();
            if (!s) return closeMenu();
            menu.innerHTML = '<div class="filter-tags-menu-head">' + s.head + '</div>' + s.items.map((it, i) =>
                it.insert === null
                    ? '<div class="filter-tags-opt is-static"><span class="k">' + escapeForTag(it.k) + '</span><span class="d">' + escapeForTag(it.d) + '</span></div>'
                    : '<div class="filter-tags-opt' + (i === 0 ? ' is-sel' : '') + '" data-insert="' + escapeForTag(it.insert) + '">'
                      + '<span class="k">' + escapeForTag(it.k) + '</span><span class="d">' + escapeForTag(it.d) + '</span></div>').join('');
            menu.classList.add('open');
        }
        const closeMenu = () => menu.classList.remove('open');

        function applySuggestion(ins) {
            const term = parseTerm(ins);
            // A suggestion that completes a term commits immediately — picking
            // "today" should not leave you with text still to confirm.
            if (term && term.field) commit(term); else { input.value = ins; }
            input.focus(); openMenu();
        }

        // ── Events ────────────────────────────────────────────────────────────
        root.addEventListener('mousedown', e => {
            if (e.target.classList.contains('filter-tag-x')) {
                tags.splice(+e.target.dataset.i, 1); render(); e.preventDefault(); return;
            }
            const tag = e.target.closest('.filter-tag');
            if (tag) {
                const i = [ ...root.querySelectorAll('.filter-tag') ].indexOf(tag);
                input.value = label(tags[i]);
                tags.splice(i, 1); render(); input.focus(); openMenu(); e.preventDefault(); return;
            }
            if (e.target !== input) { input.focus(); e.preventDefault(); }
        });
        input.addEventListener('input', () => { setError(''); focused = -1; render(false); openMenu(); });
        input.addEventListener('focus', openMenu);
        input.addEventListener('blur', () => setTimeout(closeMenu, 150));
        input.addEventListener('keydown', e => {
            const opts_ = [ ...menu.querySelectorAll('.filter-tags-opt[data-insert]') ];
            const cur = opts_.findIndex(o => o.classList.contains('is-sel'));
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && menu.classList.contains('open') && opts_.length) {
                e.preventDefault();
                opts_.forEach(o => o.classList.remove('is-sel'));
                opts_[(cur + (e.key === 'ArrowDown' ? 1 : opts_.length - 1) + opts_.length) % opts_.length].classList.add('is-sel');
                return;
            }
            if (e.key === 'Tab' && menu.classList.contains('open') && cur >= 0) { e.preventDefault(); applySuggestion(opts_[cur].dataset.insert); return; }
            if (e.key === 'Enter') {
                e.preventDefault();
                const term = parseTerm(input.value);
                if (!term) return;
                if (term.incomplete) { setError(''); openMenu(); return; }
                if (term.error) { setError(term.error); return; }
                commit(term); openMenu();
                return;
            }
            if (e.key === 'Backspace' && !input.value) {
                if (focused === -1 && tags.length) { focused = tags.length - 1; render(false); }
                else if (focused >= 0) { tags.splice(focused, 1); focused = -1; render(); }
                return;
            }
            if (e.key === 'Escape') closeMenu();
        });
        menu.addEventListener('mousedown', e => {
            const o = e.target.closest('.filter-tags-opt[data-insert]');
            if (o) { e.preventDefault(); applySuggestion(o.dataset.insert); }
        });

        // ── Public surface ────────────────────────────────────────────────────
        const api = {
            get tags() { return tags.slice(); },
            get query() { return query(); },
            set(q, fire) {
                tags = [];
                String(q || '').split(/\s+(?=[^"]*(?:"[^"]*"[^"]*)*$)/).filter(Boolean).forEach(part => {
                    const t = parseTerm(part);
                    if (t && t.field) tags.push(t);
                });
                focused = -1; input.value = ''; setError('');
                render(fire !== false);
                return api;
            },
            add(text) { const t = parseTerm(text); if (t && t.field) commit(t); return api; },
            clear() { tags = []; focused = -1; render(); return api; },
            focus() { input.focus(); return api; },
            fields,
            parse: parseTerm,
        };

        // Optional "+ Filter" builder — appends a tag, same as typing one.
        if (opts.builderButton) {
            const box = document.createElement('div');
            box.className = 'filter-tags-menu filter-tags-builder';
            opts.builderButton.parentNode.insertBefore(box, opts.builderButton.nextSibling);
            let bField = null;
            const showFields = () => {
                bField = null;
                box.innerHTML = '<div class="filter-tags-menu-head">Filter by</div>' + Object.keys(fields).map(k =>
                    '<div class="filter-tags-opt" data-field="' + k + '"><span class="k">' + escapeForTag(fields[k].label || k)
                    + '</span><span class="d">' + (fields[k].type || 'text') + '</span></div>').join('');
                box.classList.add('open');
            };
            opts.builderButton.addEventListener('click', e => {
                e.stopPropagation();
                box.classList.contains('open') ? box.classList.remove('open') : showFields();
            });
            box.addEventListener('click', e => {
                const o = e.target.closest('.filter-tags-opt');
                if (!o) return;
                // Stop here: the innerHTML swap below detaches the clicked node, so
                // the document handler would read this as an outside click.
                e.stopPropagation();
                if (o.dataset.field) {
                    const k = o.dataset.field, spec = fields[k];
                    if (spec.type === 'text') { box.classList.remove('open'); input.value = k + ':'; input.focus(); openMenu(); return; }
                    bField = k;
                    const vals = spec.type === 'date' ? [ 'today', 'yesterday', 'this month', 'last month' ]
                        : spec.type === 'number' ? [ '>50', '>100', '<20' ] : ftValues(k).map(String);
                    box.innerHTML = '<div class="filter-tags-menu-head">' + escapeForTag(spec.label || k) + ' is…</div>'
                        + vals.slice(0, 40).map(v => '<div class="filter-tags-opt" data-value="' + escapeForTag(v) + '"><span class="k">' + escapeForTag(v) + '</span></div>').join('');
                    return;
                }
                if (o.dataset.value !== undefined) {
                    api.add(bField + ':' + o.dataset.value);
                    box.classList.remove('open');
                }
            });
            document.addEventListener('click', e => {
                if (!e.target.closest('.filter-tags-builder') && e.target !== opts.builderButton) box.classList.remove('open');
            });
        }

        // ── Server-rendered pages: navigate instead of re-fetching ───────────
        // Four pages repeated the same shape — collect free text into one param,
        // map each remaining term onto a param the controller already accepts,
        // stash the tags themselves so the field can rebuild, navigate. That is
        // the shape, so it lives here; a page supplies only what is genuinely
        // its own (the path, and a `map` for terms that are not a plain
        // field=value).
        const nav = opts.navigate;
        if (nav) {
            const tagsParam = nav.tagsParam || 'tags';
            const textParam = nav.textParam === undefined ? 'q' : nav.textParam;
            const textField = opts.textField === undefined ? 'keyword' : opts.textField;
            const current = new URLSearchParams(global.location.search);

            opts.onChange = function (tagList, q) {
                const params = new URLSearchParams();
                const words = [];
                tagList.forEach(t => {
                    if (textParam && t.field === textField) { words.push(t.raw); return; }
                    // A page's map() returns true when it has handled the term;
                    // anything else falls through to plain field=value.
                    if (nav.map && nav.map(t, params) === true) return;
                    params.set(t.field, t.raw);
                });
                if (words.length) params.set(textParam, words.join(' '));
                if (q) params.set(tagsParam, q);
                (nav.keep || []).forEach(k => { if (current.get(k)) params.set(k, current.get(k)); });
                global.location = nav.path + '?' + params.toString();
            };

            // Tags in the URL win over whatever the page reconstructed from
            // legacy params — a ?tags= link is the authoritative form.
            if (current.get(tagsParam)) opts.value = current.get(tagsParam);
        }

        if (opts.value) api.set(opts.value, false);
        else render(false);
        return api;
    }
    global.installFilterTags = installFilterTags;

    // ── Dropdown placement ─────────────────────────────────────────────────
    // A .dropdown-menu is absolutely positioned inside its .dropdown, which
    // means any ancestor with an overflow context clips it — notably
    // .table-responsive, whose overflow-y MUST be hidden (overflow-x: auto
    // forces the other axis to compute as auto, which would put a second
    // scrollbar inside every tall table card). The visible symptom was a row
    // menu near the bottom of a card being cut in half.
    //
    // So on open the menu switches to position: fixed and is anchored to its
    // trigger by script: fixed escapes ancestor overflow entirely. It flips
    // above the trigger when there is not room below, clamps to the viewport
    // on both axes, and caps its own height so a long menu scrolls itself
    // instead of running off-screen.
    //
    // Driven by a MutationObserver on the `open` class rather than by wrapping
    // a toggle function, so every existing per-page toggleMenu() keeps working
    // untouched.
    var GAP = 4;        // menu-to-trigger offset, matches the CSS fallback
    var MARGIN = 8;     // smallest gap we will leave against a viewport edge

    function placeDropdownMenu(menu) {
        var dropdown = menu.closest('.dropdown');
        if (!dropdown) return;

        // Anchor to the trigger button, not the .dropdown wrapper. A wrapper
        // that stretches (a block-level .dropdown in a full-width header, say)
        // would otherwise right-align the menu to the far edge of the page,
        // leaving it floating away from the control that opened it.
        var trigger = dropdown.querySelector(':scope > button, :scope > .btn') || dropdown;

        // Measure unstyled by the previous placement, and untransformed —
        // offsetWidth/Height ignore the open/close translate.
        menu.style.maxHeight = '';
        var anchorRect = trigger.getBoundingClientRect();
        var width = menu.offsetWidth;
        var height = menu.offsetHeight;
        var below = window.innerHeight - anchorRect.bottom - GAP - MARGIN;
        var above = anchorRect.top - GAP - MARGIN;

        // Prefer below; flip only when below cannot hold the menu AND above
        // is the roomier side, so a menu that fits stays where it is expected.
        var up = height > below && above > below;
        // A data attribute, not a class: the observer below filters on
        // `class`, so writing a class here would re-enter this function on
        // every open — Chrome re-serialises the attribute even for a no-op
        // toggle, which turns that into an unbounded microtask loop.
        menu.dataset.dropdownPlacement = up ? 'up' : 'down';

        // 120px floor so a menu squeezed against an edge is still a usable,
        // scrollable sliver rather than a 2px line.
        var room = Math.max(up ? above : below, 120);
        if (height > room) menu.style.maxHeight = room + 'px';
        var used = Math.min(height, room);

        var top = up ? anchorRect.top - used - GAP : anchorRect.bottom + GAP;
        // Final guard: whatever the anchor did, the menu body sits inside the
        // viewport. Matters when the trigger itself is at the very edge, where
        // neither side has room and the 120px floor overflows the side we picked.
        top = Math.min(Math.max(top, MARGIN), Math.max(window.innerHeight - used - MARGIN, MARGIN));

        // Open toward the free space: a trigger on the left half of the screen
        // grows its menu rightward, one on the right grows leftward. Always
        // right-aligning would send a left-hand trigger's menu back under the
        // fixed sidebar, which the viewport clamp alone cannot catch — the
        // sidebar is not the viewport edge.
        var alignLeft = anchorRect.left + anchorRect.width / 2 < window.innerWidth / 2;
        var left = alignLeft ? anchorRect.left : anchorRect.right - width;
        left = Math.min(Math.max(left, MARGIN), Math.max(window.innerWidth - width - MARGIN, MARGIN));

        menu.dataset.dropdownAlign = alignLeft ? 'left' : 'right';
        menu.style.position = 'fixed';
        menu.style.top = top + 'px';
        menu.style.left = left + 'px';
        menu.style.right = 'auto';
        menu.style.bottom = 'auto';
    }

    function clearDropdownMenu(menu) {
        delete menu.dataset.dropdownPlacement;
        delete menu.dataset.dropdownAlign;
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.right = '';
        menu.style.bottom = '';
        menu.style.maxHeight = '';
    }

    global.placeDropdownMenu = placeDropdownMenu;

    new MutationObserver(function (records) {
        records.forEach(function (record) {
            var el = record.target;
            if (!el.classList || !el.classList.contains('dropdown-menu')) return;
            if (el.classList.contains('open')) placeDropdownMenu(el);
            else clearDropdownMenu(el);
        });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'], subtree: true });

    // A fixed menu does not travel with the page, so follow the trigger while
    // anything scrolls (capture: true — scrolls inside a table wrapper do not
    // bubble). Once the trigger has left the viewport the menu is pointing at
    // nothing; close it rather than leave it stranded.
    var reflowQueued = false;
    function reflowOpenDropdowns() {
        if (reflowQueued) return;
        reflowQueued = true;
        requestAnimationFrame(function () {
            reflowQueued = false;
            document.querySelectorAll('.dropdown-menu.open').forEach(function (menu) {
                var dropdown = menu.closest('.dropdown');
                if (!dropdown) return;
                var rect = (dropdown.querySelector(':scope > button, :scope > .btn') || dropdown).getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > window.innerHeight) menu.classList.remove('open');
                else placeDropdownMenu(menu);
            });
        });
    }
    window.addEventListener('scroll', reflowOpenDropdowns, true);
    window.addEventListener('resize', reflowOpenDropdowns);

    // Esc closes the top-most menu — a floating layer the keyboard cannot
    // dismiss is a trap.
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var open = document.querySelectorAll('.dropdown-menu.open');
        if (!open.length) return;
        e.stopPropagation();
        open.forEach(function (menu) { menu.classList.remove('open'); });
    });

    // ── Row-select tables ──────────────────────────────────────────────────
    // Clicking anywhere on a row toggles its selection checkbox — but only
    // when that checkbox opts in with data-row-select, because most
    // checkboxes across the apps are state toggles (complete a task,
    // settings flags) where a stray row click must NOT flip them. The
    // dispatched change event keeps existing per-page count/bulk-bar
    // handlers working untouched. Delegated at the document, so rows
    // re-rendered via innerHTML need no re-wiring.
    document.addEventListener('click', function (e) {
        if (!e.target.closest) return;
        if (e.target.closest('a, button, input, select, textarea, label, [contenteditable]')) return;
        // A stray click while a dropdown is open is a dismiss, not a select.
        if (document.querySelector('.dropdown-menu.open')) return;
        const row = e.target.closest('tr');
        if (!row) return;
        const box = row.querySelector('input[type="checkbox"][data-row-select]');
        if (!box || box.disabled) return;
        box.checked = !box.checked;
        box.dispatchEvent(new Event('change', { bubbles: true }));
    });

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
