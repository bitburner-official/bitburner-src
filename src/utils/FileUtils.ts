export function downloadContentAsFile(content: BlobPart, filename: string): void {
  const blob = new Blob([content]);
  const anchorElement = document.createElement("a");
  const url = URL.createObjectURL(blob);
  anchorElement.href = url;
  anchorElement.download = filename;
  anchorElement.click();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 0);
}
