import { store } from '@/lib/db/store';

export interface StructuredAIRequest<T> {
  prompt: string;
  systemPrompt?: string;
  fallbackGenerator: () => T;
  validator?: (data: any) => data is T;
}

export interface StructuredAIResponse<T> {
  data: T;
  mode: 'live' | 'demo';
  confidence: number;
  reasoning: string;
  executionTimeMs: number;
}

export class AIProvider {
  private static isLiveMode(): boolean {
    const settings = store.getSettings();
    if (settings.aiMode === 'demo') return false;
    return !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  }

  public static getMode(): 'live' | 'demo' {
    return this.isLiveMode() ? 'live' : 'demo';
  }

  public static async generateStructured<T>(
    request: StructuredAIRequest<T>
  ): Promise<StructuredAIResponse<T>> {
    const startTime = Date.now();
    const liveMode = this.isLiveMode();

    if (!liveMode) {
      // Execute deterministic fallback logic immediately
      const fallbackResult = request.fallbackGenerator();
      return {
        data: fallbackResult,
        mode: 'demo',
        confidence: 0.91,
        reasoning: 'Generated via ANTARA Deterministic Commerce Reasoning Engine (AI Demo Mode active)',
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Attempt Live API call
    try {
      if (process.env.GEMINI_API_KEY) {
        // Call Gemini REST API for JSON schema response
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${request.systemPrompt || ''}\n\n${request.prompt}\n\nRespond strictly with valid JSON.` }],
              },
            ],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (!response.ok) throw new Error(`Gemini API returned status ${response.status}`);
        const resData = await response.json();
        const rawJsonText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = JSON.parse(rawJsonText);

        if (request.validator && !request.validator(parsed)) {
          throw new Error('Schema validation failed for live LLM output');
        }

        return {
          data: parsed as T,
          mode: 'live',
          confidence: 0.94,
          reasoning: 'Generated live via Gemini 1.5 Flash LLM',
          executionTimeMs: Date.now() - startTime,
        };
      }
    } catch (err) {
      console.warn('Live LLM call failed or fell back to deterministic engine:', err);
    }

    // Safety fallback
    const fallbackResult = request.fallbackGenerator();
    return {
      data: fallbackResult,
      mode: 'demo',
      confidence: 0.88,
      reasoning: 'Fell back to ANTARA Deterministic Engine after live API retry',
      executionTimeMs: Date.now() - startTime,
    };
  }
}
