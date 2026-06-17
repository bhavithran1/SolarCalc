import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { calculate } from "../lib/solar.js";

const SUN_PRESETS = [
  { label: "Cloudy / shaded", val: 3.5 },
  { label: "Typical (Malaysia)", val: 4.5 },
  { label: "Very sunny", val: 5.5 },
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

  const results = [
    { label: "Annual savings", value: `RM${r.annual_savings.toLocaleString()}`, hint: "off your electricity bill", accent: true },
    { label: "Payback period", value: `${r.payback_years} yrs`, hint: "to recover the cost" },
    { label: "System size", value: `${r.system_kw} kW`, hint: `~RM${r.cost.toLocaleString()} installed` },
    { label: "CO₂ avoided", value: `${r.co2_tonnes} t/yr`, hint: "carbon kept out of the air" },
  ];

  return (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      {/* inputs */}
      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: "1.3rem" }}>Your roof & usage</h3>
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
        </div>
        {footer}
      </div>

      {/* results */}
      <div>
        <div className="grid grid-2">
          {results.map((res) => (
            <motion.div key={res.label} className="card" style={{ padding: 24, background: res.accent ? "var(--slate)" : "var(--surface)", color: res.accent ? "#fff" : "var(--ink)" }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, opacity: 0.8 }}>{res.label}</span>
              <motion.div className="result-num mt-8" key={res.value} initial={{ scale: 0.92, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}
                style={{ color: res.accent ? "#ffd479" : "var(--green-deep)" }}>
                {res.value}
              </motion.div>
              <span style={{ fontSize: "0.82rem", opacity: 0.75 }}>{res.hint}</span>
            </motion.div>
          ))}
        </div>

        <div className="card mt-24" style={{ padding: 24 }}>
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
          {onSave && (
            <button className="btn btn-primary btn-block mt-16" onClick={onSave} disabled={saving}>
              {saving ? "Saving…" : "💾 Save this scenario"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
