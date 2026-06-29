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
 * Per recipe.md: app shell (top nav + outlet for child route).
 * Per codex.md §C1: nav links render on every protected route.
 * Mobile: hamburger menu (responsive).
 *
 * This component does NOT call any behaviour methods directly except
 * AuthBehaviour.signOut, which is the only method recipe implies for the
 * shell. Profile selection is handled by /profile-select screen; parent-mode
 * toggle is not in recipe scope.
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
    `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
            <span aria-hidden="true">📋</span>
            <span>Dominic's Tasks</span>
          </div>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => linkClasses(isActive)}
                data-nav-link={item.to}
              >
                <item.icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right side: mobile hamburger + sign out */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
              onClick={handleSignOut}
              disabled={signingOut}
              aria-label="Sign out"
            >
              <LogOut size={16} aria-hidden="true" />
              <span className="hidden sm:inline">
                {signingOut ? 'Signing out…' : 'Sign out'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            role="dialog"
            aria-modal="true"
            onClick={() => setMobileMenuOpen(false)}
          >
            <aside
              className="absolute top-0 right-0 h-full w-64 bg-white shadow-xl p-4 flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-800">Menu</span>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <nav className="flex flex-col gap-1" aria-label="Primary mobile">
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
      </header>

      {/* Main content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;