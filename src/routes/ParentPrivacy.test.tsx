import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@/lib/mock/store';
import { ParentPrivacy } from './ParentPrivacy';
import type { ChildProfile } from '@/lib/domain/types';

const CHILD: ChildProfile = {
  id: 'c1',
  familyId: 'fam_local',
  displayName: 'An',
  birthDate: '2019-09-01',
  avatarKey: 'fox',
  createdAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

function seed(): void {
  localStorage.setItem(
    'litabluma.mock.v2',
    JSON.stringify({
      consent: { version: '1.0', acceptedAt: '2026-01-01T00:00:00.000Z' },
      child: CHILD,
      checklist: [],
      logs: [],
      rewards: [],
    }),
  );
}

function savedChild(): unknown {
  return JSON.parse(localStorage.getItem('litabluma.mock.v2') ?? '{}').child;
}

function renderPrivacy() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <ParentPrivacy />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('ParentPrivacy — delete flow', () => {
  beforeEach(() => localStorage.clear());

  it('requires a second explicit confirm before deleting (data intact after step one)', () => {
    seed();
    renderPrivacy();

    fireEvent.click(screen.getByRole('button', { name: /Xóa hồ sơ.*dữ liệu của con/ }));

    // Confirmation copy is shown, but nothing is deleted yet.
    expect(screen.getByText(/Xóa toàn bộ dữ liệu của An/)).toBeInTheDocument();
    expect(savedChild()).not.toBeNull();
  });

  it('erases the child profile and all data on confirm', () => {
    seed();
    renderPrivacy();

    fireEvent.click(screen.getByRole('button', { name: /Xóa hồ sơ.*dữ liệu của con/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Xóa vĩnh viễn' }));

    expect(savedChild()).toBeNull();
  });
});
