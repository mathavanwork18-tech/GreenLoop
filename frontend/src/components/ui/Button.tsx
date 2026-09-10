import React from 'react'
import Icon, { type IconName } from '../Icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'
  fullWidth?: boolean
  loading?: boolean
  icon?: IconName
  iconPosition?: 'left' | 'right'
  iconColor?: string
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  iconColor,
  className = '',
  style,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'ghost'
      ? 'btn-ghost'
      : variant === 'danger'
      ? 'btn-danger'
      : 'btn-ghost'

  const sizeClass =
    size === 'sm'
      ? 'btn-sm'
      : size === 'lg'
      ? 'btn-lg'
      : size === 'icon'
      ? 'btn-icon'
      : size === 'icon-sm'
      ? 'btn-icon-sm'
      : ''

  const resolvedIconColor =
    iconColor ||
    (variant === 'primary'
      ? '#ffffff'
      : variant === 'secondary'
      ? 'var(--accent-text)'
      : variant === 'danger'
      ? '#f87171'
      : 'currentColor')

  const iconSize = size === 'sm' || size === 'icon-sm' ? 14 : size === 'lg' ? 20 : 17

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled || loading}
      style={style}
      {...rest}
    >
      {loading ? (
        <span
          className="animate-spin"
          style={{
            display: 'inline-block',
            width: iconSize,
            height: iconSize,
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
          }}
        />
      ) : (
        icon && iconPosition === 'left' && <Icon name={icon} size={iconSize} color={resolvedIconColor} />
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <Icon name={icon} size={iconSize} color={resolvedIconColor} />
      )}
    </button>
  )
}
