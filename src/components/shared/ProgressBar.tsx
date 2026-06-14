import { cn } from '@/lib/cn';

interface ProgressBarProps {
  /** 0–1 */
  value: number;
  className?: string;
  label?: string;
}

/**
 * Growth bar for the garden. Always uses the leaf/sun accents — never red.
 * A soft sun-tipped fill so progress reads as warmth, not a metric.
 */
export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      className={cn(
        'h-3.5 w-full overflow-hidden rounded-full bg-leaf-100 shadow-inner',
        className,
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-leaf-400 to-sun-400 transition-[width] duration-700 ease-[var(--ease-out-expo)]"
        style={{ width: `${Math.max(pct, value > 0 ? 6 : 0)}%` }}
      />
    </div>
  );
}
