import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import Calculator from "../components/Calculator.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";

const STEPS = [
  { icon: "🏠", title: "Describe your roof", text: "Slide in your monthly bill, usable roof area and how sunny your area is — no technical knowledge needed." },
  { icon: "⚡", title: "See the numbers", text: "Instantly view recommended system size, upfront cost, annual savings and payback period." },
  { icon: "📊", title: "Save & compare", text: "Create an account to save scenarios side by side and decide with confidence." },
];
const FACTS = [
  { stat: "RM0", label: "import tariff on most home solar in Malaysia (NEM)" },
  { stat: "~6 yrs", label: "typical payback for a right-sized rooftop system" },
  { stat: "25 yrs", label: "panel warranty — savings long after payback" },
];

export default function Landing() {
  useDocumentTitle("Will rooftop solar pay off?", "Turn your electricity bill and roof size into a clear answer: system size, cost, savings and payback.");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [inputs, setInputs] = useState({ monthly_bill: 350, roof_area: 40, sun_hours: 4.5 });

  return (
    <div>
      <section ref={heroRef} className="section" style={{ paddingTop: 90, paddingBottom: 70, overflow: "hidden" }}>
        <div className="container">
          <motion.div style={{ y, opacity }}>
            <Reveal><span className="pill">☀️ Free rooftop solar estimator</span></Reveal>
            <Reveal delay={0.08} as="h1" className="mt-16">Will solar actually<br />pay off for you?</Reveal>
            <Reveal delay={0.16}><p className="lead mt-16">SolarCalc turns your electricity bill and roof size into a clear answer — system size, cost, savings and payback — in seconds.</p></Reveal>
            <Reveal delay={0.24}>
              <div className="flex gap-12 mt-24" style={{ flexWrap: "wrap" }}>
                <a href="#calc" className="btn btn-primary">Try the calculator</a>
                <Link to="/login?mode=register" className="btn btn-ghost">Save your scenarios →</Link>
              </div>
            </Reveal>
          </motion.div>
        </div>
      </section>

      {/* live calculator right on the landing page */}
      <section id="calc" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal><span className="eyebrow">Try it now</span></Reveal>
          <Reveal delay={0.05} as="h2">Drag the sliders. Watch it pay off.</Reveal>
          <Reveal delay={0.1} className="mt-40">
            <Calculator inputs={inputs} setInputs={setInputs}
              footer={<Link to="/login?mode=register" className="btn btn-ghost btn-block mt-8">Create a free account to save this →</Link>} />
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <Reveal><span className="eyebrow">Why now</span></Reveal>
          <Reveal delay={0.05} as="h2">The economics have flipped.</Reveal>
          <div className="grid grid-3 mt-40">
            {FACTS.map((f, i) => (
              <Reveal key={f.label} delay={i * 0.1} className="card">
                <div style={{ padding: 28 }}><div className="stat-num">{f.stat}</div><p className="muted mt-8">{f.label}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><span className="eyebrow">How it works</span></Reveal>
          <Reveal delay={0.05} as="h2">From bill to bright idea in three steps.</Reveal>
          <div className="grid grid-3 mt-40">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.12} className="card">
                <div style={{ padding: 30 }}>
                  <div style={{ fontSize: "2.4rem" }}>{s.icon}</div>
                  <h3 className="mt-16" style={{ fontSize: "1.35rem" }}>{s.title}</h3>
                  <p className="muted mt-8">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--slate)", color: "#fff" }}>
        <div className="container center">
          <Reveal as="h2" style={{ color: "#fff" }}>Make the call with real numbers.</Reveal>
          <Reveal delay={0.08}><p className="lead mt-16" style={{ margin: "16px auto 0", color: "#cdd4dd" }}>Save and compare scenarios for free — no installer sales pitch required.</p></Reveal>
          <Reveal delay={0.16}><div className="mt-24"><Link to="/login?mode=register" className="btn btn-primary">Create free account</Link></div></Reveal>
        </div>
      </section>
    </div>
  );
}
