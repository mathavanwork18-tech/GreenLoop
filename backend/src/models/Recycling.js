import mongoose from 'mongoose';

const recyclingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contactName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    itemType: {
      type: String,
      required: true,
      enum: [
        'batteries',
        'e-waste-bulk',
        'cracked-screens',
        'motherboards',
        'monitors',
        'appliances',
        'cables',
        'hazardous-mix',
      ],
    },
    estimatedWeightKg: { type: Number, required: true, min: 0.1 },
    pickupAddress: {
      street: { type: String, required: true },
      city: { type: String, default: 'Chennai' },
      pincode: { type: String, required: true },
      coordinates: {
        lat: { type: Number, default: 13.0827 },
        lng: { type: Number, default: 80.2707 },
      },
    },
    preferredPickupDate: { type: Date, required: true },
    timeSlot: {
      type: String,
      enum: ['morning_9_12', 'afternoon_12_3', 'evening_3_6'],
      default: 'morning_9_12',
    },
    specialInstructions: String,
    assignedPartnerCenter: {
      name: { type: String, default: 'Green Earth TNPCB Certified Recyclers' },
      centerId: String,
      contact: String,
    },
    status: {
      type: String,
      enum: ['requested', 'scheduled', 'agent_assigned', 'picked_up', 'processing', 'certified_recycled', 'cancelled'],
      default: 'requested',
    },
    ecoPointsEarned: { type: Number, default: 0 },
    certificateId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Recycling = mongoose.model('Recycling', recyclingSchema);
