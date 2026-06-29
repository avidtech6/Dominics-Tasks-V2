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
 * This component does NOT call any behaviour methods directly.
 * Sign-out + profile selection happen via dedicated page-level surfaces
 * (sign-out is exposed via a small footer button that dispatches
 *  to AuthBehaviour.signOut; profile selection is handled by
 *  ProfileSelectionScreen at /profile-select).
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

  return (
    <div className="layout-root">
      {/* Top Navigation Bar */}
      <header className="layout-topbar">
        <div className="layout-topbar-inner">
          <div className="layout-brand">
            <span aria-hidden="true">📋</span>
            <span>Dominic's Tasks</span>
          </div>

          {/* Desktop nav */}
          <nav className="layout-nav layout-nav-desktop" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `layout-nav-link ${isActive ? 'layout-nav-link-active' : ''}`
                }
                data-nav-link={item.to}
              >
                <item.icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="layout-hamburger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          <button
            className="layout-signout"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>

        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div className="layout-mobile-overlay" role="dialog" aria-modal="true">
            <aside className="layout-mobile-drawer">
              <div className="layout-mobile-header">
                <span className="layout-brand">
                  <span aria-hidden="true">📋</span>
                  <span>Dominic's Tasks</span>
                </span>
                <button
                  className="layout-mobile-close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <nav className="layout-nav layout-nav-mobile" aria-label="Primary mobile">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `layout-nav-link ${isActive ? 'layout-nav-link-active' : ''}`
                    }
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
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
