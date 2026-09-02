// Apps dock — row of app icons + theme toggle rendered into the sidebar
// footer (bottom-left), switching between Joe's self-hosted apps.
// Auto-injects on DOMContentLoaded; layouts only need a .sidebar (the
// .sidebar-footer is created if absent). Reads `data-app` on <html> to
// highlight the current app. Styles live in design-system.css (.app-dock).
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
        '<stop offset="0" stop-color="#8E4EC6"/><stop offset="1" stop-color="#653580"/>' +
      '</linearGradient></defs>' +
      '<rect x="1" y="1" width="30" height="30" rx="7" fill="url(#al-bg-meal)"/>' +
      '<rect x="1.5" y="1.5" width="29" height="29" rx="6.5" stroke="rgba(255,255,255,0.18)" stroke-width="0.75"/>' +
      '<g stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.75">' +
        '<path d="M11.5 9.5 Q12.5 8.2 11.5 7.0 Q10.5 5.8 11.5 4.5"/>' +
        '<path d="M16 9.0 Q17 7.7 16 6.5 Q15 5.3 16 4.0"/>' +
        '<path d="M20.5 9.5 Q21.5 8.2 20.5 7.0 Q19.5 5.8 20.5 4.5"/>' +
      '</g>' +
      '<path d="M5.5 14.5 L26.5 14.5 A10.5 10.5 0 0 1 5.5 14.5 Z" fill="#FFFFFF"/>' +
      '<rect x="5" y="13.5" width="22" height="1.4" rx="0.5" fill="#FFFFFF"/>' +
      '<path d="M8.2 14.9 L23.8 14.9 A7.8 7.8 0 0 1 8.2 14.9 Z" fill="#653580" opacity="0.20"/>' +
      '<g stroke="#653580" stroke-width="0.9" stroke-linecap="round" opacity="0.9">' +
        '<line x1="22" y1="5" x2="26" y2="13"/>' +
        '<line x1="24" y1="5" x2="27.5" y2="13"/>' +
      '</g>' +
    '</svg>';

  const LOGO_UPKEEP =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" fill="none">' +
      '<defs><linearGradient id="al-bg-upk" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#0090FF"/><stop offset="1" stop-color="#0D74CE"/>' +
      '</linearGradient></defs>' +
      '<rect x="1" y="1" width="30" height="30" rx="7" fill="url(#al-bg-upk)"/>' +
      '<rect x="1.5" y="1.5" width="29" height="29" rx="6.5" stroke="rgba(255,255,255,0.18)" stroke-width="0.75"/>' +
      '<g transform="rotate(45 16 16)">' +
        '<circle cx="9" cy="16" r="5.2" fill="#FFFFFF"/>' +
        '<rect x="1.5" y="13.6" width="6.2" height="4.8" rx="0.6" fill="url(#al-bg-upk)"/>' +
        '<rect x="11.5" y="13.9" width="16" height="4.2" rx="2.1" fill="#FFFFFF"/>' +
      '</g>' +
    '</svg>';

  const APPS = [
    { id: "base",        name: "Base",     url: "https://base.joenguyen.ca",     logo: LOGO_BASE },
    { id: "budgeter",    name: "Budgeter", url: "https://budgeter.joenguyen.ca", logo: LOGO_BUDGETER },
    { id: "fitness",     name: "Fitness",  url: "https://fitness.joenguyen.ca",  logo: LOGO_FITNESS },
    { id: "mealplanner", name: "Meals",    url: "https://mealplanner.joenguyen.ca", logo: LOGO_MEALS },
    { id: "upkeep",      name: "Upkeep",   url: "https://upkeep.joenguyen.ca",   logo: LOGO_UPKEEP }
  ];

  function init() {
    const currentApp = document.documentElement.getAttribute("data-app") || "";
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    let footer = sidebar.querySelector(".sidebar-footer");
    if (!footer) {
      footer = document.createElement("div");
      footer.className = "sidebar-footer";
      sidebar.appendChild(footer);
    }
    footer.innerHTML = "";

    const dock = document.createElement("div");
    dock.className = "app-dock";

    APPS.forEach(app => {
      const isCurrent = app.id === currentApp;
      const disabled = !app.url;
      const item = document.createElement(disabled || isCurrent ? "span" : "a");
      item.className = "dock-app" + (isCurrent ? " current" : "");
      item.title = isCurrent
        ? `${app.name} (current)`
        : disabled
          ? `${app.name} (coming soon)`
          : `Switch to ${app.name}`;
      if (!disabled && !isCurrent) item.setAttribute("href", app.url);
      item.innerHTML = app.logo;
      dock.appendChild(item);
    });

    const sep = document.createElement("span");
    sep.className = "dock-sep";
    dock.appendChild(sep);

    // Same glyph convention as the old per-app toggles: sun while dark
    // (click for light), moon while light. toggleTheme() from shared-core.js.
    const themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "dock-theme";
    themeBtn.title = "Toggle theme";
    const glyph = () =>
      document.documentElement.getAttribute("data-theme") === "dark" ? "\u2600" : "\u263D";
    themeBtn.textContent = glyph();
    themeBtn.addEventListener("click", () => {
      if (window.toggleTheme) window.toggleTheme();
      themeBtn.textContent = glyph();
    });
    dock.appendChild(themeBtn);

    footer.appendChild(dock);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
