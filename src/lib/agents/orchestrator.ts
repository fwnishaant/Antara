import { AIProvider } from '@/lib/ai/provider';
import { RecommendationAgent } from '@/lib/agents/recommendationAgent';
import { GrowthAgent } from '@/lib/agents/growthAgent';
import { RecoveryAgent } from '@/lib/agents/recoveryAgent';
import { AnalystAgent } from '@/lib/agents/analystAgent';
import { ProductsRepository } from '@/lib/db/products';
import { CommerceAnalyticsRepository } from '@/lib/db/analytics';
import { Product } from '@/types';

export type BusinessIntentCategory =
  | 'PRODUCT_DISCOVERY'
  | 'PRODUCT_RECOMMENDATION'
  | 'PRODUCT_SEARCH'
  | 'PRICE_COMPARISON'
  | 'CHEAPEST_PRODUCT'
  | 'MOST_EXPENSIVE_PRODUCT'
  | 'BUDGET_FILTER'
  | 'BUDGET_SEARCH'
  | 'CART_GROWTH'
  | 'UPSELL'
  | 'CROSS_SELL'
  | 'PAYMENT_RECOVERY'
  | 'CART_ABANDONMENT'
  | 'MERCHANT_ANALYTICS'
  | 'REVENUE_ANALYSIS'
  | 'GENERAL_MERCHANT_QUERY'
  | 'GENERAL_HELP'
  | 'GENERAL_CONVERSATION'
  | 'CLARIFICATION_REQUIRED'
  | 'UNKNOWN';

