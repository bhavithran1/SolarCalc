export default function Footer() {
  return (
    <footer className="footer">
      <div className="container flex between items-center" style={{ flexWrap: "wrap", gap: 16 }}>
        <div className="brand"><span className="logo brand-mark">SC</span> SolarCalc</div>
        <span>Estimates for guidance only — get a professional quote before installing. © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
