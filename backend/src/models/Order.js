import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    type: {
      type: String,
      enum: ['direct_purchase', 'offer_negotiation', 'part_purchase'],
      default: 'direct_purchase',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'cod', 'wallet_points'],
      default: 'upi',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveryAddress: {
      name: String,
      phone: String,
      addressLine: String,
      city: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ['order_placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'order_placed',
    },
    trackingNumber: String,
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    this.orderId = `ORD-2026-${randomSuffix}`;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);
