import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@/lib/mock/store';
import { ChildHome } from './ChildHome';
import type { ChildProfile, Reward } from '@/lib/domain/types';

const CHILD: ChildProfile = {
  id: 'c1',
  familyId: 'fam_local',
  displayName: 'An',
  birthDate: '2019-09-01',
  avatarKey: 'fox',
  createdAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

function seed(rewards: Reward[]): void {
  localStorage.setItem(
    'litabluma.mock.v2',
    JSON.stringify({
      consent: { version: '1.0', acceptedAt: '2026-01-01T00:00:00.000Z' },
      child: CHILD,
      checklist: [],
      logs: [],
      rewards,
    }),
  );
}

function renderHome() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <ChildHome />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('ChildHome — rewards garden', () => {
  beforeEach(() => localStorage.clear());

  it('shows a gentle, positive empty state when there are no rewards', () => {
    seed([]);
    renderHome();
    expect(screen.getByText(/Những món quà đang được gieo trồng/)).toBeInTheDocument();
  });

  it('lists rewards when present and drops the empty state', () => {
    seed([
      {
        id: 'r1',
        childId: 'c1',
        title: 'Chọn truyện đọc trước khi ngủ',
        rewardType: 'choice',
        pointsCost: 5,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    renderHome();
    expect(screen.getByText('Chọn truyện đọc trước khi ngủ')).toBeInTheDocument();
    expect(screen.queryByText(/Những món quà đang được gieo trồng/)).not.toBeInTheDocument();
  });
});
