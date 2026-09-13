import { useState, useEffect } from 'react'
import Icon from './Icon'
import { useAuth } from '../context/AuthContext'
import { postsApi } from '../services/posts/posts.api'
import { interactionsApi, type PostCommentItem } from '../services/interactions/interactions.api'

export interface PostItem {
  id: string
  title: string
  category: string
  brand: string
  model: string
  condition: string
  purpose: string
  price: number | null
  negotiable?: boolean
  description: string
  location: string
  distance: number
  seller: { name: string; rating: number; verified: boolean; avatar: string | null }
  images: string[]
  likes: number
  comments: number
  recommended?: boolean
  createdAt: string
  aiAnalysis?: {
    confidence: string
    recommendation: string
    materialBreakdown?: string
  }
}

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  onLike,
  isLiked,
  onSave,
  isSaved
}: {
  post: PostItem | null
  isOpen: boolean
  onClose: () => void
  onLike?: () => void
  isLiked?: boolean
  onSave?: () => void
  isSaved?: boolean
}) {
  const { user } = useAuth()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ sender: 'me' | 'them'; text: string; time: string }[]>([
    { sender: 'them', text: 'Hi there! Feel free to ask any questions regarding this device condition or pickup.', time: '10:30 AM' }
  ])
  const [newComment, setNewComment] = useState('')
  const [commentsList, setCommentsList] = useState<PostCommentItem[]>([])
  const [claiming, setClaiming] = useState(false)
  const [claimStatus, setClaimStatus] = useState<string | null>(null)

  useEffect(() => {
    if (post?.id && isOpen) {
      interactionsApi.getComments(post.id).then(setCommentsList)
      if (user?.id) {
        interactionsApi.getPostClaim(post.id, user.id).then((c: any) => {
          if (c) setClaimStatus(c.status)
        })
      }
    }
  }, [post?.id, isOpen, user?.id])

  if (!isOpen || !post) return null

  const isOwner = (user?.name && post.seller.name.toLowerCase() === user.name.toLowerCase()) || user?.role === 'ADMIN'

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This will remove it from Marketplace, Map, and your profile.')) {
      return
    }
    setDeleting(true)
    try {
      await postsApi.deletePost(post.id)
      onClose()
    } catch {
      alert('Failed to delete post.')
    } finally {
      setDeleting(false)
    }
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    const msg = { sender: 'me' as const, text: chatInput, time: 'Just now' }
    setChatMessages(prev => [...prev, msg])
    setChatInput('')

    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        sender: 'them',
        text: `Thanks for your interest in ${post.title}! I am available for meetup or pickup at ${post.location}.`,
        time: 'Just now'
      }])
    }, 1000)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    if (!user?.id) {
      alert('Please sign in to comment.')
      return
    }
    try {
      const added = await interactionsApi.addComment(post.id, user.id, newComment)
      setCommentsList(prev => [...prev, added])
      setNewComment('')
    } catch (err: any) {
      alert(err.message || 'Could not post comment.')
    }
  }

  const handleClaimPost = async () => {
    if (!user?.id) {
      alert('Please sign in to claim this listing.')
      return
    }
    setClaiming(true)
    try {
      const res = await interactionsApi.claimPost(post.id, user.id)
      setClaimStatus(res.claim?.status || 'pending')
      alert('Claim submitted successfully! The seller has been notified.')
    } catch (err: any) {
      alert(err.message || 'Could not submit claim.')
    } finally {
      setClaiming(false)
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 105 }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '94%',
        maxWidth: 520,
        maxHeight: '92vh',
        overflowY: 'auto',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 110,
        padding: '0 0 20px',
        animation: 'scale-in 0.2s ease',
      }}>
        {/* Top bar */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'var(--bg-surface)',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'var(--accent-light)',
              color: 'var(--accent-text)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {post.purpose.toUpperCase()}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Item Details
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-2)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <Icon name="close" size={14} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Media Carousel */}
        <div style={{ position: 'relative', background: '#000', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={post.images[activeImageIndex] || post.images[0]}
            alt={post.title}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80'
            }}
          />
          {post.images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: 12,
              display: 'flex',
              gap: 6
            }}>
              {post.images.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  style={{
                    width: i === activeImageIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === activeImageIndex ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Container */}
        <div style={{ padding: '16px 20px' }}>
          {/* Title & Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{post.title}</h2>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <span className="badge badge-accent">{post.category}</span>
                <span className="badge badge-gray">{post.condition} Condition</span>
                {post.negotiable && <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Negotiable</span>}
              </div>
            </div>
            {post.price !== null && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent)' }}>
                  ₹{post.price.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Estimated AI Value</div>
              </div>
            )}
          </div>

          {/* Location & Seller Info Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-md)',
            margin: '14px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar avatar-md" style={{ background: 'var(--accent-light)' }}>
                {post.seller.name[0]}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{post.seller.name}</span>
                  {post.seller.verified && <Icon name="verified" size={13} color="var(--accent)" />}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon name="star" size={11} color="#f59e0b" />
                    <span>{post.seller.rating}</span>
                  </div>
                  <span>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon name="location-pin" size={12} color="var(--text-tertiary)" />
                    <span>{post.location} ({post.distance} km)</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowChat(!showChat)}
              style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Icon name="comment" size={13} color="#fff" />
              <span>Chat</span>
            </button>
          </div>

          {/* In-app Chat Drawer / Expandable */}
          {showChat && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 12,
              marginBottom: 16,
              animation: 'scale-in 0.2s ease'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Direct Message with {post.seller.name}</span>
                <span style={{ color: 'var(--accent)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="shield" size={12} color="var(--accent)" />
                  <span>Secure In-App Chat</span>
                </span>
              </div>
              <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, padding: 6 }}>
                {chatMessages.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.sender === 'me' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'me' ? 'var(--accent)' : 'var(--bg-surface-2)',
                    color: m.sender === 'me' ? '#fff' : 'var(--text-primary)',
                    padding: '8px 12px',
                    borderRadius: 12,
                    fontSize: '0.8rem',
                    maxWidth: '85%'
                  }}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="Type a message or price offer..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendChat() }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface-2)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSendChat}
                  style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px' }}
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* AI Circular Analysis Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
            border: '1px solid var(--accent-light)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Icon name="sparkles" size={14} color="var(--accent)" />
              <strong style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>AI Circular Recommendation</strong>
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>
                96% Match
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {post.purpose === 'Sell' && 'Valuable functional device with strong resale demand. Keeping this device in circulation prevents e-waste landfill accumulation.'}
              {post.purpose === 'Recycle' && 'Certified hazardous component recovery recommended. Rare earths, copper, and precious metals will be extracted safely.'}
              {post.purpose === 'Donate' && 'Perfect candidate for community digital inclusion programs. Provides digital access to underserved students.'}
              {post.purpose === 'Repair' && 'Minor component repair will extend this unit life by 24+ months at 20% of new replacement cost.'}
              {post.purpose === 'Exchange' && 'Eligible for circular trade-in bonus (+50 Green Coins).'}
            </p>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Description</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{post.description}</p>
          </div>

          {/* Public Comments */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              Questions & Comments ({commentsList.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {commentsList.map((c, i) => (
                <div key={i} style={{ background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{c.user}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{c.time}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{c.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Ask a public question..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddComment() }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-2)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleAddComment}
                style={{ fontSize: '0.78rem' }}
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}>
          <button
            onClick={onLike}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-2)',
              cursor: 'pointer',
              color: isLiked ? '#ef4444' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Icon name="heart" size={16} color={isLiked ? '#ef4444' : 'var(--text-secondary)'} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          <button
            onClick={onSave}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-2)',
              cursor: 'pointer',
              color: isSaved ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Icon name="certificate" size={16} color={isSaved ? 'var(--accent)' : 'var(--text-secondary)'} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          {isOwner ? (
            <button
              className="btn btn-secondary"
              onClick={handleDeletePost}
              disabled={deleting}
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Icon name="trash" size={15} color="#b91c1c" />
              <span>{deleting ? 'Deleting...' : 'Delete Listing'}</span>
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={claiming || claimStatus === 'pending' || claimStatus === 'approved'}
              onClick={handleClaimPost}
              style={{
                flex: 1,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: claimStatus ? '#059669' : undefined,
              }}
            >
              {claiming ? (
                <span>Submitting Claim...</span>
              ) : claimStatus === 'approved' ? (
                <><Icon name="check" size={16} color="#fff" /><span>Claim Approved</span></>
              ) : claimStatus === 'pending' ? (
                <><Icon name="check" size={16} color="#fff" /><span>Claim Pending</span></>
              ) : post.purpose === 'Sell' ? (
                <><Icon name="coin" size={16} color="#fff" /><span>Claim & Make Offer</span></>
              ) : post.purpose === 'Recycle' ? (
                <><Icon name="pickup" size={16} color="#fff" /><span>Claim for Recycling</span></>
              ) : post.purpose === 'Donate' ? (
                <><Icon name="gift" size={16} color="#fff" /><span>Claim Donation</span></>
              ) : (
                <><Icon name="refresh" size={16} color="#fff" /><span>Claim Device</span></>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
