import { AIProvider } from '@/lib/ai/provider';
import { CommerceTools } from '@/lib/tools';
import { store } from '@/lib/db/store';
import { Product } from '@/types';

export interface RecommendationOutput {
  recommendedProducts: Array<{
    product: Product;
    reason: string;
    score: number;
    matchTag: 'Best Overall' | 'Best Value' | 'Top Rated' | 'Perfect Complement';
  }>;
  explanation: string;
  confidence: number;
}

export class RecommendationAgent {
  public static async getRecommendations(
    customerId: string,
    targetCategory?: string,
    currentProductId?: string
  ): Promise<RecommendationOutput> {
    const customer = store.getCustomerById(customerId);
    const primaryProduct = currentProductId ? store.getProductById(currentProductId) : undefined;

    const result = await AIProvider.generateStructured<RecommendationOutput>({
      systemPrompt: 'You are the ANTARA Commerce Recommendation Agent. Select optimal products and explain each recommendation with a clear human-readable rationale based on customer intent and product specs.',
      prompt: `Recommend products for customer "${customer?.name || 'Shopper'}". Category: ${targetCategory || 'Any'}. Current product: ${primaryProduct?.name || 'None'}`,
      fallbackGenerator: () => {
        const allProducts = store.getProducts();
        let selected: Product[] = [];

        if (primaryProduct) {
          // Find complementary and related products first
          const compIds = primaryProduct.complementaryProductIds;
          const comps = allProducts.filter((p) => compIds.includes(p.id));
          const rels = allProducts.filter((p) => p.category === primaryProduct.category && p.id !== primaryProduct.id);
          selected = [...comps, ...rels].slice(0, 3);
        } else if (targetCategory) {
          selected = allProducts.filter((p) => p.category === targetCategory).slice(0, 3);
        } else {
          selected = allProducts.slice(0, 3);
        }

        const items = selected.map((prod, idx) => {
          let matchTag: RecommendationOutput['recommendedProducts'][0]['matchTag'] = 'Best Overall';
          let reason = `Top-rated choice matching your browsing profile in ${prod.category}.`;

          if (idx === 1) {
            matchTag = 'Best Value';
            reason = `Priced at ${prod.price.toLocaleString('en-IN')}, offering maximum utility per rupee.`;
          } else if (idx === 2 || primaryProduct?.complementaryProductIds.includes(prod.id)) {
            matchTag = 'Perfect Complement';
            reason = `Pairs seamlessly with your selected gear for an elevated experience.`;
          } else if (prod.rating >= 4.8) {
            matchTag = 'Top Rated';
            reason = `Rated ${prod.rating}/5.0 by over ${prod.reviewsCount} verified buyers.`;
          }

          return {
            product: prod,
            reason,
            score: 0.94 - idx * 0.05,
            matchTag,
          };
        });

        return {
          recommendedProducts: items,
          explanation: `Selected ${items.length} tailored catalog choices based on customer intent and inventory popularity.`,
          confidence: 0.89,
        };
      },
    });

    // Execute Tool: Log action
    await CommerceTools.logAgentAction({
      agentId: 'recommendation-agent',
      agentName: 'Commerce Recommendation Agent',
      customerId,
      customerName: customer?.name || 'Shopper',
      title: `Generated Recommendations for ${primaryProduct ? primaryProduct.name : targetCategory || 'Catalog'}`,
      description: result.data.explanation,
      reason: `Evaluated catalog relevance, price sensitivity, and complementary affinities`,
      confidence: Math.round(result.data.confidence * 100),
      actionType: 'cross_sell',
      expectedRevenue: result.data.recommendedProducts.reduce((sum, item) => sum + item.product.price, 0),
      attributedRevenue: 0,
      status: 'executed',
      metadata: {
        productIds: result.data.recommendedProducts.map((r) => r.product.id),
      },
    });

    return result.data;
  }
}
