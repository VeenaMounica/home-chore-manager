# Home Chore Manager

A modern, cross-platform task management app built with React Native and Firebase, designed to help families organize and track household chores efficiently.

## Features

### Task Management
- **Create Tasks**: Add new chores with frequency settings
- **Edit Tasks**: Modify existing task details
- **Delete Tasks**: Remove completed or unwanted tasks
- **Task Frequency**: Daily, Weekly, Biweekly, Monthly options
- **Smart Scheduling**: Automatic due date calculation based on frequency

### Progress Tracking
- **Weekly Progress**: Visual progress ring showing completion rate
- **Task Statistics**: Track completions per week
- **Completion History**: Log of all completed tasks
- **Due Date Management**: Smart sorting by urgency

### Professional UI
- **Modern Design**: Clean, card-based interface
- **Visual Indicators**: Overdue and due today badges
- **Task Icons**: Contextual emojis for each chore type
- **Responsive Design**: Works on all screen sizes
- **Theme System**: Professional color palette and typography

### Authentication & Sync
- **Firebase Integration**: Secure data storage
- **User Authentication**: Login/logout functionality
- **Cross-Device Sync**: Access tasks anywhere
- **Web & Mobile**: Consistent experience across platforms

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI
- Firebase project setup

### Installation

```bash
# Clone the repository
git clone https://github.com/VeenaMounica/home-chore-manager.git

# Navigate to project directory
cd home-chore-manager

# Install dependencies
npm install

# Start development server
npm start
```

### Development

```bash
# Start Metro bundler
npm start

# Run on web
npm run web

# Run on mobile simulator
npm run ios     # iOS Simulator
npm run android   # Android Emulator
```

## Platform Support

### Web
- Modern browser compatibility
- Responsive design
- HTML5 date/time inputs
- Touch-friendly interface

### Mobile
- React Native for iOS and Android
- Native date/time pickers
- Platform-specific optimizations
- Touch gestures and animations

## Theme System

The app uses a centralized theme system located in `src/theme/`:

### Colors
- **Primary**: `#007AFF` - Main actions and accents
- **Success**: `#34C759` - Completed tasks and positive states
- **Danger**: `#dc3545` - Overdue tasks and errors
- **Warning**: `#ffc107` - Due today indicators
- **Surface**: `#FFFFFF` - Card backgrounds
- **Background**: `#F5F7FA` - App background

### Typography
- **App Title**: 28px Bold
- **Section Title**: 20px SemiBold  
- **Task Title**: 18px SemiBold
- **Task Details**: 16px Regular
- **Button Text**: 16px SemiBold
- **Small Labels**: 12px Regular

### Spacing
- **Card Padding**: 20px
- **Card Margin**: 16px
- **Button Padding**: 12px
- **Border Radius**: 8-16px
- **Icon Size**: 32px

## Project Structure

```
src/
├── components/          # Reusable UI components
├── config/            # Firebase and app configuration
├── context/           # React Context for state management
├── navigation/        # React Navigation setup
├── screens/           # Main app screens
│   ├── HomeScreen.tsx      # Task list and management
│   ├── AddTaskScreen.tsx   # Create new tasks
│   ├── EditTaskScreen.tsx  # Modify existing tasks
│   └── LoginScreen.tsx     # User authentication
├── styles/            # Legacy styles (migrated to theme)
├── theme/             # Design system
│   ├── colors.ts          # Color palette
│   ├── spacing.ts         # Spacing scale
│   └── typography.ts      # Typography system
└── types/             # TypeScript type definitions
```

## Configuration

### Firebase Setup
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Add Firebase config to `src/config/firebase.ts`
5. Configure security rules in `firestore.rules`

### Environment Variables
Create `.env` file for sensitive configuration:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Task Management Features

### Task Creation
- **Title**: Descriptive task names
- **Frequency**: Daily, Weekly, Biweekly, Monthly
- **Time**: Specific time for task execution
- **Start Date**: When task scheduling begins
- **Day Settings**: Day of week (weekly) or day of month (monthly)

### Task Organization
- **Chronological Sorting**: Tasks sorted by due date
- **Urgency Indicators**: Visual badges for overdue/today
- **Priority Display**: Most urgent tasks appear first
- **Status Tracking**: Active/inactive toggle

### Task Completion
- **One-Tap Complete**: Mark tasks as done
- **Completion History**: Timestamp for each completion
- **Weekly Stats**: Track completion rates
- **Progress Visualization**: Ring and dot indicators

## UI Components

### Task Cards
- **Visual Hierarchy**: Clear information structure
- **Contextual Icons**: Emojis for task types
- **Action Buttons**: Complete, Active/Inactive, Delete
- **Status Badges**: OVERDUE, DUE TODAY indicators
- **Responsive Layout**: Adapts to screen size

### Navigation
- **Tab Navigation**: Easy screen switching
- **Gesture Support**: Swipe actions on mobile
- **Deep Linking**: Direct task access
- **Breadcrumb Trail**: Clear navigation path

## Security Features

### Authentication
- **Secure Login**: Firebase Auth integration
- **Session Management**: Persistent login state
- **User Isolation**: Data separated by user
- **Logout Protection**: Secure session termination

### Data Protection
- **Encrypted Storage**: Firebase security rules
- **Input Validation**: Form data sanitization
- **Error Handling**: Graceful failure management
- **Backup Ready**: Firebase automatic backups

## Analytics & Monitoring

### Task Analytics
- **Completion Rates**: Weekly/monthly statistics
- **Task Patterns**: Frequency analysis
- **User Activity**: Engagement metrics
- **Performance Data**: App usage statistics

### Error Tracking
- **Crash Reporting**: Automatic error collection
- **Performance Monitoring**: App speed tracking
- **User Feedback**: In-app reporting system
- **Debugging Tools**: Development console access

## Deployment

### Web Deployment
```bash
# Build for production
npm run build

# Deploy to hosting service
npm run deploy
```

### Mobile Deployment
```bash
# Build Android app
npm run build:android

# Deploy to app stores
# Follow platform-specific deployment guides
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests if applicable
5. Submit pull request
6. Code review and merge

### Code Standards
- **TypeScript**: Strong typing throughout
- **ESLint**: Consistent code style
- **Prettier**: Automatic formatting
- **Husky**: Pre-commit hooks
- **Semantic Commits**: Follow conventional commits

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and release notes.

## Support

### Getting Help
- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Ask questions and share ideas
- **Documentation**: Check this README and inline code comments

### Community
- **Contributing**: We welcome pull requests and improvements
- **Star**: Show your support for this project

---

**Built with love for families who want to stay organized**
