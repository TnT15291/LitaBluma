import type { AgeBand, BehaviorOutcome, RecognitionPhrase } from './types';

/**
 * Recognition selection (MVP Core, non-AI).
 *
 * Picks a human-written line that matches the child's runtime age band, the
 * behavior category, and a POSITIVE outcome. Selection rotates so the same line
 * is not repeated back-to-back (rules.md: recognition wording must vary).
 *
 * `not_yet` never gets recognition — it stays neutral and silent to the child.
 */

export interface RecognitionContext {
  ageBand: AgeBand;
  category?: string | null;
  outcome: BehaviorOutcome;
  /** Id of the line shown most recently for this child/behavior, if any. */
  lastShownId?: string | null;
}

function matches(phrase: RecognitionPhrase, ctx: RecognitionContext): boolean {
  if (!phrase.isActive) return false;
  if (phrase.outcome !== ctx.outcome) return false;
  if (phrase.ageBand !== null && phrase.ageBand !== ctx.ageBand) return false;
  if (phrase.category !== null && ctx.category && phrase.category !== ctx.category) return false;
  return true;
}

/**
 * Returns a recognition phrase, or `null` when none should be shown
 * (e.g. `not_yet`, or no matching active phrase exists).
 *
 * `pick` lets callers inject deterministic selection for tests; defaults to
 * random among the eligible set (excluding the last-shown line when possible).
 */
export function selectRecognition(
  phrases: readonly RecognitionPhrase[],
  ctx: RecognitionContext,
  pick: (count: number) => number = (count) => Math.floor(Math.random() * count),
): RecognitionPhrase | null {
  if (ctx.outcome === 'not_yet') return null;

  const eligible = phrases.filter((p) => matches(p, ctx));
  if (eligible.length === 0) return null;

  // Avoid an immediate repeat when there's an alternative.
  const fresh = eligible.filter((p) => p.id !== ctx.lastShownId);
  const pool = fresh.length > 0 ? fresh : eligible;

  return pool[pick(pool.length)];
}
