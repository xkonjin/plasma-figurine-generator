// Simple storage abstraction that works with multiple backends
// Priority: Supabase > Upstash Redis > In-memory

interface StorageClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}

// In-memory storage (fallback)
const memoryStore: Map<string, unknown> = new Map();

class MemoryStorage implements StorageClient {
  async get<T>(key: string): Promise<T | null> {
    return (memoryStore.get(key) as T) || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    memoryStore.set(key, value);
  }
}

// Supabase storage (uses key-value table)
class SupabaseStorage implements StorageClient {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async get<T>(key: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from("figurine_kv")
      .select("value")
      .eq("key", key)
      .single();

    if (error || !data) return null;
    return data.value as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.supabase.from("figurine_kv").upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  }
}

// Upstash Redis storage
class UpstashStorage implements StorageClient {
  private redis: any;

  constructor(redis: any) {
    this.redis = redis;
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.redis.get(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.redis.set(key, value);
  }
}

let storageClient: StorageClient | null = null;

export async function getStorage(): Promise<StorageClient> {
  if (storageClient) {
    return storageClient;
  }

  // Try Supabase first
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );
      storageClient = new SupabaseStorage(supabase);
      console.log("Using Supabase storage");
      return storageClient;
    } catch (e) {
      console.log("Supabase not available:", e);
    }
  }

  // Try Upstash Redis
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      });
      storageClient = new UpstashStorage(redis);
      console.log("Using Upstash Redis storage");
      return storageClient;
    } catch (e) {
      console.log("Upstash Redis not available:", e);
    }
  }

  // Fall back to in-memory
  console.log("Using in-memory storage (data will not persist across deployments)");
  storageClient = new MemoryStorage();
  return storageClient;
}
