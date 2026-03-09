import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { auth, authReady, onAuthStateChanged } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { Task, TaskCompletion } from "../types/Tasks";
import { getLastDueDate, isTaskOverdue } from "../utils/recurrence";
import { firebaseTasks } from '../services/firebaseTasks';
import { getStorageData, setStorageData, TASKS_STORAGE_KEY } from '../services/storageService';

// Simple UUID generator for platforms without crypto
const generateSimpleId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<any | null>(null);

  // Initialize user and load tasks
  useEffect(() => {
    const setupAuthListener = async () => {
      try {
        console.log('TaskManager: waiting on authReady');
        // Wait for auth persistence to be configured (especially for web)
        await authReady;
        console.log('TaskManager: authReady resolved');
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
            // For users not signed in, fall back to local/demo storage so tasks persist
            setUser(null);
            await initializeUser();
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
    firebaseTasks.updateTask(updatedTask.id, updatedTask);
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
        const completionDate = isTaskOverdue(task)
          ? getLastDueDate(task).toISOString().split('T')[0]
          : today;

        const existingCompletion = task.completions.find(c => c.date === completionDate);
        if (!existingCompletion) {
          return {
            ...task,
            completions: [
              ...task.completions,
              {
                date: completionDate,
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

  return {
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
    logout,
    userId
  };
}