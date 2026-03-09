import { createContext, useContext, ReactNode } from "react";
import { Task, TaskCompletion } from "../types/Tasks";
import { useTaskManager } from "../hooks/useTaskManager";

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  getTaskHistory: (taskId: string) => TaskCompletion[];
  getLastWeekData: () => { [taskId: string]: number };
  syncFromWeb: () => void;
  loading: boolean;
  user: any | null;
  logout: () => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const taskManager = useTaskManager();

  return (
    <TaskContext.Provider value={taskManager}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }
  return context;
}