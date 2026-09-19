export interface CompanyStats {
  totalCollections: number
  pendingRequests: number
  processingItems: number
  completedCollections: number
  estimatedBusinessValue: number
  divertedEWasteKg: number
  co2OffsetKg: number
}

export interface CompanyCollectionRequest {
  id: string
  clientName: string
  clientPhone: string
  location: string
  quantity: number
  description: string
  scheduledDate: string
  status: 'pending' | 'accepted' | 'scheduled' | 'collected' | 'completed' | 'rejected'
  createdAt: string
}

export interface CompanyProcessingItem {
  id: string
  batchNo: string
  materialType: string
  weightKg: number
  currentStage: 'Collected' | 'Sorting' | 'Processing' | 'Reusable/Recyclable' | 'Completed'
  targetFacility: string
  lastUpdated: string
}

export interface CompanyReportSummary {
  manifestId: string
  reportingPeriod: string
  totalDivertedKg: number
  hazardousNeutralizedKg: number
  preciousMetalsRecoveredGrams: number
  complianceStatus: 'TNPCB Compliant' | 'Pending Verification'
  generatedAt: string
}

const DEFAULT_PROCESSING: CompanyProcessingItem[] = [
  {
    id: 'proc-1',
    batchNo: 'GL-BATCH-CBE01',
    materialType: 'Lithium-Ion Battery Cells (De-energized)',
    weightKg: 420,
    currentStage: 'Processing',
    targetFacility: 'Green Loop Certified Refurbishment & Smelting Hub, Coimbatore',
    lastUpdated: 'Today',
  },
  {
    id: 'proc-2',
    batchNo: 'GL-BATCH-CBE02',
    materialType: 'Motherboard Gold Finger Contact Strips',
    weightKg: 85,
    currentStage: 'Sorting',
    targetFacility: 'Green Era Recyclers, Malumichampatti',
    lastUpdated: 'Yesterday',
  },
]

export const companyService = {
  async getDashboardOverview(_companyUserId?: string): Promise<{
    stats: CompanyStats
    recentActivity: { id: string; title: string; time: string; stage: string }[]
  }> {
    return {
      stats: {
        totalCollections: 142,
        pendingRequests: 6,
        processingItems: 18,
        completedCollections: 124,
        estimatedBusinessValue: 485000,
        divertedEWasteKg: 8420,
        co2OffsetKg: 12120,
      },
      recentActivity: [
        { id: '1', title: 'Bulk IT decommissioning batch received from PSG Tech', time: 'Today', stage: 'Collected' },
        { id: '2', title: 'Hydrometallurgical extraction completed for Lot #88', time: 'Yesterday', stage: 'Completed' },
        { id: '3', title: 'Manifest dispatched to TNPCB regional office', time: '3 days ago', stage: 'Completed' },
      ],
    }
  },

  async getCollectionRequests(): Promise<CompanyCollectionRequest[]> {
    return [
      {
        id: 'cr-1',
        clientName: 'Infosys SEZ Hub, Coimbatore',
        clientPhone: '+91 98402 35929',
        location: 'Tidel Park, Civil Aerodrome Post',
        quantity: 45,
        description: 'Server blade racks & UPS backup units',
        scheduledDate: '26 Sep 2026',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      },
    ]
  },

  async getProcessingItems(): Promise<CompanyProcessingItem[]> {
    return DEFAULT_PROCESSING
  },

  async updateProcessingStage(
    itemId: string,
    newStage: CompanyProcessingItem['currentStage']
  ): Promise<boolean> {
    const item = DEFAULT_PROCESSING.find(p => p.id === itemId)
    if (item) {
      item.currentStage = newStage
    }
    return true
  },

  async getComplianceReports(): Promise<CompanyReportSummary[]> {
    return [
      {
        manifestId: 'TNPCB-EW-2026-0894',
        reportingPeriod: 'Q3 2026 (July - September)',
        totalDivertedKg: 14200,
        hazardousNeutralizedKg: 3200,
        preciousMetalsRecoveredGrams: 1850,
        complianceStatus: 'TNPCB Compliant',
        generatedAt: '2026-09-10',
      },
    ]
  },
}
