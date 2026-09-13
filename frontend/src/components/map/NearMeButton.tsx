import Icon from '../Icon'

interface NearMeButtonProps {
  onClick: () => void
  loading?: boolean
}

export default function NearMeButton({ onClick, loading }: NearMeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="gl-near-me-btn"
      aria-label="Center map on current location"
    >
      {loading ? (
        <Icon name="refresh" size={15} color="currentColor" />
      ) : (
        <Icon name="location-pin" size={15} color="currentColor" />
      )}
      <span>Near Me</span>
    </button>
  )
}
