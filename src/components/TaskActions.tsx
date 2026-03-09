import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { homeStyles } from "../styles/homeStyles";
import { Task } from "../types/Tasks";

export type TaskActionsProps = {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
};

export const TaskActions = ({ task, onEdit, onDelete, onComplete }: TaskActionsProps) => {
  return (
    <View style={homeStyles.taskActions}>
      <TouchableOpacity
        style={homeStyles.activeLabel}
        onPress={() => onEdit(task.id)}
      >
        <Text style={homeStyles.activeLabelText}>✅ Active</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={homeStyles.completeButton}
        onPress={() => onComplete(task)}
      >
        <Text style={homeStyles.completeButtonText}>Complete</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={homeStyles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <Text style={homeStyles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};
