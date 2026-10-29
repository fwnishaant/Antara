export type Currency = 'INR';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'Electronics' | 'Fashion' | 'Fitness' | 'Accessories' | 'Home';
  image: string;
  rating: number;
  reviewsCount: number;
  inventory: number;
  tags: string[];
  relatedProductIds: string[];
  complementaryProductIds: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  intentScore: number; // 0-100
  intentCategory?: string;
  lifetimeValue: number;
  ordersCount: number;
  averageOrderValue: number;
  priceSensitivity: 'low' | 'medium' | 'high';
  viewedProductIds: string[];
  cartItemIds: string[];
  lastActive: string;
  segment: string;
  aiAttributedRevenue: number;
  hasFailedPayment?: boolean;
  failedPaymentAmount?: number;
}

export type EventType =
  | 'PRODUCT_VIEWED'
  | 'SEARCH_PERFORMED'
  | 'PRODUCT_ADDED_TO_CART'
  | 'CART_ABANDONED'
  | 'CHECKOUT_STARTED'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_CAPTURED'
  | 'ORDER_COMPLETED'
  | 'AI_RECOMMENDATION_SHOWN'
  | 'AI_RECOMMENDATION_ACCEPTED'
  | 'AI_OFFER_CREATED'
  | 'AI_RECOVERY_TRIGGERED'
  | 'AI_RECOVERY_SUCCESS'
  | 'AI_BUNDLE_ACCEPTED';

export interface CommerceEvent {
  id: string;
  type: EventType;
  timestamp: string;
  customerId: string;
  customerName?: string;
  sessionId: string;
  metadata: Record<string, any>;
}

export type AgentId =
  | 'intent-agent'
  | 'recommendation-agent'
  | 'growth-agent'
  | 'recovery-agent'
  | 'analyst-agent';

export interface AgentInfo {
  id: AgentId;
  name: string;
  role: string;
  status: 'active' | 'learning' | 'standby';
  confidence: number; // percentage e.g. 92
  totalDecisions: number;
  attributedRevenue: number;
  description: string;
  iconName: string;
}

export interface AgentAction {
  id: string;
  agentId: AgentId;
  agentName: string;
  customerId: string;
  customerName: string;
  timestamp: string;
  title: string;
  description: string;
  reason: string;
  confidence: number;
  actionType: 'bundle_recommendation' | 'discount_offer' | 'recovery_link' | 'cross_sell' | 'personalized_nudge';
  expectedRevenue: number;
  attributedRevenue: number;
  status: 'pending' | 'executed' | 'accepted' | 'declined' | 'failed';
  metadata: {
    productIds?: string[];
    discountAmount?: number;
    paymentLinkId?: string;
    cartValue?: number;
    signals?: string[];
    [key: string]: any;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  baseAmount: number;
  aiInfluencedAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'recovered';
  paymentMethod: 'Razorpay UPI' | 'Razorpay Card' | 'Razorpay NetBanking' | 'Razorpay Payment Link';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  isAiAttributed: boolean;
  aiActionId?: string;
  attributionType?: 'bundle' | 'upsell' | 'recovery' | 'discount_conversion';
}

export interface PaymentTransaction {
  id: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  orderId: string;
  customerName: string;
  amount: number;
  status: 'captured' | 'failed' | 'authorized' | 'refunded';
  method: string;
  errorCode?: string;
  errorDescription?: string;
  createdAt: string;
  isRecovery?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  targetSegment: string;
  audienceSize: number;
  expectedRevenue: number;
  realizedRevenue: number;
  aiConfidence: number;
  status: 'active' | 'paused' | 'draft' | 'completed';
  offerType: string;
  createdAt: string;
}

export interface GrowthOpportunity {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  affectedCustomersCount: number;
  potentialRevenue: number;
  recommendedAction: string;
  aiConfidence: number;
  category: 'cart_recovery' | 'cross_sell' | 're_engagement' | 'pricing';
}

export interface CustomerSegment {
  id: string;
  name: string;
  customerCount: number;
  averageOrderValue: number;
  conversionRate: number;
  totalRevenue: number;
  description: string;
}

export interface SystemSettings {
  aiMode: 'demo' | 'live';
  autonomyLevel: 1 | 2 | 3; // 1: recommend only, 2: recommend + approval, 3: auto execute
  razorpayConnected: boolean;
  llmConnected: boolean;
  webhookConnected: boolean;
  merchantName: string;
  storeName: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  aiAttributedRevenue: number;
  aiRevenueContributionPercentage: number;
  conversionRate: number;
  averageOrderValue: number;
  recoveredRevenue: number;
  activeAgentsCount: number;
  totalOrders: number;
  totalCustomers: number;
}
