import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/mock/store';
import { Panel } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { cn } from '@/lib/cn';
import { ageBandForBirthDate, isApproachingBandTransition } from '@/lib/domain/ageBand';
import { templatesForBand } from '@/lib/domain/templates';
import { VIRTUES, virtueMeta } from '@/lib/domain/virtues';
import { BEHAVIOR_TEMPLATES, SYSTEM_AVATARS } from '@/lib/mock/content';
import type { Virtue } from '@/lib/domain/types';

/**
 * Parent management — edit the child profile and the checklist (add / edit /
 * archive / restore / delete). Kept off the daily dashboard so logging stays
 * clean. Editing an item's points only changes future logs; an item with
 * history can be archived but not erased (the store enforces this).
 */
export function ParentManage() {
  const {
    state,
    addChecklistItem,
    updateChecklistItem,
    archiveChecklistItem,
    restoreChecklistItem,
    removeChecklistItem,
    updateChild,
  } = useStore();
  const { child } = state;

  const [name, setName] = useState(child?.displayName ?? '');
  const [birthDate, setBirthDate] = useState(child?.birthDate ?? '');
  const [avatarKey, setAvatarKey] = useState(child?.avatarKey ?? SYSTEM_AVATARS[0].key);
  const [profileSaved, setProfileSaved] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPoints, setEditPoints] = useState(1);
  const [editVirtue, setEditVirtue] = useState<Virtue | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addPoints, setAddPoints] = useState(2);
  const [addVirtue, setAddVirtue] = useState<Virtue | null>(null);

  if (!child) return null;

  const today = new Date().toISOString().slice(0, 10);
  const formBand = birthDate ? ageBandForBirthDate(birthDate) : null;
  const profileDirty =
    name.trim() !== child.displayName || birthDate !== child.birthDate || avatarKey !== child.avatarKey;
  const profileValid = name.trim().length > 0 && birthDate.length > 0;

  const active = state.checklist.filter((c) => c.status === 'active');
  const archived = state.checklist.filter((c) => c.status === 'archived');
  const hasLogs = (itemId: string) => state.logs.some((l) => l.checklistItemId === itemId);

  const usedTemplateIds = new Set(state.checklist.map((c) => c.templateId).filter(Boolean));
  // When a band transition is near, show the *upcoming* band's suggestions —
  // this is where the band_review proposal lands the parent to prepare.
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const suggestBand = isApproachingBandTransition(child.birthDate)
    ? ageBandForBirthDate(child.birthDate, futureDate)
    : ageBandForBirthDate(child.birthDate);
  const suggestions = templatesForBand(BEHAVIOR_TEMPLATES, suggestBand).filter(
    (t) => !usedTemplateIds.has(t.id),
  );

  const saveProfile = () => {
    if (!profileValid) return;
    updateChild({ displayName: name, birthDate, avatarKey });
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2000);
  };

  const startEdit = (id: string, title: string, points: number, virtue: Virtue | null) => {
    setEditingId(id);
    setEditTitle(title);
    setEditPoints(points);
    setEditVirtue(virtue);
  };
  const saveEdit = () => {
    if (!editingId || !editTitle.trim()) return;
    updateChecklistItem(editingId, { title: editTitle, pointsValue: editPoints, virtue: editVirtue });
    setEditingId(null);
  };

  const submitAdd = () => {
    if (addChecklistItem({ title: addTitle, pointsValue: addPoints, virtue: addVirtue })) {
      setAddTitle('');
      setAddPoints(2);
      setAddVirtue(null);
      setAddOpen(false);
    }
  };

  return (
    <div className="parent-scope px-5 pb-16 pt-6">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            to="/parent"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink-100 px-4 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-200"
          >
            <span aria-hidden>←</span> Bảng điều khiển
          </Link>
          <h1 className="text-lg font-semibold text-ink-900">Quản lý</h1>
        </header>

        {/* Child profile */}
        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-sm font-semibold text-ink-600">Hồ sơ của con</h2>
          <Panel className="flex flex-col gap-4">
            <label className="block">
              <span className="text-sm font-medium text-ink-700">Tên gọi của con</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 outline-none focus:border-calm-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink-700">Ngày sinh</span>
              <span className="mt-0.5 block text-xs text-ink-400">
                Dùng để tính dải tuổi — không lưu tuổi cố định.
              </span>
              <input
                type="date"
                value={birthDate}
                max={today}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 outline-none focus:border-calm-500"
              />
              {formBand && <p className="mt-2 text-sm text-calm-700">Dải tuổi hiện tại: {formBand}</p>}
            </label>

            <div>
              <span className="text-sm font-medium text-ink-700">Hình đại diện</span>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {SYSTEM_AVATARS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setAvatarKey(a.key)}
                    aria-pressed={avatarKey === a.key}
                    aria-label={a.label}
                    className={cn(
                      'grid aspect-square place-items-center rounded-2xl text-3xl transition-colors',
                      avatarKey === a.key
                        ? 'bg-calm-100 ring-2 ring-calm-500'
                        : 'bg-ink-100 hover:bg-ink-200',
                    )}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              {profileSaved && <span className="text-sm text-leaf-600">Đã lưu ✓</span>}
              <Button variant="primary" disabled={!profileDirty || !profileValid} onClick={saveProfile}>
                Lưu hồ sơ
              </Button>
            </div>
          </Panel>
        </section>

        {/* Checklist */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-ink-600">Checklist</h2>
            {!addOpen && (
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-calm-600 hover:bg-calm-100"
              >
                <span aria-hidden>＋</span> Thêm việc
              </button>
            )}
          </div>

          {addOpen && (
            <Panel className="flex flex-col gap-3">
              <input
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
                maxLength={48}
                autoFocus
                placeholder="Tên việc (vd: Tự gấp chăn buổi sáng)"
                className="w-full rounded-xl border border-ink-200 px-4 py-2.5 outline-none focus:border-calm-500"
              />
              <VirtuePicker value={addVirtue} onChange={setAddVirtue} />
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-ink-600">
                  Điểm
                  <PointsInput value={addPoints} onChange={setAddPoints} />
                </label>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setAddOpen(false)}>
                    Hủy
                  </Button>
                  <Button variant="primary" disabled={!addTitle.trim()} onClick={submitAdd}>
                    Thêm
                  </Button>
                </div>
              </div>
            </Panel>
          )}

          <div className="flex flex-col gap-2">
            {active.map((item) =>
              editingId === item.id ? (
                <Panel key={item.id} className="flex flex-col gap-3">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={48}
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 outline-none focus:border-calm-500"
                  />
                  <VirtuePicker value={editVirtue} onChange={setEditVirtue} />
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-ink-600">
                      Điểm
                      <PointsInput value={editPoints} onChange={setEditPoints} />
                    </label>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setEditingId(null)}>
                        Hủy
                      </Button>
                      <Button variant="primary" disabled={!editTitle.trim()} onClick={saveEdit}>
                        Lưu
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 pt-3">
                    <Button variant="soft" onClick={() => archiveChecklistItem(item.id)}>
                      Tạm ẩn
                    </Button>
                    {!hasLogs(item.id) && (
                      <button
                        onClick={() => {
                          if (confirm(`Xóa hẳn việc "${item.title}"?`)) removeChecklistItem(item.id);
                        }}
                        className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-danger hover:bg-ink-100"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </Panel>
              ) : (
                <Panel key={item.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{item.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-400">
                      {item.virtue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-calm-100 px-2 py-0.5 font-medium text-calm-700">
                          <span aria-hidden>{virtueMeta(item.virtue).emoji}</span>
                          {virtueMeta(item.virtue).label}
                        </span>
                      )}
                      <span>{item.pointsValue} điểm</span>
                    </p>
                  </div>
                  <Button
                    variant="soft"
                    onClick={() => startEdit(item.id, item.title, item.pointsValue, item.virtue ?? null)}
                  >
                    Sửa
                  </Button>
                </Panel>
              ),
            )}
            {active.length === 0 && (
              <Panel className="text-center text-sm text-ink-500">
                Chưa có việc nào. Thêm một việc hoặc chọn từ gợi ý bên dưới.
              </Panel>
            )}
          </div>

          {suggestions.length > 0 && (
            <div>
              <h3 className="mb-1.5 px-1 text-xs font-medium uppercase tracking-wide text-ink-400">
                Gợi ý cho dải tuổi {suggestBand}
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      addChecklistItem({
                        title: t.title,
                        pointsValue: t.defaultPoints,
                        category: t.category,
                        virtue: t.virtue,
                        templateId: t.id,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-200"
                  >
                    <span aria-hidden>{virtueMeta(t.virtue).emoji}</span>
                    {t.title}
                    <span aria-hidden className="text-calm-600">
                      ＋
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {archived.length > 0 && (
            <div>
              <h3 className="mb-1.5 px-1 text-xs font-medium uppercase tracking-wide text-ink-400">
                Đã tạm ẩn
              </h3>
              <div className="flex flex-col gap-2">
                {archived.map((item) => (
                  <Panel key={item.id} className="flex items-center justify-between gap-3 p-4">
                    <p className="min-w-0 truncate text-sm text-ink-500">{item.title}</p>
                    <Button variant="ghost" onClick={() => restoreChecklistItem(item.id)}>
                      Khôi phục
                    </Button>
                  </Panel>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function VirtuePicker({ value, onChange }: { value: Virtue | null; onChange: (v: Virtue | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {VIRTUES.map((v) => (
        <button
          key={v.key}
          type="button"
          onClick={() => onChange(v.key)}
          aria-pressed={value === v.key}
          className={cn(
            'inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-medium transition-colors',
            value === v.key ? 'bg-calm-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
          )}
        >
          <span aria-hidden>{v.emoji}</span>
          {v.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={value === null}
        className={cn(
          'min-h-9 rounded-full px-3 text-sm font-medium transition-colors',
          value === null ? 'bg-ink-700 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
        )}
      >
        Khác
      </button>
    </div>
  );
}

function PointsInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      min={1}
      max={99}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-20 rounded-xl border border-ink-200 px-3 py-2 tabular-nums outline-none focus:border-calm-500"
    />
  );
}
