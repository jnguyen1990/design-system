/* Universal keyboard handlers for design-system modals.
   Loaded via CDN by every app: <script src="…/modal-keys.js"></script>

   - ESC: closes the topmost open `.modal.modal-open` (most recently opened
     wins if multiple are stacked).
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

    document.addEventListener('keydown', function (e) {
        const modal = topOpenModal();
        if (!modal) return;

        if (e.key === 'Escape') {
            modal.classList.remove('modal-open');
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
