import { Link } from "react-router-dom";
import useDocumentTitle from "../lib/useDocumentTitle.js";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <div className="container section center">
      <div style={{ fontSize: "4rem" }}>🌥️</div>
      <h1 className="mt-16" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>404 — no sunshine here</h1>
      <p className="lead mt-16" style={{ margin: "16px auto 0" }}>This page is off the grid. Let's get you back to the numbers.</p>
      <div className="flex gap-12 mt-24" style={{ justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/" className="btn btn-primary">Home</Link>
        <Link to="/calculator" className="btn btn-ghost">Open calculator</Link>
      </div>
    </div>
  );
}
