# Dominic's Tasks - v1.0 Legacy Documentation

## Snapshot Date: January 18, 2024

This document describes the state of Dominic's Tasks application BEFORE the multi-child architecture upgrade. This version is preserved as a reference and fallback.

---

## Deployment URLs

| Environment | URL | Status |
|-------------|-----|--------|
| **Production (v1 - Stable)** | `v1.dominicstasks.pages.dev` | Live |
| **Production (v2 - Development)** | `dominicstasks.pages.dev` | In Development |
| **Documentation** | `dominicstasks-docs.pages.dev` | Live |

---

## Version Information

- **Last Build Date**: January 18, 2024
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)

### Key Dependencies

```
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.0
- firebase: ^10.7.0
- lucide-react: ^0.294.0
- date-fns: ^2.30.0
- tailwindcss: ^3.3.0
- vite: ^5.0.0
- @vitejs/plugin-react: ^4.2.0
```

---

## Features Implemented (v1.0)

### Core Functionality

1. **Task Management**
   - Create, edit, delete tasks
   - Task sections: Morning, Afternoon, Assignments, Leftovers, Experiments, Support, Catch Up
   - Drag and drop task organization
   - Touch support for mobile devices
   - Soft delete with 30-day recovery

2. **User Authentication**
   - Google OAuth sign-in
   - Parent/Child role assignment
   - Authorized email list restriction

3. **Task Details**
   - Priority levels (Low, Medium, High, Urgent)
   - Task types (Regular, Assignment, Exam, Project, Personal)
   - Due dates and deadlines
   - Comments system with Family Chat integration
   - Tags for subject organization

4. **Progress Tracking**
   - Daily progress bar
   - Task completion statistics
   - History archive
   - Deleted tasks recovery

5. **UI Features**
   - Responsive design (mobile + desktop)
   - Dark sidebar with navigation
   - Motivational quotes
   - Profile section with stats

### Pages

| Route | Description |
|-------|-------------|
| `/tasks` | Main task board with sections |
| `/calendar` | Calendar view (placeholder) |
| `/chat` | Family chat room |
| `/parent-chat` | Private parent chat (parent only) |
| `/resources` | Resource links (placeholder) |
| `/history` | Archived completed tasks |
| `/achievements` | Achievement badges (placeholder) |

---

## Architecture (v1.0)

### Data Model

```
Firebase Firestore Structure:
├── users/{userId}
│   ├── (user profile data)
│   └── tasks/{taskId}
│       ├── title: string
│       ├── description: string
│       ├── status: 'todo' | 'today' | 'done'
│       ├── section: 'morning' | 'afternoon' | 'assignments' | etc.
│       ├── taskType: 'regular' | 'assignment' | 'exam' | 'project' | 'personal'
│       ├── priority: 'low' | 'medium' | 'high' | 'urgent'
│       ├── pointsValue: number
│       ├── dueDate: timestamp
│       ├── deadlineDate: timestamp
│       ├── createdAt: timestamp
│       ├── completedAt: timestamp
│       └── ...
```

### Component Hierarchy

```
App.tsx
├── AuthProvider
│   └── TasksProvider
│       └── BrowserRouter
│           └── Routes
│               ├── LoginPage
│               └── ProtectedPage
│                   └── Layout
│                       ├── Sidebar (navigation)
│                       └── Main Content (page components)
│                           ├── Tasks
│                           ├── Calendar
│                           ├── FamilyChat
│                           └── ... (other pages)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app with routing |
| `src/context/AuthContext.tsx` | Authentication state management |
| `src/context/TasksContext.tsx` | Task data management with Firestore |
| `src/components/Layout.tsx` | Main layout with sidebar |
| `src/pages/Tasks.tsx` | Main task board interface |
| `src/services/firebase.ts` | Firebase configuration |
| `src/types/index.ts` | TypeScript type definitions |

---

## How to Restore This Version Locally

### Prerequisites

- Node.js 18+
- npm or yarn

### Steps

```bash
# 1. Navigate to project directory
cd dominicstasks

