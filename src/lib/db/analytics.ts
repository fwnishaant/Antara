import { store } from '@/lib/db/store';
import { AnalyticsSummary, AgentAction, Campaign, Order, Customer } from '@/types';
import { DatabaseClient } from './client';

export class CommerceAnalyticsRepository {
  public static async getAnalytics(): Promise<AnalyticsSummary> {
    return store.getAnalytics();
  }

  public static async getOrders(): Promise<Order[]> {
    return DatabaseClient.queryTable<Order>('orders', () => store.getOrders());
  }

  public static async getAgentActions(): Promise<AgentAction[]> {
    return DatabaseClient.queryTable<AgentAction>('agent_actions', () => store.getActions());
  }

  public static async getCampaigns(): Promise<Campaign[]> {
    return DatabaseClient.queryTable<Campaign>('campaigns', () => store.getCampaigns());
  }

  public static async getCustomers(): Promise<Customer[]> {
    return DatabaseClient.queryTable<Customer>('customers', () => store.getCustomers());
  }

  public static async getAbandonedCarts(): Promise<Array<{ customerId: string; cartValue: number; reason: string }>> {
    const customers = await this.getCustomers();
    const failed = customers.filter((c) => c.hasFailedPayment);

    return failed.map((c) => ({
      customerId: c.id,
      cartValue: c.failedPaymentAmount || 2000,
      reason: 'Payment failed / checkout timeout signal',
    }));
  }
}
