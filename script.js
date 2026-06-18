const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupProjectDropdown();
});

function setupThemeToggle() {
  const themeButton = $("#theme-toggle");

  const savedTheme = localStorage.getItem("theme");

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  const startingTheme = savedTheme || systemTheme;

  setTheme(startingTheme);

  themeButton.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  });

  function setTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme = theme;
    themeButton.textContent = isDark ? "Light mode" : "Dark mode";
    themeButton.setAttribute("aria-pressed", String(isDark));
  }
}

function setupProjectDropdown() {
  const dropdown = $(".dropdown");
  const dropdownButton = $(".dropdown-button");

  dropdownButton.addEventListener("click", () => {
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    const clickedInsideDropdown = dropdown.contains(event.target);

    if (!clickedInsideDropdown) {
      dropdown.classList.remove("open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dropdown.classList.remove("open");
    }
  });
}
