import type { AgeBand } from './types';

/**
 * Age & age-band logic.
 *
 * Age is NEVER stored — always derived from birth date at runtime (rules.md,
 * product-spec §5). The derived band drives checklist suggestions and AI tone.
 */

/** Whole years old on `on`, given an ISO birth date (YYYY-MM-DD). */
export function ageInYears(birthDate: string, on: Date = new Date()): number {
  const birth = parseIsoDate(birthDate);
  let age = on.getFullYear() - birth.getFullYear();
  const monthDiff = on.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && on.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Age in whole months — useful for the youngest children. */
export function ageInMonths(birthDate: string, on: Date = new Date()): number {
  const birth = parseIsoDate(birthDate);
  let months = (on.getFullYear() - birth.getFullYear()) * 12;
  months += on.getMonth() - birth.getMonth();
  if (on.getDate() < birth.getDate()) {
    months -= 1;
  }
  return months;
}

/**
 * Map an age in years to a band. The product targets 4–10. Ages below 4 clamp
 * to the youngest band and above 10 to the oldest, so the UI always has a band
 * to work with rather than a null hole.
 */
export function ageBandForAge(age: number): AgeBand {
  if (age <= 5) return '4-5';
  if (age <= 7) return '6-7';
  return '8-10';
}

export function ageBandForBirthDate(birthDate: string, on: Date = new Date()): AgeBand {
  return ageBandForAge(ageInYears(birthDate, on));
}

/** True when the child crosses into a new band within `withinDays`. */
export function isApproachingBandTransition(
  birthDate: string,
  on: Date = new Date(),
  withinDays = 30,
): boolean {
  const currentBand = ageBandForBirthDate(birthDate, on);
  const future = new Date(on);
  future.setDate(future.getDate() + withinDays);
  return ageBandForBirthDate(birthDate, future) !== currentBand;
}

/** True when `on` is the child's birthday (month + day match). */
export function isBirthday(birthDate: string, on: Date = new Date()): boolean {
  const birth = parseIsoDate(birthDate);
  return birth.getMonth() === on.getMonth() && birth.getDate() === on.getDate();
}

/** Parse an ISO date as a LOCAL date to avoid timezone off-by-one shifts. */
function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}
