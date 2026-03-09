import { Task } from "../types/Tasks";

const getTimeParts = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
};

const applyTime = (date: Date, time: string) => {
  const { hour, minute } = getTimeParts(time);
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const toDateKey = (date: Date) => date.toISOString().split('T')[0];

const advanceDue = (date: Date, frequency: string) => {
  const next = new Date(date);
  if (frequency === "daily") next.setDate(next.getDate() + 1);
  if (frequency === "weekly") next.setDate(next.getDate() + 7);
  if (frequency === "biweekly") next.setDate(next.getDate() + 14);
  if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
  return next;
};

export const getNextDueDate = (task: Task): Date => {
  // Personal tasks don't have due dates
  if (task.type === "personal") {
    return new Date(); // Return current date as placeholder
  }

  const now = new Date();
  const start = new Date(task.startDate!);

  let due = applyTime(start, task.time!);

  // Advance through the schedule until we find the next occurrence strictly after now.
  while (due <= now) {
    due = advanceDue(due, task.frequency!);
  }

  return due;
};

export const getLastDueDate = (task: Task): Date => {
  // Personal tasks don't have due dates
  if (task.type === "personal") {
    return new Date(); // Return current date as placeholder
  }

  const now = new Date();
  const start = new Date(task.startDate!);

  let due = applyTime(start, task.time!);
  let lastDue = due;

  // Advance through the schedule until we pass now; keep the last due date <= now.
  while (due <= now) {
    lastDue = due;
    due = advanceDue(due, task.frequency!);
  }

  return lastDue;
};

export const getCurrentDueDate = (task: Task): Date => {
  const now = new Date();
  const nextDue = getNextDueDate(task);
  const lastDue = getLastDueDate(task);

  // If the next due date is today, treat that as the "current" due date (even if it's later today)
  if (toDateKey(nextDue) === toDateKey(now)) return nextDue;

  // Otherwise, the latest past occurrence is the current due date.
  return lastDue;
};

export const isTaskOverdue = (task: Task): boolean => {
  const now = new Date();
  const lastDue = getLastDueDate(task);
  const todayKey = toDateKey(now);
  const lastKey = toDateKey(lastDue);

  // Only show overdue if the most recent scheduled due date is today and its time has passed.
  if (lastKey !== todayKey) return false;
  if (now <= lastDue) return false;

  return !task.completions.some(c => c.date === lastKey);
};

export const getEffectiveDueDate = (task: Task): Date => {
  return isTaskOverdue(task) ? getCurrentDueDate(task) : getNextDueDate(task);
};

export const formatNextDueTime = (task: Task): string => {
  const now = new Date();
  const due = getEffectiveDueDate(task);

  const nowKey = toDateKey(now);
  const dueKey = toDateKey(due);

  if (isTaskOverdue(task)) {
    return "Missed today";
  }

  // If the due date is today (even if later today)
  if (nowKey === dueKey) {
    return "Due today";
  }

  // Days until due (date-only difference)
  const todayAtMidnight = new Date(nowKey);
  const dueAtMidnight = new Date(dueKey);
  const diffDays = Math.round((dueAtMidnight.getTime() - todayAtMidnight.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "Next due tomorrow";
  }

  return `Next due in ${diffDays} days`;
};

export const sortTasksByDueDate = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => {
    return getEffectiveDueDate(a).getTime() - getEffectiveDueDate(b).getTime();
  });
};

export const getTasksDueToday = (tasks: Task[]) => {
  const todayKey = toDateKey(new Date());

  return tasks.filter(task => {
    const nextKey = toDateKey(getNextDueDate(task));
    const lastKey = toDateKey(getLastDueDate(task));

    // If the task is due later today, it should count as due today
    if (nextKey === todayKey) return true;

    // If the task was due earlier today (whether completed or not), it should still count as due today
    if (lastKey === todayKey) return true;

    return false;
  });
};

export const getTasksDueTomorrow = (tasks: Task[]) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0,0,0,0);

  return tasks.filter(task => {
    const due = getNextDueDate(task);
    const dueDay = new Date(due);
    dueDay.setHours(0,0,0,0);
    return dueDay.getTime() === tomorrow.getTime();
  });
};