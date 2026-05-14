document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadInto("site-header", "components/2026-header.html"),
    loadInto("site-nav", "components/2026-nav.html"),
  ]);

  await Promise.all([
    loadInto("summits-menu", "components/summits-dropdown.html"),
    loadInto("site-footer", "components/2026-footer.html"),
  ]);

  populateHeader();
  markCurrentNavItem();
});

async function loadInto(id, path) {
  const container = document.getElementById(id);
  if (!container) return;

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    container.innerHTML = await response.text();
  } catch (err) {
    console.error("Component load failed:", err);
  }
}

function markCurrentNavItem() {
  const currentPath = normalizePath(window.location.pathname);
  document.querySelectorAll("#site-nav .nav-container > a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http")) return;

    if (normalizePath(new URL(href, window.location.href).pathname) === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function populateHeader() {
  const container = document.getElementById("site-header");
  if (!container) return;

  const title = document.getElementById("site-header-title");
  const subtitle = document.getElementById("site-header-subtitle");

  if (title) title.textContent = container.dataset.title || "";
  if (!subtitle) return;

  const subtitleText = container.dataset.subtitle || "";
  subtitle.textContent = "";

  if (container.dataset.subtitleEmphasis === "true") {
    const emphasis = document.createElement("em");
    emphasis.textContent = subtitleText;
    subtitle.appendChild(emphasis);
  } else {
    subtitle.textContent = subtitleText;
  }
}

function normalizePath(path) {
  if (path === "/" || path === "") return "/index.html";
  return path.endsWith("/") ? `${path}index.html` : path;
}
