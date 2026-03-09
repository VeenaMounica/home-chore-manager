export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

export type TaskType = "chore" | "personal";

export type PersonalGoalType = "immediate" | "normal" | "long-term";

export type TaskCompletion = {
  date: string; // ISO date string
  completedAt: string; // ISO timestamp
};

export type Task = {
  id: string;
  title: string;
  type: TaskType;
  frequency?: Frequency; // Only for chores
  personalGoalType?: PersonalGoalType; // Only for personal tasks
  time?: string; // "HH:MM" format - optional for personal tasks
  startDate?: string; // ISO date string - optional for personal tasks
  dayOfWeek?: number; // 0–6 (for weekly chores)
  dayOfMonth?: number; // 1–31 (for monthly chores)
  isActive: boolean;
  completions: TaskCompletion[];
};