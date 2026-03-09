import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

// Enhanced button styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: spacing.shadowRadius,
    elevation: spacing.elevation,
  },
  primaryLarge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: spacing.shadowRadius,
    elevation: spacing.elevation + 1,
  },
  danger: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadiusSmall,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: spacing.shadowRadiusSmall,
    elevation: spacing.elevationSmall,
  },
  success: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadiusSmall,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: spacing.shadowRadiusSmall,
    elevation: spacing.elevationSmall,
  },
  secondary: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.primary,
  },
};

// Enhanced text styles
export const textStyles = {
  title: typography.appTitle,
  heading: typography.sectionTitle,
  subheading: typography.taskTitle,
  body: typography.body,
  caption: typography.caption,
  small: typography.small,
  button: typography.button,
  buttonTextSmall: typography.buttonTextSmall,
  buttonTextTiny: typography.buttonTextTiny,
  link: {
    ...typography.button,
    color: colors.primary,
    textDecorationLine: 'underline' as const,
  },
};
