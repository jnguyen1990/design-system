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
