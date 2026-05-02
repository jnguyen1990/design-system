// Apps launcher — top-right row of app icons that switches between Joe's
// self-hosted apps. Auto-injects on DOMContentLoaded; layouts only need to
// load this script. Reads `data-app` on <html> to highlight the current app.
(function () {
  if (window.__appsLauncherLoaded) return;
  window.__appsLauncherLoaded = true;

  const LOGO_BASE =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" fill="none">' +
      '<defs><linearGradient id="al-bg-base" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#26292B"/><stop offset="1" stop-color="#0E1011"/>' +
      '</linearGradient></defs>' +
      '<rect x="1" y="1" width="30" height="30" rx="7" fill="url(#al-bg-base)"/>' +
      '<rect x="1.5" y="1.5" width="29" height="29" rx="6.5" stroke="rgba(255,255,255,0.10)" stroke-width="0.75"/>' +
      '<g stroke="#F2F4F5" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.75">' +
        '<path d="M16 16 L8 8"/><path d="M16 16 L24 8"/><path d="M16 16 L8 24"/><path d="M16 16 L24 24"/>' +
      '</g>' +
      '<circle cx="8" cy="8" r="2" fill="#F2F4F5"/>' +
      '<circle cx="24" cy="8" r="2" fill="#F2F4F5"/>' +
      '<circle cx="8" cy="24" r="2" fill="#F2F4F5"/>' +
      '<circle cx="24" cy="24" r="2" fill="#F2F4F5"/>' +
      '<circle cx="16" cy="16" r="3.5" fill="#F2F4F5"/>' +
      '<circle cx="16" cy="16" r="1.4" fill="#0E1011"/>' +
    '</svg>';

  const LOGO_BUDGETER =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" fill="none">' +
      '<defs><linearGradient id="al-bg-bud" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#30A46C"/><stop offset="1" stop-color="#1B7A4D"/>' +
      '</linearGradient></defs>' +
      '<rect x="1" y="1" width="30" height="30" rx="7" fill="url(#al-bg-bud)"/>' +
      '<rect x="1.5" y="1.5" width="29" height="29" rx="6.5" stroke="rgba(255,255,255,0.18)" stroke-width="0.75"/>' +
      '<rect x="5.5" y="11" width="19" height="12" rx="5.5" fill="#FFFFFF"/>' +
      '<circle cx="25.5" cy="16.5" r="2.6" fill="#FFFFFF"/>' +
      '<circle cx="26.2" cy="16.5" r="0.55" fill="#1B7A4D"/>' +
      '<path d="M9 11 L11.8 8 L13 11 Z" fill="#FFFFFF"/>' +
      '<circle cx="20.5" cy="14.5" r="0.85" fill="#1B7A4D"/>' +
      '<rect x="14.5" y="9.7" width="5" height="1.6" rx="0.5" fill="#1B7A4D" opacity="0.85"/>' +
      '<rect x="8" y="22" width="2.6" height="3" rx="0.5" fill="#FFFFFF"/>' +
      '<rect x="19" y="22" width="2.6" height="3" rx="0.5" fill="#FFFFFF"/>' +
    '</svg>';

  const LOGO_FITNESS =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" fill="none">' +
      '<defs><linearGradient id="al-bg-fit" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#F76B15"/><stop offset="1" stop-color="#CC4E00"/>' +
      '</linearGradient></defs>' +
      '<rect x="1" y="1" width="30" height="30" rx="7" fill="url(#al-bg-fit)"/>' +
      '<rect x="1.5" y="1.5" width="29" height="29" rx="6.5" stroke="rgba(255,255,255,0.18)" stroke-width="0.75"/>' +
      '<rect x="3" y="8.5" width="6.5" height="15" rx="1.4" fill="#FFFFFF"/>' +
      '<rect x="22.5" y="8.5" width="6.5" height="15" rx="1.4" fill="#FFFFFF"/>' +
      '<rect x="9.5" y="14.5" width="13" height="3" rx="0.8" fill="#FFFFFF"/>' +
      '<rect x="9.5" y="11.5" width="0.9" height="9" rx="0.3" fill="url(#al-bg-fit)" opacity="0.85"/>' +
      '<rect x="21.6" y="11.5" width="0.9" height="9" rx="0.3" fill="url(#al-bg-fit)" opacity="0.85"/>' +
    '</svg>';

  const LOGO_MEALS =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" fill="none">' +
      '<defs><linearGradient id="al-bg-meal" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#8E4EC6"/><stop offset="1" stop-color="#6E2CB8"/>' +
      '</linearGradient></defs>' +
      '<rect x="1" y="1" width="30" height="30" rx="7" fill="url(#al-bg-meal)"/>' +
      '<rect x="1.5" y="1.5" width="29" height="29" rx="6.5" stroke="rgba(255,255,255,0.18)" stroke-width="0.75"/>' +
      '<text x="16" y="22" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" fill="#FFFFFF">M</text>' +
    '</svg>';

  const APPS = [
    { id: "base",        name: "Base",     url: "https://base.joenguyen.ca",     logo: LOGO_BASE },
    { id: "budgeter",    name: "Budgeter", url: "https://budgeter.joenguyen.ca", logo: LOGO_BUDGETER },
    { id: "fitness",     name: "Fitness",  url: "https://fitness.joenguyen.ca",  logo: LOGO_FITNESS },
    { id: "mealplanner", name: "Meals",    url: null,                            logo: LOGO_MEALS }
  ];

  function init() {
    const currentApp = document.documentElement.getAttribute("data-app") || "";

    const bar = document.createElement("div");
    bar.className = "apps-launcher-bar";
    Object.assign(bar.style, {
      position: "fixed",
      top: "var(--space-3)",
      right: "var(--space-3)",
      zIndex: "200",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    });

    APPS.forEach(app => {
      const isCurrent = app.id === currentApp;
      const disabled = !app.url;
      const tag = disabled || isCurrent ? "div" : "a";
      const item = document.createElement(tag);
      item.className = "apps-launcher-item";
      item.title = isCurrent
        ? `${app.name} (current)`
        : disabled
          ? `${app.name} (coming soon)`
          : `Switch to ${app.name}`;
      item.innerHTML = app.logo;
      if (!disabled && !isCurrent) item.setAttribute("href", app.url);
      Object.assign(item.style, {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "var(--radius-sm)",
        opacity: isCurrent ? "1" : disabled ? "0.35" : "0.55",
        transition: "opacity 120ms, transform 120ms",
        cursor: disabled ? "default" : isCurrent ? "default" : "pointer",
        textDecoration: "none"
      });
      if (!disabled && !isCurrent) {
        item.addEventListener("mouseenter", () => {
          item.style.opacity = "1";
          item.style.transform = "translateY(-1px)";
        });
        item.addEventListener("mouseleave", () => {
          item.style.opacity = "0.55";
          item.style.transform = "";
        });
      }
      bar.appendChild(item);
    });

    document.body.appendChild(bar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
