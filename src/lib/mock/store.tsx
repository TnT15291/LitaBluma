import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type {
  BehaviorLog,
  BehaviorOutcome,
  ChecklistItem,
  ChildProfile,
  ConsentRecord,
  ParentPausePrompt,
  PointLedgerEntry,
  RecognitionPhrase,
  Reward,
  RewardRedemption,
  RewardType,
} from '@/lib/domain/types';
import { canRedeem, outcomeEarnsPoints, pointBalance, pointsForOutcome } from '@/lib/domain/points';
import { gardenViewFromLogs, type GardenView } from '@/lib/domain/garden';
import { ageBandForBirthDate } from '@/lib/domain/ageBand';
import { selectRecognition } from '@/lib/domain/recognition';
import { selectParentPause } from '@/lib/domain/templates';
import { PARENT_PAUSE_PROMPTS, RECOGNITION_PHRASES } from './content';

/**
 * In-memory mock store for MVP Core, persisted to localStorage so the loop
 * survives reloads. Single place state mutates; it enforces the ledger rules so
 * no caller can mutate a point total directly.
 *
 * First run is empty (no consent, no child) → the app routes to onboarding.
 * Recognition lines and parent micro-pause prompts are static app content
 * imported directly, not persisted.
 */

const FAMILY_ID = 'fam_local';
const CAREGIVER_ID = 'cg_parent';
const CONSENT_VERSION = '1.0';

interface StoreState {
  consent: ConsentRecord | null;
  child: ChildProfile | null;
  checklist: ChecklistItem[];
  logs: BehaviorLog[];
  ledger: PointLedgerEntry[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  lastRecognition: Record<string, string>;
  lastParentPauseId: string | null;
}

const STORAGE_KEY = 'litabluma.mock.v2';

function initialState(): StoreState {
  return {
    consent: null,
    child: null,
    checklist: [],
    logs: [],
    ledger: [],
    rewards: [],
    redemptions: [],
    lastRecognition: {},
    lastParentPauseId: null,
  };
}

function loadState(): StoreState {
  if (typeof localStorage === 'undefined') return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return { ...initialState(), ...(JSON.parse(raw) as Partial<StoreState>) } as StoreState;
  } catch {
    return initialState();
  }
}

function persist(state: StoreState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / serialization errors in the prototype
  }
}

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const id = () => crypto.randomUUID();

export interface OnboardingPayload {
  acceptedAt: string;
  child: { displayName: string; birthDate: string; avatarKey: string };
  checklist: { templateId?: string | null; title: string; pointsValue: number; category: string }[];
  rewards: { title: string; rewardType: RewardType; pointsCost: number }[];
}

export interface LogResult {
  log: BehaviorLog;
  recognition: RecognitionPhrase | null;
  parentPause: ParentPausePrompt | null;
}

interface StoreApi {
  state: StoreState;
  onboarded: boolean;
  balance: number;
  garden: GardenView;
  completeOnboarding: (payload: OnboardingPayload) => void;
  logBehavior: (itemId: string, outcome: BehaviorOutcome, note?: string) => LogResult | null;
  redeemReward: (rewardId: string) => boolean;
  /** Parent-defined reward. Returns false if there is no child yet. */
  addReward: (input: { title: string; rewardType: RewardType; pointsCost: number }) => boolean;
  removeReward: (rewardId: string) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(loadState);

  const update = useCallback((next: StoreState) => {
    persist(next);
    setState(next);
  }, []);

  const completeOnboarding = useCallback(
    (payload: OnboardingPayload) => {
      const childId = id();
      const child: ChildProfile = {
        id: childId,
        familyId: FAMILY_ID,
        displayName: payload.child.displayName.trim(),
        birthDate: payload.child.birthDate,
        avatarKey: payload.child.avatarKey,
        createdAt: now(),
        deletedAt: null,
      };
      const checklist: ChecklistItem[] = payload.checklist.map((c) => ({
        id: id(),
        childId,
        templateId: c.templateId ?? null,
        title: c.title.trim(),
        pointsValue: c.pointsValue,
        status: 'active',
        habitStage: 'new',
        category: c.category,
        createdBy: CAREGIVER_ID,
        createdAt: now(),
      }));
      const rewards: Reward[] = payload.rewards.map((r) => ({
        id: id(),
        childId,
        title: r.title.trim(),
        rewardType: r.rewardType,
        pointsCost: r.pointsCost,
        isActive: true,
        createdAt: now(),
      }));

      update({
        ...initialState(),
        consent: { version: CONSENT_VERSION, acceptedAt: payload.acceptedAt },
        child,
        checklist,
        rewards,
      });
    },
    [update],
  );

