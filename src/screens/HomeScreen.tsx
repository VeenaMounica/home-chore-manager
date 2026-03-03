import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useTasks } from "../context/TaskContext";
import { Task } from "../types/Tasks";
import { homeStyles } from "../styles/common";

// Calculate next due date based on frequency
const getNextDueDate = (task: Task): Date => {
  const startDate = new Date(task.startDate);
  const now = new Date();
  let nextDue = new Date(startDate);

  // If start date is in future, use that
  if (startDate > now) {
    return startDate;
  }

  // Calculate next due date based on frequency
  switch (task.frequency) {
    case "daily":
      // Next due is today or tomorrow
      nextDue = new Date(now);
      nextDue.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]), 0, 0);
      if (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + 1);
      }
      break;

    case "weekly":
      // Next due is specified day of week
      const targetDayOfWeek = task.dayOfWeek || 1; // Monday default
      nextDue = new Date(now);
      nextDue.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]), 0, 0);
      
      // Find the next occurrence of the target day
      while (nextDue.getDay() !== targetDayOfWeek) {
        nextDue.setDate(nextDue.getDate() + 1);
      }
      
      // If that time has passed today, go to next week
      if (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + 7);
      }
      break;

    case "biweekly":
      // Next due is every 14 days from start date (simple version)
      nextDue = new Date(startDate);
      
      // Calculate next due date every 14 days
      while (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + 14); // Add 14 days
      }
      break;

    case "monthly":
      // Next due is the specified day of month
      const targetDayOfMonth = task.dayOfMonth || 1;
      nextDue = new Date(now.getFullYear(), now.getMonth(), targetDayOfMonth);
      nextDue.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]), 0, 0);
      
      // If that date has passed this month, go to next month
      if (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }
      break;

    default:
      nextDue = startDate;
  }

  return nextDue;
};

// Format date for display
const formatDateDisplay = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Format due date with relative time
const formatDueDate = (task: Task) => {
  const nextDue = getNextDueDate(task);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dueDateOnly = new Date(nextDue.getFullYear(), nextDue.getMonth(), nextDue.getDate());
  
  if (dueDateOnly.getTime() === today.getTime()) {
    return `Today at ${task.time}`;
  } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${task.time}`;
  } else {
    const daysUntil = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) {
      return `In ${daysUntil} days at ${task.time}`;
    } else if (daysUntil <= 30) {
      return formatDateDisplay(nextDue.toISOString().split('T')[0]) + ` at ${task.time}`;
    } else {
      return formatDateDisplay(nextDue.toISOString().split('T')[0]) + ` at ${task.time}`;
    }
  }
};

export default function HomeScreen({ navigation }: any) {
  const { tasks, toggleTask, deleteTask, completeTask, getLastWeekData, syncFromWeb, loading } = useTasks();
  const lastWeekData = getLastWeekData();

  // Show loading state
  if (loading) {
    return (
      <View style={homeStyles.container}>
        <View style={homeStyles.header}>
          <Text style={homeStyles.title}>Mom's Chore Reminder</Text>
        </View>
        <View style={homeStyles.tasksContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={homeStyles.emptyText}>Loading tasks...</Text>
        </View>
      </View>
    );
  }

  const renderTask = ({ item }: { item: Task }) => {
    const completionsThisWeek = lastWeekData[item.id] || 0;
    
    return (
      <View style={homeStyles.taskItem}>
        <View style={homeStyles.taskHeader}>
          <TouchableOpacity onPress={() => navigation.navigate("EditTask", { taskId: item.id })}>
            <Text style={homeStyles.taskTitle}>{item.title}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={homeStyles.deleteButton}
            onPress={() => deleteTask(item.id)}
          >
            <Text style={homeStyles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={homeStyles.taskDetails}>
          {item.frequency} • {formatDueDate(item)} • Started: {formatDateDisplay(item.startDate)}
        </Text>
        <View style={homeStyles.taskActions}>
          <TouchableOpacity 
            style={homeStyles.statusToggle}
            onPress={() => toggleTask(item.id)}
          >
            <Text style={homeStyles.taskStatus}>
              {item.isActive ? "✓ Active" : "○ Inactive"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={homeStyles.completeButton}
            onPress={() => completeTask(item.id)}
          >
            <Text style={homeStyles.completeButtonText}>
              ✓ Complete Today
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={homeStyles.weeklyStats}>
          This week: {completionsThisWeek} completion{completionsThisWeek !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.header}>
        <Text style={homeStyles.title}>Mom's Chore Reminder</Text>
        <TouchableOpacity 
          style={homeStyles.addButton}
          onPress={() => navigation.navigate("AddTask")}
        >
          <Text style={homeStyles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Sync button for mobile only */}
      {Platform.OS !== 'web' && (
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#007AFF', 
            padding: 10, 
            borderRadius: 8, 
            margin: 10,
            alignItems: 'center'
          }}
          onPress={() => syncFromWeb()}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            🔄 Sync from Web
          </Text>
        </TouchableOpacity>
      )}

      <View style={homeStyles.tasksContainer}>
        <Text style={homeStyles.sectionTitle}>Tasks ({tasks.length})</Text>
        {tasks.length === 0 ? (
          <Text style={homeStyles.emptyText}>No tasks yet. Add your first task!</Text>
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            style={homeStyles.taskList}
          />
        )}
      </View>
    </View>
  );
}
