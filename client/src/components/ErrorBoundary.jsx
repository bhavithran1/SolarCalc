import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("UI crash:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container section center">
          <div style={{ fontSize: "3rem" }}>🥲</div>
          <h2 className="mt-16">Something went wrong</h2>
          <p className="muted mt-8">An unexpected error occurred. Try reloading the page.</p>
          <button className="btn btn-primary mt-24" onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
