export type ViewState = 'home' | 'choose-frame' | 'camera';

export type TimerSeconds = 0 | 3 | 5;

export type FilterId = 'none' | 'vintage' | 'bw' | 'greyscale';

/** A photo slot, in logical (unscaled) canvas pixels. */
export interface SlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Look of a frame that is drawn entirely in code (no PNG needed). */
export interface FrameStyle {
  background: string | [string, string]; // solid colour, or [top, bottom] gradient
  textColor: string;
  accentColor: string;
  slotBorderColor: string;
  slotBorderWidth: number;
  slotRadius: number;
  title: string;
}

export interface FrameConfig {
  id: string;
  name: string;
  slots: number; // number of photos taken for this frame
  width: number; // logical canvas width (600)
  height: number; // logical canvas height, depends on slots
  slotRects: SlotRect[];
  overlay?: string; // transparent PNG drawn on top of the photos (your own design)
  style?: FrameStyle; // code-drawn design (used when there is no overlay)
}

/**
 * A sticker placed on the strip. Everything is stored as a fraction of the strip
 * so the on-screen preview and the exported canvas always match.
 */
export interface PlacedSticker {
  uid: string;
  src: string;
  aspect: number; // natural width / height
  x: number; // centre, 0..1 of strip width
  y: number; // centre, 0..1 of strip height
  size: number; // sticker width as a fraction of strip width
  rotation: number; // degrees
}
