import { useEffect, useState } from 'react'
import { adminService } from './services/adminService'
import { useAuth } from '../../../context/AuthContext'
import Icon from '../../../components/Icon'

export default function AdminPosts() {
  const { user: currentAdmin } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadPosts = async () => {
    setLoading(true)
    const list = await adminService.getPosts()
    setPosts(list)
    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleDelete = async (postId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to moderate and delete the post "${title}"?`)) return
    if (!currentAdmin?.id) return

    setDeletingId(postId)
    const ok = await adminService.deletePost(
      { id: currentAdmin.id, name: currentAdmin.name },
      postId,
      'Admin moderation: non-compliant or hazardous material'
    )
    if (ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    }
    setDeletingId(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Posts & Marketplace Moderation
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
            Active listings across all categories. Moderate inappropriate content or non-e-waste items.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadPosts}>
          <Icon name="recycle" size={14} />
          <span>Refresh</span>
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
              <th style={{ padding: '12px 16px' }}>Listing Title</th>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Condition</th>
              <th style={{ padding: '12px 16px' }}>Price</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Seller</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                  Loading posts from Supabase...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                  No posts found in database.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                    <div style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#38bdf8' }}>{p.category}</td>
                  <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{p.condition}</td>
                  <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 700 }}>
                    {p.asking_price ? `₹${p.asking_price}` : 'Free / Donate'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: p.status === 'available' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.08)',
                        color: p.status === 'available' ? '#34d399' : '#94a3b8',
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                    {p.profiles?.full_name || 'Member'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      disabled={deletingId === p.id}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {deletingId === p.id ? 'Deleting...' : 'Delete'}
                    </button>
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
