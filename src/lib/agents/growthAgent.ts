import { AIProvider } from '@/lib/ai/provider';
import { CommerceTools } from '@/lib/tools';
import { store } from '@/lib/db/store';
import { CartItem, Product } from '@/types';

export interface GrowthAgentOutput {
  action: 'recommend_bundle' | 'offer_discount' | 'suggest_upsell' | 'nudge_checkout' | 'no_action';
  purchaseProbability: number;
  upsellProbability: number;
  recommendedProducts: Product[];
  bundleDiscountPrice?: number;
  discountPercentage?: number;
  expectedAdditionalRevenue: number;
  reasoning: string;
  confidence: number;
  actionTitle: string;
}

export class GrowthAgent {
  public static async evaluateGrowthIntervention(
    customerId: string,
    cartItems: CartItem[]
  ): Promise<GrowthAgentOutput> {
    const customer = store.getCustomerById(customerId);
    const cartCalc = await CommerceTools.calculateCartValue(cartItems);
    const cartTotal = cartCalc.data.total;

    const probEval = await CommerceTools.calculateConversionProbability(customerId, cartTotal);

    const result = await AIProvider.generateStructured<GrowthAgentOutput>({
      systemPrompt: 'You are the ANTARA Revenue Growth Agent. Evaluate customer cart items, purchase probability, and upsell potential to recommend incremental revenue interventions (bundles, cross-sells, or instant incentives).',
      prompt: `Customer "${customer?.name || 'Shopper'}". Cart Total: ₹${cartTotal}. Items: ${cartItems.map((i) => i.product.name).join(', ')}. Base prob: ${probEval.data.baseProbability}`,
      fallbackGenerator: () => {
        if (cartItems.length === 0) {
          return {
            action: 'no_action',
            purchaseProbability: 0.3,
            upsellProbability: 0.1,
            recommendedProducts: [],
            expectedAdditionalRevenue: 0,
            reasoning: 'Cart is empty. No growth intervention required.',
            confidence: 0.95,
            actionTitle: 'Cart Empty',
          };
        }

        const firstItem = cartItems[0].product;
        // Search complementary bundle via Tool
        const allProducts = store.getProducts();
        const complementary = allProducts.filter(
          (p) => firstItem.complementaryProductIds.includes(p.id) || (p.category === firstItem.category && p.id !== firstItem.id)
        ).slice(0, 2);

        const expectedRev = complementary.reduce((sum, item) => sum + Math.round(item.price * 0.85), 0);

        return {
          action: 'recommend_bundle',
          purchaseProbability: probEval.data.baseProbability,
          upsellProbability: probEval.data.upsellProbability,
          recommendedProducts: complementary,
          bundleDiscountPrice: Math.round((cartTotal + expectedRev) * 0.85),
          expectedAdditionalRevenue: expectedRev > 0 ? expectedRev : 599,
          reasoning: `Customer exhibits high purchase intent (${Math.round(probEval.data.baseProbability * 100)}%). Adding complementary accessories creates high-value bundle synergy.`,
          confidence: 0.87,
          actionTitle: `Recommend Dynamic Bundle (+₹${expectedRev > 0 ? expectedRev : 599} AOV)`,
        };
      },
    });

    // Log Agent Tool Execution
    if (result.data.action !== 'no_action') {
      await CommerceTools.logAgentAction({
        agentId: 'growth-agent',
        agentName: 'Revenue Growth Agent',
        customerId,
        customerName: customer?.name || 'Shopper',
        title: result.data.actionTitle,
        description: result.data.reasoning,
        reason: `Purchase probability (${Math.round(result.data.purchaseProbability * 100)}%), Upsell probability (${Math.round(result.data.upsellProbability * 100)}%)`,
        confidence: Math.round(result.data.confidence * 100),
        actionType: 'bundle_recommendation',
        expectedRevenue: result.data.expectedAdditionalRevenue,
        attributedRevenue: 0,
        status: 'executed',
        metadata: {
          productIds: result.data.recommendedProducts.map((p) => p.id),
          cartValue: cartTotal,
          signals: [`Probability: ${Math.round(result.data.purchaseProbability * 100)}%`, `Potential: +₹${result.data.expectedAdditionalRevenue}`],
        },
      });
    }

    return result.data;
  }
}
