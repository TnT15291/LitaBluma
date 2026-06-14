import type { BehaviorOutcome, PointLedgerEntry } from './types';

/**
 * Point ledger logic.
 *
 * The balance is ALWAYS the sum of the ledger. We never store or mutate a
 * total. Behavior never produces a negative entry — only redemptions do
 * (rules.md, product-spec §15).
 */

/** Current balance = sum of all deltas. Cannot be made negative by behavior. */
export function pointBalance(ledger: readonly PointLedgerEntry[]): number {
  return ledger.reduce((sum, entry) => sum + entry.pointsDelta, 0);
}

/**
 * Points awarded for a behavior outcome.
 * - `completed`: the item's full point value.
 * - `tried`: a flat recognition of effort (1), even if the item is worth more.
 * - `not_yet`: zero — it is neutral tracking, never a penalty.
 */
export function pointsForOutcome(outcome: BehaviorOutcome, itemPoints: number): number {
  switch (outcome) {
    case 'completed':
      return Math.max(0, itemPoints);
    case 'tried':
      return 1;
    case 'not_yet':
      return 0;
  }
}

/** Whether an outcome should append a ledger entry at all. */
export function outcomeEarnsPoints(outcome: BehaviorOutcome, itemPoints: number): boolean {
  return pointsForOutcome(outcome, itemPoints) > 0;
}

export interface RedemptionCheck {
  affordable: boolean;
  balance: number;
  shortfall: number;
}

/** Can the child afford a reward? Never lets the balance go below zero. */
export function canRedeem(
  ledger: readonly PointLedgerEntry[],
  pointsCost: number,
): RedemptionCheck {
  const balance = pointBalance(ledger);
  const shortfall = Math.max(0, pointsCost - balance);
  return { affordable: shortfall === 0, balance, shortfall };
}
