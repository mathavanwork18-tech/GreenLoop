export interface CreatePostParams {
  title: string
  description?: string
  category?: string
  subcategory?: string
  condition?: string
  status?: string
  price?: number | null
  asking_price?: number | null
  imageUrl?: string | null
  image_url?: string | null
  brand?: string
  model?: string
  [key: string]: any
}

const DEFAULT_POSTS = [
  {
    id: 'post-1',
    user_id: 'u-101',
    title: 'Samsung Galaxy S20 (Faulty Display)',
    description: 'Motherboard 100% operational. Battery health 88%. Screen has vertical lines. Ideal for motherboard harvesting.',
    category: 'Smartphones',
    subcategory: 'Samsung',
    condition: 'For Parts',
    status: 'available',
    asking_price: 2500,
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    profiles: { full_name: 'Mathavan Raman', phone: '9876543210', city: 'Coimbatore' },
  },
  {
    id: 'post-2',
    user_id: 'u-102',
    title: 'Dell Inspiron 15 Logic Board + i5 CPU',
    description: 'Tested functional laptop board with Intel Core i5 10th Gen. Removed from damaged chassis unit.',
    category: 'Laptops',
    subcategory: 'Dell',
    condition: 'Good',
    status: 'available',
    asking_price: 4200,
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: { full_name: 'CircuitFix Repair Hub', phone: '9444284711', city: 'Chennai' },
  },
  {
    id: 'post-3',
    user_id: 'u-101',
    title: 'Old CRT Monitor & CPU for Free Dropoff / Recycling',
    description: 'Heavy legacy desktop parts. Free pickup or dropoff for authorized e-waste recycler.',
    category: 'Desktop Computers',
    subcategory: 'Legacy Hardware',
    condition: 'Non-functional',
    status: 'available',
    asking_price: null,
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    profiles: { full_name: 'Mathavan Raman', phone: '9876543210', city: 'Coimbatore' },
  },
]

function getStoredRawPosts(): any[] {
  try {
    const stored = localStorage.getItem('gl_posts_raw')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULT_POSTS
}

function saveStoredRawPosts(posts: any[]) {
  try {
    localStorage.setItem('gl_posts_raw', JSON.stringify(posts))
  } catch {}
}

/**
 * 1. Create a post
 */
export async function createPost(params: CreatePostParams) {
  let user: { id: string; name?: string; phone?: string; city?: string } = {
    id: 'u-local',
    name: 'Green Loop Member',
    phone: '9876543210',
    city: 'Coimbatore',
  }

  try {
    const stored = localStorage.getItem('gl_user')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.id) {
        user = parsed
      }
    }
  } catch {}

  const newRow = {
    id: 'post-' + Date.now(),
    user_id: user.id,
    title: params.title,
    description: params.description || '',
    category: params.category || 'Other Electronics',
    subcategory: params.subcategory || params.brand || '',
    condition: params.condition || 'Good',
    status: params.status || 'available',
    asking_price:
      params.asking_price !== undefined && params.asking_price !== null
        ? Number(params.asking_price)
        : params.price !== undefined && params.price !== null
        ? Number(params.price)
        : null,
    image_url: params.image_url || params.imageUrl || (params.images && params.images[0]) || null,
    created_at: new Date().toISOString(),
    profiles: {
      full_name: user.name || 'Green Loop Member',
      phone: user.phone || '',
      city: user.city || 'Coimbatore',
    },
  }

  const existing = getStoredRawPosts()
  const updated = [newRow, ...existing]
  saveStoredRawPosts(updated)

  return newRow
}

/**
 * 2. Fetch all e-waste listings for the home feed
 */
export async function fetchPosts(page = 0, pageSize = 30) {
  const posts = getStoredRawPosts()
  const from = page * pageSize
  return posts.slice(from, from + pageSize)
}

/**
 * 3. Realtime subscription stub (no external websocket needed)
 */
export function subscribeToNewPosts(_onNewPost: (newPost: any) => void) {
  return {
    unsubscribe: () => {},
  }
}
