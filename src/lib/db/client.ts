import { store } from '@/lib/db/store';

export interface DatabaseConfig {
  supabaseUrl?: string;
  serviceKey?: string;
  isConfigured: boolean;
}

export class DatabaseClient {
  public static getConfig(): DatabaseConfig {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const isConfigured = !!(supabaseUrl && serviceKey);

    return {
      supabaseUrl,
      serviceKey,
      isConfigured,
    };
  }

  public static async queryTable<T>(
    table: string,
    fallback: () => T[]
  ): Promise<T[]> {
    const config = this.getConfig();

    if (!config.isConfigured || !config.supabaseUrl || !config.serviceKey) {
      return fallback();
    }

    try {
      const response = await fetch(`${config.supabaseUrl}/rest/v1/${table}?select=*`, {
        headers: {
          apikey: config.serviceKey,
          Authorization: `Bearer ${config.serviceKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Supabase REST query failed for ${table}: ${response.statusText}. Using fallback data.`);
        return fallback();
      }

      const data = await response.json();
      return (data && data.length > 0 ? data : fallback()) as T[];
    } catch (err) {
      console.warn(`Database query failed for ${table}:`, err);
      return fallback();
    }
  }
}
