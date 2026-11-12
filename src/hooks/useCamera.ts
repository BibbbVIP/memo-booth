import { useState, useEffect, useRef, useCallback } from 'react';
import { FilterId } from '../types';
import { drawWithFilter } from '../utils/filterConfigs';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef(0); // ignores results of outdated start requests

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(''); // user's explicit choice
  const [activeDeviceId, setActiveDeviceId] = useState<string>(''); // device actually in use

  // Always mirrored so posing feels natural and saved photos match the screen
  const isMirrored = true;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Your browser does not support camera access.');
      setIsLoading(false);
      return;
    }

    stopStream();

    try {
      const resolution = { width: { ideal: 1920 }, height: { ideal: 1080 } };
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId }, ...resolution }
          : { facingMode: 'user', ...resolution },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      // A newer request (or unmount) happened while we were waiting: discard this stream
      if (requestId !== requestIdRef.current) {
        newStream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = newStream;
      setStream(newStream);
      setActiveDeviceId(newStream.getVideoTracks()[0]?.getSettings().deviceId ?? '');

      // Device labels are only available after permission is granted
      const list = await navigator.mediaDevices.enumerateDevices();
      if (requestId === requestIdRef.current) {
        setDevices(list.filter((d) => d.kind === 'videoinput'));
      }
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) return;
      console.error('Camera initialization error:', err);
      const e = err as { name?: string; message?: string };
      if (e.name === 'NotAllowedError') {
        setError('Camera permission denied. Please enable access in your browser settings.');
      } else if (e.name === 'NotFoundError') {
        setError('No camera was found on this device.');
      } else {
        setError(e.message || 'Failed to initialize camera stream.');
      }
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [selectedDeviceId, stopStream]);

  // Start on mount / when the chosen device changes; always release the camera on cleanup
  useEffect(() => {
    startCamera();
    return () => {
      requestIdRef.current++;
      stopStream();
    };
  }, [startCamera, stopStream]);

  // Attach the stream to the <video> element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) video.play().catch(() => {});
  }, [stream]);

  const captureFrame = useCallback((filter: FilterId = 'none'): string | null => {
    const video = videoRef.current;
    if (!video || !streamRef.current || !video.videoWidth) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror + filter on capture so the result matches what the person saw
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    drawWithFilter(ctx, video, canvas.width, canvas.height, filter);

    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  return {
    videoRef,
    stream,
    error,
    isLoading,
    devices,
    selectedDeviceId,
    activeDeviceId,
    setSelectedDeviceId,
    isMirrored,
    startCamera,
    captureFrame,
  };
}
