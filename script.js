const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupWelcomeButtons();
  setupTabs();
  setupEncryptionForm();
  setupDecryptionForm();
  setupCopyButton();
});

//DARK MODE

function setupThemeToggle() {
  const themeButton = $("#theme-toggle");
  const themeText = $("#theme-toggle-text");

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
    themeButton.setAttribute("aria-pressed", String(isDark));
    themeText.textContent = isDark ? "Light mode" : "Dark mode";
  }
}

//WELCOME BUTTONS

function setupWelcomeButtons() {
  $("#start-rsa").addEventListener("click", () => {
    $("#rsa-lab").scrollIntoView({
      behavior: "smooth"
    });
  });

  $("#show-message").addEventListener("click", showMessage);
}

function showMessage() {
  $("#message-area").textContent =
    "Use the RSA lab below to practise encryption and decryption step by step.";
}

//TABS

function setupTabs() {
  const tabButtons = $$(".tab-button");
  const tabPanels = $$("[data-tab-panel]");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetPanelId = button.dataset.tabTarget;

      tabButtons.forEach((tabButton) => {
        const isActive = tabButton === button;

        tabButton.classList.toggle("active", isActive);
        tabButton.setAttribute("aria-selected", String(isActive));
      });

      tabPanels.forEach((panel) => {
        const isActive = panel.id === targetPanelId;

        panel.classList.toggle("active-panel", isActive);
        panel.hidden = !isActive;
      });
    });
  });
}

//ENCRYPTION FORM CONNECTION

function setupEncryptionForm() {
  const form = $("#encrypt-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    setStatus("#encrypt-status", "working", "Reading encryption input...");

    const input = {
      message: $("#encrypt-message").value.trim(),
      useAutoValues: $("#auto-values").checked,
      p: $("#encrypt-p").value.trim(),
      q: $("#encrypt-q").value.trim(),
      e: $("#encrypt-e").value.trim(),
      blockMode: $("#block-mode").value
    };

    if (!input.message) {
      setStatus("#encrypt-status", "error", "Please enter a message first.");
      return;
    }

    const result = runEncryptionDemo(input);

    renderEncryptionResult(result);
    setStatus("#encrypt-status", "success", "Encryption UI connected.");
  });

  form.addEventListener("reset", () => {
    setTimeout(clearEncryptionOutput, 0);
  });
}

function renderEncryptionResult(result) {
  $("#out-p").textContent = result.keys.p;
  $("#out-q").textContent = result.keys.q;
  $("#out-n").textContent = result.keys.n;
  $("#out-phi").textContent = result.keys.phi;
  $("#out-e").textContent = result.keys.e;
  $("#out-d").textContent = result.keys.d;

  $("#encrypted-blocks").textContent = result.encryptedBlocks;
  $("#share-packet").value = JSON.stringify(result.practicePacket, null, 2);

  renderSteps("#encrypt-process", result.steps);
}

function clearEncryptionOutput() {
  setStatus("#encrypt-status", "", "No encryption has been run yet.");

  $("#out-p").textContent = "—";
  $("#out-q").textContent = "—";
  $("#out-n").textContent = "—";
  $("#out-phi").textContent = "—";
  $("#out-e").textContent = "—";
  $("#out-d").textContent = "Shown later by your RSA code";

  $("#encrypted-blocks").textContent = "—";
  $("#share-packet").value = "";
  $("#encrypt-process").replaceChildren();
}

//DECRYPTION FORM CONNECTION

function setupDecryptionForm() {
  const form = $("#decrypt-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    setStatus("#decrypt-status", "working", "Reading decryption input...");

    const input = {
      packet: $("#decrypt-packet").value.trim(),
      ciphertext: $("#decrypt-ciphertext").value.trim(),
      n: $("#decrypt-n").value.trim(),
      d: $("#decrypt-d").value.trim(),
      blockWidths: $("#decrypt-block-widths").value.trim()
    };

    const result = runDecryptionDemo(input);

    renderDecryptionResult(result);
    setStatus("#decrypt-status", "success", "Decryption UI connected.");
  });

  form.addEventListener("reset", () => {
    setTimeout(clearDecryptionOutput, 0);
  });
}

