const expiryThreshold = 15;

export function conditionToReloadData(state: { lastFetched: number; isUpdating: boolean }): void | boolean {
  const { lastFetched, isUpdating } = state;
  if (isUpdating) return false;
  if (lastFetched === -1) return;
  const currentTimestamp = Date.now();
  const isExpired = Math.abs(currentTimestamp - lastFetched) / 1000 > expiryThreshold;
  if (isExpired) {
    return;
  }
  return false;
}
