import { useMemo } from "react";
import { motion } from "framer-motion";
import { calculate } from "../lib/solar.js";

const SUN_PRESETS = [
  { label: "Cloudy / shaded", val: 3.5 },
  { label: "Typical (Malaysia)", val: 4.5 },
  { label: "Very sunny", val: 5.5 },
];

const HOME_PRESETS = [
  { label: "Condo", values: { monthly_bill: 180, roof_area: 18, sun_hours: 4.2 } },
  { label: "Terrace", values: { monthly_bill: 350, roof_area: 40, sun_hours: 4.5 } },
  { label: "Semi-D", values: { monthly_bill: 620, roof_area: 68, sun_hours: 4.7 } },
  { label: "Bungalow", values: { monthly_bill: 980, roof_area: 105, sun_hours: 4.9 } },
];

const QUOTE_CHECKS = [
  "Panel brand and product warranty",
  "Inverter warranty and replacement cost",
  "Roof mounting method and waterproofing",
  "NEM/export assumptions in writing",
  "Monitoring app access after handover",
  "Maintenance and cleaning expectations",
];

function Slider({ label, value, onChange, min, max, step, fmt }) {
  return (
    <div className="field">
      <div className="flex between items-center">
        <label style={{ marginBottom: 0 }}>{label}</label>
        <strong style={{ color: "var(--green-deep)" }}>{fmt(value)}</strong>
      </div>
      <input className="slider mt-8" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </div>
  );
}

