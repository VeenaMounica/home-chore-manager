import { getNextDueDate, getLastDueDate, isTaskOverdue, formatNextDueTime } from "./recurrence";
import { Task } from "../types/Tasks";

describe("recurrence utilities", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should not mark a future biweekly task as overdue when today is not a due day", () => {
    // Current time: 2026-03-08 12:00:00
    jest.setSystemTime(new Date("2026-03-08T12:00:00Z"));

    const task: Task = {
      id: "t1",
      title: "Biweekly chore",
      type: "chore",
      frequency: "biweekly",
      time: "12:00",
      startDate: "2026-03-03",
      isActive: true,
      completions: [],
    };

    const nextDue = getNextDueDate(task);
    expect(nextDue.toISOString().split("T")[0]).toBe("2026-03-17");
    expect(isTaskOverdue(task)).toBe(false);
  });

  it("should skip today if already completed", () => {
    // Current time: 2026-03-08 12:00:00
    jest.setSystemTime(new Date("2026-03-08T12:00:00Z"));

    const task: Task = {
      id: "t4",
      title: "Daily chore",
      type: "chore",
      frequency: "daily",
      time: "08:00",
      startDate: "2026-03-01",
      isActive: true,
      completions: [
        {
          date: "2026-03-08",
          completedAt: "2026-03-08T09:00:00Z",
        },
      ],
    };

    const nextDue = getNextDueDate(task);
    expect(nextDue.toISOString().split("T")[0]).toBe("2026-03-09");
    expect(isTaskOverdue(task)).toBe(false);
  });

  it("should show overdue when the task missed today's due time", () => {
    // Current time: 2026-03-08 10:00:00
    jest.setSystemTime(new Date("2026-03-08T10:00:00Z"));

    const task: Task = {
      id: "t2",
      title: "Daily chore",
      type: "chore",
      frequency: "daily",
      time: "08:00",
      startDate: "2026-03-01",
      isActive: true,
      completions: [],
    };

    const nextDue = getNextDueDate(task);
    expect(nextDue.toISOString().split("T")[0]).toBe("2026-03-09");
    expect(isTaskOverdue(task)).toBe(true);
    expect(formatNextDueTime(task)).toBe("Missed today");
  });

  it("should display due today when the task is scheduled later today", () => {
    // Current time: 2026-03-08 07:00:00
    jest.setSystemTime(new Date("2026-03-08T07:00:00Z"));

    const task: Task = {
      id: "t5",
      title: "Morning chore",
      type: "chore",
      frequency: "daily",
      time: "12:00",
      startDate: "2026-03-01",
      isActive: true,
      completions: [],
    };

    expect(formatNextDueTime(task)).toBe("Due today");
  });

  it("should display next due in days for future tasks", () => {
    // Current time: 2026-03-08 12:00:00
    jest.setSystemTime(new Date("2026-03-08T12:00:00Z"));

    const task: Task = {
      id: "t6",
      title: "Weekly chore",
      type: "chore",
      frequency: "weekly",
      time: "09:00",
      startDate: "2026-03-07",
      isActive: true,
      completions: [],
    };

    expect(formatNextDueTime(task)).toBe("Next due in 6 days");
  });

  it("should mark overdue if today's due time has passed", () => {
    // Current time: 2026-03-08 12:00:00
    jest.setSystemTime(new Date("2026-03-08T12:00:00Z"));

    const task: Task = {
      id: "t3",
      title: "Daily chore",
      type: "chore",
      frequency: "daily",
      time: "08:00",
      startDate: "2026-03-01",
      isActive: true,
      completions: [],
    };

    const nextDue = getNextDueDate(task);
    expect(nextDue.toISOString().split("T")[0]).toBe("2026-03-09");
    expect(isTaskOverdue(task)).toBe(true);
  });
  it("should move next due to tomorrow if the task is completed today", () => {
    // Current time: 2026-03-08 12:00:00
    jest.setSystemTime(new Date("2026-03-08T12:00:00Z"));

    const task: Task = {
      id: "t3",
      title: "Daily chore",
      type: "chore",
      frequency: "daily",
      time: "08:00",
      startDate: "2026-03-01",
      isActive: true,
      completions: [
        {
          date: "2026-03-08",
          completedAt: "2026-03-08T09:00:00Z",
        },
      ],
    };

    const nextDue = getNextDueDate(task);
    expect(nextDue.toISOString().split("T")[0]).toBe("2026-03-09");
    expect(isTaskOverdue(task)).toBe(false);
  });
});
