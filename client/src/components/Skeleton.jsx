/** Animated shimmer placeholders for loading states. */
export function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="skeleton" style={{ height: 120, borderRadius: 0 }} />
      <div style={{ padding: 22, display: "grid", gap: 10 }}>
        <div className="skeleton" style={{ height: 18, width: "70%" }} />
        <div className="skeleton" style={{ height: 12, width: "45%" }} />
        <div className="skeleton" style={{ height: 12, width: "90%" }} />
        <div className="skeleton" style={{ height: 34, width: "100%", marginTop: 8 }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, className = "grid grid-3 mt-40" }) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="card flex items-center gap-12" style={{ padding: "18px 22px" }}>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
      <div style={{ flex: 1, display: "grid", gap: 8 }}>
        <div className="skeleton" style={{ height: 14, width: "40%" }} />
        <div className="skeleton" style={{ height: 10, width: "65%" }} />
      </div>
    </div>
  );
}
