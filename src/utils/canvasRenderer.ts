import { FrameConfig, FrameStyle, PlacedSticker, SlotRect } from '../types';

/** Final export is drawn at 2x the logical size (e.g. 1200 x 3600 for 4 slots). */
export const EXPORT_SCALE = 2;

interface RenderOptions {
  scale?: number; // defaults to EXPORT_SCALE
  placeholder?: boolean; // grey empty slots, used for frame thumbnails
  stickers?: PlacedSticker[]; // drawn on top of everything, including the frame overlay
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.slice(0, 60)}`));
    img.src = src;
  });
}

function roundedRectPath(ctx: CanvasRenderingContext2D, r: SlotRect, radius: number) {
  const rad = Math.min(radius, r.w / 2, r.h / 2);
  ctx.beginPath();
  ctx.moveTo(r.x + rad, r.y);
  ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad);
  ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad);
  ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad);
  ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad);
  ctx.closePath();
}

/** "object-fit: cover": crop the source so it fills the slot without stretching. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, r: SlotRect) {
  const imgRatio = img.width / img.height;
  const slotRatio = r.w / r.h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > slotRatio) {
    sw = img.height * slotRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / slotRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, r.x, r.y, r.w, r.h);
}

function drawBackground(ctx: CanvasRenderingContext2D, frame: FrameConfig) {
  const bg = frame.style?.background;
  if (Array.isArray(bg)) {
    const gradient = ctx.createLinearGradient(0, 0, 0, frame.height);
    gradient.addColorStop(0, bg[0]);
    gradient.addColorStop(1, bg[1]);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = bg ?? '#ffffff';
  }
  ctx.fillRect(0, 0, frame.width, frame.height);
}

function drawSlot(
  ctx: CanvasRenderingContext2D,
  rect: SlotRect,
  img: HTMLImageElement | null,
  style: FrameStyle | undefined,
  placeholder: boolean
) {
  const radius = style?.slotRadius ?? 0;

  ctx.save();
  roundedRectPath(ctx, rect, radius);
  ctx.clip();
  if (img) {
    drawCover(ctx, img, rect);
  } else if (placeholder) {
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  ctx.restore();

  if (style && style.slotBorderWidth > 0) {
    roundedRectPath(ctx, rect, radius);
    ctx.lineWidth = style.slotBorderWidth;
    ctx.strokeStyle = style.slotBorderColor;
    ctx.stroke();
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, frame: FrameConfig, style: FrameStyle) {
  const lastSlot = frame.slotRects[frame.slotRects.length - 1];
  const footerTop = lastSlot.y + lastSlot.h;
  const centerY = footerTop + (frame.height - footerTop) / 2;
  const centerX = frame.width / 2;

  // Scale up the fonts for 1200px wide frames (Postcard)
  const isLargeFrame = frame.width >= 1000;
  const titleFontSize = isLargeFrame ? 54 : 36;
  const dateFontSize = isLargeFrame ? 30 : 20;
  const lineOffset = isLargeFrame ? 45 : 22;
  const lineLength = isLargeFrame ? 100 : 60;
  const lineWidth = isLargeFrame ? 6 : 4;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Accent Line
  ctx.fillStyle = style.accentColor;
  ctx.fillRect(centerX - lineLength / 2, footerTop + lineOffset, lineLength, lineWidth);

  // Title: Memo Booth
  ctx.fillStyle = style.textColor;
  ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText(style.title, centerX, centerY - (isLargeFrame ? 15 : 10));

  // Date only (Removed "by AL")
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  ctx.font = `500 ${dateFontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText(date, centerX, centerY + (isLargeFrame ? 40 : 28));
}

async function drawStickers(ctx: CanvasRenderingContext2D, frame: FrameConfig, stickers: PlacedSticker[]) {
  const images = await Promise.all(
    stickers.map(s =>
      loadImage(s.src).catch(err => {
        console.warn('Sticker could not be loaded:', err);
        return null;
      })
    )
  );

  stickers.forEach((s, i) => {
    const img = images[i];
    if (!img) return;
    const w = s.size * frame.width;
    const h = w / s.aspect;

    ctx.save();
    ctx.translate(s.x * frame.width, s.y * frame.height);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  });
}

async function ensureFontLoaded() {
  try {
    await document.fonts.load('800 54px "Plus Jakarta Sans"');
    await document.fonts.load('800 36px "Plus Jakarta Sans"');
    await document.fonts.load('500 30px "Plus Jakarta Sans"');
    await document.fonts.load('500 20px "Plus Jakarta Sans"');
  } catch {
    // fall back to the system font
  }
}

/**
 * Draws the photo strip: background, photos in their slots, footer text,
 * then the transparent PNG overlay (if the frame has one) on top.
 * Returns a PNG data URL.
 */
export async function renderPhotoStrip(
  photos: string[],
  frame: FrameConfig,
  options: RenderOptions = {}
): Promise<string> {
  const { scale = EXPORT_SCALE, placeholder = false, stickers = [] } = options;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(frame.width * scale);
  canvas.height = Math.round(frame.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize the 2D canvas.');

  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const [photoImages, overlayImage] = await Promise.all([
    Promise.all(frame.slotRects.map((_, i) => (photos[i] ? loadImage(photos[i]) : Promise.resolve(null)))),
    frame.overlay
      ? loadImage(frame.overlay).catch((err) => {
          console.warn('Frame overlay could not be loaded:', err);
          return null;
        })
      : Promise.resolve(null),
    frame.style ? ensureFontLoaded() : Promise.resolve(),
  ]);

  drawBackground(ctx, frame);
  frame.slotRects.forEach((rect, i) => drawSlot(ctx, rect, photoImages[i], frame.style, placeholder));
  if (frame.style) drawFooter(ctx, frame, frame.style);
  if (overlayImage) ctx.drawImage(overlayImage, 0, 0, frame.width, frame.height);
  if (stickers.length) await drawStickers(ctx, frame, stickers);

  return canvas.toDataURL('image/png');
}