  const logBehavior = useCallback(
    (itemId: string, outcome: BehaviorOutcome, note?: string): LogResult | null => {
      if (!state.child) return null;
      const item = state.checklist.find((c) => c.id === itemId);
      if (!item) return null;

      const log: BehaviorLog = {
        id: id(),
        childId: state.child.id,
        checklistItemId: itemId,
        logDate: today(),
        outcome,
        note: note ?? null,
        createdBy: CAREGIVER_ID,
        createdAt: now(),
      };

      const next: StoreState = { ...state, logs: [...state.logs, log] };

      // Ledger: only positive outcomes append, never not_yet.
      if (outcomeEarnsPoints(outcome, item.pointsValue)) {
        next.ledger = [
          ...state.ledger,
          {
            id: id(),
            childId: state.child.id,
            sourceType: 'behavior',
            sourceId: log.id,
            pointsDelta: pointsForOutcome(outcome, item.pointsValue),
            reason: item.title,
            createdAt: now(),
          },
        ];
      }

      // Recognition (child-positive) for completed/tried; parent micro-pause for not_yet.
      let recognition: RecognitionPhrase | null = null;
      let parentPause: ParentPausePrompt | null = null;

      if (outcome === 'not_yet') {
        parentPause = selectParentPause(PARENT_PAUSE_PROMPTS, state.lastParentPauseId);
        if (parentPause) next.lastParentPauseId = parentPause.id;
      } else {
        recognition = selectRecognition(RECOGNITION_PHRASES, {
          ageBand: ageBandForBirthDate(state.child.birthDate),
          category: item.category,
          outcome,
          lastShownId: state.lastRecognition[itemId] ?? null,
        });
        if (recognition) {
          next.lastRecognition = { ...state.lastRecognition, [itemId]: recognition.id };
        }
      }

      update(next);
      return { log, recognition, parentPause };
    },
    [state, update],
  );

  const redeemReward = useCallback(
    (rewardId: string): boolean => {
      if (!state.child) return false;
      const reward = state.rewards.find((r) => r.id === rewardId);
      if (!reward) return false;

      if (!canRedeem(state.ledger, reward.pointsCost).affordable) return false;

      const redemption: RewardRedemption = {
        id: id(),
        childId: state.child.id,
        rewardId,
        pointsSpent: reward.pointsCost,
        status: 'fulfilled',
        redeemedAt: now(),
      };
      update({
        ...state,
        redemptions: [...state.redemptions, redemption],
        ledger: [
          ...state.ledger,
          {
            id: id(),
            childId: state.child.id,
            sourceType: 'redemption',
            sourceId: redemption.id,
            pointsDelta: -reward.pointsCost,
            reason: `Đổi: ${reward.title}`,
            createdAt: now(),
          },
        ],
      });
      return true;
    },
    [state, update],
  );

  const addReward = useCallback(
    (input: { title: string; rewardType: RewardType; pointsCost: number }): boolean => {
      if (!state.child) return false;
      const title = input.title.trim();
      if (!title) return false;
      const reward: Reward = {
        id: id(),
        childId: state.child.id,
        title,
        rewardType: input.rewardType,
        pointsCost: Math.max(1, Math.round(input.pointsCost)),
        isActive: true,
        createdAt: now(),
      };
      update({ ...state, rewards: [...state.rewards, reward] });
      return true;
    },
    [state, update],
  );

  const removeReward = useCallback(
    (rewardId: string) => {
      // Hard-remove the reward. Past redemptions/ledger keep their own text,
      // so history is not corrupted by deleting a reward definition.
      update({ ...state, rewards: state.rewards.filter((r) => r.id !== rewardId) });
    },
    [state, update],
  );

  const reset = useCallback(() => update(initialState()), [update]);

  const api = useMemo<StoreApi>(
    () => ({
      state,
      onboarded: state.consent !== null && state.child !== null,
      balance: pointBalance(state.ledger),
      garden: gardenViewFromLogs(state.logs),
      completeOnboarding,
      logBehavior,
      redeemReward,
      addReward,
      removeReward,
      reset,
    }),
    [state, completeOnboarding, logBehavior, redeemReward, addReward, removeReward, reset],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
