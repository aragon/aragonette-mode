import { ICache } from "./ICache";
import { createClient, VercelKV } from "@vercel/kv";

export default class VercelCache implements ICache {
  client: VercelKV;

  constructor() {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
      throw new Error("Cache URL or token not found");
    }
    this.client = createClient({
      url,
      token,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    return this.client.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!ttl) {
      this.client.set<T>(key, value);
    } else {
      this.client.set<T>(key, value, { ex: ttl });
    }
  }

  async remove(key: string): Promise<void> {
    this.client.del(key);
  }

  async clear(): Promise<void> {
    this.client.flushdb();
  }
}
