import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.legacy';
import './index.css';

// NOTE: This is the LEGACY v1.0 entry point
// Uses App.legacy.tsx for single-user authentication
// Used for deployment to dominicstasks-legacy.pages.dev

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
