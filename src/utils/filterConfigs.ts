import { FilterId } from '../types';

/**
 * One definition drives both the live preview (CSS filter on the <video>)
 * and the captured photo (ctx.filter, or a pixel fallback for browsers
 * without canvas filter support such as Safari), so they always look the same.
 */
interface FilterSpec {
  grayscale?: number;
  sepia?: number;
  saturate?: number;
  contrast?: number;
  brightness?: number;
}

export interface FilterOption {
  id: FilterId;
  name: string;
  spec: FilterSpec;
}

export const FILTERS: FilterOption[] = [
  { id: 'none', name: 'No Filter', spec: {} },
  { id: 'vintage', name: 'Vintage', spec: { sepia: 0.45, saturate: 1.2, contrast: 1.1, brightness: 1.05 } },
  { id: 'bw', name: 'B&W', spec: { grayscale: 1, contrast: 1.35 } }, // punchy, high contrast
  { id: 'greyscale', name: 'Greyscale', spec: { grayscale: 1 } }, // soft, natural
];

// Order matters: CSS applies filter functions in the order written
const ORDER: (keyof FilterSpec)[] = ['grayscale', 'sepia', 'saturate', 'contrast', 'brightness'];

function getSpec(id: FilterId): FilterSpec {
  return FILTERS.find(f => f.id === id)?.spec ?? {};
}

/** CSS filter string, e.g. "grayscale(1) contrast(1.35)", or "none". */
export function getFilterCss(id: FilterId): string {
  const spec = getSpec(id);
  const parts = ORDER.filter(k => spec[k] !== undefined).map(k => `${k}(${spec[k]})`);
  return parts.length ? parts.join(' ') : 'none';
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/** Pixel fallback that mirrors the CSS filter formulas. */
function applyFilterPixels(ctx: CanvasRenderingContext2D, width: number, height: number, spec: FilterSpec) {
  const image = ctx.getImageData(0, 0, width, height);
  const d = image.data;

  const gi = 1 - (spec.grayscale ?? 0);
  const si = 1 - (spec.sepia ?? 0);
  const sat = spec.saturate ?? 1;
  const con = spec.contrast ?? 1;
  const bri = spec.brightness ?? 1;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];

    if (spec.grayscale !== undefined) {
      const nr = (0.2126 + 0.7874 * gi) * r + (0.7152 - 0.7152 * gi) * g + (0.0722 - 0.0722 * gi) * b;
      const ng = (0.2126 - 0.2126 * gi) * r + (0.7152 + 0.2848 * gi) * g + (0.0722 - 0.0722 * gi) * b;
      const nb = (0.2126 - 0.2126 * gi) * r + (0.7152 - 0.7152 * gi) * g + (0.0722 + 0.9278 * gi) * b;
      r = clamp(nr);
      g = clamp(ng);
      b = clamp(nb);
    }

    if (spec.sepia !== undefined) {
      const nr = (0.393 + 0.607 * si) * r + (0.769 - 0.769 * si) * g + (0.189 - 0.189 * si) * b;
      const ng = (0.349 - 0.349 * si) * r + (0.686 + 0.314 * si) * g + (0.168 - 0.168 * si) * b;
      const nb = (0.272 - 0.272 * si) * r + (0.534 - 0.534 * si) * g + (0.131 + 0.869 * si) * b;
      r = clamp(nr);
      g = clamp(ng);
      b = clamp(nb);
    }

    if (spec.saturate !== undefined) {
      const nr = (0.213 + 0.787 * sat) * r + (0.715 - 0.715 * sat) * g + (0.072 - 0.072 * sat) * b;
      const ng = (0.213 - 0.213 * sat) * r + (0.715 + 0.285 * sat) * g + (0.072 - 0.072 * sat) * b;
      const nb = (0.213 - 0.213 * sat) * r + (0.715 - 0.715 * sat) * g + (0.072 + 0.928 * sat) * b;
      r = clamp(nr);
      g = clamp(ng);
      b = clamp(nb);
    }

    if (spec.contrast !== undefined) {
      const off = (0.5 - 0.5 * con) * 255;
      r = clamp(con * r + off);
      g = clamp(con * g + off);
      b = clamp(con * b + off);
    }

    if (spec.brightness !== undefined) {
      r = clamp(bri * r);
      g = clamp(bri * g);
      b = clamp(bri * b);
    }

    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }

  ctx.putImageData(image, 0, 0);
}

/** Draws `source` into the whole canvas with the chosen filter baked in. */
export function drawWithFilter(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  width: number,
  height: number,
  id: FilterId
) {
  const css = getFilterCss(id);

  if (css === 'none') {
    ctx.drawImage(source, 0, 0, width, height);
    return;
  }

  // Browsers without canvas filter support (e.g. Safari) don't have this property at all
  if (typeof (ctx as { filter?: unknown }).filter === 'string') {
    ctx.filter = css;
    ctx.drawImage(source, 0, 0, width, height);
    ctx.filter = 'none';
    return;
  }

  // Fallback: draw, then process the pixels ourselves
  ctx.drawImage(source, 0, 0, width, height);
  applyFilterPixels(ctx, width, height, getSpec(id));
}
