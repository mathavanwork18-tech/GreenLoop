import type { ProfileFormData, PasswordChangeFormData } from '../schemas/profileSchema'
import { MOCK_USER } from '../data/mockData'
import type { User } from '../context/AuthContext'

export interface UserSession {
  id: string
  device: string
  browser: string
  ip: string
  location: string
  lastActive: string
  isCurrent: boolean
}

const DEFAULT_SESSIONS: UserSession[] = [
  {
    id: 's1',
    device: 'Windows 11 PC (HP Pavilion)',
    browser: 'Chrome 128.0',
    ip: '106.51.240.18',
    location: 'Coimbatore, TN, India',
    lastActive: 'Active Now',
    isCurrent: true,
  },
  {
    id: 's2',
    device: 'Apple iPhone 14 Pro',
    browser: 'Safari Mobile 17.5',
    ip: '106.51.240.22',
    location: 'Coimbatore, TN, India',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 's3',
    device: 'MacBook Air M2',
    browser: 'Brave Browser',
    ip: '157.48.112.90',
    location: 'Chennai, TN, India',
    lastActive: '3 days ago',
    isCurrent: false,
  }
]

/**
 * Production-ready mock backend client service for Green Loop User Profile API.
 * Communicates with simulated endpoints:
 * - GET /api/v1/users/me
 * - PATCH /api/v1/users/me
 * - POST /api/v1/users/me/profile-image
 * - PATCH /api/v1/users/me/preferences
 * - PATCH /api/v1/users/me/privacy
 * - POST /api/v1/users/me/change-password
 * - GET /api/v1/users/me/sessions
 * - POST /api/v1/users/me/logout-sessions
 */
export const userService = {
  // GET /api/v1/users/me
  async getProfile(): Promise<User> {
    await new Promise(r => setTimeout(r, 250))
    const stored = localStorage.getItem('gl_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {}
    }
    return MOCK_USER as any
  },

  // PATCH /api/v1/users/me
  async updateProfile(formData: Partial<ProfileFormData>): Promise<User> {
    await new Promise(r => setTimeout(r, 500))

    const currentUser = await this.getProfile()
    const updated: User = {
      ...currentUser,
      name: formData.name ?? currentUser.name,
      username: formData.username ?? currentUser.username,
      email: formData.email ?? currentUser.email,
      phone: formData.phone ?? currentUser.phone,
      city: formData.city ?? currentUser.city,
      area: formData.area ?? currentUser.area,
      bio: formData.bio ?? currentUser.bio,
      avatar: formData.avatar !== undefined ? formData.avatar : currentUser.avatar,
      preferences: {
        language: formData.language || currentUser.preferences?.language || 'EN',
        preferredCategories: formData.preferredCategories || currentUser.preferences?.preferredCategories || ['Mobile', 'Laptop'],
        preferredAction: formData.preferredAction || currentUser.preferences?.preferredAction || 'Sell',
        pickupPreference: formData.pickupPreference || currentUser.preferences?.pickupPreference || 'doorstep',
        aiRecommendations: formData.aiRecommendations !== undefined ? formData.aiRecommendations : true,
        notifications: formData.notifications || currentUser.preferences?.notifications || {
          email: true,
          sms: true,
          missionReminders: true,
          pickupUpdates: true,
        }
      },
      privacy: formData.privacy || currentUser.privacy || {
        showApproximateLocation: true,
        showPhoneToVerifiedOnly: true,
        profileVisibility: 'community',
        activityVisibility: true,
        aiDataAnalysis: true,
      },
      roleProfile: formData.roleProfile || currentUser.roleProfile || {},
    }

    localStorage.setItem('gl_user', JSON.stringify(updated))
    return updated
  },

  // POST /api/v1/users/me/profile-image
  async uploadProfileImage(dataUrl: string): Promise<{ avatarUrl: string }> {
    await new Promise(r => setTimeout(r, 400))
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      throw new Error('Invalid image format provided')
    }
    return { avatarUrl: dataUrl }
  },

  // POST /api/v1/users/me/change-password
  async changePassword(payload: PasswordChangeFormData): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 600))
    if (payload.currentPassword === payload.newPassword) {
      throw new Error('New password cannot be the same as current password')
    }
    // Record password change timestamp in storage
    localStorage.setItem('gl_last_password_change', new Date().toISOString())
    return { success: true, message: 'Password updated successfully. Other active sessions notified.' }
  },

  // GET /api/v1/users/me/sessions
  async getActiveSessions(): Promise<UserSession[]> {
    await new Promise(r => setTimeout(r, 200))
    const stored = localStorage.getItem('gl_sessions')
    if (stored) {
      try { return JSON.parse(stored) } catch {}
    }
    return DEFAULT_SESSIONS
  },

  // POST /api/v1/users/me/logout-sessions
  async logoutOtherSessions(): Promise<{ success: boolean; activeSessions: UserSession[] }> {
    await new Promise(r => setTimeout(r, 450))
    const currentSessions = await this.getActiveSessions()
    const updated = currentSessions.filter(s => s.isCurrent)
    localStorage.setItem('gl_sessions', JSON.stringify(updated))
    return { success: true, activeSessions: updated }
  }
}
