import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import Calculator from "../components/Calculator.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { calculate } from "../lib/solar.js";

const FACTS = [
  { stat: "25 yrs", label: "typical panel warranty horizon" },
  { stat: "4.5h", label: "common daily sun assumption in Malaysia" },
  { stat: "RM/kW", label: "cost model shown before you save" },
];

const STEPS = [
  { title: "Bill", text: "Start with the one number every homeowner already has." },
  { title: "Roof", text: "Cap the estimate by usable area so the recommendation stays realistic." },
  { title: "Payback", text: "Compare annual savings, installed cost and long-term upside in one view." },
];

export default function Landing() {
  useDocumentTitle(
    "Will rooftop solar pay off?",
    "Turn your electricity bill and roof size into a clear answer: system size, cost, savings and payback.",
  );

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const sunX = useTransform(scrollYProgress, [0, 1], ["8%", "88%"]);
  const rayScale = useTransform(scrollYProgress, [0, 1], [0.35, 1]);
  const [inputs, setInputs] = useState({ monthly_bill: 350, roof_area: 40, sun_hours: 4.5 });
  const result = useMemo(() => calculate(inputs), [inputs]);

  return (
    <div className="sc-page">
      <section ref={heroRef} className="sc-hero">
        <div className="sc-solar-line" aria-hidden="true">
          <motion.span style={{ left: sunX }} />
          <motion.i style={{ scaleX: rayScale }} />
        </div>

        <div className="container">
          <div className="sc-hero-head">
            <div>
              <Reveal><span className="eyebrow">SolarCalc</span></Reveal>
              <Reveal delay={0.08} as="h1">Know the payback before the sales call.</Reveal>
            </div>
            <Reveal delay={0.14}>
              <p className="lead">
                Adjust your bill, roof area and sun assumptions. SolarCalc turns them into system size,
                installed cost, annual savings and payback without hiding the math.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.18} className="sc-summary-row">
            <div>
              <span>Recommended system</span>
              <strong>{result.system_kw} kW</strong>
            </div>
            <div>
              <span>Annual savings</span>
              <strong>RM{result.annual_savings.toLocaleString()}</strong>
            </div>
            <div>
              <span>Payback</span>
              <strong>{result.payback_years} yrs</strong>
            </div>
          </Reveal>

          <Reveal delay={0.24} className="sc-tool mt-40">
            <Calculator
              inputs={inputs}
              setInputs={setInputs}
              footer={<Link to="/login?mode=register" className="btn btn-ghost btn-block mt-8">Create a free account to save this</Link>}
            />
          </Reveal>
        </div>
      </section>

      <section className="section sc-facts">
        <div className="container sc-facts-grid">
          {FACTS.map((fact, index) => (
            <Reveal key={fact.label} delay={index * 0.06} className="sc-fact">
              <span>{fact.stat}</span>
              <p>{fact.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section sc-steps">
        <div className="container sc-step-grid">
          <div>
            <Reveal><span className="eyebrow">Decision model</span></Reveal>
            <Reveal delay={0.05} as="h2">A solar estimate should feel inspectable.</Reveal>
          </div>
          <div className="sc-step-list">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08} className="sc-step">
                <span>{step.title}</span>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section sc-cta">
        <div className="container center">
          <Reveal as="h2">Save the scenario when the numbers start to matter.</Reveal>
          <Reveal delay={0.08}>
            <p className="lead mt-16">Keep roof sizes, bill changes and installer quotes side by side before you commit.</p>
          </Reveal>
          <Reveal delay={0.16}><div className="mt-24"><Link to="/login?mode=register" className="btn btn-primary">Create free account</Link></div></Reveal>
        </div>
      </section>
    </div>
  );
}
