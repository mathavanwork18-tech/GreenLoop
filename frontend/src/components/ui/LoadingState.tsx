import React from 'react'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 'var(--radius-sm)',
  className = '',
  style,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div
      className="card"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <Skeleton height={140} borderRadius="var(--radius-md)" />
      <Skeleton width="70%" height={18} />
      <Skeleton width="45%" height={14} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Skeleton width="30%" height={16} />
        <Skeleton width="25%" height={28} borderRadius="var(--radius-sm)" />
      </div>
    </div>
  )
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export default function LoadingState({
  message = 'Loading Green Loop ecosystem...',
}: {
  message?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        gap: 14,
        textAlign: 'center',
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(16, 185, 129, 0.2)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
        }}
      />
      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>
        {message}
      </p>
    </div>
  )
}
