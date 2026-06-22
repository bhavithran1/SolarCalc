import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import Calculator from "../components/Calculator.jsx";
import Reveal from "../components/Reveal.jsx";
import { DEFAULT_SOLAR_INPUTS } from "../lib/solar.js";

export default function CalculatorPage() {
  useDocumentTitle("Calculator", "Adjust the sliders to match your home and see your solar payoff update live.");
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [inputs, setInputs] = useState(DEFAULT_SOLAR_INPUTS);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return navigate("/login?mode=register");
    const name = prompt("Name this scenario:", "My home");
    if (!name) return;
    setSaving(true);
    try {
      await api("/scenarios", { method: "POST", body: { name, ...inputs } });
      toast.success(`Saved “${name}” ✅`);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="section">
      <div className="container">
        <Reveal><span className="eyebrow">Calculator</span></Reveal>
        <Reveal delay={0.05} as="h2">Size up your rooftop</Reveal>
        <Reveal delay={0.1}><p className="lead mt-16">Adjust the sliders to match your home and see the payoff update live.</p></Reveal>
        <Reveal delay={0.14} className="mt-40">
          <Calculator inputs={inputs} setInputs={setInputs} onSave={save} saving={saving} />
        </Reveal>
      </div>
    </div>
  );
}
