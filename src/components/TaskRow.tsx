import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Task } from "../types/Tasks";
import { colors } from "../theme/colors";
import { homeStyles } from "../styles/homeStyles";
import { getTaskIcon, getStartedLabel } from "../utils/taskDisplay";
import { TaskActions } from "./TaskActions";

export type TaskRowProps = {
  task: Task;
  isOverdue: boolean;
  isDueToday: boolean;
  nextDueTime: string;
  completionsThisWeek: number;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
};

export const TaskRow = ({
  task,
  isOverdue,
  isDueToday,
  nextDueTime,
  completionsThisWeek,
  onEdit,
  onDelete,
  onComplete,
}: TaskRowProps) => {
  return (
    <View style={[
      homeStyles.taskItem,
      isOverdue ? homeStyles.overdueTaskItem : undefined,
    ]}>
      <View style={homeStyles.taskHeader}>
        <Text style={homeStyles.taskIcon}>{getTaskIcon(task.title)}</Text>
        <TouchableOpacity onPress={() => onEdit(task.id)}>
          <Text style={homeStyles.taskTitle}>{task.title}</Text>
        </TouchableOpacity>

        {isDueToday && (
          <View style={homeStyles.taskTagWarning}>
            <Text style={homeStyles.taskTagText}>DUE TODAY</Text>
          </View>
        )}
        {isOverdue && (
          <View style={homeStyles.taskTagDanger}>
            <Text style={homeStyles.taskTagTextDanger}>OVERDUE</Text>
          </View>
        )}
      </View>

      <View style={homeStyles.taskDetails}>
        {task.type === "chore" ? (
          <>
            <Text style={homeStyles.taskDetailText}>
              Frequency: <Text style={homeStyles.taskDetailValue}>{task.frequency!.charAt(0).toUpperCase() + task.frequency!.slice(1)}</Text>
            </Text>
            <Text style={homeStyles.taskDetailText}>
              Next time: <Text style={homeStyles.taskDetailValue}>{nextDueTime}</Text>
            </Text>
            <Text style={homeStyles.taskDetailText}>
              Started: <Text style={homeStyles.taskDetailValue}>{getStartedLabel(task)}</Text>
            </Text>
          </>
        ) : (
          <Text style={homeStyles.taskDetailText}>
            Goal Type: <Text style={homeStyles.taskDetailValue}>
              {task.personalGoalType === "immediate" ? "⚡ Immediate" :
               task.personalGoalType === "normal" ? "📅 Normal" : "🎯 Long-term"}
            </Text>
          </Text>
        )}
      </View>

      <TaskActions
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
      />

      <View style={homeStyles.weeklyStats}>
        <Text style={homeStyles.weeklyStatsText}>
          This week: <Text style={homeStyles.weeklyStatsValue}>{completionsThisWeek} completion{completionsThisWeek !== 1 ? 's' : ''}</Text>
        </Text>
      </View>
    </View>
  );
};
