// Fallback in-memory listings
let mockListings = [
  {
    id: 'l-001',
    title: 'Dell Inspiron 15 (Core i5 8th Gen) - Motherboard Issue',
    description: 'Laptop does not boot up (motherboard short-circuit). 8GB DDR4 RAM, 256GB SSD, and 1080p Display are 100% working and can be harvested!',
    category: 'laptops',
    brand: 'Dell',
    model_name: 'Inspiron 5570',
    price: 3500,
    original_price: 48000,
    listing_type: 'parts',
    condition: 'for_parts',
    condition_assessment: {
      powersOn: false,
      displayIntact: true,
      batteryHealthy: true,
      physicalDamage: 'Minor scratches on lid',
      functionalScore: 50,
    },
    harvestable_parts: [
      { name: '8GB DDR4 2400MHz SODIMM RAM', category: 'components', condition: 'working', price: 1200 },
      { name: '256GB NVMe M.2 SSD', category: 'components', condition: 'working', price: 1500 },
      { name: '15.6 Inch FHD 30-Pin Matte Display Panel', category: 'components', condition: 'working', price: 2200 },
      { name: 'Original 65W Barrel Charger', category: 'cables_chargers', condition: 'working', price: 600 },
    ],
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    ],
    seller_name: 'Mathavan Raman',
    city: 'Chennai',
    area: 'Guindy',
    is_featured: true,
    qr_code_id: 'EC-2026-10492',
    status: 'available',
    views_count: 38,
    created_at: new Date().toISOString(),
  },
  {
    id: 'l-002',
    title: 'iPhone 11 64GB - Cracked Screen, Board Functional',
    description: 'FaceID works, camera module and original battery (84% health) intact. Screen glass cracked. Good for repair shops.',
    category: 'smartphones',
    brand: 'Apple',
    model_name: 'iPhone 11',
    price: 5800,
    original_price: 49900,
    listing_type: 'sell',
    condition: 'fair',
    condition_assessment: {
      powersOn: true,
      displayIntact: false,
      batteryHealthy: true,
      physicalDamage: 'Front glass shattered, chassis normal',
      functionalScore: 70,
    },
    harvestable_parts: [
      { name: 'Original Rear Dual Camera Module', category: 'components', condition: 'working', price: 2000 },
      { name: 'Original Battery (84% Health)', category: 'batteries', condition: 'working', price: 900 },
      { name: 'Logic Board 64GB Clean iCloud', category: 'components', condition: 'working', price: 4200 },
    ],
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
    ],
    seller_name: 'CircuitFix Repair Hub',
    city: 'Chennai',
    area: 'Ritchie Street',
    is_featured: true,
    qr_code_id: 'EC-2026-58321',
    status: 'available',
    views_count: 52,
    created_at: new Date().toISOString(),
  },
  {
    id: 'l-003',
    title: 'Samsung 24-inch Curved Gaming Monitor (Display Artifacts)',
    description: '144Hz curved gaming monitor. Stand, power adapter, and HDMI board perfectly intact. Panel has vertical colored lines.',
    category: 'monitors',
    brand: 'Samsung',
    model_name: 'CRG5 24"',
    price: 1800,
    original_price: 14500,
    listing_type: 'parts',
    condition: 'for_parts',
    condition_assessment: {
      powersOn: true,
      displayIntact: false,
      batteryHealthy: false,
      physicalDamage: 'Screen artifacts',
      functionalScore: 40,
    },
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
    ],
    seller_name: 'Mathavan Raman',
    city: 'Chennai',
    area: 'Velachery',
    is_featured: false,
    qr_code_id: 'EC-2026-92813',
    status: 'available',
    views_count: 14,
    created_at: new Date().toISOString(),
  },
];

/**
 * Get all listings with optional filtering & search
 */
