import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function db(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_URL!,
      authToken: process.env.TURSO_TOKEN,
    });
  }
  return _client;
}

export function nowMs(): number {
  return Date.now();
}

export function uuid(): string {
  return crypto.randomUUID();
}