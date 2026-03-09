import { Task } from "../types/Tasks";

export const getTaskIcon = (taskTitle: string): string => {
  const title = taskTitle.toLowerCase();
  if (title.includes('laundry') || title.includes('cloth')) return '🧺';
  if (title.includes('vacuum') || title.includes('clean')) return '🧹';
  if (title.includes('trash') || title.includes('garbage')) return '🗑';
  if (title.includes('dish') || title.includes('kitchen')) return '🍽';
  if (title.includes('bed') || title.includes('sheet')) return '🛏';
  if (title.includes('bathroom') || title.includes('toilet')) return '🚽';
  if (title.includes('dust') || title.includes('sweep')) return '🧹';
  if (title.includes('garden') || title.includes('yard')) return '🌿';
  if (title.includes('car') || title.includes('vehicle')) return '🚗';
  if (title.includes('pet') || title.includes('animal')) return '🐾';
  return '📋'; // Default clipboard icon
};

export const formatDateDisplay = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const formatCompletionDate = (completionDate: string) => {
  // Completion records use "YYYY-MM-DD" format, so we can reuse the same formatter
  return formatDateDisplay(completionDate);
};

export const isSameDay = (a: Date, b: Date) => {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
};

export const getStartedLabel = (task: Task) => {
  if (task.type === "personal") {
    return "Personal goal";
  }

  if (task.completions.length > 0) {
    const lastCompletion = task.completions[task.completions.length - 1];
    return `${formatCompletionDate(lastCompletion.date)} at ${task.time}`;
  }
  return `${formatDateDisplay(task.startDate!)} at ${task.time}`;
};

export const formatDueDate = (task: Task, dueDate: Date) => {
  // Note: if you need custom due-date formatting in the future, you can extend this.
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  if (isSameDay(dueDateOnly, today)) {
    return `Today at ${task.time}`;
  } else if (isSameDay(dueDateOnly, tomorrow)) {
    return `Tomorrow at ${task.time}`;
  }

  const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 7) {
    return `In ${daysUntil} days at ${task.time}`;
  }

  return `${formatDateDisplay(dueDate.toISOString().split('T')[0])} at ${task.time}`;
};
