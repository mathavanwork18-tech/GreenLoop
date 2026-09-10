import mongoose from 'mongoose';

const sparePartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  condition: {
    type: String,
    enum: ['working', 'needs_repair', 'untested', 'damaged'],
    default: 'working',
  },
  price: { type: Number, default: 0 },
  isHarvestable: { type: Boolean, default: true },
  description: String,
});

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Listing description is required'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'laptops',
        'smartphones',
        'tablets',
        'components',
        'audio',
        'monitors',
        'cables_chargers',
        'batteries',
        'appliances',
        'printers',
        'other',
      ],
      default: 'components',
    },
    brand: { type: String, trim: true, default: 'Generic' },
    modelName: { type: String, trim: true, default: '' },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: { type: Number, min: 0 },
    listingType: {
      type: String,
      enum: ['sell', 'parts', 'donate', 'exchange', 'recycle'],
      default: 'sell',
    },
    condition: {
      type: String,
      enum: ['mint', 'good', 'fair', 'for_parts', 'non_functional'],
      default: 'good',
    },
    conditionAssessment: {
      powersOn: { type: Boolean, default: true },
      displayIntact: { type: Boolean, default: true },
      batteryHealthy: { type: Boolean, default: true },
      physicalDamage: { type: String, default: 'None' },
      functionalScore: { type: Number, default: 85 },
    },
    harvestableParts: [sparePartSchema],
    images: [{ type: String }],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sellerName: { type: String, default: 'Eco Seller' },
    location: {
      city: { type: String, default: 'Chennai' },
      area: { type: String, default: 'Guindy' },
      coordinates: {
        lat: { type: Number, default: 13.0827 },
        lng: { type: Number, default: 80.2707 },
      },
    },
    qrCodeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'recycled', 'donated'],
      default: 'available',
    },
    viewsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Auto-generate QR Product Code if not set
listingSchema.pre('save', function (next) {
  if (!this.qrCodeId) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    this.qrCodeId = `EC-2026-${randomSuffix}`;
  }
  next();
});

export const Listing = mongoose.model('Listing', listingSchema);
