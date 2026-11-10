export type GridCount = 1 | 2 | 3;
export type TimerSeconds = 0 | 3 | 5;

export interface FrameOption {
  id: string;
  name: string;
  description: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  isCustom?: boolean;
  customOverlayUrl?: string;
  isRaw?: boolean;
  isUploadOption?: boolean; 
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}