export async function getListings(req, res) {
  try {
    const { category, type, search, condition, minPrice, maxPrice, city, featured } = req.query;

    let results = [...mockListings];
    if (category && category !== 'all') {
      results = results.filter((item) => item.category === category);
    }
    if (type && type !== 'all') {
      results = results.filter((item) => item.listing_type === type);
    }
    if (condition && condition !== 'all') {
      results = results.filter((item) => item.condition === condition);
    }
    if (city) {
      results = results.filter((item) => item.city?.toLowerCase().includes(city.toLowerCase()));
    }
    if (featured === 'true') {
      results = results.filter((item) => item.is_featured);
    }
    if (minPrice) {
      results = results.filter((item) => item.price >= Number(minPrice));
    }
    if (maxPrice) {
      results = results.filter((item) => item.price <= Number(maxPrice));
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get a single listing by ID or QR Code ID
 */
export async function getListingById(req, res) {
  try {
    const { id } = req.params;

    const listing = mockListings.find((item) => item.id === id || item.qr_code_id === id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    listing.views_count = (listing.views_count || 0) + 1;

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Create a new e-waste or spare parts listing
 */
export async function createListing(req, res) {
  try {
    const body = req.body;

    if (!body.title || !body.price) {
      return res.status(400).json({ success: false, message: 'Title and Price are required' });
    }

    const qrCodeId = body.qr_code_id || `EC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newListingData = {
      title: body.title,
      description: body.description || '',
      category: body.category || 'components',
      brand: body.brand || 'Generic',
      model_name: body.model_name || body.modelName || '',
      price: Number(body.price),
      original_price: Number(body.original_price || body.originalPrice || 0),
      listing_type: body.listing_type || body.listingType || 'sell',
      condition: body.condition || 'good',
      condition_assessment: body.condition_assessment || body.conditionAssessment || {},
      harvestable_parts: body.harvestable_parts || body.harvestableParts || [],
      images: body.images || [],
      seller_id: body.seller_id || body.sellerId || null,
      seller_name: body.seller_name || body.sellerName || 'Eco Seller',
      city: body.city || body.location?.city || 'Chennai',
      area: body.area || body.location?.area || 'Guindy',
      qr_code_id: qrCodeId,
      is_featured: Boolean(body.is_featured || body.isFeatured),
      status: 'available',
    };

    const createdItem = {
      id: `l-${Date.now()}`,
      ...newListingData,
      views_count: 0,
      created_at: new Date().toISOString(),
    };
    mockListings.unshift(createdItem);

    res.status(201).json({
      success: true,
      message: 'E-Waste listing posted successfully!',
      data: createdItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Update a listing
 */
export async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const index = mockListings.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    mockListings[index] = { ...mockListings[index], ...body, updated_at: new Date().toISOString() };

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: mockListings[index],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Delete a listing
 */
export async function deleteListing(req, res) {
  try {
    const { id } = req.params;

    mockListings = mockListings.filter((item) => item.id !== id);

    res.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Smart Compatibility Checker
 * Evaluates whether a chosen spare part fits a specified device model
 */
export async function checkCompatibility(req, res) {
  try {
    const { deviceModel, componentType, componentSpec } = req.body;

    if (!deviceModel || !componentType) {
      return res.status(400).json({
        success: false,
        message: 'deviceModel and componentType are required',
      });
    }

    const modelLower = deviceModel.toLowerCase();
    const typeLower = componentType.toLowerCase();

    let isCompatible = true;
    let confidenceScore = 94;
    let explanation = `The selected ${componentType} is compatible with ${deviceModel}.`;

    // Rule-based compatibility heuristics
    if (typeLower.includes('ram') || typeLower.includes('memory')) {
      if (modelLower.includes('macbook') && (modelLower.includes('m1') || modelLower.includes('m2') || modelLower.includes('m3'))) {
        isCompatible = false;
        confidenceScore = 99;
        explanation = `Apple Silicon MacBooks have unified soldered memory and do not support RAM upgrades.`;
      } else if (componentSpec?.includes('DDR3') && modelLower.includes('2022')) {
        isCompatible = false;
        confidenceScore = 95;
        explanation = `Modern 2022+ motherboards require DDR4 or DDR5 RAM, not DDR3.`;
      }
    }

    res.json({
      success: true,
      data: {
        deviceModel,
        componentType,
        isCompatible,
        confidenceScore,
        explanation,
        estimatedSalvageValue: isCompatible ? '₹1,200 - ₹2,500' : '₹0',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
