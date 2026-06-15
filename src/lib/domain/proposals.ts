import type { BehaviorLog, BehaviorTemplate, ChecklistItem, HabitStage } from './types';
import { ageBandForBirthDate, isApproachingBandTransition } from './ageBand';

/**
 * Parent-confirmed proposals — "the app suggests; the parent decides" (rules.md).
 *
 * This module ONLY derives proposals from current state. It never mutates a
 * checklist item, the point ledger, or a reward. Applying a proposal is the
 * caller's job and happens strictly on explicit parent confirmation
 * (see store.applyProposal). A dismissed/ignored proposal changes nothing.
 *
 * MVP Core covers three derivations from product-spec §12–13:
 *   - habit tapering (`new`→`building`→`stable`): once a behavior is a habit,
 *     suggest fewer seeds so the child acts from habit, not points;
 *   - recognition-only: a very well-established habit can stop being a point
 *     source while still being celebrated in the garden;
 *   - recurring `not_yet` (Flow 6): a behavior that keeps coming up "chưa làm"
 *     may be too hard — gently suggest easing or pausing it. Never surfaced to
 *     the child, never framed as failure.
 */

export type ProposalKind =
  | 'taper_points'
  | 'recognition_only'
  | 'recurring_not_yet'
  | 'band_review';

export type ProposalEffect =
  | { type: 'set_points'; points: number; nextStage: HabitStage }
  | { type: 'archive_item' }
  /** UI-handled: navigate the parent to a screen to review/act. No data change. */
  | { type: 'navigate'; to: string };

export interface Proposal {
  /**
   * Deterministic id encoding the trigger, so dismissing one proposal does not
   * silence a *stronger* signal later (an advanced stage, a higher `not_yet`
   * count, or a new target band produces a new id and may surface again).
   */
  id: string;
  kind: ProposalKind;
  /** The checklist item it concerns, or null for child-scoped proposals (band_review). */
  itemId: string | null;
  title: string;
  rationale: string;
  confirmLabel: string;
  declineLabel: string;
  effect: ProposalEffect;
}

/** Tunable thresholds (product-spec §13). Exported so tests pin the contract. */
export const PROPOSAL_THRESHOLDS = {
  /** `new` → `building`: completions within this window. */
  buildingCompletions: 7,
  buildingWindowDays: 14,
  /** `building` → `stable`: completions within this window. */
  stableCompletions: 10,
  stableWindowDays: 21,
  /** `stable` → `recognition_only`: completions within this window. */
  recognitionCompletions: 14,
  recognitionWindowDays: 28,
  /** Recurring `not_yet`: count within this window, with no completion in it. */
  recurringNotYet: 3,
  recurringWindowDays: 7,
} as const;

const DAY_MS = 86_400_000;

/** Parse an ISO date as a LOCAL date to avoid timezone off-by-one shifts. */
function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** Whole days from an ISO log date back to `on` (0 = same day as `on`). */
function daysAgo(logDate: string, on: Date): number {
  const onMidnight = new Date(on.getFullYear(), on.getMonth(), on.getDate()).getTime();
  return Math.round((onMidnight - parseIsoDate(logDate).getTime()) / DAY_MS);
}

function countOutcome(
  logs: readonly BehaviorLog[],
  itemId: string,
  outcome: BehaviorLog['outcome'],
  windowDays: number,
  on: Date,
): number {
  return logs.filter((l) => {
    if (l.checklistItemId !== itemId || l.outcome !== outcome) return false;
    const d = daysAgo(l.logDate, on);
    return d >= 0 && d < windowDays;
  }).length;
}

/**
 * Derive every actionable proposal for the active checklist. Each item yields at
 * most one proposal, preferring the most advanced applicable step.
 */
export function deriveProposals(
  checklist: readonly ChecklistItem[],
  logs: readonly BehaviorLog[],
  on: Date = new Date(),
): Proposal[] {
  const proposals: Proposal[] = [];
  for (const item of checklist) {
    if (item.status !== 'active') continue;
    const p = proposalForItem(item, logs, on);
    if (p) proposals.push(p);
  }
  return proposals;
}

