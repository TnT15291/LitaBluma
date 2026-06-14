import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/mock/store';
import { Panel } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { cn } from '@/lib/cn';
import { ageBandForBirthDate } from '@/lib/domain/ageBand';
import { templatesForBand } from '@/lib/domain/templates';
import {
  BEHAVIOR_TEMPLATES,
  STARTER_REWARD_SUGGESTIONS,
  SYSTEM_AVATARS,
} from '@/lib/mock/content';
import type { AgeBand } from '@/lib/domain/types';

type Step = 'consent' | 'profile' | 'checklist';
const STEPS: Step[] = ['consent', 'profile', 'checklist'];

/**
 * First-run flow. Consent BEFORE any child profile exists (privacy rule), then
 * a minimal profile (name, birth date, system avatar — no real photo), then a
 * starter checklist + suggested rewards. Calm, parent-facing throughout.
 */
export function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useStore();

  const [step, setStep] = useState<Step>('consent');
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatarKey, setAvatarKey] = useState(SYSTEM_AVATARS[0].key);

  const band: AgeBand | null = birthDate ? ageBandForBirthDate(birthDate) : null;

  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, boolean>>({});
  const [customTitles, setCustomTitles] = useState<string[]>([]);
  const [customDraft, setCustomDraft] = useState('');
  const [selectedRewards, setSelectedRewards] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
  });

  const bandTemplates = useMemo(
    () => (band ? templatesForBand(BEHAVIOR_TEMPLATES, band) : []),
    [band],
  );

  // Default the first five band templates on, once a band is known.
  const templateState = (id: string, indexDefaultOn: boolean) =>
    selectedTemplates[id] ?? indexDefaultOn;

  const today = new Date().toISOString().slice(0, 10);
  const stepIndex = STEPS.indexOf(step);

  const chosenCount =
    bandTemplates.filter((t, i) => templateState(t.id, i < 5)).length + customTitles.length;

  const finish = () => {
    if (!acceptedAt || !band) return;
    const checklist = [
      ...bandTemplates
        .filter((t, i) => templateState(t.id, i < 5))
        .map((t) => ({
          templateId: t.id,
          title: t.title,
          pointsValue: t.defaultPoints,
          category: t.category,
        })),
      ...customTitles.map((title) => ({
        templateId: null,
        title,
        pointsValue: 1,
        category: 'custom',
      })),
    ];
    const rewards = STARTER_REWARD_SUGGESTIONS.filter((_, i) => selectedRewards[i]);
    completeOnboarding({
      acceptedAt,
      child: { displayName: name, birthDate, avatarKey },
      checklist,
      rewards,
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="parent-scope px-5 pb-16 pt-8">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <Stepper current={stepIndex} />

        {step === 'consent' && (
          <ConsentStep
            onAccept={() => {
              setAcceptedAt(new Date().toISOString());
              setStep('profile');
            }}
          />
        )}

        {step === 'profile' && (
          <section className="flex flex-col gap-5">
            <Heading title="Tạo hồ sơ cho con" subtitle="Chỉ những thông tin tối thiểu, đủ để đồng hành." />

            <Panel className="flex flex-col gap-4">
              <Field label="Tên gọi của con">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={24}
                  placeholder="Ví dụ: Bơ"
                  className="w-full rounded-xl border border-ink-200 px-4 py-3 outline-none focus:border-calm-500"
                />
              </Field>

              <Field label="Ngày sinh" hint="Dùng để tính dải tuổi — không lưu tuổi cố định.">
                <input
                  type="date"
                  value={birthDate}
                  max={today}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 px-4 py-3 outline-none focus:border-calm-500"
                />
                {band && (
                  <p className="mt-2 text-sm text-calm-700">Dải tuổi hiện tại: {band}</p>
                )}
              </Field>

              <Field label="Chọn hình đại diện" hint="Chỉ avatar hệ thống — không dùng ảnh thật.">
                <div className="grid grid-cols-4 gap-2">
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
              </Field>
            </Panel>

            <div className="flex gap-3">
              <Button variant="soft" onClick={() => setStep('consent')}>
                Quay lại
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={name.trim().length === 0 || !band}
                onClick={() => setStep('checklist')}
              >
                Tiếp tục
              </Button>
            </div>
          </section>
        )}

        {step === 'checklist' && (
          <section className="flex flex-col gap-5">
            <Heading
              title="Chọn checklist đầu tiên"
              subtitle="Việc tốt sẽ cộng điểm; việc chưa làm chỉ được ghi nhận để theo dõi."
            />

            <Panel className="flex flex-col gap-1 p-2">
              {bandTemplates.map((t, i) => {
                const on = templateState(t.id, i < 5);
                return (
                  <ToggleRow
                    key={t.id}
                    on={on}
                    onToggle={() => setSelectedTemplates((s) => ({ ...s, [t.id]: !on }))}
                    title={t.title}
                    meta={`${t.defaultPoints} điểm`}
                  />
                );
              })}
            </Panel>

            {customTitles.length > 0 && (
              <Panel className="flex flex-col gap-1 p-2">
                {customTitles.map((title) => (
                  <ToggleRow
                    key={title}
                    on
                    onToggle={() => setCustomTitles((c) => c.filter((x) => x !== title))}
                    title={title}
                    meta="1 điểm · tự thêm"
                  />
                ))}
              </Panel>
            )}

            <div className="flex gap-2">
              <input
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustom();
                }}
                maxLength={40}
                placeholder="Thêm hành vi của riêng con…"
                className="min-w-0 flex-1 rounded-xl border border-ink-200 px-4 py-2.5 outline-none focus:border-calm-500"
              />
              <Button variant="soft" onClick={addCustom} disabled={!customDraft.trim()}>
                Thêm
              </Button>
            </div>

            <div>
              <h3 className="mb-2 px-1 text-sm font-semibold text-ink-600">Gợi ý phần thưởng</h3>
              <Panel className="flex flex-col gap-1 p-2">
                {STARTER_REWARD_SUGGESTIONS.map((r, i) => (
                  <ToggleRow
                    key={r.title}
                    on={!!selectedRewards[i]}
                    onToggle={() => setSelectedRewards((s) => ({ ...s, [i]: !s[i] }))}
                    title={r.title}
                    meta={`${r.pointsCost} điểm`}
                  />
                ))}
              </Panel>
            </div>

            <div className="flex gap-3">
              <Button variant="soft" onClick={() => setStep('profile')}>
                Quay lại
              </Button>
              <Button variant="primary" fullWidth disabled={chosenCount === 0} onClick={finish}>
                Hoàn tất · vào vườn
              </Button>
            </div>
            {chosenCount === 0 && (
              <p className="-mt-2 text-center text-sm text-ink-500">
                Chọn ít nhất một hành vi để bắt đầu.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );

  function addCustom() {
    const v = customDraft.trim();
    if (!v || customTitles.includes(v)) return;
    setCustomTitles((c) => [...c, v]);
    setCustomDraft('');
  }
}

function ConsentStep({ onAccept }: { onAccept: () => void }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <section className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-leaf-100 text-3xl">
          🌱
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-ink-900">Chào mừng đến LitaBluma</h1>
        <p className="mt-2 text-ink-600">
          Giúp con xây dựng thói quen tốt qua sự ghi nhận của bố mẹ — không phạt, không so sánh.
        </p>
      </div>

      <Panel className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink-800">Cam kết về quyền riêng tư của con</h2>
        <ul className="flex flex-col gap-2 text-sm text-ink-600">
          <Promise>Không dùng ảnh thật — chỉ avatar hệ thống.</Promise>
          <Promise>Không lưu vị trí, địa chỉ, trường học hay số điện thoại.</Promise>
          <Promise>Dữ liệu của con là tối thiểu và không chia sẻ ra ngoài.</Promise>
          <Promise>Bạn có thể xóa hồ sơ và toàn bộ dữ liệu bất cứ lúc nào.</Promise>
        </ul>

        <label className="mt-1 flex items-start gap-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-calm-500)]"
          />
          <span className="min-w-0">
            Tôi là phụ huynh/người giám hộ và đồng ý với cam kết dữ liệu trẻ em ở trên.
          </span>
        </label>
      </Panel>

      <Button variant="primary" size="lg" fullWidth disabled={!agreed} onClick={onAccept}>
        Đồng ý và tiếp tục
      </Button>
    </section>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {STEPS.map((s, i) => (
        <span
          key={s}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            i === current ? 'w-8 bg-calm-500' : i < current ? 'w-4 bg-calm-300' : 'w-4 bg-ink-200',
          )}
        />
      ))}
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
      <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-ink-400">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function ToggleRow({
  on,
  onToggle,
  title,
  meta,
}: {
  on: boolean;
  onToggle: () => void;
  title: string;
  meta: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={cn(
        'flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors',
        on ? 'bg-calm-100' : 'hover:bg-ink-100',
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink-800">{title}</span>
        <span className="text-xs text-ink-400">{meta}</span>
      </span>
      <span
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-full text-sm text-white transition-colors',
          on ? 'bg-calm-500' : 'bg-ink-200 text-transparent',
        )}
        aria-hidden
      >
        ✓
      </span>
    </button>
  );
}

function Promise({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-leaf-500" aria-hidden>
        ✓
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}
