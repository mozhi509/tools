/**
 * Redis 不可用时分享数据暂存（仅当前进程内，重启后丢失；适合本地开发）
 */
const store = new Map<string, { value: string; exp: number }>();

export function setShareMemory(shareId: string, json: string, ttlSec: number): void {
  store.set(shareId, { value: json, exp: Date.now() + ttlSec * 1000 });
}

export function getShareMemory(shareId: string): string | null {
  const row = store.get(shareId);
  if (!row) return null;
  if (Date.now() > row.exp) {
    store.delete(shareId);
    return null;
  }
  return row.value;
}
