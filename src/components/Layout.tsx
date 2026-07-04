import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ActiveSectionProvider } from '../context/ActiveSectionContext';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ActiveSectionProvider>
      <div className="layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="layout__main">
          <header className="layout__header">
            <button
              type="button"
              className="layout__menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              ☰
            </button>
          </header>
          <main className="layout__content">
            <Outlet />
          </main>
        </div>
      </div>
    </ActiveSectionProvider>
  );
}
