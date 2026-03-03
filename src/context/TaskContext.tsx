import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, TaskCompletion, Frequency } from "../types/Tasks";

// Simple UUID generator for platforms without crypto
const generateSimpleId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// In-memory storage fallback for platforms without persistent storage
let inMemoryStorage: Task[] = [];

// Simple storage interface
const getStorageData = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      // Try AsyncStorage first
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    console.log('Storage not available, using in-memory fallback');
    // Fallback to in-memory storage
    const data = inMemoryStorage.length > 0 ? JSON.stringify(inMemoryStorage) : null;
    return data;
  }
};

const setStorageData = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      // Try AsyncStorage first
      await AsyncStorage.setItem(key, value);
      // Also try to sync to localStorage for web compatibility
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // localStorage not available, that's ok
      }
    }
  } catch (error) {
    console.log('Storage not available, using in-memory fallback');
    // Fallback to in-memory storage
    inMemoryStorage = JSON.parse(value);
  }
};

const TASKS_STORAGE_KEY = "@mom_chore_tasks";

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
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from storage on app start
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      console.log('Loading tasks on platform:', Platform.OS);
      
      // Use unified storage interface
      const storedTasks = await getStorageData(TASKS_STORAGE_KEY);
      console.log('Raw storage data:', storedTasks);
      
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        console.log('Parsed tasks:', parsedTasks);
        const migratedTasks = parsedTasks.map((task: any) => ({
          ...task,
          startDate: task.startDate || new Date().toISOString().split('T')[0],
          completions: task.completions || []
        }));
        setTasks(migratedTasks);
        console.log('Loaded tasks:', migratedTasks.length);
      } else {
        console.log('No tasks found in storage');
        setTasks([]);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      console.log('Saving tasks on platform:', Platform.OS);
      
      // Use unified storage interface
      await setStorageData(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      console.log('Saved tasks:', updatedTasks.length);
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const addTask = (task: Task) => {
    const taskWithCompletions = { ...task, completions: [] };
    const updatedTasks = [...tasks, taskWithCompletions];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const updateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, isActive: !task.isActive } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const completeTask = (id: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const existingCompletion = task.completions.find(c => c.date === today);
        if (!existingCompletion) {
          return {
            ...task,
            completions: [
              ...task.completions,
              {
                date: today,
                completedAt: now.toISOString()
              }
            ]
          };
        }
      }
      return task;
    });
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const getTaskHistory = (taskId: string): TaskCompletion[] => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.completions : [];
  };

  const getLastWeekData = (): { [taskId: string]: number } => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStr = lastWeek.toISOString().split('T')[0];
    
    const data: { [taskId: string]: number } = {};
    
    tasks.forEach(task => {
      const lastWeekCompletions = task.completions.filter(
        completion => completion.date >= lastWeekStr
      );
      data[task.id] = lastWeekCompletions.length;
    });
    
    return data;
  };

  const syncFromWeb = () => {
    try {
      if (Platform.OS === 'web') {
        console.log('Sync not needed on web platform');
        return;
      }
      
      // Try to get data from localStorage (web storage)
      let webData = null;
      try {
        webData = localStorage.getItem("@mom_chore_tasks");
      } catch (e) {
        console.log('localStorage not available:', e);
        alert('localStorage not available on this device. Cannot sync from web.');
        return;
      }
      
      if (webData) {
        const parsedTasks = JSON.parse(webData);
        console.log('Manual sync: Found web data:', parsedTasks.length, 'tasks');
        
        const migratedTasks = parsedTasks.map((task: any) => ({
          ...task,
          startDate: task.startDate || new Date().toISOString().split('T')[0],
          completions: task.completions || []
        }));
        
        setTasks(migratedTasks);
        saveTasks(migratedTasks);
        
        console.log('Synced', migratedTasks.length, 'tasks from web to mobile');
        alert(`Synced ${migratedTasks.length} tasks from web to mobile`);
      } else {
        console.log('No web data found to sync');
        alert('No web data found to sync. Please create tasks on web first.');
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      alert('Sync failed: ' + (error as Error).message);
    }
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      addTask, 
      updateTask,
      toggleTask, 
      deleteTask, 
      completeTask,
      getTaskHistory,
      getLastWeekData,
      syncFromWeb,
      loading
    }}>
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