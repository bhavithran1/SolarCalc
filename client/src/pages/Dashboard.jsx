import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Reveal, { Stagger, StaggerItem } from "../components/Reveal.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api("/scenarios").then((d) => setScenarios(d.scenarios)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const remove = async (s) => { if (confirm(`Delete “${s.name}”?`)) { await api(`/scenarios/${s.id}`, { method: "DELETE" }); load(); } };

  const best = scenarios.reduce((b, s) => (!b || s.payback_years < b.payback_years ? s : b), null);
  const totalCo2 = scenarios.reduce((sum, s) => sum + s.co2_tonnes, 0);

  return (
    <div className="section">
      <div className="container">
        <Reveal><span className="eyebrow">My scenarios</span></Reveal>
        <Reveal delay={0.05} as="h2">Hi {user?.name?.split(" ")[0]} ☀️</Reveal>

        <Stagger className="grid grid-3 mt-40">
          {[
            { num: scenarios.length, label: "saved scenarios" },
            { num: best ? `${best.payback_years} yrs` : "—", label: "fastest payback" },
            { num: `${totalCo2.toFixed(1)} t`, label: "combined annual CO₂ saved" },
          ].map((s) => (
            <StaggerItem key={s.label} className="card"><div style={{ padding: 28 }}><div className="stat-num">{s.num}</div><p className="muted mt-8">{s.label}</p></div></StaggerItem>
          ))}
        </Stagger>

        <div className="flex between items-center mt-40" style={{ flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ fontSize: "1.4rem" }}>Compare your scenarios</h3>
          <Link to="/calculator" className="btn btn-primary">+ New scenario</Link>
        </div>

        {loading ? <p className="muted mt-16">Loading…</p>
          : scenarios.length === 0 ? (
            <div className="card mt-16" style={{ padding: 28 }}>
              <p className="muted">No scenarios saved yet.</p>
              <Link to="/calculator" className="btn btn-primary mt-16">Open the calculator</Link>
            </div>
          ) : (
            <Stagger className="grid grid-2 mt-16">
              {scenarios.map((s) => (
                <StaggerItem key={s.id} className="card" style={{ padding: 24 }}>
                  <div className="flex between items-center">
                    <strong style={{ fontSize: "1.15rem" }}>{s.name}</strong>
                    {best && s.id === best.id && <span className="pill">⚡ best payback</span>}
                  </div>
                  <p className="muted mt-8" style={{ fontSize: "0.86rem" }}>
                    RM{s.monthly_bill}/mo bill · {s.roof_area} m² roof · {s.sun_hours}h sun
                  </p>
                  <div className="grid grid-2 mt-16" style={{ gap: 12 }}>
                    <div><div className="result-num" style={{ color: "var(--green-deep)", fontSize: "1.5rem" }}>RM{s.annual_savings.toLocaleString()}</div><span className="muted" style={{ fontSize: "0.8rem" }}>per year</span></div>
                    <div><div className="result-num" style={{ fontSize: "1.5rem" }}>{s.payback_years} yrs</div><span className="muted" style={{ fontSize: "0.8rem" }}>payback</span></div>
                    <div><div className="result-num" style={{ fontSize: "1.5rem" }}>{s.system_kw} kW</div><span className="muted" style={{ fontSize: "0.8rem" }}>~RM{s.cost.toLocaleString()}</span></div>
                    <div><div className="result-num" style={{ fontSize: "1.5rem" }}>{s.co2_tonnes} t</div><span className="muted" style={{ fontSize: "0.8rem" }}>CO₂/yr</span></div>
                  </div>
                  <button className="btn btn-ghost btn-block mt-16" onClick={() => remove(s)}>Delete</button>
                </StaggerItem>
              ))}
            </Stagger>
          )}
      </div>
    </div>
  );
}
