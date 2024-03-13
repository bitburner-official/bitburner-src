export async function compress(dataString: string): Promise<Uint8Array> {
  const compressedReadableStream = new Blob([dataString]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(compressedReadableStream).arrayBuffer());
}

export async function decompress(binaryData: Uint8Array): Promise<string> {
  const decompressedReadableStream = new Blob([binaryData]).stream().pipeThrough(new DecompressionStream("gzip"));
  return await new Response(decompressedReadableStream).text();
}
