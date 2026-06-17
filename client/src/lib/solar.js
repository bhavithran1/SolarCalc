// Mirrors the server ROI engine for instant, debounce-free slider feedback.
// The server recomputes authoritative values when a scenario is saved.
const TARIFF = 0.52;
const PERFORMANCE_RATIO = 0.78;
const KW_PER_M2 = 0.15;
const COST_PER_KW = 4000;
const CO2_PER_KWH = 0.585;
const PANEL_LIFETIME = 25;

export function calculate({ monthly_bill, roof_area, sun_hours }) {
  const bill = Math.max(0, +monthly_bill || 0);
  const area = Math.max(0, +roof_area || 0);
  const sun = Math.max(1, +sun_hours || 4.5);

  const annualConsumptionKwh = (bill / TARIFF) * 12;
  const roofKw = area * KW_PER_M2;
  const neededKw = annualConsumptionKwh / (sun * 365 * PERFORMANCE_RATIO);
  const system_kw = +Math.min(roofKw, neededKw * 1.1).toFixed(2);

  const annual_gen = system_kw * sun * 365 * PERFORMANCE_RATIO;
  const offset_kwh = Math.min(annual_gen, annualConsumptionKwh);
  const annual_savings = Math.round(offset_kwh * TARIFF);
  const cost = Math.round(system_kw * COST_PER_KW);
  const payback_years = annual_savings > 0 ? +(cost / annual_savings).toFixed(1) : 0;
  const co2_tonnes = +((annual_gen * CO2_PER_KWH) / 1000).toFixed(2);
  const lifetime_savings = Math.round(annual_savings * PANEL_LIFETIME - cost);
  const offset_pct = annualConsumptionKwh > 0 ? Math.min(100, Math.round((offset_kwh / annualConsumptionKwh) * 100)) : 0;

  return { system_kw, annual_gen: Math.round(annual_gen), annual_savings, cost, payback_years, co2_tonnes, lifetime_savings, offset_pct };
}