export interface ExecutionStep {
  title: string;
  detail: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface OrchestrationResult {
  query: string;
  detectedCategory: BusinessIntentCategory;
  selectedAgentId: string;
  selectedAgentName: string;
  confidence: number;
  reasoning: string;
  executionSteps: ExecutionStep[];
  textResponse: string;
  aiMode: 'live' | 'demo';
  dataPayload?: {
    products?: Product[];
    recoveryStrategy?: {
      cartValue: number;
      recoveryProbability: number;
      paymentUrl: string;
      incentiveOffer: string;
    };
    growthIntervention?: {
      actionTitle: string;
      expectedAdditionalRevenue: number;
      recommendedProducts: Product[];
    };
    analyticsInsights?: {
      totalAiAttributedRevenue: number;
      aiContributionPercentage: number;
      conversionChangeText: string;
      recommendedMerchantActions: string[];
    };
  };
}

export class AgentOrchestrator {
  public static async orchestrate(
    query: string,
    customerId = 'cust_1042',
    contextCartItems: any[] = []
  ): Promise<OrchestrationResult> {
    const qLower = query.toLowerCase().trim();
    const aiMode = AIProvider.getMode();

    // Helper: Normalize Budget / Currency (e.g. 5k -> 5000, Rs 5000 -> 5000)
    const extractAmount = (text: string): number | null => {
      const matchK = text.match(/(\d+)\s*k\b/i);
      if (matchK) return parseInt(matchK[1], 10) * 1000;

      const matchNum = text.match(/(?:rs\.?|₹)?\s*(\d+[\d,]*)/i);
      if (matchNum) {
        const val = parseInt(matchNum[1].replace(/,/g, ''), 10);
        return isNaN(val) ? null : val;
      }
      return null;
    };

    // 1. KEYWORD PATTERN MATCHERS
    const recoveryKeywords = [
      'abandoned',
      'abandon',
      'cart abandoned',
      'checkout abandoned',
      'payment failed',
      'payment failure',
      'payment declined',
      'transaction failed',
      "didn't complete payment",
      "didn't pay",
      'recover customer',
      'recover payment',
      'recover revenue',
      'lost sale',
      'lost checkout',
      'failed checkout',
      'purchase failed',
      'checkout drop',
      'payment timeout',
      'bank failure',
    ];

    const cheapestKeywords = [
      'cheapest',
      'least expensive',
      'lowest price',
      'lowest priced',
      'least money',
      'cheapest item',
      'cheapest product',
      'cheapest thing',
      'lowest cost',
      'which is cheapest',
    ];

    const mostExpensiveKeywords = [
      'most expensive',
      'highest price',
      'highest priced',
      'costs the most',
      'highest cost',
      'most pricey',
      'expensive item',
      'expensive product',
      'expensive thing',
      'costs most',
      'highest price product',
      'most expensive product',
      'most expensive item',
      'buy most expensive',
      'which product costs',
      'priciest',
    ];

    const compareKeywords = [
      'compare',
      'which is cheaper',
      'which costs less',
      'versus',
      ' vs ',
      'difference between',
    ];

    const generalConversationKeywords = [
      'lost',
      "i'm lost",
      'im lost',
      'what should i do',
      'what can you do',
      'help me',
      'help',
      'hello',
      'hi',
      'hey',
      'who are you',
      'what is antara',
      'what can you help',
      "i don't know what to buy",
      'dont know what to buy',
      'what to buy',
      'can you help me',
    ];

    const analyticsKeywords = [
      'my revenue',
      'total revenue',
      'what is my revenue',
      'analytics',
      'conversion rate',
      'performance this month',
      'merchant metrics',
      'how much revenue',
      'sales doing',
    ];

    const growthKeywords = [
      'increase revenue',
      'increase sales',
      'increase aov',
      'average order value',
      'falling',
      'drop in sales',
      'upsell',
      'growth opportunity',
      'increase retention',
    ];

    const crossSellKeywords = [
      'cross sell',
      'bundle',
      'what goes with',
      'accessories should i buy',
      'alongside',
      'complementary',
    ];

    const budgetKeywords = ['under', 'below', 'budget', 'less than', 'around', 'have ₹', 'can i buy for'];

    const searchKeywords = [
      'show all',
      'what headphones',
      'list all',
      'every ',
      'give me all',
      'available options',
      'show headphones',
      'got any',
      'show me all',
      'list every',
    ];

    // DETERMINISTIC PRIORITY CATEGORY CLASSIFICATION
    const detectCategory = (): BusinessIntentCategory => {
      if (recoveryKeywords.some((kw) => qLower.includes(kw))) {
        return 'PAYMENT_RECOVERY';
      }
      if (compareKeywords.some((kw) => qLower.includes(kw))) {
        return 'PRICE_COMPARISON';
      }
      if (mostExpensiveKeywords.some((kw) => qLower.includes(kw))) {
        return 'MOST_EXPENSIVE_PRODUCT';
      }
      if (cheapestKeywords.some((kw) => qLower.includes(kw))) {
        return 'CHEAPEST_PRODUCT';
      }
      if (generalConversationKeywords.some((kw) => qLower === kw || qLower.includes(kw))) {
        return 'GENERAL_CONVERSATION';
      }
      if (analyticsKeywords.some((kw) => qLower.includes(kw))) {
        return 'MERCHANT_ANALYTICS';
      }
      if (crossSellKeywords.some((kw) => qLower.includes(kw))) {
        return 'CROSS_SELL';
      }
      if (growthKeywords.some((kw) => qLower.includes(kw))) {
        return 'CART_GROWTH';
      }
      if (searchKeywords.some((kw) => qLower.includes(kw))) {
        return 'PRODUCT_SEARCH';
      }
      if (budgetKeywords.some((kw) => qLower.includes(kw)) && extractAmount(qLower) !== null) {
        return 'BUDGET_FILTER';
      }
      if (qLower.length < 15 && (qLower.includes('something good') || qLower.includes('show me something'))) {
        return 'CLARIFICATION_REQUIRED';
      }
      return 'PRODUCT_RECOMMENDATION';
    };

    const category: BusinessIntentCategory = detectCategory();

    // ROUTING BRANCHES

    // BRANCH 1: GENERAL_CONVERSATION / GENERAL_HELP
    if (category === 'GENERAL_CONVERSATION' || category === 'GENERAL_HELP') {
      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as GENERAL_CONVERSATION', status: 'completed' },
        { title: 'Agent Selection', detail: 'Selected ANTARA Assistant', status: 'completed' },
        { title: 'Capability Guidance', detail: 'Loaded assistant commerce capabilities', status: 'completed' },
      ];

      return {
        query,
        detectedCategory: 'GENERAL_CONVERSATION',
        selectedAgentId: 'general-assistant',
        selectedAgentName: 'ANTARA Commerce Assistant',
        confidence: 0.98,
        reasoning: 'Customer provided a general conversation or guidance request. Answered conversationally without forcing product recommendations.',
        executionSteps: steps,
        textResponse: `I am ANTARA, your Autonomous AI Commerce Assistant. I can help you with:

• Finding the cheapest or most expensive products in the catalog
• Recommending items matching your budget or specific preferences
• Increasing cart value & Average Order Value (AOV)
• Recovering lost revenue from abandoned checkouts via Razorpay Payment Links
• Auditing merchant sales & conversion analytics

Tell me what you are shopping for, your approximate budget, or what you'd like to do!`,
        aiMode,
        dataPayload: {
          products: [],
        },
      };
    }

