export function hash(): string {
  try {
    if (__COMMIT_HASH__) {
      return __COMMIT_HASH__;
    }
  } catch (err) {
    console.error("Failed to get commit hash.");
  }
  return "DEV";
}
