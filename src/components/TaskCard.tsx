import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Task } from "../types/Tasks";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { homeStyles } from "../styles/homeStyles";
import { getTaskIcon, getStartedLabel } from "../utils/taskDisplay";

export type TaskCardProps = {
  task: Task;
  isOverdue: boolean;
  isDueToday: boolean;
  nextDueTime: string;
  completionsThisWeek: number;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
};

export const TaskCard = ({
  task,
  isOverdue,
  isDueToday,
  nextDueTime,
  completionsThisWeek,
  onEdit,
  onDelete,
  onComplete,
}: TaskCardProps) => {
  return (
    <View style={[homeStyles.taskItem, isOverdue ? { borderColor: colors.danger, borderWidth: 2 } : {}]}>
      {/* Task Header with Icon */}
      <View style={homeStyles.taskHeader}>
        <Text style={{ fontSize: 32, marginRight: 12 }}>{getTaskIcon(task.title)}</Text>
        <TouchableOpacity onPress={() => onEdit(task.id)}>
          <Text style={homeStyles.taskTitle}>{task.title}</Text>
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
          style={homeStyles.deleteButton}
          onPress={() => onDelete(task.id)}
        >
          <Text style={homeStyles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Task Details */}
      <View style={{ marginBottom: 16 }}>
        {task.type === "chore" ? (
          <>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
              Frequency: <Text style={{ fontWeight: '600', color: colors.text }}>
                {task.frequency!.charAt(0).toUpperCase() + task.frequency!.slice(1)}
              </Text>
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
              Next time: <Text style={{ fontWeight: '600', color: colors.text }}>{nextDueTime}</Text>
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Started: <Text style={{ fontWeight: '600', color: colors.text }}>
                {getStartedLabel(task)}
              </Text>
            </Text>
          </>
        ) : (
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            Goal Type: <Text style={{ fontWeight: '600', color: colors.text }}>
              {task.personalGoalType === "immediate" ? "⚡ Immediate" :
               task.personalGoalType === "normal" ? "📅 Normal" : "🎯 Long-term"}
            </Text>
          </Text>
        )}
      </View>

      {/* Task Actions */}
      <View style={homeStyles.taskActions}>
        <Text style={{
          fontSize: 12,
          fontWeight: '600',
          color: colors.success,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}>
          ✅ Active
        </Text>
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
            elevation: 3,
          }}
          onPress={() => onComplete(task)}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.surface,
          }}>
            Complete
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Stats */}
      <View style={homeStyles.weeklyStats}>
        <Text style={homeStyles.weeklyStatsText}>
          This week: <Text style={{ fontWeight: '600', color: colors.text }}>
            {completionsThisWeek} completion{completionsThisWeek !== 1 ? 's' : ''}
          </Text>
        </Text>
      </View>
    </View>
  );
};
