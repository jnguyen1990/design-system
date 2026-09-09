/* Universal session-card / vitals-chip renderer.
   Paired with the "Sessions, vitals & day-cards" section in design-system.css.
   Loaded via CDN: https://cdn.jsdelivr.net/gh/jnguyen1990/design-system@<rev>/session-render.js

   Exposes a global `SessionRender` object with:
     - sessionCard({ id, type, title, meta, onClick, opacity, titleLen, done })
     - vitalsChip({ vitals, sleepSession, onClick })
     - openVitalsModal({ dateStr, vitals, sleepSession })
     - typeChip(slug, extraStyle) — tinted session-type chip (no dot)
     - renderPlanDetails(session, opts) — THE "Planned segments/exercises"
       tables for a planned session's session_data. Shared by fitness's
       detail modal and base's Today workout modal so the same session
       renders identically in both apps. opts lets the host override
       { ftp, detailCategory(slug), isIndoor(slug), formatPace(secPerKm),
       extractHrTarget(seg) }; defaults below work standalone.
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
        // Tinted session-type chip (v4: the tint IS the category color — no dot).
        typeChip(slug, extraStyle) {
            const t = slug || 'general';
            return `<span class="session-type-badge session-type-${t}"${extraStyle ? ` style="${extraStyle}"` : ''}>${this.escapeHtml(this.typeLabel(t))}</span>`;
        },
        // Standalone fallbacks for renderPlanDetails; hosts with richer type
        // metadata (fitness's server-driven WT) pass their own via opts.
        defaultDetailCategory(slug) {
            const s = slug || '';
            if (s.includes('cycling')) return 'cycling';
            if (s.includes('running')) return 'running';
            if (s === 'lifting' || s === 'strength') return 'lifting';
            if (s === 'mobility' || s === 'yoga') return 'mobility';
            return null;
        },
        defaultIsIndoor(slug) { return /^indoor_/.test(slug || ''); },
        formatPace(secPerKm) {
            if (!secPerKm) return '-';
            const m = Math.floor(secPerKm / 60), s = secPerKm % 60;
            return `${m}:${String(s).padStart(2, '0')}/km`;
        },
        extractHrTarget(seg) {
            if (!seg) return '—';
            if (seg.hr_floor && seg.hr_ceiling) return `${seg.hr_floor}–${seg.hr_ceiling}`;
            if (seg.hr_low && seg.hr_high) return `${seg.hr_low}–${seg.hr_high}`;
            if (seg.hr_ceiling) return `<${seg.hr_ceiling}`;
            const notes = seg.notes || '';
            const range = notes.match(/HR\s+floor\s+(\d+),?\s*ceiling\s+(\d+)/i);
            if (range) return `${range[1]}–${range[2]}`;
            if (seg.max_hr) return `<${seg.max_hr}`;
            const ceiling = notes.match(/HR\s+ceiling\s+(\d+)/i);
            if (ceiling) return `<${ceiling[1]}`;
            const less = notes.match(/HR\s*<\s*(\d+)/i);
            if (less) return `<${less[1]}`;
            if (/pace[- ]primary/i.test(notes)) return 'pace-led';
            const rpe = notes.match(/RPE\s*(\d+)/i);
            if (rpe) return `RPE ${rpe[1]}`;
            if (/by feel/i.test(notes)) return 'feel';
            return '—';
        },

        // "Planned segments / exercises" tables from a planned session's
        // session_data. Same markup for every consumer: h4.subsection-title
        // + table.table-compact.
        renderPlanDetails(session, opts = {}) {
            const wd = session.session_data || {};
            const slug = session.session_type;
            const dc = (opts.detailCategory || (s => this.defaultDetailCategory(s)))(slug);
            const ftp = opts.ftp || 175;
            const pace = opts.formatPace || (s => this.formatPace(s));
            const hrTarget = opts.extractHrTarget || (s => this.extractHrTarget(s));
            const indoor = (opts.isIndoor || (s => this.defaultIsIndoor(s)))(slug);
            const h4 = t => `<h4 class="subsection-title" style="margin:12px 0 8px">${t}</h4>`;
            let html = '';
            if (dc === 'cycling' && wd.segments) {
                const outdoor = !indoor;  // no power meter outdoors → HR
                const head = outdoor ? '<th>HR target</th>' : '<th>Power</th><th>Watts</th>';
                html += h4(`Planned segments${outdoor ? ' · outdoor (HR)' : ''}`) + `<table class="table table-compact"><thead><tr><th>Segment</th><th>Duration</th>${head}</tr></thead><tbody>`;
                wd.segments.forEach(seg => {
                    const dur = seg.duration_sec || seg.on_duration_sec || 0;
                    const durStr = dur >= 60 ? Math.round(dur / 60) + ' min' : dur + 's';
                    const durCell = seg.type === 'IntervalsT' ? seg.repeat + 'x ' + seg.on_duration_sec + 's/' + seg.off_duration_sec + 's' : durStr;
                    let cells;
                    if (outdoor) {
                        let hr = '—';
                        if (seg.type === 'IntervalsT') hr = `${seg.on_hr ? '<' + seg.on_hr : '—'} / ${seg.off_hr ? '<' + seg.off_hr : '—'}`;
                        else if (seg.hr_low && seg.hr_high) hr = `${seg.hr_low}–${seg.hr_high}`;
                        cells = `<td>${hr}</td>`;
                    } else {
                        let p = '', w = '';
                        if (seg.type === 'Warmup' || seg.type === 'Cooldown') { p = (seg.power_low * 100).toFixed(0) + '%→' + (seg.power_high * 100).toFixed(0) + '%'; w = Math.round(seg.power_low * ftp) + '→' + Math.round(seg.power_high * ftp) + 'W'; }
                        else if (seg.type === 'SteadyState') { p = (seg.power * 100).toFixed(0) + '%'; w = Math.round(seg.power * ftp) + 'W'; }
                        else if (seg.type === 'IntervalsT') { p = (seg.on_power * 100).toFixed(0) + '%/' + (seg.off_power * 100).toFixed(0) + '%'; w = Math.round(seg.on_power * ftp) + '/' + Math.round(seg.off_power * ftp) + 'W'; }
                        cells = `<td>${p}</td><td>${w}</td>`;
                    }
                    html += `<tr><td>${seg.name || seg.type}</td><td>${durCell}</td>${cells}</tr>`;
                });
                html += '</tbody></table>';
            }
            if (dc === 'lifting' && wd.exercises) {
                html += h4('Planned exercises') + '<table class="table table-compact"><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th><th>RPE</th><th>Notes</th></tr></thead><tbody>';
                wd.exercises.forEach(ex => { html += `<tr><td><strong>${ex.name}</strong></td><td>${ex.sets}</td><td>${ex.reps}</td><td>${ex.weight_lbs} lbs</td><td>${ex.rpe || '-'}</td><td class="stat-label">${ex.notes || ''}</td></tr>`; });
                html += '</tbody></table>';
            }
            if (slug === 'mobility' && wd.exercises) {
                html += h4('Planned exercises') + '<table class="table table-compact"><thead><tr><th>Exercise</th><th>Sets</th><th>Reps / Hold</th><th>Notes</th></tr></thead><tbody>';
                wd.exercises.forEach(ex => { html += `<tr><td><strong>${ex.name}</strong></td><td>${ex.sets}</td><td>${ex.reps > 0 ? ex.reps : 'Hold'}</td><td class="stat-label">${ex.notes || ''}</td></tr>`; });
                html += '</tbody></table>';
            }
            if (dc === 'running' && wd.segments) {
                const head = indoor ? '<th>Speed</th><th>Incline</th><th>HR target</th>' : '<th>Pace</th><th>HR target</th>';
                html += h4(`Planned segments${indoor ? ' · treadmill' : ''}`) + `<table class="table table-compact"><thead><tr><th>Segment</th><th>Duration</th>${head}</tr></thead><tbody>`;
                wd.segments.forEach(seg => {
                    const hr = hrTarget(seg);
                    const paceStr = seg.speed_kmh ? pace(Math.round(3600 / seg.speed_kmh)) : '—';
                    const cells = indoor
                        ? `<td>${seg.speed_kmh ? seg.speed_kmh.toFixed(1) + ' km/h' : '—'}</td><td>${seg.incline_pct || 0}%</td><td>${hr}</td>`
                        : `<td>${paceStr}</td><td>${hr}</td>`;
                    html += `<tr><td>${seg.name}</td><td>${seg.duration_min} min</td>${cells}</tr>`;
                });
                html += '</tbody></table>';
            }
            const notes = (wd.segments || []).filter(seg => seg.notes);
            if (html && notes.length) {
                html += '<div style="margin-top:6px">' + notes.map(seg =>
                    `<p class="stat-label" style="margin:2px 0;font-style:italic;">${this.escapeHtml(seg.name || seg.type)}: ${this.escapeHtml(seg.notes)}</p>`).join('') + '</div>';
            }
            return html;
        },
        escapeHtml(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        },
        truncate(s, n) {
            if (!s) return '';
            return s.length > n ? s.substring(0, n) + '…' : s;
        },

        sessionCard({ id, type, title, meta, onClick, opacity, titleLen = 30, done = false }) {
            const label = this.typeLabel(type);
            const styleExtra = opacity != null ? `opacity:${opacity};` : '';
            const doneMark = done ? `<span class="session-done-mark" title="Completed">✓</span>` : '';
            return `<div class="session-card session-type-${type}${done ? ' session-done' : ''}" style="display:flex;flex-direction:column;gap:2px;margin-bottom:4px;cursor:pointer;${styleExtra}" onclick="${onClick}">`
                + `<span style="font-weight:500;font-size:var(--text-sm);display:flex;align-items:baseline;gap:4px;">${doneMark}<span style="min-width:0;overflow-wrap:anywhere;">${this.escapeHtml(this.truncate(title, titleLen))}</span></span>`
                + (meta ? `<span style="font-family:var(--font-mono);color:var(--text-muted);font-size:11px;">${this.escapeHtml(meta)}</span>` : '')
                + `<span class="session-type-badge session-type-${type}" style="align-self:flex-start;margin-top:2px;font-size:10px;">${this.escapeHtml(label)}</span>`
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

        openVitalsModal({ dateStr, vitals, sleepSession, sources }) {
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
            if (Array.isArray(sources) && sources.length > 1) {
                const fields = ['sleep_hours', 'sleep_quality', 'resting_hr', 'hrv_ms', 'steps', 'weight_kg', 'body_fat_pct'];
                const labels = {
                    sleep_hours: 'sleep', sleep_quality: 'quality', resting_hr: 'RHR',
                    hrv_ms: 'HRV', steps: 'steps', weight_kg: 'weight', body_fat_pct: 'body fat'
                };
                body += `<h4 style="margin: var(--space-4) 0 var(--space-2); font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);">Sources</h4>`;
                body += '<div style="font-size: var(--text-xs); font-family: var(--font-mono);">';
                sources.forEach(row => {
                    const time = row.recorded_at ? new Date(row.recorded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                    const parts = fields
                        .filter(f => row[f] != null && row[f] !== '')
                        .map(f => `${labels[f]}=${typeof row[f] === 'number' ? +(+row[f]).toFixed(1) : row[f]}`);
                    if (!parts.length && !row.notes) return;
                    body += `<div style="margin-bottom: var(--space-1);">`;
                    body += `<strong>${this.escapeHtml(row.source || 'unknown')}</strong>`;
                    if (time) body += ` <span class="text-muted">· ${time}</span>`;
                    if (parts.length) body += ` — ${parts.join(', ')}`;
                    if (row.notes) body += ` <span class="text-muted">· ${this.escapeHtml(row.notes)}</span>`;
                    body += `</div>`;
                });
                body += '</div>';
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
