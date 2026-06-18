import {
  blackScholes,
  greeks,
  optionPayoff,
  optionProfit,
  formatMoney,
  formatDecimal
} from "./math.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let lastPayoffInput = null;
let lastCalculatorInput = null;

window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupPanels();
  setupOpenLabButton();
  setupPayoffForm();
  setupCalculatorForm();

  renderPayoff();
  renderCalculator();
});

function setupThemeToggle() {
  const themeButton = $("#theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  setTheme(savedTheme || systemTheme);

  themeButton.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    redrawCharts();
  });

  function setTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme = theme;
    themeButton.textContent = isDark ? "Light mode" : "Dark mode";
    themeButton.setAttribute("aria-pressed", String(isDark));
  }
}

function setupPanels() {
  const buttons = $$("[data-panel-target]");
  const panels = $$("[data-panel]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.panelTarget;

      buttons.forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      panels.forEach((panel) => {
        const isActive = panel.id === targetId;
        panel.classList.toggle("active-panel", isActive);
        panel.hidden = !isActive;
      });
    });
  });
}

function setupOpenLabButton() {
  const button = $("#open-lab-button");
  const target = $("#lab-start");
  const header = $(".site-header");

  if (!button || !target) {
    return;
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();

    const headerHeight = header ? header.offsetHeight : 0;
    const extraSpace;

    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrolly -
      headerHeight -
      extraSpace;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });
  });
}

function setupPayoffForm() {
  $("#payoff-form").addEventListener("submit", (event) => {
    event.preventDefault();
    renderPayoff();
  });
}

function setupCalculatorForm() {
  $("#calculator-form").addEventListener("submit", (event) => {
    event.preventDefault();
    renderCalculator();
  });
}

function renderPayoff() {
  const input = readPayoffInput();
  lastPayoffInput = input;

  const points = [];
  const step = input.maxFinalStockPrice / 80;

  for (let ST = 0; ST <= input.maxFinalStockPrice + 0.0001; ST += step) {
    points.push({
      x: ST,
      payoff: optionPayoff(ST, input.strike, input.optionType),
      profit: optionProfit(ST, input.strike, input.optionType, input.position, input.premium)
    });
  }

  drawLineChart($("#payoff-canvas"), {
    title: "Payoff and profit at maturity",
    xLabel: "Final stock price S_T",
    yLabel: "Value",
    series: [
      {
        label: "Payoff",
        points: points.map((point) => ({ x: point.x, y: input.position === "short" ? -point.payoff : point.payoff }))
      },
      {
        label: "Profit",
        points: points.map((point) => ({ x: point.x, y: point.profit }))
      }
    ]
  });

  renderPayoffExplanation(input);
}

function renderCalculator() {
  const input = readCalculatorInput();
  lastCalculatorInput = input;

  try {
    const result = blackScholes(input);
    const greekValues = greeks(input);

    $("#call-price").textContent = `$${formatMoney(result.call)}`;
    $("#put-price").textContent = `$${formatMoney(result.put)}`;
    $("#d1-output").textContent = formatDecimal(result.d1);
    $("#d2-output").textContent = formatDecimal(result.d2);
    $("#nd1-output").textContent = formatDecimal(result.Nd1);
    $("#nd2-output").textContent = formatDecimal(result.Nd2);

    $("#parity-check").innerHTML = `
      <strong>Put-call parity check</strong><br />
      C − P = ${formatDecimal(result.parityLeft, 6)}<br />
      S − Ke<sup>−rT</sup> = ${formatDecimal(result.parityRight, 6)}<br />
      Difference = ${formatDecimal(result.parityGap, 8)}
    `;

    renderGreeks(greekValues);
    renderValueCurve(input);
  } catch (error) {
    $("#parity-check").textContent = error.message;
  }
}

function renderGreeks(values) {
  const rows = [
    ["Call Delta", values.deltaCall],
    ["Put Delta", values.deltaPut],
    ["Gamma", values.gamma],
    ["Vega", values.vega],
    ["Call Theta", values.thetaCall],
    ["Put Theta", values.thetaPut],
    ["Call Rho", values.rhoCall],
    ["Put Rho", values.rhoPut]
  ];

  const container = $("#greeks-output");
  container.replaceChildren();

  rows.forEach(([label, value]) => {
    const tile = document.createElement("div");
    tile.className = "result-tile";
    tile.innerHTML = `<span>${label}</span><strong>${formatDecimal(value, 5)}</strong>`;
    container.append(tile);
  });
}

function renderValueCurve(input) {
  const minS = Math.max(1, input.K * 0.25);
  const maxS = input.K * 2;
  const step = (maxS - minS) / 80;

  const callPoints = [];
  const putPoints = [];

  for (let S = minS; S <= maxS + 0.0001; S += step) {
    const result = blackScholes({ ...input, S });
    callPoints.push({ x: S, y: result.call });
    putPoints.push({ x: S, y: result.put });
  }

  drawLineChart($("#value-canvas"), {
    title: "Option value against stock price",
    xLabel: "Current stock price S",
    yLabel: "Option value",
    series: [
      { label: "Call value", points: callPoints },
      { label: "Put value", points: putPoints }
    ]
  });
}

