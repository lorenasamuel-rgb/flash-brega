import sharp from "sharp";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 80;

export async function compressImageBuffer(input: Buffer): Promise<{
  buffer: Buffer;
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

  return {
    buffer,
    contentType: "image/jpeg",
    extension: "jpg",
  };
}
