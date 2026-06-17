import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const doLogout = () => { logout(); close(); navigate("/"); };

  const links = (
    <>
      <Link to="/calculator" className="nav-link" onClick={close}>Calculator</Link>
      {user ? (
        <>
          <Link to="/dashboard" className="nav-link" onClick={close}>My scenarios</Link>
          <button className="btn btn-ghost" onClick={doLogout}>Log out</button>
        </>
      ) : (
        <>
          <Link to="/login" className="nav-link" onClick={close}>Log in</Link>
          <Link to="/login?mode=register" className="btn btn-primary" onClick={close}>Get started</Link>
        </>
      )}
    </>
  );

  return (
    <nav className="nav" aria-label="Primary">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close} aria-label="SolarCalc home">
          <span className="logo" aria-hidden="true">☀️</span> SolarCalc
        </Link>
        <div className="nav-links nav-desktop">{links}</div>
        <button className="nav-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "✕" : "☰"}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="nav-mobile" key={location.pathname}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
            <div className="container nav-mobile-inner">{links}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
