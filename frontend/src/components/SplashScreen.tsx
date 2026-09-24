import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onFinished: () => void
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  const [phase, setPhase] = useState<'playing' | 'fading' | 'done'>('playing')

  useEffect(() => {
    // Start fade-out at 3.5s, fully hidden at ~4.1s total
    const fadeTimer = setTimeout(() => setPhase('fading'), 3500)
    const doneTimer = setTimeout(() => {
      setPhase('done')
      onFinished()
    }, 4100)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onFinished])

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
        @keyframes glLogoScale {
          0%   { transform: scale(0.82); opacity: 0; }
          20%  { transform: scale(1.05); opacity: 1; }
          80%  { transform: scale(1);    opacity: 1; }
          100% { transform: scale(1.08); opacity: 0.8; }
        }
        @keyframes glTagline {
          0%   { opacity: 0; transform: translateY(12px); }
          45%  { opacity: 0; transform: translateY(12px); }
          75%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glRipple {
          0%   { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(3.2); opacity: 0; }
        }
        @keyframes glDotIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        .gl-splash-ripple {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 1.5px solid rgba(16, 185, 129, 0.45);
          animation: glRipple 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          top: 50%;
          left: 50%;
          margin-top: -100px;
          margin-left: -100px;
          pointer-events: none;
        }
        .gl-splash-ripple:nth-child(2) {
          animation-delay: 0.8s;
          border-color: rgba(16, 185, 129, 0.28);
        }
        .gl-splash-ripple:nth-child(3) {
          animation-delay: 1.6s;
          border-color: rgba(16, 185, 129, 0.14);
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'radial-gradient(ellipse at 50% 44%, #0c3322 0%, #06180f 55%, #020c06 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          animation: phase === 'fading'
            ? 'glSplashOut 0.6s ease forwards'
            : 'glSplashIn 0.35s ease forwards',
        }}
      >
        {/* Centre ambient glow */}
        <div
          style={{
            position: 'absolute',
            width: '55vmin',
            height: '55vmin',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 72%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Ripple rings */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="gl-splash-ripple" />
          <div className="gl-splash-ripple" />
          <div className="gl-splash-ripple" />
        </div>

        {/* Video + tagline */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'glLogoScale 4s ease-in-out forwards',
          }}
        >
          {/*
            mix-blend-mode: screen makes white/light areas transparent
            on the dark background — the green logo content will glow.
          */}
          <div
            style={{
              width: 'min(58vmin, 270px)',
              height: 'min(58vmin, 270px)',
              overflow: 'hidden',
              mixBlendMode: 'screen',
              borderRadius: '24px',
            }}
          >
            <video
              src="/introanimation/green logo.mp4"
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          {/* Tagline */}
          <div
            style={{
              animation: 'glTagline 4s ease forwards',
              textAlign: 'center',
              marginTop: 18,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(1.05rem, 4.2vmin, 1.42rem)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
              }}
            >
              Green Loop
            </p>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 'clamp(0.72rem, 2.6vmin, 0.88rem)',
                color: '#34d399',
                fontWeight: 600,
                letterSpacing: '0.045em',
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
            gap: 9,
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
                animation: `glDotIn 0.4s ease ${0.9 + i * 0.22}s forwards`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
