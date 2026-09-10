import { useState } from 'react'
import Icon from '../../components/Icon'
import { Card, Badge, Button, Input } from '../../components/ui'

const FAQS = [
  {
    q: 'How are Green Coins calculated for recycling?',
    a: 'Green Coins are awarded based on verified item weight, hazardous status (e.g. Li-ion battery safe disposal), and device completeness. Coins can be redeemed for store discounts or tree-planting certificates.',
  },
  {
    q: 'How do I obtain an official TNPCB recycling certificate?',
    a: 'Once an authorized recycling partner collects and weighs your e-waste, a verified serial-numbered digital certificate with QR validation is automatically generated in your Activity tab.',
  },
  {
    q: 'What happens to devices with swollen batteries?',
    a: 'Swollen batteries are classified as hazardous Class-9 dangerous goods. They cannot be resold or repaired. Green Loop coordinates specialized fire-safe thermal pickup directly to authorized smelters.',
  },
]

export default function SupportPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !message) return
    setSubmitted(true)
  }

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 24px)', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          Support & Compliance Grievance Desk
        </h1>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
          24/7 Citizen helpline, hazardous battery protocols, and ticket tracking
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* Nodal Officer Contact Card */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Badge variant="green" size="sm">
              TNPCB Verified
            </Badge>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Emergency Hazardous Dispatch Helpline
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 14px' }}>
            For battery thermal leakage, delayed authorized collection, or enterprise compliance audits, contact our specialized nodal grievance officers.
          </p>

          <div
            style={{
              padding: '12px 14px',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: 'var(--accent-text)',
              fontWeight: 700,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div>📞 Toll-Free Helpline: <strong>1800-425-1100</strong> (Mon–Sat 9AM–7PM)</div>
            <div>✉️ Compliance Desk: <strong>compliance@greenloop.eco</strong></div>
          </div>
        </Card>

        {/* Support Ticket Submission */}
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
            Submit Support Request
          </h3>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Icon name="check" size={28} color="var(--accent)" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Ticket #GL-SUP-{Date.now().toString().slice(-4)} Received!
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, maxWidth: 360, margin: '4px auto 16px' }}>
                Our compliance officer will review your request and reach out within 4 business hours.
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)}>
                Submit Another Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Issue Subject *"
                placeholder="e.g. Swollen battery pickup question / Certificate reissue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <div className="input-group">
                <label className="input-label">Detailed Description *</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Describe your issue or question in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md">
                Submit Support Request
              </Button>
            </form>
          )}
        </Card>

        {/* FAQs Accordion */}
        <Card>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
            Frequently Asked Questions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, i) => {
              const isExpanded = expandedFaq === i
              return (
                <div
                  key={i}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : i)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-surface-2)',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{faq.q}</span>
                    <span>{isExpanded ? '−' : '+'}</span>
                  </button>
                  {isExpanded && (
                    <div style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, background: 'var(--bg-surface)' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
