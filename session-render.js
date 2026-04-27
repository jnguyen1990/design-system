/* Universal session-card / vitals-chip renderer.
   Paired with the "Sessions, vitals & day-cards" section in design-system.css.
   Loaded via CDN: https://cdn.jsdelivr.net/gh/jnguyen1990/design-system@<rev>/session-render.js

   Exposes a global `SessionRender` object with:
     - sessionCard({ id, type, title, meta, onClick, opacity, titleLen, done })
     - vitalsChip({ vitals, sleepSession, onClick })
     - openVitalsModal({ dateStr, vitals, sleepSession })
     - typeDot(slug), typeLabel(slug), escapeHtml(s), truncate(s, n), TYPE_DOTS

   Assumptions about the host page:
     - Modal markup with #detail-modal / #dm-title / #dm-body / #dm-footer is present
       (typically provided by the app's layout). openVitalsModal toggles `.modal-open`.
     - A global `Shared.closeModal()` exists for the close button. Falls back to
       toggling the class directly if not present.
*/
(function (global) {
    if (global.SessionRender) return; // idempotent — multiple loads do nothing

    const SessionRender = {
        TYPE_DOTS: {
            cycling: 'var(--orange-9)', indoor_cycling: 'var(--orange-9)', outdoor_cycling: 'var(--orange-9)',
            running: 'var(--red-9)', indoor_running: 'var(--red-9)', outdoor_running: 'var(--red-9)',
            strength: 'var(--purple-9)', lifting: 'var(--purple-9)',
            mobility: 'var(--teal-9)', yoga: 'var(--teal-9)',
            outdoor_walking: 'var(--green-9)', indoor_walking: 'var(--green-9)', hiking: 'var(--green-9)',
            swimming: 'var(--blue-9)',
            rowing: 'var(--indigo-9)', skiing: 'var(--indigo-9)',
            sleep: 'var(--slate-8)', rest: 'var(--slate-8)',
            elliptical: 'var(--slate-9)', other: 'var(--slate-9)', workout: 'var(--slate-9)', general: 'var(--slate-9)'
        },
        typeDot(slug) { return this.TYPE_DOTS[slug] || 'var(--slate-9)'; },
        typeLabel(slug) { return (slug || 'general').replace(/_/g, ' '); },
        escapeHtml(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        },
        truncate(s, n) {
            if (!s) return '';
            return s.length > n ? s.substring(0, n) + '…' : s;
        },

        sessionCard({ id, type, title, meta, onClick, opacity, titleLen = 30, done = false }) {
            const dot = this.typeDot(type);
            const label = this.typeLabel(type);
            const styleExtra = opacity != null ? `opacity:${opacity};` : '';
            const doneMark = done ? `<span class="session-done-mark" title="Completed">✓</span>` : '';
            return `<div class="session-card session-type-${type}${done ? ' session-done' : ''}" style="display:flex;flex-direction:column;gap:2px;margin-bottom:4px;cursor:pointer;${styleExtra}" onclick="${onClick}">`
                + `<span style="font-weight:500;font-size:var(--text-sm);display:flex;align-items:baseline;gap:4px;">${doneMark}<span style="min-width:0;overflow-wrap:anywhere;">${this.escapeHtml(this.truncate(title, titleLen))}</span></span>`
                + (meta ? `<span style="font-family:var(--font-mono);color:var(--text-muted);font-size:11px;">${this.escapeHtml(meta)}</span>` : '')
                + `<span class="badge session-type-${type}" style="align-self:flex-start;margin-top:2px;font-size:10px;"><span class="color-dot" style="background:${dot};"></span> ${this.escapeHtml(label)}</span>`
                + `</div>`;
        },

        vitalsChip({ vitals, sleepSession, onClick }) {
            const items = [];
            const sleepHrs = (vitals && vitals.sleep_hours != null)
                ? vitals.sleep_hours
                : (sleepSession && sleepSession.duration_minutes ? +(sleepSession.duration_minutes / 60).toFixed(1) : null);
            if (sleepHrs) items.push(`<span class="vital" title="Sleep">\u{1F634} ${sleepHrs}h</span>`);
            if (vitals && vitals.resting_hr) items.push(`<span class="vital" title="Resting HR">❤️ ${vitals.resting_hr}</span>`);
            if (vitals && vitals.hrv_ms) items.push(`<span class="vital" title="HRV">▲ ${Math.round(vitals.hrv_ms)}</span>`);
            if (vitals && vitals.steps) items.push(`<span class="vital" title="Steps">\u{1F6B6} ${(vitals.steps / 1000).toFixed(1)}k</span>`);
            if (items.length === 0) items.push('<span class="vital-empty">no vitals</span>');
            return `<div class="vitals-chip" onclick="${onClick}">${items.join('')}</div>`;
        },

        openVitalsModal({ dateStr, vitals, sleepSession }) {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
            const titleEl = document.getElementById('dm-title');
            const bodyEl = document.getElementById('dm-body');
            const footerEl = document.getElementById('dm-footer');
            const modalEl = document.getElementById('detail-modal');
            if (!titleEl || !bodyEl || !footerEl || !modalEl) {
                console.warn('SessionRender.openVitalsModal: missing modal markup (#detail-modal/#dm-*)');
                return;
            }

            titleEl.textContent = `Daily summary · ${dateLabel}`;

            const cards = [];
            if (vitals && vitals.sleep_hours) {
                cards.push({ label: 'Sleep', value: `${vitals.sleep_hours}h${vitals.sleep_quality ? ` · ${vitals.sleep_quality}/5` : ''}` });
            }
            if (vitals && vitals.resting_hr) cards.push({ label: 'Resting HR', value: `${vitals.resting_hr} bpm` });
            if (vitals && vitals.hrv_ms) cards.push({ label: 'HRV', value: `${Math.round(vitals.hrv_ms)} ms` });
            if (vitals && vitals.steps) cards.push({ label: 'Steps', value: vitals.steps.toLocaleString() });
            if (vitals && vitals.weight_kg) cards.push({ label: 'Weight', value: `${vitals.weight_kg} kg` });
            if (vitals && vitals.body_fat_pct) cards.push({ label: 'Body fat', value: `${vitals.body_fat_pct}%` });

            let body = '';
            if (cards.length) {
                body += '<div class="vitals-modal-grid" style="margin-bottom: var(--space-4);">';
                body += cards.map(c => `<div class="stat-card"><div class="stat-label">${c.label}</div><div class="stat-value">${this.escapeHtml(c.value)}</div></div>`).join('');
                body += '</div>';
            } else {
                body += '<p class="text-muted" style="font-size: var(--text-sm); margin-bottom: var(--space-3);">No body metrics recorded for this day.</p>';
            }
            if (vitals && vitals.notes) {
                body += `<p style="font-size: var(--text-sm); margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--border);"><strong>Notes:</strong> ${this.escapeHtml(vitals.notes)}</p>`;
            }
            if (sleepSession) {
                body += `<h4 style="margin: var(--space-4) 0 var(--space-2); font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);">Sleep session</h4>`;
                body += `<div style="font-size: var(--text-sm);"><strong>${this.escapeHtml(sleepSession.title || 'Sleep')}</strong></div>`;
                if (sleepSession.duration_minutes) {
                    body += `<div class="text-muted" style="font-size: var(--text-xs); font-family: var(--font-mono);">${sleepSession.duration_minutes}m planned</div>`;
                }
                if (sleepSession.description) {
                    body += `<p style="font-size: var(--text-sm); margin-top: var(--space-2);">${this.escapeHtml(sleepSession.description)}</p>`;
                }
            }
            bodyEl.innerHTML = body;

            const closeCall = (global.Shared && typeof global.Shared.closeModal === 'function')
                ? `Shared.closeModal()`
                : `document.getElementById('detail-modal').classList.remove('modal-open')`;
            let footer = `<button class="btn btn-secondary" onclick="${closeCall}">Close</button>`;
            if (sleepSession && sleepSession.id) {
                footer = `<a class="btn btn-primary" href="/calendar?session=${sleepSession.id}&date=${dateStr}">Open sleep session</a> ` + footer;
            }
            footerEl.innerHTML = footer;
            modalEl.classList.add('modal-open');
        }
    };

    global.SessionRender = SessionRender;
})(typeof window !== 'undefined' ? window : this);
