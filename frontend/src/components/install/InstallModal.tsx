import React, { useState, useEffect } from 'react'
import { usePwaInstall } from '../../context/PwaInstallContext'
import Icon from '../Icon'

export const InstallModal: React.FC = () => {
  const {
    showInstallModal,
    closeInstallModal,
    promptInstall,
    isIOS,
    isInstalled,
    isStandalone,
    installationCompleted,
    isInstallPromptAvailable,
  } = usePwaInstall()

  const [installError, setInstallError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset local state when modal visibility changes
  useEffect(() => {
    if (showInstallModal) {
      setInstallError(false)
      setIsSubmitting(false)
    }
  }, [showInstallModal])

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showInstallModal) {
        closeInstallModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showInstallModal, closeInstallModal])

  if (!showInstallModal) return null

  const handleInstallClick = async () => {
    if (isIOS) return
    setIsSubmitting(true)
    setInstallError(false)

    try {
      const outcome = await promptInstall()
      if (outcome === 'accepted') {
        // Handled by context appinstalled or outcome
      } else if (outcome === 'dismissed') {
        setInstallError(true)
      }
    } catch (err) {
      console.warn('[PWA] Installation failed:', err)
      setInstallError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenApp = () => {
    closeInstallModal(false)
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <div
      className="gl-install-overlay"
      onClick={() => closeInstallModal(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '16px',
        animation: 'glFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="gl-install-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface, #122319)',
          border: '1px solid var(--border-color, rgba(16, 185, 129, 0.3))',
          borderRadius: '24px',
          boxShadow: '0 25px 65px -10px rgba(0, 0, 0, 0.65), 0 0 30px rgba(16, 185, 129, 0.12)',
          padding: '28px 24px 22px',
          boxSizing: 'border-box',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto',
          animation: 'glCardPop 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Close Button Top-Right */}
        <button
          type="button"
          onClick={() => closeInstallModal(false)}
          aria-label="Close installation window"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            minHeight: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'var(--text-secondary, #94a3b8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            padding: 0,
          }}
        >
          <Icon name="close" size={16} color="var(--text-secondary, #94a3b8)" />
        </button>

        {/* STATE A: Already Installed or Installation Just Completed */}
        {installationCompleted || isInstalled || isStandalone ? (
          <div style={{ textAlign: 'center', padding: '12px 6px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Icon name="check" size={32} color="#10b981" />
            </div>

            <h2
              id="install-modal-title"
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
              }}
            >
              Green Loop installed
            </h2>

            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary, #94a3b8)',
                margin: '0 auto 24px',
                maxWidth: '320px',
                lineHeight: 1.5,
              }}
            >
              Green Loop is now available from your device's app launcher.
            </p>

            <button
              type="button"
              onClick={handleOpenApp}
              className="btn btn-primary"
              style={{
                width: '100%',
                minHeight: '46px',
                borderRadius: '14px',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>Open Green Loop</span>
            </button>
          </div>
        ) : isIOS ? (
          /* STATE B: iPhone / iPad Native Add to Home Screen Instructions */
          <div>
            {/* Header with App Logo */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img
                src="/icons/icon-192.png"
                alt="Green Loop App Icon"
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                  border: '1.5px solid #10b981',
                  marginBottom: '12px',
                  objectFit: 'contain',
                }}
              />
              <h2
                id="install-modal-title"
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '0 0 6px',
                  letterSpacing: '-0.02em',
                }}
              >
                Install Green Loop
              </h2>
              <p
                style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary, #94a3b8)',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                Add Green Loop to your Home Screen for faster access.
              </p>
            </div>

            {/* iOS 3-Step Guide with Professional SVG Icons */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                marginBottom: '20px',
              }}
            >
              {/* Step 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="share" size={18} color="#60a5fa" />
                </div>
                <div style={{ fontSize: '0.86rem', color: '#ffffff', lineHeight: 1.4 }}>
                  <strong style={{ color: '#60a5fa' }}>1. Tap the Share button</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    Located in Safari's bottom navigation bar
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="plus" size={18} color="#10b981" />
                </div>
                <div style={{ fontSize: '0.86rem', color: '#ffffff', lineHeight: 1.4 }}>
                  <strong style={{ color: '#10b981' }}>2. Select "Add to Home Screen"</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    Scroll down the action sheet menu
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="check" size={18} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '0.86rem', color: '#ffffff', lineHeight: 1.4 }}>
                  <strong style={{ color: '#fbbf24' }}>3. Tap "Add"</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    Top-right corner to finish installation
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => closeInstallModal(false)}
              className="btn btn-primary"
              style={{
                width: '100%',
                minHeight: '44px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        ) : installError ? (
          /* STATE C: Installation Not Completed / Dismissed State */
          <div style={{ textAlign: 'center', padding: '12px 6px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1.5px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="alert" size={28} color="#ef4444" />
            </div>

            <h2
              id="install-modal-title"
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 8px',
              }}
            >
              Installation wasn't completed
            </h2>

            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-secondary, #94a3b8)',
                margin: '0 auto 22px',
                maxWidth: '320px',
                lineHeight: 1.5,
              }}
            >
              The installation prompt was closed or dismissed. You can try again now or install later.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleInstallClick}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <Icon name="install" size={18} color="#ffffff" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={() => closeInstallModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary, #94a3b8)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  padding: '8px',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Install later
              </button>
            </div>
          </div>
        ) : (
          /* STATE D: Standard Real PWA Install UI (Desktop & Android) */
          <div>
            {/* Header: Logo, Title, Subtitle */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <img
                src="/icons/icon-192.png"
                alt="Green Loop Logo"
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                  border: '1.5px solid #10b981',
                  marginBottom: '14px',
                  objectFit: 'contain',
                }}
              />
              <h2
                id="install-modal-title"
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '0 0 6px',
                  letterSpacing: '-0.02em',
                }}
              >
                Install Green Loop
              </h2>
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary, #94a3b8)',
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                A faster, cleaner way to manage your e-waste.
              </p>
            </div>

            {/* Primary Install CTA Button */}
            <div style={{ marginBottom: '14px' }}>
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  borderRadius: '14px',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                  cursor: isSubmitting ? 'wait' : 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                aria-label="Install Green Loop application"
              >
                <Icon name="install" size={20} color="#ffffff" />
                <span>{isSubmitting ? 'Connecting…' : 'Install Green Loop'}</span>
              </button>

              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.74rem',
                  color: 'var(--text-tertiary, #64748b)',
                  marginTop: '8px',
                  letterSpacing: '0.01em',
                }}
              >
                Works across supported phones, tablets and computers.
              </div>
            </div>

            {/* If native install prompt isn't immediately detected (e.g. desktop address bar tip) */}
            {!isInstallPromptAvailable && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px dashed rgba(16, 185, 129, 0.3)',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Icon name="monitor" size={18} color="#34d399" />
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                  You can also click the <strong>Install (⨁)</strong> icon in your browser's address bar or menu.
                </div>
              </div>
            )}

            {/* Benefits Row with Professional SVG Icons (NO EMOJIS) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              {/* Benefit 1 */}
              <div
                style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="zap" size={16} color="#34d399" />
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ffffff' }}>Quick access</div>
              </div>

              {/* Benefit 2 */}
              <div
                style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="monitor" size={16} color="#60a5fa" />
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ffffff' }}>App-like experience</div>
              </div>

              {/* Benefit 3 */}
              <div
                style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(168, 85, 247, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="offline" size={16} color="#c084fc" />
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ffffff' }}>Offline features</div>
              </div>
            </div>

            {/* Secondary Footer / Dismiss */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => closeInstallModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary, #64748b)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                  minHeight: '44px',
                }}
                aria-label="Dismiss installation"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes glFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes glCardPop {
          from { transform: scale(0.94); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Mobile Bottom Sheet Layout */
        @media (max-width: 639px) {
          .gl-install-overlay {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .gl-install-card {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: 24px !important;
            border-top-right-radius: 24px !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px 20px 28px !important;
            animation: glSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        }

        @keyframes glSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default InstallModal
