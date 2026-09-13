import { supabase } from '../../utils/supabase'

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

export const pickupService = {
  /**
   * Schedules a doorstep pickup and persists to both public.pickup_requests
   * and public.disposal_logs in Supabase.
   */
  async schedulePickup(payload: PickupSchedulePayload): Promise<{
    request: PickupRecord
    disposalLog?: DisposalLogRecord
  }> {
    if (!payload.userId) {
      throw new Error('You must be logged in to schedule a pickup.')
    }

    // Ensure scheduled_date is strictly in YYYY-MM-DD format for PostgreSQL DATE column compatibility
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

    const newRequest = {
      user_id: payload.userId,
      category_id: payload.categoryId || null,
      status: 'scheduled',
      quantity: payload.quantity && payload.quantity > 0 ? payload.quantity : 1,
      description: `${payload.itemsDescription.trim() || 'E-waste devices for recycling'}${extraSlot}`,
      scheduled_date: cleanDate,
    }

    // 1. Insert into public.pickup_requests
    const { data: requestData, error: requestErr } = await supabase
      .from('pickup_requests')
      .insert(newRequest)
      .select('*')
      .single()

    if (requestErr) {
      console.error('[Green Loop] pickup_requests insert error:', requestErr)
      throw new Error(requestErr.message || 'Failed to schedule pickup request.')
    }

    // 2. Automatically log the disposal event in public.disposal_logs
    let disposalLog: DisposalLogRecord | undefined
    try {
      const { data: logData, error: logErr } = await supabase
        .from('disposal_logs')
        .insert({
          request_id: requestData.id,
          method: 'doorstep_collection',
          notes: `Partner: ${payload.partnerName || 'TNPCB Verified Recycler'} | Address: ${payload.pickupAddress}`,
        })
        .select('*')
        .single()

      if (!logErr && logData) {
        disposalLog = logData
      }
    } catch (e: any) {
      console.warn('[Green Loop] disposal_logs entry note:', e?.message)
    }

    return { request: requestData, disposalLog }
  },

  /**
   * Retrieves all pickup requests for the active user.
   */
  async getUserPickupRequests(userId: string): Promise<PickupRecord[]> {
    if (!userId) return []

    const { data, error } = await supabase
      .from('pickup_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[Green Loop] Fetching user pickup requests error:', error.message)
      return []
    }

    return data || []
  },

  /**
   * Completes a disposal action for a pickup request.
   */
  async markPickupCompleted(requestId: string, notes?: string): Promise<boolean> {
    const { error: updateErr } = await supabase
      .from('pickup_requests')
      .update({ status: 'completed' })
      .eq('id', requestId)

    if (updateErr) {
      console.error('[Green Loop] Error marking pickup completed:', updateErr.message)
      return false
    }

    // Insert completion note into disposal_logs
    await supabase.from('disposal_logs').insert({
      request_id: requestId,
      method: 'certified_recycle',
      notes: notes || 'Recycling completed and verified.',
    })

    return true
  }
}
