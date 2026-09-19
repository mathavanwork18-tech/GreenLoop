export interface ShopSummaryStats {
  pendingRequests: number
  inventoryItems: number
  completedCollections: number
  estimatedValue: number
}

export interface ShopPickupItem {
  id: string
  userId: string
  customerName: string
  customerPhone: string
  customerCity: string
  itemsDescription: string
  quantity: number
  status: 'pending' | 'accepted' | 'scheduled' | 'collected' | 'completed' | 'rejected'
  scheduledDate: string
  createdAt: string
}

export interface ShopInventoryItem {
  id: string
  title: string
  category: string
  subcategory?: string
  condition: string
  status: 'Received' | 'Sorting' | 'Ready for Resale' | 'Ready for Recycling' | 'Processed'
  estimatedValue: number
  source: string
  createdAt: string
}

export interface ShopTransactionItem {
  id: string
  itemTitle: string
  customerName: string
  estimatedValue: number
  offeredValue: number
  status: 'Completed' | 'Pending' | 'Cancelled'
  date: string
}

export interface ShopAnalyticsData {
  totalCollections: number
  totalItems: number
  completedPickups: number
  pendingPickups: number
  estimatedValue: number
  totalWeightKg: number
  categoryBreakdown: { category: string; count: number; percentage: number }[]
}

const DEFAULT_PICKUPS: ShopPickupItem[] = [
  {
    id: 'req-1',
    userId: 'u-101',
    customerName: 'Mathavan Raman',
    customerPhone: '+91 98765 43210',
    customerCity: 'Coimbatore',
    itemsDescription: '2 Old Android Phones + 1 Laptop Charger',
    quantity: 3,
    status: 'pending',
    scheduledDate: 'Tomorrow, 2:00 PM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req-2',
    userId: 'u-103',
    customerName: 'Priya Sundaram',
    customerPhone: '+91 94441 23456',
    customerCity: 'RS Puram, Coimbatore',
    itemsDescription: 'Dell Desktop Tower (motherboard defect)',
    quantity: 1,
    status: 'accepted',
    scheduledDate: '24 Sep, 11:00 AM',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

const DEFAULT_INVENTORY: ShopInventoryItem[] = [
  {
    id: 'inv-1',
    title: 'Samsung S20 Motherboard & Camera Module',
    category: 'Smartphones',
    subcategory: 'Samsung',
    condition: 'Working Component',
    status: 'Ready for Resale',
    estimatedValue: 2500,
    source: 'Community Drop-off',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    title: 'Dell Inspiron Logic Board',
    category: 'Laptops',
    subcategory: 'Dell',
    condition: 'Good',
    status: 'Sorting',
    estimatedValue: 4200,
    source: 'Doorstep Pickup',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const shopService = {
  async getDashboardOverview(_shopUserId?: string): Promise<{
    stats: ShopSummaryStats
    recentRequests: ShopPickupItem[]
    recentActivity: { id: string; title: string; time: string; type: string }[]
  }> {
    return {
      stats: {
        pendingRequests: 3,
        inventoryItems: 14,
        completedCollections: 28,
        estimatedValue: 46500,
      },
      recentRequests: DEFAULT_PICKUPS,
      recentActivity: [
        { id: '1', title: 'Received 2 smartphones from Mathavan Raman', time: '10 mins ago', type: 'collection' },
        { id: '2', title: 'Sold laptop RAM component for ₹1,200', time: '2 hours ago', type: 'resale' },
        { id: '3', title: 'Dispatched bulk PCB scrap to Green Era Recyclers', time: 'Yesterday', type: 'recycling' },
      ],
    }
  },

  async getPickupRequests(_limit: number = 50): Promise<ShopPickupItem[]> {
    return DEFAULT_PICKUPS
  },

  async updatePickupRequestStatus(
    requestId: string,
    newStatus: 'pending' | 'accepted' | 'scheduled' | 'collected' | 'completed' | 'rejected'
  ): Promise<boolean> {
    const item = DEFAULT_PICKUPS.find(r => r.id === requestId)
    if (item) {
      item.status = newStatus
    }
    return true
  },

  async getInventory(): Promise<ShopInventoryItem[]> {
    return DEFAULT_INVENTORY
  },

  async getTransactions(): Promise<ShopTransactionItem[]> {
    return [
      {
        id: 'tx-1',
        itemTitle: 'Samsung S20 Logic Board Purchase',
        customerName: 'Mathavan Raman',
        estimatedValue: 2500,
        offeredValue: 2300,
        status: 'Completed',
        date: 'Today',
      },
      {
        id: 'tx-2',
        itemTitle: 'Desktop PC Scrap Collection',
        customerName: 'Priya Sundaram',
        estimatedValue: 1800,
        offeredValue: 1800,
        status: 'Pending',
        date: 'Yesterday',
      },
    ]
  },

  async getAnalytics(): Promise<ShopAnalyticsData> {
    return {
      totalCollections: 32,
      totalItems: 48,
      completedPickups: 28,
      pendingPickups: 3,
      estimatedValue: 46500,
      totalWeightKg: 134,
      categoryBreakdown: [
        { category: 'Smartphones', count: 18, percentage: 38 },
        { category: 'Laptops', count: 14, percentage: 29 },
        { category: 'Desktops', count: 9, percentage: 19 },
        { category: 'Accessories', count: 7, percentage: 14 },
      ],
    }
  },
}
