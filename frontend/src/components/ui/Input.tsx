import React, { forwardRef, useId } from 'react'
import Icon, { type IconName } from '../Icon'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  prefixIcon?: IconName
  suffixIcon?: IconName
  prefixText?: string
  suffixText?: string
  containerStyle?: React.CSSProperties
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      prefixIcon,
      suffixIcon,
      prefixText,
      suffixText,
      containerStyle,
      id,
      className = '',
      style,
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    return (
      <div className="input-group" style={containerStyle}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {rest.required && <span style={{ color: '#f87171', marginLeft: 4 }}>*</span>}
          </label>
        )}

        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          {prefixIcon && (
            <div
              style={{
                position: 'absolute',
                left: 12,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                color: error ? '#f87171' : 'var(--text-tertiary)',
              }}
            >
              <Icon name={prefixIcon} size={18} color="currentColor" />
            </div>
          )}

          {prefixText && !prefixIcon && (
            <div
              style={{
                position: 'absolute',
                left: 12,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: error ? '#f87171' : 'var(--text-secondary)',
              }}
            >
              {prefixText}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={`input ${className}`}
            style={{
              paddingLeft: prefixIcon || prefixText ? 38 : undefined,
              paddingRight: suffixIcon || suffixText ? 38 : undefined,
              borderColor: error ? '#f87171' : undefined,
              boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : undefined,
              ...style,
            }}
            {...rest}
          />

          {suffixIcon && (
            <div
              style={{
                position: 'absolute',
                right: 12,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                color: error ? '#f87171' : 'var(--text-tertiary)',
              }}
            >
              <Icon name={suffixIcon} size={18} color="currentColor" />
            </div>
          )}

          {suffixText && !suffixIcon && (
            <div
              style={{
                position: 'absolute',
                right: 12,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
              }}
            >
              {suffixText}
            </div>
          )}
        </div>

        {error && (
          <div id={errorId} className="input-error" role="alert">
            {error}
          </div>
        )}

        {!error && hint && (
          <div id={hintId} style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            {hint}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
