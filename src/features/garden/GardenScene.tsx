import type { GardenView } from '@/lib/domain/garden';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { STAGE_DISPLAY } from './stageDisplay';
import { GardenIllustration } from './GardenIllustration';

/**
 * The heart of child mode: shows growth, never a number. The living scene grows
 * as the child builds habits. No points, no failure, no warning colors.
 */
export function GardenScene({ garden, childName }: { garden: GardenView; childName: string }) {
  const current = STAGE_DISPLAY[garden.stage];
  const next = garden.nextStage ? STAGE_DISPLAY[garden.nextStage] : null;

  return (
    <section className="flex flex-col items-center text-center" aria-live="polite">
      <p className="text-base font-semibold text-leaf-700">Khu vườn của {childName}</p>

      <div className="relative mt-2 w-full max-w-sm">
        <GardenIllustration stage={garden.stage} />
      </div>

      <div
        className="-mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 shadow-[var(--shadow-float)] backdrop-blur"
        role="img"
        aria-label={`Khu vườn đang ở giai đoạn ${current.label}`}
      >
        <span className="text-2xl leading-none">{current.emoji}</span>
        <h1 className="font-display text-xl font-bold text-leaf-800">{current.label}</h1>
      </div>

      {next ? (
        <div className="mt-5 w-full max-w-xs">
          <ProgressBar value={garden.progressToNext} label={`Tiến tới ${next.label}`} />
          <p className="mt-2 text-sm font-medium text-leaf-700">
            Sắp tới: {next.emoji} {next.label}
          </p>
        </div>
      ) : (
        <p className="mt-4 max-w-xs text-sm font-medium text-leaf-700">
          Khu vườn đã nở rộ — những chú bướm đã ghé thăm! 🦋
        </p>
      )}
    </section>
  );
}
