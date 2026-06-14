import { describe, it, expect } from 'vitest';
import { templatesForBand, selectParentPause } from './templates';
import type { BehaviorTemplate, ParentPausePrompt } from './types';

const templates: BehaviorTemplate[] = [
  { id: 'a', ageBand: '4-5', title: 'A', defaultPoints: 1, category: 'routine' },
  { id: 'b', ageBand: '6-7', title: 'B', defaultPoints: 2, category: 'eq' },
  { id: 'c', ageBand: '4-5', title: 'C', defaultPoints: 2, category: 'eq' },
];

describe('templatesForBand', () => {
  it('returns only templates for the given band', () => {
    expect(templatesForBand(templates, '4-5').map((t) => t.id)).toEqual(['a', 'c']);
    expect(templatesForBand(templates, '6-7').map((t) => t.id)).toEqual(['b']);
    expect(templatesForBand(templates, '8-10')).toEqual([]);
  });
});

describe('selectParentPause', () => {
  const prompts: ParentPausePrompt[] = [
    { id: 'p1', text: 'one' },
    { id: 'p2', text: 'two' },
  ];

  it('returns null when there are no prompts', () => {
    expect(selectParentPause([], null)).toBeNull();
  });

  it('avoids repeating the last shown when an alternative exists', () => {
    const result = selectParentPause(prompts, 'p1', () => 0);
    expect(result?.id).toBe('p2');
  });

  it('falls back to the only prompt even if last shown', () => {
    expect(selectParentPause([prompts[0]], 'p1', () => 0)?.id).toBe('p1');
  });
});
