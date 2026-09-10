import type { EcosystemPartner } from '../../types/map.types'
import type { PickupScheduleForm } from '../../types/map.types'
import { MOCK_MAP_PARTNERS } from '../../data/mockData'

export const mapsApi = {
  async getPartners(): Promise<EcosystemPartner[]> {
    await new Promise(r => setTimeout(r, 200))
    return MOCK_MAP_PARTNERS as unknown as EcosystemPartner[]
  },

  async schedulePickup(form: PickupScheduleForm): Promise<{ success: boolean; pickupId: string; message: string }> {
    await new Promise(r => setTimeout(r, 600))
    const pickupId = 'PK-' + Date.now().toString().slice(-6)
    return {
      success: true,
      pickupId,
      message: `Pickup confirmed with ${form.facilityName} for ${form.date} (${form.timeSlot}). +25 Green Coins credited!`
    }
  },

  async scheduleBulkDrive(institutionName: string, date: string): Promise<{ success: boolean; driveId: string; message: string }> {
    await new Promise(r => setTimeout(r, 700))
    const driveId = 'DRV-' + Date.now().toString().slice(-6)
    return {
      success: true,
      driveId,
      message: `Institutional e-waste collection drive registered for ${institutionName} on ${date}. +100 Green Coins credited!`
    }
  }
}
