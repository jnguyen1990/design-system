// Shared icon helper — uses Lucide via CDN
// Pass name like "search", "plus", etc. Rendered as inline SVG via lucide.createIcons() on mount.
function Icon({ name, size = 16, strokeWidth = 1.5, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = '';
      const el = document.createElement('i');
      el.setAttribute('data-lucide', name);
      el.setAttribute('width', size);
      el.setAttribute('height', size);
      el.setAttribute('stroke-width', strokeWidth);
      ref.current.appendChild(el);
      window.lucide.createIcons({ attrs: { width: size, height: size, 'stroke-width': strokeWidth } });
    }
  }, [name, size, strokeWidth]);
  return <span ref={ref} style={{ display: 'inline-flex', lineHeight: 0, ...style }} />;
}

window.Icon = Icon;
