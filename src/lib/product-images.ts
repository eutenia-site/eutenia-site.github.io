import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { url } from './paths';

const productImages = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/produtos/**/*.{jpg,jpeg,png,webp,avif}',
);

/** Product JSON paths are relative to src/assets; legacy public images remain supported. */
export async function productImage(path: string): Promise<string> {
  if (!path.startsWith('produtos/')) return url(path);
  const load = productImages[`../assets/${path}`];
  if (!load) throw new Error(`Foto de produto não encontrada em src/assets: ${path}`);
  const { default: source } = await load();
  const optimized = await getImage({
    src: source,
    width: Math.min(source.width, 800),
    format: 'webp',
    quality: 85,
  });
  return optimized.src;
}
