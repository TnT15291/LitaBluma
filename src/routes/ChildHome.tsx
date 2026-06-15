import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useStore } from '@/lib/mock/store';
import { GardenScene } from '@/features/garden/GardenScene';
import { GardenCard } from '@/components/shared/Card';
import { canRedeem } from '@/lib/domain/points';
import { avatarEmoji } from '@/lib/mock/content';

/**
 * Child mode. Immersive, low-text, garden-first. No raw points as the primary
 * visual, no negative feed, no settings. Only positive moments appear here.
 */
export function ChildHome() {
  const { state, garden } = useStore();
  const { child } = state;
  if (!child) return null; // routing guards ensure a child exists here

  const today = new Date().toISOString().slice(0, 10);
  const goodMomentsToday = state.logs.filter((l) => l.logDate === today && l.outcome !== 'not_yet');
  const activeRewards = state.rewards.filter((r) => r.isActive);

  return (
    <div className="child-scope px-5 pb-12 pt-5">
      <div className="mx-auto w-full max-w-md lg:max-w-4xl">
        <header className="flex items-center justify-between">
          <span
            className="grid size-12 place-items-center rounded-full bg-white/70 text-2xl shadow-[var(--shadow-float)]"
            aria-hidden
          >
            {avatarEmoji(child.avatarKey)}
          </span>
          <Link
            to="/parent"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/70 px-4 text-sm font-semibold text-leaf-700 shadow-[var(--shadow-float)] transition-transform hover:-translate-y-0.5"
          >
            Bố mẹ <span aria-hidden>🔒</span>
          </Link>
        </header>

        <div className="mt-7 flex flex-col gap-7 lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <GardenScene garden={garden} childName={child.displayName} />

          <div className="flex flex-col gap-7">
            {goodMomentsToday.length > 0 && (
              <GardenCard>
                <h2 className="font-display text-lg font-bold text-leaf-800">
                  Khoảnh khắc đẹp hôm nay
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {goodMomentsToday.map((log, i) => {
                    const item = state.checklist.find((c) => c.id === log.checklistItemId);
                    return (
                      <li
                        key={log.id}
                        className="flex items-center gap-3 rounded-2xl bg-leaf-50/80 px-4 py-3 text-leaf-800"
                        style={stagger(i)}
                      >
                        <span className="text-xl" aria-hidden>
                          {log.outcome === 'completed' ? '🌟' : '💚'}
                        </span>
                        <span className="text-base font-medium">
                          {item?.title ?? 'Một việc tốt'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </GardenCard>
            )}

            <GardenCard>
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-bold text-leaf-800">Vườn quà</h2>
                {activeRewards.length > 0 && (
                  <span className="text-sm font-medium text-leaf-600">
                    {
                      activeRewards.filter((r) => canRedeem(state.ledger, r.pointsCost).affordable)
                        .length
                    }{' '}
                    đã nở 🎁
                  </span>
                )}
              </div>
              {activeRewards.length === 0 ? (
                <div className="mt-3 flex flex-col items-center gap-2 rounded-3xl bg-leaf-50/70 px-5 py-7 text-center">
                  <span className="text-3xl" aria-hidden>
                    🌱
                  </span>
                  <p className="text-sm font-medium leading-snug text-leaf-700">
                    Những món quà đang được gieo trồng. Quay lại sớm nhé!
                  </p>
                </div>
              ) : (
                <ul className="mt-3 grid grid-cols-2 gap-3">
                  {activeRewards.map((reward) => {
                    const unlocked = canRedeem(state.ledger, reward.pointsCost).affordable;
                    return (
                      <li
                        key={reward.id}
                        className={
                          'flex flex-col items-center gap-1 rounded-3xl p-4 text-center transition-transform ' +
                          (unlocked
                            ? 'bg-gradient-to-b from-sun-100 to-sun-200 shadow-[var(--shadow-float)] hover:-translate-y-0.5'
                            : 'bg-white/55 ring-1 ring-leaf-100')
                        }
                      >
                        <div
                          className={'text-3xl ' + (unlocked ? '' : 'opacity-70 grayscale')}
                          aria-hidden
                        >
                          {unlocked ? '🎁' : '🌱'}
                        </div>
                        <p className="text-sm font-semibold leading-snug text-leaf-800">
                          {reward.title}
                        </p>
                        <p className="text-xs font-medium text-leaf-600">
                          {unlocked ? 'Đã đủ hạt để mở khóa!' : 'Đang lớn dần…'}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </GardenCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Gentle staggered entrance for the moments list. */
function stagger(i: number): CSSProperties {
  return {
    animation: 'rise-in 0.5s var(--ease-out-expo) both',
    animationDelay: `${i * 70}ms`,
  };
}
