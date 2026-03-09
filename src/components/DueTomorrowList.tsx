import React from "react";
import { View, Text } from "react-native";
import { Task } from "../types/Tasks";
import { colors } from "../theme/colors";
import { homeStyles } from "../styles/homeStyles";
import { getTaskIcon } from "../utils/taskDisplay";

export type DueTomorrowListProps = {
  tasks: Task[];
};

export const DueTomorrowList = ({ tasks }: DueTomorrowListProps) => {
  if (tasks.length === 0) return null;

  return (
    <View style={homeStyles.sectionCard}>
      <Text style={homeStyles.sectionTitle}>📅 Due Tomorrow ({tasks.length})</Text>
      {tasks.map(task => (
        <View key={task.id} style={homeStyles.dueTomorrowItem}>
          <Text style={homeStyles.dueTomorrowTitle}>
            {getTaskIcon(task.title)} {task.title}
          </Text>
          <Text style={homeStyles.dueTomorrowSubtitle}>
            Tomorrow at {task.time}
          </Text>
        </View>
      ))}
    </View>
  );
};
