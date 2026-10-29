import { AIProvider } from '@/lib/ai/provider';
import { CommerceTools } from '@/lib/tools';
import { store } from '@/lib/db/store';

export interface IntentAnalysisOutput {
  intent: string;
  confidence: number;
  budget: 'low' | 'medium' | 'high';
  preferences: string[];
  urgency: 'low' | 'medium' | 'high';
  targetCategory: string;
  summary: string;
  recommendedProductIds: string[];
}

export class IntentAgent {
  public static async analyzeIntent(
    customerId: string,
    searchQuery?: string,
    viewedProductIds: string[] = []
  ): Promise<IntentAnalysisOutput> {
    const customer = store.getCustomerById(customerId);
    const queryStr = searchQuery || (viewedProductIds.length > 0 ? 'viewed products' : 'general browsing');

    const result = await AIProvider.generateStructured<IntentAnalysisOutput>({
      systemPrompt: 'You are the ANTARA Intent Intelligence Agent. Decode customer natural language search, browsing history, and behavioral signals into structured intent JSON.',
      prompt: `Analyze customer "${customer?.name || 'Anonymous'}" query: "${queryStr}". Viewed products: ${viewedProductIds.join(', ')}`,
      fallbackGenerator: () => {
        const q = queryStr.toLowerCase();
        let budget: 'low' | 'medium' | 'high' = 'medium';
        let category = 'Electronics';
        let intent = 'browsing_general';
        let prefs = ['durable', 'value-for-money'];

        if (q.includes('shoe') || q.includes('run') || q.includes('fitness') || q.includes('mat')) {
          category = 'Fitness';
          intent = 'buying_fitness_gear';
          prefs = ['lightweight', 'daily-use', 'breathable'];
          if (q.includes('5000') || q.includes('3000')) budget = 'medium';
        } else if (q.includes('headphone') || q.includes('speaker') || q.includes('audio') || q.includes('anc')) {
          category = 'Electronics';
          intent = 'buying_audio_gear';
          prefs = ['wireless', 'noise-cancelling', 'long-battery'];
          budget = 'high';
        } else if (q.includes('laptop') || q.includes('backpack') || q.includes('jacket') || q.includes('shirt')) {
          category = 'Fashion';
          intent = 'buying_fashion_accessories';
          prefs = ['minimalist', 'premium-leather', 'water-resistant'];
        } else if (q.includes('chair') || q.includes('lamp') || q.includes('coffee') || q.includes('mug')) {
          category = 'Home';
          intent = 'buying_home_ergonomics';
          prefs = ['comfort', 'smart-lighting', 'aesthetic'];
        }

        const matchingProducts = store
          .getProducts()
          .filter((p) => p.category === category || p.name.toLowerCase().includes(q))
          .slice(0, 3)
          .map((p) => p.id);

        return {
          intent,
          confidence: 0.91,
          budget,
          preferences: prefs,
          urgency: q.includes('fast') || q.includes('urgent') ? 'high' : 'medium',
          targetCategory: category,
          summary: `Customer intent decoded as "${intent.replace('_', ' ')}". Target category: ${category}. Budget tier: ${budget}.`,
          recommendedProductIds: matchingProducts,
        };
      },
    });

    // Execute Tool: Log agent activity
    await CommerceTools.logAgentAction({
      agentId: 'intent-agent',
      agentName: 'Intent Intelligence Agent',
      customerId,
      customerName: customer?.name || 'Shopper',
      title: `Analyzed Search & Intent: "${queryStr}"`,
      description: result.data.summary,
      reason: `Processed NLP query signals & ${viewedProductIds.length} viewed catalog items`,
      confidence: Math.round(result.data.confidence * 100),
      actionType: 'personalized_nudge',
      expectedRevenue: 0,
      attributedRevenue: 0,
      status: 'executed',
      metadata: {
        signals: [result.data.intent, `Budget: ${result.data.budget}`, `Category: ${result.data.targetCategory}`],
        preferences: result.data.preferences,
      },
    });

    return result.data;
  }
}
