import React from "react";
import { View, Text } from "react-native";
import { colors } from "../theme/colors";
import { progressStyles } from "../styles/progressStyles";

export type ProgressRingProps = {
  completed: number;
  total: number;
};

export const ProgressRing = ({ completed, total }: ProgressRingProps) => {
  if (total === 0) {
    return (
      <View style={progressStyles.progressRing}>
        <Text style={progressStyles.progressText}>✓</Text>
      </View>
    );
  }

  const percentage = total > 0 ? (completed / total) * 100 : 0;

  if (percentage >= 100) {
    return (
      <View
        style={[
          progressStyles.progressRing,
          { backgroundColor: colors.success },
        ]}
      >
        <Text style={[progressStyles.progressText, { color: '#fff' }]}>100%</Text>
      </View>
    );
  }

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
