import type { EcosystemPartner, PickupScheduleForm } from '../../types/map.types'
import { recyclingCentersApi } from '../recycling/recyclingCenters.api'

export const mapsApi = {
  async getPartners(): Promise<EcosystemPartner[]> {
    const centers = await recyclingCentersApi.getRecyclingCenters()
    return centers.map((rc) => ({
      id: String(rc.id),
      type: 'recycler',
      name: rc.name,
      services: ['E-Waste Dropoff', 'Collection Drive', 'Recycling Verification'],
      categories: ['Smartphones', 'Laptops', 'Batteries', 'Consumer Electronics'],
      distance: rc.distanceKm || 1.2,
      rating: 4.8,
      reviews: 24,
      open: true,
      hours: '9:00 AM - 6:00 PM',
      verified: true,
      address: `${rc.address}, ${rc.city}`,
      lat: Number(rc.latitude),
      lng: Number(rc.longitude),
      icon: 'recycle',
      phone: rc.contact_phone || undefined,
    }))
  },

  async schedulePickup(form: PickupScheduleForm): Promise<{ success: boolean; pickupId: string; message: string }> {
    const pickupId = 'PK-' + Date.now().toString().slice(-6)

    return {
      success: true,
      pickupId,
      message: `Pickup confirmed with ${form.facilityName} for ${form.date} (${form.timeSlot}). +25 Green Coins credited!`,
    }
  },

  async scheduleBulkDrive(institutionName: string, date: string): Promise<{ success: boolean; driveId: string; message: string }> {
    const driveId = 'DRV-' + Date.now().toString().slice(-6)

    return {
      success: true,
      driveId,
      message: `Institutional e-waste collection drive registered for ${institutionName} on ${date}. +100 Green Coins credited!`,
    }
  },
}
