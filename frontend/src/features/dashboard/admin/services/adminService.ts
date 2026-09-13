import { supabase } from '../../../../utils/supabase'

export interface AdminStats {
  totalUsers: number
  citizenCount: number
  shopCount: number
  companyCount: number
  totalPosts: number
  availablePosts: number
  totalPickups: number
  pendingPickups: number
  totalRecyclingCenters: number
  totalClaims: number
  recommendationEventsCount: number
  systemStatus: 'healthy' | 'degraded' | 'maintenance'
}

export interface AdminUserRecord {
  id: string
  full_name: string
  phone?: string
  role: string
  city: string
  address?: string
  created_at: string
}

export interface AdminAuditRecord {
  id: string
  admin_id: string
  admin_name: string
  action: string
  target_record?: string
  details?: Record<string, any>
  created_at: string
}

export const adminService = {
  /**
   * Fetches real counts and platform statistics directly from Supabase tables.
   */
  async getAdminOverviewStats(): Promise<AdminStats> {
    try {
      const [
        profilesRes,
        postsRes,
        pickupsRes,
        centersRes,
        claimsRes,
        eventsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('role', { count: 'exact' }),
        supabase.from('e_waste_posts').select('status', { count: 'exact' }),
        supabase.from('pickup_requests').select('status', { count: 'exact' }),
        supabase.from('recycling_centers').select('id', { count: 'exact', head: true }),
        supabase.from('post_claims').select('id', { count: 'exact', head: true }),
        supabase.from('recommendation_events').select('id', { count: 'exact', head: true }),
      ])

      const profiles = profilesRes.data || []
      const posts = postsRes.data || []
      const pickups = pickupsRes.data || []

      const citizenCount = profiles.filter((p) => p.role === 'citizen').length
      const shopCount = profiles.filter((p) => p.role === 'shop' || p.role === 'local_shop').length
      const companyCount = profiles.filter((p) => p.role === 'company' || p.role === 'recycler').length

      const availablePosts = posts.filter((p) => p.status === 'available').length
      const pendingPickups = pickups.filter((p) => p.status === 'scheduled' || p.status === 'pending').length

      return {
        totalUsers: profilesRes.count || profiles.length,
        citizenCount,
        shopCount,
        companyCount,
        totalPosts: postsRes.count || posts.length,
        availablePosts,
        totalPickups: pickupsRes.count || pickups.length,
        pendingPickups,
        totalRecyclingCenters: centersRes.count || 0,
        totalClaims: claimsRes.count || 0,
        recommendationEventsCount: eventsRes.count || 0,
        systemStatus: 'healthy',
      }
    } catch (err) {
      console.warn('[AdminService] Failed to load overview stats from DB:', err)
      return {
        totalUsers: 0,
        citizenCount: 0,
        shopCount: 0,
        companyCount: 0,
        totalPosts: 0,
        availablePosts: 0,
        totalPickups: 0,
        pendingPickups: 0,
        totalRecyclingCenters: 0,
        totalClaims: 0,
        recommendationEventsCount: 0,
        systemStatus: 'degraded',
      }
    }
  },

  /**
   * Fetches real user profiles with optional search and role filtering.
   */
  async getUsers(filterRole?: string, search?: string): Promise<AdminUserRecord[]> {
    try {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })

      if (filterRole && filterRole !== 'all') {
        query = query.eq('role', filterRole)
      }
      if (search && search.trim()) {
        query = query.ilike('full_name', `%${search.trim()}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('[AdminService] getUsers error:', err)
      return []
    }
  },

  /**
   * Updates a user's role securely and writes to the audit log.
   */
  async updateUserRole(
    adminUser: { id: string; name?: string },
    targetUserId: string,
    newRole: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId)

      if (error) throw error

      await this.logAdminAction(
        adminUser.id,
        adminUser.name || 'Admin',
        'user_role_change',
        `User ID: ${targetUserId}`,
        { newRole }
      )
      return true
    } catch (err) {
      console.error('[AdminService] updateUserRole error:', err)
      return false
    }
  },

  /**
   * Fetches all marketplace posts for administration & moderation.
   */
  async getPosts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('e_waste_posts')
        .select(`
          id, title, description, category, condition, status, asking_price, image_url, created_at,
          profiles:user_id (full_name, phone, city)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('[AdminService] getPosts error:', err)
      return []
    }
  },

  /**
   * Deletes a post as part of moderation and logs the action.
   */
  async deletePost(
    adminUser: { id: string; name?: string },
    postId: string,
    reason: string = 'Moderation removal'
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('e_waste_posts').delete().eq('id', postId)
      if (error) throw error

      await this.logAdminAction(
        adminUser.id,
        adminUser.name || 'Admin',
        'post_delete',
        `Post ID: ${postId}`,
        { reason }
      )
      return true
    } catch (err) {
      console.error('[AdminService] deletePost error:', err)
      return false
    }
  },

  /**
   * Fetches pickup requests for live operations management.
   */
  async getPickupRequests(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select(`
          id, scheduled_date, status, quantity, description, created_at,
          profiles:user_id (full_name, phone, city, address)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('[AdminService] getPickupRequests error:', err)
      return []
    }
  },

  /**
   * Updates status of a pickup request.
   */
  async updatePickupStatus(
    adminUser: { id: string; name?: string },
    requestId: string,
    status: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pickup_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (error) throw error

      await this.logAdminAction(
        adminUser.id,
        adminUser.name || 'Admin',
        'pickup_status_update',
        `Pickup ID: ${requestId}`,
        { newStatus: status }
      )
      return true
    } catch (err) {
      console.error('[AdminService] updatePickupStatus error:', err)
      return false
    }
  },

  /**
   * Fetches official recycling centers.
   */
  async getRecyclingCenters(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('recycling_centers')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('[AdminService] getRecyclingCenters error:', err)
      return []
    }
  },

  /**
   * Adds a new official recycling center.
   */
  async createRecyclingCenter(
    adminUser: { id: string; name?: string },
    center: {
      name: string
      city: string
      address: string
      contact_phone?: string
      latitude: number
      longitude: number
      capacity_kg?: number
    }
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('recycling_centers').insert(center).select()
      if (error) throw error

      await this.logAdminAction(
        adminUser.id,
        adminUser.name || 'Admin',
        'recycling_center_create',
        `Center: ${center.name}`,
        { centerId: data?.[0]?.id }
      )
      return true
    } catch (err) {
      console.error('[AdminService] createRecyclingCenter error:', err)
      return false
    }
  },

  /**
   * Fetches recent administrator audit logs.
   */
  async getAuditLogs(): Promise<AdminAuditRecord[]> {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return data || []
    } catch (err) {
      console.warn('[AdminService] getAuditLogs error:', err)
      return []
    }
  },

  /**
   * Records an immutable entry into the `admin_audit_logs` table.
   */
  async logAdminAction(
    adminId: string,
    adminName: string,
    action: string,
    targetRecord?: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminId,
        admin_name: adminName,
        action,
        target_record: targetRecord,
        details,
        created_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('[AdminService] Audit log write failed:', err)
    }
  },

  /**
   * Verifies live database health and table status.
   */
  async getDatabaseHealth(): Promise<Array<{ table: string; count: number; status: string }>> {
    const tables = [
      'profiles',
      'e_waste_posts',
      'pickup_requests',
      'recycling_centers',
      'post_claims',
      'post_comments',
      'post_likes',
      'waste_categories',
      'recommendation_events',
      'admin_audit_logs',
    ]

    const results = await Promise.all(
      tables.map(async (table) => {
        try {
          const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true })
          return {
            table,
            count: count || 0,
            status: error ? 'Error' : 'Operational',
          }
        } catch {
          return { table, count: 0, status: 'Unreachable' }
        }
      })
    )

    return results
  },
}
