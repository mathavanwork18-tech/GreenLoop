import Icon from './Icon'

interface CertificateData {
  id: string
  title: string
  device: string
  serialNo?: string
  recycler: string
  date: string
  materialsRecovered: string
  co2Saved: string
  greenCoinsAwarded: number
  verifier: string
  qrCodeUrl?: string
}

export default function CertificateModal({
  certificate,
  onClose
}: {
  certificate: CertificateData | null
  onClose: () => void
}) {
  if (!certificate) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 110 }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 480,
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 120,
        padding: 24,
        animation: 'scale-in 0.2s ease',
      }}>
        {/* Certificate Card Design */}
        <div style={{
          border: '2px solid var(--accent)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%)',
          position: 'relative'
        }}>
          {/* Top Seal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="/logo.png"
                alt="Green Loop"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  objectFit: 'contain',
                  backgroundColor: '#ffffff',
                  padding: 2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>GREEN LOOP</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700 }}>CIRCULAR E-WASTE INITIATIVE</div>
              </div>
            </div>
            <div style={{
              background: 'var(--accent-light)',
              color: 'var(--accent-text)',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Icon name="verified" size={12} color="var(--accent-text)" />
              <span>VERIFIED ECO-ACTION</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '14px 0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>
              Digital Recycling Certificate
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Certificate ID: <strong style={{ color: 'var(--accent)' }}>{certificate.id}</strong>
            </p>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 14,
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            lineHeight: 1.6,
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Item Processed:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{certificate.device}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Certified Recycler:</span>
              <strong style={{ color: 'var(--accent)' }}>{certificate.recycler}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Processing Date:</span>
              <span style={{ fontWeight: 600 }}>{certificate.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Materials Recovered:</span>
              <span style={{ fontWeight: 600, color: '#059669' }}>{certificate.materialsRecovered}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>CO₂ Avoided:</span>
              <span style={{ fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="leaf" size={13} color="#10b981" />
                <span>{certificate.co2Saved}</span>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Green Coins Awarded:</span>
              <span style={{ fontWeight: 800, color: 'var(--coin-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="coin" size={14} color="var(--coin-color)" />
                <span>+{certificate.greenCoinsAwarded}</span>
              </span>
            </div>
          </div>

          {/* QR Code & Sign */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 54,
                height: 54,
                background: '#000',
                borderRadius: 6,
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                textAlign: 'center'
              }}>
                [QR VERIFIED]
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                Scan to verify on<br />TNPCB Circular Registry
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', fontStyle: 'italic' }}>GreenCycle TN-Auth</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Authorized Environmental Officer</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            className="btn btn-secondary"
            onClick={handlePrint}
            style={{ flex: 1, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Icon name="print" size={15} color="var(--text-primary)" />
            <span>Download / Print</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Green Loop Recycling Certificate',
                  text: `I just recycled my ${certificate.device} and prevented ${certificate.co2Saved} of CO2 via Green Loop!`,
                  url: window.location.href,
                }).catch(() => {})
              } else {
                alert('Certificate link copied to clipboard!')
              }
            }}
            style={{ flex: 1, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Icon name="share" size={15} color="#fff" />
            <span>Share Impact</span>
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '8px',
            fontSize: '0.82rem',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'none',
            border: 'none'
          }}
        >
          Close
        </button>
      </div>
    </>
  )
}
