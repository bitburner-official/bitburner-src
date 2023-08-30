export function hash(): string {
  try {
    return __COMMIT_HASH__ ?? "DEV";
  } catch {
    return "DEV";
  }
}
