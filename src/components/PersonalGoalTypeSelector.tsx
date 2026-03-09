import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { PersonalGoalType } from "../types/Tasks";
import { addTaskStyles } from "../styles/addTaskStyles";

interface PersonalGoalTypeSelectorProps {
  personalGoalType: PersonalGoalType;
  onPersonalGoalTypeChange: (type: PersonalGoalType) => void;
}

export const PersonalGoalTypeSelector: React.FC<PersonalGoalTypeSelectorProps> = ({
  personalGoalType,
  onPersonalGoalTypeChange,
}) => {
  return (
    <>
      <Text style={addTaskStyles.label}>Goal Type</Text>
      <View style={addTaskStyles.buttonRow}>
        <TouchableOpacity
          style={[
            addTaskStyles.frequencyButton,
            personalGoalType === "immediate" && addTaskStyles.frequencyButtonSelected
          ]}
          onPress={() => onPersonalGoalTypeChange("immediate")}
        >
          <Text style={[
            addTaskStyles.frequencyButtonText,
            personalGoalType === "immediate" && addTaskStyles.frequencyButtonTextSelected
          ]}>Immediate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            addTaskStyles.frequencyButton,
            personalGoalType === "normal" && addTaskStyles.frequencyButtonSelected
          ]}
          onPress={() => onPersonalGoalTypeChange("normal")}
        >
          <Text style={[
            addTaskStyles.frequencyButtonText,
            personalGoalType === "normal" && addTaskStyles.frequencyButtonTextSelected
          ]}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            addTaskStyles.frequencyButton,
            personalGoalType === "long-term" && addTaskStyles.frequencyButtonSelected
          ]}
          onPress={() => onPersonalGoalTypeChange("long-term")}
        >
          <Text style={[
            addTaskStyles.frequencyButtonText,
            personalGoalType === "long-term" && addTaskStyles.frequencyButtonTextSelected
          ]}>Long-term</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};