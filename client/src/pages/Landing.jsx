import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import Calculator from "../components/Calculator.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { calculate, DEFAULT_SOLAR_INPUTS } from "../lib/solar.js";

const LAB_NOTES = [
  { label: "Tariff model", value: "editable" },
  { label: "Install RM/kW", value: "quoted" },
  { label: "Self-use", value: "daytime load" },
  { label: "Degradation", value: "25-year view" },
];

const QUOTE_PACKET = [
  "Panel model, inverter model and warranty terms",
  "Roof mounting method and waterproofing responsibility",
  "NEM/export assumption and metering timeline",
  "Monitoring access, handover checklist and maintenance notes",
];

const COMPARISONS = [
  { name: "Lean roof", bill: 260, roof: 26, sun: 4.3 },
  { name: "Family terrace", bill: 420, roof: 48, sun: 4.6 },
  { name: "High-use home", bill: 820, roof: 86, sun: 4.9 },
];

export default function Landing() {
  useDocumentTitle(
    "Solar quote lab",
    "Model rooftop solar quotes with editable assumptions before you talk to installers.",
  );

  const [inputs, setInputs] = useState(DEFAULT_SOLAR_INPUTS);
  const result = useMemo(() => calculate(inputs), [inputs]);
  const comparisons = useMemo(
    () => COMPARISONS.map((item) => ({
      ...item,
      result: calculate({ ...inputs, monthly_bill: item.bill, roof_area: item.roof, sun_hours: item.sun }),
    })),
    [inputs],
  );

  return (
    <div className="sc-page sc-overhaul">
      <section className="sc-lab">
        <div className="container sc-lab-grid">
          <div className="sc-lab-copy">
            <Reveal><span className="eyebrow">SolarCalc quote lab</span></Reveal>
            <Reveal delay={0.05} as="h1">Stress-test the solar quote before it becomes a sales call.</Reveal>
            <Reveal delay={0.1}>
              <p className="lead mt-16">
                Put the assumptions in the open: tariff, roof limit, performance ratio, export
                credit, self-consumption and lifetime degradation.
              </p>
            </Reveal>
            <Reveal delay={0.14} className="sc-lab-actions">
              <Link to="/calculator" className="btn btn-primary">Open full calculator</Link>
              <Link to="/login?mode=register" className="btn btn-ghost">Save scenarios</Link>
            </Reveal>

            <Reveal delay={0.18} className="sc-lab-notes" aria-label="Model assumptions">
              {LAB_NOTES.map((note) => (
                <div key={note.label}>
                  <span>{note.label}</span>
                  <strong>{note.value}</strong>
                </div>
              ))}
            </Reveal>
          </div>

          <Reveal delay={0.16} className="sc-output-ticket">
            <div className="sc-ticket-head">
              <span>Current model</span>
              <strong>{result.system_kw} kW</strong>
            </div>
            <div className="sc-ticket-row">
              <span>Annual savings</span>
              <strong>RM{result.annual_savings.toLocaleString()}</strong>
            </div>
            <div className="sc-ticket-row">
              <span>Payback</span>
              <strong>{result.payback_years} yrs</strong>
            </div>
            <div className="sc-ticket-row">
              <span>Roof used</span>
              <strong>{result.roof_use_pct}%</strong>
            </div>
            <div className="sc-sun-meter" aria-hidden="true">
              <i style={{ width: `${result.offset_pct}%` }} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section sc-workbench">
        <div className="container">
          <Reveal><span className="eyebrow">Workbench</span></Reveal>
          <Reveal delay={0.05} as="h2">The calculator is the page.</Reveal>
          <Reveal delay={0.1} className="sc-tool mt-40">
            <Calculator
              inputs={inputs}
              setInputs={setInputs}
              footer={<Link to="/login?mode=register" className="btn btn-ghost btn-block mt-8">Create a free account to save this lab run</Link>}
            />
          </Reveal>
        </div>
      </section>

      <section className="section sc-packet">
        <div className="container sc-packet-grid">
          <div>
            <Reveal><span className="eyebrow">Quote packet</span></Reveal>
            <Reveal delay={0.05} as="h2">Ask for the things that change payback.</Reveal>
          </div>
          <Reveal delay={0.1} className="sc-packet-list">
            {QUOTE_PACKET.map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section sc-compare">
        <div className="container">
          <Reveal><span className="eyebrow">Side-by-side</span></Reveal>
          <Reveal delay={0.05} as="h2">One quote rarely tells the whole story.</Reveal>
          <div className="sc-compare-grid mt-40">
            {comparisons.map((item, index) => (
              <Reveal key={item.name} delay={index * 0.06} className="sc-compare-card">
                <span>{item.name}</span>
                <strong>{item.result.payback_years} yrs</strong>
                <p>RM{item.result.annual_savings.toLocaleString()} yearly savings / {item.result.system_kw} kW system</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section sc-cta">
        <div className="container center">
          <Reveal as="h2">Bring the lab notes to the installer.</Reveal>
          <Reveal delay={0.08}>
            <p className="lead mt-16">Save scenarios, compare quotes, and keep the assumptions visible before committing.</p>
          </Reveal>
          <Reveal delay={0.16}><div className="mt-24"><Link to="/login?mode=register" className="btn btn-primary">Create free account</Link></div></Reveal>
        </div>
      </section>
    </div>
  );
}
