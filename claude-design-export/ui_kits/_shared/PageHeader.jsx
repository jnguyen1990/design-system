// PageHeader — title + actions
function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="app-header">
      <div>
        <h1 style={{ fontSize: 24 }}>{title}</h1>
        {subtitle ? <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div> : null}
      </div>
      <div className="toolbar">{actions}</div>
    </header>
  );
}
window.PageHeader = PageHeader;
