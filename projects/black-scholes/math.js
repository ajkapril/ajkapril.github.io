export function normalPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function normalCDF(x) {
  // Abramowitz-Stegun style approximation via erf.
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const absoluteX = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * absoluteX);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absoluteX * absoluteX);

  return sign * y;
}

export function blackScholes({ S, K, r, sigma, T }) {
  validatePositive("S", S);
  validatePositive("K", K);
  validatePositive("sigma", sigma);
  validatePositive("T", T);

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);
  const discountFactor = Math.exp(-r * T);

  const call = S * Nd1 - K * discountFactor * Nd2;
  const put = K * discountFactor * normalCDF(-d2) - S * normalCDF(-d1);

  const parityLeft = call - put;
  const parityRight = S - K * discountFactor;
  const parityGap = parityLeft - parityRight;

  return {
    call,
    put,
    d1,
    d2,
    Nd1,
    Nd2,
    parityLeft,
    parityRight,
    parityGap
  };
}

export function greeks({ S, K, r, sigma, T }) {
  const { d1, d2 } = blackScholes({ S, K, r, sigma, T });
  const sqrtT = Math.sqrt(T);
  const pdfD1 = normalPDF(d1);
  const discountFactor = Math.exp(-r * T);

  const deltaCall = normalCDF(d1);
  const deltaPut = deltaCall - 1;
  const gamma = pdfD1 / (S * sigma * sqrtT);
  const vega = S * pdfD1 * sqrtT;

  const thetaCall = -S * pdfD1 * sigma / (2 * sqrtT) - r * K * discountFactor * normalCDF(d2);
  const thetaPut = -S * pdfD1 * sigma / (2 * sqrtT) + r * K * discountFactor * normalCDF(-d2);

  const rhoCall = K * T * discountFactor * normalCDF(d2);
  const rhoPut = -K * T * discountFactor * normalCDF(-d2);

  return {
    deltaCall,
    deltaPut,
    gamma,
    vega,
    thetaCall,
    thetaPut,
    rhoCall,
    rhoPut
  };
}

export function optionPayoff(finalStockPrice, strike, optionType) {
  if (optionType === "call") {
    return Math.max(finalStockPrice - strike, 0);
  }

  return Math.max(strike - finalStockPrice, 0);
}

export function optionProfit(finalStockPrice, strike, optionType, position, premium) {
  const payoff = optionPayoff(finalStockPrice, strike, optionType);

  if (position === "short") {
    return premium - payoff;
  }

  return payoff - premium;
}

export function formatMoney(value) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatDecimal(value, decimals = 4) {
  return Number(value).toFixed(decimals);
}

function validatePositive(label, value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
}
