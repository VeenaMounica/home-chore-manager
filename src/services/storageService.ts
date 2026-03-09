import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types/Tasks";

// In-memory storage fallback for platforms without persistent storage
let inMemoryStorage: Task[] = [];

// Simple storage interface using Expo SecureStore
export const getStorageData = async (key: string): Promise<string | null> => {
  console.log('Getting storage data for key:', key, 'on platform:', Platform.OS);

  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      // Prefer AsyncStorage for native persistence (compat with previous versions)
      try {
        const result = await AsyncStorage.getItem(key);
        console.log('AsyncStorage result:', result);
        return result;
      } catch (asyncError) {
        console.log('AsyncStorage failed, falling back to SecureStore:', asyncError);
      }

      const secureResult = await SecureStore.getItemAsync(key);
      console.log('SecureStore result:', secureResult);
      return secureResult;
    }
  } catch (error) {
    console.log('No persistent storage available, using in-memory fallback:', error);
    // Fallback to in-memory storage
    const data = inMemoryStorage.length > 0 ? JSON.stringify(inMemoryStorage) : null;
    console.log('In-memory fallback data:', data);
    return data;
  }
};

export const setStorageData = async (key: string, value: string): Promise<void> => {
  console.log('Setting storage data for key:', key, 'on platform:', Platform.OS);

  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      console.log('localStorage set successful');
    } else {
      // Prefer AsyncStorage for native persistence (compat with previous versions)
      try {
        await AsyncStorage.setItem(key, value);
        console.log('AsyncStorage set successful');
        return;
      } catch (asyncError) {
        console.log('AsyncStorage failed, falling back to SecureStore:', asyncError);
      }

      await SecureStore.setItemAsync(key, value);
      console.log('SecureStore set successful');
    }
  } catch (error) {
    console.log('No persistent storage available, using in-memory fallback:', error);
    // Fallback to in-memory storage
    inMemoryStorage = JSON.parse(value);
    console.log('Saved to in-memory storage');
  }
};

export const TASKS_STORAGE_KEY = "mom_chore_tasks";