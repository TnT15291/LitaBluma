import type { AgeBand, BehaviorTemplate, ParentPausePrompt } from './types';

/** Suggested behaviors for a child's runtime-derived age band. */
export function templatesForBand(
  templates: readonly BehaviorTemplate[],
  band: AgeBand,
): BehaviorTemplate[] {
  return templates.filter((t) => t.ageBand === band);
}

/**
 * Pick a parent micro-pause line, avoiding an immediate repeat when possible.
 * `pick` is injectable for deterministic tests.
 */
export function selectParentPause(
  prompts: readonly ParentPausePrompt[],
  lastShownId: string | null = null,
  pick: (count: number) => number = (count) => Math.floor(Math.random() * count),
): ParentPausePrompt | null {
  if (prompts.length === 0) return null;
  const fresh = prompts.filter((p) => p.id !== lastShownId);
  const pool = fresh.length > 0 ? fresh : prompts;
  return pool[pick(pool.length)];
}
