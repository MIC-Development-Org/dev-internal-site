"use client";

import { useEffect, useState } from "react";

function getRemaining(deadlineIso: string) {
  const diff = new Date(deadlineIso).getTime() - Date.now();
  const clamped = Math.max(diff, 0);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return { diff, days, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownClock({ deadlineIso }: { deadlineIso: string }) {
  // Starts null so the server-rendered markup (which can't know the
  // client's clock) matches the client's first paint; the real countdown
  // is filled in after mount to avoid a hydration mismatch.
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(getRemaining(deadlineIso));
    const id = setInterval(() => setRemaining(getRemaining(deadlineIso)), 1000);
    return () => clearInterval(id);
  }, [deadlineIso]);

  const expired = remaining !== null && remaining.diff <= 0;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-black px-3 py-1.5 font-mono text-primary">
      {!remaining ? (
        <span className="text-sm font-bold tabular-nums">--:--:--</span>
      ) : expired ? (
        <span className="text-sm font-semibold tracking-wider">CHEQUERED FLAG</span>
      ) : (
        <>
          <span className="text-sm font-bold tabular-nums">{remaining.days}d</span>
          <span className="text-sm font-bold tabular-nums">{pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}</span>
        </>
      )}
    </div>
  );
}
