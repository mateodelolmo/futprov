"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function timeLeft() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const diff = Math.max(0, end.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function OfferBar({ text }: { text: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(timeLeft());
    const id = setInterval(() => setTime(timeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fp-offerbar">
      <span>{text}</span>
      <span className="fp-offerbar__timer" aria-hidden="true">
        {time}
      </span>
    </div>
  );
}
