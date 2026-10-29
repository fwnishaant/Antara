import {
  Product,
  Customer,
  CommerceEvent,
  AgentInfo,
  AgentAction,
  Order,
  PaymentTransaction,
  Campaign,
  GrowthOpportunity,
  CustomerSegment,
  SystemSettings,
  AnalyticsSummary,
} from '@/types';

import {
  SEEDED_PRODUCTS,
  SEEDED_CUSTOMERS,
  SEEDED_EVENTS,
  SEEDED_AGENTS,
  SEEDED_ACTIONS,
  SEEDED_ORDERS,
  SEEDED_PAYMENTS,
  SEEDED_CAMPAIGNS,
  SEEDED_OPPORTUNITIES,
  SEEDED_SEGMENTS,
  INITIAL_SETTINGS,
  INITIAL_ANALYTICS,
} from './data';

class AntaraStore {
  private products: Product[] = [...SEEDED_PRODUCTS];
  private customers: Customer[] = [...SEEDED_CUSTOMERS];
  private events: CommerceEvent[] = [...SEEDED_EVENTS];
  private agents: AgentInfo[] = [...SEEDED_AGENTS];
  private actions: AgentAction[] = [...SEEDED_ACTIONS];
  private orders: Order[] = [...SEEDED_ORDERS];
  private payments: PaymentTransaction[] = [...SEEDED_PAYMENTS];
  private campaigns: Campaign[] = [...SEEDED_CAMPAIGNS];
  private opportunities: GrowthOpportunity[] = [...SEEDED_OPPORTUNITIES];
  private segments: CustomerSegment[] = [...SEEDED_SEGMENTS];
  private settings: SystemSettings = { ...INITIAL_SETTINGS };
  private analytics: AnalyticsSummary = { ...INITIAL_ANALYTICS };

  private listeners: Array<() => void> = [];

  constructor() {
    this.recalculateAnalytics();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.recalculateAnalytics();
    this.listeners.forEach((listener) => listener());
  }

  public recalculateAnalytics() {
    let totalRev = 0;
    let aiAttributedRev = 0;
    let recoveredRev = 0;

    this.orders.forEach((ord) => {
      if (ord.status === 'completed' || ord.status === 'recovered') {
        totalRev += ord.totalAmount;
        if (ord.isAiAttributed) {
          aiAttributedRev += ord.aiInfluencedAmount || ord.totalAmount;
        }
        if (ord.status === 'recovered') {
          recoveredRev += ord.totalAmount;
        }
      }
    });

    const aiContributionPct = totalRev > 0 ? Number(((aiAttributedRev / totalRev) * 100).toFixed(1)) : 0;

    this.analytics = {
      ...this.analytics,
      totalRevenue: totalRev > 0 ? totalRev : INITIAL_ANALYTICS.totalRevenue,
      aiAttributedRevenue: aiAttributedRev > 0 ? aiAttributedRev : INITIAL_ANALYTICS.aiAttributedRevenue,
      aiRevenueContributionPercentage: aiContributionPct > 0 ? aiContributionPct : INITIAL_ANALYTICS.aiRevenueContributionPercentage,
      recoveredRevenue: recoveredRev > 0 ? recoveredRev : INITIAL_ANALYTICS.recoveredRevenue,
      totalOrders: this.orders.length,
      totalCustomers: this.customers.length,
    };
  }

  // --- PRODUCTS ---
  public getProducts() {
    return this.products;
  }

  public getProductById(id: string) {
    return this.products.find((p) => p.id === id);
  }

  public addProduct(product: Product) {
    this.products.unshift(product);
    this.notify();
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    this.products = this.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.notify();
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter((p) => p.id !== id);
    this.notify();
  }

  // --- CUSTOMERS ---
  public getCustomers() {
    return this.customers;
  }

  public getCustomerById(id: string) {
    return this.customers.find((c) => c.id === id);
  }

  public updateCustomer(id: string, updates: Partial<Customer>) {
    this.customers = this.customers.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.notify();
  }

  // --- EVENTS ---
  public getEvents() {
    return this.events;
  }

