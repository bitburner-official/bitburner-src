export async function digestSHA256(input: string): Promise<string> {
  const inputUInt8Array = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", inputUInt8Array);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
