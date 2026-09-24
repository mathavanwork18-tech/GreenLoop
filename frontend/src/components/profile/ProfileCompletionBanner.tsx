import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../Icon'

export default function ProfileCompletionBanner() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('gl_dismiss_profile_banner') === 'true'
  })

  // Only show if user is authenticated and profile is incomplete
  if (!user || user.isProfileComplete || dismissed) {
    return null
  }

  const handleDismiss = () => {
    sessionStorage.setItem('gl_dismiss_profile_banner', 'true')
    setDismissed(true)
  }

  const handleCompleteClick = () => {
    navigate('/account/edit')
  }

  return (
    <>
      <style>{`
        @keyframes profileBannerPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        @keyframes gentleShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes bannerSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <aside
        aria-label="Profile Completion Alert"
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(15, 45, 34, 0.98) 100%)',
          borderBottom: '1.5px solid rgba(16, 185, 129, 0.35)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          position: 'relative',
          zIndex: 40,
          animation: 'bannerSlideDown 0.3s ease-out',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          {/* Animated Glowing Icon */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'profileBannerPulse 2s infinite',
            }}
          >
            <Icon name="sparkles" size={17} color="#ffffff" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                }}
              >
                Profile Setup Incomplete
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Action Needed
              </span>
            </div>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.76rem',
                color: '#a7f3d0',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Set your account password & address to enable email login and unlock full community features.
            </p>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleCompleteClick}
            style={{
              background: 'linear-gradient(135deg, #10b981, #047857)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '7px 14px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span>Set Password & Finish</span>
            <Icon name="arrow-right" size={13} color="#ffffff" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#a7f3d0',
              padding: 0,
            }}
            title="Dismiss notification"
          >
            <Icon name="close" size={12} color="#a7f3d0" />
          </button>
        </div>
      </aside>
    </>
  )
}
