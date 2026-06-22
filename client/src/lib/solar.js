// Mirrors the server ROI engine for instant, debounce-free slider feedback.
// The server recomputes authoritative values when a scenario is saved.
const TARIFF = 0.52;
const EXPORT_RATE = 0.08;
const PERFORMANCE_RATIO = 0.78;
const KW_PER_M2 = 0.15;
const COST_PER_KW = 4000;
const CO2_PER_KWH = 0.585;
const PANEL_LIFETIME = 25;
const DEGRADATION_PCT = 0.5;
const SELF_CONSUMPTION_PCT = 92;
const valueOr = (value, fallback) => Number.isFinite(+value) ? +value : fallback;

export const DEFAULT_SOLAR_INPUTS = {
  monthly_bill: 350,
  roof_area: 40,
  sun_hours: 4.5,
  tariff: TARIFF,
  cost_per_kw: COST_PER_KW,
  performance_ratio: PERFORMANCE_RATIO,
  self_consumption_pct: SELF_CONSUMPTION_PCT,
  export_rate: EXPORT_RATE,
  degradation_pct: DEGRADATION_PCT,
};

export function calculate({
  monthly_bill,
  roof_area,
  sun_hours,
  tariff = TARIFF,
  cost_per_kw = COST_PER_KW,
  performance_ratio = PERFORMANCE_RATIO,
  self_consumption_pct = SELF_CONSUMPTION_PCT,
  export_rate = EXPORT_RATE,
  degradation_pct = DEGRADATION_PCT,
}) {
  const bill = Math.max(0, valueOr(monthly_bill, 0));
  const area = Math.max(0, valueOr(roof_area, 0));
  const sun = Math.max(1, valueOr(sun_hours, 4.5));
  const energyRate = Math.max(0.01, valueOr(tariff, TARIFF));
  const installRate = Math.max(1000, valueOr(cost_per_kw, COST_PER_KW));
  const pr = Math.min(0.95, Math.max(0.55, valueOr(performance_ratio, PERFORMANCE_RATIO)));
  const selfUse = Math.min(100, Math.max(0, valueOr(self_consumption_pct, SELF_CONSUMPTION_PCT))) / 100;
  const exportCredit = Math.max(0, valueOr(export_rate, EXPORT_RATE));
  const degradation = Math.min(2, Math.max(0, valueOr(degradation_pct, DEGRADATION_PCT))) / 100;

  const annualConsumptionKwh = (bill / energyRate) * 12;
  const roofKw = area * KW_PER_M2;
  const neededKw = annualConsumptionKwh / (sun * 365 * pr);
  const system_kw = +Math.min(roofKw, neededKw * 1.1).toFixed(2);

  const annual_gen = system_kw * sun * 365 * pr;
  const self_consumed_kwh = Math.min(annual_gen * selfUse, annualConsumptionKwh);
  const exported_kwh = Math.max(0, annual_gen - self_consumed_kwh);
  const offset_kwh = Math.min(self_consumed_kwh, annualConsumptionKwh);
  const annual_savings = Math.round(self_consumed_kwh * energyRate + exported_kwh * exportCredit);
  const cost = Math.round(system_kw * installRate);
  const payback_years = annual_savings > 0 ? +(cost / annual_savings).toFixed(1) : 0;
  const co2_tonnes = +((annual_gen * CO2_PER_KWH) / 1000).toFixed(2);
  const degradationFactor = 1 - degradation * ((PANEL_LIFETIME - 1) / 2);
  const lifetime_savings = Math.round(annual_savings * PANEL_LIFETIME * degradationFactor - cost);
  const offset_pct = annualConsumptionKwh > 0 ? Math.min(100, Math.round((offset_kwh / annualConsumptionKwh) * 100)) : 0;
  const roof_use_pct = roofKw > 0 ? Math.min(100, Math.round((system_kw / roofKw) * 100)) : 0;

  return {
    system_kw,
    annual_gen: Math.round(annual_gen),
    annual_consumption: Math.round(annualConsumptionKwh),
    self_consumed_kwh: Math.round(self_consumed_kwh),
    exported_kwh: Math.round(exported_kwh),
    annual_savings,
    cost,
    payback_years,
    co2_tonnes,
    lifetime_savings,
    offset_pct,
    roof_use_pct,
  };
}
