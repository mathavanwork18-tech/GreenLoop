export type PaymentMethod = 'ONLINE' | 'CASH' | 'DEMO_QR'

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'CASH_PENDING'
  | 'CASH_RECEIVED'
  | 'FAILED'
  | 'REFUNDED'
  | 'SUCCESS'

export type PurchaseStatus =
  | 'PURCHASE_REQUESTED'
  | 'ACCEPTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'CASH_PENDING'
  | 'CASH_RECEIVED'
  | 'READY_FOR_HANDOVER'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'

export interface MarketplacePurchase {
  id: string // e.g. "GL-10492"
  postId: string
  postTitle: string
  postImage: string
  postCategory?: string
  postCondition?: string
  buyerId: string
  buyerName: string
  buyerRole?: string
  buyerPhone?: string
  sellerId: string
  sellerName: string
  sellerRole?: string
  sellerPhone?: string
  sellerRating?: number
  sellerVerified?: boolean
  amount: number
  platformFee: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  purchaseStatus: PurchaseStatus
  gatewayOrderId?: string
  gatewayPaymentId?: string
  failureReason?: string
  handoverLocation?: string
  notes?: string
  createdAt: string
  acceptedAt?: string
  paidAt?: string
  cashConfirmedAt?: string
  completedAt?: string
  updatedAt?: string
}

export interface PaymentMethodOption {
  id: PaymentMethod
  title: string
  subtitle: string
  desc: string
  icon: string
  badge?: string
}

export interface CreatePurchaseParams {
  postId: string
  postTitle: string
  postImage?: string
  postCategory?: string
  postCondition?: string
  sellerId: string
  sellerName: string
  sellerRating?: number
  sellerVerified?: boolean
  amount: number
  paymentMethod: PaymentMethod
  handoverLocation?: string
  notes?: string
}

export interface DemoPurchaseResult {
  success: boolean
  transactionRef: string
  postId: string
  postTitle: string
  amount: number
  buyerId: string
  buyerName: string
  buyerRole?: string
  sellerId: string
  sellerName: string
  sellerRole?: string
  paymentMethod: 'DEMO_QR'
  paymentStatus: 'SUCCESS'
  purchaseStatus: 'COMPLETED'
  buyerCoinsAwarded: number
  sellerCoinsAwarded: number
  buyerNewCoins?: number
  createdAt: string
  message: string
}
