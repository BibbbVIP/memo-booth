export interface StickerConfig {
  id: string;
  src: string;
  alt: string;
}

// Files live in public/stickers/1.png ... public/stickers/25.png
const STICKER_COUNT = 25;

export const STICKERS: StickerConfig[] = Array.from({ length: STICKER_COUNT }, (_, i) => ({
  id: `sticker-${i + 1}`,
  src: `/stickers/${i + 1}.png`,
  alt: `Sticker ${i + 1}`,
}));
