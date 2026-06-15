import { describe, it, expect } from 'vitest';
import { VIRTUES, groupByVirtue, virtueMeta } from './virtues';
import { BEHAVIOR_TEMPLATES } from '@/lib/mock/content';
import type { Virtue } from './types';

describe('groupByVirtue', () => {
  it('groups items in VIRTUES order and omits empty groups', () => {
    const items = [
      { virtue: 'empathy' as Virtue },
      { virtue: 'independence' as Virtue },
      { virtue: 'empathy' as Virtue },
    ];
    const groups = groupByVirtue(items);
    expect(groups.map((g) => g.virtue)).toEqual(['independence', 'empathy']); // VIRTUES order
    expect(groups[1].items).toHaveLength(2);
  });

  it('collects items without a virtue into a trailing "Khác" group', () => {
    const items = [{ virtue: 'independence' as Virtue }, { virtue: null }, {}];
    const groups = groupByVirtue(items);
    const last = groups[groups.length - 1];
    expect(last.virtue).toBeNull();
    expect(last.meta.label).toBe('Khác');
    expect(last.items).toHaveLength(2);
  });
});

describe('virtue content', () => {
  it('every behavior template carries a known virtue', () => {
    const keys = new Set(VIRTUES.map((v) => v.key));
    for (const tmpl of BEHAVIOR_TEMPLATES) {
      expect(keys.has(tmpl.virtue)).toBe(true);
    }
  });

  it('all five virtues are represented in the template library', () => {
    const used = new Set(BEHAVIOR_TEMPLATES.map((t) => t.virtue));
    for (const v of VIRTUES) expect(used.has(v.key)).toBe(true);
  });

  it('virtueMeta falls back to "Khác" for null', () => {
    expect(virtueMeta(null).label).toBe('Khác');
  });
});
