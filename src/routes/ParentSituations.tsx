import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/mock/store';
import { Panel } from '@/components/shared/Card';
import { cn } from '@/lib/cn';
import { ageBandForBirthDate } from '@/lib/domain/ageBand';
import { situationsForBand, SITUATION_STEPS } from '@/lib/domain/situations';
import { virtueMeta } from '@/lib/domain/virtues';
import { SITUATIONS } from '@/lib/mock/situations';
import type { SituationGuide } from '@/lib/domain/types';

/**
 * "Cẩm nang xử lý tình huống" — the non-AI situation library (product-spec
 * §16.2). Parent-facing coaching: each scenario opens to the 4-step response
 * (acknowledge → calm → empathize → resolve) + a mistake to avoid. No AI, no
 * diagnosis, parent-mediated. Defaults to the child's current band.
 */
export function ParentSituations() {
  const { state } = useStore();
  const { child } = state;
  const [scope, setScope] = useState<'band' | 'all'>('band');
  const [openId, setOpenId] = useState<string | null>(null);

  if (!child) return null;

  const band = ageBandForBirthDate(child.birthDate);
  const list = scope === 'band' ? situationsForBand(SITUATIONS, band) : SITUATIONS;

  return (
    <div className="parent-scope px-5 pb-16 pt-6">
      <div className="mx-auto flex max-w-xl flex-col gap-5">
        <header className="flex items-center justify-between gap-3">
          <Link
            to="/parent"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink-100 px-4 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-200"
          >
            <span aria-hidden>←</span> Bảng điều khiển
          </Link>
          <h1 className="text-lg font-semibold text-ink-900">Cẩm nang tình huống</h1>
        </header>

        <p className="px-1 text-sm text-ink-500">
          Khi con có cảm xúc khó, đây là cách đồng hành theo 4 bước:{' '}
          <span className="text-ink-700">công nhận → bình tĩnh → thấu cảm → cùng giải quyết</span>.
          Gợi ý cho bố mẹ, không phải kịch bản cứng.
        </p>

        {/* Scope toggle: this band vs all */}
        <div className="flex gap-2" role="group" aria-label="Lọc theo dải tuổi">
          <ScopeButton on={scope === 'band'} onClick={() => setScope('band')}>
            Hợp tuổi con ({band})
          </ScopeButton>
          <ScopeButton on={scope === 'all'} onClick={() => setScope('all')}>
            Tất cả
          </ScopeButton>
        </div>

        <div className="flex flex-col gap-2.5">
          {list.map((s) => (
            <SituationCard
              key={s.id}
              situation={s}
              open={openId === s.id}
              onToggle={() => setOpenId((id) => (id === s.id ? null : s.id))}
            />
          ))}
        </div>

        <p className="px-1 text-center text-xs text-ink-400">
          Nội dung tham khảo, không thay thế tư vấn chuyên môn. Nếu con có dấu hiệu cần hỗ trợ
          chuyên sâu, hãy gặp chuyên gia thật.
        </p>
      </div>
    </div>
  );
}

function SituationCard({
  situation: s,
  open,
  onToggle,
}: {
  situation: SituationGuide;
  open: boolean;
  onToggle: () => void;
}) {
  const virtue = s.virtue ? virtueMeta(s.virtue) : null;
  return (
    <Panel className="p-0">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <p className="font-medium text-ink-900">{s.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-400">
            {virtue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-calm-100 px-2 py-0.5 font-medium text-calm-700">
                <span aria-hidden>{virtue.emoji}</span>
                {virtue.label}
              </span>
            )}
            <span>Cảm xúc: {s.emotion}</span>
          </p>
        </div>
        <span
          className={cn('shrink-0 text-ink-400 transition-transform', open && 'rotate-180')}
          aria-hidden
        >
          ⌄
        </span>
      </button>

      {open && (
        <div
          className="flex flex-col gap-3 border-t border-ink-100 px-4 pb-4 pt-3"
          style={{ animation: 'rise-in 0.25s var(--ease-out-quart) both' }}
        >
          <p className="text-sm text-ink-600">
            <span className="font-medium text-ink-700">Vì sao:</span> {s.cause}
          </p>

          <ol className="flex flex-col gap-2.5">
            {SITUATION_STEPS.map((step, i) => (
              <li key={step.key} className="flex gap-3">
                <span
                  className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-calm-100 text-sm"
                  aria-hidden
                >
                  {step.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-calm-600">
                    {i + 1}. {step.label}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-700">{s.steps[step.key]}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex items-start gap-2 rounded-xl bg-sun-100 px-3 py-2.5 text-sm text-soil-500">
            <span className="mt-0.5 shrink-0" aria-hidden>
              ⚠️
            </span>
            <p>
              <span className="font-medium">Tránh:</span> {s.avoid}
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}

function ScopeButton({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'min-h-9 rounded-full px-4 text-sm font-medium transition-colors',
        on ? 'bg-calm-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
      )}
    >
      {children}
    </button>
  );
}
