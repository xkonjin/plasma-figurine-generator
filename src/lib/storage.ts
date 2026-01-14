// Simple storage abstraction that works with multiple backends
// Priority: Upstash Redis > Vercel Blob > In-memory

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

// Vercel Blob storage (stores JSON files)
class BlobStorage implements StorageClient {
  async get<T>(key: string): Promise<T | null> {
    try {
      const { list, head } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: `${key}.json` });
      if (blobs.length === 0) return null;
      
      const response = await fetch(blobs[0].url);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const { put, del, list } = await import("@vercel/blob");
    
    // Delete old blob if exists
    try {
      const { blobs } = await list({ prefix: `${key}.json` });
      for (const blob of blobs) {
        await del(blob.url);
      }
    } catch {
      // Ignore deletion errors
    }
    
    // Upload new blob
    await put(`${key}.json`, JSON.stringify(value), {
      access: "public",
      contentType: "application/json",
    });
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

  // Try Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      storageClient = new BlobStorage();
      console.log("Using Vercel Blob storage");
      return storageClient;
    } catch (e) {
      console.log("Vercel Blob not available:", e);
    }
  }

  // Fall back to in-memory
  console.log("Using in-memory storage (data will not persist across deployments)");
  storageClient = new MemoryStorage();
  return storageClient;
}
