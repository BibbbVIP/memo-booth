import { FrameOption } from '../types';

export const FRAME_OPTIONS: FrameOption[] = [
  {
    id: 'no-frame',
    name: 'No frame',
    description: 'Clean borderless photo strip',
    bgColor: '#141316',
    textColor: '#ffffff',
    accentColor: '#ef4444',
    borderColor: 'transparent',
    isCustom: false,
    isRaw: true
  },
  {
    id: 'classic-white',
    name: 'Classic',
    description: 'Classic white frame with branding',
    bgColor: '#ffffff',
    textColor: '#141316',
    accentColor: '#3371bb',
    borderColor: '#e2e8f0',
    isCustom: false,
    isRaw: false
  },
  {
    id: 'custom-mentoring',
    name: 'Custom 1',
    description: 'Custom 1 template overlay',
    bgColor: 'transparent',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    borderColor: 'transparent',
    isCustom: true,
    customOverlayUrl: '/mentoring.png'
  },
  {
    id: 'custom-pres',
    name: 'Custom 2',
    description: 'Custom 2 template overlay',
    bgColor: 'transparent',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    borderColor: 'transparent',
    isCustom: true,
    customOverlayUrl: '/32Esync.png'
  },
  {
    id: 'upload-custom',
    name: '+ Upload Frame',
    description: 'Upload your own custom frame PNG',
    bgColor: 'transparent',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    borderColor: 'transparent',
    isCustom: true,
    isUploadOption: true
  }
];

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let renderW = w;
  let renderH = h;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > targetRatio) {
    renderW = h * imgRatio;
    offsetX = (w - renderW) / 2;
  } else {
    renderH = w / imgRatio;
    offsetY = (h - renderH) / 2;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + offsetX, y + offsetY, renderW, renderH);
  ctx.restore();
}

export async function renderPhotoStrip(
  photosDataUrl: string[],
  frameId: string = 'classic-white',
  uploadedCustomOverlayUrl: string | null = null
): Promise<string> {
  const selectedFrame = FRAME_OPTIONS.find(f => f.id === frameId) || FRAME_OPTIONS[1];
  
  // 1. Load raw photos
  const loadedImages: HTMLImageElement[] = (await Promise.all(
    photosDataUrl.map(
      src =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = src;
        })
    )
  )) as HTMLImageElement[];

  // 2. Tentukan URL overlay (bisa dari bawaan atau dari file yang di-upload user)
  const activeOverlayUrl = selectedFrame.isUploadOption 
    ? uploadedCustomOverlayUrl 
    : selectedFrame.customOverlayUrl;

  let customOverlayImg: HTMLImageElement | null = null;
  if (selectedFrame.isCustom && activeOverlayUrl) {
    try {
      customOverlayImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const oImg = new Image();
        oImg.onload = () => resolve(oImg);
        oImg.onerror = (err) => reject(err);
        oImg.src = activeOverlayUrl;
      });
    } catch (e) {
      console.error('Custom Frame Load Error:', e);
    }
  }

  const photoCount = loadedImages.length;
  const photoW = 1000;
  const photoH = 750;
  
  const isCustom = selectedFrame.isCustom;
  const isRaw = selectedFrame.isRaw;

  const paddingX = (isRaw || isCustom) ? 0 : 50;
  const paddingTop = (isRaw || isCustom) ? 0 : 50;
  const gapY = (isRaw || isCustom) ? 0 : 40;
  const footerH = (isRaw || isCustom) ? 0 : 180;

  const canvasW = photoW + paddingX * 2;
  const canvasH = paddingTop + photoCount * photoH + (photoCount - 1) * gapY + footerH;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = selectedFrame.bgColor;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 3. Render Photos & Frames per slot
  loadedImages.forEach((img, idx) => {
    const yPos = paddingTop + idx * (photoH + gapY);
    
    drawImageCover(ctx, img, paddingX, yPos, photoW, photoH);

    if (customOverlayImg) {
      ctx.drawImage(customOverlayImg, paddingX, yPos, photoW, photoH);
    } else if (!isRaw) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.strokeRect(paddingX, yPos, photoW, photoH);
    }
  });

  // 4. Render Footer (Hanya untuk Classic)
  if (!isRaw && !isCustom) {
    const footerCenterY = canvasH - footerH / 2;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = selectedFrame.textColor;
    ctx.font = '800 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Memo Booth', canvasW / 2, footerCenterY - 25);

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    ctx.fillStyle = '#64748b';
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(dateStr, canvasW / 2, footerCenterY + 25);
  }

  return canvas.toDataURL('image/png', 0.95);
}