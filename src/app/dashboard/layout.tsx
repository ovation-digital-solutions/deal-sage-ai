'use client';

import { IconHome, IconSearch, IconCompare, IconStar } from '@/components/Icons';
import { useState } from 'react';
import { DesktopSideNavLink } from '@/components/navigation/DesktopSideNavLink';
import { MobileSideNavLink } from '@/components/navigation/MobileSideNavLink';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Side Navigation */}
      <aside className={`
        ${sidebarCollapsed ? 'w-14 xs:w-16' : 'w-14 xs:w-48 sm:w-56 lg:w-64'} 
        transition-all duration-300 border-r border-gray-200 p-2 xs:p-3 sm:p-4 space-y-1 xs:space-y-2
      `}>
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden xs:flex w-8 h-8 mb-2 text-gray-600 hover:bg-gray-100 rounded-lg items-center justify-center"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop Navigation Links */}
        <DesktopSideNavLink href="/dashboard" icon={<IconHome className="w-4 xs:w-5 h-4 xs:h-5" />} collapsed={sidebarCollapsed}>
          Overview
        </DesktopSideNavLink>
        <DesktopSideNavLink href="/dashboard/browse" icon={<IconSearch className="w-4 xs:w-5 h-4 xs:h-5" />} collapsed={sidebarCollapsed}>
          Browse Properties
        </DesktopSideNavLink>
        <DesktopSideNavLink href="/dashboard/compare" icon={<IconCompare className="w-4 xs:w-5 h-4 xs:h-5" />} collapsed={sidebarCollapsed}>
          Save & Compare
        </DesktopSideNavLink>
        <DesktopSideNavLink href="/dashboard/favorites" icon={<IconStar className="w-4 xs:w-5 h-4 xs:h-5" />} collapsed={sidebarCollapsed}>
          Favorites
        </DesktopSideNavLink>

        {/* Mobile Navigation Links */}
        <MobileSideNavLink href="/dashboard" icon={<IconHome className="w-4 xs:w-5 h-4 xs:h-5" />}>
          Overview
        </MobileSideNavLink>
        <MobileSideNavLink href="/dashboard/browse" icon={<IconSearch className="w-4 xs:w-5 h-4 xs:h-5" />}>
          Browse Properties
        </MobileSideNavLink>
        <MobileSideNavLink href="/dashboard/compare" icon={<IconCompare className="w-4 xs:w-5 h-4 xs:h-5" />}>
          Save & Compare
        </MobileSideNavLink>
        <MobileSideNavLink href="/dashboard/favorites" icon={<IconStar className="w-4 xs:w-5 h-4 xs:h-5" />}>
          Favorites
        </MobileSideNavLink>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-3 xs:p-4 sm:p-5 lg:p-6">
        {children}
      </main>
    </div>
  );
}
