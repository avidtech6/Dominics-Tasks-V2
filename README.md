# Dominic's Tasks - Family Task Management Application

A comprehensive family task management application built with React, TypeScript, and Firebase. The app helps families coordinate tasks, track progress, communicate through private and group chats, and celebrate achievements together.

## 🚀 Recent Improvements (v2.0.0)

The application has been significantly enhanced with the following improvements:

### ✅ Core Stabilization
- **Race condition fixes** in FamilyContext and TasksContext with proper cleanup guards
- **TypeScript error resolution** across all components
- **State synchronization** improvements for real-time updates

### ✅ Feature Completion
- **Firebase Storage integration** for chat attachments and task evidence
- **Task approval workflow** with evidence submission (Levels 0-3)
- **Parent dashboard** with comprehensive task management
- **Multi-child family architecture** with profile switching

### ✅ Security & Configuration
- **Environment variable configuration** for Firebase (no hardcoded secrets)
- **Enhanced security headers** with Content Security Policy (CSP)
- **Firebase Storage security rules** for proper access control
- **Development mode** with mock services for testing

### ✅ Testing Infrastructure
- **Playwright end-to-end tests** for critical user flows
- **Smoke tests** for landing page and navigation
- **Task page tests** for core functionality
- **CI/CD integration** with GitHub Actions

### ✅ Deployment & CI/CD
- **Cloudflare Pages deployment** with proper configuration
- **GitHub Actions workflow** for automated testing and deployment
- **Deployment scripts** for both Windows and Unix systems
- **Environment-specific builds** (production/staging)

## 📋 Features

### Core Functionality
- **Task Management**: Create, assign, and track tasks with a drag-and-drop Kanban board
- **Progress Tracking**: Visual progress indicators and completion statistics
- **Calendar View**: View tasks scheduled across different dates
- **Points System**: Earn points for completed tasks with automatic calculation
- **Achievement System**: Unlock badges and celebrate milestones
- **Family Chat**: Group messaging for the entire family
- **Parent Chat**: Private messaging channel hidden from children
- **File Attachments**: Share images and documents in chats
- **Emoji Reactions**: React to messages with quick emoji responses
- **Comments System**: Add fun comments and feedback to completed tasks
- **Resource Library**: Curated learning resources and links

### Advanced Features
- **Multi-child profiles**: Support for multiple children in a family
- **Task approval workflow**: 4-level approval system with evidence submission
- **Parent dashboard**: Comprehensive overview and management tools
- **Real-time updates**: Live synchronization across devices
- **Offline support**: Development mode with mock data
- **Responsive design**: Works on mobile, tablet, and desktop

### User Roles
- **Parents**: Full access to all features including Parent Chat and analytics
- **Children**: Access to tasks, family chat, achievements, and resources

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM 6
- **State Management**: React Context API (AuthContext, FamilyContext, TasksContext)
- **Drag & Drop**: @dnd-kit/core
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Testing**: Playwright for end-to-end tests
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages with Wrangler
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
dominicstasks/
├── src/
│   ├── components/
│   │   ├── AchievementBadge.tsx    # Achievement badge component
│   │   ├── CommentsModal.tsx       # Comments modal for tasks
│   │   ├── CommentsPanel.tsx       # Fun comments panel for tasks
│   │   ├── ConfettiCelebration.tsx # Celebration animation
│   │   ├── FamilySetupScreen.tsx   # Family setup screen
│   │   ├── Layout.tsx              # Main app layout
│   │   ├── ParentDashboard.tsx     # Parent dashboard component
│   │   ├── PinPad.tsx              # PIN pad for parent mode
│   │   ├── ProfileSelectionScreen.tsx # Profile selection
│   │   ├── TaskCard.tsx            # Individual task card
│   │   ├── TaskColumn.tsx          # Task column (Todo/In Progress/Done)
│   │   └── TaskModal.tsx           # Task creation/editing modal
│   ├── context/
│   │   ├── AuthContext.tsx         # Authentication state management
│   │   ├── FamilyContext.tsx       # Family and profile management
│   │   └── TasksContext.tsx        # Tasks, points, and approvals management
│   ├── pages/
│   │   ├── Achievements.tsx        # Achievements gallery
│   │   ├── Calendar.tsx            # Calendar view of tasks
│   │   ├── FamilyChat.tsx          # Family group chat
│   │   ├── History.tsx             # Task completion history
│   │   ├── LandingPage.tsx         # Landing page
│   │   ├── Login.tsx               # Login page
│   │   ├── ParentChat.tsx          # Private parent chat
│   │   ├── Resources.tsx           # Learning resources
│   │   ├── TaskComment.tsx         # Task comments page
│   │   └── Tasks.tsx               # Main tasks Kanban board
│   ├── services/
│   │   ├── devMode.ts              # Development mode utilities
│   │   ├── devModeFirestore.ts     # Mock Firestore for dev mode
│   │   ├── firebase.ts             # Firebase configuration and services
│   │   ├── googleDrive.ts          # Google Drive integration (planned)
│   │   └── migrateV1ToV2.ts        # Migration utilities
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── utils/
│   │   └── index.ts                # Utility functions
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # App entry point
│   └── index.css                   # Global styles
├── tests/
│   ├── smoke.spec.ts               # Smoke tests
│   └── tasks-page.spec.ts          # Tasks page tests
├── public/
│   └── _headers                    # Cloudflare Pages headers
├── .github/workflows/
│   └── ci-cd.yml                   # GitHub Actions CI/CD pipeline
├── dist/                           # Production build output
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── wrangler.toml                   # Cloudflare configuration
├── firestore.rules                 # Firebase Firestore security rules
├── storage.rules                   # Firebase Storage security rules
├── DEPLOYMENT.md                   # Deployment guide
├── deploy.sh                       # Unix deployment script
├── deploy.bat                      # Windows deployment script
└── .env.example                    # Environment variables template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Firestore, Storage, and Authentication enabled
- Cloudflare account (for deployment)

