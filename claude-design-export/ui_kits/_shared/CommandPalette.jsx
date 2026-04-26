// CommandPalette — ⌘K modal. Linear-style: list of commands with kbd hints.
function CommandPalette({ open, onClose, commands }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (!open) setQ('');
  }, [open]);
  if (!open) return null;
  const filtered = commands.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-sm"
        style={{ padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <input
            ref={inputRef}
            className="input"
            placeholder="Type a command…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ background: 'transparent', border: 0, padding: 0, height: 24, fontSize: 14 }}
          />
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: 6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px 12px', color: 'var(--text-faint)', fontSize: 13 }}>No matches.</div>
          ) : filtered.map((c, i) => (
            <div key={i} className="sb-item" style={{ height: 36 }}>
              <div className={'sb-dot sb-dot-' + (c.color || 'slate')}></div>
              <span style={{ flex: 1 }}>{c.label}</span>
              {c.kbd ? <span className="kbd">{c.kbd}</span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.CommandPalette = CommandPalette;
