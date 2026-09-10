import dotenv from 'dotenv';

dotenv.config();

export const sampleUsers = [
  {
    name: 'Mathavan Raman',
    email: 'mathavan@ecocircuit.org',
    phone: '+91 98765 43210',
    role: 'individual',
    city: 'Chennai',
    eco_points: 340,
    level: 'Eco Champion',
    impact_stats: { kgDiverted: 24.5, co2AvoidedKg: 44, itemsRecycled: 4, itemsSold: 3 },
  },
  {
    name: 'CircuitFix Repair Hub',
    email: 'contact@circuitfix.com',
    phone: '+91 44 2847 1100',
    role: 'shop',
    city: 'Chennai',
    eco_points: 1250,
    level: 'Sustainability Hero',
    impact_stats: { kgDiverted: 140, co2AvoidedKg: 252, itemsRecycled: 18, itemsSold: 42 },
  },
];

export const sampleListings = [
  {
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
  },
  {
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
  },
  {
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
  },
];

console.log('✨ In-Memory Seed Data loaded.');
console.log(`✅ ${sampleUsers.length} Sample Users available.`);
console.log(`✅ ${sampleListings.length} Sample Listings available.`);
