import { NextRequest, NextResponse } from 'next/server';
import { RazorpayService } from '@/lib/razorpay';
import { store } from '@/lib/db/store';
import { RevenueAttributionEngine } from '@/lib/analytics/attribution';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSig = req.headers.get('x-razorpay-signature') || '';

    const isValid = RazorpayService.verifyWebhookSignature(rawBody, webhookSig);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      store.recordPayment({
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id,
        orderId: `ord_${payment.order_id}`,
        customerName: payment.email || 'Razorpay Shopper',
        amount: payment.amount / 100,
        status: 'captured',
        method: payment.method,
      });
    } else if (event === 'payment.failed') {
      const payment = payload.payload.payment.entity;
      store.recordPayment({
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id,
        orderId: `ord_${payment.order_id}`,
        customerName: payment.email || 'Razorpay Shopper',
        amount: payment.amount / 100,
        status: 'failed',
        method: payment.method,
        errorCode: payment.error_code,
        errorDescription: payment.error_description,
      });

      store.recordEvent({
        type: 'PAYMENT_FAILED',
        customerId: 'cust_1088',
        customerName: payment.email || 'Shopper',
        sessionId: `sess_${Date.now()}`,
        metadata: {
          razorpayPaymentId: payment.id,
          amount: payment.amount / 100,
          reason: payment.error_description,
        },
      });
    } else if (event === 'payment_link.paid') {
      const pLink = payload.payload.payment_link.entity;
      const order = store.createOrder({
        customerId: 'cust_1088',
        customerName: pLink.customer?.name || 'Vikramaditya Rao',
        items: [{ product: store.getProductById('prod_5')!, quantity: 1 }],
        totalAmount: pLink.amount / 100,
        baseAmount: 0,
        aiInfluencedAmount: pLink.amount / 100,
        status: 'recovered',
        paymentMethod: 'Razorpay Payment Link',
        razorpayOrderId: pLink.order_id || pLink.id,
        razorpayPaymentId: `pay_rec_${pLink.id}`,
        isAiAttributed: true,
        attributionType: 'recovery',
      });

      RevenueAttributionEngine.calculateAttribution(order);
    }

    return NextResponse.json({ status: 'ok', receivedEvent: event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
