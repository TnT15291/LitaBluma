import type { BehaviorLog, GardenStage } from './types';

/**
 * Garden progress.
 *
 * Growth is derived deterministically from POSITIVE behavior only, so the
 * garden can always be rebuilt from logs. The child sees the stage and visual
 * growth — never the raw number (product-spec §7, architecture.md).
 *
 * `not_yet` never reduces growth; it simply contributes nothing.
 */

const STAGES: readonly GardenStage[] = ['seed', 'sprout', 'plant', 'flower', 'tree', 'butterflies'];

/** Growth needed to ENTER each stage (index aligned with STAGES). */
const STAGE_THRESHOLDS: readonly number[] = [0, 3, 8, 16, 28, 45];

/** Each positive log contributes; `completed` is worth a little more than `tried`. */
export function growthFromLogs(logs: readonly BehaviorLog[]): number {
  return logs.reduce((score, log) => {
    if (log.outcome === 'completed') return score + 2;
    if (log.outcome === 'tried') return score + 1;
    return score; // not_yet: neutral, no effect
  }, 0);
}

export function stageForGrowth(growthScore: number): GardenStage {
  let stage: GardenStage = STAGES[0];
  for (let i = 0; i < STAGES.length; i++) {
    if (growthScore >= STAGE_THRESHOLDS[i]) {
      stage = STAGES[i];
    }
  }
  return stage;
}

export interface GardenView {
  stage: GardenStage;
  growthScore: number;
  /** 0–1 progress toward the next stage; 1 when fully grown. */
  progressToNext: number;
  nextStage: GardenStage | null;
}

/** Everything child mode needs to render growth, with no raw points exposed. */
export function gardenViewFromLogs(logs: readonly BehaviorLog[]): GardenView {
  const growthScore = growthFromLogs(logs);
  const stage = stageForGrowth(growthScore);
  const index = STAGES.indexOf(stage);
  const isMax = index === STAGES.length - 1;

  if (isMax) {
    return { stage, growthScore, progressToNext: 1, nextStage: null };
  }

  const currentFloor = STAGE_THRESHOLDS[index];
  const nextFloor = STAGE_THRESHOLDS[index + 1];
  const span = nextFloor - currentFloor;
  const progressToNext = span <= 0 ? 1 : (growthScore - currentFloor) / span;

  return {
    stage,
    growthScore,
    progressToNext: Math.min(1, Math.max(0, progressToNext)),
    nextStage: STAGES[index + 1],
  };
}

export { STAGES as GARDEN_STAGES };
