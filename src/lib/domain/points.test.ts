import { describe, it, expect } from 'vitest';
import { pointBalance, pointsForOutcome, outcomeEarnsPoints, canRedeem } from './points';
import type { PointLedgerEntry } from './types';

function entry(pointsDelta: number, sourceType: PointLedgerEntry['sourceType']): PointLedgerEntry {
  return {
    id: crypto.randomUUID(),
    childId: 'c1',
    sourceType,
    sourceId: 's1',
    pointsDelta,
    reason: 'test',
    createdAt: new Date().toISOString(),
  };
}

describe('pointsForOutcome', () => {
  it('awards full value for completed', () => {
    expect(pointsForOutcome('completed', 3)).toBe(3);
  });

  it('awards a flat 1 for tried, regardless of item value', () => {
    expect(pointsForOutcome('tried', 3)).toBe(1);
  });

  it('awards nothing for not_yet — never a penalty', () => {
    expect(pointsForOutcome('not_yet', 3)).toBe(0);
  });

  it('never returns a negative award', () => {
    expect(pointsForOutcome('completed', -5)).toBe(0);
  });
});

describe('outcomeEarnsPoints', () => {
  it('is false for not_yet (no ledger entry should be written)', () => {
    expect(outcomeEarnsPoints('not_yet', 2)).toBe(false);
  });

  it('is true for completed and tried', () => {
    expect(outcomeEarnsPoints('completed', 2)).toBe(true);
    expect(outcomeEarnsPoints('tried', 2)).toBe(true);
  });
});

describe('pointBalance', () => {
  it('sums the ledger', () => {
    const ledger = [entry(3, 'behavior'), entry(1, 'behavior'), entry(-2, 'redemption')];
    expect(pointBalance(ledger)).toBe(2);
  });

  it('is zero for an empty ledger', () => {
    expect(pointBalance([])).toBe(0);
  });
});

describe('canRedeem', () => {
  it('allows redemption when the balance covers the cost', () => {
    const ledger = [entry(5, 'behavior')];
    expect(canRedeem(ledger, 5)).toEqual({ affordable: true, balance: 5, shortfall: 0 });
  });

  it('blocks redemption and reports the shortfall', () => {
    const ledger = [entry(3, 'behavior')];
    expect(canRedeem(ledger, 5)).toEqual({ affordable: false, balance: 3, shortfall: 2 });
  });
});
