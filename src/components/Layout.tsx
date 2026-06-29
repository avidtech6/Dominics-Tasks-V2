import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  MessageCircle,
  FolderOpen,
  History,
  Trophy,
  Menu,
  X,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { useBehaviours } from '../orchestrator/AppOrchestrator';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * M10 — Layout.
 * Per recipe.md: app shell (logo, nav links, main content).
 * Per codex.md §C: active link highlight via NavLink isActive.
 * Mobile: hamburger menu (responsive).
 *
 * Visual: fixed left sidebar on desktop, top-bar with hamburger drawer on mobile.
 * Each route gets a vertical row in the sidebar — much cleaner than 8 links
 * crammed in a top bar.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { authBehaviour } = useBehaviours();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/tasks', icon: BookOpen, label: 'Tasks' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/resources', icon: FolderOpen, label: 'Resources' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/achievements', icon: Trophy, label: 'Achievements' },
    { to: '/parent-chat', icon: MessageCircle, label: 'Parent Chat' },
    { to: '/admin', icon: LayoutDashboard, label: 'Admin' },
  ];

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authBehaviour.signOut();
    } catch (err) {
      console.error('[Layout] sign out failed:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const linkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar — only visible on small screens */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
            <span aria-hidden="true">📋</span>
            <span>Dominic's Tasks</span>
          </div>
          <button
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
          >
            <LogOut size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="absolute top-0 left-0 h-full w-64 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <span aria-hidden="true">📋</span>
                <span>Dominic's Tasks</span>
              </div>
              <button
                type="button"
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Primary mobile">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => linkClasses(isActive)}
                >
                  <item.icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop sidebar — hidden on small screens */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex-col z-20">
        <div className="p-5 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
            📋
          </div>
          <div>
            <h1 className="font-semibold text-gray-800 leading-tight">Dominic's Tasks</h1>
            <p className="text-xs text-gray-500">Family Hub</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => linkClasses(isActive)}
              data-nav-link={item.to}
            >
              <item.icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            <LogOut size={18} aria-hidden="true" />
            <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>
      </aside>

      {/* Main content area — offset by sidebar on desktop, full width on mobile */}
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;