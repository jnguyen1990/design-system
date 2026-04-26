// Sidebar — Things 3 / Linear hybrid. Categorical dots before items.
function Sidebar({ logo, title, sections, selectedId, onSelect, footer }) {
  return (
    <aside className="app-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 8px' }}>
        <img src={logo} alt="" width="22" height="22" style={{ borderRadius: 5 }} />
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
      </div>
      {sections.map((sec, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sec.label ? (
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-faint)', padding: '4px 12px', textTransform: 'lowercase' }}>
              {sec.label}
            </div>
          ) : null}
          {sec.items.map((it) => (
            <div
              key={it.id}
              className={'sb-item' + (it.id === selectedId ? ' is-selected' : '')}
              onClick={() => onSelect && onSelect(it.id)}
            >
              <div className={'sb-dot sb-dot-' + (it.color || 'slate')}></div>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
              {it.kbd ? <span className="kbd sb-kbd">{it.kbd}</span> : null}
              {it.count != null ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>{it.count}</span> : null}
            </div>
          ))}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      {footer}
    </aside>
  );
}
window.Sidebar = Sidebar;
