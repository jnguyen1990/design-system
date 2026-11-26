/* Universal open/close + keyboard handlers for design-system modals.
   Loaded via CDN by every app: <script src="…/modal-keys.js"></script>

   A modal is open while it carries `modal-open`. Pages that toggle that
   class by hand keep working — everything here reads the class, nothing
   tracks state of its own.

   - openModal(id) / closeModal(id): add / remove `modal-open` on the modal
     (an id or the element). Defined only if the page has not already
     defined them. Fire a bubbling `modal:open` / `modal:close` event on the
     modal, for pages that need to reset a form or stop a chart on close.
   - [data-modal-close]: clicking one closes the modal it sits in — or the
     modal whose id it names, data-modal-close="other-modal".
   - Backdrop click closes a modal that opts in with data-backdrop-close.
     Opt-in because most modals are data-entry forms whose pages run their
     own cleanup on close; a press that starts inside the box and ends on
     the backdrop (dragging a text selection) does not count.

   - ESC: closes the topmost open `.modal.modal-open` (most recently opened
     wins if multiple are stacked) through the same path as closeModal(), so
     it fires `modal:close` too.
   - Enter: clicks the topmost open modal's primary action (.btn-primary).
     Skipped inside <textarea>, <select>, contenteditable, or when Shift /
     Cmd / Ctrl / Alt are held — so newlines, multi-select, and OS shortcuts
     still work.

   Dialog semantics and focus (2026-11-23). A MutationObserver watches the
   `modal-open` class, so this covers openModal(), hand-toggled modals and
   dsConfirm/dsPrompt alike:
   - on open: role="dialog" + aria-modal="true" (an existing role is kept),
     aria-labelledby → the modal's .modal-title / first heading, the element
     that had focus is remembered, and focus moves into the box — the first
     text field, else the first control that is not the × button, else the
     box — unless the opener already put focus inside.
   - while open: Tab and Shift+Tab cycle within the topmost modal.
   - on close: focus returns to the remembered element if it is still in the
     page and focus was inside the modal (or nowhere).

   Idempotent — safe to load more than once. */
