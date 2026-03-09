import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
  Alert,
  SafeAreaView,
} from "react-native";
import { useTasks } from "../context/TaskContext";
import { Task } from "../types/Tasks";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { homeStyles } from "../styles/homeStyles";
import { addTaskStyles } from "../styles/addTaskStyles";
import { colors } from "../theme/colors";
import {
  getNextDueDate,
  getLastDueDate,
  formatNextDueTime,
  sortTasksByDueDate,
  getTasksDueToday,
  getTasksDueTomorrow,
  isTaskOverdue,
} from "../utils/recurrence";
import { ProgressRing } from "../components/ProgressRing";
import { TaskRow } from "../components/TaskRow";
import { DueTomorrowList } from "../components/DueTomorrowList";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;


export default function HomeScreen({ navigation }: Props) {
  const { tasks, completeTask, deleteTask, getLastWeekData, syncFromWeb } = useTasks();
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const lastWeekData = getLastWeekData();

  // Handle task completion options
  const handleCompleteToday = () => {
    if (selectedTask) {
      completeTask(selectedTask.id);
      setShowCompletionModal(false);
      setSelectedTask(null);
    }
  };

  const handleRecur = () => {
    // Just close modal - task will naturally recur on next load
    setShowCompletionModal(false);
    setSelectedTask(null);
  };

  const handleFinished = () => {
    if (selectedTask) {
      Alert.alert(
        "Delete Task",
        "Are you sure you want to permanently delete this task?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => {
              deleteTask(selectedTask.id);
              setShowCompletionModal(false);
              setSelectedTask(null);
            }
          }
        ]
      );
    }
  };

  const openCompletionModal = (task: Task) => {
    setSelectedTask(task);
    setShowCompletionModal(true);
  };

  // Get debug info for display
  const getDebugInfo = () => {
    if (typeof window !== 'undefined' && (window as any).taskDebug) {
      return (window as any).taskDebug;
    }
    return null;
  };

  // Handle loading state - set to false when tasks are available
  useEffect(() => {
    if (tasks.length >= 0) {
      setLoading(false);
    }
  }, [tasks]);

  // Calculate daily progress for chores due today (only recurring chores)
  const chores = tasks.filter(task => task.type === "chore");
  const personalTasks = tasks.filter(task => task.type === "personal");
  const tasksDueToday = getTasksDueToday(chores);
  const tasksDueTomorrow = getTasksDueTomorrow(chores);
  const totalTasksToday = tasksDueToday.length;

  // Count tasks completed today (by checking completion records matching today's date)
  const todayKey = new Date().toISOString().split('T')[0];
  const completedToday = tasksDueToday.reduce((sum: number, task: Task) => {
    const completed = task.completions.some(c => c.date === todayKey) ? 1 : 0;
    return sum + completed;
  }, 0);

  // Show loading state
  if (loading) {
    return (
      <View style={homeStyles.container}>
        {getDebugInfo() && (
          <View style={homeStyles.debugBox}>
            <Text style={homeStyles.debugTitle}>DEBUG INFO:</Text>
            <Text style={homeStyles.debugText}>Task: {getDebugInfo().taskTitle}</Text>
            <Text style={homeStyles.debugText}>Current: {getDebugInfo().currentDate} at {getDebugInfo().currentTime}</Text>
            <Text style={homeStyles.debugText}>Started: {getDebugInfo().startDate} at {getDebugInfo().taskTime}</Text>
            <Text style={homeStyles.debugText}>Day of Week: {getDebugInfo().taskDayOfWeek} ({getDebugInfo().taskDayOfWeekType})</Text>
            <Text style={homeStyles.debugText}>Days since start: {getDebugInfo().daysDiff}</Text>
            <Text style={homeStyles.debugText}>Modulo 7: {getDebugInfo().modulo7}</Text>
          </View>
        )}
        <View style={homeStyles.loadingContainer}>
          <View style={homeStyles.sectionCard}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={homeStyles.loadingText}>Loading tasks...</Text>
          </View>
        </View>
      </View>
    );
  }

  const renderTask = ({ item }: { item: Task }) => {
    if (item.type === "personal") {
      // Personal tasks don't have due dates or recurrence
      const completionsThisWeek = lastWeekData[item.id] || 0;
      return (
        <TaskRow
          task={item}
          isOverdue={false}
          isDueToday={false}
          nextDueTime=""
          completionsThisWeek={completionsThisWeek}
          onEdit={(taskId) => navigation.navigate("EditTask", { taskId })}
          onDelete={deleteTask}
          onComplete={openCompletionModal}
        />
      );
    }

    // Chore rendering (existing logic)
    const completionsThisWeek = lastWeekData[item.id] || 0;
    const nextDueTime = formatNextDueTime(item);
    const nextDue = getNextDueDate(item);
    const lastDue = getLastDueDate(item);
    const now = new Date();

    const isOverdue = isTaskOverdue(item);
    const dueReference = isOverdue ? lastDue : nextDue;
    const isDueToday = dueReference.toDateString() === now.toDateString();

    return (
      <TaskRow
        task={item}
        isOverdue={isOverdue}
        isDueToday={isDueToday}
        nextDueTime={nextDueTime}
        completionsThisWeek={completionsThisWeek}
        onEdit={(taskId) => navigation.navigate("EditTask", { taskId })}
        onDelete={deleteTask}
        onComplete={openCompletionModal}
      />
    );
  };

  return (
    <SafeAreaView style={homeStyles.container}>
      {/* Header */}
      <View style={homeStyles.header}>
        <View style={homeStyles.headerContent}>
          <Text style={homeStyles.title}>Home Chore Manager</Text>
          <TouchableOpacity
            style={homeStyles.headerButton}
            onPress={() => navigation.navigate("AddTask")}
          >
            <Text style={homeStyles.headerButtonText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync button for mobile only */}
      {Platform.OS !== 'web' && (
        <View style={[homeStyles.pageContent, { paddingTop: 15 }]}>          <TouchableOpacity
            style={homeStyles.headerButton}
            onPress={() => syncFromWeb()}
          >
            <Text style={homeStyles.headerButtonText}>🔄 Sync from Web</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Daily Progress */}
      <View style={homeStyles.pageContent}>
        {totalTasksToday > 0 && (
          <View style={homeStyles.sectionCard}>
            <Text style={homeStyles.sectionTitle}>📊 Daily Progress</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <ProgressRing completed={completedToday} total={totalTasksToday} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text
                }}>
                  {completedToday}/{totalTasksToday}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 2
                }}>
                  tasks completed today
                </Text>
              </View>
            </View>
          </View>
        )}

        <DueTomorrowList tasks={tasksDueTomorrow} />
      </View>

      {/* Tasks Content */}
      <View style={[homeStyles.pageContent, { flex: 1 }]}>
        {/* Chores Section */}
        {chores.length > 0 && (
          <>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 15,
              marginTop: 10,
            }}>
              🏠 Chores ({chores.length})
            </Text>
            <FlatList
              data={sortTasksByDueDate(chores)}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
              style={{ flex: 1 }}
            />
          </>
        )}

        {/* Personal Goals Section */}
        {personalTasks.length > 0 && (
          <>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 15,
              marginTop: chores.length > 0 ? 30 : 10,
            }}>
              🎯 Personal Goals ({personalTasks.length})
            </Text>
            <FlatList
              data={personalTasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
            />
          </>
        )}

        {/* Empty State */}
        {chores.length === 0 && personalTasks.length === 0 && (
          <View style={addTaskStyles.card}>
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              No tasks yet.{'\n'}Start organizing your home and goals!
            </Text>
          </View>
        )}
      </View>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={homeStyles.modalOverlay}>
          <View style={homeStyles.modalContainer}>
            <Text style={homeStyles.modalTitle}>Task Options</Text>
            <Text style={homeStyles.modalSubtitle}>{selectedTask?.title}</Text>

            <TouchableOpacity
              style={[homeStyles.modalButton, homeStyles.modalButtonSuccess]}
              onPress={handleCompleteToday}
            >
              <Text style={homeStyles.modalButtonText}>✅ Complete Today</Text>
              <Text style={homeStyles.modalButtonDescription}>
                Mark as done for today, keep recurring
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[homeStyles.modalButton, homeStyles.modalButtonPrimary]}
              onPress={handleRecur}
            >
              <Text style={homeStyles.modalButtonText}>🔄 Recur</Text>
              <Text style={homeStyles.modalButtonDescription}>
                Skip today, move to next due date
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[homeStyles.modalButton, homeStyles.modalButtonDanger]}
              onPress={handleFinished}
            >
              <Text style={homeStyles.modalButtonText}>🗑️ Finished</Text>
              <Text style={homeStyles.modalButtonDescription}>
                Delete task permanently
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[homeStyles.modalButton, { backgroundColor: colors.borderLight }]}
              onPress={() => {
                setShowCompletionModal(false);
                setSelectedTask(null);
              }}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
