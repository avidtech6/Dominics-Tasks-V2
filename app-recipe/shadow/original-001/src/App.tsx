import React from 'react';
import AppOrchestrator from './orchestrator/AppOrchestrator';

// Loading spinner
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

// Main App component - simply renders the orchestrator
const App: React.FC = () => {
  return <AppOrchestrator />;
};

export default App;