### Installation

1. Clone the repository:
```bash
cd dominicstasks
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

4. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

5. Start development server:
```bash
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Development Mode
VITE_DEV_MODE=true  # Set to empty string or false for production
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Update test snapshots
npm run test:update-snapshots
```

### Test Coverage
- **Smoke tests**: Basic application functionality
- **Tasks page tests**: Core task management features
- **Playwright configuration**: Multi-browser support (Chromium, Firefox, WebKit)

## 🚢 Deployment

### Cloudflare Pages

The project is configured for deployment to Cloudflare Pages using Wrangler CLI.

#### Manual Deployment
```bash
# Build the project
npm run build

# Deploy using Wrangler
npx wrangler pages deploy dist --project-name=dominicstasks
```

#### Using Deployment Scripts
```bash
# Unix/Linux/Mac
./deploy.sh

# Windows
deploy.bat
```

#### Automated CI/CD
The repository includes GitHub Actions workflow that automatically:
- Runs tests on pull requests
- Builds the application
- Deploys preview environments for PRs
- Deploys to production on push to main

### Required GitHub Secrets
Set the following secrets in your GitHub repository settings:

| Secret Name | Description |
|-------------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages write access |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |

## 🔒 Security

### Firebase Security Rules

#### Firestore Rules (`firestore.rules`)
Comprehensive rules for:
- User authentication and authorization
- Task access based on family membership
- Private message restrictions
- Achievement and point management

#### Storage Rules (`storage.rules`)
Secure file upload rules for:
- Chat attachments (10MB limit)
- Task evidence (5MB limit)
- Profile photos (2MB limit)
- Resource files (20MB limit)

### Content Security Policy
The application includes a comprehensive CSP in `public/_headers` that:
- Restricts script sources to trusted domains
- Allows Firebase and Google APIs for authentication
- Prevents XSS attacks with strict directives
- Configures proper CORS headers for OAuth

## 📊 Architecture

### State Management
- **AuthContext**: Manages user authentication and session
- **FamilyContext**: Handles family data, profiles, and parent mode
- **TasksContext**: Manages tasks, approvals, points, and real-time updates

### Data Flow
1. User authenticates via Firebase Auth
2. Family data loads with real-time Firestore listeners
3. Tasks and approvals sync across all devices
4. UI updates reactively based on state changes
5. File uploads go to Firebase Storage with progress tracking

### Real-time Features
- Firestore listeners for instant updates
- WebSocket-like behavior without manual polling
- Offline support with development mode fallback
- Conflict resolution with optimistic updates

## 🐛 Troubleshooting

### Common Issues

1. **Authentication fails in production**
   - Verify Firebase auth domain includes your Cloudflare Pages domain
   - Check OAuth redirect URIs in Firebase Console

2. **CORS errors with Firebase**
   - Ensure Cloudflare headers allow cross-origin requests
   - Check `public/_headers` file for proper CSP configuration

3. **Build fails in CI/CD**
   - Check environment variables are properly set as GitHub secrets
   - Verify Node.js version compatibility

4. **Real-time updates not working**
   - Check Firestore security rules allow read/write
   - Verify Firebase project is on Blaze plan (required for real-time)

### Development Mode
Enable development mode by setting `VITE_DEV_MODE=true` in your environment variables. This will:
- Use mock Firestore data instead of real Firebase
- Simulate file uploads without actual Storage
- Provide consistent test data for development

## 📈 Performance

### Bundle Optimization
- Vite automatic code splitting
- Tree-shaking for unused dependencies
- Lazy loading for non-critical components
- Asset optimization with compression

### Caching Strategy
- Cloudflare edge caching for static assets
- Browser caching with proper cache headers
- Cache busting for updated resources
- CDN distribution for global performance

## 🤝 Contributing

### Development Workflow
1. Create a feature branch from `develop`
2. Make changes with appropriate tests
3. Run tests locally: `npm test`
4. Ensure build passes: `npm run build`
5. Create pull request to `develop` branch

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for consistent formatting
- Playwright tests for critical paths

## 📄 License

Private project - All rights reserved.

## 📞 Support

For questions or issues:
1. Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide
2. Review Firebase Console for errors
3. Examine GitHub Actions logs
4. Contact the development team

---

**Version**: 2.0.0  
**Last Updated**: February 2026  
**Status**: Production Ready 🚀
