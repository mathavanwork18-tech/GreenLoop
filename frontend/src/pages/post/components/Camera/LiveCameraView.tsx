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

    // Check for Secure Context & mediaDevices support
    if (typeof window !== 'undefined' && !window.isSecureContext && !navigator.mediaDevices) {
      setCameraError('Live camera requires HTTPS or localhost. Use "Take Photo" or "Upload from Gallery" below.')
      setIsCameraActive(false)
      return
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser. Use "Take Photo" or "Upload from Gallery" below.')
      setIsCameraActive(false)
      return
    }

    try {
      let stream: MediaStream
      try {
        // Preferred constraints with ideal facingMode and resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
      } catch (constraintErr: any) {
        // Fallback to basic video constraint if overconstrained
        if (
          constraintErr?.name === 'OverconstrainedError' ||
          constraintErr?.name === 'ConstraintNotSatisfiedError' ||
          constraintErr?.name === 'NotFoundError'
        ) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          })
        } else {
          throw constraintErr
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playErr) {
          console.warn('[LiveCamera] Autoplay interrupted:', playErr)
        }
      }
      streamRef.current = stream
      setIsCameraActive(true)
    } catch (err: any) {
      console.error('[LiveCamera] Access error:', err)
      const errName = err?.name || ''
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Allow camera access in your browser settings, or use "Take Photo" below.')
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can take a photo or select an image from your files below.')
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setCameraError('Camera is already in use by another application. Please close it and retry.')
      } else {
        setCameraError('Camera access unavailable. You can take a photo or upload an image using the buttons below.')
      }
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
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => startCamera()}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 18px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Icon name="camera" size={15} color="#fff" />
                <span>Start Live Camera</span>
              </button>
              <label
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Icon name="camera" size={15} color="#34d399" />
                <span>Take Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
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

      {/* Choose from Gallery or Direct Device Shutter */}
      <div style={{ textAlign: 'center', marginTop: 14, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--accent)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          <Icon name="camera" size={15} color="var(--accent)" />
          <span>Take Photo (Camera)</span>
          <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-secondary, #9ca3af)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          <Icon name="image" size={15} color="var(--text-secondary, #9ca3af)" />
          <span>Upload from Gallery</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  )
}
