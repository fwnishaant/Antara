import { NextRequest, NextResponse } from 'next/server';
import { RazorpayService } from '@/lib/razorpay';
import { store } from '@/lib/db/store';
import { RevenueAttributionEngine } from '@/lib/analytics/attribution';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = body;

    const isValid = RazorpayService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Save Order and Payment in store
    const createdOrder = store.createOrder({
      customerId: orderDetails?.customerId || 'cust_1042',
      customerName: orderDetails?.customerName || 'Rahul Sharma',
      items: orderDetails?.items || [],
      totalAmount: orderDetails?.totalAmount || 4999,
      baseAmount: orderDetails?.baseAmount || 4999,
      aiInfluencedAmount: orderDetails?.aiInfluencedAmount || 0,
      status: 'completed',
      paymentMethod: 'Razorpay UPI',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      isAiAttributed: !!orderDetails?.isAiAttributed,
      aiActionId: orderDetails?.aiActionId,
      attributionType: orderDetails?.attributionType || 'bundle',
    });

    store.recordPayment({
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      orderId: createdOrder.id,
      customerName: createdOrder.customerName,
      amount: createdOrder.totalAmount,
      status: 'captured',
      method: 'upi',
    });

    RevenueAttributionEngine.calculateAttribution(createdOrder);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order finalized successfully',
      order: createdOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signature verification failed' }, { status: 500 });
  }
}
