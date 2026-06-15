import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { StoreProvider, useStore } from './store';

function wrapper({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}

/** A child with two items: `used` has a log (+ledger), `unused` has none. */
function seed(): void {
  localStorage.setItem(
    'litabluma.mock.v2',
    JSON.stringify({
      consent: { version: '1.0', acceptedAt: '2026-01-01T00:00:00.000Z' },
      child: {
        id: 'c1',
        familyId: 'fam_local',
        displayName: 'An',
        birthDate: '2019-09-01',
        avatarKey: 'fox',
        createdAt: '2026-01-01T00:00:00.000Z',
        deletedAt: null,
      },
      checklist: [
        {
          id: 'used',
          childId: 'c1',
          templateId: null,
          title: 'Đánh răng',
          pointsValue: 2,
          status: 'active',
          habitStage: 'new',
          category: 'routine',
          virtue: 'independence',
          createdBy: 'cg_parent',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'unused',
          childId: 'c1',
          templateId: null,
          title: 'Việc chưa dùng',
          pointsValue: 1,
          status: 'active',
          habitStage: 'new',
          category: 'custom',
          virtue: null,
          createdBy: 'cg_parent',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      logs: [
        {
          id: 'l1',
          childId: 'c1',
          checklistItemId: 'used',
          logDate: '2026-06-10',
          outcome: 'completed',
          createdBy: 'cg_parent',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      ledger: [
        {
          id: 'e1',
          childId: 'c1',
          sourceType: 'behavior',
          sourceId: 'l1',
          pointsDelta: 2,
          reason: 'Đánh răng',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    }),
  );
}

const find = (api: ReturnType<typeof useStore>, id: string) =>
  api.state.checklist.find((c) => c.id === id);

describe('store — checklist management', () => {
  beforeEach(() => localStorage.clear());

  it('adds a new active item', () => {
    seed();
    const { result } = renderHook(() => useStore(), { wrapper });
    act(() => {
      result.current.addChecklistItem({ title: '  Tự dọn bàn  ', pointsValue: 3, virtue: 'empathy' });
    });
    const added = result.current.state.checklist.find((c) => c.title === 'Tự dọn bàn');
    expect(added).toMatchObject({ pointsValue: 3, status: 'active', habitStage: 'new', virtue: 'empathy' });
  });

  it('edits title/points/virtue without touching the ledger', () => {
    seed();
    const { result } = renderHook(() => useStore(), { wrapper });
    const ledgerBefore = result.current.state.ledger.length;
    act(() => {
      result.current.updateChecklistItem('used', { title: 'Đánh răng tối', pointsValue: 1, virtue: null });
    });
    expect(find(result.current, 'used')).toMatchObject({
      title: 'Đánh răng tối',
      pointsValue: 1,
      virtue: null,
    });
    expect(result.current.state.ledger.length).toBe(ledgerBefore); // points are config, not a ledger write
  });

  it('archives then restores an item', () => {
    seed();
    const { result } = renderHook(() => useStore(), { wrapper });
    act(() => result.current.archiveChecklistItem('unused'));
    expect(find(result.current, 'unused')?.status).toBe('archived');
    act(() => result.current.restoreChecklistItem('unused'));
    expect(find(result.current, 'unused')?.status).toBe('active');
  });

  it('refuses to hard-delete an item with history, but deletes an unused one', () => {
    seed();
    const { result } = renderHook(() => useStore(), { wrapper });

    let removedUsed = true;
    act(() => {
      removedUsed = result.current.removeChecklistItem('used');
    });
    expect(removedUsed).toBe(false);
    expect(find(result.current, 'used')).toBeTruthy();

    let removedUnused = false;
    act(() => {
      removedUnused = result.current.removeChecklistItem('unused');
    });
    expect(removedUnused).toBe(true);
    expect(find(result.current, 'unused')).toBeUndefined();
  });
});

describe('store — child profile', () => {
  beforeEach(() => localStorage.clear());

  it('updates name, birth date, and avatar (age stays derived)', () => {
    seed();
    const { result } = renderHook(() => useStore(), { wrapper });
    act(() => {
      result.current.updateChild({ displayName: 'Bơ', birthDate: '2018-01-01', avatarKey: 'owl' });
    });
    expect(result.current.state.child).toMatchObject({
      displayName: 'Bơ',
      birthDate: '2018-01-01',
      avatarKey: 'owl',
    });
  });

  it('ignores an all-whitespace name', () => {
    seed();
    const { result } = renderHook(() => useStore(), { wrapper });
    act(() => result.current.updateChild({ displayName: '   ' }));
    expect(result.current.state.child?.displayName).toBe('An');
  });
});
