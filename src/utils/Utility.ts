/**
 * Allows time to pass
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hasDevQueryParam() {
  return process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).has("dev");
}
