// Simple storage abstraction that works with multiple backends
// Priority: Upstash Redis > Vercel KV > In-memory

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

// Vercel KV storage
class VercelKVStorage implements StorageClient {
  private kv: any;

  constructor(kv: any) {
    this.kv = kv;
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.kv.get(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.kv.set(key, value);
  }
}

let storageClient: StorageClient | null = null;

export async function getStorage(): Promise<StorageClient> {
  if (storageClient) {
    return storageClient;
  }

  // Try Upstash Redis first
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

  // Try Vercel KV
  if (process.env.KV_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      storageClient = new VercelKVStorage(kv);
      console.log("Using Vercel KV storage");
      return storageClient;
    } catch (e) {
      console.log("Vercel KV not available:", e);
    }
  }

  // Fall back to in-memory
  console.log("Using in-memory storage (data will not persist across deployments)");
  storageClient = new MemoryStorage();
  return storageClient;
}
