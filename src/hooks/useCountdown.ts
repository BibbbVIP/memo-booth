import { useState, useRef, useCallback, useEffect } from 'react';

export function useCountdown() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Never fire onComplete after the component is gone
  useEffect(() => clear, [clear]);

  const startTimer = useCallback(
    (seconds: number, onComplete: () => void) => {
      clear();

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
          clear();
          setCountdown(null);
          setIsCountingDown(false);
          onComplete();
        }
      }, 1000);
    },
    [clear]
  );

  const cancelTimer = useCallback(() => {
    clear();
    setCountdown(null);
    setIsCountingDown(false);
  }, [clear]);

  return { countdown, isCountingDown, startTimer, cancelTimer };
}
