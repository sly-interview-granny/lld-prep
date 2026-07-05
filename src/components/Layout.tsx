import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ActiveSectionProvider } from '../context/ActiveSectionContext';
import { ScrollToTop } from './ScrollToTop';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ActiveSectionProvider>
      <ScrollToTop />
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
