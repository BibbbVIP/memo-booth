import { useState, useEffect, useRef, useCallback } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Mirror di-set true secara permanen agar posisi kanan/kiri presisi natural
  const isMirrored = true;

  const getDevices = useCallback(async () => {
    try {
      const devList = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devList.filter(d => d.kind === 'videoinput');
      setDevices(videoDevs);
      if (videoDevs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevs[0].deviceId);
      }
    } catch (err) {
      console.warn('Failed to enumerate devices:', err);
    }
  }, [selectedDeviceId]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Your browser does not support camera access.');
      setIsLoading(false);
      return;
    }

    try {
      if (stream) stream.getTracks().forEach(t => t.stop());

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }

      await getDevices();
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please enable access in browser settings.');
      } else {
        setError(err.message || 'Failed to initialize camera stream.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId, getDevices]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [selectedDeviceId]);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !stream) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Selalu mirror saat capture agar konsisten dengan tampilan layar
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  }, [stream]);

  return {
    videoRef, stream, error, isLoading, devices, selectedDeviceId,
    setSelectedDeviceId, isMirrored, startCamera, captureFrame
  };
}