  public recordEvent(event: Omit<CommerceEvent, 'id' | 'timestamp'>) {
    const newEvent: CommerceEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    this.notify();
    return newEvent;
  }

  // --- AGENTS & ACTIONS ---
  public getAgents() {
    return this.agents;
  }

  public getActions() {
    return this.actions;
  }

  public logAction(action: Omit<AgentAction, 'id' | 'timestamp'>) {
    const newAction: AgentAction = {
      ...action,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.actions.unshift(newAction);

    // Update agent metrics
    this.agents = this.agents.map((ag) => {
      if (ag.id === action.agentId) {
        return {
          ...ag,
          totalDecisions: ag.totalDecisions + 1,
          attributedRevenue: ag.attributedRevenue + (action.attributedRevenue || 0),
        };
      }
      return ag;
    });

    this.notify();
    return newAction;
  }

  public updateActionStatus(actionId: string, status: AgentAction['status'], attributedRevenue?: number) {
    this.actions = this.actions.map((act) => {
      if (act.id === actionId) {
        return {
          ...act,
          status,
          attributedRevenue: attributedRevenue !== undefined ? attributedRevenue : act.attributedRevenue,
        };
      }
      return act;
    });
    this.notify();
  }

  // --- ORDERS & PAYMENTS ---
  public getOrders() {
    return this.orders;
  }

  public getPayments() {
    return this.payments;
  }

  public createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) {
    const count = this.orders.length + 904;
    const newOrder: Order = {
      ...order,
      id: `ord_${Date.now()}`,
      orderNumber: `ANT-2026-${count}`,
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder);

    this.recordEvent({
      type: 'ORDER_COMPLETED',
      customerId: order.customerId,
      customerName: order.customerName,
      sessionId: `sess_${Date.now()}`,
      metadata: { orderId: newOrder.id, orderNumber: newOrder.orderNumber, total: newOrder.totalAmount },
    });

    this.notify();
    return newOrder;
  }

  public recordPayment(payment: Omit<PaymentTransaction, 'id' | 'createdAt'>) {
    const newPayment: PaymentTransaction = {
      ...payment,
      id: `pay_tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.payments.unshift(newPayment);

    // If order exists, update status
    this.orders = this.orders.map((ord) => {
      if (ord.razorpayOrderId === payment.razorpayOrderId || ord.id === payment.orderId) {
        return {
          ...ord,
          status: payment.status === 'captured' ? (payment.isRecovery ? 'recovered' : 'completed') : 'failed',
          razorpayPaymentId: payment.razorpayPaymentId,
        };
      }
      return ord;
    });

    this.notify();
    return newPayment;
  }

  // --- CAMPAIGNS & OPPORTUNITIES ---
  public getCampaigns() {
    return this.campaigns;
  }

  public updateCampaignStatus(id: string, status: Campaign['status']) {
    this.campaigns = this.campaigns.map((cmp) => (cmp.id === id ? { ...cmp, status } : cmp));
    this.notify();
  }

  public getOpportunities() {
    return this.opportunities;
  }

  public getSegments() {
    return this.segments;
  }

  // --- SETTINGS & ANALYTICS ---
  public getSettings() {
    return this.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.notify();
  }

  public getAnalytics() {
    return this.analytics;
  }

  public resetDemoData() {
    this.products = [...SEEDED_PRODUCTS];
    this.customers = [...SEEDED_CUSTOMERS];
    this.events = [...SEEDED_EVENTS];
    this.agents = [...SEEDED_AGENTS];
    this.actions = [...SEEDED_ACTIONS];
    this.orders = [...SEEDED_ORDERS];
    this.payments = [...SEEDED_PAYMENTS];
    this.campaigns = [...SEEDED_CAMPAIGNS];
    this.opportunities = [...SEEDED_OPPORTUNITIES];
    this.segments = [...SEEDED_SEGMENTS];
    this.settings = { ...INITIAL_SETTINGS };
    this.notify();
  }
}

// Singleton global instance
export const store = new AntaraStore();
