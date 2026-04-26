// Hub-specific components — inbox + recent items, cross-app launcher

function HubAppGrid({ apps, onLaunch }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
      {apps.map((a) => (
        <div
          key={a.id}
          className="card card-interactive"
          onClick={() => onLaunch && onLaunch(a.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}
        >
          <img src={a.logo} alt="" width="32" height="32" style={{ borderRadius: 6 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{a.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HubInbox({ items }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
        Inbox empty.
      </div>
    );
  }
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <div className={'sb-dot sb-dot-' + it.color} style={{ width: 8, height: 8, borderRadius: '50%' }}></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{it.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              <span className="text-num">{it.app}</span> · {it.detail}
            </div>
          </div>
          <span className="text-num text-faint" style={{ fontSize: 11 }}>{it.time}</span>
        </div>
      ))}
    </div>
  );
}

function HubQuickEntry({ onSubmit }) {
  const [v, setV] = React.useState('');
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        className="input"
        placeholder="new entry…"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && v.trim()) { onSubmit && onSubmit(v); setV(''); } }}
        style={{ flex: 1 }}
      />
      <span className="kbd">↵</span>
    </div>
  );
}

Object.assign(window, { HubAppGrid, HubInbox, HubQuickEntry });
