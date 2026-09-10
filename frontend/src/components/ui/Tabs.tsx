import React from 'react'
import Icon, { type IconName } from '../Icon'

export interface TabItem {
  id: string
  label: string
  icon?: IconName
  badge?: string | number
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'pills' | 'underline'
  className?: string
  style?: React.CSSProperties
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
  style,
}: TabsProps) {
  if (variant === 'underline') {
    return (
      <div
        className={`tabs-underline-container ${className}`}
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          gap: 20,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          ...style,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                padding: '10px 4px',
                fontSize: '0.86rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon && (
                <Icon
                  name={tab.icon}
                  size={16}
                  color={isActive ? 'var(--accent)' : 'var(--text-tertiary)'}
                />
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    background: isActive ? 'var(--accent-light)' : 'var(--bg-surface-2)',
                    color: isActive ? 'var(--accent-text)' : 'var(--text-tertiary)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={`tabs-pills-container ${className}`}
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        padding: '2px 0',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              background: isActive ? 'var(--accent)' : 'var(--bg-surface)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-full)',
              padding: '7px 16px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              boxShadow: isActive ? 'var(--shadow-accent)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.icon && (
              <Icon
                name={tab.icon}
                size={14}
                color={isActive ? '#fff' : 'var(--text-tertiary)'}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-2)',
                  color: isActive ? '#fff' : 'var(--text-tertiary)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
