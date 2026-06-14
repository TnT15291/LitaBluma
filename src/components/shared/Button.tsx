import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'soft' | 'ghost' | 'child';
type Size = 'md' | 'lg';

const BASE =
  'inline-flex select-none items-center justify-center gap-2 rounded-full font-medium ' +
  'transition-[background,transform,box-shadow] duration-150 ease-[var(--ease-out-quart)] ' +
  'focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45 ' +
  'active:translate-y-px';

const VARIANTS: Record<Variant, string> = {
  // Parent: grounded, operational.
  primary: 'bg-calm-500 text-white shadow-[var(--shadow-panel)] hover:bg-calm-600',
  soft: 'bg-ink-100 text-ink-700 hover:bg-ink-200',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-100',
  // Child: big, warm, tactile.
  child:
    'bg-leaf-500 text-white font-semibold shadow-[var(--shadow-float)] ' +
    'hover:bg-leaf-600 hover:-translate-y-0.5 active:translate-y-0',
};

const SIZES: Record<Size, string> = {
  md: 'min-h-11 px-5 py-2.5 text-sm',
  // lg meets the ≥56px child touch-target floor.
  lg: 'min-h-14 px-7 py-3.5 text-lg',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...props}
    />
  );
}
