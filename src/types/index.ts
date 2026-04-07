export type UserRole = 'admin' | 'judge';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Candidate {
  id: string;
  number: number;
  name: string;
  country_name?: string;
  image_url?: string;
  photo_url?: string;
  is_top14?: boolean;
  is_top5?: boolean;
  created_at?: string;
}

export type StageType = 'main' | 'top14' | 'top5';

export interface Category {
  id: string;
  category_key: string;
  name: string;
  category_name?: string;
  stage_type: StageType;
  is_active: boolean;
  is_locked: boolean;
  created_at: string;
  criteria?: Criterion[];
}

export interface Criterion {
  id: string;
  category_id: string;
  name: string;
  max_score: number;
  sort_order: number;
  created_at?: string;
}

export interface Score {
  id: string;
  judge_id: string;
  candidate_id: string;
  category_id: string;
  criterion_id: string;
  score_value: number;
  created_at: string;
  updated_at: string;
}

export interface CategorySubmission {
  id: string;
  judge_id: string;
  category_id: string;
  is_submitted: boolean;
  submitted_at: string | null;
}

export interface CategoryWithCriteria extends Category {
  criteria: Criterion[];
}

export interface CandidateScore {
  candidate: Candidate;
  scores: Record<string, number>; // criterion_id -> score_value
  total: number;
}

export interface CriterionWithScore {
  criterion_id: string;
  name: string;
  max_score: number;
  selected_score: number;
}
