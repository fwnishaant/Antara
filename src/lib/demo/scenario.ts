import { store } from '@/lib/db/store';
import { IntentAgent } from '@/lib/agents/intentAgent';
import { RecommendationAgent } from '@/lib/agents/recommendationAgent';
import { GrowthAgent } from '@/lib/agents/growthAgent';
import { RecoveryAgent } from '@/lib/agents/recoveryAgent';
import { RazorpayService } from '@/lib/razorpay';
import { RevenueAttributionEngine } from '@/lib/analytics/attribution';

export interface ScenarioStep {
  stepIndex: number;
  totalSteps: number;
  title: string;
  agentName?: string;
  description: string;
  status: 'running' | 'completed' | 'failed';
  delayMs: number;
  data?: any;
}

export class DemoScenarioRunner {
  public static async runGrowthDemo(onStep?: (step: ScenarioStep) => void): Promise<void> {
    const totalSteps = 7;
    const demoCustomerId = 'cust_1042';

    // Step 1: Search & Intent Analysis
    onStep?.({
      stepIndex: 1,
      totalSteps,
      title: 'Customer Intent Discovery',
      agentName: 'Intent Intelligence Agent',
      description: 'Customer searched: "wireless active noise cancelling headphones under 5000"',
      status: 'running',
      delayMs: 1200,
    });

    const intentResult = await IntentAgent.analyzeIntent(demoCustomerId, 'wireless active noise cancelling headphones under 5000');
    store.recordEvent({
      type: 'SEARCH_PERFORMED',
      customerId: demoCustomerId,
      customerName: 'Rahul Sharma',
      sessionId: `sess_demo_${Date.now()}`,
      metadata: { query: 'wireless active noise cancelling headphones under 5000' },
    });

    await new Promise((res) => setTimeout(res, 1200));

    // Step 2: Recommendations
    onStep?.({
      stepIndex: 2,
      totalSteps,
      title: 'Catalog Recommendation Selection',
      agentName: 'Commerce Recommendation Agent',
      description: 'Selecting AeroPulse ANC Headphones & complementary care kit.',
      status: 'running',
      delayMs: 1200,
    });

    const recResult = await RecommendationAgent.getRecommendations(demoCustomerId, 'Electronics', 'prod_1');
    await new Promise((res) => setTimeout(res, 1200));

    // Step 3: Product Added to Cart
    onStep?.({
      stepIndex: 3,
      totalSteps,
      title: 'Item Added to Shopping Cart',
      agentName: 'Storefront',
      description: 'AeroPulse ANC Wireless Headphones (₹4,999) added to cart.',
      status: 'running',
      delayMs: 1000,
    });

    const prod1 = store.getProductById('prod_1')!;
    store.recordEvent({
      type: 'PRODUCT_ADDED_TO_CART',
      customerId: demoCustomerId,
      customerName: 'Rahul Sharma',
      sessionId: `sess_demo_${Date.now()}`,
      metadata: { productId: 'prod_1', price: 4999 },
    });

    await new Promise((res) => setTimeout(res, 1000));

    // Step 4: Growth Agent Bundle Offer
    onStep?.({
      stepIndex: 4,
      totalSteps,
      title: 'Dynamic Bundle Cross-Sell Intervened',
      agentName: 'Revenue Growth Agent',
      description: 'AI recommended Hard-Shell Case + Fast Charging Cable accessory pack (+15% AOV).',
      status: 'running',
      delayMs: 1500,
    });

    const growthResult = await GrowthAgent.evaluateGrowthIntervention(demoCustomerId, [{ product: prod1, quantity: 1 }]);
    store.recordEvent({
      type: 'AI_BUNDLE_ACCEPTED',
      customerId: demoCustomerId,
      customerName: 'Rahul Sharma',
      sessionId: `sess_demo_${Date.now()}`,
      metadata: { bundleId: 'bndl_demo', incrementalRevenue: 1298 },
    });

    await new Promise((res) => setTimeout(res, 1500));

    // Step 5: Razorpay Checkout Order Creation
    onStep?.({
      stepIndex: 5,
      totalSteps,
      title: 'Razorpay Order Initialization',
      agentName: 'Payment Agent',
      description: 'Created server-side Razorpay Order for ₹6,297 total cart value.',
      status: 'running',
      delayMs: 1200,
    });

    const rzpOrder = await RazorpayService.createOrder(6297, `rcpt_demo_${Date.now()}`);
    store.recordEvent({
      type: 'PAYMENT_CREATED',
      customerId: demoCustomerId,
      customerName: 'Rahul Sharma',
      sessionId: `sess_demo_${Date.now()}`,
      metadata: { razorpayOrderId: rzpOrder.id, amount: 6297 },
    });

    await new Promise((res) => setTimeout(res, 1200));

    // Step 6: Payment Captured & Verification
    onStep?.({
      stepIndex: 6,
      totalSteps,
      title: 'Razorpay Payment Capture',
      agentName: 'Payment Verification',
      description: 'Razorpay payment signature verified. Order status updated to COMPLETED.',
      status: 'running',
      delayMs: 1200,
    });

    const createdOrder = store.createOrder({
      customerId: demoCustomerId,
      customerName: 'Rahul Sharma',
      items: [
        { product: store.getProductById('prod_1')!, quantity: 1 },
        { product: store.getProductById('prod_3')!, quantity: 1 },
        { product: store.getProductById('prod_4')!, quantity: 1 },
      ],
      totalAmount: 6297,
      baseAmount: 4999,
      aiInfluencedAmount: 1298,
      status: 'completed',
      paymentMethod: 'Razorpay UPI',
      razorpayOrderId: rzpOrder.id,
      razorpayPaymentId: `pay_demo_${Date.now()}`,
      isAiAttributed: true,
      aiActionId: 'act_201',
      attributionType: 'bundle',
    });

    store.recordPayment({
      razorpayPaymentId: `pay_demo_${Date.now()}`,
      razorpayOrderId: rzpOrder.id,
      orderId: createdOrder.id,
      customerName: 'Rahul Sharma',
      amount: 6297,
      status: 'captured',
      method: 'upi',
      isRecovery: false,
    });

    await new Promise((res) => setTimeout(res, 1200));

    // Step 7: Revenue Attribution & Growth Analyst
    onStep?.({
      stepIndex: 7,
      totalSteps,
      title: 'AI Revenue Attributed & Dashboard Updated',
      agentName: 'Autonomous Growth Analyst',
      description: 'Attributed +₹1,298 incremental revenue to AI agents. Updated total revenue metrics!',
      status: 'completed',
      delayMs: 500,
      data: { order: createdOrder, incrementalRevenue: 1298 },
    });

    RevenueAttributionEngine.calculateAttribution(createdOrder);
  }

