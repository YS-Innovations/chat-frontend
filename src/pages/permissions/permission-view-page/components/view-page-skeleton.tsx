export function ViewPageSkeleton() {
  return (
    <div className="skeleton-view">
      <div className="skeleton-header" />
      <div className="skeleton-search" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton-group">
          <div className="skeleton-title" />
          <div className="skeleton-items">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="skeleton-item" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}