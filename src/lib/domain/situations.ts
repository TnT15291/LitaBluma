import type { AgeBand, SituationGuide } from './types';

/**
 * Situation library selection (pure). The handbook is parent-facing coaching
 * content; it filters by the child's runtime age band so the parent sees what is
 * relevant first, with the option to browse all.
 */

/** Scenarios that apply to a given age band. */
export function situationsForBand(
  situations: readonly SituationGuide[],
  band: AgeBand,
): SituationGuide[] {
  return situations.filter((s) => s.ageBands.includes(band));
}

/** The fixed 4-step order + display labels (Phan Hồ Điệp framework). */
export const SITUATION_STEPS = [
  { key: 'acknowledge', label: 'Công nhận cảm xúc', emoji: '🫶' },
  { key: 'calm', label: 'Giúp con bình tĩnh', emoji: '🌬️' },
  { key: 'empathize', label: 'Thấu cảm', emoji: '💞' },
  { key: 'resolve', label: 'Cùng giải quyết', emoji: '🤝' },
] as const satisfies ReadonlyArray<{
  key: keyof SituationGuide['steps'];
  label: string;
  emoji: string;
}>;
