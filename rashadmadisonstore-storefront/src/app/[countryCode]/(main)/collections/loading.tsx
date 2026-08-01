export default function CollectionsLoading() {
  return (
    <div
      className="collections-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading collections"
    >
      <div className="collections-loading-shell">
        <div className="collections-loading-icon-wrap" aria-hidden="true">
          <img
            src="/loadingicon.svg"
            alt=""
            className="collections-loading-icon"
          />
          <span className="collections-loading-gradient" />
        </div>

        <p className="collections-loading-label">Loading collections</p>

        <div className="collections-loading-bar-track" aria-hidden="true">
          <span className="collections-loading-bar-fill" />
        </div>
      </div>
    </div>
  )
}
