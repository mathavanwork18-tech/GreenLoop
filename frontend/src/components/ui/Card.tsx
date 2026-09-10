import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  elevated?: boolean
  bordered?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Card({
  children,
  hoverable = false,
  elevated = false,
  bordered = true,
  padding = 'md',
  className = '',
  style,
  ...rest
}: CardProps) {
  const paddingStyle =
    padding === 'none'
      ? { padding: 0 }
      : padding === 'sm'
      ? { padding: '12px' }
      : padding === 'lg'
      ? { padding: '24px' }
      : { padding: '16px' }

  return (
    <div
      className={`card ${hoverable ? 'card-hover' : ''} ${className}`}
      style={{
        border: bordered ? '1px solid var(--border-color)' : 'none',
        boxShadow: elevated ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        background: elevated ? 'var(--bg-surface-2)' : 'var(--bg-surface)',
        ...paddingStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
