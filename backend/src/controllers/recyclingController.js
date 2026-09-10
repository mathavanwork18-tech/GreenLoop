// Fallback in-memory recycling requests
const mockRecyclingRequests = [];

/**
 * Submit a doorstep certified recycling request
 */
export async function createRecyclingRequest(req, res) {
  try {
    const {
      contactName,
      phone,
      email,
      itemType,
      estimatedWeightKg,
      pickupAddress,
      preferredPickupDate,
      timeSlot,
      userId,
    } = req.body;

    if (!contactName || !phone || !itemType || !estimatedWeightKg || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contact name, phone, item type, estimated weight, and pickup address.',
      });
    }

    const weight = Number(estimatedWeightKg);
    const ecoPointsEarned = Math.round(weight * 25); // 25 points per kg
    const certificateId = `TNPCB-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const requestData = {
      contact_name: contactName,
      phone,
      email: email || '',
      item_type: itemType,
      estimated_weight_kg: weight,
      pickup_address: typeof pickupAddress === 'string' ? { street: pickupAddress, city: 'Chennai' } : pickupAddress,
      preferred_pickup_date: preferredPickupDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      time_slot: timeSlot || 'morning_9_12',
      eco_points_earned: ecoPointsEarned,
      certificate_id: certificateId,
      user_id: userId || null,
      status: 'requested',
    };

    const createdReq = {
      id: `rec-${Date.now()}`,
      ...requestData,
      created_at: new Date().toISOString(),
    };
    mockRecyclingRequests.unshift(createdReq);

    res.status(201).json({
      success: true,
      message: `Recycling pickup scheduled! You earned ${ecoPointsEarned} EcoPoints.`,
      data: createdReq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get all recycling requests (or filtered by user)
 */
export async function getRecyclingRequests(req, res) {
  try {
    const { userId } = req.query;

    let requests = [...mockRecyclingRequests];
    if (userId) {
      requests = requests.filter((r) => r.user_id === userId);
    }

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get verified TNPCB partner recycling centers
 */
export async function getRecyclingCenters(req, res) {
  const centers = [
    {
      id: 'TNPCB-C1',
      name: 'EcoGreen E-Waste Recyclers Pvt Ltd',
      address: 'Plot 42, SIDCO Industrial Estate, Guindy, Chennai',
      pincode: '600032',
      phone: '+91 44 2250 8899',
      certification: 'TNPCB / CPCB Certified',
      acceptedTypes: ['Laptops', 'Batteries', 'CRTs', 'Motherboards', 'Cables'],
      distanceKm: 3.2,
      coordinates: { lat: 13.0067, lng: 80.2023 },
    },
    {
      id: 'TNPCB-C2',
      name: 'CleanTech Circular Solutions',
      address: 'Industrial Corridor, Ambattur, Chennai',
      pincode: '600058',
      phone: '+91 44 2658 1122',
      certification: 'ISO 14001 & TNPCB Authorized',
      acceptedTypes: ['Heavy Appliances', 'Lithium-Ion Batteries', 'Servers', 'Telecom'],
      distanceKm: 8.5,
      coordinates: { lat: 13.1143, lng: 80.1548 },
    },
    {
      id: 'TNPCB-C3',
      name: 'EarthFirst Dismantling & Recovery',
      address: 'SIPCOT IT Park, Siruseri, OMR, Chennai',
      pincode: '603103',
      phone: '+91 44 4740 5500',
      certification: 'Government Authorized E-Waste Hub',
      acceptedTypes: ['Smartphones', 'Tablets', 'Monitors', 'All Electronics'],
      distanceKm: 14.1,
      coordinates: { lat: 12.8252, lng: 80.2185 },
    },
  ];

  res.json({
    success: true,
    data: centers,
  });
}
