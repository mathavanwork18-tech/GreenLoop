import type { RecyclingCertificate } from '../../../../types/activity.types'
import Icon from '../../../../components/Icon'

interface CertificatesGalleryProps {
  certificates: RecyclingCertificate[]
  onSelectCertificate: (cert: RecyclingCertificate) => void
}

export default function CertificatesGallery({ certificates, onSelectCertificate }: CertificatesGalleryProps) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Verified Recycling Certificates ({certificates.length})</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        {certificates.map(cert => (
          <div key={cert.id} className="card" style={{ padding: 16, border: '1.5px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800 }}>
                  {cert.id}
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, margin: 0 }}>
                  {cert.device}
                </h4>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Processed by {cert.recycler}
                </p>
              </div>

              <span
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent-text)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Icon name="verified" size={12} color="var(--accent-text)" />
                <span>Certified</span>
              </span>
            </div>

            <div
              style={{
                background: 'var(--bg-surface-2)',
                padding: 10,
                borderRadius: 8,
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                margin: '10px 0'
              }}
            >
              Recovered: <strong style={{ color: 'var(--accent)' }}>{cert.materialsRecovered}</strong> • Saved <strong>{cert.co2Saved}</strong>
            </div>

            <button
              onClick={() => onSelectCertificate(cert)}
              className="btn btn-primary btn-sm btn-full"
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Icon name="certificate" size={14} color="#fff" />
              <span>View Official Digital Certificate</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
