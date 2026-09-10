interface SpinnerProps {
  size?: number
  color?: string
}

export default function Spinner({ size = 20, color = 'var(--accent)' }: SpinnerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2.5px solid ${color}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block'
      }}
    />
  )
}
