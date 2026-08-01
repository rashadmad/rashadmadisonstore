export default function GalleryLoading() {
  return (
    <div
      className="gallery-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading gallery"
    >
      <div className="gallery-loading-shell">
        <div className="gallery-loading-icon-wrap" aria-hidden="true">
          <img
            src="/loadingicon.svg"
            alt=""
            className="gallery-loading-icon"
          />
          <span className="gallery-loading-gradient" />
        </div>

        <p className="gallery-loading-label">Loading gallery</p>

        <div className="gallery-loading-bar-track" aria-hidden="true">
          <span className="gallery-loading-bar-fill" />
        </div>
      </div>
    </div>
  )
}
