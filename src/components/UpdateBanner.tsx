import type { UpdateStatus } from '../types'

interface UpdateBannerProps {
  status: UpdateStatus
  busy?: boolean
  onSkip: () => void
  onDismiss: () => void
}

/**
 * Slim top banner shown when a newer GitHub release is available.
 * `Skip this version` suppresses it until something newer ships; the `×`
 * dismisses for this session (it reappears on the next check).
 */
export function UpdateBanner({
  status,
  busy,
  onSkip,
  onDismiss,
}: UpdateBannerProps) {
  return (
    <div className="update-banner" role="status">
      <span className="update-banner__icon" aria-hidden="true">
        ⬆
      </span>
      <span className="update-banner__text">
        PalKnobs <strong>{status.latestVersion}</strong> is available
      </span>
      <span className="update-banner__actions">
        {status.releaseUrl && (
          <a
            className="update-banner__link"
            href={status.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View release
          </a>
        )}
        <button
          type="button"
          className="update-banner__skip"
          onClick={onSkip}
          disabled={busy}
        >
          {busy ? 'Skipping…' : 'Skip this version'}
        </button>
        <button
          type="button"
          className="update-banner__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
          title="Dismiss (shows again on the next check)"
        >
          ×
        </button>
      </span>
    </div>
  )
}
