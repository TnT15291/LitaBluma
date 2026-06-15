import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@/lib/mock/store';
import { ParentManage } from './ParentManage';
import type { ChecklistItem, ChildProfile } from '@/lib/domain/types';

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
  id: 'item-1',
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

function seed(): void {
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

function renderManage() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <ParentManage />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('ParentManage', () => {
  beforeEach(() => localStorage.clear());

  it('renders the child profile and existing checklist', () => {
    seed();
    renderManage();
    expect(screen.getByDisplayValue('An')).toBeInTheDocument(); // name field
    expect(screen.getByText('Tự mặc quần áo')).toBeInTheDocument();
  });

  it('adds a new checklist item through the add form', () => {
    seed();
    renderManage();

    fireEvent.click(screen.getByRole('button', { name: /Thêm việc/ }));
    fireEvent.change(screen.getByPlaceholderText(/Tên việc/), {
      target: { value: 'Tự gấp chăn' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));

    expect(screen.getByText('Tự gấp chăn')).toBeInTheDocument();
  });

  it('archives an item and offers it for restore', () => {
    seed();
    renderManage();

    fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tạm ẩn' }));

    expect(screen.getByText('Đã tạm ẩn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Khôi phục' })).toBeInTheDocument();
  });
});
