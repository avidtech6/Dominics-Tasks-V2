import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.legacy';
import { TasksProvider } from './context/TasksContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import FamilyChat from './pages/FamilyChat';
import ParentChat from './pages/ParentChat';
import Resources from './pages/Resources';
import History from './pages/History';
import Achievements from './pages/Achievements';

// NOTE: This is the LEGACY v1.0 App component
// This file provides single-user routing without profile selection
// Used for deployment to dominicstasks-legacy.pages.dev

// Loading spinner
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-blue-600 mx-auto mb-6"></div>
        <p className="text-xl text-gray-700 font-semibold">
          Loading Dominic's Tasks
        </p>
        <p className="text-gray-500 mt-2">
          Please wait...
        </p>
      </div>
    </div>
  );
};

// Login page wrapper
const LoginPage: React.FC = () => {
  const { error } = useAuth();
  return <Login error={error} />;
};

// Protected page wrapper - handles auth check inline
const ProtectedPage: React.FC<{ 
  children: React.ReactNode;
  requireParent?: boolean;
}> = ({ children, requireParent = false }) => {
  const { user, loading, isParent } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (requireParent && !isParent) {
    return <Navigate to="/tasks" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Main App component - LEGACY v1.0 version
const App: React.FC = () => {
  console.log('[App Legacy] Rendering App component');
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <TasksProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes - single user, no profile selection */}
            <Route path="/tasks" element={
              <ProtectedPage>
                <Tasks />
              </ProtectedPage>
            } />
            <Route path="/calendar" element={
              <ProtectedPage>
                <Calendar />
              </ProtectedPage>
            } />
            <Route path="/chat" element={
              <ProtectedPage>
                <FamilyChat />
              </ProtectedPage>
            } />
            <Route path="/parent-chat" element={
              <ProtectedPage requireParent>
                <ParentChat />
              </ProtectedPage>
            } />
            <Route path="/resources" element={
              <ProtectedPage>
                <Resources />
              </ProtectedPage>
            } />
            <Route path="/history" element={
              <ProtectedPage>
                <History />
              </ProtectedPage>
            } />
            <Route path="/achievements" element={
              <ProtectedPage>
                <Achievements />
              </ProtectedPage>
            } />

            {/* Redirects */}
            <Route index element={<Navigate to="/tasks" replace />} />
            <Route path="*" element={<Navigate to="/tasks" replace />} />
          </Routes>
        </TasksProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
