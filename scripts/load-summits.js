document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("summits-menu");
  if (!container) return;

  try {
    const response = await fetch("/components/summits-dropdown.html");
    container.innerHTML = await response.text();
  } catch (err) {
    console.error("Dropdown load failed:", err);
  }
});