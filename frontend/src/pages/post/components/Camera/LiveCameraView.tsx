import { useRef, useState, useEffect } from 'react'
import Icon from '../../../../components/Icon'

interface LiveCameraViewProps {
  onPhotoCaptured: (dataUrl: string) => void
  onGalleryUploaded: (dataUrl: string) => void
  isScanning: boolean
}

export default function LiveCameraView({
  onPhotoCaptured,
  onGalleryUploaded,
  isScanning
}: LiveCameraViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [flashOn, setFlashOn] = useState(false)

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera()
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      streamRef.current = stream
      setIsCameraActive(true)
    } catch {
      setCameraError('Camera access unavailable or denied. You can still choose from gallery or use presets.')
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    if (isCameraActive) {
      startCamera(nextMode)
    }
  }

  const captureLivePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        stopCamera()
        onPhotoCaptured(dataUrl)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onGalleryUploaded(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Main Viewfinder Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 320,
          background: '#091510',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          border: '1.5px solid var(--border-color)'
        }}
      >
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isCameraActive ? 'block' : 'none'
          }}
        />

        {/* Reticle Guide Lines */}
        <div
          style={{
            position: 'absolute',
            width: '75%',
            height: '75%',
            border: '2px dashed rgba(52, 211, 153, 0.6)',
            borderRadius: 16,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isScanning && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: '#10b981',
                boxShadow: '0 0 12px #10b981',
                animation: 'scanLine 1.5s ease-in-out infinite'
              }}
            />
          )}
        </div>

        {/* Non-Active Placeholder State */}
        {!isCameraActive && (
          <div style={{ textAlign: 'center', padding: 20, zIndex: 3 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(52,211,153,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}
            >
              <Icon name="camera" size={32} color="#34d399" />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px' }}>
              Real-Time Camera Scan
            </h3>
            <p style={{ color: '#a7f3d0', fontSize: '0.78rem', margin: '0 0 16px', maxWidth: 260 }}>
              Position your electronic device, battery, or component in clear lighting.
            </p>
            <button
              onClick={() => startCamera()}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 20px', fontSize: '0.82rem' }}
            >
              Start Live Camera
            </button>
          </div>
        )}

        {/* Top Camera Controls Overlay */}
        {isCameraActive && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              right: 12,
              display: 'flex',
              justifyContent: 'space-between',
              zIndex: 10
            }}
          >
            <button
              onClick={() => setFlashOn(!flashOn)}
              style={{
                background: flashOn ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.5)',
                color: flashOn ? '#000' : '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Icon name="sparkles" size={16} color={flashOn ? '#000' : '#fff'} />
            </button>

            <button
              onClick={toggleFacingMode}
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Icon name="refresh" size={16} color="#fff" />
            </button>
          </div>
        )}

        {/* Bottom Live Shutter Overlay */}
        {isCameraActive && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 20
            }}
          >
            <button
              onClick={captureLivePhoto}
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid var(--accent)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(16,185,129,0.6)'
              }}
            >
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--accent)' }} />
            </button>
          </div>
        )}
      </div>

      {cameraError && (
        <div style={{ marginTop: 8, fontSize: '0.74rem', color: '#ef4444', textAlign: 'center' }}>
          {cameraError}
        </div>
      )}

      {/* Choose from Gallery fallback button */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--accent)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Icon name="image" size={15} color="var(--accent)" />
          <span>Upload photo from device gallery</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  )
}
