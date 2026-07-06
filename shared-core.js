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
     - installNavHotkeys(opts)          ⌘1..⌘9 sidebar nav; call once per page.
                                        opts.allowCtrl — also respond to Ctrl (default
                                        false: Mac-only Meta, so Ctrl+1..9 tab switching
                                        on Windows/Linux isn't hijacked).
                                        opts.allowComma — also handle "," (⌘, settings).

   Also runs on load:
     - applies the saved theme from localStorage immediately (before first paint)
     - syncs #theme-icon on DOMContentLoaded
     - wires the mobile menu toggle / overlay / nav-link close on DOMContentLoaded

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

    // Mobile menu toggle / overlay / close-on-navigate.
    document.addEventListener('DOMContentLoaded', function () {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        const navLinks = document.querySelectorAll('.nav-link');
        function openMenu() { sidebar.classList.add('open'); overlay.classList.add('show'); }
        function closeMenu() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
        if (menuBtn) { menuBtn.addEventListener('click', function (e) { e.stopPropagation(); sidebar.classList.contains('open') ? closeMenu() : openMenu(); }); }
        if (overlay) { overlay.addEventListener('click', closeMenu); }
        navLinks.forEach(link => { link.addEventListener('click', closeMenu); });
    });
})(window);
