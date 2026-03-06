# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Professional Theme System**
  - Create centralized theme structure with colors, spacing, typography
  - Add professional color palette with proper naming conventions
  - Implement consistent spacing scale across all components
  - Add typography system with proper font hierarchy

- **Enhanced Task Management**
  - Fix task editing on web with proper HTML input styling
  - Add task sorting by due date with visual urgency indicators
  - Implement clickable task titles for navigation to EditTaskScreen
  - Add overdue/today badges for task priority visualization
  - Update all screens to use new theme system

- **Cross-Platform Support**
  - Fix web date/time input styling with proper HTML elements
  - Ensure consistent behavior between web and mobile platforms
  - Add platform-specific input handling and styling

- **UI/UX Improvements**
  - Tasks now sorted chronologically by due date (most urgent first)
  - Visual indicators for overdue tasks (red border + "OVERDUE" badge)
  - Visual indicators for tasks due today (yellow "DUE TODAY" badge)
  - Enhanced task cards with better visual hierarchy
  - Professional design matching production mockups
  - Improved accessibility with larger tap targets

### Fixed
- **Web Input Styling Issues**
  - Fixed date input styling for web browsers
  - Fixed time input styling for web browsers
  - Resolved task editing issues on web platform

- **TypeScript Errors**
  - Fixed all TypeScript compilation errors
  - Updated imports to use new theme system
  - Resolved missing color properties and typography definitions

- **Design System Issues**
  - Fixed inconsistent styling across components
  - Resolved missing theme properties
  - Updated all screens to use centralized design tokens

### Changed
- **Theme Architecture**
  - Migrated from hardcoded styles to centralized theme system
  - Updated all components to use theme tokens instead of inline styles
  - Improved maintainability and consistency across the app

### Deprecated
- **Old Style System**
  - Removed hardcoded color values
  - Deprecated inconsistent spacing values
  - Replaced old typography with centralized system

---

## [1.0.0] - 2026-03-06

### Added
- **Initial Home Chore Manager App**
  - Basic task creation and management
  - Firebase integration for data persistence
  - React Native cross-platform support
  - Authentication system with user management
  - Task completion tracking and statistics

### Features
- Task Management
  - Create, read, update, delete tasks
  - Task frequency settings (daily, weekly, biweekly, monthly)
  - Task completion tracking with timestamps
  - Weekly progress visualization

- Authentication
  - Firebase Auth integration
  - User login/logout functionality
  - Secure data storage per user

- Cross-Platform
  - React Native for mobile
  - React Native Web for browser support
  - Platform-specific date/time pickers

- Basic UI
  - Task list with cards
  - Add/Edit task forms
  - Progress indicators
  - Responsive design
