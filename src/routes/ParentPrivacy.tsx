import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/mock/store';
import { Panel } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { avatarEmoji } from '@/lib/mock/content';

/**
 * Privacy & data (parental-gated). Makes the privacy baseline visible and
 * actionable: what is stored, what is deliberately NOT, consent status, and a
 * clear delete path for the child profile and all related data (rules.md).
 * Deletion is two-step and explicit — never a single stray tap.
 */
export function ParentPrivacy() {
  const { state, deleteChildAndData, reset } = useStore();
  const { child, consent } = state;
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  if (!child) return null; // gate + routing guarantee a child here

  const counts = [
    { label: 'việc trong checklist', n: state.checklist.length },
    { label: 'lượt ghi nhận', n: state.logs.length },
    { label: 'phần thưởng', n: state.rewards.length },
    { label: 'lượt đổi thưởng', n: state.redemptions.length },
  ];

  const handleDelete = () => {
    deleteChildAndData();
    navigate('/onboarding', { replace: true });
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
          <h1 className="text-lg font-semibold text-ink-900">Quyền riêng tư &amp; dữ liệu</h1>
        </header>

        {/* What is stored */}
        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-sm font-semibold text-ink-600">Dữ liệu của con</h2>
          <Panel className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className="grid size-11 place-items-center rounded-full bg-calm-100 text-xl"
                aria-hidden
              >
                {avatarEmoji(child.avatarKey)}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-ink-900">{child.displayName}</p>
                <p className="text-xs text-ink-400">Tên gọi · ngày sinh · avatar hệ thống</p>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {counts.map((c) => (
                <li key={c.label} className="rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-600">
                  <span className="font-semibold tabular-nums text-ink-900">{c.n}</span> {c.label}
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        {/* What is NOT stored — reassurance, matches the onboarding promises */}
        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-sm font-semibold text-ink-600">Những gì chúng tôi không lưu</h2>
          <Panel>
            <ul className="flex flex-col gap-2 text-sm text-ink-600">
              {[
                'Không dùng ảnh thật của con — chỉ avatar hệ thống.',
                'Không lưu vị trí, địa chỉ, trường học hay số điện thoại.',
                'Không chia sẻ dữ liệu của con ra ngoài.',
                'Tuổi không được lưu cố định — luôn tính lại từ ngày sinh.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-leaf-500" aria-hidden>
                    ✓
                  </span>
                  <span className="min-w-0">{line}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        {/* Consent status */}
        {consent && (
          <section className="flex flex-col gap-3">
            <h2 className="px-1 text-sm font-semibold text-ink-600">Đồng ý</h2>
            <Panel className="flex items-start gap-3 text-sm text-ink-600">
              <span className="mt-0.5 text-lg" aria-hidden>
                📋
              </span>
              <p>
                Bạn đã đồng ý với cam kết dữ liệu trẻ em (phiên bản {consent.version}) ngày{' '}
                {formatDate(consent.acceptedAt)}.
              </p>
            </Panel>
          </section>
        )}

        {/* Delete path */}
        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-sm font-semibold text-ink-600">Xóa dữ liệu</h2>
          {!confirming ? (
            <Panel className="flex flex-col gap-3">
              <p className="text-sm text-ink-600">
                Bạn có thể xóa hồ sơ của con và toàn bộ dữ liệu liên quan bất cứ lúc nào. Thao tác
                này không thể hoàn tác.
              </p>
              <Button variant="soft" onClick={() => setConfirming(true)}>
                Xóa hồ sơ &amp; dữ liệu của con
              </Button>
            </Panel>
          ) : (
            <Panel className="flex flex-col gap-3 border-danger/30">
              <p className="text-sm font-medium text-ink-900">
                Xóa toàn bộ dữ liệu của {child.displayName}?
              </p>
              <p className="text-sm text-ink-600">
                Hồ sơ, checklist, lịch sử ghi nhận, điểm và phần thưởng sẽ bị xóa vĩnh viễn. Ứng
                dụng sẽ quay về màn thiết lập ban đầu.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Giữ lại
                </Button>
                <button
                  onClick={handleDelete}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-danger px-5 text-sm font-semibold text-white shadow-[var(--shadow-panel)] transition-opacity hover:opacity-90"
                >
                  Xóa vĩnh viễn
                </button>
              </div>
            </Panel>
          )}
        </section>

        {/* Demo affordance kept distinct from the real delete path */}
        <button
          onClick={() => {
            if (confirm('Đặt lại toàn bộ dữ liệu và quay về màn thiết lập?')) reset();
          }}
          className="self-center text-xs text-ink-400 underline underline-offset-2 hover:text-ink-600"
        >
          Đặt lại dữ liệu demo
        </button>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
