import { describe, it, expect } from 'vitest';
import { deriveBandReview, deriveProposals, PROPOSAL_THRESHOLDS } from './proposals';
import type {
  BehaviorLog,
  BehaviorOutcome,
  BehaviorTemplate,
  ChecklistItem,
  HabitStage,
} from './types';

const ON = new Date(2026, 5, 15); // 2026-06-15, the reference "today"

/** ISO date `daysBack` days before ON. */
function isoDaysBack(daysBack: number): string {
  const d = new Date(ON.getFullYear(), ON.getMonth(), ON.getDate() - daysBack);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function item(over: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: 'i1',
    childId: 'c1',
    templateId: null,
    title: 'Đánh răng buổi tối',
    pointsValue: 2,
    status: 'active',
    habitStage: 'new',
    category: 'routine',
    createdBy: 'p1',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

/** `count` logs of `outcome` for `itemId`, one per recent day starting `startDaysBack`. */
function logs(
  outcome: BehaviorOutcome,
  count: number,
  startDaysBack = 0,
  itemId = 'i1',
): BehaviorLog[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${itemId}-${outcome}-${i}`,
    childId: 'c1',
    checklistItemId: itemId,
    logDate: isoDaysBack(startDaysBack + i),
    outcome,
    createdBy: 'p1',
    createdAt: '2026-01-01T00:00:00.000Z',
  }));
}

describe('deriveProposals — habit tapering', () => {
  it('suggests new → building with -1 point after enough completions', () => {
    const it1 = item({ habitStage: 'new', pointsValue: 2 });
    const result = deriveProposals([it1], logs('completed', PROPOSAL_THRESHOLDS.buildingCompletions), ON);
    expect(result).toHaveLength(1);
    const p = result[0];
    expect(p.kind).toBe('taper_points');
    expect(p.effect).toEqual({ type: 'set_points', points: 1, nextStage: 'building' });
    expect(p.id).toBe('taper:building:i1');
  });

  it('does not suggest tapering below the completion threshold', () => {
    const it1 = item({ habitStage: 'new' });
    const result = deriveProposals(
      [it1],
      logs('completed', PROPOSAL_THRESHOLDS.buildingCompletions - 1),
      ON,
    );
    expect(result).toHaveLength(0);
  });

  it('ignores completions that fall outside the window', () => {
    const it1 = item({ habitStage: 'new' });
    // All completions are older than the 14-day window.
    const old = logs('completed', PROPOSAL_THRESHOLDS.buildingCompletions, PROPOSAL_THRESHOLDS.buildingWindowDays);
    expect(deriveProposals([it1], old, ON)).toHaveLength(0);
  });

  it('never lowers points below 1, but still advances the stage', () => {
    const it1 = item({ habitStage: 'new', pointsValue: 1 });
    const [p] = deriveProposals([it1], logs('completed', PROPOSAL_THRESHOLDS.buildingCompletions), ON);
    expect(p.effect).toEqual({ type: 'set_points', points: 1, nextStage: 'building' });
    expect(p.confirmLabel).not.toMatch(/Giảm/); // no "reduce" copy when it can't drop
  });

  it('suggests building → stable', () => {
    const it1 = item({ habitStage: 'building', pointsValue: 2 });
    const [p] = deriveProposals([it1], logs('completed', PROPOSAL_THRESHOLDS.stableCompletions), ON);
    expect(p.effect).toEqual({ type: 'set_points', points: 1, nextStage: 'stable' });
    expect(p.id).toBe('taper:stable:i1');
  });

  it('suggests stable → recognition_only with points set to 0', () => {
    const it1 = item({ habitStage: 'stable', pointsValue: 2 });
    const [p] = deriveProposals([it1], logs('completed', PROPOSAL_THRESHOLDS.recognitionCompletions), ON);
    expect(p.kind).toBe('recognition_only');
    expect(p.effect).toEqual({ type: 'set_points', points: 0, nextStage: 'recognition_only' });
  });

  it('never proposes anything for a recognition_only item', () => {
    const it1 = item({ habitStage: 'recognition_only', pointsValue: 0 });
    const result = deriveProposals([it1], logs('completed', 30), ON);
    expect(result).toHaveLength(0);
  });
});

describe('deriveProposals — recurring not_yet', () => {
  it('suggests easing/pausing after repeated not_yet with no recent success', () => {
    const it1 = item({ habitStage: 'new' });
    const [p] = deriveProposals([it1], logs('not_yet', PROPOSAL_THRESHOLDS.recurringNotYet), ON);
    expect(p.kind).toBe('recurring_not_yet');
    expect(p.effect).toEqual({ type: 'archive_item' });
  });

  it('does not nag when the child has also completed it recently', () => {
    const it1 = item({ habitStage: 'new' });
    const mixed = [...logs('not_yet', PROPOSAL_THRESHOLDS.recurringNotYet), ...logs('completed', 1, 1)];
    expect(deriveProposals([it1], mixed, ON)).toHaveLength(0);
  });

  it('re-surfaces with a new id as the pattern strengthens (bucketing)', () => {
    const it1 = item({ habitStage: 'new' });
    const few = deriveProposals([it1], logs('not_yet', 3), ON)[0];
    const many = deriveProposals([it1], logs('not_yet', 6), ON)[0];
    expect(few.id).not.toBe(many.id);
  });
});

describe('deriveBandReview', () => {
  // On 2026-06-15, a child born 2020-07-01 is 5 and turns 6 in ~16 days →
  // approaching the 4-5 → 6-7 transition (target band 6-7).
  const APPROACHING_BIRTH = '2020-07-01';
  const TEMPLATES: BehaviorTemplate[] = [
    { id: 'a67', ageBand: '6-7', title: 'A', defaultPoints: 2, category: 'routine', virtue: 'independence' },
    { id: 'b67', ageBand: '6-7', title: 'B', defaultPoints: 2, category: 'eq', virtue: 'empathy' },
    { id: 'c45', ageBand: '4-5', title: 'C', defaultPoints: 1, category: 'routine', virtue: 'responsibility' },
  ];

  it('proposes a review when a transition is near and the new band has fresh items', () => {
    const p = deriveBandReview({
      childName: 'An',
      birthDate: APPROACHING_BIRTH,
      checklist: [],
      templates: TEMPLATES,
      on: ON,
    });
    expect(p?.kind).toBe('band_review');
    expect(p?.itemId).toBeNull();
    expect(p?.id).toBe('band_review:6-7');
    expect(p?.effect).toEqual({ type: 'navigate', to: '/parent/manage' });
  });

  it('does not propose when no transition is near', () => {
    const p = deriveBandReview({
      childName: 'An',
      birthDate: '2021-01-01', // age 5, next transition far away
      checklist: [],
      templates: TEMPLATES,
      on: ON,
    });
    expect(p).toBeNull();
  });

  it('does not propose when every new-band item is already on the checklist', () => {
    const onChecklist: ChecklistItem[] = ['a67', 'b67'].map((tid) =>
      item({ id: `i_${tid}`, templateId: tid }),
    );
    const p = deriveBandReview({
      childName: 'An',
      birthDate: APPROACHING_BIRTH,
      checklist: onChecklist,
      templates: TEMPLATES,
      on: ON,
    });
    expect(p).toBeNull();
  });
});

describe('deriveProposals — scope & safety', () => {
  it('ignores archived items', () => {
    const it1 = item({ status: 'archived', habitStage: 'new' });
    expect(deriveProposals([it1], logs('completed', 20), ON)).toHaveLength(0);
  });

  it('yields at most one proposal per item', () => {
    const it1 = item({ habitStage: 'new', pointsValue: 2 });
    // Enough completions to taper AND some not_yet — taper (positive) wins, once.
    const mixed = [...logs('completed', PROPOSAL_THRESHOLDS.buildingCompletions), ...logs('not_yet', 3, 8)];
    const result = deriveProposals([it1], mixed, ON);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('taper_points');
  });

  it('never produces a negative or behavior-driven point change', () => {
    const stages: HabitStage[] = ['new', 'building', 'stable'];
    for (const stage of stages) {
      const it1 = item({ habitStage: stage, pointsValue: 3 });
      const result = deriveProposals([it1], logs('completed', 20), ON);
      for (const p of result) {
        if (p.effect.type === 'set_points') {
          expect(p.effect.points).toBeGreaterThanOrEqual(0);
          expect(p.effect.points).toBeLessThanOrEqual(it1.pointsValue);
        }
      }
    }
  });
});
