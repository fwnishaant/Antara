import { NextRequest, NextResponse } from 'next/server';
import { RazorpayService } from '@/lib/razorpay';
import { store } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, customerId, cartItems } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const receiptId = `rcpt_${Date.now()}`;
    const orderData = await RazorpayService.createOrder(amount, receiptId, {
      customerId: customerId || 'guest',
      itemCount: cartItems ? cartItems.length : 1,
    });

    store.recordEvent({
      type: 'PAYMENT_CREATED',
      customerId: customerId || 'guest',
      sessionId: `sess_${Date.now()}`,
      metadata: { razorpayOrderId: orderData.id, amount },
    });

    return NextResponse.json({
      success: true,
      order: orderData,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_antara_demo_key',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 });
  }
}
