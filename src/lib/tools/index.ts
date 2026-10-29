import { store } from '@/lib/db/store';
import { Product, Customer, Order, CartItem, AgentAction } from '@/types';
import { ProductsRepository } from '@/lib/db/products';
import { CommerceAnalyticsRepository } from '@/lib/db/analytics';

export interface ToolResult<T = any> {
  success: boolean;
  toolName: string;
  data: T;
  executionTimeMs: number;
  explanation: string;
}

export const CommerceTools = {
  searchProducts: async (query: string, maxResults = 5): Promise<ToolResult<Product[]>> => {
    const start = Date.now();
    const result = await ProductsRepository.searchProducts({ query, limit: maxResults });

    return {
      success: true,
      toolName: 'searchProducts',
      data: result,
      executionTimeMs: Date.now() - start,
      explanation: `Database queried for "${query}". Found ${result.length} matching products.`,
    };
  },

  getProductDetails: async (productId: string): Promise<ToolResult<Product | null>> => {
    const start = Date.now();
    const product = (await ProductsRepository.getProductById(productId)) || null;
    return {
      success: !!product,
      toolName: 'getProductDetails',
      data: product,
      executionTimeMs: Date.now() - start,
      explanation: product ? `Retrieved specifications for ${product.name}` : `Product ${productId} not found`,
    };
  },

  getCheapestProduct: async (category?: string): Promise<ToolResult<Product>> => {
    const start = Date.now();
    const product = await ProductsRepository.getCheapestProduct(category);
    return {
      success: !!product,
      toolName: 'getCheapestProduct',
      data: product,
      executionTimeMs: Date.now() - start,
      explanation: `Queried database for lowest-priced product${category ? ` in ${category}` : ''}: ${product.name} (₹${product.price}).`,
    };
  },

  getMostExpensiveProduct: async (category?: string): Promise<ToolResult<Product>> => {
    const start = Date.now();
    const product = await ProductsRepository.getMostExpensiveProduct(category);
    return {
      success: !!product,
      toolName: 'getMostExpensiveProduct',
      data: product,
      executionTimeMs: Date.now() - start,
      explanation: `Queried database for highest-priced product${category ? ` in ${category}` : ''}: ${product.name} (₹${product.price}).`,
    };
  },

  getProductsByPriceRange: async (minPrice?: number, maxPrice?: number, category?: string): Promise<ToolResult<Product[]>> => {
    const start = Date.now();
    const products = await ProductsRepository.searchProducts({ minPrice, maxPrice, category, sortBy: 'rating' });
    return {
      success: true,
      toolName: 'getProductsByPriceRange',
      data: products,
      executionTimeMs: Date.now() - start,
      explanation: `Filtered database products in price range ₹${minPrice || 0} - ₹${maxPrice || '∞'}. Found ${products.length} items.`,
    };
  },

  compareProducts: async (idA: string, idB: string): Promise<ToolResult<{ productA?: Product; productB?: Product; priceDifference: number }>> => {
    const start = Date.now();
    const comparison = await ProductsRepository.compareProducts(idA, idB);
    return {
      success: true,
      toolName: 'compareProducts',
      data: comparison,
      executionTimeMs: Date.now() - start,
      explanation: `Compared database records for products ${idA} and ${idB}. Price difference: ₹${comparison.priceDifference}.`,
    };
  },

  getAnalyticsMetrics: async (): Promise<ToolResult<any>> => {
    const start = Date.now();
    const analytics = await CommerceAnalyticsRepository.getAnalytics();
    return {
      success: true,
      toolName: 'getAnalyticsMetrics',
      data: analytics,
      executionTimeMs: Date.now() - start,
      explanation: `Retrieved live database revenue and AI attribution analytics summary.`,
    };
  },

  getCampaigns: async (): Promise<ToolResult<any>> => {
    const start = Date.now();
    const campaigns = await CommerceAnalyticsRepository.getCampaigns();
    return {
      success: true,
      toolName: 'getCampaigns',
      data: campaigns,
      executionTimeMs: Date.now() - start,
      explanation: `Retrieved ${campaigns.length} active database campaigns.`,
    };
  },

  getAbandonedCarts: async (): Promise<ToolResult<any>> => {
    const start = Date.now();
    const carts = await CommerceAnalyticsRepository.getAbandonedCarts();
    return {
      success: true,
      toolName: 'getAbandonedCarts',
      data: carts,
      executionTimeMs: Date.now() - start,
      explanation: `Identified ${carts.length} abandoned checkouts requiring recovery intervention.`,
    };
  },

  getCustomerHistory: async (customerId: string): Promise<ToolResult<Customer | null>> => {
    const start = Date.now();
    const customer = store.getCustomerById(customerId) || null;
    return {
      success: !!customer,
      toolName: 'getCustomerHistory',
      data: customer,
      executionTimeMs: Date.now() - start,
      explanation: customer
        ? `Retrieved customer profile for ${customer.name}. Intent score: ${customer.intentScore}`
        : `Customer ${customerId} not found`,
    };
  },

  calculateCartValue: async (items: CartItem[]): Promise<ToolResult<{ subtotal: number; estimatedSavings: number; total: number }>> => {
    const start = Date.now();
    let subtotal = 0;
    let originalTotal = 0;

    items.forEach((item) => {
      subtotal += item.product.price * item.quantity;
      originalTotal += (item.product.originalPrice || item.product.price) * item.quantity;
    });

    const estimatedSavings = Math.max(0, originalTotal - subtotal);

    return {
      success: true,
      toolName: 'calculateCartValue',
      data: { subtotal, estimatedSavings, total: subtotal },
      executionTimeMs: Date.now() - start,
      explanation: `Calculated cart total: ₹${subtotal} across ${items.length} unique items.`,
    };
  },

  calculateDiscount: async (amount: number, discountPercentage: number): Promise<ToolResult<{ originalAmount: number; discountAmount: number; finalAmount: number }>> => {
    const start = Date.now();
    const discountAmount = Math.round((amount * discountPercentage) / 100);
    const finalAmount = amount - discountAmount;
    return {
      success: true,
      toolName: 'calculateDiscount',
      data: { originalAmount: amount, discountAmount, finalAmount },
      executionTimeMs: Date.now() - start,
      explanation: `Applied ${discountPercentage}% discount. Reduced ₹${amount} to ₹${finalAmount} (savings: ₹${discountAmount}).`,
    };
  },

  recommendBundle: async (primaryProductId: string): Promise<ToolResult<{ primaryProduct: Product; bundleProducts: Product[]; bundleDiscountPrice: number; totalValue: number }>> => {
    const start = Date.now();
    const primaryProduct = await ProductsRepository.getProductById(primaryProductId);
    if (!primaryProduct) {
      return {
        success: false,
        toolName: 'recommendBundle',
        data: null as any,
        executionTimeMs: Date.now() - start,
        explanation: 'Primary product not found',
      };
    }

    const allProducts = await ProductsRepository.getAllProducts();
    const complementaryProducts = primaryProduct.complementaryProductIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    const fallbackProducts = allProducts
      .filter((p) => p.category === primaryProduct.category && p.id !== primaryProduct.id)
      .slice(0, 2);

    const bundleItems = complementaryProducts.length > 0 ? complementaryProducts : fallbackProducts;
    const totalValue = primaryProduct.price + bundleItems.reduce((acc, item) => acc + item.price, 0);
    const bundleDiscountPrice = Math.round(totalValue * 0.85);

    return {
      success: true,
      toolName: 'recommendBundle',
      data: {
        primaryProduct,
        bundleProducts: bundleItems,
        bundleDiscountPrice,
        totalValue,
      },
      executionTimeMs: Date.now() - start,
      explanation: `Created dynamic bundle for ${primaryProduct.name} with ${bundleItems.map((b) => b.name).join(', ')}.`,
    };
  },

  createPaymentLink: async (customerId: string, amount: number, description: string): Promise<ToolResult<{ paymentLinkId: string; paymentUrl: string; expiresAt: string }>> => {
    const start = Date.now();
    const linkId = `plink_${Math.random().toString(36).substring(2, 10)}`;
    const paymentUrl = `https://rzp.io/l/antara_${linkId}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      success: true,
      toolName: 'createPaymentLink',
      data: {
        paymentLinkId: linkId,
        paymentUrl,
        expiresAt,
      },
      executionTimeMs: Date.now() - start,
      explanation: `Generated Razorpay Recovery Payment Link (${linkId}) for ₹${amount} expiring in 15 minutes.`,
    };
  },

  calculateConversionProbability: async (customerId: string, cartTotal: number): Promise<ToolResult<{ baseProbability: number; upsellProbability: number; recommendedAction: string }>> => {
    const start = Date.now();
    const customer = store.getCustomerById(customerId);

    const intentScore = customer ? customer.intentScore : 70;
    const baseProb = Math.min(0.95, Math.max(0.2, (intentScore / 100) * 0.95));
    const upsellProb = cartTotal > 3000 ? 0.65 : 0.42;

    let recommendedAction = 'Standard Checkout';
    if (intentScore >= 85 && cartTotal >= 2500) {
      recommendedAction = 'Recommend Bundle Cross-Sell (+15% AOV)';
    } else if (intentScore < 60) {
      recommendedAction = 'Offer 10% Instant Conversion Nudge';
    }

    return {
      success: true,
      toolName: 'calculateConversionProbability',
      data: {
        baseProbability: Number(baseProb.toFixed(2)),
        upsellProbability: Number(upsellProb.toFixed(2)),
        recommendedAction,
      },
      executionTimeMs: Date.now() - start,
      explanation: `Evaluated conversion probability at ${(baseProb * 100).toFixed(0)}%. Best action: ${recommendedAction}`,
    };
  },

  logAgentAction: async (action: Omit<AgentAction, 'id' | 'timestamp'>): Promise<ToolResult<AgentAction>> => {
    const start = Date.now();
    const createdAction = store.logAction(action);
    return {
      success: true,
      toolName: 'logAgentAction',
      data: createdAction,
      executionTimeMs: Date.now() - start,
      explanation: `Logged agent action [${createdAction.agentName}]: ${createdAction.title}`,
    };
  },
};