function renderDecryptionResult(result) {
  $("#decrypted-message").textContent = result.message;
  $("#decrypt-blocks").textContent = result.blocks;

  renderSteps("#decrypt-process", result.steps);
}

function clearDecryptionOutput() {
  setStatus("#decrypt-status", "", "No decryption has been run yet.");

  $("#decrypted-message").textContent = "—";
  $("#decrypt-blocks").textContent = "—";
  $("#decrypt-process").replaceChildren();
}

//COPY PRACTICE PACKET

function setupCopyButton() {
  $("#copy-packet").addEventListener("click", async () => {
    const packetText = $("#share-packet").value.trim();

    if (!packetText) {
      setStatus("#encrypt-status", "error", "There is no packet to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(packetText);
      setStatus("#encrypt-status", "success", "Practice packet copied.");
    } catch {
      $("#share-packet").select();
      document.execCommand("copy");
      setStatus("#encrypt-status", "success", "Practice packet copied.");
    }
  });
}

//GENERAL DISPLAY HELPERS
  
function setStatus(selector, kind, message) {
  const element = $(selector);

  element.dataset.kind = kind;
  element.textContent = message;
}

function renderSteps(selector, steps) {
  const list = $(selector);

  list.replaceChildren();

  steps.forEach((stepText) => {
    const item = document.createElement("li");
    item.textContent = stepText;
    list.appendChild(item);
  });
}

/*
  RSA PLACEHOLDER

*****ADD RSA MATH HERE LATER*****

*/
function runEncryptionDemo(input) {
  const p = input.useAutoValues && !input.p ? "61" : input.p || "TODO";
  const q = input.useAutoValues && !input.q ? "53" : input.q || "TODO";
  const e = input.useAutoValues && !input.e ? "17" : input.e || "TODO";

  return {
    keys: {
      p,
      q,
      n: "TODO: calculate p × q",
      phi: "TODO: calculate (p - 1) × (q - 1)",
      e,
      d: "TODO: calculate modular inverse of e"
    },

    encryptedBlocks:
      "TODO: convert the message into number blocks, then encrypt each block.",

    steps: [
      `Message received: "${input.message}"`,
      `Block mode selected: ${input.blockMode}`,
      `Use p = ${p} and q = ${q}`,
      "Calculate n = p × q",
      "Calculate φ(n) = (p - 1) × (q - 1)",
      `Choose e = ${e}, where gcd(e, φ(n)) = 1`,
      "Calculate d, the modular inverse of e mod φ(n)",
      "Convert the message into number blocks",
      "Encrypt each block using c = m^e mod n"
    ],

    practicePacket: {
      type: "rsa-practice-packet",
      warning: "Educational demo only. Never share private keys in real RSA.",
      messagePreview: input.message,
      publicKey: {
        e,
        n: "TODO"
      },
      privateKeyForPracticeOnly: {
        d: "TODO",
        n: "TODO"
      },
      cipherBlocks: [],
      blockMode: input.blockMode
    }
  };
}

function runDecryptionDemo(input) {
  let packetData = null;

  if (input.packet) {
    try {
      packetData = JSON.parse(input.packet);
    } catch {
      return {
        message: "Invalid JSON packet.",
        blocks: "The pasted packet could not be read.",
        steps: [
          "Check that the packet was copied exactly from the encryption section.",
          "The packet should be valid JSON."
        ]
      };
    }
  }

  return {
    message: "TODO: recovered message will appear here.",

    blocks:
      packetData
        ? "TODO: read encrypted blocks from the pasted packet."
        : `TODO: decrypt these blocks: ${input.ciphertext || "none entered"}`,

    steps: [
      "Read the encrypted block or blocks.",
      "Read the private key values d and n.",
      "For each encrypted block, calculate m = c^d mod n.",
      "Convert each recovered number block back into text.",
      "Join the text blocks to rebuild the original message."
    ]
  };
}