    // BRANCH 2: CLARIFICATION_REQUIRED
    if (category === 'CLARIFICATION_REQUIRED') {
      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as CLARIFICATION_REQUIRED', status: 'completed' },
        { title: 'Agent Selection', detail: 'Selected ANTARA Assistant', status: 'completed' },
      ];

      return {
        query,
        detectedCategory: 'CLARIFICATION_REQUIRED',
        selectedAgentId: 'general-assistant',
        selectedAgentName: 'ANTARA Commerce Assistant',
        confidence: 0.90,
        reasoning: 'Query was ambiguous. Solicit category or budget parameters from user.',
        executionSteps: steps,
        textResponse: 'I can help — what are you looking for? You can give me a product category (Electronics, Fitness, Fashion, Accessories, Home), a budget (e.g. under ₹5,000), or a specific goal (e.g. recover payment, increase AOV).',
        aiMode,
        dataPayload: {
          products: [],
        },
      };
    }

    // BRANCH 3: PRICE_COMPARISON
    if (category === 'PRICE_COMPARISON') {
      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as PRICE_COMPARISON', status: 'completed' },
        { title: 'Database Tool', detail: 'Executing compareProducts() database query', status: 'completed' },
      ];

      const allProducts = await ProductsRepository.getAllProducts();
      const prodA = allProducts.find((p) => qLower.includes('aeropulse') || p.id === 'prod_1') || allProducts[0];
      const prodB = allProducts.find((p) => qLower.includes('soundmotion') || p.id === 'prod_2') || allProducts[1];

      const cheaper = prodA.price < prodB.price ? prodA : prodB;
      const expensive = prodA.price >= prodB.price ? prodA : prodB;
      const diff = expensive.price - cheaper.price;

      steps.push({ title: 'Comparison Result', detail: `${cheaper.name} is ₹${diff.toLocaleString('en-IN')} cheaper than ${expensive.name}`, status: 'completed' });