# 2. If using the backup zip
# Extract the zip file first
unzip dominicstasks_v1_backup_YYYY-MM-DD.zip

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:5173
```

### For Production Build

```bash
npm run build
npx wrangler pages deploy dist
```

---

## Files Included in Backup

```
dominicstasks_v1_backup_2026-01-18_21-16.zip
├── .env                           # Environment variables
├── .wrangler/                     # Cloudflare Wrangler config
├── index.html                     # HTML entry point
├── package.json                   # npm dependencies
├── postcss.config.js              # PostCSS config
├── tailwind.config.js             # Tailwind CSS config
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite build config
├── wrangler.toml                  # Cloudflare Workers config
├── src/
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Global styles
│   ├── components/                # React components
│   │   ├── Layout.tsx             # Main layout
│   │   ├── TaskCard.tsx           # Task card UI
│   │   ├── TaskColumn.tsx         # Task column UI
│   │   ├── TaskModal.tsx          # Task create/edit modal
│   │   ├── CommentsModal.tsx      # Comments modal
│   │   └── ... (other components)
│   ├── context/                   # React Context providers
│   │   ├── AuthContext.tsx        # Auth state
│   │   └── TasksContext.tsx       # Tasks state + Firestore
│   ├── pages/                     # Route pages
│   │   ├── Tasks.tsx              # Main tasks page
│   │   ├── Login.tsx              # Login page
│   │   ├── FamilyChat.tsx         # Chat page
│   │   └── ... (other pages)
│   ├── services/                  # Service modules
│   │   ├── firebase.ts            # Firebase config
│   │   └── devMode.ts             # Dev mode utilities
│   ├── types/index.ts             # TypeScript types
│   └── utils/index.ts             # Utility functions
└── public/                        # Static assets
```

---

## Known Limitations (v1.0)

1. **Single User**: Only supports one user profile (no multi-child)
2. **No Gamification**: Points system types defined but not connected to completion
3. **No Morning Bonus**: Time-based bonus not implemented
4. **No Admin Console**: No parent dashboard for settings
5. **Basic Calendar**: Calendar page is a placeholder
6. **Basic Achievements**: Achievements page is a placeholder

---

## Differences from v2 (Planned)

| Feature | v1.0 (This Version) | v2.0 (Planned) |
|---------|---------------------|----------------|
| User Profiles | Single user | Multi-child family |
| Authentication | Google OAuth only | Google OAuth + PIN |
| Admin Controls | None | Full dashboard |
| Gamification | Not implemented | Points, streaks, rewards |
| Approval System | None | Graduated (0-3 levels) |
| Theme per User | Single theme | Per-child custom colors |

---

## Rollback Procedure

If v2 development causes issues and you need to restore v1:

### Option 1: Use Cloudflare Branch Deployment

The `legacy-v1` branch is automatically deployed. Access it at:
`https://dominicstasks.pages.dev/` (check deployment history)

### Option 2: Restore from Backup

```bash
# Extract backup
unzip dominicstasks_v1_backup_YYYY-MM-DD.zip -d dominicstasks-v1-restore

# Deploy to Cloudflare Pages
cd dominicstasks-v1-restore
npm install
npm run build
npx wrangler pages deploy dist --project-name=dominicstasks-legacy
```

### Option 3: Git Checkout

```bash
# If using git with the legacy-v1 branch
git checkout legacy-v1
npm install
npm run dev
```

---

## Support Notes

- **Firebase Project**: dominics-tasks
- **Authorized Emails**: dominicgiles691@gmail.com, derrickmg.admin@gmail.com, brendamgiles@gmail.com
- **Cloudflare Account**: linked via .wrangler configuration

---

*Document created: January 18, 2024*
*Backup file: dominicstasks_v1_backup_2026-01-18_21-16.zip*