(function (global) {
    if (global.__modalKeysInstalled) return;
    global.__modalKeysInstalled = true;

    function topOpenModal() {
        const open = document.querySelectorAll('.modal.modal-open');
        return open.length ? open[open.length - 1] : null;
    }

    function resolveModal(ref) {
        return typeof ref === 'string' ? document.getElementById(ref) : ref;
    }

    function setOpen(ref, open) {
        const modal = resolveModal(ref);
        if (!modal || !modal.classList) return;
        if (modal.classList.contains('modal-open') === open) return;
        modal.classList.toggle('modal-open', open);
        modal.dispatchEvent(new CustomEvent(open ? 'modal:open' : 'modal:close', { bubbles: true }));
    }

    // budgeter and upkeep define identical one-liners in page scripts; a
    // later `function openModal` declaration still replaces these.
    if (typeof global.openModal !== 'function') {
        global.openModal = function openModal(id) { setOpen(id, true); };
    }
    if (typeof global.closeModal !== 'function') {
        global.closeModal = function closeModal(id) { setOpen(id, false); };
    }

    // ── Dialog semantics + focus management ────────────────────────────────
    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
    const returnTo = new WeakMap();
    let headingSeq = 0;

    function visible(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) &&
            getComputedStyle(el).visibility !== 'hidden';
    }
    function focusables(modal) {
        return Array.prototype.filter.call(modal.querySelectorAll(FOCUSABLE), visible);
    }

    function onOpened(modal) {
        if (!modal.hasAttribute('role')) modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        if (!modal.hasAttribute('aria-labelledby') && !modal.hasAttribute('aria-label')) {
            const h = modal.querySelector('.modal-title, h1, h2, h3, h4');
            if (h) {
                if (!h.id) h.id = 'ds-modal-title-' + (++headingSeq);
                modal.setAttribute('aria-labelledby', h.id);
            }
        }
        if (global.dsEnhanceLabels) global.dsEnhanceLabels(modal);
        const active = document.activeElement;
        if (active && !modal.contains(active)) returnTo.set(modal, active);
        if (modal.contains(document.activeElement)) return;  // the opener placed focus
        const items = focusables(modal);
        const field = items.find(el => el.matches('input:not([type="checkbox"]):not([type="radio"]), select, textarea, [contenteditable="true"]'));
        const target = field || items.find(el => !el.matches('.modal-close')) || modal.querySelector('.modal-box') || modal;
        if (target === modal || target.matches('.modal-box')) target.setAttribute('tabindex', '-1');
        try { target.focus({ preventScroll: true }); } catch (_) { target.focus(); }
    }

    function onClosed(modal) {
        const back = returnTo.get(modal);
        returnTo.delete(modal);
        const a = document.activeElement;
        const focusLost = !a || a === document.body || modal.contains(a);
        if (back && focusLost && document.contains(back) && back.focus) {
            try { back.focus({ preventScroll: true }); } catch (_) { back.focus(); }
        }
    }

    function watch(target) {
        new MutationObserver(function (records) {
            records.forEach(function (r) {
                const el = r.target;
                if (!el.classList || !el.classList.contains('modal')) return;
                const was = (r.oldValue || '').split(/\s+/).indexOf('modal-open') !== -1;
                const is = el.classList.contains('modal-open');
                if (is && !was) onOpened(el);
                else if (!is && was) onClosed(el);
            });
        }).observe(target, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true });
    }
    watch(document.documentElement);

    // Where the press began, so a drag out of the box is not a backdrop click.
    let pressTarget = null;
    document.addEventListener('mousedown', function (e) { pressTarget = e.target; }, true);

    document.addEventListener('click', function (e) {
        if (!e.target || !e.target.closest) return;
        const closer = e.target.closest('[data-modal-close]');
        if (closer) {
            const named = closer.getAttribute('data-modal-close');
            setOpen(named ? named : closer.closest('.modal'), false);
            return;
        }
        if (e.target.matches('.modal.modal-open[data-backdrop-close]') &&
            (pressTarget === null || pressTarget === e.target)) {
            setOpen(e.target, false);
        }
    });

    document.addEventListener('keydown', function (e) {
        const modal = topOpenModal();
        if (!modal) return;

        if (e.key === 'Escape') {
            // Same path as closeModal(), so `modal:close` fires and a page's
            // close-cleanup listener runs however the modal was dismissed.
            setOpen(modal, false);
            // Defensive: some opener code sets body.overflow:hidden as a scroll
            // lock and forgets to reset on close. If no modals remain open,
            // restore body scroll so the page isn't stuck.
            if (!document.querySelectorAll('.modal.modal-open').length && document.body.style.overflow === 'hidden') {
                document.body.style.overflow = '';
            }
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (e.key === 'Tab' && !e.metaKey && !e.ctrlKey && !e.altKey) {
            const items = focusables(modal);
            if (!items.length) { e.preventDefault(); return; }
            const first = items[0];
            const last = items[items.length - 1];
            const a = document.activeElement;
            if (!modal.contains(a)) { e.preventDefault(); first.focus(); }
            else if (e.shiftKey && (a === first || a === modal || a.matches('.modal-box'))) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
            const t = e.target;
            if (!t) return;
            const tag = t.tagName;
            if (tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return;
            // Submit buttons handle Enter natively inside <button type="submit">
            if (tag === 'BUTTON' && t.type === 'submit') return;

            const primary = modal.querySelector('.btn-primary:not([disabled])');
            if (primary) {
                e.preventDefault();
                primary.click();
            }
        }
    }, true); // capture so we beat any listener that might stopPropagation
})(typeof window !== 'undefined' ? window : this);