      return {
        query,
        detectedCategory: 'PRICE_COMPARISON',
        selectedAgentId: 'recommendation-agent',
        selectedAgentName: 'Catalog Intelligence',
        confidence: 0.96,
        reasoning: `Queried database records for ${prodA.name} (₹${prodA.price.toLocaleString('en-IN')}) and ${prodB.name} (₹${prodB.price.toLocaleString('en-IN')}).`,
        executionSteps: steps,
        textResponse: `Comparing ${prodA.name} (₹${prodA.price.toLocaleString('en-IN')}) vs ${prodB.name} (₹${prodB.price.toLocaleString('en-IN')}):

${cheaper.name} is ₹${diff.toLocaleString('en-IN')} less expensive.`,
        aiMode,
        dataPayload: {
          products: [prodA, prodB],
        },
      };
    }

    // BRANCH 4: MOST_EXPENSIVE_PRODUCT
    if (category === 'MOST_EXPENSIVE_PRODUCT') {
      let categoryFilter: string | undefined = undefined;
      if (qLower.includes('headphone') || qLower.includes('audio')) categoryFilter = 'Electronics';
      else if (qLower.includes('shoe') || qLower.includes('fitness')) categoryFilter = 'Fitness';
      else if (qLower.includes('chair') || qLower.includes('home')) categoryFilter = 'Home';

      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as MOST_EXPENSIVE_PRODUCT', status: 'completed' },
        { title: 'Database Tool', detail: `Executing getMostExpensiveProduct(${categoryFilter || ''})`, status: 'completed' },
        { title: 'Price Ranking', detail: 'Sorting database items by price descending', status: 'completed' },
      ];

      const mostExpensiveProduct = await ProductsRepository.getMostExpensiveProduct(categoryFilter);

      steps.push({ title: 'Result Selection', detail: `Selected highest-priced item (${mostExpensiveProduct.name} — ₹${mostExpensiveProduct.price.toLocaleString('en-IN')})`, status: 'completed' });

      return {
        query,
        detectedCategory: 'MOST_EXPENSIVE_PRODUCT',
        selectedAgentId: 'recommendation-agent',
        selectedAgentName: 'Catalog Intelligence',
        confidence: 0.98,
        reasoning: `Queried database and identified ${mostExpensiveProduct.name} at ₹${mostExpensiveProduct.price.toLocaleString('en-IN')} as the maximum-priced product.`,
        executionSteps: steps,
        textResponse: `The most expensive item currently available in the ANTARA catalog is:

${mostExpensiveProduct.name} — ₹${mostExpensiveProduct.price.toLocaleString('en-IN')}`,
        aiMode,
        dataPayload: {
          products: [mostExpensiveProduct],
        },
      };
    }

    // BRANCH 5: CHEAPEST_PRODUCT
    if (category === 'CHEAPEST_PRODUCT') {
      let categoryFilter: string | undefined = undefined;
      if (qLower.includes('headphone') || qLower.includes('speaker') || qLower.includes('audio') || qLower.includes('electronics')) {
        categoryFilter = 'Electronics';
      } else if (qLower.includes('shoe') || qLower.includes('mat') || qLower.includes('fitness') || qLower.includes('run')) {
        categoryFilter = 'Fitness';
      } else if (qLower.includes('shirt') || qLower.includes('jacket') || qLower.includes('fashion') || qLower.includes('sunglasses')) {
        categoryFilter = 'Fashion';
      } else if (qLower.includes('chair') || qLower.includes('lamp') || qLower.includes('mug') || qLower.includes('home')) {
        categoryFilter = 'Home';
      }

      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as CHEAPEST_PRODUCT', status: 'completed' },
        { title: 'Database Tool', detail: `Executing getCheapestProduct(${categoryFilter || ''})`, status: 'completed' },
        { title: 'Price Ranking', detail: 'Sorting database items by price ascending', status: 'completed' },
      ];

      const cheapestProduct = await ProductsRepository.getCheapestProduct(categoryFilter);

      steps.push({ title: 'Result Selection', detail: `Selected lowest-priced item (${cheapestProduct.name} — ₹${cheapestProduct.price.toLocaleString('en-IN')})`, status: 'completed' });

      return {
        query,
        detectedCategory: 'CHEAPEST_PRODUCT',
        selectedAgentId: 'recommendation-agent',
        selectedAgentName: 'Catalog Intelligence',
        confidence: 0.97,
        reasoning: `Queried database and identified ${cheapestProduct.name} at ₹${cheapestProduct.price.toLocaleString('en-IN')} as the minimum-priced product.`,
        executionSteps: steps,
        textResponse: `The cheapest item currently available ${categoryFilter ? `in ${categoryFilter}` : 'in the catalog'} is:

${cheapestProduct.name} — ₹${cheapestProduct.price.toLocaleString('en-IN')}`,
        aiMode,
        dataPayload: {
          products: [cheapestProduct],
        },
      };
    }

    // BRANCH 6: PRODUCT_SEARCH
    if (category === 'PRODUCT_SEARCH') {
      let searchTerm = 'headphone';
      if (qLower.includes('speaker')) searchTerm = 'speaker';
      else if (qLower.includes('watch')) searchTerm = 'watch';
      else if (qLower.includes('shoe')) searchTerm = 'shoe';
      else if (qLower.includes('cable')) searchTerm = 'cable';
      else if (qLower.includes('lamp')) searchTerm = 'lamp';
      else if (qLower.includes('case')) searchTerm = 'case';

      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as PRODUCT_SEARCH', status: 'completed' },
        { title: 'Database Tool', detail: `Executing searchProducts("${searchTerm}")`, status: 'completed' },
      ];

      const results = await ProductsRepository.searchProducts({ query: searchTerm, limit: 5 });

      return {
        query,
        detectedCategory: 'PRODUCT_SEARCH',
        selectedAgentId: 'recommendation-agent',
        selectedAgentName: 'Catalog Intelligence',
        confidence: 0.96,
        reasoning: `Queried database for "${searchTerm}" and returned ${results.length} matching products.`,
        executionSteps: steps,
        textResponse: `Found ${results.length} matching item(s) in the ANTARA database catalog for "${searchTerm}":`,
        aiMode,
        dataPayload: {
          products: results,
        },
      };
    }

    // BRANCH 7: BUDGET_FILTER / BUDGET_SEARCH
    if (category === 'BUDGET_FILTER' || category === 'BUDGET_SEARCH') {
      const budgetLimit = extractAmount(qLower) || 5000;

      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as BUDGET_FILTER', status: 'completed' },
        { title: 'Database Tool', detail: `Executing getProductsByPriceRange(0, ${budgetLimit})`, status: 'completed' },
        { title: 'Catalog Ranking', detail: 'Sorting items by relevance & user rating', status: 'completed' },
      ];

      const budgetMatches = await ProductsRepository.searchProducts({ maxPrice: budgetLimit, sortBy: 'rating' });

      if (budgetMatches.length === 0) {
        return {
          query,
          detectedCategory: 'BUDGET_FILTER',
          selectedAgentId: 'recommendation-agent',
          selectedAgentName: 'Commerce Recommendation Agent',
          confidence: 0.91,
          reasoning: `No database items found under ₹${budgetLimit.toLocaleString('en-IN')}.`,
          executionSteps: steps,
          textResponse: `There are currently no products in the ANTARA catalog below ₹${budgetLimit.toLocaleString('en-IN')}. Try searching with a higher budget limit.`,
          aiMode,
          dataPayload: {
            products: [],
          },
        };
      }

      const results = budgetMatches.slice(0, 4);

      return {
        query,
        detectedCategory: 'BUDGET_FILTER',
        selectedAgentId: 'recommendation-agent',
        selectedAgentName: 'Commerce Recommendation Agent',
        confidence: 0.93,
        reasoning: `Found ${budgetMatches.length} database products within budget limit of ₹${budgetLimit.toLocaleString('en-IN')}.`,
        executionSteps: steps,
        textResponse: `I found ${budgetMatches.length} product${budgetMatches.length > 1 ? 's' : ''} in the database under ₹${budgetLimit.toLocaleString('en-IN')}:`,
        aiMode,
        dataPayload: {
          products: results,
        },
      };
    }

    // BRANCH 8: PAYMENT_RECOVERY / CART_ABANDONMENT
    if (category === 'PAYMENT_RECOVERY' || category === 'CART_ABANDONMENT') {
      const extractedAmount = extractAmount(qLower) || 2000;

      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as PAYMENT_RECOVERY', status: 'completed' },
        { title: 'Agent Selection', detail: 'Selected Revenue Recovery Agent', status: 'completed' },
        { title: 'Cart Signal Analysis', detail: `Evaluating ₹${extractedAmount.toLocaleString('en-IN')} checkout dropoff signal`, status: 'completed' },
        { title: 'Razorpay Strategy', detail: 'Prepared Payment Link & 15-min priority dispatch incentive', status: 'completed' },
      ];

      const recoveryOutput = await RecoveryAgent.analyzeRecoveryOpportunity(
        customerId,
        extractedAmount,
        'Abandoned payment / gateway timeout signal'
      );

      return {
        query,
        detectedCategory: 'PAYMENT_RECOVERY',
        selectedAgentId: 'recovery-agent',
        selectedAgentName: 'Revenue Recovery Agent',
        confidence: 0.95,
        reasoning: `Detected payment failure / checkout abandonment for ₹${extractedAmount.toLocaleString('en-IN')}. Invoked Revenue Recovery Agent to deploy instant Razorpay Payment Link workflow.`,
        executionSteps: steps,
        textResponse: `This looks like a high-intent abandoned checkout. The Revenue Recovery Agent recommends sending an instant Razorpay Payment Link with the 15-minute priority dispatch incentive.`,
        aiMode,
        dataPayload: {
          recoveryStrategy: {
            cartValue: extractedAmount,
            recoveryProbability: recoveryOutput.recoveryProbability,
            paymentUrl: recoveryOutput.paymentUrl,
            incentiveOffer: recoveryOutput.incentiveOffer,
          },
        },
      };
    }

    // BRANCH 9: MERCHANT_ANALYTICS / REVENUE_ANALYSIS
    if (category === 'MERCHANT_ANALYTICS' || category === 'REVENUE_ANALYSIS') {
      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as MERCHANT_ANALYTICS', status: 'completed' },
        { title: 'Agent Selection', detail: 'Selected Autonomous Growth Analyst', status: 'completed' },
        { title: 'Database Metric Audit', detail: 'Aggregating revenue logs & AI attribution metrics', status: 'completed' },
      ];

      const insights = await AnalystAgent.analyzeMerchantPerformance();

      return {
        query,
        detectedCategory: 'MERCHANT_ANALYTICS',
        selectedAgentId: 'analyst-agent',
        selectedAgentName: 'Autonomous Growth Analyst',
        confidence: 0.96,
        reasoning: 'Aggregated actual database sales metrics and AI revenue attribution contribution.',
        executionSteps: steps,
        textResponse: `${insights.dataDrivenExplanation} Current total revenue is ₹${insights.totalAiAttributedRevenue.toLocaleString('en-IN')} attributed directly to AI agents (${insights.aiContributionPercentage}% contribution).`,
        aiMode,
        dataPayload: {
          analyticsInsights: {
            totalAiAttributedRevenue: insights.totalAiAttributedRevenue,
            aiContributionPercentage: insights.aiContributionPercentage,
            conversionChangeText: insights.conversionChangeText,
            recommendedMerchantActions: insights.recommendedMerchantActions,
          },
        },
      };
    }

    // BRANCH 10: CART_GROWTH / UPSELL / CROSS_SELL
    if (category === 'CART_GROWTH' || category === 'UPSELL' || category === 'CROSS_SELL') {
      const steps: ExecutionStep[] = [
        { title: 'Intent Classification', detail: 'Identified as CART_GROWTH', status: 'completed' },
        { title: 'Agent Selection', detail: 'Selected Revenue Growth Agent', status: 'completed' },
        { title: 'Basket Lift Evaluation', detail: 'Calculating upsell probability & complementary bundle synergies', status: 'completed' },
      ];

      const growthOutput = await GrowthAgent.evaluateGrowthIntervention(customerId, contextCartItems);

      return {
        query,
        detectedCategory: 'CART_GROWTH',
        selectedAgentId: 'growth-agent',
        selectedAgentName: 'Revenue Growth Agent',
        confidence: 0.89,
        reasoning: 'Analyzed merchant AOV metrics and customer category affinities to suggest high-conversion dynamic bundles.',
        executionSteps: steps,
        textResponse: `To increase revenue and lift Average Order Value, the Revenue Growth Agent recommends bundling complementary care accessories and fast-charging gear. Expected incremental lift: +₹${growthOutput.expectedAdditionalRevenue.toLocaleString('en-IN')} per order.`,
        aiMode,
        dataPayload: {
          growthIntervention: {
            actionTitle: growthOutput.actionTitle,
            expectedAdditionalRevenue: growthOutput.expectedAdditionalRevenue,
            recommendedProducts: growthOutput.recommendedProducts,
          },
        },
      };
    }

    // BRANCH 11: DEFAULT PRODUCT_RECOMMENDATION
    const steps: ExecutionStep[] = [
      { title: 'Intent Classification', detail: 'Identified as PRODUCT_RECOMMENDATION', status: 'completed' },
      { title: 'Agent Selection', detail: 'Selected Commerce Recommendation Agent', status: 'completed' },
      { title: 'Catalog Search & Ranking', detail: 'Filtering products matching query specifications', status: 'completed' },
    ];

    const recOutput = await RecommendationAgent.getRecommendations(customerId, undefined);
    const recProducts = recOutput.recommendedProducts.map((r) => r.product);

    return {
      query,
      detectedCategory: 'PRODUCT_RECOMMENDATION',
      selectedAgentId: 'recommendation-agent',
      selectedAgentName: 'Commerce Recommendation Agent',
      confidence: 0.91,
      reasoning: `Found ${recProducts.length} high-relevance catalog choices matching query "${query}".`,
      executionSteps: steps,
      textResponse: `Based on your request ("${query}"), here are top recommended items selected by the Commerce Recommendation Agent:`,
      aiMode,
      dataPayload: {
        products: recProducts,
      },
    };
  }
}