  public static async runRecoveryDemo(onStep?: (step: ScenarioStep) => void): Promise<void> {
    const totalSteps = 5;
    const demoCustomerId = 'cust_1088';

    // Step 1: Failed Checkout Event
    onStep?.({
      stepIndex: 1,
      totalSteps,
      title: 'Payment Gateway Failure Detected',
      agentName: 'Payment Agent',
      description: 'Customer Vikramaditya Rao attempted ₹8,999 checkout. Bank UPI timeout occurred.',
      status: 'running',
      delayMs: 1200,
    });

    store.recordEvent({
      type: 'PAYMENT_FAILED',
      customerId: demoCustomerId,
      customerName: 'Vikramaditya Rao',
      sessionId: `sess_fail_${Date.now()}`,
      metadata: { amount: 8999, reason: 'Bank UPI timeout' },
    });

    await new Promise((res) => setTimeout(res, 1200));

    // Step 2: Recovery Agent Detection
    onStep?.({
      stepIndex: 2,
      totalSteps,
      title: 'High-Intent Recovery Signal Identified',
      agentName: 'Revenue Recovery Agent',
      description: 'Customer intent score: 94%. Triggering automated Razorpay Payment Link workflow.',
      status: 'running',
      delayMs: 1500,
    });

    const recoveryOutput = await RecoveryAgent.analyzeRecoveryOpportunity(demoCustomerId, 8999, 'Bank UPI timeout');
    await new Promise((res) => setTimeout(res, 1500));

    // Step 3: Payment Link Sent
    onStep?.({
      stepIndex: 3,
      totalSteps,
      title: 'Razorpay Payment Link Deployed',
      agentName: 'Revenue Recovery Agent',
      description: `Generated Payment Link (${recoveryOutput.paymentLinkId}) with 15-minute priority dispatch perk.`,
      status: 'running',
      delayMs: 1200,
    });

    await new Promise((res) => setTimeout(res, 1200));

    // Step 4: Payment Link Paid (Webhook simulation)
    onStep?.({
      stepIndex: 4,
      totalSteps,
      title: 'Payment Link Executed & Verified',
      agentName: 'Payment Verification',
      description: 'Customer clicked recovery link and completed ₹8,999 payment via Razorpay Payment Link.',
      status: 'running',
      delayMs: 1200,
    });

    const recoveredOrder = store.createOrder({
      customerId: demoCustomerId,
      customerName: 'Vikramaditya Rao',
      items: [{ product: store.getProductById('prod_5')!, quantity: 1 }],
      totalAmount: 8999,
      baseAmount: 0,
      aiInfluencedAmount: 8999,
      status: 'recovered',
      paymentMethod: 'Razorpay Payment Link',
      razorpayOrderId: `order_rec_${Date.now()}`,
      razorpayPaymentId: `pay_rec_${Date.now()}`,
      isAiAttributed: true,
      attributionType: 'recovery',
    });

    store.recordPayment({
      razorpayPaymentId: `pay_rec_${Date.now()}`,
      razorpayOrderId: `order_rec_${Date.now()}`,
      orderId: recoveredOrder.id,
      customerName: 'Vikramaditya Rao',
      amount: 8999,
      status: 'captured',
      method: 'payment_link',
      isRecovery: true,
    });

    store.recordEvent({
      type: 'AI_RECOVERY_SUCCESS',
      customerId: demoCustomerId,
      customerName: 'Vikramaditya Rao',
      sessionId: `sess_rec_${Date.now()}`,
      metadata: { recoveredAmount: 8999, linkId: recoveryOutput.paymentLinkId },
    });

    await new Promise((res) => setTimeout(res, 1200));

    // Step 5: Recovered Revenue Updated
    onStep?.({
      stepIndex: 5,
      totalSteps,
      title: 'Recovered Revenue Recorded',
      agentName: 'Autonomous Growth Analyst',
      description: '+₹8,999 added to Recovered Revenue metric on Merchant Dashboard!',
      status: 'completed',
      delayMs: 500,
      data: { order: recoveredOrder, recoveredAmount: 8999 },
    });

    RevenueAttributionEngine.calculateAttribution(recoveredOrder);
  }
}
