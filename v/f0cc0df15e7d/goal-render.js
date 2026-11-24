/* Shared goal-detail helpers.
   Paired with the "Goal pages" section in design-system.css.
   Loaded via CDN: https://design-system.joenguyen.ca/goal-render.js

   base's and fitness's goal_detail pages render the same screen (target
   band, plan rows that expand in place, clamped notes) and each carried a
   private copy of these functions. Only what is identical in both lives
   here — band/plan/week rendering reads app-specific data (base mirrors
   fitness stats, fitness reads its own blocks) and stays in the page.

   Exposes a global `GoalRender` object with:
     - shortMonthDay(dateStr)  "2026-07-06" → "Jul 6"; '' for a blank date.
                               Parsed as LOCAL midnight, never UTC.
     - parseGoalValue(v)       a goal's target/current string as a number for
                               progress math: plain numbers with units
                               ("200W", "82.5kg", "1,200") and H:MM:SS /
                               MM:SS times (race goals, in seconds); NaN
                               when it is neither.
     - formatMinutes(min)      95 → "1h 35m", 120 → "2h", 40 → "40m".
     - togglePlan(id)          opens/closes #plan-item-<id> (.plan-item.open
                               reveals its .plan-expand).
     - toggleNotes(opts)       un/clamps the notes paragraph and relabels its
                               toggle "Show more" / "Show less". opts:
                               { notesId = 'goal-notes', toggleId = 'notes-toggle' }.

   Assumptions about the host page:
     - Plan rows are `.plan-item#plan-item-<id>` wrapping a `.plan-row` and a
       `.plan-expand`.
     - Notes are `<p class="notes-text clamped" id="goal-notes">` followed by
       `<button class="notes-toggle" id="notes-toggle">`.
*/
(function (global) {
    if (global.GoalRender) return; // idempotent — multiple loads do nothing

    const GoalRender = {
        shortMonthDay(dateStr) {
            if (!dateStr) return '';
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        },

        // Parse a goal value to a number for progress math: plain numbers with
        // units ("200W", "82.5kg"), H:MM:SS / MM:SS times (race goals), else NaN.
        parseGoalValue(v) {
            if (v == null) return NaN;
            const s = String(v).trim();
            const t = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
            if (t) {
                const a = +t[1], b = +t[2];
                return t[3] != null ? a * 3600 + b * 60 + (+t[3]) : a * 60 + b;
            }
            const f = parseFloat(s.replace(/,/g, ''));
            return isFinite(f) ? f : NaN;
        },

        formatMinutes(min) {
            min = Math.round(min || 0);
            const h = Math.floor(min / 60), m = min % 60;
            if (h && m) return `${h}h ${m}m`;
            if (h) return `${h}h`;
            return `${m}m`;
        },

        togglePlan(id) {
            const item = document.getElementById(`plan-item-${id}`);
            if (item) item.classList.toggle('open');
        },

        toggleNotes(opts = {}) {
            const p = document.getElementById(opts.notesId || 'goal-notes');
            const t = document.getElementById(opts.toggleId || 'notes-toggle');
            if (!p) return;
            const clamped = p.classList.toggle('clamped');
            if (t) t.textContent = clamped ? 'Show more' : 'Show less';
        }
    };

    global.GoalRender = GoalRender;
})(typeof window !== 'undefined' ? window : this);
