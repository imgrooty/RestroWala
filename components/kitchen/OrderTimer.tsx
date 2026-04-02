/**
 * Order Timer Component
 *
 * Live countup timer for orders showing elapsed time since placed.
 * Colour-codes to signal urgency:
 *   < 5 min  → green
 *   5–15 min → yellow
 *   15–30 min → orange
 *   > 30 min  → red (pulses)
 */

'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface OrderTimerProps {
  orderCreatedAt: Date | string;
  preparationTime?: number; // expected prep time in minutes
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

export default function OrderTimer({ orderCreatedAt, preparationTime }: OrderTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const createdMs =
      orderCreatedAt instanceof Date
        ? orderCreatedAt.getTime()
        : new Date(orderCreatedAt).getTime();

    const tick = () => {
      setElapsed(Math.floor((Date.now() - createdMs) / 1000));
    };

    tick(); // immediate
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [orderCreatedAt]);

  const elapsedMinutes = Math.floor(elapsed / 60);

  const colorClass =
    elapsedMinutes < 5
      ? 'text-emerald-400'
      : elapsedMinutes < 15
      ? 'text-yellow-400'
      : elapsedMinutes < 30
      ? 'text-orange-400'
      : 'text-red-400';

  const overTime =
    preparationTime !== undefined && elapsedMinutes > preparationTime;

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-bold ${colorClass} ${
        overTime ? 'animate-pulse' : ''
      }`}
    >
      <Clock className="h-3.5 w-3.5" />
      {formatDuration(elapsed)}
      {overTime && (
        <span className="text-[10px] font-black uppercase tracking-wider opacity-80 ml-1">
          Late
        </span>
      )}
    </span>
  );
}
