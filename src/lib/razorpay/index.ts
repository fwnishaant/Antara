import crypto from 'crypto';
import { store } from '@/lib/db/store';
import { Order, PaymentTransaction } from '@/types';

export interface RazorpayOrderResponse {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: 'INR';
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
  mode: 'live' | 'demo';
}

export interface RazorpayPaymentLinkResponse {
  id: string;
  short_url: string;
  status: 'created' | 'paid' | 'expired';
  amount: number;
  customer: {
    name: string;
    email?: string;
    contact?: string;
  };
  mode: 'live' | 'demo';
}

export class RazorpayService {
  private static getKeyId(): string {
    return process.env.RAZORPAY_KEY_ID || 'rzp_test_antara_demo_key';
  }

  private static getKeySecret(): string {
    return process.env.RAZORPAY_KEY_SECRET || 'antara_secret_demo_12345';
  }

  public static isRealCredentialsPresent(): boolean {
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    return !!(key && secret && !key.includes('demo') && key.startsWith('rzp_'));
  }

  public static async createOrder(amount: number, receiptId: string, notes: Record<string, any> = {}): Promise<RazorpayOrderResponse> {
    const amountInPaisa = Math.round(amount * 100);

    if (this.isRealCredentialsPresent()) {
      try {
        const auth = Buffer.from(`${this.getKeyId()}:${this.getKeySecret()}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInPaisa,
            currency: 'INR',
            receipt: receiptId,
            notes,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          return { ...resJson, mode: 'live' };
        }
      } catch (err) {
        console.warn('Razorpay Live API order creation failed, falling back to test order simulator:', err);
      }
    }

    // Demo / Test Mode Simulator Order
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;
    return {
      id: mockOrderId,
      entity: 'order',
      amount: amountInPaisa,
      amount_paid: 0,
      amount_due: amountInPaisa,
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
      attempts: 0,
      notes,
      created_at: Math.floor(Date.now() / 1000),
      mode: 'demo',
    };
  }

  public static async createPaymentLink(
    amount: number,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    description: string
  ): Promise<RazorpayPaymentLinkResponse> {
    const amountInPaisa = Math.round(amount * 100);

    if (this.isRealCredentialsPresent()) {
      try {
        const auth = Buffer.from(`${this.getKeyId()}:${this.getKeySecret()}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/payment_links', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInPaisa,
            currency: 'INR',
            accept_partial: false,
            description,
            customer: {
              name: customerName,
              email: customerEmail,
              contact: customerPhone,
            },
            notify: {
              sms: true,
              email: true,
            },
            reminder_enable: true,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          return {
            id: resJson.id,
            short_url: resJson.short_url,
            status: resJson.status,
            amount: amount,
            customer: resJson.customer,
            mode: 'live',
          };
        }
      } catch (err) {
        console.warn('Razorpay Payment Link API failed, falling back to simulator:', err);
      }
    }

    const mockLinkId = `plink_${Math.random().toString(36).substring(2, 10)}`;
    return {
      id: mockLinkId,
      short_url: `https://rzp.io/l/antara_${mockLinkId}`,
      status: 'created',
      amount,
      customer: { name: customerName, email: customerEmail, contact: customerPhone },
      mode: 'demo',
    };
  }

  public static verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!this.isRealCredentialsPresent()) {
      // In demo mode, accept test signatures or mock validation
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.getKeySecret())
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      return generatedSignature === signature;
    } catch (err) {
      console.error('Razorpay signature verification error:', err);
      return false;
    }
  }

  public static verifyWebhookSignature(bodyText: string, webhookSignature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'antara_webhook_secret_98765';
    if (!this.isRealCredentialsPresent()) return true;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyText)
        .digest('hex');
      return expectedSignature === webhookSignature;
    } catch (err) {
      return false;
    }
  }
}
