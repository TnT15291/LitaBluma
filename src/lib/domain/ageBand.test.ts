import { describe, it, expect } from 'vitest';
import {
  ageInYears,
  ageBandForBirthDate,
  isApproachingBandTransition,
  isBirthday,
} from './ageBand';

describe('ageInYears', () => {
  it('counts whole years', () => {
    expect(ageInYears('2018-06-14', new Date(2026, 5, 14))).toBe(8);
  });

  it('does not count a birthday that has not happened yet this year', () => {
    // Born June 14; on June 13 the child is still 7.
    expect(ageInYears('2018-06-14', new Date(2026, 5, 13))).toBe(7);
  });

  it('counts the birthday itself', () => {
    expect(ageInYears('2018-06-14', new Date(2026, 5, 14))).toBe(8);
  });
});

describe('ageBandForBirthDate', () => {
  it('maps ages to the three bands', () => {
    expect(ageBandForBirthDate('2021-01-01', new Date(2026, 0, 1))).toBe('4-5'); // 5
    expect(ageBandForBirthDate('2019-01-01', new Date(2026, 0, 1))).toBe('6-7'); // 7
    expect(ageBandForBirthDate('2016-01-01', new Date(2026, 0, 1))).toBe('8-10'); // 10
  });

  it('clamps ages outside 4–10 to the nearest band', () => {
    expect(ageBandForBirthDate('2023-01-01', new Date(2026, 0, 1))).toBe('4-5'); // 3
    expect(ageBandForBirthDate('2010-01-01', new Date(2026, 0, 1))).toBe('8-10'); // 16
  });

  it('shifts band exactly on the birthday', () => {
    const dayBefore = new Date(2026, 5, 13);
    const birthday = new Date(2026, 5, 14);
    // Turning 6 on the birthday: 5 (band 4-5) -> 6 (band 6-7).
    expect(ageBandForBirthDate('2020-06-14', dayBefore)).toBe('4-5');
    expect(ageBandForBirthDate('2020-06-14', birthday)).toBe('6-7');
  });
});

describe('isApproachingBandTransition', () => {
  it('flags a child about to cross a band within the window', () => {
    // Turns 6 on June 14; on May 20 they are within 30 days.
    expect(isApproachingBandTransition('2020-06-14', new Date(2026, 4, 20), 30)).toBe(true);
  });

  it('does not flag a child mid-band', () => {
    expect(isApproachingBandTransition('2020-06-14', new Date(2026, 0, 1), 30)).toBe(false);
  });
});

describe('isBirthday', () => {
  it('matches month and day', () => {
    expect(isBirthday('2018-06-14', new Date(2026, 5, 14))).toBe(true);
    expect(isBirthday('2018-06-14', new Date(2026, 5, 15))).toBe(false);
  });
});
