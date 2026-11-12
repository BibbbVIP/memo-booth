import { FrameConfig, SlotRect } from '../types';

// Shared strip geometry (logical px). Export is scaled up in canvasRenderer.
const STRIP_WIDTH = 600;
const SLOT_WIDTH = 500;
const SLOT_HEIGHT = 375; // 4:3
const MARGIN = 50;
const GAP = 25;
const FOOTER_HEIGHT = 175;

function stripLayout(slots: number): Pick<FrameConfig, 'slots' | 'width' | 'height' | 'slotRects'> {
  const slotRects: SlotRect[] = Array.from({ length: slots }, (_, i) => ({
    x: MARGIN,
    y: MARGIN + i * (SLOT_HEIGHT + GAP),
    w: SLOT_WIDTH,
    h: SLOT_HEIGHT,
  }));

  return {
    slots,
    width: STRIP_WIDTH,
    height: MARGIN + slots * SLOT_HEIGHT + (slots - 1) * GAP + FOOTER_HEIGHT,
    slotRects,
  };
}

// Custom layout for large 1-photo postcard (1200x1800)
function postcardLayout(): Pick<FrameConfig, 'slots' | 'width' | 'height' | 'slotRects'> {
  const POSTCARD_WIDTH = 1200;
  const POSTCARD_HEIGHT = 1800;
  const SLOT_W = 1000;
  const SLOT_H = 1340;
  
  return {
    slots: 1,
    width: POSTCARD_WIDTH,
    height: POSTCARD_HEIGHT,
    slotRects: [{
      x: (POSTCARD_WIDTH - SLOT_W) / 2, // Centered horizontally
      y: 100, // Top margin
      w: SLOT_W,
      h: SLOT_H,
    }],
  };
}

// Custom layout for 2-photo strip (600x1800) to ensure exact 1800 height
function dualStripLayout(): Pick<FrameConfig, 'slots' | 'width' | 'height' | 'slotRects'> {
  const DUAL_HEIGHT = 1800;
  const SLOT_W = 500;
  const SLOT_H = 666; // 3:4 portrait
  const GAP_DUAL = 40;
  
  return {
    slots: 2,
    width: STRIP_WIDTH,
    height: DUAL_HEIGHT,
    slotRects: [
      { x: MARGIN, y: MARGIN, w: SLOT_W, h: SLOT_H },
      { x: MARGIN, y: MARGIN + SLOT_H + GAP_DUAL, w: SLOT_W, h: SLOT_H },
    ],
  };
}

export const FRAMES: FrameConfig[] = [
  // Your own design: 600 x 1800, 4 slots, transparent photo areas
  {
    id: 'mentoring-collab',
    name: 'Mentoring Collab',
    ...stripLayout(4),
    overlay: '/Bg-MC.png',
  },

  // 4 Photos Layouts
  {
    id: 'white-4',
    name: 'White - 4 Photos',
    ...stripLayout(4),
    style: {
      background: '#ffffff',
      textColor: '#141316',
      accentColor: '#141316',
      slotBorderColor: '#e5e7eb',
      slotBorderWidth: 1,
      slotRadius: 4,
      title: 'Memo Booth', // Replaced "by AL" as requested
    },
  },
  {
    id: 'black-4',
    name: 'Black - 4 Photos',
    ...stripLayout(4), // Replaced Midnight with Black
    style: {
      background: '#141316',
      textColor: '#ffffff',
      accentColor: '#ffffff',
      slotBorderColor: '#333333',
      slotBorderWidth: 1,
      slotRadius: 4,
      title: 'Memo Booth',
    },
  },

  // 3 Photos Layout (Film Maker)
  {
    id: 'film-maker',
    name: 'Film Maker',
    ...stripLayout(3), // Replaced Sunset with Film Maker
    style: {
      background: '#0a0a0a', // Deep film black
      textColor: '#d4d4d8', // Silver-ish text
      accentColor: '#fde047', // Yellow accent
      slotBorderColor: '#27272a', // Subtle dark grey border
      slotBorderWidth: 4,
      slotRadius: 0, // Sharp corners for film look
      title: 'Memo Booth',
    },
  },

  // 2 Photos Layouts (600x1800 exact)
  {
    id: 'white-2',
    name: 'White - 2 Photos',
    ...dualStripLayout(),
    style: {
      background: '#ffffff',
      textColor: '#141316',
      accentColor: '#141316',
      slotBorderColor: '#e5e7eb',
      slotBorderWidth: 1,
      slotRadius: 4,
      title: 'Memo Booth',
    },
  },

  // 1 Photo Postcard Layouts (1200x1800 exact)
  {
    id: 'white-1',
    name: 'White - 1 Photo',
    ...postcardLayout(),
    style: {
      background: '#ffffff',
      textColor: '#141316',
      accentColor: '#141316',
      slotBorderColor: '#e5e7eb',
      slotBorderWidth: 2,
      slotRadius: 8,
      title: 'Memo Booth',
    },
  },
  {
    id: 'black-1',
    name: 'Black - 1 Photo',
    ...postcardLayout(),
    style: {
      background: '#141316',
      textColor: '#ffffff',
      accentColor: '#ffffff',
      slotBorderColor: '#333333',
      slotBorderWidth: 2,
      slotRadius: 8,
      title: 'Memo Booth',
    },
  },
];