function readPayoffInput() {
  return {
    strike: readNumber("#payoff-k"),
    premium: readNumber("#payoff-premium"),
    maxFinalStockPrice: readNumber("#payoff-max-st"),
    optionType: $("#payoff-type").value,
    position: $("#payoff-position").value
  };
}

function readCalculatorInput() {
  return {
    S: readNumber("#bs-s"),
    K: readNumber("#bs-k"),
    r: readNumber("#bs-r") / 100,
    sigma: readNumber("#bs-sigma") / 100,
    T: readNumber("#bs-t")
  };
}

function readNumber(selector) {
  const value = Number($(selector).value);

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid number in ${selector}`);
  }

  return value;
}

function renderPayoffExplanation(input) {
  const type = input.optionType;
  const position = input.position;
  const breakeven = type === "call"
    ? input.strike + input.premium
    : input.strike - input.premium;

  const inMoneyText = type === "call"
    ? `The call is in the money when S_T > ${input.strike}.`
    : `The put is in the money when S_T < ${input.strike}.`;

  $("#payoff-explanation").innerHTML = `
    <strong>${capitalise(position)} ${capitalise(type)}</strong><br />
    ${inMoneyText}<br />
    Premium = ${formatMoney(input.premium)}.<br />
    Approximate breakeven = ${formatMoney(breakeven)}.
  `;
}

function redrawCharts() {
  if (lastPayoffInput) {
    renderPayoff();
  }

  if (lastCalculatorInput) {
    renderCalculator();
  }
}

function drawLineChart(canvas, config) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 44, right: 28, bottom: 58, left: 68 };
  const style = getComputedStyle(document.documentElement);

  const textColor = style.getPropertyValue("--text").trim();
  const mutedColor = style.getPropertyValue("--muted").trim();
  const borderColor = style.getPropertyValue("--border").trim();
  const accentColor = style.getPropertyValue("--accent").trim();
  const successColor = style.getPropertyValue("--success").trim();

  const allPoints = config.series.flatMap((series) => series.points);
  const xValues = allPoints.map((point) => point.x);
  const yValues = allPoints.map((point) => point.y);

  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  let yMin = Math.min(...yValues, 0);
  let yMax = Math.max(...yValues, 0);

  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  }

  const yPadding = (yMax - yMin) * 0.12;
  yMin -= yPadding;
  yMax += yPadding;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xToPx = (x) => padding.left + ((x - xMin) / (xMax - xMin)) * chartWidth;
  const yToPx = (y) => padding.top + chartHeight - ((y - yMin) / (yMax - yMin)) * chartHeight;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = textColor;
  ctx.font = "700 20px Segoe UI, sans-serif";
  ctx.fillText(config.title, padding.left, 28);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;

  //Axes
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
  ctx.stroke();

  //Zero line
  if (yMin < 0 && yMax > 0) {
    ctx.beginPath();
    ctx.moveTo(padding.left, yToPx(0));
    ctx.lineTo(padding.left + chartWidth, yToPx(0));
    ctx.strokeStyle = mutedColor;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  //Grid + labels
  ctx.fillStyle = mutedColor;
  ctx.font = "13px Segoe UI, sans-serif";

  for (let i = 0; i <= 4; i++) {
    const x = xMin + ((xMax - xMin) * i) / 4;
    const px = xToPx(x);
    ctx.fillText(Math.round(x).toString(), px - 12, padding.top + chartHeight + 24);
  }

  for (let i = 0; i <= 4; i++) {
    const y = yMin + ((yMax - yMin) * i) / 4;
    const py = yToPx(y);
    ctx.fillText(formatDecimal(y, 0), 10, py + 4);
  }

  ctx.fillText(config.xLabel, padding.left + chartWidth / 2 - 70, height - 16);

  ctx.save();
  ctx.translate(18, padding.top + chartHeight / 2 + 60);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(config.yLabel, 0, 0);
  ctx.restore();

  const colors = [accentColor, successColor];

  config.series.forEach((series, index) => {
    ctx.beginPath();
    ctx.strokeStyle = colors[index % colors.length];
    ctx.lineWidth = 3;

    series.points.forEach((point, pointIndex) => {
      const px = xToPx(point.x);
      const py = yToPx(point.y);

      if (pointIndex === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });

    ctx.stroke();

    const legendX = padding.left + 20 + index * 160;
    const legendY = padding.top + 20;

    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(legendX, legendY - 10, 16, 4);
    ctx.fillStyle = textColor;
    ctx.fillText(series.label, legendX + 24, legendY);
  });
}

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
