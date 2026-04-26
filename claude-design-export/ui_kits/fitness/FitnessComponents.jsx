// Fitness components — workout log, lift sets, session timer

function SessionCard({ name, lastPerformed, lifts, onStart }) {
  return (
    <div className="card card-interactive" onClick={onStart}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{lastPerformed}</div>
        </div>
        <span className="badge badge-orange"><span className="badge-dot"></span>{lifts.length} lifts</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lifts.map((l, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>{l.name}</span>
            <span className="text-num text-faint">{l.scheme}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiftRow({ name, sets, target }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
        <span className="text-num text-faint" style={{ fontSize: 11 }}>{target}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sets.map((s, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 8px', height: 24,
            background: s.done ? 'var(--green-3)' : 'var(--panel)',
            border: '1px solid ' + (s.done ? 'var(--green-6)' : 'var(--border)'),
            color: s.done ? 'var(--green-11)' : 'var(--text)',
            borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11
          }}>
            <span>{s.weight}×{s.reps}</span>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" style={{ height: 24, padding: '0 8px', fontSize: 11 }}>+ set</button>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }) {
  return (
    <div className="card card-sm">
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>
        {value}<span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>{suffix}</span>
      </div>
    </div>
  );
}

Object.assign(window, { SessionCard, LiftRow, Stat });
