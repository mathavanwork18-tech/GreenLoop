import { useEffect, useRef, useState } from 'react'

interface SplashScreenProps {
  onFinished: () => void
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  const [phase, setPhase] = useState<'playing' | 'fading' | 'done'>('playing')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  // Phase timers: fade at 3.5s, done at 4.1s
  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase('fading'), 3500)
    const doneTimer = setTimeout(() => {
      setPhase('done')
      onFinished()
    }, 4100)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
      cancelAnimationFrame(rafRef.current)
    }
  }, [onFinished])

  // Canvas chroma-key: per-frame white background removal
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const SIZE = 320
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    function drawFrame() {
      if (!video || !canvas || !ctx) return
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, SIZE, SIZE)
        ctx.drawImage(video, 0, 0, SIZE, SIZE)

        const imageData = ctx.getImageData(0, 0, SIZE, SIZE)
        const d = imageData.data

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2]
          // Use minimum channel as brightness indicator
          const brightness = Math.min(r, g, b)
          if (brightness >= 215) {
            d[i + 3] = 0 // fully transparent (white bg)
          } else if (brightness >= 175) {
            // Smooth anti-alias edge
            d[i + 3] = Math.round(((215 - brightness) / 40) * 255)
          }
        }
        ctx.putImageData(imageData, 0, 0)
      }
      rafRef.current = requestAnimationFrame(drawFrame)
    }

    const onPlay = () => {
      cancelAnimationFrame(rafRef.current)
      drawFrame()
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('canplay', () => video.play().catch(() => {}))
    video.load()

    return () => {
      video.removeEventListener('play', onPlay)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (phase === 'done') return null

  return (
    <>
      <style>{`
        @keyframes glSplashIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes glSplashOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes glLogoAnim {
          0%   { transform: scale(0.78) translateY(8px); opacity: 0; }
          18%  { transform: scale(1.06) translateY(0);   opacity: 1; }
          80%  { transform: scale(1)    translateY(0);   opacity: 1; }
          100% { transform: scale(1.04) translateY(-4px); opacity: 0.9; }
        }
        @keyframes glTagline {
          0%   { opacity: 0; transform: translateY(14px); }
          48%  { opacity: 0; transform: translateY(14px); }
          78%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glRipple {
          0%   { transform: scale(0.4); opacity: 0.55; }
          100% { transform: scale(3.4); opacity: 0; }
        }
        @keyframes glDotPop {
          0%   { opacity: 0; transform: scale(0.3); }
          60%  { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        .gl-ripple {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          border: 1.5px solid rgba(16, 185, 129, 0.5);
          animation: glRipple 2.6s ease-out infinite;
          top: 50%;
          left: 50%;
          margin-top: -110px;
          margin-left: -110px;
          pointer-events: none;
        }
        .gl-ripple:nth-child(2) { animation-delay: 0.86s; border-color: rgba(16,185,129,0.3); }
        .gl-ripple:nth-child(3) { animation-delay: 1.72s; border-color: rgba(16,185,129,0.15); }
      `}</style>

      {/* Dark green full-screen backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'radial-gradient(ellipse at 50% 42%, #0d3825 0%, #061510 52%, #020b06 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          animation: phase === 'fading'
            ? 'glSplashOut 0.6s ease forwards'
            : 'glSplashIn 0.4s ease forwards',
        }}
      >
        {/* Centre ambient glow */}
        <div
          style={{
            position: 'absolute',
            width: '62vmin',
            height: '62vmin',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Ripple rings */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="gl-ripple" />
          <div className="gl-ripple" />
          <div className="gl-ripple" />
        </div>

        {/* Logo + tagline */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'glLogoAnim 4s ease-in-out forwards',
          }}
        >
          {/* Hidden video — source for canvas */}
          <video
            ref={videoRef}
            src="/introanimation/green logo.mp4"
            muted
            playsInline
            preload="auto"
            style={{ display: 'none' }}
          />

          {/* Canvas: renders video frames with white pixels removed */}
          <canvas
            ref={canvasRef}
            style={{
              width: 'min(58vmin, 260px)',
              height: 'min(58vmin, 260px)',
              display: 'block',
              filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.6))',
            }}
          />

          {/* Tagline */}
          <div
            style={{
              animation: 'glTagline 4s ease forwards',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(1.05rem, 4.2vmin, 1.4rem)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Green Loop
            </p>
            <p
              style={{
                margin: '5px 0 0',
                fontSize: 'clamp(0.7rem, 2.5vmin, 0.86rem)',
                color: '#34d399',
                fontWeight: 600,
                letterSpacing: '0.042em',
              }}
            >
              Give Your E-Waste a Second Life
            </p>
          </div>
        </div>

        {/* Loading dots */}
        <div
          style={{
            position: 'absolute',
            bottom: '9%',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
                opacity: 0,
                animation: `glDotPop 0.45s ease ${0.85 + i * 0.22}s forwards`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

