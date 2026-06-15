import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/mock/store';
import { Panel } from '@/components/shared/Card';
import { buildWeeklyReport } from '@/lib/domain/weeklyReport';
import { WEEKLY_PARENT_TIPS, WEEKLY_REFLECTION_PROMPTS } from '@/lib/mock/content';

/**
 * Weekly report — the non-AI "Lá thư tuần này". Strength-based and descriptive:
 * it celebrates what the child practiced (by virtue) and offers the parent one
 * reflection + one tip. No score, no ranking, no "good/bad week". Parent-only.
 * The AI dual-analysis layer (child + parent) layers on top later.
 */
export function ParentWeeklyReport() {
  const { state } = useStore();
  const { child } = state;

  const report = useMemo(
    () =>
      buildWeeklyReport(state.checklist, state.logs, WEEKLY_REFLECTION_PROMPTS, WEEKLY_PARENT_TIPS),
    [state.checklist, state.logs],
  );

  if (!child) return null;

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
          <p className="text-xs text-ink-400">{formatRange(report.from, report.to)}</p>
        </header>

        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Lá thư tuần này</h1>
          <p className="mt-1 text-sm text-ink-500">
            Một tuần của {child.displayName} — và một nhịp cho bố mẹ.
          </p>
        </div>

        {!report.hasActivity ? (
          <Panel className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-3xl" aria-hidden>
              🌱
            </span>
            <p className="text-sm text-ink-500">
              Tuần này chưa có ghi nhận nào. Bắt đầu từ một việc nhỏ cũng đã là một hạt giống.
            </p>
          </Panel>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Panel className="flex flex-col justify-center">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  Khoảnh khắc đẹp
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-ink-900">
                  {report.goodMoments}
                </p>
              </Panel>
              <Panel className="flex flex-col justify-center">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  Số ngày đồng hành
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-ink-900">
                  {report.activeDays}
                </p>
              </Panel>
            </div>

            <section>
              <h2 className="mb-2 px-1 text-sm font-semibold text-ink-600">Con đã thực hành</h2>
              <div className="flex flex-col gap-2">
                {report.byVirtue.map((v) => (
                  <Panel key={v.label} className="flex items-center gap-3 p-4">
                    <span className="text-xl" aria-hidden>
                      {v.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink-900">{v.label}</p>
                      <p className="text-xs text-ink-400">
                        {v.completed > 0 && `${v.completed} lần hoàn thành`}
                        {v.completed > 0 && v.tried > 0 && ' · '}
                        {v.tried > 0 && `${v.tried} lần cố gắng`}
                      </p>
                    </div>
                    <span className="shrink-0 text-lg font-semibold tabular-nums text-leaf-600">
                      {v.total}
                    </span>
                  </Panel>
                ))}
              </div>
            </section>

            {report.topBehaviors.length > 0 && (
              <section>
                <h2 className="mb-2 px-1 text-sm font-semibold text-ink-600">
                  Được ghi nhận nhiều nhất
                </h2>
                <Panel className="divide-y divide-ink-100 p-0">
                  {report.topBehaviors.map((b) => (
                    <div
                      key={b.itemId}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <span className="truncate text-ink-700">{b.title}</span>
                      <span className="ml-3 shrink-0 font-medium tabular-nums text-ink-400">
                        ×{b.count}
                      </span>
                    </div>
                  ))}
                </Panel>
              </section>
            )}
          </>
        )}

        {report.reflection && (
          <Panel className="flex flex-col gap-1.5 border-calm-200 bg-calm-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-calm-600">
              Một nhịp cho bố mẹ
            </p>
            <p className="text-base leading-relaxed text-ink-800">{report.reflection}</p>
          </Panel>
        )}

        {report.tip && (
          <Panel className="flex items-start gap-3">
            <span className="mt-0.5 text-lg" aria-hidden>
              💡
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Gợi ý nhỏ</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">{report.tip}</p>
            </div>
          </Panel>
        )}

        <p className="px-1 text-center text-xs text-ink-400">
          Đây là bản tóm tắt mô tả, không phải điểm số. Mỗi tuần là một bước con — và bố mẹ — lớn lên.
        </p>
      </div>
    </div>
  );
}

function formatRange(from: string, to: string): string {
  return `${shortDate(from)} – ${shortDate(to)}`;
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}
