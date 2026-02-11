
export interface DailyVerse {
  reference: string;
  text: string;
  reflection: string;
  prayer: string;
}

export interface StudyPlanDay {
  day: number;
  title: string;
  scripture: string;
  focus: string;
  actionStep: string;
}

export interface StudyPlan {
  topic: string;
  overview: string;
  days: StudyPlanDay[];
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  link: string;
}

export interface Circle {
  id: string;
  name: string;
  members: number;
  initial: string;
  color: string;
}

export type Tab = 'home' | 'planner' | 'ask' | 'community' | 'resources' | 'admin-login';
