// Apps launcher — top-right button + popover that switches between Joe's
// self-hosted apps. Auto-injects on DOMContentLoaded; layouts only need to
// load this script. Reads `data-app` on <html> to highlight the current app.
(function () {
  if (window.__appsLauncherLoaded) return;
  window.__appsLauncherLoaded = true;

  const APPS = [
    { id: "base",        name: "Base",     dot: "var(--slate-9)",  url: "https://base.joenguyen.ca" },
    { id: "budgeter",    name: "Budgeter", dot: "var(--green-9)",  url: "https://budgeter.joenguyen.ca" },
    { id: "fitness",     name: "Fitness",  dot: "var(--orange-9)", url: "https://fitness.joenguyen.ca" },
    { id: "mealplanner", name: "Meals",    dot: "var(--purple-9)", url: null }
  ];

  function init() {
    const currentApp = document.documentElement.getAttribute("data-app") || "";

    const btn = document.createElement("button");
    btn.className = "apps-launcher-btn";
    btn.setAttribute("title", "Switch app");
    btn.setAttribute("aria-label", "Switch app");
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="1"  y="1"  width="3.5" height="3.5" rx="0.8"/>' +
      '<rect x="6.25" y="1"  width="3.5" height="3.5" rx="0.8"/>' +
      '<rect x="11.5" y="1"  width="3.5" height="3.5" rx="0.8"/>' +
      '<rect x="1"  y="6.25" width="3.5" height="3.5" rx="0.8"/>' +
      '<rect x="6.25" y="6.25" width="3.5" height="3.5" rx="0.8"/>' +
      '<rect x="11.5" y="6.25" width="3.5" height="3.5" rx="0.8"/>' +
      '<rect x="1"  y="11.5" width="3.5" height="3.5" rx="0.8"/>' +
      '<rect x="6.25" y="11.5" width="3.5" height="3.5" rx="0.8"/>' +
      '<rect x="11.5" y="11.5" width="3.5" height="3.5" rx="0.8"/>' +
      "</svg>";
    Object.assign(btn.style, {
      position: "fixed",
      top: "var(--space-3)",
      right: "var(--space-3)",
      zIndex: "200",
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--panel)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      color: "var(--text-muted)",
      transition: "background 120ms, border-color 120ms, color 120ms",
      padding: "0"
    });
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "var(--panel-hover)";
      btn.style.borderColor = "var(--border-hover)";
      btn.style.color = "var(--text)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "var(--panel)";
      btn.style.borderColor = "var(--border)";
      btn.style.color = "var(--text-muted)";
    });

    const popover = document.createElement("div");
    popover.className = "apps-launcher-popover";
    Object.assign(popover.style, {
      position: "fixed",
      top: "calc(36px + var(--space-3) + 6px)",
      right: "var(--space-3)",
      zIndex: "200",
      minWidth: "220px",
      background: "var(--panel)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-2)",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
      display: "none"
    });
    popover.innerHTML = APPS.map(app => {
      const isCurrent = app.id === currentApp;
      const disabled = !app.url;
      const tag = disabled ? "div" : "a";
      const attrs = disabled ? "" : `href="${app.url}"`;
      return (
        `<${tag} ${attrs} class="apps-launcher-item" data-current="${isCurrent}" style="` +
        "display:flex;align-items:center;gap:10px;" +
        "padding:8px 10px;border-radius:var(--radius-sm);" +
        `text-decoration:none;color:${isCurrent ? "var(--text)" : "var(--text-muted)"};` +
        `font-size:13px;${isCurrent ? "background:var(--bg-subtle);" : ""}` +
        `${disabled ? "opacity:0.5;cursor:default;" : "cursor:pointer;"}` +
        '">' +
        `<span style="width:8px;height:8px;border-radius:50%;background:${app.dot};flex-shrink:0;"></span>` +
        `<span style="flex:1;">${app.name}</span>` +
        (isCurrent ? '<span style="font-size:10px;color:var(--text-faint);">current</span>' : "") +
        (disabled ? '<span style="font-size:10px;color:var(--text-faint);">soon</span>' : "") +
        `</${tag}>`
      );
    }).join("");

    popover.querySelectorAll("a.apps-launcher-item").forEach(a => {
      if (a.dataset.current === "true") return;
      a.addEventListener("mouseenter", () => { a.style.background = "var(--bg-subtle)"; });
      a.addEventListener("mouseleave", () => { a.style.background = ""; });
    });

    btn.addEventListener("click", e => {
      e.stopPropagation();
      popover.style.display = popover.style.display === "none" ? "block" : "none";
    });
    document.addEventListener("click", () => { popover.style.display = "none"; });
    popover.addEventListener("click", e => e.stopPropagation());
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") popover.style.display = "none";
    });

    document.body.appendChild(btn);
    document.body.appendChild(popover);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
