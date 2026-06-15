import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@/lib/mock/store';
import { ParentSituations } from './ParentSituations';
import type { ChildProfile } from '@/lib/domain/types';

/** Birth date that makes the child ~5 today → age band 4-5. */
const CHILD: ChildProfile = {
  id: 'c1',
  familyId: 'fam_local',
  displayName: 'An',
  birthDate: '2021-01-01',
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
    }),
  );
}

function renderSituations() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <ParentSituations />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('ParentSituations', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to the child band and hides out-of-band scenarios until "Tất cả"', () => {
    seed();
    renderSituations();

    // A 4-5 scenario shows; an 8-10-only scenario is hidden.
    expect(screen.getByText('Con khóc vì bị giành mất đồ chơi')).toBeInTheDocument();
    expect(screen.queryByText(/con ghét bố\/mẹ/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tất cả' }));
    expect(screen.getByText(/con ghét bố\/mẹ/)).toBeInTheDocument();
  });

  it('expands a scenario to reveal the 4-step guidance', () => {
    seed();
    renderSituations();

    // Step labels render with a "1. " number prefix as a sibling text node, so
    // match on a substring rather than the exact node text.
    expect(screen.queryByText(/Công nhận cảm xúc/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Con khóc vì bị giành mất đồ chơi/ }));

    expect(screen.getByText(/Công nhận cảm xúc/)).toBeInTheDocument();
    expect(screen.getByText(/Cùng giải quyết/)).toBeInTheDocument();
  });
});
