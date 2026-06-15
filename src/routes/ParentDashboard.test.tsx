import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@/lib/mock/store';
import { ParentDashboard } from './ParentDashboard';
import type { BehaviorLog, ChecklistItem, ChildProfile } from '@/lib/domain/types';

/** ISO date `daysBack` days before now (proposals use the real clock). */
function recentIso(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const CHILD: ChildProfile = {
  id: 'c1',
  familyId: 'fam_local',
  displayName: 'An',
  birthDate: '2019-09-01',
  avatarKey: 'fox',
  createdAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

const ITEM: ChecklistItem = {
  id: 'item-brush',
  childId: 'c1',
  templateId: null,
  title: 'Đánh răng buổi tối',
  pointsValue: 2,
  status: 'active',
  habitStage: 'new',
  category: 'routine',
  createdBy: 'cg_parent',
  createdAt: '2026-01-01T00:00:00.000Z',
};

/** Seven completions across the last week — enough to suggest new → building. */
function completedLogs(): BehaviorLog[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: `log-${i}`,
    childId: 'c1',
    checklistItemId: 'item-brush',
    logDate: recentIso(i),
    outcome: 'completed' as const,
    createdBy: 'cg_parent',
    createdAt: '2026-01-01T00:00:00.000Z',
  }));
}

function seed(): void {
  localStorage.setItem(
    'litabluma.mock.v2',
    JSON.stringify({
      consent: { version: '1.0', acceptedAt: '2026-01-01T00:00:00.000Z' },
      child: CHILD,
      checklist: [ITEM],
      logs: completedLogs(),
    }),
  );
}

/** A clean child + one item with no history (for the micro-pause flow). */
function seedClean(): void {
  localStorage.setItem(
    'litabluma.mock.v2',
    JSON.stringify({
      consent: { version: '1.0', acceptedAt: '2026-01-01T00:00:00.000Z' },
      child: CHILD,
      checklist: [ITEM],
      logs: [],
    }),
  );
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <ParentDashboard />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('ParentDashboard — parent-confirmed proposals', () => {
  beforeEach(() => localStorage.clear());

  it('surfaces a tapering proposal but does not change points until the parent confirms', () => {
    seed();
    renderDashboard();

    // The proposal is shown...
    expect(screen.getByText(/đã thành thói quen/)).toBeInTheDocument();
    // ...but the checklist item still shows its original 2 points (nothing applied yet).
    expect(screen.getByText(/2 điểm · mới/)).toBeInTheDocument();
  });

  it('applies the change on confirm and removes the handled proposal', () => {
    seed();
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /Giảm còn 1 hạt/ }));

    // Proposal is gone, and the item is now 1 point in the "building" stage.
    expect(screen.queryByText(/đã thành thói quen/)).not.toBeInTheDocument();
    expect(screen.getByText(/1 điểm · đang hình thành/)).toBeInTheDocument();
  });

  it('hides the proposal on decline without changing the item', () => {
    seed();
    renderDashboard();

    const proposal = screen.getByText(/đã thành thói quen/).closest('div.parent-panel');
    expect(proposal).not.toBeNull();
    fireEvent.click(within(proposal as HTMLElement).getByRole('button', { name: 'Giữ nguyên' }));

    expect(screen.queryByText(/đã thành thói quen/)).not.toBeInTheDocument();
    // Declining changes nothing: still 2 points, still "new".
    expect(screen.getByText(/2 điểm · mới/)).toBeInTheDocument();
  });
});

/** A birth date that makes the child turn 6 in ~15 days → approaching 4-5 → 6-7. */
function approachingBirthDate(): string {
  const now = new Date();
  const d = new Date(now.getFullYear() - 6, now.getMonth(), now.getDate() + 15);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seedApproaching(): void {
  localStorage.setItem(
    'litabluma.mock.v2',
    JSON.stringify({
      consent: { version: '1.0', acceptedAt: '2026-01-01T00:00:00.000Z' },
      child: { ...CHILD, birthDate: approachingBirthDate() },
      checklist: [], // nothing from the upcoming band yet
      logs: [],
    }),
  );
}

describe('ParentDashboard — band_review proposal', () => {
  beforeEach(() => localStorage.clear());

  it('surfaces a band-review proposal with a link to the manage screen', () => {
    seedApproaching();
    renderDashboard();

    expect(screen.getByText(/sắp chuyển sang dải tuổi 6-7/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Xem gợi ý' });
    expect(link).toHaveAttribute('href', '/parent/manage');
  });

  it('can be dismissed', () => {
    seedApproaching();
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: 'Để sau' }));
    expect(screen.queryByText(/sắp chuyển sang dải tuổi/)).not.toBeInTheDocument();
  });
});

describe('ParentDashboard — parent self-regulation micro-pause', () => {
  beforeEach(() => localStorage.clear());

  it('shows a calm in-place pause when the parent logs not_yet', () => {
    seedClean();
    renderDashboard();

    expect(screen.queryByText('Một nhịp cho bố mẹ')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Chưa làm/ }));

    // The pause is present (and persists — it is not a transient toast).
    expect(screen.getByText('Một nhịp cho bố mẹ')).toBeInTheDocument();
  });

  it('is dismissible', () => {
    seedClean();
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /Chưa làm/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Đóng lời nhắc' }));

    expect(screen.queryByText('Một nhịp cho bố mẹ')).not.toBeInTheDocument();
  });

  it('clears when the same behavior is later logged as a good moment', () => {
    seedClean();
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /Chưa làm/ }));
    expect(screen.getByText('Một nhịp cho bố mẹ')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Hoàn thành/ }));
    expect(screen.queryByText('Một nhịp cho bố mẹ')).not.toBeInTheDocument();
  });
});
