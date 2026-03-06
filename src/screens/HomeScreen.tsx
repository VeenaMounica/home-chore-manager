import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  ScrollView,
  SafeAreaView
} from "react-native";
import { useTasks } from "../context/TaskContext";
import { Task } from "../types/Tasks";
import { homeStyles, addTaskStyles, progressStyles } from "../styles/common";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

// Progress Ring Component
const ProgressRing = ({ completed, total }: { completed: number; total: number }) => {
  if (total === 0) {
    return (
      <View style={progressStyles.progressRing}>
        <Text style={progressStyles.progressText}>✓</Text>
      </View>
    );
  }
  
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const rotation = (percentage / 100) * 360 - 90; // Start from top
  
  return (
    <View style={progressStyles.progressRing}>
      {percentage > 0 && (
        <View
          style={[
            progressStyles.progressRingFill,
            {
              transform: [{ rotate: `${rotation}deg` }],
              borderLeftColor: percentage > 25 ? colors.success : 'transparent',
              borderBottomColor: percentage > 50 ? colors.success : 'transparent',
            },
          ]}
        />
      )}
      <Text style={progressStyles.progressText}>{Math.round(percentage)}%</Text>
    </View>
  );
};

// Progress Dots Component
const ProgressDots = ({ completed, total }: { completed: number; total: number }) => {
  if (total === 0) {
    return (
      <View style={progressStyles.progressDots}>
        <Text style={progressStyles.progressStats}>
          All done! 🎉
        </Text>
      </View>
    );
  }
  
  return (
    <View style={progressStyles.progressDots}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            progressStyles.progressDot,
            index < completed ? progressStyles.progressDotFilled : progressStyles.progressDotEmpty,
          ]}
        />
      ))}
    </View>
  );
};

