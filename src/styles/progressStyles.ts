import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

const textStyles = {
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

export const progressStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: textStyles.heading,
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingFill: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.success,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  progressDotFilled: {
    backgroundColor: colors.success,
  },
  progressDotEmpty: {
    backgroundColor: colors.borderLight,
  },
  progressStats: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});