import { getCountdown } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const CountdownTimer = ({ endTime }: { endTime: string }) => {

  const [countDown, setCountDown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) clearInterval(intervalRef.current);

    const update = () => {
      const next = getCountdown(endTime);
      setCountDown((prev) => {
        // Only update if actually changed (prevents unnecessary re-renders)
        if (
          prev.days === next.days &&
          prev.hours === next.hours &&
          prev.minutes === next.minutes &&
          prev.seconds === next.seconds
        ) {
          return prev;
        }
        return next;
      });
    };

    update(); // Run immediately
    intervalRef.current = setInterval(update, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endTime]);

  const fmt = (n: number) => n.toString().padStart(2, "0");
  return (
    <span>
      {fmt(countDown.days)}:{fmt(countDown.hours)}:{fmt(countDown.minutes)}:
      {fmt(countDown.seconds)}
    </span>
  );
};

export default CountdownTimer;
