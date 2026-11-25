// SessionRender (session-render.js): the vitals line and the no-FTP plan table.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const SRC = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'session-render.js'), 'utf8');
function load() {
    const w = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only' }).window;
    w.eval(SRC);
    return w.SessionRender;
}
const EMOJI = /[\u{1F300}-\u{1FAFF}❤]/u;

test('vitals line: compact and spelled out, full text in title, no emoji', () => {
    const html = load().vitalsChip({ vitals: { sleep_hours: 6.8, steps: 8214, resting_hr: 52, hrv_ms: 61.4 }, onClick: 'openDay()' });
    assert.ok(!EMOJI.test(html));
    assert.match(html, /title="Sleep 6\.8 h · 8,214 steps · resting HR 52 · HRV 61 ms"/);
    assert.match(html, /class="vitals-short"[^>]*>.*<b>6\.8<\/b>h.*<b>8\.2<\/b>k.*<b>52<\/b>bpm.*<b>61<\/b>ms/);
    assert.match(html, /class="vitals-full"[^>]*>.*Sleep <b>6\.8<\/b> h.*<b>8,214<\/b> steps.*RHR <b>52<\/b>.*HRV <b>61<\/b>/);
    assert.match(html, /onclick="openDay\(\)" role="button" tabindex="0"/);
    assert.ok(!/vital-low/.test(html));
});

test('vitals line: short sleep is amber; sleep falls back to the sleep session; empty says so', () => {
    const SR = load();
    assert.match(SR.vitalsChip({ vitals: { sleep_hours: 5.5 } }), /vital vital-low/);
    assert.match(SR.vitalsChip({ vitals: {}, sleepSession: { duration_minutes: 420 } }), /<b>7<\/b>h/);
    assert.match(SR.vitalsChip({ vitals: null }), /No vitals/);
});

test('running is blue, not the error red', () => {
    const SR = load();
    assert.equal(SR.typeDot('running'), 'var(--blue-9)');
    assert.equal(SR.typeDot('outdoor_running'), 'var(--blue-9)');
});

test('plan power: watts only with an FTP, never a guessed 175 W', () => {
    const SR = load();
    const session = { session_type: 'indoor_cycling', session_data: { segments: [{ type: 'SteadyState', name: 'Z2', duration_sec: 1800, power: 0.65 }] } };
    const none = SR.renderPlanDetails(session, {});
    assert.ok(!/W</.test(none) && !/114W/.test(none), 'no watts without FTP');
    assert.match(none, /<td>65%<\/td>/);
    assert.match(none, /Set an FTP to see watts/);
    const withFtp = SR.renderPlanDetails(session, { ftp: 200 });
    assert.match(withFtp, /<td>65%<\/td><td>130W<\/td>/);
});

test('planned lift: a missing weight reads "—", never "undefined lbs"; names are escaped', () => {
    const SR = load();
    const session = { session_type: 'lifting', session_data: { exercises: [
        { name: 'Pull-Up <b>', sets: 2, reps: '5-8', rpe: 6 },
        { name: 'Bench', sets: 3, reps: 8, weight_lbs: 155, rpe: 7 } ] } };
    const html = SR.renderPlanDetails(session, { detailCategory: () => 'lifting' });
    assert.ok(!/undefined/.test(html), 'no undefined');
    assert.match(html, /<td>—<\/td>/);
    assert.match(html, /155 lbs/);
    assert.match(html, /Pull-Up &lt;b&gt;/);
});
