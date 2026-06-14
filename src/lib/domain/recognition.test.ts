import { describe, it, expect } from 'vitest';
import { selectRecognition } from './recognition';
import type { RecognitionPhrase } from './types';

const phrases: RecognitionPhrase[] = [
  { id: 'a', ageBand: null, category: null, outcome: 'completed', text: 'A', isActive: true },
  { id: 'b', ageBand: '6-7', category: 'eq', outcome: 'completed', text: 'B', isActive: true },
  { id: 'c', ageBand: null, category: null, outcome: 'tried', text: 'C', isActive: true },
  { id: 'd', ageBand: null, category: null, outcome: 'completed', text: 'D', isActive: false },
];

describe('selectRecognition', () => {
  it('returns null for not_yet — never recognizes a non-attempt', () => {
    expect(
      selectRecognition(phrases, { ageBand: '6-7', outcome: 'not_yet' }),
    ).toBeNull();
  });

  it('matches outcome, age band, and category', () => {
    const result = selectRecognition(
      phrases,
      { ageBand: '6-7', category: 'eq', outcome: 'completed' },
      () => 1, // force the second eligible phrase
    );
    expect(result?.id).toBe('b');
  });

  it('ignores inactive phrases', () => {
    const onlyInactive: RecognitionPhrase[] = [phrases[3]];
    expect(
      selectRecognition(onlyInactive, { ageBand: '4-5', outcome: 'completed' }),
    ).toBeNull();
  });

  it('avoids repeating the last-shown line when an alternative exists', () => {
    const completedBroad: RecognitionPhrase[] = [
      phrases[0], // a
      { id: 'e', ageBand: null, category: null, outcome: 'completed', text: 'E', isActive: true },
    ];
    const result = selectRecognition(
      completedBroad,
      { ageBand: '4-5', outcome: 'completed', lastShownId: 'a' },
      () => 0, // pick first of the filtered (fresh) pool
    );
    expect(result?.id).toBe('e');
  });

  it('falls back to the only line even if it was last shown', () => {
    const result = selectRecognition(
      [phrases[0]],
      { ageBand: '4-5', outcome: 'completed', lastShownId: 'a' },
      () => 0,
    );
    expect(result?.id).toBe('a');
  });
});
