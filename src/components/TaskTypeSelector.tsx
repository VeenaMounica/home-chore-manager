import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TaskType } from "../types/Tasks";
import { addTaskStyles } from "../styles/addTaskStyles";

interface TaskTypeSelectorProps {
  taskType: TaskType;
  onTaskTypeChange: (type: TaskType) => void;
}

export const TaskTypeSelector: React.FC<TaskTypeSelectorProps> = ({
  taskType,
  onTaskTypeChange,
}) => {
  return (
    <>
      <Text style={addTaskStyles.label}>Task Type</Text>
      <View style={addTaskStyles.buttonRow}>
        <TouchableOpacity
          style={[
            addTaskStyles.frequencyButton,
            taskType === "chore" && addTaskStyles.frequencyButtonSelected
          ]}
          onPress={() => onTaskTypeChange("chore")}
        >
          <Text style={[
            addTaskStyles.frequencyButtonText,
            taskType === "chore" && addTaskStyles.frequencyButtonTextSelected
          ]}>Chore</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            addTaskStyles.frequencyButton,
            taskType === "personal" && addTaskStyles.frequencyButtonSelected
          ]}
          onPress={() => onTaskTypeChange("personal")}
        >
          <Text style={[
            addTaskStyles.frequencyButtonText,
            taskType === "personal" && addTaskStyles.frequencyButtonTextSelected
          ]}>Personal Goal</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};