export interface PlanStep {
  day: number;
  action: string;
  tip: string;
  scripture?: string;
}

export interface CoachingPlan {
  id: string;
  caller_id: string;
  session_id: string;
  category: string | null;
  title: string;
  steps: PlanStep[];
  wisdom_anchor: string | null;
  duration_days: number;
  is_active: boolean;
  created_at: string;
}

export interface CoachingPlanInput {
  title: string;
  category: string;
  wisdom_anchor: string;
  duration_days: number;
  steps: PlanStep[];
}
