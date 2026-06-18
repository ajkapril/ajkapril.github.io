const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupEncryptionForm();
  setupDecryptionForm();
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

function setupEncryptionForm() {
  $("#encrypt-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const message = $("#encrypt-message").value.trim();
    const p = $("#encrypt-p").value.trim() || "61";
    const q = $("#encrypt-q").value.trim() || "53";
    const e = $("#encrypt-e").value.trim() || "17";

    if (!message) {
      $("#encrypt-status").textContent = "Please enter a message.";
      return;
    }

    const result = runEncryptionDemo({
      message,
      p,
      q,
      e
    });

    $("#encrypt-status").textContent = "Encryption process generated.";
    $("#encrypt-output").textContent = result;
  });
}

function setupDecryptionForm() {
  $("#decrypt-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const blocks = $("#decrypt-blocks").value.trim();
    const n = $("#decrypt-n").value.trim();
    const d = $("#decrypt-d").value.trim();

    if (!blocks || !n || !d) {
      $("#decrypt-status").textContent =
        "Please enter encrypted blocks, n, and d.";
      return;
    }

    const result = runDecryptionDemo({
      blocks,
      n,
      d
    });

    $("#decrypt-status").textContent = "Decryption process generated.";
    $("#decrypt-output").textContent = result;
  });
}

/*
**********Placeholder RSA functions***********
*/

function runEncryptionDemo(input) {
  return [
    `Message: ${input.message}`,
    "",
    `p = ${input.p}`,
    `q = ${input.q}`,
    `e = ${input.e}`,
    "",
    "TODO: calculate n = p × q",
    "TODO: calculate φ(n) = (p - 1) × (q - 1)",
    "TODO: calculate d, the modular inverse of e mod φ(n)",
    "TODO: convert the message into number blocks",
    "TODO: encrypt each block with c = m^e mod n",
    "",
    "Encrypted blocks will appear here"
  ].join("\n");
}

function runDecryptionDemo(input) {
  return [
    `Encrypted blocks: ${input.blocks}`,
    `n = ${input.n}`,
    `d = ${input.d}`,
    "",
    "TODO: split encrypted blocks into separate values",
    "TODO: decrypt each block with m = c^d mod n",
    "TODO: convert recovered number blocks back into text",
    "",
    "Recovered message will appear here"
  ].join("\n");
}
