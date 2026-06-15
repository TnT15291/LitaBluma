import { describe, it, expect } from 'vitest';
import { situationsForBand, SITUATION_STEPS } from './situations';
import { SITUATIONS } from '@/lib/mock/situations';
import { VIRTUES } from './virtues';
import type { AgeBand, SituationGuide } from './types';

const fixtures: SituationGuide[] = [
  {
    id: 's1',
    title: 'A',
    ageBands: ['4-5', '6-7'],
    emotion: 'x',
    cause: 'y',
    steps: { acknowledge: 'a', calm: 'b', empathize: 'c', resolve: 'd' },
    avoid: 'z',
  },
  {
    id: 's2',
    title: 'B',
    ageBands: ['8-10'],
    emotion: 'x',
    cause: 'y',
    steps: { acknowledge: 'a', calm: 'b', empathize: 'c', resolve: 'd' },
    avoid: 'z',
  },
];

describe('situationsForBand', () => {
  it('returns only situations that include the band', () => {
    expect(situationsForBand(fixtures, '4-5').map((s) => s.id)).toEqual(['s1']);
    expect(situationsForBand(fixtures, '8-10').map((s) => s.id)).toEqual(['s2']);
    expect(situationsForBand(fixtures, '6-7').map((s) => s.id)).toEqual(['s1']);
  });
});

describe('SITUATION_STEPS', () => {
  it('is the fixed 4-step Phan Hồ Điệp order', () => {
    expect(SITUATION_STEPS.map((s) => s.key)).toEqual([
      'acknowledge',
      'calm',
      'empathize',
      'resolve',
    ]);
  });
});

describe('situation library content', () => {
  const bands: AgeBand[] = ['4-5', '6-7', '8-10'];
  const virtueKeys = new Set(VIRTUES.map((v) => v.key));

  it('every situation has at least one valid age band', () => {
    for (const s of SITUATIONS) {
      expect(s.ageBands.length).toBeGreaterThan(0);
      for (const b of s.ageBands) expect(bands).toContain(b);
    }
  });

  it('every child age band has at least one situation to show', () => {
    for (const b of bands) expect(situationsForBand(SITUATIONS, b).length).toBeGreaterThan(0);
  });

  it('every situation carries all four steps and a known virtue (when set)', () => {
    for (const s of SITUATIONS) {
      expect(
        s.steps.acknowledge && s.steps.calm && s.steps.empathize && s.steps.resolve,
      ).toBeTruthy();
      if (s.virtue) expect(virtueKeys.has(s.virtue)).toBe(true);
    }
  });
});
