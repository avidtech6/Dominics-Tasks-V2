import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { TaskBehaviour } from '../behaviours/TaskBehaviour';
import { ChatBehaviour } from '../behaviours/ChatBehaviour';
import { FamilyBehaviour } from '../behaviours/FamilyBehaviour';
import { AuthBehaviour } from '../behaviours/AuthBehaviour';
import { ensureDefaultDatabases } from '../substrate/viewConfigStore';

// Import components
import Layout from '../components/Layout';
import LandingPage from '../pages/LandingPage';
import Tasks from '../pages/Tasks';
import Calendar from '../pages/Calendar';
import FamilyChat from '../pages/FamilyChat';
import ParentChat from '../pages/ParentChat';
import Resources from '../pages/Resources';
import History from '../pages/History';
import Achievements from '../pages/Achievements';
import TaskComment from '../pages/TaskComment';
import ProfileSelectionScreen from '../components/ProfileSelectionScreen';
import FamilySetupScreen from '../components/FamilySetupScreen';
import ParentDashboard from '../components/ParentDashboard';

interface BehaviourProvider {
  taskBehaviour: TaskBehaviour;
  chatBehaviour: ChatBehaviour;
  familyBehaviour: FamilyBehaviour;
  authBehaviour: AuthBehaviour;
  ready: boolean;
}

const BehaviourContext = createContext<BehaviourProvider | null>(null);

export const useBehaviours = () => {
  const context = useContext(BehaviourContext);
  if (!context) {
    throw new Error('useBehaviours must be used within a BehaviourProvider');
  }
  return context;
};

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-blue-600 mx-auto mb-6"></div>
        <p className="text-xl text-gray-700 font-semibold">Loading...</p>
      </div>
    </div>
  );
};

const ProtectedPage: React.FC<{ children: React.ReactNode; requireParent?: boolean }> = ({
  children,
  requireParent = false,
}) => {
  return <>{children}</>;
};

const AdminPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();

  // Per M03 recipe §A: FamilySetupScreen onComplete → /profile-select
  // ProfileSelectionScreen onProfileSelect → /tasks
  // onParentMode → /admin
  const handleSetupComplete = () => {
    navigate('/profile-select');
  };

  const handleProfileSelect = (_profileId: string) => {
    navigate('/tasks');
  };

  const handleParentMode = () => {
    navigate('/admin');
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="/login" element={<LandingPage />} />

      <Route
        element={
          <ProtectedPage>
            <Layout>
              <Outlet />
            </Layout>
          </ProtectedPage>
        }
      >
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/chat" element={<FamilyChat />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/history" element={<History />} />
        <Route path="/achievements" element={<Achievements />} />

        <Route path="/parent-chat" element={<ParentChat />} />
        <Route path="/task-comment/:taskId" element={<TaskComment />} />
        <Route path="/admin" element={<ParentDashboard />} />
      </Route>

      <Route path="/setup" element={<FamilySetupScreen onComplete={handleSetupComplete} />} />
      <Route
        path="/profile-select"
        element={<ProfileSelectionScreen onProfileSelect={handleProfileSelect} onParentMode={handleParentMode} />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const AppOrchestrator: React.FC = () => {
  // Behaviour instances — each loads its own data from localStorage on construct
  const taskBehaviour = useMemo(() => new TaskBehaviour(), []);
  const chatBehaviour = useMemo(() => new ChatBehaviour(), []);
  const familyBehaviour = useMemo(() => new FamilyBehaviour(), []);
  const authBehaviour = useMemo(() => new AuthBehaviour(), []);

  // Wait for all behaviours to finish loading before rendering
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([
      taskBehaviour.whenReady(),
      chatBehaviour.whenReady(),
      familyBehaviour.whenReady(),
      authBehaviour.whenReady(),
    ])
      .then(() => {
        // Substrate: ensure default databases (with view configs) exist in storage.
        // This is the persistence seam for future ViewSwitcher / multi-board features.
        ensureDefaultDatabases();
        setReady(true);
      })
      .catch((err) => {
        console.error('[AppOrchestrator] whenReady failed:', err);
        setReady(true); // fail open — UI still renders
      });
  }, [taskBehaviour, chatBehaviour, familyBehaviour, authBehaviour]);

  const behaviourProvider = useMemo(
    () => ({
      taskBehaviour,
      chatBehaviour,
      familyBehaviour,
      authBehaviour,
      ready,
    }),
    [taskBehaviour, chatBehaviour, familyBehaviour, authBehaviour, ready]
  );

  if (!ready) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <BehaviourContext.Provider value={behaviourProvider}>
        <AppRoutes />
      </BehaviourContext.Provider>
    </BrowserRouter>
  );
};

export default AppOrchestrator;
