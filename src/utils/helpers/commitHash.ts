export function commitHash(): string {
  try {
    return __COMMIT_HASH__ ?? "DEV";
  } catch {
    return "DEV";
  }
}
