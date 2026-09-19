import type { RecyclingCenter } from '../../types/recyclingCenter.types'
import { calculateDistance } from '../../utils/distance'

export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false
  if (isNaN(lat) || isNaN(lng)) return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  return true
}

const LOCAL_RECYCLING_CENTERS: RecyclingCenter[] = [
  {
    id: 'rc-1',
    name: 'Dharani Recyclers',
    address: 'Lala Mahal Road, PM Samy Colony, Rathinapuri, Gandhipuram',
    city: 'Coimbatore',
    latitude: 11.0253217,
    longitude: 76.9655444,
    contact_phone: '+91 91714 50039'
  },
  {
    id: 'rc-2',
    name: 'Techazar E-cyclers (Malumichampatti)',
    address: 'Mother India Industrial Estate, Seerapalayam Link Rd, Malumichampatti',
    city: 'Coimbatore',
    latitude: 10.893136,
    longitude: 76.9854066,
    contact_phone: '+91 98402 35929'
  },
  {
    id: 'rc-3',
    name: 'Techazar E-cyclers (R.S. Puram)',
    address: '18, Sir Shanmugam Rd, near IT HUB, R.S. Puram',
    city: 'Coimbatore',
    latitude: 11.0111113,
    longitude: 76.9526682,
    contact_phone: '+91 98402 35929'
  },
  {
    id: 'rc-4',
    name: 'Green Era Recyclers',
    address: 'Sai Keerthi Industrial Estate, Bodipalayam, Seerapalayam',
    city: 'Coimbatore',
    latitude: 10.8852737,
    longitude: 76.9746545,
    contact_phone: '+91 93613 28436'
  },
  {
    id: 'rc-5',
    name: 'Pickmyscraps',
    address: 'Kurichi Round Rd, Sundarapuram, Kurichi',
    city: 'Coimbatore',
    latitude: 10.9614527,
    longitude: 76.9727046,
    contact_phone: '+91 90429 47396'
  },
  {
    id: 'rc-6',
    name: 'Cercle X',
    address: 'Infinite Cercle Pvt Ltd, Eachanari',
    city: 'Coimbatore',
    latitude: 10.9282525,
    longitude: 76.9717147,
    contact_phone: '+91 96404 96454'
  },
  {
    id: 'rc-7',
    name: 'Nothing is Waste',
    address: '25, Sastha Nagar, Seeranaickenpalayam, Kuniyamuthur',
    city: 'Coimbatore',
    latitude: 10.9553932,
    longitude: 76.9515631,
    contact_phone: '+91 77084 56778'
  },
  {
    id: 'rc-8',
    name: 'Green India Recyclers',
    address: 'Kovilpalayam Rd, Sulakkal Village, Kinathukadavu Taluk',
    city: 'Coimbatore',
    latitude: 10.7471536,
    longitude: 76.9997082,
    contact_phone: '+91 90034 91034'
  },
  {
    id: 'rc-9',
    name: 'EcoGenie',
    address: '317, Happy Homes, Green City, Kannampalayam',
    city: 'Coimbatore',
    latitude: 10.9969488,
    longitude: 77.1154819,
    contact_phone: '+91 93447 61559'
  },
  {
    id: 'rc-10',
    name: 'SMV Scrap Dealer',
    address: 'Saravanampatti-Kalapatti Rd, Balaji Nagar, Villankurichi',
    city: 'Coimbatore',
    latitude: 11.0726179,
    longitude: 77.0126264,
    contact_phone: '+91 98432 49492'
  }
]

export const recyclingCentersApi = {
  async getRecyclingCenters(userCoords?: [number, number] | null): Promise<RecyclingCenter[]> {
    return LOCAL_RECYCLING_CENTERS.map(center => {
      let distanceKm: number | undefined
      if (userCoords && isValidCoordinate(userCoords[0], userCoords[1])) {
        distanceKm = calculateDistance(userCoords[0], userCoords[1], center.latitude, center.longitude)
      }
      return {
        ...center,
        distanceKm,
      }
    })
  },

  getDirectionsUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  },

  getTelUrl(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '')
    return `tel:${cleaned}`
  },

  filterCentersByQuery(centers: RecyclingCenter[], query: string): RecyclingCenter[] {
    const q = query.trim().toLowerCase()
    if (!q) return centers

    return centers.filter(center => {
      const nameMatch = center.name.toLowerCase().includes(q)
      const addressMatch = center.address.toLowerCase().includes(q)
      const cityMatch = center.city.toLowerCase().includes(q)
      return nameMatch || addressMatch || cityMatch
    })
  }
}

export default recyclingCentersApi
