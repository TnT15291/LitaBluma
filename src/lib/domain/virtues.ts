import type { Virtue } from './types';

/**
 * The character virtues, in display order. Each is a recognition *lens* over
 * behaviors — never a graded level. The child-facing garden mapping (a distinct
 * plant per virtue) is post-MVP; here a virtue is parent-side metadata only.
 */
export interface VirtueMeta {
  key: Virtue;
  label: string;
  emoji: string;
}

export const VIRTUES: VirtueMeta[] = [
  { key: 'independence', label: 'Tự lập', emoji: '🪴' },
  { key: 'responsibility', label: 'Trách nhiệm', emoji: '🧺' },
  { key: 'emotional_regulation', label: 'Kiểm soát cảm xúc', emoji: '🌊' },
  { key: 'empathy', label: 'Đồng cảm', emoji: '💛' },
  { key: 'perseverance', label: 'Kiên trì', emoji: '🌳' },
];

/** Fallback label for items without a chosen virtue (e.g. custom behaviors). */
export const OTHER_VIRTUE_META: VirtueMeta = {
  key: 'independence', // unused; key is only meaningful for real virtues
  label: 'Khác',
  emoji: '🌱',
};

const BY_KEY = new Map(VIRTUES.map((v) => [v.key, v] as const));

export function virtueMeta(virtue: Virtue | null | undefined): VirtueMeta {
  return (virtue && BY_KEY.get(virtue)) || OTHER_VIRTUE_META;
}

export interface VirtueGroup<T> {
  virtue: Virtue | null;
  meta: VirtueMeta;
  items: T[];
}

/**
 * Group items by virtue, preserving VIRTUES order; a trailing "Khác" group
 * collects items without a virtue. Empty groups are omitted.
 */
export function groupByVirtue<T extends { virtue?: Virtue | null }>(items: readonly T[]): VirtueGroup<T>[] {
  const groups: VirtueGroup<T>[] = [];
  for (const { key } of VIRTUES) {
    const matching = items.filter((i) => i.virtue === key);
    if (matching.length > 0) groups.push({ virtue: key, meta: virtueMeta(key), items: matching });
  }
  const other = items.filter((i) => i.virtue == null);
  if (other.length > 0) groups.push({ virtue: null, meta: OTHER_VIRTUE_META, items: other });
  return groups;
}
