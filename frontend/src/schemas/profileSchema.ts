import { z } from 'zod'

export const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username cannot exceed 30 characters')
    .regex(/^@?[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit mobile number')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{8,15}$/, 'Invalid phone number format'),
  city: z.string().min(2, 'City is required'),
  area: z.string().min(2, 'Area / Locality is required'),
  bio: z.string().max(250, 'Bio cannot exceed 250 characters').optional(),
  avatar: z.string().nullable().optional(),

  // Preferences
  language: z.enum(['EN', 'TA', 'HI', 'ML', 'KN']),
  preferredCategories: z.array(z.string()).min(1, 'Select at least one preferred category'),
  preferredAction: z.enum(['Sell', 'Donate', 'Recycle', 'Repair', 'Exchange']),
  pickupPreference: z.enum(['doorstep', 'hub_dropoff']),
  aiRecommendations: z.boolean(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    missionReminders: z.boolean(),
    pickupUpdates: z.boolean()
  }),

  // Privacy
  privacy: z.object({
    showApproximateLocation: z.boolean(),
    showPhoneToVerifiedOnly: z.boolean(),
    profileVisibility: z.enum(['public', 'community', 'private']),
    activityVisibility: z.boolean(),
    aiDataAnalysis: z.boolean()
  }),

  // Role Profile Details
  roleProfile: z.object({
    interests: z.array(z.string()).optional(),
    shopName: z.string().optional(),
    shopLogo: z.string().optional(),
    shopDescription: z.string().optional(),
    shopServices: z.array(z.string()).optional(),
    shopHours: z.string().optional(),
    shopAddress: z.string().optional(),
    shopGst: z.string().optional(),
    companyName: z.string().optional(),
    companyLogo: z.string().optional(),
    companyDescription: z.string().optional(),
    companyMaterials: z.array(z.string()).optional(),
    serviceAreas: z.array(z.string()).optional(),
    pickupFleetAvailable: z.boolean().optional(),
    tnpcbLicenseNo: z.string().optional(),
    adminLevel: z.string().optional()
  }).optional()
})

export type ProfileFormData = z.infer<typeof profileFormSchema>

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
