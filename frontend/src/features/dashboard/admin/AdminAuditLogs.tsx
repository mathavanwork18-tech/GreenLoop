import { useEffect, useState } from 'react'
import { adminService, type AdminAuditRecord } from './services/adminService'
import Icon from '../../../components/Icon'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AdminAuditRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadLogs = async () => {
    setLoading(true)
    const list = await adminService.getAuditLogs()
    setLogs(list)
    setLoading(false)
  }

  useEffect(() => {
    loadLogs()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Security & Administrative Audit Logs
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
            Immutable chronological record of administrator interventions, role changes, and moderation.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadLogs}>
          <Icon name="recycle" size={14} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
              <th style={{ padding: '12px 16px' }}>Timestamp</th>
              <th style={{ padding: '12px 16px' }}>Admin User</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
              <th style={{ padding: '12px 16px' }}>Target Record</th>
              <th style={{ padding: '12px 16px' }}>Payload Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                  Loading audit logs from Supabase...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                  No audit records logged yet. Action events are captured on every role change, moderation, and broadcast.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1' }}>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.78rem' }}>
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                    {log.admin_name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>
                    {log.target_record || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {JSON.stringify(log.details || {})}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