function proposalForItem(
  item: ChecklistItem,
  logs: readonly BehaviorLog[],
  on: Date,
): Proposal | null {
  const T = PROPOSAL_THRESHOLDS;

  // 1) Positive ladder: taper as the habit takes hold.
  if (item.habitStage === 'stable') {
    const n = countOutcome(logs, item.id, 'completed', T.recognitionWindowDays, on);
    if (n >= T.recognitionCompletions) {
      return {
        id: `recognition_only:${item.id}`,
        kind: 'recognition_only',
        itemId: item.id,
        title: `"${item.title}" đã rất vững`,
        rationale:
          `Con đã duy trì việc này đều đặn (${n} lần gần đây). Bạn có thể chuyển sang ` +
          `ghi nhận thường xuyên — vẫn được khen trong vườn, nhưng không còn là nguồn điểm chính.`,
        confirmLabel: 'Chuyển sang ghi nhận',
        declineLabel: 'Giữ nguyên',
        effect: { type: 'set_points', points: 0, nextStage: 'recognition_only' },
      };
    }
  } else if (item.habitStage === 'building') {
    const n = countOutcome(logs, item.id, 'completed', T.stableWindowDays, on);
    if (n >= T.stableCompletions) {
      return taperProposal(item, 'stable', n);
    }
  } else if (item.habitStage === 'new') {
    const n = countOutcome(logs, item.id, 'completed', T.buildingWindowDays, on);
    if (n >= T.buildingCompletions) {
      return taperProposal(item, 'building', n);
    }
  }

  // 2) Recurring not_yet: a behavior that keeps not happening may be too hard.
  //    Only when there is no recent success (otherwise it is going fine).
  if (item.habitStage !== 'recognition_only') {
    const notYet = countOutcome(logs, item.id, 'not_yet', T.recurringWindowDays, on);
    const completed = countOutcome(logs, item.id, 'completed', T.recurringWindowDays, on);
    if (notYet >= T.recurringNotYet && completed === 0) {
      return {
        // Bucketed so a persisting pattern can re-surface after a dismissal.
        id: `recurring_not_yet:${item.id}:b${Math.floor(notYet / T.recurringNotYet)}`,
        kind: 'recurring_not_yet',
        itemId: item.id,
        title: `"${item.title}" có vẻ đang hơi khó`,
        rationale:
          `Việc này được ghi "chưa làm" ${notYet} lần tuần này. Có thể nó đang hơi sức với con — ` +
          `thử chia nhỏ, cho con thêm lựa chọn, hoặc đổi thời điểm trong ngày. Bạn cũng có thể ` +
          `tạm ẩn để quay lại sau.`,
        confirmLabel: 'Tạm ẩn việc này',
        declineLabel: 'Vẫn giữ lại',
        effect: { type: 'archive_item' },
      };
    }
  }

  return null;
}

export interface BandReviewInput {
  childName: string;
  birthDate: string;
  checklist: readonly ChecklistItem[];
  templates: readonly BehaviorTemplate[];
  on?: Date;
}

/**
 * Child-scoped proposal: when a band transition is approaching and the upcoming
 * band has suggested behaviors not yet on the checklist, invite the parent to
 * review. It NEVER adds anything itself — confirming navigates to the manage
 * screen where the parent adds each item by hand. Warm + celebratory, never
 * framed as the child falling behind.
 */
export function deriveBandReview(input: BandReviewInput): Proposal | null {
  const { childName, birthDate, checklist, templates, on = new Date() } = input;
  if (!isApproachingBandTransition(birthDate, on)) return null;

  const future = new Date(on);
  future.setDate(future.getDate() + 30);
  const targetBand = ageBandForBirthDate(birthDate, future);

  const used = new Set(checklist.map((c) => c.templateId).filter(Boolean));
  const fresh = templates.filter((t) => t.ageBand === targetBand && !used.has(t.id));
  if (fresh.length === 0) return null;

  return {
    id: `band_review:${targetBand}`,
    kind: 'band_review',
    itemId: null,
    title: `${childName} sắp chuyển sang dải tuổi ${targetBand}`,
    rationale:
      'Con sắp lớn thêm một chút. Bạn có muốn cùng xem lại checklist và thêm vài việc hợp với dải tuổi mới không? ' +
      'Bạn chọn từng việc — không có gì tự thêm.',
    confirmLabel: 'Xem gợi ý',
    declineLabel: 'Để sau',
    effect: { type: 'navigate', to: '/parent/manage' },
  };
}

function taperProposal(item: ChecklistItem, nextStage: HabitStage, completions: number): Proposal {
  const points = Math.max(1, item.pointsValue - 1);
  const lowered = points < item.pointsValue;
  return {
    id: `taper:${nextStage}:${item.id}`,
    kind: 'taper_points',
    itemId: item.id,
    title: `"${item.title}" đã thành thói quen`,
    rationale:
      `Con đã hoàn thành việc này ${completions} lần gần đây. Khi một việc đã thành nếp, ` +
      `bạn có thể giảm hạt giống để con làm vì thói quen tốt, không chỉ vì điểm.`,
    confirmLabel: lowered ? `Giảm còn ${points} hạt` : 'Ghi nhận là thói quen',
    declineLabel: 'Giữ nguyên',
    effect: { type: 'set_points', points, nextStage },
  };
}
