import { useEffect, useRef, useState } from 'react'

interface SplashScreenProps {
  onFinished: () => void
}

// Video native resolution: 848 x 478
// Symmetrically cropped around optical center x=424, y=239
// Crop bounds: sx=104, sy=0, sw=640, sh=478
const CROP_X = 104
const CROP_Y = 0
const CROP_W = 640
const CROP_H = 478

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  const [phase, setPhase] = useState<'playing' | 'fading' | 'done'>('playing')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    // 4.0s full animation display, then 0.7s smooth cinematic fade out
    const fadeTimer = setTimeout(() => setPhase('fading'), 4000)
    const doneTimer = setTimeout(() => {
      setPhase('done')
      onFinished()
    }, 4700)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
      cancelAnimationFrame(rafRef.current)
    }
  }, [onFinished])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = CROP_W
    canvas.height = CROP_H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    function drawFrame() {
      if (!video || !canvas || !ctx) return
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, CROP_W, CROP_H)
        // Draw the symmetrically cropped video onto canvas maintaining 1:1 aspect ratio
        ctx.drawImage(video, CROP_X, CROP_Y, CROP_W, CROP_H, 0, 0, CROP_W, CROP_H)
        const id = ctx.getImageData(0, 0, CROP_W, CROP_H)
        const d = id.data
        // Real-time chroma-key to make white & near-white backgrounds transparent
        for (let i = 0; i < d.length; i += 4) {
          const b = Math.min(d[i], d[i + 1], d[i + 2])
          if (b >= 215) {
            d[i + 3] = 0 // completely transparent
          } else if (b >= 170) {
            // Anti-aliased smooth feathered edge
            d[i + 3] = Math.round(((215 - b) / 45) * 255)
          }
        }
        ctx.putImageData(id, 0, 0)
      }
      rafRef.current = requestAnimationFrame(drawFrame)
    }

    const onPlay = () => {
      cancelAnimationFrame(rafRef.current)
      drawFrame()
    }
    const tryPlay = () => {
      video.play().catch(() => {})
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('canplay', tryPlay)
    video.addEventListener('loadeddata', tryPlay)
    tryPlay()

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('canplay', tryPlay)
      video.removeEventListener('loadeddata', tryPlay)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (phase === 'done') return null

  const handleSkip = () => {
    setPhase('done')
    onFinished()
  }

  return (
    <>
      <style>{`
        @keyframes glIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glOut { from { opacity: 1; } to { opacity: 0; } }

        @keyframes glLogoEntry {
          0%   { transform: scale(0.65) translateY(24px); opacity: 0; filter: blur(12px); }
          32%  { transform: scale(1.06) translateY(-6px); opacity: 1; filter: blur(0);    }
          56%  { transform: scale(0.97) translateY(2px);  opacity: 1; filter: blur(0);    }
          76%  { transform: scale(1.02) translateY(0);    opacity: 1; filter: blur(0);    }
          100% { transform: scale(1)    translateY(0);    opacity: 1; filter: blur(0);    }
        }
        @keyframes glBreath {
          0%, 100% { transform: scale(1)    translateY(0); }
          50%      { transform: scale(1.03) translateY(-4px); }
        }
        @keyframes glGlowLarge {
          0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.65; transform: translate(-50%, -50%) scale(1.18); }
        }
        @keyframes glGlowCore {
          0%, 100% { opacity: 0.45; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.85; transform: translate(-50%, -50%) scale(1.25); }
        }
        @keyframes glTagFade {
          0%, 55%  { opacity: 0; transform: translateY(14px); letter-spacing: 0.16em; }
          85%, 100% { opacity: 1; transform: translateY(0); letter-spacing: 0.08em; }
        }
        @keyframes glRippleOut {
          0%   { transform: scale(0.3); opacity: 0.7; }
          100% { transform: scale(3.8); opacity: 0; }
        }
        @keyframes glShimmerPass {
          0%   { left: -100%; }
          100% { left: 140%; }
        }
        @keyframes glDotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%      { transform: translateY(-7px); opacity: 1; }
        }

        .gl-ripple {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(16, 185, 129, 0.45);
          animation: glRippleOut 3.4s ease-out infinite;
          pointer-events: none;
          top: 50%;
          left: 50%;
        }
        .gl-r1 { width: 320px; height: 320px; margin: -160px 0 0 -160px; animation-delay: 0s; }
        .gl-r2 { width: 320px; height: 320px; margin: -160px 0 0 -160px; animation-delay: 0.85s; border-color: rgba(16, 185, 129, 0.3); }
        .gl-r3 { width: 320px; height: 320px; margin: -160px 0 0 -160px; animation-delay: 1.7s;  border-color: rgba(16, 185, 129, 0.18); }
        .gl-r4 { width: 320px; height: 320px; margin: -160px 0 0 -160px; animation-delay: 2.55s; border-color: rgba(52, 211, 153, 0.1); }

        .gl-logo-container {
          animation: glLogoEntry 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards,
                     glBreath 3.4s ease-in-out 1.2s infinite;
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'radial-gradient(ellipse 90% 70% at 50% 50%, #0d3824 0%, #061912 55%, #020b07 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          animation: phase === 'fading' ? 'glOut 0.7s ease forwards' : 'glIn 0.35s ease forwards',
        }}
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: 'calc(16px + env(safe-area-inset-top, 0px))',
            right: 20,
            zIndex: 20,
            background: 'rgba(6, 25, 18, 0.6)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            color: '#a7f3d0',
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: 999,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.6)'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.25)'
            e.currentTarget.style.color = '#a7f3d0'
          }}
        >
          Skip &rarr;
        </button>

        {/* Ambient atmospheric green glow */}
        <div
          style={{
            position: 'absolute',
            width: '95vmin',
            height: '95vmin',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.08) 45%, transparent 70%)',
            top: '50%',
            left: '50%',
            animation: 'glGlowLarge 3.4s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Inner bright core mint glow */}
        <div
          style={{
            position: 'absolute',
            width: '55vmin',
            height: '55vmin',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, transparent 68%)',
            top: '50%',
            left: '50%',
            animation: 'glGlowCore 2.3s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Dynamic expanding ripple rings */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="gl-ripple gl-r1" />
          <div className="gl-ripple gl-r2" />
          <div className="gl-ripple gl-r3" />
          <div className="gl-ripple gl-r4" />
        </div>

        {/* Centered Logo & Brand Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 16px',
          }}
        >
          {/* Logo wrapper */}
          <div
            className="gl-logo-container"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Shimmer light sweep */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '35%',
                zIndex: 4,
                pointerEvents: 'none',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.22) 50%, transparent 100%)',
                animation: 'glShimmerPass 2.8s ease-in-out 1s infinite',
                borderRadius: '50%',
              }}
            />

            {/* Hidden source video */}
            <video
              ref={videoRef}
              src="/introanimation/green logo.mp4"
              muted
              playsInline
              autoPlay
              preload="auto"
              style={{ display: 'none' }}
            />

            {/* Main Chroma-Key Canvas - Large, Crisp, Centered */}
            <canvas
              ref={canvasRef}
              style={{
                width: 'min(92vw, 490px)',
                aspectRatio: '640 / 478',
                height: 'auto',
                display: 'block',
                position: 'relative',
                zIndex: 2,
                filter:
                  'drop-shadow(0 0 28px rgba(16, 185, 129, 0.9)) ' +
                  'drop-shadow(0 0 60px rgba(52, 211, 153, 0.45)) ' +
                  'drop-shadow(0 4px 18px rgba(0, 0, 0, 0.6))',
              }}
            />
          </div>

          {/* Elegant Tagline */}
          <p
            style={{
              margin: '16px 0 0',
              lineHeight: 1.2,
              fontSize: 'clamp(0.82rem, 3.1vmin, 1.05rem)',
              fontWeight: 600,
              color: '#34d399',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '0 0 16px rgba(52, 211, 153, 0.65), 0 2px 8px rgba(0, 0, 0, 0.5)',
              animation: 'glTagFade 4.2s ease forwards',
            }}
          >
            Give Your E-Waste a Second Life
          </p>
        </div>

        {/* Ambient Loading Dots at the bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '7%',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: i === 1 ? '#34d399' : '#10b981',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.9)',
                animation: `glDotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
