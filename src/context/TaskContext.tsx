import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db, onAuthStateChanged } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Task, TaskCompletion, Frequency } from "../types/Tasks";

// Firebase collections
const TASKS_COLLECTION = 'tasks';

// Firebase helper functions
const firebaseTasks = {
  // Get all tasks for a user
  getTasks: async (userId: string) => {
    try {
      console.log('Getting tasks for userId:', userId);
      const dbInstance = db;
      const q = query(collection(dbInstance, TASKS_COLLECTION), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      console.log('Query snapshot size:', querySnapshot.size);
      const tasks: any[] = [];
      querySnapshot.forEach((doc) => {
        console.log('Found task:', { id: doc.id, ...doc.data() });
        tasks.push({ id: doc.id, ...doc.data() });
      });
      console.log('Returning tasks:', tasks.length);
      return tasks;
    } catch (error) {
      console.error('Error getting tasks from Firebase:', error);
      throw error;
    }
  },

  // Add a new task
  addTask: async (userId: string, task: any) => {
    try {
      console.log('Adding task for userId:', userId);
      console.log('Task data:', task);
      const dbInstance = db;
      const taskRef = doc(collection(dbInstance, TASKS_COLLECTION));
      const taskData = {
        ...task,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('Saving task data:', taskData);
      await setDoc(taskRef, taskData);
      const taskId = taskRef.id;
      console.log('Task saved with ID:', taskId);
      return taskId;
    } catch (error) {
      console.error('Error adding task to Firebase:', error);
      throw error;
    }
  },

  // Update a task
  updateTask: async (taskId: string, task: any) => {
    try {
      const dbInstance = db;
      const taskRef = doc(dbInstance, TASKS_COLLECTION, taskId);
      await updateDoc(taskRef, {
        ...task,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating task in Firebase:', error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId: string) => {
    try {
      const dbInstance = db;
      await deleteDoc(doc(dbInstance, TASKS_COLLECTION, taskId));
    } catch (error) {
      console.error('Error deleting task from Firebase:', error);
      throw error;
    }
  },

  // Save all tasks for a user (batch operation)
  saveTasks: async (userId: string, tasks: Task[]) => {
    try {
      const dbInstance = db;
      // First, delete existing tasks for this user
      const q = query(collection(dbInstance, TASKS_COLLECTION), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      // Delete existing tasks
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Add new tasks
      const addPromises = tasks.map(task => firebaseTasks.addTask(userId, task));
      await Promise.all(addPromises);
      
      console.log(`Saved ${tasks.length} tasks to Firebase for user ${userId}`);
    } catch (error) {
      console.error('Error saving tasks to Firebase:', error);
      throw error;
    }
  }
};

// Simple UUID generator for platforms without crypto
const generateSimpleId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// In-memory storage fallback for platforms without persistent storage
let inMemoryStorage: Task[] = [];

// Simple storage interface using Expo SecureStore
const getStorageData = async (key: string): Promise<string | null> => {
  console.log('Getting storage data for key:', key, 'on platform:', Platform.OS);
  
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      // Use Expo SecureStore for mobile
      const result = await SecureStore.getItemAsync(key);
      console.log('SecureStore result:', result);
      return result;
    }
  } catch (error) {
    console.log('SecureStore not available, using in-memory fallback:', error);
    // Fallback to in-memory storage
    const data = inMemoryStorage.length > 0 ? JSON.stringify(inMemoryStorage) : null;
    console.log('In-memory fallback data:', data);
    return data;
  }
};

const setStorageData = async (key: string, value: string): Promise<void> => {
  console.log('Setting storage data for key:', key, 'on platform:', Platform.OS);
  
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      console.log('localStorage set successful');
    } else {
      // Use Expo SecureStore for mobile
      await SecureStore.setItemAsync(key, value);
      console.log('SecureStore set successful');
    }
  } catch (error) {
    console.log('SecureStore not available, using in-memory fallback:', error);
    // Fallback to in-memory storage
    inMemoryStorage = JSON.parse(value);
    console.log('Saved to in-memory storage');
  }
};

const TASKS_STORAGE_KEY = "mom_chore_tasks";

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<any | null>(null);

  // Initialize user and load tasks
  useEffect(() => {
    // Just initialize Firebase auth listener
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    // Add a small delay to ensure Firebase is fully initialized
    const setupAuthListener = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
          console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
          console.log('User UID:', user?.uid);
          setUser(user);
          if (user) {
            const userUid = user.uid;
            setUserId(userUid);
            console.log('Setting userId and loading tasks for:', userUid);
            await loadTasksForUser(userUid);
          } else {
            setUserId('');
            setTasks([]);
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        // Fallback: just set loading to false after a delay
        setTimeout(() => setLoading(false), 1000);
      }
    };

    setupAuthListener();
  }, []);

  const loadTasksForUser = async (uid: string) => {
    try {
      console.log('Loading tasks from Firebase...');
      const cloudTasks = await firebaseTasks.getTasks(uid);
      console.log('Firebase tasks loaded:', cloudTasks.length);
      setTasks(cloudTasks);
    } catch (firebaseError) {
      console.log('Firebase failed, loading from local storage:', firebaseError);
      await loadTasksFromLocal();
    } finally {
      setLoading(false);
    }
  };

  const initializeUser = async () => {
    try {
      console.log('Initializing user on platform:', Platform.OS);
      
      // Handle user authentication for all platforms
      let storedUserId: string;
      
      if (Platform.OS === 'web') {
        // For web, get or create user ID from localStorage
        try {
          const localUserId = localStorage.getItem('user_id');
          if (!localUserId) {
            storedUserId = 'demo_user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', storedUserId);
          } else {
            storedUserId = localUserId;
          }
        } catch (localStorageError) {
          console.log('localStorage failed, using fallback:', localStorageError);
          storedUserId = 'demo_user_' + Math.random().toString(36).substr(2, 9);
        }
      } else {
        // For mobile, get or create user ID from SecureStore
        try {
          const secureUserId = await SecureStore.getItemAsync('user_id');
          if (!secureUserId) {
            storedUserId = 'demo_user_' + Math.random().toString(36).substr(2, 9);
            await SecureStore.setItemAsync('user_id', storedUserId);
          } else {
            storedUserId = secureUserId;
          }
        } catch (secureStoreError) {
          console.log('SecureStore failed, using fallback:', secureStoreError);
          storedUserId = 'demo_user_' + Math.random().toString(36).substr(2, 9);
        }
      }
      
      setUserId(storedUserId);
      console.log('User ID set:', storedUserId);
      
      // Load tasks - try Firebase first, then fallback to local
      try {
        console.log('Loading tasks from Firebase...');
        const cloudTasks = await firebaseTasks.getTasks(storedUserId);
        console.log('Firebase tasks loaded:', cloudTasks.length);
        setTasks(cloudTasks);
      } catch (firebaseError) {
        console.log('Firebase failed, loading from local storage:', firebaseError);
        await loadTasksFromLocal();
      }
      
    } catch (error) {
      console.error('Error initializing user:', error);
      // Ultimate fallback to local storage
      try {
        await loadTasksFromLocal();
      } catch (localError) {
        console.error('Even local storage failed:', localError);
        setTasks([]); // Final fallback
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTasksFromCloud = async (uid: string) => {
    try {
      console.log('Loading tasks from Firebase for user:', uid);
      const cloudTasks = await firebaseTasks.getTasks(uid);
      console.log('Loaded tasks from Firebase:', cloudTasks.length);
      
      // Also check local storage for web
      if (Platform.OS === 'web') {
        const localTasks = await getStorageData(TASKS_STORAGE_KEY);
        if (localTasks) {
          const parsedLocalTasks = JSON.parse(localTasks);
          console.log('Found local tasks:', parsedLocalTasks.length);
          
          // Merge local and cloud tasks, preferring local (more recent)
          const mergedTasks = mergeTasks(parsedLocalTasks, cloudTasks);
          console.log('Merged tasks count:', mergedTasks.length);
          setTasks(mergedTasks);
          
          // Save merged tasks to cloud for future sync
          await firebaseTasks.saveTasks(uid, mergedTasks);
        } else {
          setTasks(cloudTasks);
        }
      } else {
        setTasks(cloudTasks);
      }
    } catch (error) {
      console.error('Error loading tasks from Firebase:', error);
      // Fallback to local storage
      loadTasksFromLocal();
    } finally {
      setLoading(false);
    }
  };

  // Merge tasks from two sources, preferring local (more recent) tasks
  const mergeTasks = (localTasks: Task[], cloudTasks: Task[]): Task[] => {
    const mergedMap = new Map<string, Task>();
    
    // Add cloud tasks first
    cloudTasks.forEach(task => {
      mergedMap.set(task.id, task);
    });
    
    // Override with local tasks (more recent)
    localTasks.forEach(task => {
      mergedMap.set(task.id, task);
    });
    
    return Array.from(mergedMap.values());
  };

  const loadTasksFromLocal = async () => {
    try {
      console.log('Loading tasks from local storage on platform:', Platform.OS);
      const storedTasks = await getStorageData(TASKS_STORAGE_KEY);
      console.log('Raw storage data:', storedTasks);
      
      if (storedTasks) {
        try {
          const parsedTasks = JSON.parse(storedTasks);
          const migratedTasks = parsedTasks.map((task: any) => ({
            ...task,
            startDate: task.startDate || new Date().toISOString().split('T')[0],
            completions: task.completions || []
          }));
          setTasks(migratedTasks);
          console.log('Loaded tasks from local storage:', migratedTasks.length);
        } catch (parseError) {
          console.error('Error parsing stored tasks:', parseError);
          setTasks([]);
        }
      } else {
        console.log('No tasks found in local storage');
        setTasks([]);
      }
    } catch (error) {
      console.error("Error loading tasks from local storage:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTasksToCloud = async (updatedTasks: Task[]) => {
    // Always save to local storage first (most reliable)
    await saveTasksToLocal(updatedTasks);
    
    // Try to save to Firebase for all platforms
    if (!userId) return;
    
    try {
      console.log('Saving tasks to Firebase for user:', userId);
      await firebaseTasks.saveTasks(userId, updatedTasks);
      console.log('Tasks saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving tasks to Firebase:', error);
      // Local storage already saved, so no action needed
    }
  };

  const saveTasksToLocal = async (updatedTasks: Task[]) => {
    try {
      console.log('Saving tasks to local storage on platform:', Platform.OS);
      await setStorageData(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      console.log('Tasks saved to local storage successfully');
    } catch (error) {
      console.error("Error saving tasks to local storage:", error);
    }
  };

  const addTask = (task: Task) => {
    const taskWithCompletions = { ...task, completions: [] };
    const updatedTasks = [...tasks, taskWithCompletions];
    setTasks(updatedTasks);
    saveTasksToCloud(updatedTasks);
  };

  const updateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    saveTasksToCloud(updatedTasks);
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, isActive: !task.isActive } : task
    );
    setTasks(updatedTasks);
    saveTasksToCloud(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasksToCloud(updatedTasks);
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
    saveTasksToCloud(updatedTasks);
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

  const syncFromWeb = async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('Sync not needed on web platform');
        return;
      }
      
      if (!userId) {
        alert('User not initialized. Please restart the app.');
        return;
      }
      
      console.log('Manual sync: Refreshing tasks from cloud');
      await loadTasksFromCloud(userId);
      alert('Tasks synced from cloud successfully!');
      
    } catch (error) {
      console.error('Manual sync error:', error);
      alert('Sync failed: ' + (error as Error).message);
    }
  };

  const logout = async () => {
    try {
      const authInstance = auth;
      await signOut(authInstance);
      setUser(null);
      setUserId('');
      setTasks([]);
      
      // Clear stored user ID
      if (Platform.OS === 'web') {
        localStorage.removeItem('user_id');
      } else {
        await SecureStore.deleteItemAsync('user_id');
      }
    } catch (error) {
      console.error('Logout error:', error);
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
      loading,
      user,
      logout
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