export default function Calculator({ inputs, setInputs, onSave, saving, footer }) {
  const r = useMemo(() => calculate(inputs), [inputs]);
  const set = (k) => (v) => setInputs({ ...inputs, [k]: v });
  const applyPreset = (preset) => setInputs({ ...inputs, ...preset.values });
  const sensitivity = useMemo(() => ([
    { label: "Install cost -10%", result: calculate({ ...inputs, cost_per_kw: inputs.cost_per_kw * 0.9 }).payback_years },
    { label: "Install cost +10%", result: calculate({ ...inputs, cost_per_kw: inputs.cost_per_kw * 1.1 }).payback_years },
    { label: "Less self-use", result: calculate({ ...inputs, self_consumption_pct: Math.max(55, inputs.self_consumption_pct - 15) }).payback_years },
    { label: "More sun", result: calculate({ ...inputs, sun_hours: inputs.sun_hours + 0.4 }).payback_years },
  ]), [inputs]);

  const results = [
    { label: "Annual savings", value: `RM${r.annual_savings.toLocaleString()}`, hint: "off your electricity bill", accent: true },
    { label: "Payback period", value: `${r.payback_years} yrs`, hint: "to recover the cost" },
    { label: "System size", value: `${r.system_kw} kW`, hint: `~RM${r.cost.toLocaleString()} installed` },
    { label: "CO₂ avoided", value: `${r.co2_tonnes} t/yr`, hint: "carbon kept out of the air" },
    { label: "Annual generation", value: `${r.annual_gen.toLocaleString()} kWh`, hint: `${r.offset_pct}% bill offset` },
    { label: "Roof used", value: `${r.roof_use_pct}%`, hint: "of usable area capacity" },
  ];

  return (
    <div className="calculator-grid">
      <div className="card calc-panel">
        <div className="calc-panel-head">
          <h3>Your roof & usage</h3>
          <span>{r.system_kw} kW model</span>
        </div>
        <div className="preset-row">
          {HOME_PRESETS.map((preset) => (
            <button key={preset.label} type="button" className="btn btn-ghost" onClick={() => applyPreset(preset)}>
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-16">
          <Slider label="Monthly electricity bill" value={inputs.monthly_bill} onChange={set("monthly_bill")} min={50} max={1500} step={10} fmt={(v) => `RM${v}`} />
          <Slider label="Usable roof area" value={inputs.roof_area} onChange={set("roof_area")} min={10} max={150} step={1} fmt={(v) => `${v} m²`} />
          <div className="field">
            <label>Daily sun hours</label>
            <div className="flex gap-12" style={{ flexWrap: "wrap" }}>
              {SUN_PRESETS.map((p) => (
                <button key={p.val} type="button" className={`btn ${inputs.sun_hours === p.val ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 14px" }} onClick={() => set("sun_hours")(p.val)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="assumption-group">
            <h4>Money assumptions</h4>
            <Slider label="Electricity tariff" value={inputs.tariff} onChange={set("tariff")} min={0.3} max={0.9} step={0.01} fmt={(v) => `RM${v.toFixed(2)}/kWh`} />
            <Slider label="Installed cost" value={inputs.cost_per_kw} onChange={set("cost_per_kw")} min={2500} max={6500} step={100} fmt={(v) => `RM${v.toLocaleString()}/kW`} />
            <Slider label="Export credit" value={inputs.export_rate} onChange={set("export_rate")} min={0} max={0.3} step={0.01} fmt={(v) => `RM${v.toFixed(2)}/kWh`} />
          </div>
          <div className="assumption-group">
            <h4>System assumptions</h4>
            <Slider label="Performance ratio" value={inputs.performance_ratio} onChange={set("performance_ratio")} min={0.6} max={0.9} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} />
            <Slider label="Self-consumed energy" value={inputs.self_consumption_pct} onChange={set("self_consumption_pct")} min={55} max={100} step={1} fmt={(v) => `${v}%`} />
            <Slider label="Annual degradation" value={inputs.degradation_pct} onChange={set("degradation_pct")} min={0} max={1.2} step={0.1} fmt={(v) => `${v.toFixed(1)}%`} />
          </div>
        </div>
        {footer}
      </div>

      <div>
        <div className="grid grid-2 calc-results">
          {results.map((res) => (
            <motion.div key={res.label} className={`card result-card ${res.accent ? "accent" : ""}`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <span>{res.label}</span>
              <motion.div className="result-num mt-8" key={res.value} initial={{ scale: 0.92, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}
                style={{ color: res.accent ? "#ffd479" : "var(--green-deep)" }}>
                {res.value}
              </motion.div>
              <small>{res.hint}</small>
            </motion.div>
          ))}
        </div>

        <div className="card mt-24 calc-breakdown">
          <div className="flex between items-center">
            <span style={{ fontWeight: 600 }}>Bill offset</span>
            <strong style={{ color: "var(--green-deep)" }}>{r.offset_pct}%</strong>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: "var(--bg-soft)", overflow: "hidden", marginTop: 10 }}>
            <motion.div animate={{ width: `${r.offset_pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }}
              style={{ height: "100%", background: "var(--green)", borderRadius: 999 }} />
          </div>
          <p className="muted mt-16" style={{ fontSize: "0.9rem" }}>
            Over 25 years this system could net you about <strong style={{ color: "var(--green-deep)" }}>RM{r.lifetime_savings.toLocaleString()}</strong> after costs,
            generating ~{r.annual_gen.toLocaleString()} kWh a year.
          </p>
          <div className="energy-split">
            <span>Self-used: {r.self_consumed_kwh.toLocaleString()} kWh</span>
            <span>Exported: {r.exported_kwh.toLocaleString()} kWh</span>
            <span>House use: {r.annual_consumption.toLocaleString()} kWh</span>
          </div>
          {onSave && (
            <button className="btn btn-primary btn-block mt-16" onClick={onSave} disabled={saving}>
              {saving ? "Saving…" : "Save this scenario"}
            </button>
          )}
        </div>

        <div className="card mt-24 sensitivity-card">
          <h3>Sensitivity check</h3>
          <div className="sensitivity-grid">
            {sensitivity.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.result} yrs</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-24 quote-card">
          <h3>Ask installers for</h3>
          <div>
            {QUOTE_CHECKS.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
