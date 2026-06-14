/**
 * Domain types for LitaBluma MVP Core.
 *
 * These mirror the data model in docs/architecture.md. They are intentionally
 * persistence-agnostic: the same shapes back the mock layer today and Supabase
 * later. App copy and UI state live elsewhere — these are pure data.
 */

export type AgeBand = '4-5' | '6-7' | '8-10';

export type BehaviorOutcome = 'completed' | 'tried' | 'not_yet';

export type HabitStage = 'new' | 'building' | 'stable' | 'recognition_only';

export type RewardType = 'choice' | 'activity' | 'privilege' | 'object';

/** Where a point_ledger entry came from. Behavior is always non-negative. */
export type LedgerSource = 'behavior' | 'bonus' | 'redemption';

export interface ChildProfile {
  id: string;
  familyId: string;
  displayName: string;
  /** ISO date (YYYY-MM-DD). Age is always derived from this at runtime. */
  birthDate: string;
  avatarKey: string;
  createdAt: string;
  deletedAt?: string | null;
}

export interface ChecklistItem {
  id: string;
  childId: string;
  templateId?: string | null;
  title: string;
  /** Parent-owned. Never auto-changed; tapering is a confirmed proposal. */
  pointsValue: number;
  status: 'active' | 'archived';
  habitStage: HabitStage;
  category?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface BehaviorLog {
  id: string;
  childId: string;
  checklistItemId: string;
  /** ISO date the behavior was logged for. */
  logDate: string;
  outcome: BehaviorOutcome;
  note?: string | null;
  createdBy: string;
  createdAt: string;
}

/**
 * Append-only ledger. The point balance is ALWAYS derived by summing
 * `pointsDelta`. Never mutate a stored total. Negative deltas only ever come
 * from `redemption`.
 */
export interface PointLedgerEntry {
  id: string;
  childId: string;
  sourceType: LedgerSource;
  sourceId: string;
  pointsDelta: number;
  reason: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  childId: string;
  title: string;
  rewardType: RewardType;
  pointsCost: number;
  isActive: boolean;
  createdAt: string;
}

export interface RewardRedemption {
  id: string;
  childId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  redeemedAt: string;
}

/** Garden growth stages, in order. The child sees these, never raw points. */
export type GardenStage = 'seed' | 'sprout' | 'plant' | 'flower' | 'tree' | 'butterflies';

export interface GardenProgress {
  childId: string;
  stage: GardenStage;
  /** Derived, deterministic from positive behavior. Not shown as a score. */
  growthScore: number;
  lastGrowthAt: string | null;
}

/**
 * Built-in, human-written recognition lines (MVP Core, non-AI). Static content,
 * never child data. Selection rotates so praise stays fresh.
 */
export interface RecognitionPhrase {
  id: string;
  ageBand: AgeBand | null;
  category: string | null;
  /** Recognition is positive-only — never for `not_yet`. */
  outcome: Extract<BehaviorOutcome, 'completed' | 'tried'>;
  text: string;
  isActive: boolean;
}

/** Age-band library of suggested behaviors a parent can switch on. App content. */
export interface BehaviorTemplate {
  id: string;
  ageBand: AgeBand;
  title: string;
  defaultPoints: number;
  category: string;
}

/**
 * Static parent-facing micro-pause lines shown when a parent logs `not_yet`.
 * The product's second pillar — "the parent grows too". Calm, non-scoring,
 * dismissible, NEVER shown to the child.
 */
export interface ParentPausePrompt {
  id: string;
  text: string;
}

/** Parent's acceptance of the child-data terms (privacy baseline). */
export interface ConsentRecord {
  version: string;
  acceptedAt: string;
}
