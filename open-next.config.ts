import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';

// Free-plan setup. The site only uses time-based ISR (`revalidate = 300`), so
// there is no tag cache, and the in-memory queue is enough to trigger
// background regeneration. If revalidateTag/revalidatePath are ever added, a
// D1 tag cache and the Durable Object queue become necessary.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: memoryQueue,
});
