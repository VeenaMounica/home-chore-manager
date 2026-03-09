import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task } from "../types/Tasks";

// Firebase collections
const TASKS_COLLECTION = 'tasks';

// Firebase helper functions
export const firebaseTasks = {
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
  }
};