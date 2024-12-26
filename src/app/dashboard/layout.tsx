'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { IconHome, IconSearch, IconCompare, IconStar } from '@/components/Icons';
import { useState } from 'react';

function SideNavLink({ href, icon, children, collapsed }: { 
  href: string; 
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-2 xs:px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors
        ${isActive 
          ? 'bg-black text-white' 
          : 'text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      {icon}
      {!collapsed && <span className="font-medium hidden xs:inline">{children}</span>}
    </Link>
  );
}

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
          className="w-full p-2 mb-2 text-gray-600 hover:bg-gray-100 rounded-lg block xs:hidden"
        >
          ☰
        </button>

        <SideNavLink href="/dashboard" icon={<IconHome className="w-4 xs:w-5 h-4 xs:h-5" />} collapsed={sidebarCollapsed}>
          Overview
        </SideNavLink>
        <SideNavLink href="/dashboard/browse" icon={<IconSearch className="w-4 xs:w-5 h-4 xs:h-5" />} collapsed={sidebarCollapsed}>
          Browse Properties
        </SideNavLink>
        <SideNavLink href="/dashboard/compare" icon={<IconCompare className="w-4 xs:w-5 h-4 xs:h-5" />} collapsed={sidebarCollapsed}>
          Save & Compare
        </SideNavLink>
        <SideNavLink href="/dashboard/favorites" icon={<IconStar className="w-4 xs:w-5 h-4 xs:h-5" />} collapsed={sidebarCollapsed}>
          Favorites
        </SideNavLink>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-3 xs:p-4 sm:p-5 lg:p-6">
        {children}
      </main>
    </div>
  );
}
