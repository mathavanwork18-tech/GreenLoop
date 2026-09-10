import React from 'react'
import Icon, { type IconName } from '../Icon'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'purple'
  icon?: IconName
  size?: 'sm' | 'md'
}

export default function Badge({
  children,
  variant = 'green',
  icon,
  size = 'md',
  className = '',
  style,
  ...rest
}: BadgeProps) {
  const variantClass = `badge-${variant}`
  const iconSize = size === 'sm' ? 11 : 13

  return (
    <span
      className={`badge ${variantClass} ${className}`}
      style={{
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '0.68rem' : '0.74rem',
        ...style,
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={iconSize} color="currentColor" />}
      <span>{children}</span>
    </span>
  )
}
