import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Parental gate (MVP prototype).
 *
 * A felt boundary between the child's world and the parent's workspace — not a
 * tab switch. A simple PIN held in memory for this session; production must
 * revisit with auth-backed verification (architecture.md). It is a soft gate a
 * young child cannot easily pass, never a hard security boundary here.
 */

const DEMO_PIN = '1234';
const LEN = DEMO_PIN.length;

interface ParentalGateProps {
  unlocked: boolean;
  onUnlock: () => void;
  children: ReactNode;
}

export function ParentalGate({ unlocked, onUnlock, children }: ParentalGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length < LEN) return;
    if (pin === DEMO_PIN) {
      setPin('');
      setError(false);
      onUnlock();
    } else {
      setError(true);
      const t = setTimeout(() => {
        setPin('');
        setError(false);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [pin, onUnlock]);

  if (unlocked) return <>{children}</>;

  const press = (d: string) => setPin((p) => (p.length < LEN ? p + d : p));
  const back = () => setPin((p) => p.slice(0, -1));

  return (
    <div className="parent-scope grid min-h-[100dvh] place-items-center px-6">
      <div className="flex w-full max-w-xs flex-col items-center text-center">
        <div className="grid size-16 place-items-center rounded-full bg-calm-100 text-3xl shadow-[var(--shadow-panel)]">
          🔒
        </div>
        <h1 className="mt-4 text-xl font-semibold text-ink-900">Khu vực của bố mẹ</h1>
        <p className="mt-1 text-sm text-ink-500">Nhập mã PIN để mở chế độ phụ huynh.</p>

        <div
          className={cn('mt-7 flex gap-3', error && 'motion-safe:animate-[grow-pulse_0.3s]')}
          aria-live="polite"
          aria-label={error ? 'Mã chưa đúng' : `Đã nhập ${pin.length} trên ${LEN} chữ số`}
        >
          {Array.from({ length: LEN }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'size-3.5 rounded-full transition-colors duration-150',
                error ? 'bg-danger/70' : i < pin.length ? 'bg-calm-500' : 'bg-ink-200',
              )}
            />
          ))}
        </div>

        <div className="mt-7 grid w-full grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <Key key={d} onClick={() => press(d)}>
              {d}
            </Key>
          ))}
          <span aria-hidden />
          <Key onClick={() => press('0')}>0</Key>
          <Key onClick={back} aria-label="Xóa" variant="muted">
            ⌫
          </Key>
        </div>

        <p className="mt-6 text-xs text-ink-400">Demo PIN: {DEMO_PIN}</p>
      </div>
    </div>
  );
}

function Key({
  children,
  onClick,
  variant = 'solid',
  ...rest
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'solid' | 'muted';
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-14 items-center justify-center rounded-2xl text-xl font-semibold',
        'transition-[background,transform] duration-100 active:translate-y-px focus-visible:outline-none',
        variant === 'solid'
          ? 'parent-panel text-ink-800 hover:bg-ink-100'
          : 'text-ink-400 hover:bg-ink-100',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
