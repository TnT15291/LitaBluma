import type { BehaviorLog, ChecklistItem, Virtue } from './types';
import { virtueMeta } from './virtues';

/**
 * Weekly report (MVP+, but the NON-AI base path — always available). Pure
 * aggregation of the last 7 days of behavior logs into a strength-based,
 * descriptive summary: what the child practiced (by virtue), the most-recognized
 * behaviors, plus one rotating reflection + tip for the parent.
 *
 * Deliberately NOT a score: no ranking, no comparison, no "good/bad week", no
 * per-virtue rating of the child. `not_yet` is excluded — the report celebrates
 * what happened, it does not tally what didn't. The AI dual-analysis layer
 * (child + parent) is layered on top later via the backend proxy.
 */

export interface VirtueHighlight {
  virtue: Virtue | null;
  label: string;
  emoji: string;
  completed: number;
  tried: number;
  total: number;
}

export interface BehaviorHighlight {
  itemId: string;
  title: string;
  count: number;
}

export interface WeeklyReport {
  from: string;
  to: string;
  hasActivity: boolean;
  /** completed + tried within the window. */
  goodMoments: number;
  completed: number;
  tried: number;
  /** Distinct days with at least one positive log. */
  activeDays: number;
  byVirtue: VirtueHighlight[];
  topBehaviors: BehaviorHighlight[];
  reflection: string | null;
  tip: string | null;
}

const WINDOW_DAYS = 7;
const DAY_MS = 86_400_000;

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function midnight(on: Date): number {
  return new Date(on.getFullYear(), on.getMonth(), on.getDate()).getTime();
}

function daysAgo(logDate: string, on: Date): number {
  return Math.round((midnight(on) - parseIsoDate(logDate).getTime()) / DAY_MS);
}

function isoDate(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Stable week index — same within a calendar week, rotates across weeks. */
function weekSeed(on: Date): number {
  return Math.floor(midnight(on) / DAY_MS / 7);
}

export function buildWeeklyReport(
  checklist: readonly ChecklistItem[],
  logs: readonly BehaviorLog[],
  reflections: readonly string[],
  tips: readonly string[],
  on: Date = new Date(),
): WeeklyReport {
  const itemsById = new Map(checklist.map((c) => [c.id, c] as const));

  const positive = logs.filter((l) => {
    if (l.outcome === 'not_yet') return false;
    const d = daysAgo(l.logDate, on);
    return d >= 0 && d < WINDOW_DAYS;
  });

  const completed = positive.filter((l) => l.outcome === 'completed').length;
  const tried = positive.length - completed;
  const activeDays = new Set(positive.map((l) => l.logDate)).size;

  const virtueAcc = new Map<Virtue | null, { completed: number; tried: number }>();
  const behaviorAcc = new Map<string, number>();
  for (const l of positive) {
    const item = itemsById.get(l.checklistItemId);
    const v = item?.virtue ?? null;
    const acc = virtueAcc.get(v) ?? { completed: 0, tried: 0 };
    if (l.outcome === 'completed') acc.completed += 1;
    else acc.tried += 1;
    virtueAcc.set(v, acc);
    behaviorAcc.set(l.checklistItemId, (behaviorAcc.get(l.checklistItemId) ?? 0) + 1);
  }

  const byVirtue: VirtueHighlight[] = [...virtueAcc.entries()]
    .map(([virtue, c]) => {
      const meta = virtueMeta(virtue);
      return {
        virtue,
        label: meta.label,
        emoji: meta.emoji,
        completed: c.completed,
        tried: c.tried,
        total: c.completed + c.tried,
      };
    })
    .sort((a, b) => b.total - a.total);

  const topBehaviors: BehaviorHighlight[] = [...behaviorAcc.entries()]
    .map(([itemId, count]) => ({ itemId, title: itemsById.get(itemId)?.title ?? 'Một việc tốt', count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const seed = weekSeed(on);
  const reflection = reflections.length ? reflections[seed % reflections.length] : null;
  // Offset so the tip is not locked in lockstep with the reflection.
  const tip = tips.length ? tips[(seed + 2) % tips.length] : null;

  return {
    from: isoDate(midnight(on) - (WINDOW_DAYS - 1) * DAY_MS),
    to: isoDate(midnight(on)),
    hasActivity: positive.length > 0,
    goodMoments: positive.length,
    completed,
    tried,
    activeDays,
    byVirtue,
    topBehaviors,
    reflection,
    tip,
  };
}
