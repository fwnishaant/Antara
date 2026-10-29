import { store } from '@/lib/db/store';
import { Order } from '@/types';

export interface AttributionRecord {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  totalOrderAmount: number;
  baseAmount: number;
  aiInfluencedAmount: number;
  attributionType: 'bundle' | 'upsell' | 'recovery' | 'discount_conversion';
  aiActionId?: string;
  timestamp: string;
}

export class RevenueAttributionEngine {
  public static calculateAttribution(order: Order): AttributionRecord {
    let aiInfluencedAmount = order.aiInfluencedAmount || 0;
    let baseAmount = order.baseAmount || order.totalAmount;
    let attributionType: AttributionRecord['attributionType'] = order.attributionType || 'bundle';

    if (order.status === 'recovered') {
      attributionType = 'recovery';
      aiInfluencedAmount = order.totalAmount;
      baseAmount = 0;
    } else if (order.items.length > 1) {
      attributionType = 'bundle';
      const mainItemPrice = order.items[0].product.price * order.items[0].quantity;
      baseAmount = mainItemPrice;
      aiInfluencedAmount = Math.max(0, order.totalAmount - baseAmount);
    }

    const record: AttributionRecord = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      totalOrderAmount: order.totalAmount,
      baseAmount,
      aiInfluencedAmount,
      attributionType,
      aiActionId: order.aiActionId,
      timestamp: new Date().toISOString(),
    };

    // Update customer record with AI revenue gain
    const customer = store.getCustomerById(order.customerId);
    if (customer) {
      store.updateCustomer(order.customerId, {
        aiAttributedRevenue: customer.aiAttributedRevenue + aiInfluencedAmount,
      });
    }

    return record;
  }
}