// Task icons mapping
const getTaskIcon = (taskTitle: string): string => {
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

// Format next due time in a more readable way
const formatNextDueTime = (task: Task): string => {
  const nextDue = getNextDueDate(task);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (nextDue.toDateString() === now.toDateString()) {
    return `Today at ${task.time}`;
  } else if (nextDue.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${task.time}`;
  } else {
    const daysUntil = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil === 1) return 'Tomorrow at ' + task.time;
    if (daysUntil <= 7) return `In ${daysUntil} days at ${task.time}`;
    return `In ${daysUntil} days at ${task.time}`;
  }
};
const getTasksDueThisWeek = (tasks: Task[]): Task[] => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Calculate days to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return tasks.filter(task => {
    const nextDue = getNextDueDate(task);
    return nextDue >= monday && nextDue <= sunday;
  });
};

// Sort tasks by next due date
const sortTasksByDueDate = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const nextDueA = getNextDueDate(a);
    const nextDueB = getNextDueDate(b);
    return nextDueA.getTime() - nextDueB.getTime();
  });
};

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

  // Calculate weekly progress for tasks due this week only
  const tasksDueThisWeek = getTasksDueThisWeek(tasks);
  const totalTasksThisWeek = tasksDueThisWeek.length;
  const completedThisWeek = tasksDueThisWeek.reduce((sum, task) => sum + (lastWeekData[task.id] || 0), 0);

  // Show loading state
  if (loading) {
    return (
      <View style={homeStyles.container}>
        <View style={{ 
          flex: 1,
          justifyContent: 'center', 
          alignItems: 'center',
          paddingHorizontal: 20,
          minHeight: Dimensions.get('window').height
        }}>
          <View style={addTaskStyles.card}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ 
              fontSize: 16, 
              color: '#666',
              marginTop: 20,
              textAlign: 'center'
            }}>Loading tasks...</Text>
          </View>
        </View>
      </View>
    );
  }

  const renderTask = ({ item }: { item: Task }) => {
    const completionsThisWeek = lastWeekData[item.id] || 0;
    const nextDueTime = formatNextDueTime(item);
    const nextDue = getNextDueDate(item);
    const now = new Date();
    const isOverdue = nextDue < now;
    const isDueToday = nextDue.toDateString() === now.toDateString();
    
    return (
      <View style={{
        backgroundColor: colors.surface,
        padding: spacing.cardPadding,
        marginBottom: spacing.cardMargin,
        borderRadius: spacing.borderRadiusLarge,
        borderWidth: isOverdue ? 2 : 1,
        borderColor: isOverdue ? colors.danger : colors.borderLight,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: spacing.shadowRadius,
        elevation: spacing.elevation,
        width: '100%',
      }}>
        {/* Task Header with Icon */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <Text style={{
            fontSize: 32,
            marginRight: 12,
          }}>
            {getTaskIcon(item.title)}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("EditTask", { taskId: item.id })}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 4,
            }}>
              {item.title}
            </Text>
          </TouchableOpacity>
          {isDueToday && (
            <View style={{
              backgroundColor: colors.warning,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
              marginLeft: 8,
            }}>
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: '#000',
              }}>
                DUE TODAY
              </Text>
            </View>
          )}
          {isOverdue && (
            <View style={{
              backgroundColor: colors.danger,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
              marginLeft: 8,
            }}>
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: '#fff',
              }}>
                OVERDUE
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={{
              backgroundColor: colors.borderLight,
              width: 32,
              height: 32,
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => deleteTask(item.id)}
          >
            <Text style={{
              fontSize: 18,
              color: colors.textSecondary,
            }}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Task Details */}
        <View style={{
          marginBottom: 16,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 4,
          }}>
            Frequency: <Text style={{ fontWeight: '600', color: colors.text }}>
              {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
            </Text>
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 4,
          }}>
            Next time: <Text style={{ fontWeight: '600', color: colors.text }}>
              {nextDueTime}
            </Text>
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
          }}>
            Started: <Text style={{ fontWeight: '600', color: colors.text }}>
              {new Date(item.startDate).toLocaleDateString()}
            </Text>
          </Text>
        </View>

        {/* Task Actions */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <TouchableOpacity 
            style={{
              backgroundColor: item.isActive ? colors.success : colors.borderLight,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: item.isActive ? colors.success : colors.border,
            }}
            onPress={() => toggleTask(item.id)}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: item.isActive ? colors.surface : colors.text,
            }}>
              {item.isActive ? "✅ Active" : "○ Inactive"}
            </Text>
          </TouchableOpacity>          
          <TouchableOpacity 
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
            onPress={() => completeTask(item.id)}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.surface,
            }}>
              ✅ Complete Today
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        <View style={{
          backgroundColor: '#f8f9fa',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.borderLight,
        }}>
          <Text style={{
            fontSize: 12,
            color: colors.textSecondary,
          }}>
            This week: <Text style={{ fontWeight: '600', color: colors.text }}>
              {completionsThisWeek} completion{completionsThisWeek !== 1 ? 's' : ''}
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        shadowColor: colors.shadowLight,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.text,
          }}>
            Home Chore Manager
          </Text>
          <TouchableOpacity 
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => navigation.navigate("AddTask")}
          >
            <Text style={{
              color: colors.surface,
              fontSize: 16,
              fontWeight: '600',
            }}>
              + Add Task
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync button for mobile only */}
      {Platform.OS !== 'web' && (
        <View style={{ paddingHorizontal: 20, paddingTop: 15 }}>
          <TouchableOpacity 
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => syncFromWeb()}
          >
            <Text style={{
              color: colors.surface,
              fontSize: 16,
              fontWeight: '600',
            }}>
              🔄 Sync from Web
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Weekly Progress */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={progressStyles.container}>
          <View style={progressStyles.header}>
            <Text style={progressStyles.title}>Weekly Progress</Text>
          </View>
          <View style={progressStyles.progressRow}>
            <ProgressRing completed={completedThisWeek} total={totalTasksThisWeek} />
            <View style={progressStyles.progressDots}>
              <ProgressDots completed={completedThisWeek} total={totalTasksThisWeek} />
              <Text style={progressStyles.progressStats}>
                {completedThisWeek} / {totalTasksThisWeek} tasks
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tasks Content */}
      <View style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
      }}>
        <Text style={{
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 20,
        }}>
          Tasks ({tasks.length})
        </Text>
        
        {tasks.length === 0 ? (
          <View style={addTaskStyles.card}>
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              No tasks yet.{'\n'}Start organizing your home!
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortTasksByDueDate(tasks)}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
