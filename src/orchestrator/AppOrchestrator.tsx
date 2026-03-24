import React, { createContext, useContext, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { TaskBehaviour } from '../behaviours/TaskBehaviour';
import { ChatBehaviour } from '../behaviours/ChatBehaviour';
import { FamilyBehaviour } from '../behaviours/FamilyBehaviour';
import { AuthBehaviour } from '../behaviours/AuthBehaviour';

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

// Create context for behaviours
const BehaviourContext = createContext<{
  taskBehaviour: import('../behaviours/TaskBehaviour').TaskBehaviour;
  chatBehaviour: import('../behaviours/ChatBehaviour').ChatBehaviour;
  familyBehaviour: import('../behaviours/FamilyBehaviour').FamilyBehaviour;
  authBehaviour: import('../behaviours/AuthBehaviour').AuthBehaviour;
} | null>(null);

// Hook to use behaviours
export const useBehaviours = () => {
  const context = useContext(BehaviourContext);
  if (!context) {
    throw new Error('useBehaviours must be used within a BehaviourProvider');
  }
  return context;
};

// Loading spinner (unchanged)
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

// No wrapper needed - direct rendering

// Protected page wrapper - no authentication gating
const ProtectedPage: React.FC<{ children: React.ReactNode; requireParent?: boolean }> = ({
  children,
  requireParent = false
}) => {
  return <>{children}</>;
};

// Admin page wrapper - no authentication gating
const AdminPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Main app routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main app shell - default route */}
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="/login" element={<LandingPage />} />

      {/* Protected routes wrapper */}
      <Route element={
        <ProtectedPage>
          <Layout>
            <Outlet />
          </Layout>
        </ProtectedPage>
      }>
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/chat" element={<FamilyChat />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/history" element={<History />} />
        <Route path="/achievements" element={<Achievements />} />
        
        {/* Parent-only routes */}
        <Route path="/parent-chat" element={<ParentChat />} />
        <Route path="/task-comment/:taskId" element={<TaskComment />} />
        <Route path="/admin" element={<ParentDashboard />} />
      </Route>

      {/* Other routes */}
      <Route path="/setup" element={<FamilySetupScreen onComplete={() => {}} />} />
      <Route path="/profile-select" element={<ProfileSelectionScreen onProfileSelect={() => {}} onParentMode={() => {}} />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App component - orchestrator layer
const AppOrchestrator: React.FC = () => {
  // Create behaviour instances
  const taskBehaviour = useMemo(() => new TaskBehaviour(), []);
  const chatBehaviour = useMemo(() => new ChatBehaviour(), []);
  const familyBehaviour = useMemo(() => new FamilyBehaviour(), []);
  const authBehaviour = useMemo(() => new AuthBehaviour(), []);

  // Behaviour provider
  const behaviourProvider = useMemo(
    () => ({
      taskBehaviour,
      chatBehaviour,
      familyBehaviour,
      authBehaviour,
    }),
    [taskBehaviour, chatBehaviour, familyBehaviour, authBehaviour]
  );

  return (
    <BrowserRouter>
      <BehaviourContext.Provider value={behaviourProvider}>
        <AppRoutes />
      </BehaviourContext.Provider>
    </BrowserRouter>
  );
};

export default AppOrchestrator;