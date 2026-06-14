import type { GardenStage } from '@/lib/domain/types';

/** Child-facing presentation for each garden stage. Visual + low-text. */
export const STAGE_DISPLAY: Record<GardenStage, { emoji: string; label: string }> = {
  seed: { emoji: '🌱', label: 'Hạt mầm' },
  sprout: { emoji: '🌿', label: 'Cây non' },
  plant: { emoji: '🪴', label: 'Cây nhỏ' },
  flower: { emoji: '🌷', label: 'Ra hoa' },
  tree: { emoji: '🌳', label: 'Cây lớn' },
  butterflies: { emoji: '🦋', label: 'Vườn có bướm' },
};
