export interface PickupSchedulePayload {
  userId: string
  categoryId?: number
  quantity?: number
  itemsDescription: string
  scheduledDate: string
  pickupAddress: string
  partnerName?: string
}

export interface PickupRecord {
  id: string
  user_id: string
  category_id: number | null
  status: string
  quantity: number
  description: string
  scheduled_date: string
  created_at: string
}

export interface DisposalLogRecord {
  id: string
  request_id: string
  method: string
  notes: string
}

function getStoredPickups(): PickupRecord[] {
  try {
    const raw = localStorage.getItem('gl_pickup_requests')
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveStoredPickups(pickups: PickupRecord[]) {
  try {
    localStorage.setItem('gl_pickup_requests', JSON.stringify(pickups))
  } catch {}
}

export const pickupService = {
  async schedulePickup(payload: PickupSchedulePayload): Promise<{
    request: PickupRecord
    disposalLog?: DisposalLogRecord
  }> {
    if (!payload.userId) {
      throw new Error('You must be logged in to schedule a pickup.')
    }

    let cleanDate = payload.scheduledDate || new Date().toISOString().split('T')[0]
    let extraSlot = ''
    if (cleanDate.includes('(')) {
      const parts = cleanDate.split('(')
      cleanDate = parts[0].trim()
      extraSlot = ` [Slot: ${parts[1].replace(')', '').trim()}]`
    } else if (cleanDate.includes(' ')) {
      cleanDate = cleanDate.split(' ')[0].trim()
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      cleanDate = new Date().toISOString().split('T')[0]
    }

    const requestData: PickupRecord = {
      id: 'req-' + Date.now(),
      user_id: payload.userId,
      category_id: payload.categoryId || null,
      status: 'scheduled',
      quantity: payload.quantity && payload.quantity > 0 ? payload.quantity : 1,
      description: `${payload.itemsDescription.trim() || 'E-waste devices for recycling'}${extraSlot}`,
      scheduled_date: cleanDate,
      created_at: new Date().toISOString(),
    }

    const existing = getStoredPickups()
    saveStoredPickups([requestData, ...existing])

    const disposalLog: DisposalLogRecord = {
      id: 'log-' + Date.now(),
      request_id: requestData.id,
      method: 'doorstep_collection',
      notes: `Partner: ${payload.partnerName || 'TNPCB Verified Recycler'} | Address: ${payload.pickupAddress}`,
    }

    return { request: requestData, disposalLog }
  },

  async getUserPickupRequests(userId: string): Promise<PickupRecord[]> {
    if (!userId) return []
    const all = getStoredPickups()
    return all.filter(r => r.user_id === userId)
  },

  async markPickupCompleted(requestId: string, _notes?: string): Promise<boolean> {
    const all = getStoredPickups()
    const updated = all.map(r => r.id === requestId ? { ...r, status: 'completed' } : r)
    saveStoredPickups(updated)
    return true
  }
}
