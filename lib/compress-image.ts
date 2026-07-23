import sharp from "sharp";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 80;

export async function compressImageBuffer(input: Buffer): Promise<{
  buffer: Buffer;
  // Blob obrigatório no upload: passar Buffer direto ao storage corrompe os
  // bytes no runtime da Vercel (coerção UTF-8 no fetch patchado do Next).
  blob: Blob;
  contentType: string;
  extension: string;
}> {
  const buffer = await sharp(input)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  const contentType = "image/jpeg";

  return {
    buffer,
    blob: new Blob([new Uint8Array(buffer)], { type: contentType }),
    contentType,
    extension: "jpg",
  };
}
