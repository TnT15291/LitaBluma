import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/mock/store';
import { Panel } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { ageBandForBirthDate, isApproachingBandTransition, isBirthday } from '@/lib/domain/ageBand';
import { canRedeem } from '@/lib/domain/points';
import { STAGE_DISPLAY } from '@/features/garden/stageDisplay';
import { avatarEmoji } from '@/lib/mock/content';
import { cn } from '@/lib/cn';
import type { BehaviorOutcome, RewardType } from '@/lib/domain/types';

const REWARD_TYPES: RewardType[] = ['choice', 'activity', 'privilege', 'object'];

const OUTCOMES: { value: BehaviorOutcome; label: string; emoji: string; active: string }[] = [
  { value: 'completed', label: 'Hoàn thành', emoji: '✓', active: 'bg-leaf-500 text-white' },
  { value: 'tried', label: 'Đã cố gắng', emoji: '◐', active: 'bg-sun-400 text-soil-500' },
  // not_yet is neutral — calm, never red.
  { value: 'not_yet', label: 'Chưa làm', emoji: '·', active: 'bg-ink-300 text-ink-800' },
];

export function ParentDashboard() {
  const { state, balance, garden, logBehavior, redeemReward, addReward, removeReward, reset } =
    useStore();
  const { child } = state;
  const [toast, setToast] = useState<string | null>(null);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [addingReward, setAddingReward] = useState(false);
  const [rwTitle, setRwTitle] = useState('');
  const [rwType, setRwType] = useState<RewardType>('choice');
  const [rwCost, setRwCost] = useState(5);
  if (!child) return null; // routing guards ensure a child exists here

  const band = ageBandForBirthDate(child.birthDate);
  const approaching = isApproachingBandTransition(child.birthDate);
  const birthday = isBirthday(child.birthDate);
  const stage = STAGE_DISPLAY[garden.stage];

  const today = new Date().toISOString().slice(0, 10);
  const loggedToday = new Set(
    state.logs.filter((l) => l.logDate === today).map((l) => l.checklistItemId),
  );
  const lastOutcomeFor = (itemId: string): BehaviorOutcome | null => {
    const todays = state.logs.filter((l) => l.logDate === today && l.checklistItemId === itemId);
    return todays.length ? todays[todays.length - 1].outcome : null;
  };

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout((flash as { _t?: number })._t);
    (flash as { _t?: number })._t = window.setTimeout(() => setToast(null), 3500);
  };

  const handleLog = (itemId: string, outcome: BehaviorOutcome) => {
    setBusyItem(itemId);
    const result = logBehavior(itemId, outcome);
    setBusyItem(null);
    // Positive → child-facing recognition; not_yet → parent self-regulation pause.
    if (result?.recognition) flash(result.recognition.text);
    else if (result?.parentPause) flash(result.parentPause.text);
  };

  const handleRedeem = (rewardId: string, title: string) => {
    if (redeemReward(rewardId)) flash(`Đã đổi: ${title}`);
  };

  const submitReward = () => {
    if (addReward({ title: rwTitle, rewardType: rwType, pointsCost: rwCost })) {
      setRwTitle('');
      setRwType('choice');
      setRwCost(5);
      setAddingReward(false);
      flash('Đã thêm phần thưởng');
    }
  };

  const handleRemoveReward = (rewardId: string, title: string) => {
    if (confirm(`Xóa phần thưởng "${title}"?`)) removeReward(rewardId);
  };

  return (
    <div className="parent-scope px-5 pb-16 pt-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-calm-100 text-xl" aria-hidden>
              {avatarEmoji(child.avatarKey)}
            </span>
            <div>
              <h1 className="text-lg font-semibold text-ink-900">{child.displayName}</h1>
              <p className="text-sm text-ink-500">
                Dải tuổi {band} · {stage.emoji} {stage.label}
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-leaf-500 px-4 text-sm font-semibold text-white shadow-[var(--shadow-panel)] transition-colors hover:bg-leaf-600"
          >
            Chế độ của con <span aria-hidden>🌱</span>
          </Link>
        </header>

        <div className="grid grid-cols-3 gap-3">
          <Panel className="col-span-1 flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Hạt giống</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-ink-900">{balance}</p>
          </Panel>
          <Panel className="col-span-1 flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Ghi nhận</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-ink-900">{state.logs.length}</p>
          </Panel>
          <Panel className="col-span-1 flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Đã đổi</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-ink-900">
              {state.redemptions.length}
            </p>
          </Panel>
        </div>

        {(approaching || birthday) && (
          <Panel className="flex items-start gap-3 border-calm-300 bg-calm-100">
            <span className="text-xl" aria-hidden>
              {birthday ? '🎂' : '🌼'}
            </span>
            <p className="text-sm text-calm-700">
              {birthday
                ? `Hôm nay là sinh nhật ${child.displayName}! Một năm con đã lớn thật nhiều — bạn có muốn xem lại checklist không?`
                : `${child.displayName} sắp chuyển dải tuổi. Bạn muốn cùng cập nhật checklist cho phù hợp chứ?`}
            </p>
          </Panel>
        )}

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-ink-600">Checklist hôm nay</h2>
          <div className="flex flex-col gap-2.5">
            {state.checklist
              .filter((c) => c.status === 'active')
              .map((item) => {
                const last = lastOutcomeFor(item.id);
                return (
                  <Panel key={item.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">{item.title}</p>
                        <p className="text-xs text-ink-400">
                          {item.pointsValue} điểm · {labelStage(item.habitStage)}
                          {loggedToday.has(item.id) && ' · đã ghi hôm nay'}
                        </p>
                      </div>
                    </div>
                    <div
                      role="group"
                      aria-label={`Ghi nhận: ${item.title}`}
                      className="mt-3 grid grid-cols-3 gap-2"
                    >
                      {OUTCOMES.map((o) => {
                        const selected = last === o.value;
                        return (
                          <button
                            key={o.value}
                            onClick={() => handleLog(item.id, o.value)}
                            disabled={busyItem === item.id}
                            aria-pressed={selected}
                            className={
                              'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-medium transition-colors ' +
                              (selected
                                ? o.active + ' shadow-[var(--shadow-panel)]'
                                : 'bg-ink-100 text-ink-600 hover:bg-ink-200')
                            }
                          >
                            <span aria-hidden>{o.emoji}</span>
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </Panel>
                );
              })}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-ink-600">Phần thưởng</h2>
            {!addingReward && (
              <button
                onClick={() => setAddingReward(true)}
                className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-calm-600 hover:bg-calm-100"
              >
                <span aria-hidden>＋</span> Thêm
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {state.rewards.filter((r) => r.isActive).length === 0 && !addingReward && (
              <Panel className="text-center text-sm text-ink-500">
                Chưa có phần thưởng nào. Thêm một quyền lựa chọn hoặc hoạt động cho con nhé.
              </Panel>
            )}

            {state.rewards
              .filter((r) => r.isActive)
              .map((reward) => {
                const check = canRedeem(state.ledger, reward.pointsCost);
                return (
                  <Panel key={reward.id} className="flex items-center justify-between gap-2 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink-900">{reward.title}</p>
                      <p className="text-xs text-ink-400">
                        {reward.pointsCost} điểm · {labelReward(reward.rewardType)}
                      </p>
                    </div>
                    <Button
                      variant={check.affordable ? 'primary' : 'soft'}
                      disabled={!check.affordable}
                      onClick={() => handleRedeem(reward.id, reward.title)}
                    >
                      {check.affordable ? 'Đổi' : `Cần thêm ${check.shortfall}`}
                    </Button>
                    <button
                      onClick={() => handleRemoveReward(reward.id, reward.title)}
                      aria-label={`Xóa phần thưởng ${reward.title}`}
                      className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-danger"
                    >
                      <span aria-hidden>🗑</span>
                    </button>
                  </Panel>
                );
              })}

            {addingReward && (
              <Panel className="flex flex-col gap-3">
                <input
                  value={rwTitle}
                  onChange={(e) => setRwTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitReward()}
                  maxLength={48}
                  autoFocus
                  placeholder="Tên phần thưởng (vd: Chọn phim cuối tuần)"
                  className="w-full rounded-xl border border-ink-200 px-4 py-2.5 outline-none focus:border-calm-500"
                />
                <div className="flex flex-wrap gap-2">
                  {REWARD_TYPES.map((tp) => (
                    <button
                      key={tp}
                      onClick={() => setRwType(tp)}
                      aria-pressed={rwType === tp}
                      className={cn(
                        'min-h-9 rounded-full px-3 text-sm font-medium transition-colors',
                        rwType === tp ? 'bg-calm-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
                      )}
                    >
                      {labelReward(tp)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-ink-600">
                    Giá điểm
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={rwCost}
                      onChange={(e) => setRwCost(Number(e.target.value))}
                      className="w-20 rounded-xl border border-ink-200 px-3 py-2 tabular-nums outline-none focus:border-calm-500"
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAddingReward(false);
                        setRwTitle('');
                      }}
                    >
                      Hủy
                    </Button>
                    <Button variant="primary" disabled={!rwTitle.trim()} onClick={submitReward}>
                      Lưu
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-ink-400">
                  Ưu tiên quyền lựa chọn, hoạt động và đặc quyền hơn vật phẩm.
                </p>
              </Panel>
            )}
          </div>
        </section>

        {state.ledger.length > 0 && (
          <section>
            <h2 className="mb-2 px-1 text-sm font-semibold text-ink-600">Hoạt động gần đây</h2>
            <Panel className="divide-y divide-ink-100 p-0">
              {[...state.ledger]
                .reverse()
                .slice(0, 5)
                .map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="truncate text-ink-700">{e.reason}</span>
                    <span
                      className={
                        'ml-3 shrink-0 font-semibold tabular-nums ' +
                        (e.pointsDelta >= 0 ? 'text-leaf-600' : 'text-ink-400')
                      }
                    >
                      {e.pointsDelta >= 0 ? `+${e.pointsDelta}` : e.pointsDelta}
                    </span>
                  </div>
                ))}
            </Panel>
          </section>
        )}

        <button
          onClick={() => {
            if (confirm('Đặt lại toàn bộ dữ liệu và quay về màn thiết lập?')) reset();
          }}
          className="self-center text-xs text-ink-400 underline underline-offset-2 hover:text-ink-600"
        >
          Đặt lại dữ liệu
        </button>
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-5 flex justify-center px-5" style={{ zIndex: 'var(--z-toast)' }}>
          <div
            role="status"
            className="max-w-md rounded-2xl bg-ink-900 px-5 py-3 text-center text-sm font-medium text-white shadow-[var(--shadow-pop)]"
            style={{ animation: 'pop-in 0.25s var(--ease-out-quart) both' }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function labelStage(stage: string): string {
  switch (stage) {
    case 'new':
      return 'mới';
    case 'building':
      return 'đang hình thành';
    case 'stable':
      return 'ổn định';
    case 'recognition_only':
      return 'ghi nhận thường xuyên';
    default:
      return stage;
  }
}

function labelReward(type: string): string {
  switch (type) {
    case 'choice':
      return 'quyền lựa chọn';
    case 'activity':
      return 'hoạt động';
    case 'privilege':
      return 'đặc quyền';
    case 'object':
      return 'vật phẩm';
    default:
      return type;
  }
}
