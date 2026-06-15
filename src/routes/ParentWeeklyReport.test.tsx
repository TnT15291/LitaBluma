import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@/lib/mock/store';
import { ParentWeeklyReport } from './ParentWeeklyReport';
import type { BehaviorLog, ChecklistItem, ChildProfile } from '@/lib/domain/types';

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
  id: 'item-dress',
  childId: 'c1',
  templateId: null,
  title: 'Tự mặc quần áo',
  pointsValue: 2,
  status: 'active',
  habitStage: 'new',
  category: 'routine',
  virtue: 'independence',
  createdBy: 'cg_parent',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function seed(logs: BehaviorLog[]): void {
  localStorage.setItem(
    'litabluma.mock.v2',
    JSON.stringify({
      consent: { version: '1.0', acceptedAt: '2026-01-01T00:00:00.000Z' },
      child: CHILD,
      checklist: [ITEM],
      logs,
    }),
  );
}

function completed(daysBack: number): BehaviorLog {
  return {
    id: `log-${daysBack}`,
    childId: 'c1',
    checklistItemId: 'item-dress',
    logDate: recentIso(daysBack),
    outcome: 'completed',
    createdBy: 'cg_parent',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function renderReport() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <ParentWeeklyReport />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('ParentWeeklyReport', () => {
  beforeEach(() => localStorage.clear());

  it('renders the letter with the virtue the child practiced this week', () => {
    seed([completed(0), completed(1)]);
    renderReport();

    expect(screen.getByText('Lá thư tuần này')).toBeInTheDocument();
    expect(screen.getByText('Con đã thực hành')).toBeInTheDocument();
    expect(screen.getByText('Tự lập')).toBeInTheDocument(); // independence label
  });

  it('shows a gentle empty state when there was no activity', () => {
    seed([]);
    renderReport();

    expect(screen.getByText('Lá thư tuần này')).toBeInTheDocument();
    expect(screen.getByText(/chưa có ghi nhận nào/)).toBeInTheDocument();
  });
});
