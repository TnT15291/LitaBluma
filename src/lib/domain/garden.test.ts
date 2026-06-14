import { describe, it, expect } from 'vitest';
import { growthFromLogs, stageForGrowth, gardenViewFromLogs } from './garden';
import type { BehaviorLog, BehaviorOutcome } from './types';

function log(outcome: BehaviorOutcome): BehaviorLog {
  return {
    id: crypto.randomUUID(),
    childId: 'c1',
    checklistItemId: 'i1',
    logDate: '2026-06-14',
    outcome,
    createdBy: 'p1',
    createdAt: new Date().toISOString(),
  };
}

describe('growthFromLogs', () => {
  it('weights completed above tried and ignores not_yet', () => {
    const logs = [log('completed'), log('tried'), log('not_yet')];
    expect(growthFromLogs(logs)).toBe(3); // 2 + 1 + 0
  });

  it('never decreases for not_yet', () => {
    expect(growthFromLogs([log('not_yet'), log('not_yet')])).toBe(0);
  });
});

describe('stageForGrowth', () => {
  it('starts at seed', () => {
    expect(stageForGrowth(0)).toBe('seed');
  });

  it('advances through stages at thresholds', () => {
    expect(stageForGrowth(3)).toBe('sprout');
    expect(stageForGrowth(8)).toBe('plant');
    expect(stageForGrowth(16)).toBe('flower');
    expect(stageForGrowth(28)).toBe('tree');
    expect(stageForGrowth(45)).toBe('butterflies');
  });

  it('stays at the top stage beyond the last threshold', () => {
    expect(stageForGrowth(1000)).toBe('butterflies');
  });
});

describe('gardenViewFromLogs', () => {
  it('reports progress toward the next stage', () => {
    // 5 completed = growth 10 -> stage "plant" (>=8), next "flower" (16).
    const logs = Array.from({ length: 5 }, () => log('completed'));
    const view = gardenViewFromLogs(logs);
    expect(view.stage).toBe('plant');
    expect(view.nextStage).toBe('flower');
    expect(view.progressToNext).toBeCloseTo((10 - 8) / (16 - 8));
  });

  it('caps progress at the final stage', () => {
    const logs = Array.from({ length: 30 }, () => log('completed')); // growth 60
    const view = gardenViewFromLogs(logs);
    expect(view.stage).toBe('butterflies');
    expect(view.nextStage).toBeNull();
    expect(view.progressToNext).toBe(1);
  });
});
