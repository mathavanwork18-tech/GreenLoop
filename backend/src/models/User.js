import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['individual', 'shop', 'recycler', 'ngo', 'admin'],
      default: 'individual',
    },
    avatar: {
      type: String,
      default: '',
    },
    location: {
      city: { type: String, default: 'Chennai' },
      state: { type: String, default: 'Tamil Nadu' },
      coordinates: {
        lat: { type: Number, default: 13.0827 },
        lng: { type: Number, default: 80.2707 },
      },
      address: { type: String, default: '' },
    },
    ecoPoints: {
      type: Number,
      default: 150,
      min: 0,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Eco Recycler', 'Eco Champion', 'Sustainability Hero'],
      default: 'Beginner',
    },
    impactStats: {
      kgDiverted: { type: Number, default: 0 },
      co2AvoidedKg: { type: Number, default: 0 },
      itemsRecycled: { type: Number, default: 0 },
      itemsSold: { type: Number, default: 0 },
      itemsDonated: { type: Number, default: 0 },
    },
    badges: [
      {
        id: String,
        name: String,
        description: String,
        icon: String,
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
