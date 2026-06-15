import { describe, it, expect } from 'vitest';
import { buildWeeklyReport } from './weeklyReport';
import type { BehaviorLog, BehaviorOutcome, ChecklistItem } from './types';

const ON = new Date(2026, 5, 15);
const REFLECTIONS = ['r0', 'r1', 'r2'];
const TIPS = ['t0', 't1', 't2'];

function isoDaysBack(daysBack: number): string {
  const d = new Date(ON.getFullYear(), ON.getMonth(), ON.getDate() - daysBack);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function item(id: string, virtue: ChecklistItem['virtue'], title = id): ChecklistItem {
  return {
    id,
    childId: 'c1',
    templateId: null,
    title,
    pointsValue: 2,
    status: 'active',
    habitStage: 'new',
    category: 'routine',
    virtue,
    createdBy: 'p1',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function log(itemId: string, outcome: BehaviorOutcome, daysBack: number): BehaviorLog {
  return {
    id: `${itemId}-${outcome}-${daysBack}-${Math.random()}`,
    childId: 'c1',
    checklistItemId: itemId,
    logDate: isoDaysBack(daysBack),
    outcome,
    createdBy: 'p1',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('buildWeeklyReport', () => {
  it('reports no activity for an empty week (but still offers a reflection + tip)', () => {
    const r = buildWeeklyReport([], [], REFLECTIONS, TIPS, ON);
    expect(r.hasActivity).toBe(false);
    expect(r.goodMoments).toBe(0);
    expect(r.byVirtue).toHaveLength(0);
    expect(r.reflection).not.toBeNull();
    expect(r.tip).not.toBeNull();
  });

  it('counts good moments and active days, excluding not_yet', () => {
    const checklist = [item('a', 'independence')];
    const logs = [
      log('a', 'completed', 0),
      log('a', 'tried', 1),
      log('a', 'not_yet', 2), // excluded
      log('a', 'completed', 2), // same day as the not_yet, still one active day
    ];
    const r = buildWeeklyReport(checklist, logs, REFLECTIONS, TIPS, ON);
    expect(r.goodMoments).toBe(3);
    expect(r.completed).toBe(2);
    expect(r.tried).toBe(1);
    expect(r.activeDays).toBe(3); // positive logs on days 0, 1, 2
  });

  it('excludes logs outside the 7-day window', () => {
    const checklist = [item('a', 'independence')];
    const logs = [log('a', 'completed', 7), log('a', 'completed', 30)];
    const r = buildWeeklyReport(checklist, logs, REFLECTIONS, TIPS, ON);
    expect(r.hasActivity).toBe(false);
  });

  it('groups highlights by virtue, sorted by activity', () => {
    const checklist = [item('a', 'empathy'), item('b', 'independence')];
    const logs = [
      log('a', 'completed', 0),
      log('b', 'completed', 0),
      log('b', 'completed', 1),
      log('b', 'tried', 1),
    ];
    const r = buildWeeklyReport(checklist, logs, REFLECTIONS, TIPS, ON);
    expect(r.byVirtue[0].virtue).toBe('independence'); // 3 beats 1
    expect(r.byVirtue[0].total).toBe(3);
    expect(r.byVirtue[1].virtue).toBe('empathy');
  });

  it('ranks top behaviors by recognition count', () => {
    const checklist = [item('a', 'empathy', 'Chia sẻ'), item('b', 'independence', 'Tự mặc đồ')];
    const logs = [log('a', 'completed', 0), log('b', 'completed', 0), log('b', 'tried', 1)];
    const r = buildWeeklyReport(checklist, logs, REFLECTIONS, TIPS, ON);
    expect(r.topBehaviors[0]).toMatchObject({ title: 'Tự mặc đồ', count: 2 });
  });

  it('selects reflection + tip deterministically for the same week', () => {
    const a = buildWeeklyReport([], [], REFLECTIONS, TIPS, ON);
    const b = buildWeeklyReport([], [], REFLECTIONS, TIPS, ON);
    expect(a.reflection).toBe(b.reflection);
    expect(a.tip).toBe(b.tip);
  });
});
