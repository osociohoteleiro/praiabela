export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface CompressedImage {
  blob: Blob;
  ext: "webp" | "jpg";
}

/**
 * Redimensiona e comprime uma imagem no navegador usando canvas.
 * Tenta WebP (menor); cai para JPEG se o navegador não suportar.
 */
export async function compressImage(
  file: File,
  { maxWidth = 800, maxHeight = 1200, quality = 0.72 }: CompressOptions = {},
): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const webp = await toBlob(canvas, "image/webp", quality);
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };

  const jpeg = await toBlob(canvas, "image/jpeg", quality);
  if (jpeg) return { blob: jpeg, ext: "jpg" };

  throw new Error("Falha ao comprimir a imagem");
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
