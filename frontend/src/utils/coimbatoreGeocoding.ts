export interface LatLng {
  lat: number
  lng: number
}

export const COIMBATORE_LOCALITIES: Record<string, LatLng> = {
  'gandhipuram': { lat: 11.0168, lng: 76.9678 },
  'rs puram': { lat: 11.0088, lng: 76.9482 },
  'r.s. puram': { lat: 11.0088, lng: 76.9482 },
  'peelamedu': { lat: 11.0264, lng: 77.0055 },
  'saibaba colony': { lat: 11.0275, lng: 76.9450 },
  'saravanampatti': { lat: 11.0827, lng: 76.9967 },
  'singanallur': { lat: 11.0003, lng: 77.0227 },
  'ganapathy': { lat: 11.0407, lng: 76.9806 },
  'ukkadam': { lat: 10.9897, lng: 76.9602 },
  'kuniyamuthur': { lat: 10.9575, lng: 76.9628 },
  'ramanathapuram': { lat: 10.9945, lng: 76.9854 },
  'hopes': { lat: 11.0242, lng: 77.0189 },
  'hopes college': { lat: 11.0242, lng: 77.0189 },
  'thudiyalur': { lat: 11.0804, lng: 76.9400 },
  'kovaipudur': { lat: 10.9388, lng: 76.9384 },
  'vadavalli': { lat: 11.0215, lng: 76.9022 },
  'sulur': { lat: 11.0248, lng: 77.1264 },
  'perur': { lat: 10.9708, lng: 76.9149 },
  'ondipudur': { lat: 11.0033, lng: 77.0425 },
  'podanur': { lat: 10.9632, lng: 76.9840 },
  'kalapatti': { lat: 11.0716, lng: 77.0347 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'town hall': { lat: 11.0168, lng: 76.9558 },
}

export function geocodeCoimbatoreArea(locationStr?: string | null): LatLng {
  if (!locationStr) {
    return { lat: 11.0168, lng: 76.9558 }
  }

  const normalized = locationStr.toLowerCase().trim()

  for (const [area, coords] of Object.entries(COIMBATORE_LOCALITIES)) {
    if (normalized.includes(area)) {
      return coords
    }
  }

  return { lat: 11.0168, lng: 76.9558 }
}
