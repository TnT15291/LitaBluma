/**
 * Hand-written Supabase schema types for LitaBluma MVP Core, matching
 * supabase/migrations/0001_schema.sql. Regenerate with the Supabase CLI once a
 * project is linked:
 *   supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 */

export type AgeBandEnum = '4-5' | '6-7' | '8-10';
export type BehaviorOutcomeEnum = 'completed' | 'tried' | 'not_yet';
export type HabitStageEnum = 'new' | 'building' | 'stable' | 'recognition_only';
export type RewardTypeEnum = 'choice' | 'activity' | 'privilege' | 'object';
export type VirtueEnum =
  | 'independence'
  | 'responsibility'
  | 'emotional_regulation'
  | 'empathy'
  | 'perseverance';
export type LedgerSourceEnum = 'behavior' | 'bonus' | 'redemption';
export type RedemptionStatusEnum = 'pending' | 'fulfilled' | 'cancelled';
export type ChecklistStatusEnum = 'active' | 'archived';
export type PlanTierEnum = 'free' | 'premium';

/** Helper: a table with a precise Row, a permissive Insert, and partial Update. */
interface TableShape<Row> {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
}

export interface FamilyRow {
  id: string;
  plan: PlanTierEnum;
  created_at: string;
}

export interface CaregiverRow {
  id: string;
  family_id: string;
  auth_user_id: string;
  role: string;
  created_at: string;
}

export interface ChildProfileRow {
  id: string;
  family_id: string;
  display_name: string;
  birth_date: string;
  avatar_key: string;
  last_parent_pause_id: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface BehaviorTemplateRow {
  id: string;
  age_band: AgeBandEnum;
  title: string;
  description: string | null;
  default_points: number;
  category: string;
  virtue: VirtueEnum;
  is_active: boolean;
}

export interface RecognitionPhraseRow {
  id: string;
  age_band: AgeBandEnum | null;
  category: string | null;
  outcome: 'completed' | 'tried';
  text: string;
  is_active: boolean;
}

export interface ParentPausePromptRow {
  id: string;
  context: string;
  text: string;
  is_active: boolean;
}

export interface ChecklistItemRow {
  id: string;
  child_id: string;
  template_id: string | null;
  title: string;
  points_value: number;
  status: ChecklistStatusEnum;
  habit_stage: HabitStageEnum;
  category: string | null;
  virtue: VirtueEnum | null;
  last_recognition_phrase_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BehaviorLogRow {
  id: string;
  child_id: string;
  checklist_item_id: string;
  log_date: string;
  outcome: BehaviorOutcomeEnum;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PointLedgerRow {
  id: string;
  child_id: string;
  source_type: LedgerSourceEnum;
  source_id: string | null;
  points_delta: number;
  reason: string;
  created_at: string;
}

export interface RewardRow {
  id: string;
  child_id: string;
  title: string;
  reward_type: RewardTypeEnum;
  points_cost: number;
  is_active: boolean;
  created_at: string;
}

export interface RewardRedemptionRow {
  id: string;
  child_id: string;
  reward_id: string | null;
  points_spent: number;
  status: RedemptionStatusEnum;
  redeemed_at: string;
}

export interface ProposalDismissalRow {
  id: string;
  child_id: string;
  proposal_id: string;
  dismissed_at: string;
}

export interface ConsentRecordRow {
  id: string;
  family_id: string;
  caregiver_id: string | null;
  consent_version: string;
  accepted_at: string;
}

export interface DataDeletionRequestRow {
  id: string;
  family_id: string;
  child_id: string | null;
  requested_by: string | null;
  status: string;
  requested_at: string;
  completed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      families: TableShape<FamilyRow>;
      caregivers: TableShape<CaregiverRow>;
      child_profiles: TableShape<ChildProfileRow>;
      behavior_templates: TableShape<BehaviorTemplateRow>;
      recognition_phrases: TableShape<RecognitionPhraseRow>;
      parent_pause_prompts: TableShape<ParentPausePromptRow>;
      child_checklist_items: TableShape<ChecklistItemRow>;
      behavior_logs: TableShape<BehaviorLogRow>;
      point_ledger: TableShape<PointLedgerRow>;
      rewards: TableShape<RewardRow>;
      reward_redemptions: TableShape<RewardRedemptionRow>;
      proposal_dismissals: TableShape<ProposalDismissalRow>;
      consent_records: TableShape<ConsentRecordRow>;
      data_deletion_requests: TableShape<DataDeletionRequestRow>;
    };
    Views: Record<string, never>;
    Functions: {
      bootstrap_family: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_family_member: {
        Args: { fid: string };
        Returns: boolean;
      };
      owns_child: {
        Args: { cid: string };
        Returns: boolean;
      };
    };
    Enums: {
      age_band: AgeBandEnum;
      behavior_outcome: BehaviorOutcomeEnum;
      habit_stage: HabitStageEnum;
      reward_type: RewardTypeEnum;
      virtue: VirtueEnum;
      ledger_source: LedgerSourceEnum;
      redemption_status: RedemptionStatusEnum;
      checklist_status: ChecklistStatusEnum;
      plan_tier: PlanTierEnum;
    };
    CompositeTypes: Record<string, never>;
  };
}
