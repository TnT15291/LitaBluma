import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** Parent workspace panel. Calm, bordered, low elevation. */
export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('parent-panel p-5', className)} {...props} />;
}

/** Frosted card for use inside the child garden scene. */
export function GardenCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('garden-card p-5', className)} {...props} />;
}
