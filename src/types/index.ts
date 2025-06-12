import { User } from '@supabase/supabase-js';

export interface Child {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  avatar_url?: string;
  custom_color?: string;
  points: number;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  label: string;
  points_reward: number;
  is_daily: boolean;
  created_at: string;
}

export interface Rule {
  id: string;
  user_id: string;
  label: string;
  points_penalty: number;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  label: string;
  cost: number;
  created_at: string;
}

export interface ChildTask {
  id: string;
  child_id: string;
  task_id: string;
  is_completed: boolean;
  completed_at?: string;
  due_date: string;
  created_at: string;
}

export interface ChildRuleViolation {
  id: string;
  child_id: string;
  rule_id: string;
  violated_at: string;
  created_at: string;
}

export interface ChildRewardClaimed {
  id: string;
  child_id: string;
  reward_id: string;
  claimed_at: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}
