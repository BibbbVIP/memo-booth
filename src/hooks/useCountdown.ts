import { useState, useRef, useCallback } from 'react';

export function useCountdown() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const startTimer = useCallback((seconds: number, onComplete: () => void) => {
    if (seconds <= 0) {
      onComplete();
      return;
    }

    setIsCountingDown(true);
    setCountdown(seconds);

    let current = seconds;
    timerRef.current = window.setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setCountdown(null);
        setIsCountingDown(false);
        onComplete();
      }
    }, 1000);
  }, []);

  const cancelTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(null);
    setIsCountingDown(false);
  }, []);

  return { countdown, isCountingDown, startTimer, cancelTimer };
}
