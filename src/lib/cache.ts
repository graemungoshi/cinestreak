// Per-isolate cache with request de-duplication and stale-on-error.
// Slice 2: back this with Cloudflare KV so it is shared across isolates.
const store = new Map<string, { exp: number; val: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.exp > Date.now()) return hit.val as T;
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;
  const run = fn()
    .then((val) => {
      store.set(key, { exp: Date.now() + ttlSec * 1000, val });
      return val;
    })
    .catch((err) => {
      if (hit) return hit.val as T; // serve stale data rather than fail
      throw err;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, run);
  return run;
}
